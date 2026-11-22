import { ExecutionStep, HotspotItem } from "../types";

export const executionSteps: ExecutionStep[] = [
  { label: "Pinned source revision", note: "Commit and workspace snapshot" },
  { label: "Runtime preparation", note: "Dependencies and execution surface" },
  { label: "Isolation boundaries", note: "Configured filesystem and network policy" },
  { label: "Governed probes", note: "Actions evaluated against run policy" },
  { label: "Evidence collection", note: "Events and artifacts linked to the run" },
];

export const hotspotItems: HotspotItem[] = [
  {
    id: "01",
    title: "Source snapshot",
    text: "The exact revision and workspace being verified.",
  },
  {
    id: "02",
    title: "Filesystem boundary",
    text: "Access is scoped to the execution workspace and configured policy.",
  },
  {
    id: "03",
    title: "Network policy",
    text: "Network access follows the restrictions configured for the run.",
  },
  {
    id: "04",
    title: "Governed actions",
    text: "Agent actions are evaluated through the configured execution policy.",
  },
  {
    id: "05",
    title: "Evidence collection",
    text: "Execution events and artifacts are gathered for the run record.",
  },
];

export const capabilityRows: string[] = [
  "Pinned revision verification",
  "Isolated execution",
  "Governed agent activity",
  "Evidence integrity",
  "Verified teardown",
];

export const featureItems = [
  {
    index: "01",
    title: "Revision-aware verification",
    description: "Bind a run to the source revision and workspace snapshot selected for testing.",
    destination: "#run",
  },
  {
    index: "02",
    title: "Isolated run context",
    description: "Prepare a dedicated execution workspace and apply the policies configured for that run.",
    destination: "#architecture",
  },
  {
    index: "03",
    title: "Governed QA activity",
    description: "Structure test generation and investigation around an explicit execution policy.",
    destination: "#security",
  },
  {
    index: "04",
    title: "Evidence that travels",
    description: "Keep outcomes, run events and artifacts together for review and verification.",
    destination: "#evidence",
  },
];
