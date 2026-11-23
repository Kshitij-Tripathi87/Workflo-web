# Workflo website architecture

## Purpose and boundary

This repository contains the public Workflo website, its contact/early-access intake API, and the infrastructure required to deploy those surfaces to AWS.

It is **not** the Workflo software execution service. The public website has no endpoint that starts sandbox runs, accesses customer repositories, or controls microVM infrastructure. The execution service remains a separately authenticated, separately authorised and separately isolated product boundary.

## Request path

```text
Browser
  │
  ▼
CloudFront + CloudFront-scope WAF (us-east-1)
  ├── /, /assets/*, /media/* ──► private S3 origin (OAC)
  │
  └── /api/* ──► API Gateway REST API (regional, Mumbai)
                   ├── GET  /api/v1/health ──► Health Lambda
                   ├── POST /api/v1/contact ─► Contact Lambda
                   └── POST /api/v1/early-access ► Early Access Lambda
                                      │
                                      ▼
                                  DynamoDB
                                      │ NEW_IMAGE stream
                                      ▼
                               Dispatch Lambda
                                      │
                                      ▼
                                 SQS FIFO
                                      │
                               Notification Lambda
                                      │
                                      ▼
                                  Amazon SES
```

A regional AWS WAF protects the API Gateway REST API. A separate CloudFront-scope WAF protects the global edge distribution. The CloudFront ACL is provisioned in `us-east-1`; the application/data stack defaults to `ap-south-1`.

## Frontend

- React 19, TypeScript, Vite and Tailwind CSS v4.
- Standard split build output, not a single-file HTML bundle.
- Five supplied industrial scene assets are stored in `public/media/`.
- One requestAnimationFrame scroll controller interpolates five camera poses and photo crossfades.
- Mobile uses an image-led vertical composition rather than the desktop pinned sequence.
- Reduced-motion mode selects one static scene at the current scroll position and removes decorative motion.
- The display serif, body sans and monospace metadata roles are separated; UI surfaces are flat, solid graphite/ivory/amber.

Images are still photographs. Camera-like pans, dolly/scale and scroll blending are not true 3D geometry or depth-map parallax. The design should not imply that they are.

## Backend and data lifecycle

Contact and early-access inputs are validated with shared Zod schemas in `backend/src/validation/submissions.ts`. The API handler validates the request, writes the submission to DynamoDB, and only then responds with HTTP 202.

A DynamoDB NEW_IMAGE stream triggers a dispatcher. The dispatcher sends a minimal notification reference to an encrypted FIFO queue. The notification worker fetches the durable record before sending an internal notification email through SES.

This avoids making user submission success depend on immediate email delivery. Stream failures are sent to a stream-dispatch failure queue; email failures are retried and then sent to a notification DLQ. DLQ alarms are defined in CloudWatch.

## AWS infrastructure

- S3: private origin bucket with Block Public Access, encryption, and production versioning/retention.
- CloudFront: CDN, HTTPS redirect, OAC and asset/API cache behaviours.
- API Gateway REST API: regional stage, structured access logs, metrics, WAF association.
- Lambda: Node.js 26 ARM64 handlers, built as self-contained ESM bundles with esbuild.
- DynamoDB: on-demand, encrypted, NEW_IMAGE stream, TTL, production PITR.
- SQS FIFO: notification queue, retry and DLQ path.
- SES: internal notification delivery; sender identity must be verified.
- WAF: regional API ACL plus global CloudFront ACL.
- CloudWatch: API access logs and dead-letter alarms.
- CDK: TypeScript infrastructure for staging and production stack pairs.

## Deployment shape

The infrastructure entry creates two stacks per environment:
- `WorkfloWebEdgeWaf{Environment}` in `us-east-1`.
- `WorkfloWeb{Environment}` in the configured application region (Mumbai by default).

The edge stack is deployed first. Its WAF ARN is passed into the app stack, which creates CloudFront with the ACL attached. The static frontend is uploaded separately using `infra/deploy-frontend.sh`.

## Identity

The marketing-site sign-in control does not collect credentials. It links to `VITE_WORKSPACE_URL` only when a real workspace URL is configured. Authentication for the actual Workflo workspace belongs to that separate application and its identity provider; there is no simulated marketing-site login.

## Known pre-launch decisions

- Add the real production domain, Route 53 records, ACM certificate in `us-east-1`, and CloudFront alternate domain name.
- Configure the GitHub OIDC role trust policy and protected environment approvals.
- Confirm SES identity, sending status and notification mailbox.
- Add and test an operational lead-review interface or documented secure review process.
- Complete operator/privacy contact details in the legal drafts.
