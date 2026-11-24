# Workflo — release with proof

Marketing site for Workflo. A single scrolling page built from five photographic plates: the hero is image-only (no 3D scene, no particle or shape canvas), typography and motion carry the story, and every section sits on a photograph.

## Stack

| Layer | Implementation |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Motion | GSAP + ScrollTrigger, Lenis driven from `gsap.ticker` |
| Type | Readex Pro (display), Archivo (body), IBM Plex Mono (metadata) |
| Assets | WebP plates in `public/images/`, 1600 × 900 native plus 2560/3840 derivatives |

Motion is transform/opacity only and honours `prefers-reduced-motion`. The phase model in `src/landing/motion/phases.ts` is the single source of hero timing.

## Local development

```bash
npm install
npm run dev       # http://127.0.0.1:5178
npm run typecheck
npm run build     # typecheck + production build into dist/
```

Unit tests for the phase model and booking-destination resolution run on Bun:

```bash
bun test
```

## Booking destination

Every "book a demo" CTA reads from `src/content/booking.ts`. Set `VITE_BOOKING_URL` (copy `.env.example` to `.env`) to an absolute `https://` scheduler link or a `mailto:` link; invalid values fall back instead of shipping a broken href. With no value configured the CTA opens a message to the maintainer address — a placeholder, not a workflo-owned inbox.

## Content status

Copy follows the "release with proof" direction: lowercase, no exclamation marks, no invented customers, logos or metrics. Proof figures in `src/content/landing.ts` are named `PLACEHOLDER` constants and are currently zero; replace them with verified figures before launch. Legal pages, the production domain, canonical/sitemap/robots and security headers are not present yet.

## Backend and infrastructure

`backend/` and `infra/` contain the separate lead-capture API and AWS CDK stacks (API Gateway, Lambda, DynamoDB, SES, CloudFront). They are independent of this frontend; see [ARCHITECTURE.md](ARCHITECTURE.md), [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) and [RUNBOOK.md](RUNBOOK.md).
