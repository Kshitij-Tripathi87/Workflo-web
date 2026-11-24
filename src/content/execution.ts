export type ConsoleLine = { k: string; v: string; state?: "ok" | "active" | "note" };

export type ConsoleTab = {
  id: string;
  label: string;
  caption: string;
  lines: ConsoleLine[];
};

export const CONSOLE_TABS: ConsoleTab[] = [
  {
    id: "context",
    label: "Repository",
    caption: "The execution is tied to one revision, recorded before anything runs.",
    lines: [
      { k: "repository", v: "example/atlas-service" },
      { k: "revision", v: "a7f3c91" },
      { k: "branch", v: "main" },
      { k: "input", v: "git reference" },
    ],
  },
  {
    id: "environment",
    label: "Environment",
    caption: "Toolchain and dependency state are declared, not inherited.",
    lines: [
      { k: "runtime", v: "node 22 · debian 12" },
      { k: "lockfile", v: "pnpm-lock.yaml" },
      { k: "install", v: "frozen", state: "ok" },
      { k: "cache", v: "cold" },
    ],
  },
  {
    id: "isolation",
    label: "Isolation",
    caption: "Filesystem, process and network limits are applied before execution.",
    lines: [
      { k: "filesystem", v: "read-only · /tmp writable" },
      { k: "network", v: "deny by default", state: "ok" },
      { k: "processes", v: "bounded" },
      { k: "policy set", v: "default-ci", state: "active" },
    ],
  },
  {
    id: "activity",
    label: "Activity",
    caption: "Tests, probes, agent inspection and logs are recorded together.",
    lines: [
      { k: "tests", v: "147 passed · 3 skipped" },
      { k: "probes", v: "GET /api/health · 200" },
      { k: "agent", v: "4 routes inspected", state: "active" },
      { k: "logs", v: "12,412 lines captured" },
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    caption: "Observed activity consolidates into a ledger and a receipt.",
    lines: [
      { k: "ledger", v: "sealed", state: "ok" },
      { k: "teardown", v: "verified", state: "ok" },
      { k: "receipt", v: "signed", state: "ok" },
      { k: "scope", v: "this execution only" },
    ],
  },
  {
    id: "teardown",
    label: "Teardown",
    caption: "Teardown is verified, and a failed check is recorded like any other result.",
    lines: [
      { k: "processes", v: "0 remaining" },
      { k: "mounts", v: "3 removed" },
      { k: "temp state", v: "cleared" },
      { k: "verification", v: "passed", state: "ok" },
    ],
  },
];

export const CONSOLE_NOTE =
  "Illustrative interface. Labels, counts and digests show the shape of an execution record; they are not output from a running system.";
