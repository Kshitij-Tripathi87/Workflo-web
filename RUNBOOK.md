# Workflo website operations runbook

## Deployment

Use the manual workflow `Deploy Workflo website to AWS`:

### Staging
1. Select the exact release ref and choose `staging`.
2. Confirm CI is green for that commit.
3. Confirm the staging GitHub Environment has its OIDC role and SES configuration.
4. Trigger the deployment and wait for the run to succeed.
5. Review output: edge WAF deployment, app stack deployment, S3 sync, CloudFront invalidation, homepage and API health smoke tests.
6. Record the staging workflow run ID and deployed commit SHA.

### Production promotion
1. Select the same exact ref/commit used by the successful staging run.
2. Choose `production`.
3. Supply the successful staging workflow run ID as `staging_run_id`.
4. Confirm the production gate reports the exact same commit SHA.
5. Complete the required production GitHub Environment approval.

The workflow rejects an unsuccessful/non-staging run, a run from an unsupported branch, or a different commit SHA. It also blocks deployment while legal operator placeholders remain in the privacy and terms pages.

## Smoke checks

- `GET /` responds successfully.
- `GET /api/v1/health` returns `status=ok`.
- Contact form creates one DynamoDB submission.
- Early-access form creates one DynamoDB submission.
- DynamoDB stream dispatches a minimal event to SQS.
- SES worker sends the notification to the controlled internal mailbox.
- Verify no raw lead list API is publicly available.
- Check CloudFront WAF and regional API WAF metrics.
- Check CloudWatch stream-dispatch and notification DLQ alarms.

## Notification delivery failure

1. Check CloudWatch alarms and Lambda errors for dispatcher/worker.
2. Inspect stream-dispatch DLQ and notification DLQ counts.
3. Retrieve the relevant submission ID from the message metadata.
4. Confirm the durable DynamoDB record still exists.
5. Check SES sender verification, account sandbox status, identity ARN permissions and recipient suppression/bounce status.
6. Correct the fault before replaying messages.
7. Avoid blind replay that could send duplicate emails; SES message delivery is not exactly-once.

## Frontend rollback

1. Identify the last known good release commit/artifact.
2. Build its frontend from the matching lockfile.
3. Use `infra/deploy-frontend.sh <bucket> <distribution-id> <dist-dir>`.
4. Verify the homepage, API health and browser behaviour.

## Infrastructure rollback

Use `cdk diff` and review the proposed changes. Prefer a corrective forward deployment. Production S3 and DynamoDB resources are retained; do not delete or replace them casually.

## Data recovery and privacy requests

- Production DynamoDB PITR is enabled by the CDK stack; test table restore into a separate table in staging.
- TTL expiry is asynchronous and not an exact deletion deadline.
- Privacy requests must be handled by an authorised operator using the controlled data store and documented retention policy.
- Review related copies in email, security logs, backups and any exported records before confirming deletion.
- The public website has no admin API for retrieving leads. Do not make the DynamoDB table public or add a public unauthenticated listing endpoint.

## Incident response

Restrict affected IAM roles or credentials, preserve relevant CloudTrail/CloudWatch evidence, rotate compromised secrets, inspect WAF/API access logs, restore service using least-privilege credentials, and document impact and any required notifications.
