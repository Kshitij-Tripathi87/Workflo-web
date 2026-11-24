export type PhaseId = "execute" | "observe" | "verify" | "prove" | "trust";

export type PhaseConfig = {
  id: PhaseId;
  index: string;
  word: string;
  intent: string;
  title: string;
  body: string;
  start: number;
  end: number;
  camera: { z: number; y: number };
  chamber: { spread: number; trace: number; boundary: number };
};

export const PHASES: PhaseConfig[] = [
  {
    id: "execute",
    index: "01",
    word: "EXECUTE",
    intent: "Controlled execution begins",
    title: "The environment is declared before anything runs.",
    body: "Repository, revision, dependencies and policy are fixed before the first command runs.",
    start: 0,
    end: 0.2,
    camera: { z: 7.4, y: 0 },
    chamber: { spread: 1, trace: 0.35, boundary: 0.55 },
  },
  {
    id: "observe",
    index: "02",
    word: "OBSERVE",
    intent: "Activity becomes visible",
    title: "Tests, probes and agent inspection leave a trail.",
    body: "Tests, probes, API calls, logs and agent inspection are recorded as they happen.",
    start: 0.2,
    end: 0.4,
    camera: { z: 6.4, y: 0.15 },
    chamber: { spread: 0.95, trace: 1, boundary: 0.7 },
  },
  {
    id: "verify",
    index: "03",
    word: "VERIFY",
    intent: "Boundaries and checks are evaluated",
    title: "Isolation is checked, not assumed.",
    body: "Isolation and policy are checked against recorded activity. Teardown is verified.",
    start: 0.4,
    end: 0.6,
    camera: { z: 6.9, y: -0.1 },
    chamber: { spread: 0.9, trace: 0.72, boundary: 1 },
  },
  {
    id: "prove",
    index: "04",
    word: "PROVE",
    intent: "Evidence consolidates",
    title: "Activity becomes an inspectable record.",
    body: "Activity consolidates into one ledger and a signed receipt describing the run.",
    start: 0.6,
    end: 0.8,
    camera: { z: 5.9, y: 0.22 },
    chamber: { spread: 0.84, trace: 0.5, boundary: 0.85 },
  },
  {
    id: "trust",
    index: "05",
    word: "TRUST",
    intent: "A stable, inspectable state",
    title: "Know what ran. Know what happened.",
    body: "The record resolves into something you can inspect — not a promise the code is correct.",
    start: 0.8,
    end: 1,
    camera: { z: 6.5, y: 0 },
    chamber: { spread: 0.88, trace: 0.28, boundary: 0.6 },
  },
];

export function phaseIndexAt(progress: number) {
  const p = Math.min(Math.max(progress, 0), 1);
  let index = 0;
  for (let i = 0; i < PHASES.length; i += 1) {
    if (p >= PHASES[i].start) index = i;
  }
  return index;
}

export function samplePhase(progress: number) {
  const p = Math.min(Math.max(progress, 0), 1);
  const index = phaseIndexAt(p);
  const current = PHASES[index];
  const next = PHASES[Math.min(index + 1, PHASES.length - 1)];
  const span = Math.max(current.end - current.start, 0.0001);
  const t = Math.min(Math.max((p - current.start) / span, 0), 1);
  return { index, current, next, t };
}
