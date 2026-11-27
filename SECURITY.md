# Security baseline

## Product boundary

The public marketing site and its API handle contact and early-access records only. No public endpoint starts, controls, or inspects Workflo sandbox executions, nor accesses customer repositories or source code. The execution platform remains strictly isolated.

## Current controls in source (Cloudflare Pages backend)

- Same-origin Pages Functions (`functions/api/v1/*`) enforce `Origin` equality checks (`403 origin_not_allowed`) for cross-origin browser requests.
- Unknown `/api/*` paths return explicit `404` JSON via `functions/api/_middleware.ts` instead of falling back to HTML.
- Strict request body validation with explicit field allowlists (`validation.ts`), `consentToReply: true` enforcement, and `website` honeypot check.
- Application-edge rate limiting (`functions/_shared/rate-limit.ts` backed by `rate_limit_buckets`) caps submissions per minute (`RATE_LIMIT_MAX_PER_MINUTE`, default `10`), hashes `CF-Connecting-IP` with SHA-256 (zero plaintext IP storage), and enforces `429 rate_limit_exceeded` + `Retry-After: 60`.
- 16 KiB payload ceiling (`413 payload_too_large`), `cache-control: no-store`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: no-referrer`, and `content-security-policy: default-src 'none'; frame-ancestors 'none'`.
- Parameterized prepared D1 SQL statements exclusively; zero string interpolation into SQL queries.
- Retry-safe `Idempotency-Key` support (`api_idempotency`) with SHA-256 payload mismatch conflict detection (`409 idempotency_key_conflict`).
- Zero PII (names, emails, raw IPs, free-text payloads) emitted in logs or rate-limit tables.
- Zero public administrative, lead-listing, or unauthenticated deletion HTTP endpoints (`workers/retention-cleanup.ts` returns HTTP `404` for all HTTP requests and executes strictly via Cron Trigger).
- Protected frontend guardrail (`scripts/cloudflare/check-protected-paths.sh`) verifies `src/`, `public/`, `index.html`, and `vite.config.ts` remain unmodified.

## Deployment & operational requirements

- Staging (`workflo-web-staging`) and production (`workflo-web-production`) D1 databases are strictly isolated and bound separately in Pages `preview` vs `production` environments.
- Zone-level Cloudflare WAF `http_ratelimit` rules (`scripts/cloudflare/configure-waf.sh`) require a custom domain Zone on Cloudflare; while hosted solely on `*.pages.dev`, active rate limiting is enforced by `rate-limit.ts` in Pages Functions.
- Scheduled Worker `workflo-web-retention-cleanup` runs daily at `03:00 UTC` (`0 3 * * *`) to purge expired `submissions` (cascading to `notification_outbox`, `submission_events`, `api_idempotency`), expired `rate_limit_buckets`, and record results in `retention_runs`.
- When onboarding Proton notification delivery (`Arsenelupin0813@proton.me`), configure verified sender DNS and queue consumer workers without exposing raw customer data in queue messages (pass `submission_id` only).
- Store `CLOUDFLARE_API_TOKEN` exclusively in GitHub Actions Secrets, never in source, workflow YAML, or chat logs.
