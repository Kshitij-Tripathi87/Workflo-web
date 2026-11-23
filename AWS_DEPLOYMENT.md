# AWS deployment guide

This guide prepares the Workflo public website for AWS. It does not mean AWS resources have been provisioned or the site is live.

## Regions

- Application stack: `ap-south-1` (Mumbai) by default.
- CloudFront WAF stack: `us-east-1` (CloudFront-scope WAF requirement).
- CloudFront distribution: global edge.

## Required ownership/configuration before deployment

1. AWS account with permissions to bootstrap CDK, create CloudFront/WAF/API Gateway/Lambda/DynamoDB/SQS/SES resources, IAM roles, logs and alarms.
2. GitHub Actions OIDC role, restricted to this repository and environment.
3. Verified SES sender identity in Mumbai and an internal mailbox controlled by Workflo.
4. Set GitHub Environment secrets:
   - `AWS_DEPLOY_ROLE_ARN`
   - `SES_FROM_ADDRESS`
   - `SES_IDENTITY_ARN`
   - `LEAD_NOTIFICATION_ADDRESS`
5. Configure required reviewers for the `production` GitHub Environment.
6. Complete the legal entity, registered address, privacy contact, grievance officer/contact and governing-law placeholders in `public/privacy.html`, `public/cookies.html` and `public/terms.html`.
7. Decide the production domain. The current stack uses its CloudFront domain until a custom domain, DNS and ACM certificate are explicitly configured.

## Local synthesis

Node.js 24 is used for the CDK CLI; Node.js 26 is used by Lambda and the backend build.

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
export CDK_DEFAULT_REGION=ap-south-1
npx cdk synth -c environment=staging
```

## Manual staging deployment

From `infra/` after building the backend and authenticating the AWS CLI:

```bash
export CDK_DEFAULT_ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
export CDK_DEFAULT_REGION=ap-south-1
ENVIRONMENT=staging

npx cdk bootstrap "aws://$CDK_DEFAULT_ACCOUNT/us-east-1"
npx cdk bootstrap "aws://$CDK_DEFAULT_ACCOUNT/ap-south-1"

npx cdk deploy WorkfloWebEdgeWafStaging \
  -c environment=staging \
  --outputs-file edge-outputs.json

WEB_ACL_ARN="$(node -e 'const o=require("./edge-outputs.json");const k=Object.keys(o).find(x=>x.startsWith("WorkfloWebEdgeWaf"));process.stdout.write(o[k].CloudFrontWebAclArn)')"

SES_FROM_ADDRESS="verified-sender@your-domain.example" \
SES_IDENTITY_ARN="arn:aws:ses:ap-south-1:ACCOUNT:identity/your-domain.example" \
LEAD_NOTIFICATION_ADDRESS="private-workflo-inbox@your-domain.example" \
npx cdk deploy WorkfloWebStaging \
  -c environment=staging \
  -c webAclArn="$WEB_ACL_ARN" \
  --outputs-file app-outputs.json

BUCKET="$(node -e 'const o=require("./app-outputs.json");const k=Object.keys(o).find(x=>x.startsWith("WorkfloWeb")&&!x.includes("EdgeWaf"));process.stdout.write(o[k].SiteBucketName)')"
DISTRIBUTION_ID="$(node -e 'const o=require("./app-outputs.json");const k=Object.keys(o).find(x=>x.startsWith("WorkfloWeb")&&!x.includes("EdgeWaf"));process.stdout.write(o[k].CloudFrontDistributionId)')"
./deploy-frontend.sh "$BUCKET" "$DISTRIBUTION_ID" ../dist
```

Replace all example addresses and account placeholders. Do not commit actual values.

## GitHub Actions deployment

The workflow `.github/workflows/deploy-aws.yml` is manually triggered using `workflow_dispatch`, with a staging or production choice. It uses GitHub OIDC rather than persistent AWS access keys.

Before use:
- Create the `staging` and `production` GitHub Environments.
- Add the secrets listed above to the applicable environments.
- Restrict the OIDC role trust to the repository and relevant environment subject.
- Require production approvals in GitHub.
- Ensure SES is out of sandbox or approved for the required recipients.

## Custom domain

The stack currently does not bind a custom domain. To use one:
1. Confirm the domain and DNS owner.
2. Request/validate the ACM viewer certificate in `us-east-1`.
3. Add alternate domain names and certificate to the CloudFront Distribution.
4. Create Route 53 alias records for the distribution.
5. Add the desired production origin/domain values to SEO metadata and the privacy notice.
6. Test redirects, HTTPS, HSTS and canonical URLs.

## Production rollout gates

Do not deploy production until CI is green, staging form persistence and notification delivery have been tested, the security review passes, the WAF ARN is attached, SES configuration is verified, privacy/legal drafts are approved, and production environment approvals are active.

## Rollback

- Frontend: redeploy the previous committed `dist/` artifact using the same bucket and invalidation script.
- Infrastructure: inspect `cdk diff` and roll forward a corrective deployment; do not destroy retained production data resources.
- Data: use DynamoDB point-in-time recovery in production for a table-level recovery. Test restore procedures in staging first.
- Email: inspect SQS/DLQ and stream-dispatch failure queue metrics before replaying events. Avoid replaying the same email notification blindly because it may duplicate delivery.
