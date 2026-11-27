# Workflo website architecture

## Purpose and boundary

This repository contains the public Workflo marketing website and its contact/early-access intake API.

It is **not** the Workflo software execution service. The public website has no endpoint that starts sandbox runs, accesses customer repositories, or controls microVM infrastructure. The execution platform remains a separately authenticated, separately authorised, and separately isolated system.

## Active Cloudflare target request path

```text
Browser
  │
  ▼
Cloudflare Pages (pages.dev / custom domain)
  ├── /, /assets/*, /media/* ──► Static Vite bundle (dist/)
  │
  └── /api/v1/* ──► Pages Functions (functions/api/_middleware.ts + functions/api/v1/*)
                      ├── GET  /api/v1/health       ──► Service status
                      ├── POST /api/v1/contact      ──► Strict validation + D1 batch write
                      └── POST /api/v1/early-access ──► Strict validation + D1 batch write
                                                           │
                                                           ▼
                                               Cloudflare D1 (DB binding)
                                                 ├── submissions
                                                 ├── notification_outbox
                                                 ├── submission_events
                                                 ├── api_idempotency
                                                 └── retention_runs
```

Note: The legacy AWS CDK + Lambda + DynamoDB + SES implementation in `backend/` and `infra/` is preserved unchanged as the historical rollback reference until Cloudflare staging and production verification complete.

## Frontend

- React 19, TypeScript, Vite, and Tailwind CSS v4.
- Standard split build output in `dist/` via `npm run build`.
- Frontend source (`src/`, `public/`, `index.html`, `vite.config.ts`) is strictly decoupled and preserved without modification during the Cloudflare backend migration.

## Backend and data lifecycle

1. All `/api/v1/*` endpoints execute via Cloudflare Pages Functions on the same origin as the Vite frontend, eliminating CORS issues while still enforcing strict same-origin `Origin` validation.
2. Incoming `POST` payloads are bounded at 16 KiB, validated strictly against allowlisted fields, and optionally deduplicated using `Idempotency-Key` (`api_idempotency`).
3. Durable persistence executes atomically in `db.batch(...)` across `submissions`, `notification_outbox`, `submission_events`, and (when present) `api_idempotency`. HTTP `202` is returned only after `db.batch(...)` confirms success.
4. Asynchronous notification delivery is decoupled via `notification_outbox`; R2 and automated outbound email remain deferred until sender domain onboarding and destination mailbox verification (`Arsenelupin0813@proton.me`) are completed.
5. Explicit retention expiry cleanup is implemented via `cleanupExpiredSubmissions` and recorded in `retention_runs` because D1 does not automatically delete rows at `expires_at`.

## Free-tier quota boundaries

Cloudflare Workers/Pages Free allowances (subject to current Cloudflare limits, not an unconditional guarantee):
- Workers/Pages Functions: 100,000 requests/day, 10 ms CPU/request.
- Pages: up to 500 builds/month.
- D1: 500 MB per database (5 GB account total), 5M rows read/day, 100k rows written/day.

Exceeding daily free-tier D1 quotas will cause queries to fail until quota reset; submissions must return `503` rather than faking success if D1 is unavailable.
