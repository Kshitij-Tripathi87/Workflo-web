export type LifecycleRegion =
  | "context"
  | "environment"
  | "isolation"
  | "policy"
  | "activity"
  | "evidence"
  | "teardown"
  | "receipt";

export type LifecycleStage = {
  id: string;
  index: string;
  label: string;
  region: LifecycleRegion;
  phase: "Execute" | "Observe" | "Verify" | "Prove";
  summary: string;
  detail: string;
  readout: { k: string; v: string }[];
};

export const LIFECYCLE: LifecycleStage[] = [
  {
    id: "capture",
    index: "01",
    label: "Capture repository and revision",
    region: "context",
    phase: "Execute",
    summary: "Pin the exact commit the execution starts from.",
    detail:
      "Workflo records the repository, branch and commit for the run, so the execution is tied to a specific revision rather than a moving branch head.",
    readout: [
      { k: "input", v: "git reference" },
      { k: "recorded", v: "commit digest" },
      { k: "scope", v: "one revision" },
    ],
  },
  {
    id: "dependencies",
    index: "02",
    label: "Prepare dependencies",
    region: "environment",
    phase: "Execute",
    summary: "Resolve the dependency set declared by the repository.",
    detail:
      "Package manager, lockfile state and install strategy are part of the recorded execution context, so a run is not silently upgraded by a fresh install.",
    readout: [
      { k: "source", v: "lockfile" },
      { k: "install", v: "frozen" },
      { k: "cache", v: "declared" },
    ],
  },
  {
    id: "environment",
    index: "03",
    label: "Prepare execution environment",
    region: "environment",
    phase: "Execute",
    summary: "Build the runtime the execution will use.",
    detail:
      "Language toolchains, environment variables and mounted paths are established before the run. The environment is described as part of the receipt.",
    readout: [
      { k: "runtime", v: "declared" },
      { k: "secrets", v: "scoped" },
      { k: "mounts", v: "listed" },
    ],
  },
  {
    id: "isolation",
    index: "04",
    label: "Establish isolation",
    region: "isolation",
    phase: "Execute",
    summary: "Apply filesystem, process and network boundaries.",
    detail:
      "Isolation is set before the first command runs. The boundaries are configuration, not conventions: what the execution can read, spawn or reach is declared up front.",
    readout: [
      { k: "filesystem", v: "bounded" },
      { k: "network", v: "declared" },
      { k: "processes", v: "bounded" },
    ],
  },
  {
    id: "policy",
    index: "05",
    label: "Apply security policies",
    region: "policy",
    phase: "Execute",
    summary: "Attach and apply the execution's policy set.",
    detail:
      "A policy set describes what the execution is allowed to do and what must be recorded. Policy application is part of the execution record.",
    readout: [
      { k: "policy set", v: "attached" },
      { k: "evaluation", v: "recorded" },
      { k: "scope", v: "per execution" },
    ],
  },
  {
    id: "tests",
    index: "06",
    label: "Run tests",
    region: "activity",
    phase: "Observe",
    summary: "Execute the repository's test command.",
    detail:
      "Tests run inside the prepared, isolated environment. Results are recorded as part of the execution record, not as a standalone pass or fail signal.",
    readout: [
      { k: "command", v: "from config" },
      { k: "results", v: "recorded" },
      { k: "exit state", v: "captured" },
    ],
  },
  {
    id: "probes",
    index: "07",
    label: "Run application probes",
    region: "activity",
    phase: "Observe",
    summary: "Exercise declared endpoints or entry points.",
    detail:
      "When the repository describes how to start the application, Workflo can run probes against it and record the requests and responses it observed.",
    readout: [
      { k: "targets", v: "declared" },
      { k: "requests", v: "recorded" },
      { k: "responses", v: "recorded" },
    ],
  },
  {
    id: "inspect",
    index: "08",
    label: "Inspect application behavior",
    region: "activity",
    phase: "Observe",
    summary: "Agents or humans inspect observed behavior.",
    detail:
      "Inspection covers what the application did during the run: routes, rendered output and error states. Agents assist with inspection; they do not decide whether software is safe to release.",
    readout: [
      { k: "inspector", v: "agent or human" },
      { k: "surfaces", v: "routes, output" },
      { k: "activity", v: "recorded" },
    ],
  },
  {
    id: "apis",
    index: "09",
    label: "Inspect APIs and logs",
    region: "activity",
    phase: "Observe",
    summary: "Correlate API interactions and log output.",
    detail:
      "API calls and log lines are captured alongside test and probe activity, so the evidence for a run is correlated in one place rather than scattered across tools.",
    readout: [
      { k: "api calls", v: "captured" },
      { k: "logs", v: "captured" },
      { k: "timeline", v: "shared" },
    ],
  },
  {
    id: "record",
    index: "10",
    label: "Record execution activity",
    region: "evidence",
    phase: "Observe",
    summary: "Consolidate activity into an evidence ledger.",
    detail:
      "The observed activity is consolidated into a ledger describing the execution: context, actions, outcomes and the artifacts produced along the way.",
    readout: [
      { k: "ledger", v: "assembled" },
      { k: "artifacts", v: "listed" },
      { k: "scope", v: "one execution" },
    ],
  },
  {
    id: "teardown",
    index: "11",
    label: "Verify teardown",
    region: "teardown",
    phase: "Verify",
    summary: "Confirm the execution left nothing running.",
    detail:
      "Teardown verification checks that processes, mounts and temporary state created during the execution were removed. The result is recorded, including when it fails.",
    readout: [
      { k: "processes", v: "checked" },
      { k: "mounts", v: "checked" },
      { k: "result", v: "recorded" },
    ],
  },
  {
    id: "receipt",
    index: "12",
    label: "Produce signed execution receipt",
    region: "receipt",
    phase: "Prove",
    summary: "Sign the record so its integrity can be checked.",
    detail:
      "A receipt describes the execution context, the recorded activity and the teardown result. A signature protects the integrity of that record; it does not prove the software is correct.",
    readout: [
      { k: "receipt", v: "signed" },
      { k: "coverage", v: "this execution" },
      { k: "claim", v: "bounded" },
    ],
  },
];

export const LIFECYCLE_REGIONS: Record<LifecycleRegion, string> = {
  context: "Repository + revision",
  environment: "Environment",
  isolation: "Isolation boundary",
  policy: "Policy surface",
  activity: "Observed activity",
  evidence: "Evidence ledger",
  teardown: "Teardown record",
  receipt: "Execution receipt",
};
