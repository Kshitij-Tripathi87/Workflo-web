# Security baseline

## Product boundary

The public marketing site and its API handle contact and early-access records only. No public endpoint starts, controls, or inspects Workflo sandbox executions. Keep this boundary separate from the actual verification runtime and customer workspace.

## Current controls in source

- Private S3 bucket with Block Public Access and CloudFront Origin Access Control.
- HTTPS redirect at CloudFront.
- CloudFront-scope WAF and regional API Gateway REST API WAF.
- Server-side Zod request validation with strict object schemas.
- 16 KiB body limit, no-store API responses, request identifiers and safe error bodies.
- DynamoDB encryption, conditional writes, configurable TTL and production PITR.
- DynamoDB stream dispatch to encrypted SQS FIFO with retry/failure paths.
- SES worker reads only the stored submission required for an internal notification.
- IAM grants are scoped for data table, stream, queue and worker; SES identity ARN can scope send permission.
- CloudFront security headers include CSP, HSTS, frame denial, content type sniff protection, referrer policy and Permissions Policy.
- No analytics/advertising tags are loaded at present; optional consent categories are disabled by default.
- No password or AWS credential collection in the marketing site.

## Deployment requirements

- Configure GitHub Actions OIDC with repository + environment subject restrictions.
- Do not use long-lived IAM access keys in GitHub Secrets.
- Set `SES_IDENTITY_ARN` before production so SES send permission is not wildcard.
- Attach the CloudFront-scope WAF ACL ARN to the CloudFront distribution.
- Set the actual allowed domain, certificate and DNS after domain ownership is confirmed.
- Verify AWS account-level CloudTrail and logging posture.
- Ensure production DynamoDB PITR is enabled and restoration is tested.
- Keep production logs and queue payloads free of unnecessary personal details.
- Configure an operational lead-review workflow with authenticated access; do not expose raw leads via public API.

## Privacy/data handling

Contact/early-access records contain names, business emails, company, role and supplied free-text. Treat the entire record as confidential business information. Notifications are internal only. The email worker intentionally fetches the durable record from DynamoDB and sends it to the configured internal mailbox; access to that mailbox must be restricted.

The current retention default is 365 days, configurable via `SUBMISSION_RETENTION_DAYS`, bounded from 30 to 3,650 days in the handler. DynamoDB TTL deletion is asynchronous. The operator must approve retention and define any deletion process for copied data in email, backups and logs.

## Reporting

Security reports should be sent to **[security contact email — configure before launch]**. Do not submit credentials, secrets or customer source code in public contact forms.
