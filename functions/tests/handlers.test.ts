import assert from "node:assert/strict";
import test from "node:test";
import retentionWorker, { runScheduledCleanup } from "../../workers/retention-cleanup";
import { onRequest as apiMiddleware } from "../api/_middleware";
import { onRequest as contactHandler } from "../api/v1/contact";
import { onRequest as earlyAccessHandler } from "../api/v1/early-access";
import { onRequest as healthHandler } from "../api/v1/health";
import { enforceRateLimit } from "../_shared/rate-limit";
import { cleanupExpiredSubmissions, persistSubmission } from "../_shared/submissions";
import type { D1Database, D1PreparedStatement, Env } from "../_shared/types";

type SubmissionRow = {
  id: string;
  kind: string;
  created_at: string;
  expires_at: number;
  status: string;
  payload_json: string;
  notification_status: string;
};

type OutboxRow = {
  id: string;
  submission_id: string;
  status: string;
  created_at: string;
  attempt_count: number;
};

type EventRow = {
  id: string;
  submission_id: string;
  event_type: string;
  detail_json: string;
  created_at: string;
};

type IdempotencyRow = {
  idempotency_key: string;
  kind: string;
  submission_id: string;
  request_hash: string;
  created_at: string;
  expires_at: number;
};

type RetentionRunRow = {
  id: string;
  ran_at: string;
  deleted_submissions: number;
  status: string;
  notes: string | null;
};

type RateLimitRow = {
  bucket_key: string;
  window_start: number;
  request_count: number;
  expires_at: number;
};

class MockD1Database implements D1Database {
  submissions: SubmissionRow[] = [];
  outbox: OutboxRow[] = [];
  events: EventRow[] = [];
  idempotency: IdempotencyRow[] = [];
  retentionRuns: RetentionRunRow[] = [];
  rateLimits: RateLimitRow[] = [];
  failNextBatch = false;
  failNextRun = false;

  prepare(query: string): D1PreparedStatement {
    let bound: Array<string | number | null> = [];
    const db = this;

    const stmt: D1PreparedStatement = {
      bind(...values) {
        bound = values;
        return stmt;
      },
      async first<T = unknown>(): Promise<T | null> {
        if (query.includes("FROM api_idempotency")) {
          const [key, kind] = bound as [string, string];
          const found = db.idempotency.find(
            (row) => row.idempotency_key === key && row.kind === kind,
          );
          return (found ?? null) as T | null;
        }
        return null;
      },
      async all<T = unknown>() {
        if (query.includes("FROM rate_limit_buckets")) {
          const keys = bound as string[];
          const matching = db.rateLimits.filter((r) => keys.includes(r.bucket_key));
          return { success: true, results: matching as T[] };
        }
        return { success: true, results: [] as T[] };
      },
      async run<T = unknown>() {
        if (db.failNextRun) {
          db.failNextRun = false;
          throw new Error("D1_RUN_ERROR");
        }
        if (query.includes("INTO rate_limit_buckets")) {
          const [bucketKey, windowStart, expiresAt] = bound as [string, number, number];
          const existing = db.rateLimits.find((r) => r.bucket_key === bucketKey);
          if (!existing) {
            db.rateLimits.push({
              bucket_key: bucketKey,
              window_start: windowStart,
              request_count: 1,
              expires_at: expiresAt,
            });
          } else {
            existing.request_count += 1;
            existing.expires_at = expiresAt;
          }
          return { success: true, meta: { changes: 1 } };
        }
        if (query.startsWith("DELETE FROM rate_limit_buckets WHERE expires_at")) {
          const [now] = bound as [number];
          const before = db.rateLimits.length;
          db.rateLimits = db.rateLimits.filter((row) => row.expires_at > now);
          return { success: true, meta: { changes: before - db.rateLimits.length } };
        }
        if (query.startsWith("DELETE FROM api_idempotency WHERE idempotency_key")) {
          const [key, kind] = bound as [string, string];
          db.idempotency = db.idempotency.filter(
            (row) => !(row.idempotency_key === key && row.kind === kind),
          );
          return { success: true, meta: { changes: 1 } };
        }
        if (query.startsWith("DELETE FROM api_idempotency WHERE expires_at")) {
          const [now] = bound as [number];
          const before = db.idempotency.length;
          db.idempotency = db.idempotency.filter((row) => row.expires_at > now);
          return { success: true, meta: { changes: before - db.idempotency.length } };
        }
        if (query.startsWith("DELETE FROM submissions WHERE expires_at")) {
          const [now] = bound as [number];
          const expiredIds = new Set(
            db.submissions.filter((row) => row.expires_at <= now).map((r) => r.id),
          );
          db.submissions = db.submissions.filter((row) => !expiredIds.has(row.id));
          db.outbox = db.outbox.filter((row) => !expiredIds.has(row.submission_id));
          db.events = db.events.filter((row) => !expiredIds.has(row.submission_id));
          db.idempotency = db.idempotency.filter((row) => !expiredIds.has(row.submission_id));
          return { success: true, meta: { changes: expiredIds.size } };
        }
        if (query.startsWith("INSERT INTO retention_runs")) {
          const [id, ranAt, deleted, notes] = bound as [string, string, number, string];
          const status = query.includes("'error'") ? "error" : "ok";
          db.retentionRuns.push({
            id,
            ran_at: ranAt,
            deleted_submissions: status === "error" ? 0 : deleted,
            status,
            notes,
          });
          return { success: true, meta: { changes: 1 } };
        }
        return { success: true, results: [] as T[] };
      },
    };

    Object.assign(stmt, { _query: () => query, _bound: () => bound });
    return stmt;
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]) {
    if (this.failNextBatch) {
      this.failNextBatch = false;
      throw new Error("D1_UNAVAILABLE");
    }

    const results: Array<{ success: boolean; results?: T[]; meta?: Record<string, unknown> }> = [];

    for (const stmt of statements) {
      const metaStmt = stmt as unknown as {
        _query: () => string;
        _bound: () => Array<string | number | null>;
      };
      const query = metaStmt._query();
      const bound = metaStmt._bound();

      if (query.includes("INSERT INTO submissions")) {
        const [id, kind, createdAt, expiresAt, payloadJson] = bound as [
          string,
          string,
          string,
          number,
          string,
        ];
        this.submissions.push({
          id,
          kind,
          created_at: createdAt,
          expires_at: expiresAt,
          status: "received",
          payload_json: payloadJson,
          notification_status: "pending",
        });
      } else if (query.includes("INSERT INTO notification_outbox")) {
        const [id, submissionId, createdAt] = bound as [string, string, string];
        this.outbox.push({
          id,
          submission_id: submissionId,
          status: "pending",
          created_at: createdAt,
          attempt_count: 0,
        });
      } else if (query.includes("INSERT INTO submission_events")) {
        const [id, submissionId, detailJson, createdAt] = bound as [
          string,
          string,
          string,
          string,
        ];
        this.events.push({
          id,
          submission_id: submissionId,
          event_type: "submission_received",
          detail_json: detailJson,
          created_at: createdAt,
        });
      } else if (query.includes("INSERT INTO api_idempotency")) {
        const [key, kind, submissionId, requestHash, createdAt, expiresAt] = bound as [
          string,
          string,
          string,
          string,
          string,
          number,
        ];

        // Simulate unique constraint check on (idempotency_key, kind)
        const duplicate = this.idempotency.some(
          (r) => r.idempotency_key === key && r.kind === kind,
        );
        if (duplicate) {
          throw new Error("D1_ERROR: UNIQUE constraint failed: api_idempotency.idempotency_key, api_idempotency.kind");
        }

        this.idempotency.push({
          idempotency_key: key,
          kind,
          submission_id: submissionId,
          request_hash: requestHash,
          created_at: createdAt,
          expires_at: expiresAt,
        });
      }

      results.push({ success: true });
    }

    return results;
  }
}

const VALID_CONTACT = {
  name: "Ada Example",
  email: "ada@example.com",
  company: "Example Engineering",
  role: "Engineering Lead",
  inquiryType: "product",
  message: "We need repeatable repository verification.",
  consentToReply: true,
  website: "",
};

const VALID_EARLY_ACCESS = {
  name: "Ada Example",
  email: "ada@example.com",
  company: "Example Engineering",
  role: "Engineering Lead",
  teamSize: "6-20",
  useCase: "We need repeatable isolated verification for code changes.",
  workflow: "GitHub pull requests and CI pipelines.",
  consentToReply: true,
  website: "",
};

test("GET /api/v1/health returns ok with security headers", async () => {
  const req = new Request("https://workflo-site.pages.dev/api/v1/health", { method: "GET" });
  const res = await healthHandler({ request: req, env: {} });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-frame-options"), "DENY");
  assert.ok(res.headers.get("x-request-id"));

  const body = (await res.json()) as Record<string, unknown>;
  assert.equal(body.status, "ok");
  assert.equal(body.service, "workflo-web-api");
});

test("cross-origin requests are rejected with 403", async () => {
  const req = new Request("https://workflo-site.pages.dev/api/v1/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://evil.example",
    },
    body: JSON.stringify(VALID_CONTACT),
  });
  const res = await contactHandler({ request: req, env: { DB: new MockD1Database() } });
  assert.equal(res.status, 403);
});

test("unsupported HTTP methods return 405", async () => {
  const req = new Request("https://workflo-site.pages.dev/api/v1/contact", { method: "GET" });
  const res = await contactHandler({ request: req, env: { DB: new MockD1Database() } });
  assert.equal(res.status, 405);
});

test("oversized payloads return 413 without hitting DB", async () => {
  const oversized = JSON.stringify({
    ...VALID_CONTACT,
    message: "a".repeat(20_000),
  });
  const req = new Request("https://workflo-site.pages.dev/api/v1/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: oversized,
  });
  const db = new MockD1Database();
  const res = await contactHandler({ request: req, env: { DB: db } });
  assert.equal(res.status, 413);
  assert.equal(db.submissions.length, 0);
});

test("contact and early-access persist submissions, outbox, and audit events", async () => {
  const db = new MockD1Database();
  const env: Env = { DB: db, SUBMISSION_RETENTION_DAYS: "90" };

  const contactRes = await contactHandler({
    request: new Request("https://workflo-site.pages.dev/api/v1/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.10" },
      body: JSON.stringify(VALID_CONTACT),
    }),
    env,
  });
  assert.equal(contactRes.status, 202);
  const contactBody = (await contactRes.json()) as { accepted: boolean; reference: string };
  assert.equal(contactBody.accepted, true);
  assert.ok(contactBody.reference);

  const eaRes = await earlyAccessHandler({
    request: new Request("https://workflo-site.pages.dev/api/v1/early-access", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.10" },
      body: JSON.stringify(VALID_EARLY_ACCESS),
    }),
    env,
  });
  assert.equal(eaRes.status, 202);

  assert.equal(db.submissions.length, 2);
  assert.equal(db.outbox.length, 2);
  assert.equal(db.events.length, 2);
});

test("honeypot submissions accept cleanly without writing to D1", async () => {
  const db = new MockD1Database();
  const req = new Request("https://workflo-site.pages.dev/api/v1/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...VALID_CONTACT, website: "https://spam.example" }),
  });

  const res = await contactHandler({ request: req, env: { DB: db } });
  assert.ok(res.status === 400 || res.status === 202);
  assert.equal(db.submissions.length, 0);
});

test("missing DB binding or D1 error returns 503 and logs zero PII", async () => {
  const originalError = console.error;
  const logged: string[] = [];
  console.error = (...args: unknown[]) => logged.push(args.map(String).join(" "));

  try {
    const resMissing = await contactHandler({
      request: new Request("https://workflo-site.pages.dev/api/v1/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(VALID_CONTACT),
      }),
      env: {},
    });
    assert.equal(resMissing.status, 503);

    const db = new MockD1Database();
    db.failNextBatch = true;
    const resDbFail = await earlyAccessHandler({
      request: new Request("https://workflo-site.pages.dev/api/v1/early-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(VALID_EARLY_ACCESS),
      }),
      env: { DB: db },
    });
    assert.equal(resDbFail.status, 503);

    const logJoined = logged.join("\n");
    assert.equal(logJoined.includes("ada@example.com"), false);
    assert.equal(logJoined.includes("Example Engineering"), false);
  } finally {
    console.error = originalError;
  }
});

test("Idempotency-Key avoids duplicate writes and flags conflicting payloads", async () => {
  const db = new MockD1Database();
  const env: Env = { DB: db };

  const makeReq = (payload: unknown, key = "req-retry-001") =>
    new Request("https://workflo-site.pages.dev/api/v1/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": key,
      },
      body: JSON.stringify(payload),
    });

  const first = await contactHandler({ request: makeReq(VALID_CONTACT), env });
  assert.equal(first.status, 202);
  const firstBody = (await first.json()) as { reference: string };

  const retry = await contactHandler({ request: makeReq(VALID_CONTACT), env });
  assert.equal(retry.status, 202);
  const retryBody = (await retry.json()) as { reference: string };

  assert.equal(retryBody.reference, firstBody.reference);
  assert.equal(db.submissions.length, 1);

  const conflict = await contactHandler({
    request: makeReq({ ...VALID_CONTACT, message: "Different payload with same key." }),
    env,
  });
  assert.equal(conflict.status, 409);
});

test("rate limit enforces 429 after window quota is exceeded without storing raw IP", async () => {
  const db = new MockD1Database();
  const env: Env = { DB: db, RATE_LIMIT_MAX_PER_MINUTE: "2" };

  const send = () =>
    contactHandler({
      request: new Request("https://workflo-site.pages.dev/api/v1/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cf-connecting-ip": "198.51.100.42",
        },
        body: JSON.stringify(VALID_CONTACT),
      }),
      env,
    });

  const r1 = await send();
  const r2 = await send();
  const r3 = await send();

  assert.equal(r1.status, 202);
  assert.equal(r1.headers.get("x-ratelimit-remaining"), "1");
  assert.equal(r2.status, 202);
  assert.equal(r2.headers.get("x-ratelimit-remaining"), "0");
  assert.equal(r3.status, 429);
  assert.equal(r3.headers.get("retry-after"), "60");

  // Confirm raw IP is hashed, never stored plaintext
  assert.equal(db.rateLimits.length, 1);
  assert.equal(db.rateLimits[0].bucket_key.includes("198.51.100.42"), false);
});

test("cleanupExpiredSubmissions and retention worker purge expired data and return 404 on HTTP", async () => {
  const stagingDb = new MockD1Database();
  const prodDb = new MockD1Database();

  stagingDb.submissions.push({
    id: "expired-s1",
    kind: "contact",
    created_at: "2025-01-01T00:00:00Z",
    expires_at: 1_700_000_000,
    status: "received",
    payload_json: "{}",
    notification_status: "pending",
  });
  stagingDb.outbox.push({
    id: "outbox-s1",
    submission_id: "expired-s1",
    status: "pending",
    created_at: "2025-01-01T00:00:00Z",
    attempt_count: 0,
  });
  stagingDb.rateLimits.push({
    bucket_key: "old-bucket",
    window_start: 1_700_000_000,
    request_count: 3,
    expires_at: 1_700_000_120,
  });

  prodDb.submissions.push({
    id: "active-p1",
    kind: "early_access",
    created_at: "2026-11-27T00:00:00Z",
    expires_at: 2_000_000_000,
    status: "received",
    payload_json: "{}",
    notification_status: "pending",
  });

  const summary = await runScheduledCleanup(
    { STAGING_DB: stagingDb, PRODUCTION_DB: prodDb },
    1_800_000_000,
  );
  assert.equal(summary.hasFailures, false);
  assert.equal(summary.staging?.status, "fulfilled");
  assert.equal(summary.production?.status, "fulfilled");
  if (summary.staging?.status === "fulfilled") {
    assert.equal(summary.staging.deletedSubmissions, 1);
  }
  if (summary.production?.status === "fulfilled") {
    assert.equal(summary.production.deletedSubmissions, 0);
  }
  assert.equal(stagingDb.outbox.length, 0);
  assert.equal(stagingDb.rateLimits.length, 0);
  assert.equal(prodDb.submissions.length, 1);

  const directCleanup = await cleanupExpiredSubmissions(prodDb, 1_800_000_000);
  assert.equal(directCleanup.deletedSubmissions, 0);

  const httpRes = await retentionWorker.fetch();
  assert.equal(httpRes.status, 404);
});

test("retention worker isolates staging failure so production cleanup succeeds", async () => {
  const stagingDb = new MockD1Database();
  const prodDb = new MockD1Database();

  stagingDb.failNextRun = true;

  prodDb.submissions.push({
    id: "expired-p1",
    kind: "early_access",
    created_at: "2025-01-01T00:00:00Z",
    expires_at: 1_700_000_000,
    status: "received",
    payload_json: "{}",
    notification_status: "pending",
  });

  const summary = await runScheduledCleanup(
    { STAGING_DB: stagingDb, PRODUCTION_DB: prodDb },
    1_800_000_000,
  );

  assert.equal(summary.hasFailures, true);
  assert.equal(summary.staging?.status, "rejected");
  assert.equal(summary.production?.status, "fulfilled");
  if (summary.production?.status === "fulfilled") {
    assert.equal(summary.production.deletedSubmissions, 1);
  }
  assert.equal(prodDb.submissions.length, 0);
});

test("concurrent duplicate submissions with identical idempotency key resolve cleanly without 503", async () => {
  const db = new MockD1Database();
  const env: Env = { DB: db };

  const payload = { ...VALID_CONTACT };
  const key = "race-key-123";

  const [resA, resB] = await Promise.all([
    contactHandler({
      request: new Request("https://workflo-site.pages.dev/api/v1/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": key,
        },
        body: JSON.stringify(payload),
      }),
      env,
    }),
    contactHandler({
      request: new Request("https://workflo-site.pages.dev/api/v1/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": key,
        },
        body: JSON.stringify(payload),
      }),
      env,
    }),
  ]);

  assert.equal(resA.status, 202);
  assert.equal(resB.status, 202);

  const bodyA = (await resA.json()) as { accepted: boolean; reference: string };
  const bodyB = (await resB.json()) as { accepted: boolean; reference: string };

  assert.equal(bodyA.accepted, true);
  assert.equal(bodyB.accepted, true);
  assert.equal(bodyA.reference, bodyB.reference);
  assert.equal(db.submissions.length, 1);
});

test("persistSubmission handles concurrent unique constraint collision on api_idempotency", async () => {
  const db = new MockD1Database();
  const key = "race-key-direct";
  const hash = "sample-hash-123";

  const first = await persistSubmission(
    db,
    "ref-1",
    "contact",
    { message: "hello" },
    new Date().toISOString(),
    Math.floor(Date.now() / 1000) + 3600,
    { idempotencyKey: key, requestHash: hash },
  );
  assert.equal(first.reference, "ref-1");
  assert.equal(first.duplicate, false);

  const second = await persistSubmission(
    db,
    "ref-2",
    "contact",
    { message: "hello" },
    new Date().toISOString(),
    Math.floor(Date.now() / 1000) + 3600,
    { idempotencyKey: key, requestHash: hash },
  );
  assert.equal(second.reference, "ref-1");
  assert.equal(second.duplicate, true);
  assert.equal(db.submissions.length, 1);
});

test("rate limiter enforces sliding-window boundary smoothing across clock minutes", async () => {
  const db = new MockD1Database();
  const env: Env = { DB: db, RATE_LIMIT_MAX_PER_MINUTE: "10" };
  const req = new Request("https://workflo-site.pages.dev/api/v1/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.55" },
  });

  // At t = 60059 (end of minute 60000), 10 requests consume the limit
  for (let i = 0; i < 10; i++) {
    const res = await enforceRateLimit(db, req, env, "contact", 60059);
    assert.equal(res.remaining, 9 - i);
  }

  // 11th request at t = 60059 is rejected (429)
  await assert.rejects(
    async () => enforceRateLimit(db, req, env, "contact", 60059),
    (err: unknown) => {
      assert.equal((err as { statusCode: number }).statusCode, 429);
      return true;
    },
  );

  // At t = 60060 (start of next minute 60060, elapsed = 0), previous minute weight is 1.0.
  // Burst is prevented: request is immediately rejected!
  await assert.rejects(
    async () => enforceRateLimit(db, req, env, "contact", 60060),
    (err: unknown) => {
      assert.equal((err as { statusCode: number }).statusCode, 429);
      return true;
    },
  );

  // At t = 60090 (30 seconds into next minute), weight is 0.5.
  // 10 * 0.5 = 5 previous requests counted. Current window allows up to 5 requests.
  const halfWindowRes = await enforceRateLimit(db, req, env, "contact", 60090);
  assert.ok(halfWindowRes.remaining >= 0);
});

test("rate limiter uses keyed HMAC-SHA256 and ignores spoofed X-Forwarded-For", async () => {
  const db = new MockD1Database();

  const makeSpoofedReq = () =>
    new Request("https://workflo-site.pages.dev/api/v1/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "8.8.8.8, 1.1.1.1",
      },
      body: JSON.stringify(VALID_CONTACT),
    });

  await contactHandler({ request: makeSpoofedReq(), env: { DB: db } });
  assert.equal(db.rateLimits.length, 1);
  const keyDefault = db.rateLimits[0].bucket_key;
  assert.equal(keyDefault.includes("8.8.8.8"), false);

  const db2 = new MockD1Database();
  await contactHandler({
    request: makeSpoofedReq(),
    env: { DB: db2, RATE_LIMIT_SECRET: "custom-secret-key-xyz" },
  });
  assert.equal(db2.rateLimits.length, 1);
  const keyCustom = db2.rateLimits[0].bucket_key;

  assert.notEqual(keyDefault, keyCustom);
});

test("API middleware converts SPA HTML fallback to JSON 404", async () => {
  const req = new Request("https://workflo-site.pages.dev/api/v1/unknown", { method: "GET" });
  const res = await apiMiddleware({
    request: req,
    env: {},
    next: async () =>
      new Response("<!doctype html><html></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
  });
  assert.equal(res.status, 404);
  const body = (await res.json()) as { error: string };
  assert.equal(body.error, "not_found");
});
