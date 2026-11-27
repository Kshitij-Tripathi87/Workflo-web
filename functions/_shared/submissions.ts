import { HttpInputError } from "./http";
import type { D1Database, Env } from "./types";

export type SubmissionKind = "contact" | "early_access";

export type PersistResult = {
  reference: string;
  duplicate: boolean;
};

type IdempotencyRow = {
  submission_id: string;
  request_hash: string;
  expires_at: number;
};

function assertDbBinding(db: D1Database | undefined): asserts db is D1Database {
  if (!db || typeof db.prepare !== "function" || typeof db.batch !== "function") {
    throw new Error("persistence_binding_missing");
  }
}

export async function persistSubmission(
  db: D1Database | undefined,
  id: string,
  kind: SubmissionKind,
  payload: Record<string, unknown>,
  createdAt: string,
  expiresAt: number,
  options?: { idempotencyKey?: string; requestHash?: string },
): Promise<PersistResult> {
  assertDbBinding(db);

  const idempotencyKey = options?.idempotencyKey;
  const requestHash = options?.requestHash;

  if (idempotencyKey && requestHash) {
    const existing = await db
      .prepare(
        `SELECT submission_id, request_hash, expires_at
         FROM api_idempotency
         WHERE idempotency_key = ? AND kind = ?
         LIMIT 1`,
      )
      .bind(idempotencyKey, kind)
      .first<IdempotencyRow>();

    if (existing) {
      const nowEpoch = Math.floor(Date.now() / 1000);
      if (existing.expires_at > nowEpoch) {
        if (existing.request_hash !== requestHash) {
          throw new HttpInputError(409, "idempotency_key_conflict");
        }
        return { reference: existing.submission_id, duplicate: true };
      }

      // Expired idempotency record can be replaced cleanly.
      await db
        .prepare("DELETE FROM api_idempotency WHERE idempotency_key = ? AND kind = ?")
        .bind(idempotencyKey, kind)
        .run();
    }
  }

  const insertSubmission = db
    .prepare(
      `INSERT INTO submissions
        (id, kind, created_at, expires_at, status, payload_json, notification_status)
       VALUES (?, ?, ?, ?, 'received', ?, 'pending')`,
    )
    .bind(id, kind, createdAt, expiresAt, JSON.stringify(payload));

  const insertOutbox = db
    .prepare(
      `INSERT INTO notification_outbox
        (id, submission_id, status, created_at, attempt_count)
       VALUES (?, ?, 'pending', ?, 0)`,
    )
    .bind(crypto.randomUUID(), id, createdAt);

  const insertEvent = db
    .prepare(
      `INSERT INTO submission_events
        (id, submission_id, event_type, detail_json, created_at)
       VALUES (?, ?, 'submission_received', ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      id,
      JSON.stringify({ kind, outboxStatus: "pending" }),
      createdAt,
    );

  const statements = [insertSubmission, insertOutbox, insertEvent];

  if (idempotencyKey && requestHash) {
    const idempotencyExpiry = Math.min(expiresAt, Math.floor(Date.now() / 1000) + 24 * 60 * 60);
    statements.push(
      db
        .prepare(
          `INSERT INTO api_idempotency
            (idempotency_key, kind, submission_id, request_hash, created_at, expires_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(idempotencyKey, kind, id, requestHash, createdAt, idempotencyExpiry),
    );
  }

  try {
    const results = await db.batch(statements);
    if (results.length !== statements.length || results.some((result) => !result.success)) {
      throw new Error("submission_persistence_failed");
    }

    return { reference: id, duplicate: false };
  } catch (error) {
    // Concurrency race handling: if two concurrent identical requests raced past the
    // initial idempotency check, the unique constraint on (idempotency_key, kind) will fail
    // for the losing request. Re-read the committed idempotency record rather than returning 503.
    if (idempotencyKey && requestHash) {
      const concurrent = await db
        .prepare(
          `SELECT submission_id, request_hash, expires_at
           FROM api_idempotency
           WHERE idempotency_key = ? AND kind = ?
           LIMIT 1`,
        )
        .bind(idempotencyKey, kind)
        .first<IdempotencyRow>();

      if (concurrent) {
        if (concurrent.request_hash !== requestHash) {
          throw new HttpInputError(409, "idempotency_key_conflict");
        }
        return { reference: concurrent.submission_id, duplicate: true };
      }
    }

    throw error;
  }
}

export async function cleanupExpiredSubmissions(
  db: D1Database | undefined,
  nowEpoch = Math.floor(Date.now() / 1000),
): Promise<{ deletedSubmissions: number }> {
  assertDbBinding(db);

  const runId = crypto.randomUUID();
  const ranAt = new Date(nowEpoch * 1000).toISOString();

  try {
    await db
      .prepare("DELETE FROM rate_limit_buckets WHERE expires_at <= ?")
      .bind(nowEpoch)
      .run();

    await db
      .prepare("DELETE FROM api_idempotency WHERE expires_at <= ?")
      .bind(nowEpoch)
      .run();

    const deleted = await db
      .prepare("DELETE FROM submissions WHERE expires_at <= ?")
      .bind(nowEpoch)
      .run();

    const deletedSubmissions = Number(deleted.meta?.changes ?? 0);

    await db
      .prepare(
        `INSERT INTO retention_runs (id, ran_at, deleted_submissions, status, notes)
         VALUES (?, ?, ?, 'ok', ?)`,
      )
      .bind(runId, ranAt, deletedSubmissions, `Purged submissions with expires_at <= ${nowEpoch}`)
      .run();

    return { deletedSubmissions };
  } catch (error) {
    await db
      .prepare(
        `INSERT INTO retention_runs (id, ran_at, deleted_submissions, status, notes)
         VALUES (?, ?, 0, 'error', ?)`,
      )
      .bind(runId, ranAt, error instanceof Error ? error.name : "retention_error")
      .run();
    throw error;
  }
}

export function submissionExpiryEpoch(env: Env): number {
  const configuredDays = Number(env.SUBMISSION_RETENTION_DAYS ?? "365");
  const retentionDays = Number.isFinite(configuredDays)
    ? Math.min(3650, Math.max(30, configuredDays))
    : 365;
  return Math.floor(Date.now() / 1000) + retentionDays * 24 * 60 * 60;
}
