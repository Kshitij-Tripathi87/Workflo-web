import type { PhaseId } from "./phases";

/**
 * Camera choreography for the pinned hero. Each phase is one photograph with a
 * single, deliberate camera move — no two plates are ever composited on top of
 * one another. Values are in CSS percentages/degrees.
 */
export type CameraPose = {
  scale: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  rz: number;
};

export type Shot = {
  /** object-position for the still, chosen per plate so the subject sits in frame */
  position: string;
  from: CameraPose;
  to: CameraPose;
};

export const SHOTS: Record<PhaseId, Shot> = {
  execute: {
    position: "68% 50%",
    from: { scale: 1.4, x: 5, y: 3.5, rx: 7, ry: -9, rz: -0.6 },
    to: { scale: 1.05, x: 0, y: -0.5, rx: 0, ry: 0, rz: 0 },
  },
  observe: {
    position: "56% 50%",
    from: { scale: 1.3, x: -8, y: 1.5, rx: 1, ry: 10, rz: 0.5 },
    to: { scale: 1.05, x: 5, y: -2, rx: -1, ry: 1.5, rz: 0 },
  },
  verify: {
    position: "58% 50%",
    from: { scale: 1.28, x: 2.5, y: 8, rx: -9, ry: 2, rz: -1 },
    to: { scale: 1.12, x: -3, y: -6, rx: 5, ry: -3.5, rz: 0.6 },
  },
  prove: {
    position: "70% 50%",
    from: { scale: 1.44, x: -1, y: 2.5, rx: 3, ry: -7, rz: 0 },
    to: { scale: 1.04, x: 1.5, y: 0, rx: 0, ry: 5, rz: 0 },
  },
  trust: {
    position: "66% 50%",
    from: { scale: 1.26, x: 3.5, y: -4.5, rx: 2, ry: 3.5, rz: -1.4 },
    to: { scale: 1.06, x: 0, y: 1.5, rx: 0, ry: 0, rz: 0 },
  },
};

export function smoothstep(value: number) {
  const t = Math.min(Math.max(value, 0), 1);
  return t * t * (3 - 2 * t);
}

export function lerpPose(from: CameraPose, to: CameraPose, t: number): CameraPose {
  return {
    scale: from.scale + (to.scale - from.scale) * t,
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    rx: from.rx + (to.rx - from.rx) * t,
    ry: from.ry + (to.ry - from.ry) * t,
    rz: from.rz + (to.rz - from.rz) * t,
  };
}

/** Portion of each phase that holds the frame steady before the next wipe. */
export const HOLD = 0.62;
