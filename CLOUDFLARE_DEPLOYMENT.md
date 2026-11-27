# Cloudflare Deployment Guide

## Active Resources

| Environment | Resource | Name / Identifier | Status |
| :--- | :--- | :--- | :--- |
| Staging (`preview`) | Cloudflare Pages | `workflo-site` (`workflo-site-3av.pages.dev`) | Live (`feat/cloudflare-pages-backend`) |
| Staging (`preview`) | Cloudflare D1 (`DB`) | `workflo-web-staging` (`9db21a01-4a2d-4548-9bc7-1f62977a7785`) | Applied (`0001`–`0003`) |
| Production (`production`) | Cloudflare D1 (`DB`) | `workflo-web-production` (`2cb08cf0-2c0e-4fef-9d40-d927ad49a329`) | Applied (`0001`–`0003`), bound to `production` |
| Shared Cron | Cloudflare Worker | `workflo-web-retention-cleanup` (`0 3 * * *` UTC) | Daily expiry cleanup across both DBs |

## Pages Build Configuration

| Setting | Value |
| :--- | :--- |
| Root directory | `/` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Functions directory | `/functions` |

## Prerequisites for Automated CI Deployments

1. **Cloudflare API Token** stored securely as GitHub Actions secret `CLOUDFLARE_API_TOKEN` (`Account > D1 > Edit`, `Account > Cloudflare Pages > Edit`).
2. **Cloudflare Account ID** stored as GitHub Actions variable `CLOUDFLARE_ACCOUNT_ID`.
3. Never commit API tokens, passwords, or private keys into source files or chat logs.

## Rate Limiting & Edge Protection

- While operating on `*.pages.dev` without a custom Zone, Cloudflare Zone WAF rulesets do not apply directly to `pages.dev`. Rate limiting (`RATE_LIMIT_MAX_PER_MINUTE=10`, returning HTTP `429` + `Retry-After: 60`) is enforced at the application edge via D1 (`rate_limit_buckets`) using sliding-window counter estimation and keyed HMAC-SHA256 (`RATE_LIMIT_SECRET`, falling back to a runtime salt) over `CF-Connecting-IP` (strictly ignoring unverified `X-Forwarded-For`).
- Once a custom domain Zone is onboarded, run `scripts/cloudflare/configure-waf.sh` in addition to the built-in limiter.

## Production Cutover Checklist

1. Verify staging preview API (`verify-deployment.sh`), rate limit `429` enforcement, outbox recording, and Cron retention worker schedule.
2. Confirm `workflo-web-production` schema migrations (`0001`–`0003`) and Pages `production` binding (`DB`).
3. Merge `feat/cloudflare-pages-backend` into `main` to deploy the `production` branch.
4. Run `verify-deployment.sh` against the live production URL.
5. Keep legacy AWS CDK stacks intact until production cutover verification completes.
