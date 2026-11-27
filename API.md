# Public API contract

All routes are served on the same origin under `/api/v1/*` via Cloudflare Pages Functions (`functions/api/v1/*`) backed by Cloudflare D1 (`DB` binding). Historical AWS API Gateway + Lambda handlers in `backend/` and `infra/` are retained as rollback reference until Cloudflare cutover is complete.

Unknown `/api/*` paths return HTTP `404` JSON (`{"error":"not_found","requestId":"..."}`) rather than falling through to the frontend HTML shell.

## GET /api/v1/health

Returns service status and a timestamp. Does not inspect or start the Workflo execution runtime.

Response `200`:

```json
{"status":"ok","service":"workflo-web-api","timestamp":"2026-11-23T00:00:00.000Z"}
```

## POST /api/v1/contact

Request:

```json
{
  "name": "Ada Example",
  "email": "ada@example.com",
  "company": "Example Engineering",
  "role": "Engineering Lead",
  "inquiryType": "product",
  "message": "We would like to discuss verification for our repositories.",
  "consentToReply": true,
  "website": ""
}
```

- `name`: required, 2–120 characters.
- `email`: required, valid email, max 254 characters.
- `company`, `role`: optional.
- `inquiryType`: `product | security | partnership | privacy | other`.
- `message`: required, 10–5,000 characters.
- `consentToReply`: must be `true`.
- `website`: honeypot, must be empty.
- Optional header `Idempotency-Key` (`[A-Za-z0-9._:-]{1,128}`): prevents duplicate writes on retries; returns `409 idempotency_key_conflict` if reused with a different payload.

Responses:
- `202 Accepted`: `{ "accepted": true, "reference": "<uuid>", "requestId": "<uuid>" }` (only after durable D1 persistence succeeds)
- `400 Bad Request`: invalid JSON, missing body, schema error, or malformed `Idempotency-Key`
- `403 Forbidden`: cross-origin browser `Origin` mismatch
- `405 Method Not Allowed`: non-`POST` method
- `409 Conflict`: conflicting payload for an active `Idempotency-Key`
- `413 Payload Too Large`: request body exceeds 16 KiB
- `503 Service Unavailable`: D1 persistence binding missing or write failure

## POST /api/v1/early-access

Request:

```json
{
  "name": "Ada Example",
  "email": "ada@example.com",
  "company": "Example Engineering",
  "role": "Engineering Lead",
  "teamSize": "6-20",
  "useCase": "We need repeatable isolated verification for code changes.",
  "workflow": "GitHub pull requests and CI pipelines.",
  "consentToReply": true,
  "website": ""
}
```

- `name`: required, 2–120 characters.
- `email`: required, valid email, max 254 characters.
- `company`: required, 2–160 characters.
- `teamSize`: `1 | 2-5 | 6-20 | 21-50 | 51-200 | 200+`.
- `useCase`: required, 20–3,000 characters.
- `workflow`, `role`: optional.
- `consentToReply`: must be `true`.
- `website`: honeypot, must be empty.
- Optional header `Idempotency-Key`: retry-safe duplicate protection (same semantics as `/api/v1/contact`).
