# Cloudflare Deployment Guide

## Prerequisites

1. **Cloudflare API Token** stored securely as GitHub Actions secret `CLOUDFLARE_API_TOKEN` with:
   - `Account > D1 > Edit`
   - `Account > Cloudflare Pages > Edit`
2. **Cloudflare Account ID** stored as GitHub Actions variable `CLOUDFLARE_ACCOUNT_ID`.
3. Never commit API tokens, passwords, or private keys into source files or chat logs.

## Pages Build Configuration

| Setting | Value |
| :--- | :--- |
| Root directory | `/` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Functions directory | `/functions` (automatically detected at repo root) |

## Provisioning & Migration Workflow

1. **Provision staging resources & preview deployment** via `.github/workflows/cloudflare-staging.yml` (`scripts/cloudflare/provision-staging.sh`), or manually with Wrangler:
   ```bash
   export CLOUDFLARE_API_TOKEN="<token>"
   export CLOUDFLARE_ACCOUNT_ID="<account-id>"
   bash scripts/cloudflare/provision-staging.sh
   bash scripts/cloudflare/migrate-production.sh workflo-web-staging wrangler.jsonc
   npx --yes wrangler@4 pages deploy dist --project-name workflo-site --branch feat/cloudflare-pages-backend --config wrangler.jsonc
   ```
2. **Local development with D1 bindings**:
   ```bash
   npm run build
   # Copy cloudflare/wrangler.pages.jsonc.template to wrangler.jsonc (ignored by git)
   bash scripts/cloudflare/migrate-local.sh workflo-web-staging wrangler.jsonc
   npx --yes wrangler@4 pages dev dist --config wrangler.jsonc --d1 DB=workflo-web-staging
   ```
3. **Verify deployment**:
   ```bash
   bash scripts/cloudflare/verify-deployment.sh https://feat-cloudflare-pages-backend.workflo-site.pages.dev
   ```

## Separate Systems & Deferred Capabilities

- **Workflo Execution Platform** remains isolated on dedicated execution infrastructure; it never shares the website D1 database or receives traffic from website endpoints.
- **Email notifications (Proton destination)**: `notification_outbox` records are durably queued in D1. Outbound email workers and R2 buckets are deferred until a custom sending domain is onboarded to Cloudflare DNS and the Proton inbox destination is verified.
- **Production cutover**: Only create `workflo-web-production` D1 and deploy `main` after staging API, validation, idempotency, and persistence checks pass. Keep AWS CDK stacks intact until cutover sign-off.
