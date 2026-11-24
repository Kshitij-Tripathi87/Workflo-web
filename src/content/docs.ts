export type DocBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; title: string; lines: string[]; note?: string };

export type DocSection = {
  id: string;
  title: string;
  group: "Start" | "Concepts" | "Operation" | "Reference";
  summary: string;
  blocks: DocBlock[];
};

export const DOC_GROUPS = ["Start", "Concepts", "Operation", "Reference"] as const;

export const DOCS: DocSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    group: "Start",
    summary: "What Workflo is, and what it deliberately is not.",
    blocks: [
      {
        type: "p",
        text: "Workflo runs software in a controlled environment, records what happens during the execution, and produces a signed receipt describing the run.",
      },
      {
        type: "p",
        text: "It is not an autonomous QA product, a test-generation tool, a coding assistant, or a replacement for CI or a human release decision. Agents can inspect application behaviour during an execution, but the product is the record of what happened.",
      },
      {
        type: "list",
        items: [
          "A declared context: repository, revision, dependencies, runtime and isolation policy.",
          "Recorded activity: tests, probes, API interactions, logs and agent inspection.",
          "A verified teardown result and a signed execution receipt.",
        ],
      },
      {
        type: "p",
        text: "Nothing in this documentation describes a public release. Commands, configuration keys and outputs are illustrative until the CLI is published.",
      },
    ],
  },
  {
    id: "installation",
    title: "Installation",
    group: "Start",
    summary: "How the CLI is intended to be installed.",
    blocks: [
      {
        type: "p",
        text: "Workflo is distributed as a CLI that runs inside the environment you control. Installation is not public yet; the commands below show the intended shape only.",
      },
      {
        type: "code",
        title: "install",
        lines: ["# illustrative — not a published package", "npm install -g workflo", "workflo --version"],
        note: "Package name, flags and output are placeholders.",
      },
      {
        type: "p",
        text: "A hosted platform is in early access. The CLI is designed to work without requiring hosted inference, and source code is not sent through the Workflo inference pathway.",
      },
    ],
  },
  {
    id: "quickstart",
    title: "Quickstart",
    group: "Start",
    summary: "The four commands that describe a run end to end.",
    blocks: [
      {
        type: "p",
        text: "A first execution moves through four steps: declare the environment, run it, inspect what was recorded, and read the receipt.",
      },
      {
        type: "code",
        title: "first execution",
        lines: ["workflo init", "workflo run", "workflo inspect", "workflo receipt"],
        note: "Illustrative command surface. Syntax is not final.",
      },
      {
        type: "list",
        items: [
          "init writes the configuration file that describes the execution context.",
          "run prepares dependencies, applies isolation and policy, then executes.",
          "inspect opens the recorded activity for the execution.",
          "receipt prints the signed record for the execution.",
        ],
      },
    ],
  },
  {
    id: "lifecycle",
    title: "Execution lifecycle",
    group: "Concepts",
    summary: "The twelve stages of a controlled execution.",
    blocks: [
      {
        type: "p",
        text: "Every execution follows the same order. The order matters more than the stage names: isolation and policy are established before code runs, and teardown is checked before a receipt is produced.",
      },
      {
        type: "list",
        items: [
          "Capture repository and revision.",
          "Prepare dependencies.",
          "Prepare the execution environment.",
          "Establish isolation.",
          "Apply security policies.",
          "Run tests.",
          "Run application probes.",
          "Inspect application behaviour.",
          "Inspect APIs and logs.",
          "Record execution activity.",
          "Verify teardown.",
          "Produce the signed execution receipt.",
        ],
      },
      {
        type: "p",
        text: "A stage can fail. When it does, the failure is part of the record, not something the receipt hides.",
      },
    ],
  },
  {
    id: "architecture",
    title: "Execution architecture",
    group: "Concepts",
    summary: "Environment, isolation, policy, capture and receipts.",
    blocks: [
      {
        type: "list",
        items: [
          "Execution environment: toolchains, environment variables and mounted paths are declared for the run rather than borrowed from the host.",
          "Isolation model: filesystem, process and network boundaries are applied before the first command.",
          "Policy model: a policy set is attached to an execution and its application is recorded.",
          "Activity capture: test results, probes, API interactions, logs and inspection activity are recorded into one ledger.",
          "Agent pathway: agents inspect observable behaviour during the run and their activity is recorded like any other activity.",
          "Receipt generation: the record is described and signed so its integrity can be checked later.",
          "Teardown verification: processes, mounts and temporary state are checked and the result is recorded.",
          "Local-first privacy: the CLI can operate without sending source code to hosted inference.",
        ],
      },
      {
        type: "p",
        text: "This page describes the model, not internal implementation. Details that are not public are not described here.",
      },
    ],
  },
  {
    id: "security",
    title: "Security and isolation",
    group: "Concepts",
    summary: "What the boundaries are, and what they cannot claim.",
    blocks: [
      {
        type: "p",
        text: "Isolation is configuration applied before execution: filesystem access, process creation and network reach are bounded for the run. Policies describe what the execution may do and what must be recorded.",
      },
      {
        type: "list",
        items: [
          "Teardown is verified, including when verification fails.",
          "Evidence is recorded as it is produced, with the execution context attached.",
          "Receipt signatures protect the integrity of the record.",
          "Source code is not sent to hosted inference through the Workflo inference pathway.",
        ],
      },
      {
        type: "p",
        text: "No system provides absolute security. Workflo does not claim to guarantee protection from every risk, and a signed receipt does not prove that software is correct.",
      },
    ],
  },
  {
    id: "agents",
    title: "Agent inspection",
    group: "Concepts",
    summary: "Where agents help, and where humans remain responsible.",
    blocks: [
      {
        type: "p",
        text: "Agents can inspect application behaviour, APIs and logs during a controlled execution. Their activity becomes part of the execution record.",
      },
      {
        type: "list",
        items: [
          "Agents assist with inspection; they do not decide whether software is safe to release.",
          "Inspection is bounded by the same isolation and policy as the execution.",
          "Recorded activity is evidence about what was observed, not a guarantee of correctness.",
          "Humans remain responsible for interpretation and release decisions.",
        ],
      },
    ],
  },
  {
    id: "evidence",
    title: "Evidence and receipts",
    group: "Concepts",
    summary: "What a receipt records, and what it does not prove.",
    blocks: [
      {
        type: "p",
        text: "A receipt describes one execution: the context it started from, the activity that was recorded, and the result of teardown verification. It is signed so the record's integrity can be checked after the fact.",
      },
      {
        type: "list",
        items: [
          "A record of the execution context.",
          "Evidence of observed activity during the run.",
          "A record of teardown verification.",
          "A cryptographically signed artifact.",
          "An inspectable result — not a guarantee of software correctness.",
        ],
      },
      {
        type: "p",
        text: "Field names and digest formats shown anywhere on this site are illustrative. The receipt format is not final.",
      },
    ],
  },
  {
    id: "teardown",
    title: "Teardown verification",
    group: "Concepts",
    summary: "Why a run is not complete when the command exits.",
    blocks: [
      {
        type: "p",
        text: "An execution can finish and still leave processes, mounts or temporary state behind. Teardown verification checks those explicitly and records the result.",
      },
      {
        type: "list",
        items: [
          "Processes started by the execution are checked.",
          "Mounts and temporary paths are checked.",
          "The verification result is recorded, including failures.",
        ],
      },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    group: "Operation",
    summary: "The shape of an execution definition.",
    blocks: [
      {
        type: "p",
        text: "An execution is described by a file committed with the repository. The example below shows the shape of that description; keys are not final.",
      },
      {
        type: "code",
        title: "illustrative configuration",
        lines: [
          "# illustrative shape — keys are not final",
          "execution:",
          "  repository: example/atlas-service",
          "  revision: main",
          "  test_command: pnpm test",
          "  probes:",
          "    - GET /api/health",
          "isolation:",
          "  network: deny",
          "  filesystem: read-only",
        ],
        note: "Illustrative only.",
      },
    ],
  },
  {
    id: "cli",
    title: "CLI reference",
    group: "Operation",
    summary: "The four commands the interface is built around.",
    blocks: [
      {
        type: "list",
        items: [
          "workflo init — write the execution definition for a repository.",
          "workflo run — prepare, isolate, execute and record.",
          "workflo inspect — open the recorded activity for an execution.",
          "workflo receipt — print the signed receipt for an execution.",
        ],
      },
      {
        type: "p",
        text: "The CLI is not published. Flags, output and exit codes will be documented here when they are stable.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    group: "Operation",
    summary: "The failure classes the record is designed to make visible.",
    blocks: [
      {
        type: "list",
        items: [
          "Execution failed before tests: check dependency preparation and environment declaration.",
          "Probes could not reach the application: check how the application is started and which port it binds.",
          "Teardown verification failed: check for background processes the execution started.",
          "Receipt verification failed: check that the record was not modified after it was signed.",
        ],
      },
      {
        type: "p",
        text: "Because activity is recorded per execution, a failure should be diagnosable from the record rather than by reproducing the environment by hand.",
      },
    ],
  },
  {
    id: "examples",
    title: "Examples",
    group: "Operation",
    summary: "Two workflows the execution model is designed for.",
    blocks: [
      {
        type: "p",
        text: "Verify a service change before merge: run an execution on the pull request revision, inspect tests, probes and agent inspection, and attach the receipt to the review.",
      },
      {
        type: "p",
        text: "Attach evidence to a release: run the execution on the release commit and keep the receipt alongside the artifact, so the release record points at what was observed.",
      },
      {
        type: "p",
        text: "Neither example implies that a passing receipt makes a release safe. The receipt describes the execution; release decisions stay with people.",
      },
    ],
  },
  {
    id: "api",
    title: "API reference",
    group: "Reference",
    summary: "No public API is available.",
    blocks: [
      {
        type: "p",
        text: "There is no published API. Endpoints, authentication and payloads will be documented when a public API exists; this page will not describe an interface that cannot be used.",
      },
    ],
  },
  {
    id: "release-status",
    title: "Release status",
    group: "Reference",
    summary: "What has shipped, and what has not.",
    blocks: [
      {
        type: "p",
        text: "No public release has shipped. The CLI, hosted platform and receipt format are in development, and integration availability is listed on the integrations page with explicit status labels.",
      },
      {
        type: "p",
        text: "The changelog tracks what has actually shipped separately from what is experimental or planned.",
      },
    ],
  },
];
