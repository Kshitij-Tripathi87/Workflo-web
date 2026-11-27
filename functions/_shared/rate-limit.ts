import { HttpInputError, sha256Hex } from "./http";
import type { D1Database, Env } from "./types";

const WINDOW_SECONDS = 60;
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 10;

type BucketRow = {
  window_start: number;
  request_count: number;
};

function resolveClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

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
  const windowStart = Math.floor(nowSeconds / WINDOW_SECONDS) * WINDOW_SECONDS;
  const expiresAt = windowStart + WINDOW_SECONDS * 2;
  const retryAfterSeconds = Math.max(1, windowStart + WINDOW_SECONDS - nowSeconds);

  const clientIp = resolveClientIp(request);
  const bucketKey = await sha256Hex(`${routeKey}:${clientIp}`);

  const row = await db
    .prepare(
      `INSERT INTO rate_limit_buckets (bucket_key, window_start, request_count, expires_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT (bucket_key) DO UPDATE SET
         request_count = CASE
           WHEN rate_limit_buckets.window_start = excluded.window_start
             THEN rate_limit_buckets.request_count + 1
           ELSE 1
         END,
         window_start = excluded.window_start,
         expires_at = excluded.expires_at
       RETURNING window_start, request_count`,
    )
    .bind(bucketKey, windowStart, expiresAt)
    .first<BucketRow>();

  const count = Number(row?.request_count ?? 1);
  if (count > maxRequests) {
    throw new HttpInputError(429, "rate_limit_exceeded");
  }

  return {
    retryAfterSeconds,
    remaining: Math.max(0, maxRequests - count),
  };
}
