# Cloudflare website backend migration

## Scope and isolation

This migration moves only the Workflo marketing website backend from the existing AWS API implementation to Cloudflare Pages Functions and D1.

The Workflo execution platform remains a separate system. It does not share this D1 database, does not receive access to customer repositories or source code, and is not controlled by these website endpoints.

The existing AWS stacks and deployment workflow are retained as the rollback path until Cloudflare staging and production have been verified. No frontend files are part of this migration.

## First deployment: staging

| Resource | Name | Purpose |
| --- | --- | --- |
| Cloudflare Pages | `workflo-site` | Existing Vite static frontend plus Pages Functions |
| Cloudflare D1 | `workflo-web-staging` | Contact and early-access submissions |
| Pages preview | Current Git branch | Staging URL under `pages.dev` |

R2 is intentionally not provisioned: current forms submit small structured records, not binary evidence or documents.

The notification outbox is stored in D1. Queue delivery and email sending are deliberately not enabled yet. A queue consumer must be deployed and tested before producers are enabled; otherwise messages could accumulate without a consumer. Cloudflare Email Service also requires a sending domain onboarded to Cloudflare DNS. The Proton inbox is the intended notification destination, not the sender domain.

## API compatibility

The following same-origin routes preserve the existing public API contract:

- `GET /api/v1/health`
- `POST /api/v1/contact`
- `POST /api/v1/early-access`

Validation retains strict field allowlists, required reply consent, current enumerations and length limits, the empty `website` honeypot, and a 16 KiB request body limit. A 202 response is returned only after the submission and its notification-outbox record have been persisted in a D1 batch.

No lead-listing, admin, execution, or customer-source-code endpoints are introduced.

## Staging provisioning

The workflow `.github/workflows/cloudflare-staging.yml` is manually dispatched from the migration branch. It:

1. Checks that the Cloudflare token and account ID are available as GitHub Actions credentials.
2. Builds the existing frontend without changing it.
3. Creates or reuses the staging D1 database and Pages project.
4. Generates a temporary Wrangler configuration containing the D1 database ID.
5. Applies the checked-in SQL migrations remotely.
6. Deploys a Pages preview from the current branch.
7. Checks the preview health endpoint.

Required GitHub configuration:

- Actions secret: `CLOUDFLARE_API_TOKEN`
- Actions variable: `CLOUDFLARE_ACCOUNT_ID`

Use a narrowly scoped Cloudflare API token with account-level D1 Read/Edit and Pages Edit permissions. Do not put tokens in repository files, workflow YAML, or chat messages.

## Email and notifications: later stage

After acquiring a domain and onboarding it to Cloudflare Email Service:

1. Verify the Proton destination address in Cloudflare Email Service when using the Workers Free plan.
2. Create the notification-consumer Worker with a restricted sender and recipient binding.
3. Connect the consumer to the D1 outbox and a Cloudflare Queue.
4. Test retries, idempotency, dead-letter handling, and delivery.
5. Only then enable notification queue producers in Pages Functions.

No successful email delivery is claimed before this configuration is complete.

## Production migration

Production is a separate deployment step, not part of the staging workflow. It requires:

- A separate `workflo-web-production` D1 database.
- The production Pages branch/configuration and bindings.
- A production smoke test of all three endpoints.
- Review of Cloudflare logs, database persistence, validation failures, and rate-limiting.
- A documented rollback procedure.

The existing AWS deployment remains active until that checklist passes and an explicit cutover is performed.

## Operational safeguards

- Retain the frontend build and all `src/`, `public/`, `index.html`, and Vite configuration unchanged.
- Keep staging and production databases separate.
- Use prepared D1 statements only.
- Do not log form payloads or email addresses.
- Expire submission data according to the configured retention window; a scheduled cleanup job is required before production.
- Add Cloudflare rate limiting for the two submission routes before public launch.
- Do not expose administrative reads or writes through public Pages Functions.
