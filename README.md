# Workflo — controlled software verification with evidence attached

Workflo is presented here as an engineering product, not a generic AI landing page. The site tells the product story through five supplied industrial scenes, an interpolated scroll camera, and concrete product visuals for revision pinning, app probing and signed evidence.

## Experience and design system

- Five-scene sequence: exterior machine → gateway → execution chamber → branching pathways → sealed module.
- Scroll-synchronised camera poses, crossfades, pointer parallax, animated text layers and a distinct mobile story.
- Reduced-motion mode keeps the content readable and selects a static scene for the current scroll position.
- Flat graphite, warm ivory and amber palette; no gradients, glassmorphism or generic purple AI treatment.
- Editorial serif display typography paired with a readable sans body and monospace operational metadata.
- Product-specific interface visualisations are labelled as demonstration material, not customer proof.

Images are stored in `public/media/`. See [the asset manifest](public/media/README.md). The current website delivery variants are 640 × 360 WebP; replace them with higher-resolution art-directed exports before the final launch if the wide desktop screens need more detail.

## Stack

| Layer | Implementation |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Motion | Single scroll-synchronised RAF camera controller + CSS/IntersectionObserver reveals |
| Public API | API Gateway REST API + AWS Lambda (Node.js 26) |
| Persistence | DynamoDB with TTL and production point-in-time recovery |
| Notification pipeline | DynamoDB Streams → SQS FIFO + DLQs → Lambda → SES |
| Edge | CloudFront, private S3 origin with Origin Access Control |
| Security | CloudFront WAF (us-east-1), regional API WAF, CSP/security headers, IAM |
| Infrastructure | AWS CDK v2, TypeScript |
| CI | GitHub Actions, build/type checks, CDK synthesis and Playwright browser checks |

The public website does not expose or start Workflo sandbox execution. The marketing/lead system is a separate boundary from the Workflo verification runtime.

## Local development

Prerequisites: Node.js 24 LTS, npm, and (for backend/infrastructure checks) Node.js 26 runtime compatibility.

```bash
npm ci
npm run dev
```

Frontend checks:

```bash
npm run typecheck
npm run build
```

Backend checks:

```bash
cd backend
npm install
npm run typecheck
npm run build
npm test
```

Infrastructure synthesis (build backend first because CDK packages the compiled handlers):

```bash
cd backend && npm install && npm run build && cd ../infra
npm install
npm run build
CDK_DEFAULT_ACCOUNT=111111111111 CDK_DEFAULT_REGION=ap-south-1 npx cdk synth -c environment=staging
```

Playwright browser checks are run in CI; to run them locally, install Playwright and Chromium, then run `node tests/e2e/run.mjs`.

## Full-stack API

- `GET /api/v1/health`
- `POST /api/v1/contact`
- `POST /api/v1/early-access`

Submissions are validated again on the server and persisted before they are acknowledged. DynamoDB Streams dispatch a minimal notification event to an encrypted FIFO queue; an email worker fetches the stored submission and sends an internal notification. A delivery failure cannot erase the durable record.

## AWS deployment

See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md), [infra/README.md](infra/README.md), [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), [API.md](API.md), [ENVIRONMENT.md](ENVIRONMENT.md) and [RUNBOOK.md](RUNBOOK.md).

No AWS environment is provisioned by this repository change. The deployment workflow requires a GitHub OIDC role, verified SES sender identity, internal notification mailbox, AWS account permissions and protected GitHub environments. A custom domain, DNS and ACM certificate are intentionally not assumed.

## Privacy and legal

The website includes a privacy policy, cookie/storage policy and website terms as **pre-launch drafts**. They contain placeholders for the legal entity, business address, privacy contact, grievance contact and governing law. Replace them and obtain legal review before public launch.

No analytics or advertising tags are currently installed. Consent preferences are saved in local storage; the optional categories remain inactive until a specific vendor and tag-blocking integration are implemented.

## Verification status

The GitHub workflow is the source of truth for build and browser test results. A code change must not be described as browser-verified, AWS-deployed or production-ready until its CI run and deployment smoke tests have actually passed.
