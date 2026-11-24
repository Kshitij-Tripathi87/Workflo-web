/**
 * The cinematic track's phase model, ported from the Workflo Motion Engine Kit.
 *
 * The kit drives these ranges into an R3F scroll proxy for a WebGL scene. The
 * homepage is image-only now, so the ranges live here instead: every GSAP
 * timeline position and every plate transition derives from this table rather
 * than from scattered magic numbers.
 */

export const CINEMATIC_PHASES = [
  "execute",
  "observe",
  "verify",
  "prove",
  "trust",
] as const;

export type CinematicPhase = (typeof CINEMATIC_PHASES)[number];

/** Normalized scroll position where each phase begins. Art-directed, unequal. */
export const PHASE_STARTS = {
  execute: 0,
  observe: 0.08,
  verify: 0.3,
  prove: 0.45,
  trust: 0.65,
} as const;

/** Normalized end of the final phase. */
export const PHASE_END = 1;

export const PHASE_COUNT = CINEMATIC_PHASES.length;

/**
 * Plates swap slightly before the phase label, so the image leads the words
 * instead of changing on the same frame the type moves.
 */
export const PLATE_LEAD = 0.01;

const STARTS: readonly number[] = CINEMATIC_PHASES.map((phase) => PHASE_STARTS[phase]);

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Index of the phase that contains `progress`. Always in [0, PHASE_COUNT - 1]. */
export function phaseIndexAt(progress: number): number {
  const value = clamp01(progress);
  let index = 0;
  for (let i = 0; i < STARTS.length; i += 1) {
    if (value >= STARTS[i]) index = i;
  }
  return index;
}

/** Progress inside the active phase, always in [0, 1]. */
export function phaseProgressAt(progress: number): number {
  const value = clamp01(progress);
  if (value >= PHASE_END) return 1;

  const index = phaseIndexAt(value);
  const start = STARTS[index];
  const end = index + 1 < STARTS.length ? STARTS[index + 1] : PHASE_END;
  if (end <= start) return 1;

  return clamp01((value - start) / (end - start));
}

/** Scroll position where plate `index` begins fading in over the previous one. */
export function plateCutAt(index: number): number {
  const clamped = Math.max(0, Math.min(STARTS.length - 1, Math.floor(index)));
  return clamp01(STARTS[clamped] - PLATE_LEAD);
}
