/**
 * Single source for every "book a demo" call to action.
 *
 * The destination can be set at build time with `VITE_BOOKING_URL`
 * (see `.env.example`). It accepts an absolute `https://` booking/scheduler
 * link or a `mailto:` link; anything else falls back rather than shipping a
 * broken or unsafe href.
 *
 * PLACEHOLDER: until a scheduler or workflo-owned alias exists, the fallback is
 * the maintainer address configured in this repository (git user.email), so the
 * CTA opens a real message to a real inbox instead of a dead `#book` anchor.
 */

export const BOOKING_EMAIL = "Kshitijtripathi87@gmail.com";

export const BOOKING_SUBJECT = "workflo demo request";

const FALLBACK_HREF = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(BOOKING_SUBJECT)}`;

const ALLOWED_PROTOCOL = /^(https?:\/\/|mailto:)/i;

// `import.meta.env` only exists under Vite, so read it through this guard when
// the module is imported directly (tests, tooling).
const env = import.meta.env as ImportMetaEnv | undefined;

if (env?.DEV) {
  const configured = env.VITE_BOOKING_URL?.trim();
  if (configured && !ALLOWED_PROTOCOL.test(configured)) {
    console.warn(
      `[booking] VITE_BOOKING_URL must start with https://, http:// or mailto:; ignoring "${configured}".`,
    );
  }
}

/**
 * Resolves the configured destination, falling back when it is missing or not
 * an absolute http(s)/mailto URL (for example a bare `cal.com/workflo`, which
 * would otherwise resolve relative to the current page).
 */
export function resolveBookingHref(configured: string | undefined): string {
  const candidate = configured?.trim();

  if (!candidate || !ALLOWED_PROTOCOL.test(candidate)) return FALLBACK_HREF;

  return candidate;
}

export const BOOKING_HREF = resolveBookingHref(env?.VITE_BOOKING_URL);
