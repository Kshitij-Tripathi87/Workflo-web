/**
 * Single mutable source of scroll progress for the pinned stage.
 * React state is reserved for phase changes; per-frame scene work reads this value.
 */
export const stage = { progress: 0 };

export function damp(current: number, target: number, lambda: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * Math.min(delta, 0.05)));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
