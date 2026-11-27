# Workflo website operations runbook

## Cloudflare Staging & Production Architecture

- **Staging (`preview`):** Pages branch preview on `feat/cloudflare-pages-backend` bound to D1 `workflo-web-staging`.
- **Production (`production`):** Pages branch `main` bound to isolated D1 `workflo-web-production`.
- **Scheduled Retention:** Cloudflare Worker `workflo-web-retention-cleanup` runs daily at `0 3 * * *` (UTC) against `STAGING_DB` and `PRODUCTION_DB`.

## Smoke Checks Checklist

- `GET /` serves the Vite application (`200`).
- `GET /api/v1/health` returns `200 {"status":"ok","service":"workflo-web-api",...}`.
- Invalid `POST /api/v1/contact` rejects with `400`.
- Burst `POST /api/v1/contact` exceeding `RATE_LIMIT_MAX_PER_MINUTE` returns `429 {"error":"rate_limit_exceeded"}` with `Retry-After: 60`.
- Valid `POST /api/v1/contact` and `POST /api/v1/early-access` persist rows across `submissions`, `notification_outbox` (`pending`), and `submission_events` in D1 and return `202`.
- Replaying a request with the same `Idempotency-Key` returns the same `reference` without creating duplicate rows; mismatched payload returns `409`.
- `GET /api/v1/unknown` returns `404` JSON, not SPA HTML.

## Persistence or Quota Failures

1. Check Cloudflare Pages Functions logs and D1 metrics in the Cloudflare Dashboard.
2. Confirm daily Free-tier D1 limits (5M reads / 100k writes) have not been exhausted.
3. API handlers return HTTP `503` when `DB` is unavailable so no submission is silently lost.

## Retention Cleanup

`workflo-web-retention-cleanup` executes `cleanupExpiredSubmissions` daily at `03:00 UTC` across staging and production using `Promise.allSettled` failure isolation (so staging issues never block production cleanup), purging expired `rate_limit_buckets`, `api_idempotency`, and `submissions` (cascading to `notification_outbox` and `submission_events`), and writes an audit row into `retention_runs`.

## Rollback

- Keep legacy AWS CDK / CloudFront / DynamoDB (`infra/`, `.github/workflows/deploy-aws.yml`) available until production cutover verification completes.
- On Cloudflare Pages, roll back to a previous verified deployment via the Cloudflare Dashboard or API.
