# Security baseline

## Product boundary

The public marketing site and its API handle contact and early-access records only. No public endpoint starts, controls, or inspects Workflo sandbox executions, nor accesses customer repositories or source code. The execution platform remains strictly isolated.

## Current controls in source (Cloudflare Pages backend)

- Same-origin Pages Functions (`functions/api/v1/*`) enforce `Origin` equality checks (`403 origin_not_allowed`) for cross-origin browser requests.
- Unknown `/api/*` paths return explicit `404` JSON via `functions/api/_middleware.ts` instead of falling back to HTML.
- Strict request body validation with explicit field allowlists (`validation.ts`), `consentToReply: true` enforcement, and `website` honeypot check.
- 16 KiB payload ceiling (`413 payload_too_large`), `cache-control: no-store`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: no-referrer`, and `content-security-policy: default-src 'none'; frame-ancestors 'none'`.
- Parameterized prepared D1 SQL statements exclusively; zero string interpolation into SQL queries.
- Retry-safe `Idempotency-Key` support (`api_idempotency`) with SHA-256 payload mismatch conflict detection (`409 idempotency_key_conflict`).
- Zero PII (names, emails, free-text payloads) emitted in `console.error` failure logs.
- Zero public administrative, lead-listing, or unauthenticated deletion HTTP endpoints.
- Protected frontend guardrail (`scripts/cloudflare/check-protected-paths.sh`) verifies `src/`, `public/`, `index.html`, and `vite.config.ts` remain unmodified.

## Deployment & operational requirements

- Store `CLOUDFLARE_API_TOKEN` exclusively in GitHub Actions Secrets (or encrypted secret manager), never in repository source, workflow YAML, or public logs.
- Configure Cloudflare WAF rate-limiting rules on `POST /api/v1/contact` and `POST /api/v1/early-access` before public launch.
- Keep staging (`workflo-web-staging`) and production (`workflo-web-production`) D1 databases strictly isolated.
- Schedule explicit D1 retention cleanup (`cleanupExpiredSubmissions`) to purge rows past `expires_at` (`SUBMISSION_RETENTION_DAYS`, bounded 30–3,650 days) and audit results in `retention_runs`.
- When onboarding Proton notification delivery (`Arsenelupin0813@proton.me`), configure verified sender DNS and queue consumer workers without exposing raw customer data in queue messages (pass `submission_id` only).
- Retain historical AWS security posture in `infra/` until Cloudflare cutover verification completes.
