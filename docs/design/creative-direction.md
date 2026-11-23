# Workflo — creative direction

## Reference skills

- [Taste Skill](https://github.com/Leonxlnx/taste-skill) — art direction, page hierarchy, copy discipline, typography and layout.
- [LottieFiles Motion Design Skill](https://github.com/LottieFiles/motion-design-skill) — motion choreography, easing, timing and reduced-motion quality checks.

Both repositories were cloned and reviewed before implementation. This document records the applied decisions.

## Visual system

**Page type:** software / developer tool.

**Palette:** blue-black-cornflower. Near-black keeps the engineering product focused; a single cornflower accent marks actions and technical metadata without competing with the photographs.

**Typography:** Host Grotesk for display and body; JetBrains Mono for technical metadata. Both are loaded from Google Fonts. A self-hosted font package can replace this external request when the deployment asset pipeline is finalised.

**Composition:** one dominant photograph per section, with a clear role:
- Hero — pod.webp
- Run process — portal.webp
- Evidence — hero-chamber.webp
- Execution boundaries — path.webp
- Early access — hall.webp

No decorative image captions, duplicated image layers, floating panels, gradient backgrounds or equal-card grids.

## Page architecture

1. Hero — one clear software-verification statement, one concise lead, one primary action and one secondary text action.
2. Run — three ordered steps tied to a single image.
3. Evidence — a clearly illustrative receipt that shows what the run record connects.
4. Execution boundaries — the configured runtime controls and teardown checks.
5. Early access — one application form.

Copy stays specific to the product. No invented metrics, customer logos, performance claims or guarantees beyond the documented run configuration. Each section has one job; lifecycle explanations are not repeated.

## Motion system

**Personality:** premium, deliberate and restrained.

- Easing: cubic-bezier(0.4, 0, 0.2, 1).
- Durations: 150ms, 420ms and 760ms.
- Hero: one grouped copy entrance paired with one photograph entrance.
- Evidence: one receipt-card reveal when it enters view.
- Interaction: small button, navigation and photograph hover feedback.
- No scroll hijacking, pinned camera choreography or continuous ambient movement.
- Reduced-motion mode removes entrance animation and immediately exposes all content.

## Quality checks

- Production Vite build and TypeScript typecheck.
- Playwright desktop, tablet and mobile checks at 1440, 1024, 820, 768 and 390 px.
- No horizontal overflow at the tested widths.
- All five photographs load.
- No browser runtime or console errors.
- Mobile navigation opens and closes after selection.
- Consent persists after reload; footer privacy control reopens it.
- Reduced-motion mode disables the reveal animations and keeps content visible.
