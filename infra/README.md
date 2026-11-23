# Workflo website infrastructure

AWS CDK (TypeScript) infrastructure for the public Workflo website and lead intake.

## Prerequisites

- AWS CLI configured for the target account.
- Node.js 22 or later.
- Domain ownership and a verified SES sending identity.
- GitHub Actions OIDC role for deployment (no long-lived access keys).
- Build output in the backend directory.

## Environments

Use separate stacks and separate AWS accounts for staging and production where possible:

```bash
cd infra
npm ci
npx cdk bootstrap aws://ACCOUNT_ID/ap-south-1
npx cdk synth -c environment=staging
npx cdk diff -c environment=staging
```

Production deployment must only run from a protected GitHub environment after review.

## Required deployment configuration

The API handlers require:

- `SITE_ORIGIN`: exact public site origin, e.g. `https://workflo.example`.
- `SES_FROM_ADDRESS`: verified sender identity.
- `LEAD_NOTIFICATION_ADDRESS`: mailbox controlled by Workflo.

CloudFront viewer certificate/custom domain configuration is intentionally not assumed; add an ACM certificate in `us-east-1` and alternate domain names once the real domain is confirmed.

## Important implementation notes

- Static website bucket is private and served with CloudFront Origin Access Control.
- DynamoDB uses on-demand billing; production enables point-in-time recovery and retention.
- Public forms are rate-limited at WAF and validated inside Lambda.
- Notification failures go to SQS retries and a dead-letter queue.
- No public API route can trigger Workflo sandbox execution.
- Review IAM, CloudFront API origin routing and SES permissions before deployment.
