import { describe, expect, test } from "bun:test";
import {
  CINEMATIC_PHASES,
  PHASE_END,
  PHASE_STARTS,
  clamp01,
  phaseIndexAt,
  phaseProgressAt,
  plateCutAt,
} from "./phases";

describe("clamp01", () => {
  test("clamps outside the unit range and rejects non-finite input", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(9)).toBe(1);
    expect(clamp01(Number.NaN)).toBe(0);
  });
});

describe("phase boundaries", () => {
  test("every phase starts exactly at its bound", () => {
    CINEMATIC_PHASES.forEach((phase, index) => {
      expect(phaseIndexAt(PHASE_STARTS[phase])).toBe(index);
      expect(phaseProgressAt(PHASE_STARTS[phase])).toBe(0);
    });
  });

  test("a hair before each bound still belongs to the previous phase", () => {
    CINEMATIC_PHASES.slice(1).forEach((phase, offset) => {
      const epsilon = PHASE_STARTS[phase] - 1e-6;
      expect(phaseIndexAt(epsilon)).toBe(offset);
      expect(phaseProgressAt(epsilon)).toBeGreaterThan(0.999);
    });
  });

  test("progress inside a phase is measured against that phase's span", () => {
    const midpoint = (PHASE_STARTS.verify + PHASE_STARTS.prove) / 2;
    expect(phaseIndexAt(midpoint)).toBe(2);
    expect(phaseProgressAt(midpoint)).toBeCloseTo(0.5, 6);
  });

  test("end of track pins to the final phase at full progress", () => {
    expect(phaseIndexAt(PHASE_END)).toBe(CINEMATIC_PHASES.length - 1);
    expect(phaseProgressAt(PHASE_END)).toBe(1);
    expect(phaseProgressAt(1.4)).toBe(1);
  });
});

describe("monotonicity", () => {
  test("phase index never moves backwards across the track", () => {
    let previous = 0;
    for (let step = 0; step <= 1000; step += 1) {
      const index = phaseIndexAt(step / 1000);
      expect(index).toBeGreaterThanOrEqual(previous);
      previous = index;
    }
    expect(previous).toBe(CINEMATIC_PHASES.length - 1);
  });

  test("phase progress stays in the unit range", () => {
    for (let step = 0; step <= 1000; step += 1) {
      const phaseProgress = phaseProgressAt(step / 1000);
      expect(phaseProgress).toBeGreaterThanOrEqual(0);
      expect(phaseProgress).toBeLessThanOrEqual(1);
    }
  });
});

describe("plate cuts", () => {
  test("each plate leads its phase and keeps a positive fade window", () => {
    for (let index = 1; index < CINEMATIC_PHASES.length; index += 1) {
      const phase = CINEMATIC_PHASES[index];
      const cut = plateCutAt(index);
      expect(cut).toBeLessThan(PHASE_STARTS[phase]);
      expect(PHASE_STARTS[phase] - cut).toBeCloseTo(0.01, 6);
      expect(cut).toBeGreaterThanOrEqual(0);
    }
  });

  test("cuts are strictly increasing and stay inside the track", () => {
    const cuts = CINEMATIC_PHASES.slice(1).map((_, offset) => plateCutAt(offset + 1));
    for (let index = 1; index < cuts.length; index += 1) {
      expect(cuts[index]).toBeGreaterThan(cuts[index - 1]);
    }
    expect(cuts[cuts.length - 1]).toBeLessThan(1);
  });

  test("out-of-range indices clamp to a real cut", () => {
    expect(plateCutAt(-4)).toBe(plateCutAt(0));
    expect(plateCutAt(99)).toBe(plateCutAt(CINEMATIC_PHASES.length - 1));
  });
});
