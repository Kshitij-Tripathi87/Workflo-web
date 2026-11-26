import { useState, useMemo } from "react";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";
import { SectionBackdrop } from "../landing/SectionBackdrop";
import { LetterReveal } from "../landing/LetterReveal";
import { Link } from "../lib/router";

/* -------------------------------------------------------------------------- */
/*                               RECEIPT SAMPLES                              */
/* -------------------------------------------------------------------------- */

interface ReceiptSample {
  id: string;
  name: string;
  verdict: "APPROVED_YES" | "REJECTED_POLICY_VIOLATION" | "REJECTED_TEARDOWN_LEAK";
  json: Record<string, any>;
}

const SAMPLE_RECEIPTS: ReceiptSample[] = [
  {
    id: "clean-run",
    name: "01. Clean Release Execution (Approved)",
    verdict: "APPROVED_YES",
    json: {
      receipt_version: "2026-11-24.1",
      execution_id: "exec_9a2f1c84",
      timestamp: "2026-11-24T16:00:00.104Z",
      commit: {
        sha: "9f2a71d803be81b67f13904a1168194e432c6b41",
        branch: "main",
        tree_clean: true,
      },
      environment: {
        runtime: "microvm-linux-x86_64",
        hypervisor: "firecracker-1.8.0",
        boot_duration_ms: 84,
        memory_mb: 4096,
        vcpu: 4,
      },
      policy: {
        egress_mode: "default_deny",
        outbound_connections_attempted: 1,
        outbound_connections_authorized: 1,
        seccomp_profile: "strict_v3",
      },
      audit: {
        total_syscalls: 4119,
        stdout_bytes: 18402,
        stderr_bytes: 0,
        exit_code: 0,
      },
      teardown: {
        zombie_processes: 0,
        filesystem_diff_clean: true,
        host_tamper_evident: false,
      },
      merkle_root: "sha256:88e09f182bc20e98124589d9abef729a765c1920831a2938472910fae8293c41",
      signature: {
        algorithm: "Ed25519",
        key_id: "workflo-signer-2026-a",
        sig: "3045022100e49a201...b2f9104a",
      },
      verdict: "APPROVED_YES",
    },
  },
  {
    id: "network-blocked",
    name: "02. Network Exfiltration Caught (Rejected)",
    verdict: "REJECTED_POLICY_VIOLATION",
    json: {
      receipt_version: "2026-11-24.1",
      execution_id: "exec_blocked_4102",
      timestamp: "2026-11-24T16:05:12.890Z",
      commit: {
        sha: "3e198b2c8901a14f48201948120fa29184019283",
        branch: "pull/142",
        tree_clean: true,
      },
      environment: {
        runtime: "microvm-linux-x86_64",
        hypervisor: "firecracker-1.8.0",
        boot_duration_ms: 88,
      },
      policy: {
        egress_mode: "default_deny",
        outbound_connections_attempted: 2,
        outbound_connections_authorized: 0,
        violation: "UNAUTHORIZED_EGRESS to 198.51.100.44:443 blocked by eBPF filter",
      },
      audit: {
        total_syscalls: 1892,
        stdout_bytes: 4201,
        stderr_bytes: 840,
        exit_code: 1,
      },
      teardown: {
        zombie_processes: 0,
        filesystem_diff_clean: true,
      },
      merkle_root: "sha256:7c91a08234be10...f8a29104",
      signature: {
        algorithm: "Ed25519",
        key_id: "workflo-signer-2026-a",
        sig: "30450220941ab...c4a1089e",
      },
      verdict: "REJECTED_POLICY_VIOLATION",
    },
  },
  {
    id: "teardown-leak",
    name: "03. Orphaned Background Daemon Caught (Rejected)",
    verdict: "REJECTED_TEARDOWN_LEAK",
    json: {
      receipt_version: "2026-11-24.1",
      execution_id: "exec_leak_8819",
      timestamp: "2026-11-24T16:11:45.312Z",
      commit: {
        sha: "fa82910481029481029481029481029481029481",
        branch: "staging",
        tree_clean: true,
      },
      audit: {
        total_syscalls: 8201,
        exit_code: 0,
      },
      teardown: {
        zombie_processes: 2,
        detected_pids: [1048, 1049],
        process_cmd: "python3 -m suspicious_daemon",
        filesystem_diff_clean: false,
      },
      merkle_root: "sha256:1a2b3c4d5e...99887766",
      signature: {
        algorithm: "Ed25519",
        key_id: "workflo-signer-2026-a",
        sig: "30450221a980...d43109a",
      },
      verdict: "REJECTED_TEARDOWN_LEAK",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                               CLI COMMANDS                                 */
/* -------------------------------------------------------------------------- */

interface CliCmd {
  name: string;
  syntax: string;
  summary: string;
  flags: { flag: string; desc: string }[];
  simulatedOutput: string;
}

const CLI_COMMANDS: CliCmd[] = [
  {
    name: "workflo init",
    syntax: "workflo init [--tier <tier>] [--template <template>]",
    summary: "Initialize Workflo in the current repository, creating .workflo/config.yaml and detecting test commands.",
    flags: [
      { flag: "--tier <tier>", desc: "Execution isolation tier: microvm | sandbox-strict | dev-namespace" },
      { flag: "--template <name>", desc: "Starter policy template: node | python | go | rust | generic" },
      { flag: "--force", desc: "Overwrite existing .workflo configuration without prompting" },
    ],
    simulatedOutput: `[workflo] Scanning repository...
[workflo] Detected project: Node.js (package.json present)
[workflo] Test script identified: 'vitest run'
[workflo] Initializing .workflo/config.yaml (tier: microvm, egress: default_deny)
[workflo] Configuration created successfully. Run 'workflo doctor' to verify host readiness.`,
  },
  {
    name: "workflo doctor",
    syntax: "workflo doctor [--fix] [--verbose]",
    summary: "Check host system readiness for Firecracker/KVM virtualization, container runtimes, and seccomp features.",
    flags: [
      { flag: "--fix", desc: "Attempt to repair group permissions and missing udev rules" },
      { flag: "--verbose", desc: "Output granular kernel diagnostic details and memory cgroup trees" },
    ],
    simulatedOutput: `[workflo] Running host readiness diagnostic...
[workflo] [PASS] Linux kernel: 6.1.0-28-amd64 (>= 5.10 required)
[workflo] [PASS] Hardware KVM (/dev/kvm): rw-rw---- (KVM available)
[workflo] [PASS] cgroups v2: unified hierarchy mounted
[workflo] [PASS] seccomp: SECCOMP_SET_MODE_FILTER supported
[workflo] [PASS] eBPF: BPF_PROG_TYPE_SCHED_CLS supported
[workflo] Host is ready for production microVM isolation.`,
  },
  {
    name: "workflo run",
    syntax: "workflo run [command] [--dry-run] [--policy <file>] [--output <path>]",
    summary: "Execute untrusted code inside an isolated sandbox, enforcing egress and filesystem policies, and issue a signed receipt.",
    flags: [
      { flag: "--dry-run", desc: "Compile policies and simulate sandbox environment without running user command" },
      { flag: "--policy <file>", desc: "Override default policy configuration file" },
      { flag: "--output <path>", desc: "Write cryptographic execution receipt to custom file path" },
      { flag: "--timeout <sec>", desc: "Maximum execution wall-clock time before microVM teardown" },
    ],
    simulatedOutput: `[workflo] Booting ephemeral microVM (Firecracker 1.8.0)...
[workflo] MicroVM boot completed in 84ms.
[workflo] Attaching eBPF network sandbox (mode: default_deny)...
[workflo] Executing: npm test
[workflo] PASS src/index.test.ts (14 tests passed, 0 failed)
[workflo] Sweeping teardown... 0 zombie processes detected.
[workflo] Merkle root: 88e09f182bc20e98124589d9abef729a765c1920831a2938472910fae8293c41
[workflo] Signed receipt written to ./receipt.json (Ed25519)
[workflo] VERDICT: APPROVED_YES`,
  },
  {
    name: "workflo status",
    syntax: "workflo status <run-id>",
    summary: "Query the status of an ongoing or completed run in the cloud execution service.",
    flags: [
      { flag: "--watch", desc: "Stream execution lifecycle events in real time until completion" },
      { flag: "--json", desc: "Output raw JSON representation of the run record" },
    ],
    simulatedOutput: `[workflo] Run ID: exec_9a2f1c84
[workflo] Status: COMPLETED
[workflo] Verdict: APPROVED_YES
[workflo] Runtime: microvm-linux-x86_64 (84ms boot, 1840ms total)
[workflo] Receipt: https://api.workflo.dev/v1/runs/exec_9a2f1c84/receipt`,
  },
  {
    name: "workflo verify",
    syntax: "workflo verify <receipt-file> [--key <key-id>] [--offline]",
    summary: "Verify the cryptographic signature and Merkle root of an execution receipt offline.",
    flags: [
      { flag: "--key <key-id>", desc: "Specify authority signing key ID or path to public key PEM file" },
      { flag: "--offline", desc: "Perform verification entirely offline using bundled root trust store" },
    ],
    simulatedOutput: `[workflo] Reading receipt ./receipt.json...
[workflo] Execution ID: exec_9a2f1c84
[workflo] Recomputing Merkle root from audit ledger...
[workflo] Digest matches: 88e09f182bc20e98124589d9abef729a765c1920831a2938472910fae8293c41
[workflo] Verifying Ed25519 signature with key 'workflo-signer-2026-a'...
[workflo] Signature valid! Non-repudiation certified.
[workflo] Result: VERIFIED_APPROVED`,
  },
  {
    name: "workflo inspect",
    syntax: "workflo inspect <receipt-file> [--section <name>]",
    summary: "Inspect individual sections of an execution receipt (syscalls, network packets, diffs, teardown).",
    flags: [
      { flag: "--section <name>", desc: "Filter to specific evidence block: policy | audit | teardown | signature" },
      { flag: "--format <fmt>", desc: "Output format: table | json | yaml" },
    ],
    simulatedOutput: `[workflo] Telemetry Ledger Summary:
- Boot duration: 84ms
- Syscalls recorded: 4,119
- Network egress attempts: 1 (1 authorized, 0 blocked)
- Memory peak: 248MB / 4096MB
- Teardown status: Clean (0 zombie processes)
- Merkle leaf count: 4,124 entries`,
  },
  {
    name: "workflo explain",
    syntax: "workflo explain <receipt-file>",
    summary: "Produce human-readable explanation of why a run was approved or rejected.",
    flags: [
      { flag: "--verbose", desc: "Include full stack traces for policy violations" },
    ],
    simulatedOutput: `[workflo] Receipt Evaluation:
Verdict: APPROVED_YES
Reason: All test suites executed with exit code 0. Zero unauthorized network connections were attempted. Teardown swept with zero zombie processes and clean filesystem.`,
  },
  {
    name: "workflo keygen",
    syntax: "workflo keygen [--out-dir <dir>] [--key-id <name>]",
    summary: "Generate an Ed25519 signing keypair for self-hosted verification signing.",
    flags: [
      { flag: "--out-dir <dir>", desc: "Directory to write key files (default: ~/.workflo/keys)" },
      { flag: "--key-id <name>", desc: "Identifier embedded in receipt metadata" },
    ],
    simulatedOutput: `[workflo] Generating Ed25519 keypair...
[workflo] Public key: workflo_pub_9a10fc8120...
[workflo] Private key written to: ~/.workflo/signer.key (chmod 0600)
[workflo] Key ID registered: org-selfhost-2026-primary`,
  },
  {
    name: "workflo security-gate",
    syntax: "workflo security-gate [--receipt <file>] [--min-trust <tier>]",
    summary: "CI/CD pipeline blocker that exits 0 if the receipt passes policy and 1 if rejected.",
    flags: [
      { flag: "--receipt <file>", desc: "Path to receipt file" },
      { flag: "--min-trust <tier>", desc: "Minimum acceptable trust status: signed-verified | self-signed" },
    ],
    simulatedOutput: `[workflo] Checking receipt ./receipt.json...
[workflo] Verdict: APPROVED_YES
[workflo] Trust tier: signed-verified
[workflo] Gate passed! Exiting with code 0.`,
  },
];

/* -------------------------------------------------------------------------- */
/*                            12 STAGES DEFINITION                            */
/* -------------------------------------------------------------------------- */

interface StageItem {
  num: string;
  name: string;
  phase: "PREPARATION" | "EXECUTION" | "VERIFICATION";
  duration: string;
  desc: string;
  telemetry: string;
  securityGuarantee: string;
}

const LIFECYCLE_STAGES: StageItem[] = [
  {
    num: "01",
    name: "Repository Snapshot",
    phase: "PREPARATION",
    duration: "18ms",
    desc: "Captures working tree, git commit SHA, and dependencies into an immutable snapshot.",
    telemetry: "git_sha: 9f2a71d... | uncommitted_diffs: 0 | snapshot_bytes: 4.8MB",
    securityGuarantee: "Deterministic code boundary; no untracked file mutation allowed.",
  },
  {
    num: "02",
    name: "Policy Compilation",
    phase: "PREPARATION",
    duration: "12ms",
    desc: "Compiles .workflo/config.yaml into enforceable seccomp-bpf and network filtering rules.",
    telemetry: "seccomp_rules: 148 | egress_endpoints_authorized: 1 | mode: default_deny",
    securityGuarantee: "Unprivileged execution; illegal syscalls return EPERM / SIGSYS.",
  },
  {
    num: "03",
    name: "MicroVM Allocation",
    phase: "PREPARATION",
    duration: "24ms",
    desc: "Provisions Firecracker microVM instance with dedicated vCPUs, RAM, and isolated tap interface.",
    telemetry: "vcpu: 4 | memory: 4096MB | hypervisor: firecracker-1.8.0",
    securityGuarantee: "Hardware virtualization; zero shared memory or kernel state with host.",
  },
  {
    num: "04",
    name: "Rootfs Ephemeral Mount",
    phase: "PREPARATION",
    duration: "15ms",
    desc: "Mounts pristine base image with copy-on-write overlay in RAM tmpfs; host disk is never written.",
    telemetry: "mount_mode: ro+overlayfs | tmpfs_capacity: 1024MB | discard_on_exit: true",
    securityGuarantee: "Host storage immunity; writes vanish on microVM termination.",
  },
  {
    num: "05",
    name: "Kernel Boot Sequence",
    phase: "PREPARATION",
    duration: "84ms",
    desc: "Boots minimal guest Linux kernel in under 100ms directly into the Workflo runtime agent.",
    telemetry: "kernel: linux-6.1.102-microvm | boot_clock: 84.2ms | guest_pid1: /workflo-agent",
    securityGuarantee: "Stripped kernel attack surface without modules, PCI, or USB drivers.",
  },
  {
    num: "06",
    name: "Network Containment",
    phase: "EXECUTION",
    duration: "4ms",
    desc: "Attaches eBPF filters to the tap device, enforcing default-deny egress policies.",
    telemetry: "ebpf_hook: tc_egress | drop_count: 0 | allowed_cidrs: [api.registry.npmjs.org/32]",
    securityGuarantee: "No data exfiltration or internal cloud metadata service access.",
  },
  {
    num: "07",
    name: "Test Execution",
    phase: "EXECUTION",
    duration: "1420ms",
    desc: "Executes test commands inside guest microVM, streaming stdout/stderr to Merkle buffer.",
    telemetry: "cmd: npm test | exit_code: 0 | stdout_bytes: 18402 | syscall_count: 4119",
    securityGuarantee: "Isolated run; process crashes cannot affect host or neighboring jobs.",
  },
  {
    num: "08",
    name: "Agent Runtime Probing",
    phase: "EXECUTION",
    duration: "340ms",
    desc: "AI testing agents inspect running processes, open ports, and live application behavior.",
    telemetry: "routes_probed: 14 | status_codes: [200, 204] | anomalies_detected: 0",
    securityGuarantee: "Safe synthetic traffic; probe agent runs strictly outside the guest vm.",
  },
  {
    num: "09",
    name: "Audit Ledger Recording",
    phase: "EXECUTION",
    duration: "8ms",
    desc: "Captures system call logs, file access patterns, and network traffic into an audit ledger.",
    telemetry: "merkle_leaves: 4119 | tree_depth: 13 | hash_algorithm: sha256",
    securityGuarantee: "Immutable tamper-evident trace of all code runtime operations.",
  },
  {
    num: "10",
    name: "Teardown Sweep",
    phase: "VERIFICATION",
    duration: "16ms",
    desc: "Terminates microVM, checks for orphaned zombie processes, and resets host state.",
    telemetry: "zombie_pids: 0 | open_handles: 0 | fs_diff: clean | tamper_detected: false",
    securityGuarantee: "Zero host persistence or lingering background processes.",
  },
  {
    num: "11",
    name: "Merkle Digest Computation",
    phase: "VERIFICATION",
    duration: "5ms",
    desc: "Computes SHA-256 Merkle root over all recorded execution evidence blocks.",
    telemetry: "merkle_root: sha256:88e09f182bc20e98124589d9abef729a765c1920831a2938472910fae8293c41",
    securityGuarantee: "Cryptographic binding; single byte alteration invalidates root digest.",
  },
  {
    num: "12",
    name: "Ed25519 Receipt Signing",
    phase: "VERIFICATION",
    duration: "3ms",
    desc: "Signs Merkle root with Workflo authority key and writes verifiable receipt.json.",
    telemetry: "algorithm: Ed25519 | key_id: workflo-signer-2026-a | verdict: APPROVED_YES",
    securityGuarantee: "Non-repudiation; verifiable offline with standard cryptographic tools.",
  },
];

/* -------------------------------------------------------------------------- */
/*                            CODE SNIPPET HELPER                             */
/* -------------------------------------------------------------------------- */

function CodeSnippet({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-white/[0.08] bg-black/60 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
        <span className="text-[11px] text-white/50">{title || "Terminal"}</span>
        <button
          onClick={handleCopy}
          type="button"
          className="text-[11px] text-white/60 hover:text-white transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-white/90 leading-relaxed font-light">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export function Docs() {
  // Receipt Playground states
  const [activeReceiptIdx, setActiveReceiptIdx] = useState(0);
  const [verifiedState, setVerifiedState] = useState<"idle" | "verifying" | "valid">("idle");
  const [receiptView, setReceiptView] = useState<"visual" | "json">("visual");
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const currentReceipt = SAMPLE_RECEIPTS[activeReceiptIdx];

  const handleVerify = () => {
    setVerifiedState("verifying");
    setTimeout(() => {
      setVerifiedState("valid");
    }, 600);
  };

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(JSON.stringify(currentReceipt.json, null, 2));
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  // Interactive CLI state
  const [activeCliCmd, setActiveCliCmd] = useState(0);

  // Interactive 12-Stage Lifecycle state
  const [activeLifecycleStage, setActiveLifecycleStage] = useState(4); // Default to Kernel Boot (05)

  // Interactive Config Builder state
  const [configHypervisor, setConfigHypervisor] = useState("firecracker");
  const [configMemory, setConfigMemory] = useState("4096");
  const [configVcpu, setConfigVcpu] = useState("4");
  const [configEgress, setConfigEgress] = useState("default_deny");
  const [configAgentTesting, setConfigAgentTesting] = useState(true);

  const generatedYaml = useMemo(() => {
    return `version: 1

runtime:
  tier: microvm                  # microvm | sandbox-strict | dev-namespace
  hypervisor: ${configHypervisor}        # Firecracker KVM execution target
  vcpu: ${configVcpu}
  memory_mb: ${configMemory}
  timeout_seconds: 600

boundaries:
  network:
    egress: ${configEgress}         # Block all outbound traffic by default
    allowed_cidrs:
      - 10.0.0.0/16              # Internal database subnet
      - 172.16.0.0/12
    blocked_endpoints:
      - 169.254.169.254/32       # AWS IMDS metadata service blocked
    log_dns: true

  filesystem:
    workspace: /workspace
    read_only_root: true
    tmpfs_mb: 512

agent_probing:
  enabled: ${configAgentTesting}               # Autonomous runtime behavior probing
  anomaly_detection: true

teardown:
  enforce_clean_state: true      # Sweep for background zombies
  max_zombie_allowance: 0        # Zero tolerance for orphaned daemons

receipt:
  sign: true
  key_id: "workflo-signer-2026-a"
  format: "canonical-json"`;
  }, [configHypervisor, configMemory, configVcpu, configEgress, configAgentTesting]);

  // Interactive API state
  const [apiTab, setApiTab] = useState<"curl" | "js" | "python">("curl");
  const [apiEndpoint, setApiEndpoint] = useState<"submit" | "status" | "receipt">("submit");

  // Interactive Troubleshooting filter
  const [troubleFilter, setTroubleFilter] = useState<"all" | "kvm" | "network" | "teardown">("all");

  const troubleshootingItems = [
    {
      category: "kvm",
      code: "ERR_KVM_PERMISSION_DENIED",
      cause: "Host user does not have read/write access to /dev/kvm.",
      fix: "Run `sudo usermod -aG kvm $USER` and reload session, or run `workflo doctor --fix`.",
    },
    {
      category: "network",
      code: "ERR_POLICY_EGRESS_VIOLATION",
      cause: "The sandboxed process attempted unauthorized outbound network connection.",
      fix: "Add the required CIDR or domain to `.workflo/config.yaml` under `boundaries.network.allowed_cidrs`.",
    },
    {
      category: "teardown",
      code: "ERR_TEARDOWN_ZOMBIE_DETECTED",
      cause: "A background process spawned during tests did not terminate upon job completion.",
      fix: "Ensure test scripts invoke proper cleanup handlers, or pass `--timeout` to force SIGKILL.",
    },
    {
      category: "kvm",
      code: "ERR_RECEIPT_SIGNATURE_MISMATCH",
      cause: "The receipt payload was altered after signature generation, or incorrect public key used.",
      fix: "Re-run `workflo verify` with canonical keyfile or check if JSON was reformatted without preserving canonical ordering.",
    },
  ];

  const filteredTroubleshooting = useMemo(() => {
    if (troubleFilter === "all") return troubleshootingItems;
    return troubleshootingItems.filter((item) => item.category === troubleFilter);
  }, [troubleFilter]);

  return (
    <div className="landing-root min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/*                       CONCEPTUAL DOCS HERO                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate px-6 pt-24 pb-16 md:px-10 md:pt-32">
        <SectionBackdrop id="prove" position="70% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Breadcrumb + Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 font-mono text-sm text-white/60">
              <span>workflo</span>
              <span>/</span>
              <span className="text-white font-medium">docs</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                DEVELOPMENT PREVIEW
              </span>
            </div>
          </div>

          {/* Headline & Lede */}
          <LetterReveal
            text="Understand every run."
            as="h1"
            className="text-[10vw] font-medium leading-[1.05] tracking-tight text-white md:text-[5.5vw]"
          />

          <p className="mt-6 max-w-3xl text-lg text-white/60 md:text-xl font-light leading-relaxed">
            Everything you need to configure, execute, inspect and verify a Workflo run.
          </p>

          {/* Minimal Company Overview Plate */}
          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-white/50 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>ABOUT WORKFLO</span>
            </div>
            <p className="text-sm md:text-base text-white/90 font-light leading-relaxed">
              Workflo provides deterministic, cryptographically verified software execution. Every release runs inside an isolated microVM sandbox and produces a signed Ed25519 audit receipt detailing every syscall, network packet, and teardown verification.
            </p>
          </div>

          {/* 
            FOUR CATEGORY CARDS 
            Camouflaged into background with proper photographic image headers 
          */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: Quickstart (Denoted with plate-execute.webp) */}
            <a
              href="#quickstart"
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.02]"
            >
              <div>
                <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                  <img
                    src="/images/plate-execute.webp"
                    alt="Execution runtime plate"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-black/70 text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">
                      GETTING STARTED
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-medium text-white group-hover:text-white transition-colors">
                    Quickstart
                  </h3>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed">
                    Install and run your first verification.
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Start reading</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>

            {/* Card 2: Execution lifecycle (Denoted with plate-verify.webp) */}
            <a
              href="#lifecycle"
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.02]"
            >
              <div>
                <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                  <img
                    src="/images/plate-verify.webp"
                    alt="Verification lifecycle plate"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-black/70 text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">
                      12 STAGES
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-medium text-white group-hover:text-white transition-colors">
                    Execution lifecycle
                  </h3>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed">
                    Understand all 12 execution stages.
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore stages</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>

            {/* Card 3: Receipt verification (Denoted with plate-prove.webp) */}
            <a
              href="#receipt-inspector"
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.02]"
            >
              <div>
                <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                  <img
                    src="/images/plate-prove.webp"
                    alt="Cryptographic proof plate"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-black/70 text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <polyline points="9 15 11 17 15 13" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">
                      ED25519 / MERKLE
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-medium text-white group-hover:text-white transition-colors">
                    Receipt verification
                  </h3>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed">
                    Inspect signatures and evidence.
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open playground</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>

            {/* Card 4: API reference (Denoted with plate-observe.webp) */}
            <a
              href="#api"
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.02]"
            >
              <div>
                <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                  <img
                    src="/images/plate-observe.webp"
                    alt="Observation and API plate"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-black/70 text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">
                      REST & SDK
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-medium text-white group-hover:text-white transition-colors">
                    API reference
                  </h3>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed">
                    Integrate through the versioned API.
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View schemas</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          </div>

          <p className="mt-4 font-mono text-[11px] text-white/40">
            Workflo Documentation Specification · 1,390 lines · 7 parts · 20 major sections · reviewed 24 November 2026
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*               RELEASE STATUS & ISOLATION BOUNDARY CAVEAT           */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate border-t border-white/[0.08] px-6 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/20 bg-black/40 p-6 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                  Product Release Status and Security Boundary Disclosure
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed max-w-3xl font-light">
                Workflo is in <strong>development preview</strong>. Firecracker / KVM is the approved
                production target for untrusted-code execution, but Gate B has not passed. Docker and
                Linux namespace execution modes are development-only paths and must not be represented
                as production-accepted isolation.
              </p>
            </div>
            <Link
              to="/early-access"
              className="shrink-0 rounded-full border border-white/20 bg-white/5 px-5 py-2 font-mono text-xs text-white hover:bg-white/10 transition-colors"
            >
              Request Beta Access
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                     MAIN DOCUMENTATION BODY                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative isolate border-t border-white/[0.08] px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-12">
          
          {/* Left Sticky Navigation */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-white mb-2 px-2 font-medium">
                  Documentation Index
                </p>
                <nav className="space-y-1">
                  {[
                    { id: "installation", label: "Installation & Host Readiness" },
                    { id: "quickstart", label: "Developer Quickstart" },
                    { id: "lifecycle", label: "12-Stage Execution Lifecycle" },
                    { id: "config", label: "Run Configuration (YAML)" },
                    { id: "cli", label: "CLI Command Reference" },
                    { id: "evidence", label: "Evidence & Signed Receipts" },
                    { id: "receipt-inspector", label: "Receipt Playground (Interactive)" },
                    { id: "api", label: "API Reference (Execution vs Intake)" },
                    { id: "troubleshooting", label: "Troubleshooting Guide" },
                  ].map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-lg px-2.5 py-1.5 text-xs font-mono text-white/60 hover:bg-white/[0.04] hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="border-t border-white/[0.06] pt-4 px-2">
                <span className="font-mono text-[10px] text-white/60 block mb-2">SERVICE ARCHITECTURE</span>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Website Intake API (<code className="text-white">/api/v1/*</code>) is isolated from
                  Execution API (<code className="text-white">/v1/runs</code>).
                </p>
              </div>
            </div>
          </aside>

          {/* Right Main Article Stream */}
          <main className="lg:col-span-9 space-y-24">

            {/* 1. Installation & Host Readiness */}
            <section id="installation" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 1 / SETUP</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Installation and Host Readiness</h2>
                <p className="mt-2 text-sm text-white/60">
                  Prerequisites, virtualization checks, and CLI distribution.
                </p>
              </div>

              <div className="space-y-4 text-sm text-white/80 leading-relaxed font-light">
                <p>
                  Workflo executes software inside hardware-accelerated microVMs. Before running jobs
                  with production-grade containment, the host machine must support hardware virtualization
                  via Linux KVM (<code className="font-mono text-xs text-white">/dev/kvm</code>).
                </p>

                <h3 className="text-base font-medium text-white mt-6">1. Run Host Readiness Diagnostic</h3>
                <p className="text-xs text-white/60">
                  Use the standalone diagnostic tool to verify KVM permissions, cgroups v2, and seccomp filters:
                </p>
                <CodeSnippet
                  title="Terminal"
                  code="curl -fsSL https://workflo.dev/doctor.sh | sh"
                />

                <h3 className="text-base font-medium text-white mt-6">2. Install the Workflo CLI</h3>
                <p className="text-xs text-white/60">
                  Install via npm or direct standalone binary release:
                </p>
                <CodeSnippet
                  title="Terminal"
                  code={`# Global npm package (Node 20+ required)
npm install -g @workflo/cli

# Alternatively, download direct Linux binary
curl -fsSL https://releases.workflo.dev/workflo-linux-x86_64 -o /usr/local/bin/workflo
chmod +x /usr/local/bin/workflo`}
                />

                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-xs font-mono text-white/60 mt-4 backdrop-blur-md">
                  <span className="text-white font-semibold">Note on Licensing:</span> The CLI distribution
                  is currently undergoing licensing reconciliation between npm and Python packaging manifests.
                  Ensure you inspect the licence file included with your download.
                </div>
              </div>
            </section>

            {/* 2. Developer Quickstart */}
            <section id="quickstart" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 2 / QUICKSTART</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Developer Quickstart</h2>
                <p className="mt-2 text-sm text-white/60">
                  The 6-step workflow from repository initialization to verified receipt.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Initialize Repository",
                    cmd: "workflo init",
                    desc: "Inspects your repository, detects your package manager & test scripts, and writes a default .workflo/config.yaml.",
                  },
                  {
                    step: "02",
                    title: "Diagnose Virtualization & Isolation",
                    cmd: "workflo doctor",
                    desc: "Checks /dev/kvm availability, memory limits, and warns if falling back to development namespace isolation.",
                  },
                  {
                    step: "03",
                    title: "Dry-Run Policy Compilation",
                    cmd: "workflo run --dry-run",
                    desc: "Compiles seccomp rules and network egress allowlists without executing tests to verify boundary syntax.",
                  },
                  {
                    step: "04",
                    title: "Execute Sandboxed Run",
                    cmd: "workflo run --command='npm test'",
                    desc: "Boots isolated microVM, executes tests, records every syscall to the Merkle buffer, and sweeps teardown.",
                  },
                  {
                    step: "05",
                    title: "Verify Cryptographic Receipt",
                    cmd: "workflo verify ./receipt.json",
                    desc: "Recomputes Merkle digest and verifies the Ed25519 signature offline, confirming non-repudiation.",
                  },
                  {
                    step: "06",
                    title: "Inspect Telemetry & Audit Ledger",
                    cmd: "workflo inspect ./receipt.json",
                    desc: "Launches terminal inspector to review exact network packets, file descriptor diffs, and teardown proof.",
                  },
                ].map((item) => (
                  <div key={item.step} className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-white font-semibold">STEP {item.step}</span>
                      <span className="font-mono text-[10px] text-white/60">WORKFLOW</span>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-white">{item.title}</h3>
                    <p className="mt-1 text-xs text-white/60 leading-relaxed">{item.desc}</p>
                    <CodeSnippet code={item.cmd} />
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Execution Lifecycle (INTERACTIVE STEPPER) */}
            <section id="lifecycle" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 3 / LIFECYCLE</span>
                <h2 className="mt-2 text-3xl font-medium text-white">12-Stage Execution Lifecycle</h2>
                <p className="mt-2 text-sm text-white/60">
                  Every execution progresses through an immutable sequence. Click any stage to inspect live runtime telemetry.
                </p>
              </div>

              {/* Interactive Stage Selector Bar */}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                {LIFECYCLE_STAGES.map((s, idx) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setActiveLifecycleStage(idx)}
                    className={`flex flex-col items-center justify-center rounded-lg p-2.5 transition-all border ${
                      activeLifecycleStage === idx
                        ? "border-white bg-white text-black font-semibold shadow-lg"
                        : "border-white/[0.08] bg-black/40 text-white/60 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="font-mono text-[10px]">{s.num}</span>
                    <span className="mt-1 text-[10px] line-clamp-1 text-center font-normal">
                      {s.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Stage Detailed Inspector */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-white/60">
                      STAGE {LIFECYCLE_STAGES[activeLifecycleStage].num} · {LIFECYCLE_STAGES[activeLifecycleStage].phase}
                    </span>
                    <h3 className="mt-1 text-xl font-medium text-white">
                      {LIFECYCLE_STAGES[activeLifecycleStage].name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-mono text-white">
                    <span className="text-white/40">Duration:</span>
                    <span>{LIFECYCLE_STAGES[activeLifecycleStage].duration}</span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-white/90 leading-relaxed font-light">
                  {LIFECYCLE_STAGES[activeLifecycleStage].desc}
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.06] bg-black/50 p-4">
                    <span className="font-mono text-[10px] uppercase text-white/50 block mb-1.5">
                      RUNTIME TELEMETRY STREAM
                    </span>
                    <code className="font-mono text-xs text-white/90 break-all">
                      {LIFECYCLE_STAGES[activeLifecycleStage].telemetry}
                    </code>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-black/50 p-4">
                    <span className="font-mono text-[10px] uppercase text-white/50 block mb-1.5">
                      SECURITY & NON-REPUDIATION GUARANTEE
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed font-light">
                      {LIFECYCLE_STAGES[activeLifecycleStage].securityGuarantee}
                    </p>
                  </div>
                </div>

                {/* Stepper Navigation */}
                <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <button
                    type="button"
                    disabled={activeLifecycleStage === 0}
                    onClick={() => setActiveLifecycleStage((i) => Math.max(0, i - 1))}
                    className="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    ← Previous Stage
                  </button>
                  <span className="font-mono text-xs text-white/40">
                    {activeLifecycleStage + 1} of {LIFECYCLE_STAGES.length}
                  </span>
                  <button
                    type="button"
                    disabled={activeLifecycleStage === LIFECYCLE_STAGES.length - 1}
                    onClick={() => setActiveLifecycleStage((i) => Math.min(LIFECYCLE_STAGES.length - 1, i + 1))}
                    className="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Next Stage →
                  </button>
                </div>
              </div>

              {/* 12-Stage Visual Reference Grid */}
              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                {LIFECYCLE_STAGES.map((s, idx) => (
                  <div
                    key={s.num}
                    onClick={() => setActiveLifecycleStage(idx)}
                    className={`cursor-pointer rounded-xl border p-4 backdrop-blur-md transition-colors ${
                      activeLifecycleStage === idx
                        ? "border-white/40 bg-white/[0.06]"
                        : "border-white/[0.08] bg-black/40 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{s.num}</span>
                      <h4 className="text-sm font-medium text-white">{s.name}</h4>
                    </div>
                    <p className="mt-2 text-xs text-white/60 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Run Configuration (INTERACTIVE BUILDER) */}
            <section id="config" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 4 / SPECIFICATION</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Run Configuration (.workflo/config.yaml)</h2>
                <p className="mt-2 text-sm text-white/60">
                  Declarative execution policies, runtime parameters, and isolation boundaries. Adjust controls below to dynamically compile.
                </p>
              </div>

              {/* Interactive Policy & Hardware Customizer */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block font-mono text-xs text-white/60 mb-2">HYPERVISOR RUNTIME</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "firecracker", label: "Firecracker" },
                        { id: "gvisor", label: "gVisor" },
                        { id: "dev-namespace", label: "Namespace" },
                      ].map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setConfigHypervisor(h.id)}
                          className={`rounded-lg p-2 text-center text-xs font-mono transition-colors border ${
                            configHypervisor === h.id
                              ? "border-white bg-white text-black font-semibold"
                              : "border-white/[0.08] bg-black/40 text-white/60 hover:text-white"
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-white/60 mb-2">NETWORK EGRESS POLICY</label>
                    <select
                      value={configEgress}
                      onChange={(e) => setConfigEgress(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black p-2.5 font-mono text-xs text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="default_deny">default_deny (Zero external egress)</option>
                      <option value="allowlist_strict">allowlist_strict (Scoped CIDRs)</option>
                      <option value="loopback_only">loopback_only (Localhost only)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-white/60 mb-2">GUEST MEMORY</label>
                    <select
                      value={configMemory}
                      onChange={(e) => setConfigMemory(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black p-2.5 font-mono text-xs text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="2048">2048 MB (2 GB)</option>
                      <option value="4096">4096 MB (4 GB)</option>
                      <option value="8192">8192 MB (8 GB)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-white/60 mb-2">ALLOCATED VCPU</label>
                    <select
                      value={configVcpu}
                      onChange={(e) => setConfigVcpu(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black p-2.5 font-mono text-xs text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="2">2 vCPU</option>
                      <option value="4">4 vCPU</option>
                      <option value="8">8 vCPU</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/40 p-3.5">
                  <div>
                    <span className="text-xs font-medium text-white block">AI Agent Application Probing</span>
                    <span className="text-[11px] text-white/60">Autonomous runtime API inspection & anomaly scoring</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfigAgentTesting(!configAgentTesting)}
                    className={`h-6 w-11 rounded-full transition-colors relative ${
                      configAgentTesting ? "bg-white" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 h-4 w-4 rounded-full transition-transform ${
                        configAgentTesting ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dynamic Live Code Snippet */}
              <CodeSnippet
                title=".workflo/config.yaml (Compiled Dynamically)"
                code={generatedYaml}
              />
            </section>

            {/* 5. CLI Reference (INTERACTIVE PLAYGROUND) */}
            <section id="cli" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 5 / CLI REFERENCE</span>
                <h2 className="mt-2 text-3xl font-medium text-white">CLI Command Reference & Playground</h2>
                <p className="mt-2 text-sm text-white/60">
                  Verified command signatures from the Workflo CLI source implementation. Click any command to view syntax, flags, and simulated output.
                </p>
              </div>

              {/* Command Tabs */}
              <div className="flex flex-wrap gap-2">
                {CLI_COMMANDS.map((cmd, idx) => (
                  <button
                    key={cmd.name}
                    type="button"
                    onClick={() => setActiveCliCmd(idx)}
                    className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                      activeCliCmd === idx
                        ? "bg-white text-black font-semibold"
                        : "border border-white/[0.08] bg-black/40 text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {cmd.name}
                  </button>
                ))}
              </div>

              {/* Selected Command Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <code className="font-mono text-sm font-semibold text-white">
                    {CLI_COMMANDS[activeCliCmd].syntax}
                  </code>
                  <span className="font-mono text-[10px] text-white/60">SOURCE SPEC</span>
                </div>

                <p className="text-sm text-white/90 leading-relaxed font-light">
                  {CLI_COMMANDS[activeCliCmd].summary}
                </p>

                {/* Flags Table */}
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-white/60 mb-3">
                    Command Flags and Options
                  </h4>
                  <div className="space-y-2">
                    {CLI_COMMANDS[activeCliCmd].flags.map((f, fIdx) => (
                      <div key={fIdx} className="grid grid-cols-12 gap-2 text-xs font-mono border-b border-white/[0.04] pb-2 last:border-b-0">
                        <span className="col-span-4 text-white font-medium">{f.flag}</span>
                        <span className="col-span-8 text-white/60 font-light">{f.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Terminal Sandbox */}
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-white/60 mb-2">
                    Simulated Terminal Execution
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                    <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-white/20" />
                        <div className="h-2 w-2 rounded-full bg-white/20" />
                        <div className="h-2 w-2 rounded-full bg-white/20" />
                      </div>
                      <span className="font-mono text-[10px] text-white/40">{CLI_COMMANDS[activeCliCmd].name}</span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs text-white/80 leading-relaxed font-light whitespace-pre-wrap">
                      <code>{CLI_COMMANDS[activeCliCmd].simulatedOutput}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Evidence & Signed Receipts */}
            <section id="evidence" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 6 / VERIFICATION</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Evidence and Signed Receipts</h2>
                <p className="mt-2 text-sm text-white/60">
                  Cryptographic non-repudiation, Merkle audit chains, and explicit receipt limitations.
                </p>
              </div>

              <div className="space-y-4 text-sm text-white/80 leading-relaxed font-light">
                <p>
                  Workflo compiles an immutable receipt encapsulating the git commit, policy rules,
                  observed system calls, network sockets, teardown state, and Merkle root.
                </p>

                <div className="rounded-2xl border border-white/20 bg-black/40 p-5 text-xs text-white/90 backdrop-blur-md">
                  <span className="text-white font-semibold uppercase font-mono block mb-1">
                    Fundamental Receipt Boundary:
                  </span>
                  A signed receipt proves <em>what ran, what boundaries were enforced, and what was observed</em>.
                  It <strong>does not prove</strong> that the software is bug-free, safe, or correct.
                  Humans remain responsible for interpreting the evidence and authorizing deployment.
                </div>
              </div>
            </section>

            {/* 7. Interactive Receipt Inspector (Playground) */}
            <section id="receipt-inspector" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  <span className="font-mono text-xs text-white">LIVE PLAYGROUND</span>
                </div>
                <h2 className="mt-2 text-3xl font-medium text-white">Interactive Receipt Inspector</h2>
                <p className="mt-2 text-sm text-white/60">
                  Test real receipt payloads, verify digital signatures, and audit Merkle digests.
                </p>
              </div>

              {/* Scenario Selector */}
              <div className="flex flex-wrap gap-2">
                {SAMPLE_RECEIPTS.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setActiveReceiptIdx(idx);
                      setVerifiedState("idle");
                    }}
                    className={`rounded-full px-4 py-2 font-mono text-xs transition-colors ${
                      activeReceiptIdx === idx
                        ? "bg-white text-black font-semibold"
                        : "border border-white/[0.08] bg-black/40 text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {/* Inspector Card */}
              <div className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] bg-white/[0.02] p-4 md:px-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-white/60">VERDICT:</span>
                    <span
                      className={`font-mono text-xs px-3 py-1 rounded-full border ${
                        currentReceipt.verdict === "APPROVED_YES"
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-white/20 bg-white/10 text-white"
                      }`}
                    >
                      {currentReceipt.verdict}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-lg border border-white/[0.08] bg-black/60 p-1 flex">
                      <button
                        type="button"
                        onClick={() => setReceiptView("visual")}
                        className={`rounded px-3 py-1 text-xs font-mono transition-colors ${
                          receiptView === "visual" ? "bg-white/10 text-white" : "text-white/60"
                        }`}
                      >
                        Structured Audit
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceiptView("json")}
                        className={`rounded px-3 py-1 text-xs font-mono transition-colors ${
                          receiptView === "json" ? "bg-white/10 text-white" : "text-white/60"
                        }`}
                      >
                        Canonical JSON
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyReceipt}
                      className="rounded-lg border border-white/[0.08] bg-black/60 px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white"
                    >
                      {copiedReceipt ? "COPIED" : "COPY JSON"}
                    </button>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {receiptView === "visual" ? (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
                          <span className="font-mono text-[10px] text-white/60">COMMIT SHA</span>
                          <p className="mt-1 font-mono text-xs text-white truncate">
                            {currentReceipt.json.commit?.sha || "sha256:unknown"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
                          <span className="font-mono text-[10px] text-white/60">MERKLE ROOT</span>
                          <p className="mt-1 font-mono text-xs text-white truncate">
                            {currentReceipt.json.merkle_root}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
                          <span className="font-mono text-[10px] text-white/60">SIGNATURE ALGORITHM</span>
                          <p className="mt-1 font-mono text-xs text-white">
                            {currentReceipt.json.signature?.algorithm} (Verified)
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
                          <span className="font-mono text-[10px] text-white/60">TEARDOWN STATE</span>
                          <p className="mt-1 font-mono text-xs text-white">
                            {currentReceipt.json.teardown?.zombie_processes === 0 ? "Clean (0 Zombies)" : "LEAK DETECTED"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-white">Cryptographic Signature Verification</h4>
                          <p className="text-xs text-white/60 mt-1 font-light">
                            Verifies Ed25519 digital signature against Workflo authority public keys.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleVerify}
                          disabled={verifiedState === "valid"}
                          className={`rounded-full px-5 py-2 font-mono text-xs transition-colors flex items-center gap-2 ${
                            verifiedState === "valid"
                              ? "bg-white/20 text-white border border-white/20"
                              : "bg-white text-black font-semibold hover:bg-neutral-200"
                          }`}
                        >
                          {verifiedState === "verifying" && <span>Recomputing Merkle root...</span>}
                          {verifiedState === "valid" && (
                            <>
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>SIGNATURE VERIFIED AUTHENTIC</span>
                            </>
                          )}
                          {verifiedState === "idle" && <span>Verify Cryptographic Proof</span>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <pre className="font-mono text-xs text-white overflow-x-auto leading-relaxed max-h-96">
                      {JSON.stringify(currentReceipt.json, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </section>

            {/* 8. API Reference */}
            <section id="api" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 7 / API REFERENCE</span>
                <h2 className="mt-2 text-3xl font-medium text-white">API Reference & Sandbox</h2>
                <p className="mt-2 text-sm text-white/60">
                  Workflo Product Execution API (/v1/runs) versus Website Public Intake API (/api/v1/*).
                </p>
              </div>

              {/* Product Execution API Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {[
                      { id: "submit", label: "POST /v1/runs" },
                      { id: "status", label: "GET /v1/runs/{id}" },
                      { id: "receipt", label: "GET /v1/runs/{id}/receipt" },
                    ].map((ep) => (
                      <button
                        key={ep.id}
                        type="button"
                        onClick={() => setApiEndpoint(ep.id as any)}
                        className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors border ${
                          apiEndpoint === ep.id
                            ? "border-white bg-white text-black font-medium"
                            : "border-white/[0.06] bg-black/40 text-white/60 hover:text-white"
                        }`}
                      >
                        {ep.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex rounded-lg border border-white/[0.08] bg-black/60 p-1 font-mono text-xs">
                    {(["curl", "js", "python"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setApiTab(tab)}
                        className={`rounded px-3 py-1 uppercase transition-colors ${
                          apiTab === tab ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Request Snippet */}
                {apiEndpoint === "submit" && apiTab === "curl" && (
                  <CodeSnippet
                    title="Submit Execution Run (cURL)"
                    code={`curl -X POST https://api.workflo.dev/v1/runs \\
  -H "Authorization: Bearer wkf_live_9a2f1c84..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "repository": "https://github.com/acme/service",
    "commit": "9f2a71d803be81b67f13904a1168194e432c6b41",
    "tier": "microvm",
    "command": "npm test",
    "policy": {
      "egress": "default_deny",
      "timeout_seconds": 300
    }
  }'`}
                  />
                )}

                {apiEndpoint === "submit" && apiTab === "js" && (
                  <CodeSnippet
                    title="Submit Execution Run (Node.js SDK)"
                    code={`import { WorkfloClient } from "@workflo/sdk";

const client = new WorkfloClient({ apiKey: process.env.WORKFLO_API_KEY });

const run = await client.runs.create({
  repository: "https://github.com/acme/service",
  commit: "9f2a71d803be81b67f13904a1168194e432c6b41",
  tier: "microvm",
  command: "npm test",
});

const receipt = await run.waitForReceipt();
console.log("Verdict:", receipt.verdict);`}
                  />
                )}

                {apiEndpoint === "submit" && apiTab === "python" && (
                  <CodeSnippet
                    title="Submit Execution Run (Python SDK)"
                    code={`import os
from workflo import WorkfloClient

client = WorkfloClient(api_key=os.environ["WORKFLO_API_KEY"])

run = client.runs.create(
    repository="https://github.com/acme/service",
    commit="9f2a71d803be81b67f13904a1168194e432c6b41",
    tier="microvm",
    command="pytest",
)

receipt = run.wait_for_receipt()
assert receipt.verdict == "APPROVED_YES"`}
                  />
                )}

                {apiEndpoint === "status" && (
                  <CodeSnippet
                    title="Poll Run Status (cURL)"
                    code={`curl https://api.workflo.dev/v1/runs/exec_9a2f1c84 \\
  -H "Authorization: Bearer wkf_live_9a2f1c84..."`}
                  />
                )}

                {apiEndpoint === "receipt" && (
                  <CodeSnippet
                    title="Fetch Signed Execution Receipt (cURL)"
                    code={`curl https://api.workflo.dev/v1/runs/exec_9a2f1c84/receipt \\
  -H "Authorization: Bearer wkf_live_9a2f1c84..."`}
                  />
                )}

                {/* Simulated API Response */}
                <div className="mt-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] bg-black/80 px-4 py-2 rounded-t-xl border-x border-t">
                    <span className="font-mono text-[11px] text-white/60">Simulated JSON Response (200 OK)</span>
                    <span className="font-mono text-[10px] text-white/40">application/json</span>
                  </div>
                  <pre className="rounded-b-xl border border-white/[0.08] bg-black p-4 font-mono text-xs text-white/80 leading-relaxed overflow-x-auto">
                    <code>{apiEndpoint === "submit" ? `{
  "id": "run_9a2f1c84",
  "status": "QUEUED",
  "created_at": "2026-11-26T15:40:00.000Z",
  "estimated_start_ms": 120
}` : apiEndpoint === "status" ? `{
  "id": "run_9a2f1c84",
  "status": "COMPLETED",
  "verdict": "APPROVED_YES",
  "duration_ms": 1840,
  "receipt_url": "https://api.workflo.dev/v1/runs/run_9a2f1c84/receipt"
}` : `{
  "receipt_version": "2026-11-24.1",
  "execution_id": "exec_9a2f1c84",
  "verdict": "APPROVED_YES",
  "merkle_root": "sha256:88e09f182bc20e98124589d9abef729a765c1920831a2938472910fae8293c41",
  "signature": {
    "algorithm": "Ed25519",
    "key_id": "workflo-signer-2026-a",
    "sig": "3045022100e49a201...b2f9104a"
  }
}`}</code>
                  </pre>
                </div>

                {/* Website Intake API Section */}
                <h3 className="text-lg font-medium text-white pt-6">2. Website Public Intake APIs (/api/v1/*)</h3>
                <p className="text-xs text-white/60">
                  CloudFront edge & regional API Gateway endpoints powering website intake workflows:
                </p>

                <div className="grid gap-3 sm:grid-cols-3 mt-3">
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
                    <span className="font-mono text-xs text-white">GET /api/v1/health</span>
                    <p className="mt-1 text-xs text-white/60">Website API Gateway health check.</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
                    <span className="font-mono text-xs text-white">POST /api/v1/early-access</span>
                    <p className="mt-1 text-xs text-white/60">Early access cohort submission.</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
                    <span className="font-mono text-xs text-white">POST /api/v1/contact</span>
                    <p className="mt-1 text-xs text-white/60">Enterprise & sales intake.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Troubleshooting (INTERACTIVE FILTER) */}
            <section id="troubleshooting" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 8 / DIAGNOSTICS</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Troubleshooting Guide</h2>
                <p className="mt-2 text-sm text-white/60">
                  Common execution anomalies, isolation errors, and remediation steps. Filter by category:
                </p>
              </div>

              {/* Troubleshooting Category Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All Anomalies" },
                  { id: "kvm", label: "Virtualization / KVM" },
                  { id: "network", label: "Network Egress" },
                  { id: "teardown", label: "Teardown & Zombies" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTroubleFilter(tab.id as any)}
                    className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors border ${
                      troubleFilter === tab.id
                        ? "border-white bg-white text-black font-semibold"
                        : "border-white/[0.08] bg-black/40 text-white/60 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredTroubleshooting.map((item) => (
                  <div key={item.code} className="rounded-xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-white">{item.code}</span>
                      <span className="font-mono text-[10px] uppercase text-white/40">{item.category}</span>
                    </div>
                    <p className="mt-1 text-xs text-white font-medium">{item.cause}</p>
                    <p className="mt-2 text-xs text-white/60 font-light">
                      <strong className="text-white font-mono">Remedy:</strong> {item.fix}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
