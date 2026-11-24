export type ChangeState = "shipped" | "experimental" | "planned";

export type ChangeEntry = {
  id: string;
  title: string;
  summary: string;
  state: ChangeState;
};

export const CHANGELOG: ChangeEntry[] = [
  {
    id: "execution-environments",
    title: "Controlled execution environments",
    summary: "Declared repository, revision, dependencies and runtime for a single run.",
    state: "planned",
  },
  {
    id: "isolation-policy",
    title: "Isolation and policy application",
    summary: "Filesystem, process and network boundaries applied before the first command.",
    state: "planned",
  },
  {
    id: "activity-ledger",
    title: "Execution activity ledger",
    summary: "Tests, probes, API interactions, logs and agent inspection recorded together.",
    state: "planned",
  },
  {
    id: "signed-receipt",
    title: "Signed execution receipts",
    summary: "A signed record of the context, activity and teardown result for one execution.",
    state: "planned",
  },
  {
    id: "teardown-verification",
    title: "Teardown verification",
    summary: "Explicit checks for leftover processes, mounts and temporary state.",
    state: "planned",
  },
  {
    id: "hosted-platform",
    title: "Hosted platform",
    summary: "A managed workspace for running and reviewing executions. Early access only.",
    state: "planned",
  },
];
