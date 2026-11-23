# Environment variables and GitHub configuration

## Frontend

| Variable | Where | Purpose |
|---|---|---|
| `VITE_WORKSPACE_URL` | Build environment | Optional real Workflo workspace URL; if absent, the UI explains that workspace access is not enabled |

Only `VITE_*` values are bundled into browser code. Never put credentials, AWS secrets or private tokens in them.

## Backend Lambda

| Variable | Purpose |
|---|---|
| `AWS_REGION` | AWS SDK client region; provided by Lambda |
| `SUBMISSIONS_TABLE` | DynamoDB table name |
| `NOTIFICATION_QUEUE_URL` | FIFO queue URL used by DynamoDB stream dispatcher |
| `SUBMISSION_RETENTION_DAYS` | Record TTL duration; defaults 365, bounded 30–3,650 |
| `SES_FROM_ADDRESS` | Verified SES sender address |
| `LEAD_NOTIFICATION_ADDRESS` | Restricted internal lead notification mailbox |
| `ALLOWED_ORIGIN` | Optional direct-origin CORS response; normal frontend uses same-origin CloudFront |

## CDK / deployment

| Variable / secret | Purpose |
|---|---|
| `CDK_DEFAULT_ACCOUNT` | AWS account selected for CDK stacks |
| `CDK_DEFAULT_REGION` | Application region; defaults to Mumbai `ap-south-1` |
| `WORKFLO_CLOUDFRONT_WAF_ARN` | Optional CloudFront WAF ACL ARN; CI deploy passes CDK context `webAclArn` |
| `SES_IDENTITY_ARN` | Verified SES identity ARN for least-privilege `ses:SendEmail` |
| `AWS_DEPLOY_ROLE_ARN` | GitHub Actions OIDC deploy role |
| `SES_FROM_ADDRESS` | Verified notification sender |
| `LEAD_NOTIFICATION_ADDRESS` | Internal mailbox |

The GitHub deployment workflow expects `AWS_DEPLOY_ROLE_ARN`, `SES_FROM_ADDRESS`, `SES_IDENTITY_ARN` and `LEAD_NOTIFICATION_ADDRESS` as secrets on the relevant GitHub Environment.

## GitHub Environments

Create `staging` and `production` environments. Configure production required reviewers and restrict the AWS OIDC role trust policy to this repository and production environment. Do not store long-lived AWS access keys.
