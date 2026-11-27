import { hmacSha256Hex, HttpInputError } from "./http";
import type { D1Database, Env } from "./types";

const WINDOW_SECONDS = 60;
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 10;
const DEFAULT_RATE_LIMIT_SALT = "workflo-rate-limit-v1-fallback-salt";

type BucketRow = {
  bucket_key: string;
  window_start: number;
  request_count: number;
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

  const maxRequests = resolveLimit(env);
  const currentWindowStart = Math.floor(nowSeconds / WINDOW_SECONDS) * WINDOW_SECONDS;
  const prevWindowStart = currentWindowStart - WINDOW_SECONDS;
  const expiresAt = currentWindowStart + WINDOW_SECONDS * 2;

  const clientIp = resolveClientIp(request);
  const secret = env.RATE_LIMIT_SECRET?.trim() || DEFAULT_RATE_LIMIT_SALT;
  const ipHash = await hmacSha256Hex(secret, `${routeKey}:${clientIp}`);

  const currentBucketKey = `${ipHash}:${currentWindowStart}`;
  const prevBucketKey = `${ipHash}:${prevWindowStart}`;

  // Fetch current and previous window buckets in a single query
  const rowsRes = await db
    .prepare(
      `SELECT bucket_key, window_start, request_count
       FROM rate_limit_buckets
       WHERE bucket_key IN (?, ?)`,
    )
    .bind(currentBucketKey, prevBucketKey)
    .all<BucketRow>();

  const rows = rowsRes.results ?? [];
  const prevRow = rows.find((r) => r.bucket_key === prevBucketKey);
  const currentRow = rows.find((r) => r.bucket_key === currentBucketKey);

  const prevCount = Number(prevRow?.request_count ?? 0);
  const currentCount = Number(currentRow?.request_count ?? 0);

  // Sliding window estimation:
  // Weight of previous window decreases as time advances in current window
  const elapsed = nowSeconds - currentWindowStart;
  const prevWeight = Math.max(0, (WINDOW_SECONDS - elapsed) / WINDOW_SECONDS);
  const estimatedCount = currentCount + Math.floor(prevCount * prevWeight);

  const retryAfterSeconds = Math.max(1, Math.min(WINDOW_SECONDS, WINDOW_SECONDS - elapsed));

  if (estimatedCount >= maxRequests) {
    throw new HttpInputError(429, "rate_limit_exceeded");
  }

  // Increment current window bucket
  await db
    .prepare(
      `INSERT INTO rate_limit_buckets (bucket_key, window_start, request_count, expires_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT (bucket_key) DO UPDATE SET
         request_count = rate_limit_buckets.request_count + 1,
         expires_at = excluded.expires_at`,
    )
    .bind(currentBucketKey, currentWindowStart, expiresAt)
    .run();

  const newEstimated = currentCount + 1 + Math.floor(prevCount * prevWeight);

  return {
    retryAfterSeconds,
    remaining: Math.max(0, maxRequests - newEstimated),
  };
}
