# Workflo website operations runbook

## Cloudflare Staging & Preview Deployment

Staging deployments run via `.github/workflows/cloudflare-staging.yml` (or manually via Wrangler):

1. Ensure GitHub Actions secret `CLOUDFLARE_API_TOKEN` and variable `CLOUDFLARE_ACCOUNT_ID` are set.
2. Dispatch **Cloudflare Staging Deployment** on `feat/cloudflare-pages-backend`.
3. Provisioning creates/reuses D1 `workflo-web-staging` and Pages project `workflo-site`, applies SQL migrations (`0001_initial_schema.sql`, `0002_indexes_and_retention.sql`), builds `dist/`, and deploys the preview branch.
4. Run smoke checks:
   ```bash
   bash scripts/cloudflare/verify-deployment.sh https://feat-cloudflare-pages-backend.workflo-site.pages.dev
   ```

## Smoke Checks Checklist

- `GET /` serves the Vite application cleanly.
- `GET /api/v1/health` returns `200 {"status":"ok","service":"workflo-web-api",...}`.
- Invalid `POST /api/v1/contact` rejects with `400`.
- Valid `POST /api/v1/contact` and `POST /api/v1/early-access` persist rows across `submissions`, `notification_outbox`, and `submission_events` in D1 and return `202`.
- Replaying a request with the same `Idempotency-Key` returns the same `reference` without creating duplicate rows; mismatched payload returns `409`.
- `GET /api/v1/unknown` returns `404` JSON, not SPA HTML.

## Persistence or Quota Failures

1. Check Cloudflare Pages Functions real-time logs and D1 metrics in the Cloudflare Dashboard.
2. Verify `DB` binding is present on both Preview and Production Pages environments.
3. Confirm daily free-tier D1 limits (5M reads / 100k writes) have not been exhausted.
4. API handlers return HTTP `503` when `DB` is unavailable so no submission is silently lost.

## Retention Cleanup

D1 does not auto-delete rows at `expires_at`. Schedule periodic execution of `cleanupExpiredSubmissions` (which purges `api_idempotency` and `submissions` where `expires_at <= now`, cascading to `notification_outbox` and `submission_events`, and logs a row to `retention_runs`).

## Rollback

- Keep the existing AWS CDK / CloudFront / DynamoDB deployment (`infra/`, `.github/workflows/deploy-aws.yml`) available as rollback until Cloudflare production verification passes.
- For Pages rollback, promote the previous verified Cloudflare Pages deployment or trigger `Deploy Workflo website to AWS`.
