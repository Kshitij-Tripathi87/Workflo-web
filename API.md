# Public API contract

All routes are served under the same-origin CloudFront `/api/*` behaviour and are backed by API Gateway REST API + Lambda.

## GET /api/v1/health

Returns service status and a timestamp. Does not inspect or start the Workflo execution runtime.

Response 200:

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
- `consentToReply`: must be true.
- `website`: honeypot, must be empty.

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
- `consentToReply`: must be true.
- `website`: honeypot, must be empty.

## Responses

- `202 Accepted`: request persisted; response includes `accepted`, a reference ID and a request ID.
- `400 Bad Request`: malformed JSON or schema validation error.
- `405 Method Not Allowed`: method not supported.
- `413 Payload Too Large`: body exceeds the 16 KiB limit.
- `503 Service Unavailable`: durable persistence failed; request was not confirmed.

A 202 means the submission is durably stored. Email notifications are asynchronous and may arrive later. A notification delivery problem does not mean the submission was lost.

## Security

- Strict Zod schemas reject unexpected fields.
- Validation occurs on the server regardless of browser validation.
- Do not put credentials, source code, government identity numbers or sensitive personal data in forms.
- Admin lead listing/update endpoints are intentionally not exposed.
