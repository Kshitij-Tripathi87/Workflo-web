import { hmacSha256Hex, HttpInputError } from "./http";
import type { D1Database, Env } from "./types";

const WINDOW_SECONDS = 60;
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 10;

type RateLimitAtomicRow = {
  request_count: number;
  prev_count: number;
};

function resolveClientIp(request: Request): string {
  // Trust exclusively Cloudflare edge connecting IP.
  // Do not trust client-supplied forwarded headers (X-Forwarded-For).
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  return "unknown";
}

function resolveLimit(env: Env): number {
  const configured = Number(env.RATE_LIMIT_MAX_PER_MINUTE ?? DEFAULT_MAX_REQUESTS_PER_WINDOW);
  if (!Number.isFinite(configured)) return DEFAULT_MAX_REQUESTS_PER_WINDOW;
  return Math.min(120, Math.max(1, Math.floor(configured)));
}

export async function enforceRateLimit(
  db: D1Database | undefined,
  request: Request,
  env: Env,
  routeKey: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<{ retryAfterSeconds: number; remaining: number }> {
  if (!db || typeof db.prepare !== "function") {
    throw new Error("persistence_binding_missing");
  }

  // RATE_LIMIT_SECRET is mandatory: no public or hardcoded fallback salt is permitted.
  const secret = env.RATE_LIMIT_SECRET?.trim();
  if (!secret) {
    throw new Error("rate_limit_secret_missing");
  }

  const maxRequests = resolveLimit(env);
  const currentWindowStart = Math.floor(nowSeconds / WINDOW_SECONDS) * WINDOW_SECONDS;
  const prevWindowStart = currentWindowStart - WINDOW_SECONDS;
  const expiresAt = currentWindowStart + WINDOW_SECONDS * 2;

  const clientIp = resolveClientIp(request);
  const ipHash = await hmacSha256Hex(secret, `${routeKey}:${clientIp}`);

  const currentBucketKey = `${ipHash}:${currentWindowStart}`;
  const prevBucketKey = `${ipHash}:${prevWindowStart}`;

  const elapsed = nowSeconds - currentWindowStart;
  const prevWeight = Math.max(0, (WINDOW_SECONDS - elapsed) / WINDOW_SECONDS);
  const retryAfterSeconds = Math.max(1, Math.min(WINDOW_SECONDS, WINDOW_SECONDS - elapsed));

  // Atomic admission check and counter increment in a single SQL operation.
  // The conditional INSERT ... SELECT ... WHERE and ON CONFLICT ... WHERE ensure that
  // the counter is only inserted/incremented if (current_count + floor(prev_count * prevWeight)) < maxRequests.
  // If the limit has been reached, 0 rows are inserted/updated, returning null.
  // This eliminates concurrent race conditions where requests read an old count simultaneously.
  const row = await db
    .prepare(
      `INSERT INTO rate_limit_buckets (bucket_key, window_start, request_count, expires_at)
       SELECT ?1, ?2, 1, ?3
       WHERE (
         CAST(COALESCE((SELECT request_count FROM rate_limit_buckets WHERE bucket_key = ?4), 0) * ?5 AS INT)
       ) < ?6
       ON CONFLICT (bucket_key) DO UPDATE SET
         request_count = rate_limit_buckets.request_count + 1,
         expires_at = excluded.expires_at
       WHERE (
         rate_limit_buckets.request_count +
         CAST(COALESCE((SELECT request_count FROM rate_limit_buckets WHERE bucket_key = ?4), 0) * ?5 AS INT)
       ) < ?6
       RETURNING request_count, COALESCE((SELECT request_count FROM rate_limit_buckets WHERE bucket_key = ?4), 0) AS prev_count`,
    )
    .bind(
      currentBucketKey,
      currentWindowStart,
      expiresAt,
      prevBucketKey,
      prevWeight,
      maxRequests,
    )
    .first<RateLimitAtomicRow>();

  if (!row) {
    throw new HttpInputError(429, "rate_limit_exceeded");
  }

  const currentCount = Number(row.request_count);
  const prevCount = Number(row.prev_count ?? 0);
  const totalEstimated = currentCount + Math.floor(prevCount * prevWeight);

  return {
    retryAfterSeconds,
    remaining: Math.max(0, maxRequests - totalEstimated),
  };
}
