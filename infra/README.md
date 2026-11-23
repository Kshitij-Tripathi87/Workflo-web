# Workflo website — AWS infrastructure

AWS CDK v2 / TypeScript infrastructure for the public marketing website and lead intake. It is deliberately separate from the Workflo sandbox execution service.

## Region layout

- **Application region:** `ap-south-1` (Mumbai) by default. The website API, Lambda, DynamoDB, SQS, SES and regional API WAF live here.
- **Edge region:** `us-east-1` for the CloudFront-scope WAF ACL.
- **CloudFront:** global edge distribution. The S3 origin is private and uses Origin Access Control.
- **Custom domain:** not configured. Add a verified domain, ACM certificate in `us-east-1`, Route 53 records and CloudFront alternate domain name after the owner supplies the actual domain.

The API uses **API Gateway REST API**, not HTTP API, because AWS WAF integration is supported for REST APIs. The public site calls the API through the same-origin CloudFront `/api/*` behaviour.

## Prerequisites

- Node.js 24 LTS for the CDK CLI; Node.js 26 for Lambda handlers.
- AWS CLI logged in to the intended account.
- Permission to bootstrap CDK in `us-east-1` and `ap-south-1`.
- A verified Amazon SES identity in `ap-south-1`.
- A mailbox controlled by Workflo for internal lead notifications.
- GitHub Actions OIDC role with scoped deployment permissions.
- A protected GitHub environment for production deployment approvals.

## Configuration

The CDK application reads:

| Variable | Required | Meaning |
|---|---:|---|
| `CDK_DEFAULT_ACCOUNT` | Yes | AWS account ID resolved from the authenticated CLI identity |
| `CDK_DEFAULT_REGION` | No | Application region; defaults to `ap-south-1` |
| `WORKFLO_CLOUDFRONT_WAF_ARN` | For deployment | ARN output by the edge WAF stack; alternatively pass CDK context `webAclArn` |
| `SES_FROM_ADDRESS` | Yes for working notifications | Verified sender email |
| `SES_IDENTITY_ARN` | Yes for production least privilege | ARN of the verified SES identity used to send |
| `LEAD_NOTIFICATION_ADDRESS` | Yes for working notifications | Private Workflo mailbox that receives leads |
| `SUBMISSION_RETENTION_DAYS` | No | Enquiry retention; default 365 days, bounded by handler between 30 and 3,650 |

The forms and API are same-origin via CloudFront. Do not set CORS origins unless you deliberately support direct cross-origin API access.

## Build and synth

From the repository root:

```bash
cd backend
npm install
npm run typecheck
npm run build
npm test

cd ../infra
npm install
npm run build
export CDK_DEFAULT_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
export CDK_DEFAULT_REGION="ap-south-1"
npx cdk synth -c environment=staging
```

## Deploy order

CloudFront WAF is global and must be created in `us-east-1`; the app stack is created in the application region. Deploy them separately:

```bash
cd infra
export CDK_DEFAULT_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
export CDK_DEFAULT_REGION="ap-south-1"
ENVIRONMENT=staging
EDGE_STACK="WorkfloWebEdgeWaf${ENVIRONMENT^}"
APP_STACK="WorkfloWeb${ENVIRONMENT^}"

npx cdk bootstrap "aws://$CDK_DEFAULT_ACCOUNT/us-east-1"
npx cdk bootstrap "aws://$CDK_DEFAULT_ACCOUNT/$CDK_DEFAULT_REGION"

npx cdk deploy "$EDGE_STACK" -c environment="$ENVIRONMENT" --outputs-file edge-outputs.json
WEB_ACL_ARN="$(node -e 'const o=require("./edge-outputs.json");const k=Object.keys(o)[0];process.stdout.write(o[k].CloudFrontWebAclArn)')"

SES_FROM_ADDRESS="verified-sender@example.invalid" \
SES_IDENTITY_ARN="arn:aws:ses:ap-south-1:111111111111:identity/example.invalid" \
LEAD_NOTIFICATION_ADDRESS="private-inbox@example.invalid" \
npx cdk deploy "$APP_STACK" -c environment="$ENVIRONMENT" -c webAclArn="$WEB_ACL_ARN" --outputs-file app-outputs.json
```

Replace all example values with the real values. Never commit them. The same sequence applies to `production`; use separate accounts where possible and protect the production GitHub environment with required reviewers.

## Publish the static site

After a successful app stack deployment, retrieve the stack outputs and sync the built frontend:

```bash
BUCKET="$(node -e 'const o=require("./app-outputs.json");const k=Object.keys(o)[0];process.stdout.write(o[k].SiteBucketName)')"
DISTRIBUTION_ID="$(node -e 'const o=require("./app-outputs.json");const k=Object.keys(o)[0];process.stdout.write(o[k].CloudFrontDistributionId)')"
./deploy-frontend.sh "$BUCKET" "$DISTRIBUTION_ID" ../dist
```

The script gives hashed assets long-lived immutable caching, HTML revalidation and invalidates the CDN after publishing.

## Production gates

Do not deploy production until:

1. SES sender identity is verified and mailbox ownership is confirmed.
2. SES is out of sandbox / has the necessary sending approval, if applicable to the account.
3. WAF ACL ARN is passed to the CloudFront stack.
4. API WAF and CloudFront WAF are synthesized and reviewed.
5. GitHub OIDC trust is restricted to this repository and protected environment.
6. Legal policy placeholders are replaced and approved.
7. Domain, DNS and TLS configuration are approved if a custom domain is required.
8. Staging deployment, end-to-end form persistence and notification delivery pass.

CloudFront costs, WAF, SES sending and API usage are real AWS charges. Review the expected spend before deployment.
