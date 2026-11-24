/**
 * Single source for the proof metrics shown in the hero and the proof section.
 *
 * PLACEHOLDER: none of these figures are verified. Every `target` is 0 and every
 * `placeholder` is a zeroed template. A public launch is blocked until each one
 * is either replaced with a verifiable figure or removed — see the release gate
 * "Product and marketing claims" in the production mandate.
 */

export type MetricFormat = "compact-k" | "millions" | "percent";

export type ProofMetric = {
  id: string;
  label: string;
  /** Zeroed display string used by the hero before any figure is verified. */
  placeholder: string;
  target: number;
  format: MetricFormat;
};

export const PROOF_METRICS: readonly ProofMetric[] = [
  {
    id: "tests",
    label: "tests written autonomously",
    placeholder: "+00k",
    target: 0,
    format: "compact-k",
  },
  {
    id: "checks",
    label: "checks run",
    placeholder: "+0.0m",
    target: 0,
    format: "millions",
  },
  {
    id: "bugs",
    label: "bugs caught before release",
    placeholder: "+00%",
    target: 0,
    format: "percent",
  },
];

export function formatMetric(format: MetricFormat, value: number): string {
  switch (format) {
    case "compact-k":
      return `+${String(Math.round(value)).padStart(2, "0")}k`;
    case "millions":
      return `+${value.toFixed(1)}m`;
    case "percent":
      return `+${String(Math.round(value)).padStart(2, "0")}%`;
  }
}

/** Hero stat lookup by metric id, so the hero never restates a figure. */
export function heroStat(id: string): { value: string; label: string } {
  const metric = PROOF_METRICS.find((entry) => entry.id === id);
  if (!metric) throw new Error(`Unknown proof metric: ${id}`);
  return { value: metric.placeholder, label: metric.label };
}
