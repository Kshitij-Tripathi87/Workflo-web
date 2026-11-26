import { useState, useMemo, useEffect } from "react";
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
    name: "Application Test Execution",
    phase: "EXECUTION",
    duration: "1,420ms",
    desc: "Executes configured test suite inside microVM while logging all stdout, stderr, and exit codes.",
    telemetry: "command: npm test | exit_code: 0 | tests_run: 14 | duration: 1.42s",
    securityGuarantee: "Contained execution; runner cannot affect parent CI host environment.",
  },
  {
    num: "08",
    name: "AI Agent Behavioral Probing",
    phase: "EXECUTION",
    duration: "310ms",
    desc: "Autonomous probes inspect live application runtime, verifying endpoints, logs, and state.",
    telemetry: "probes_dispatched: 3 | api_health_checks: 12 | anomaly_score: 0.00",
    securityGuarantee: "Runtime behavior verified before merge; anomalous network attempts trapped.",
  },
  {
    num: "09",
    name: "Kernel Syscall Ledgering",
    phase: "VERIFICATION",
    duration: "9ms",
    desc: "eBPF event stream serializes all invoked system calls into a cryptographically ordered log.",
    telemetry: "syscall_count: 4,119 | unique_opcodes: 34 | unexpected_opcodes: 0",
    securityGuarantee: "Immutable audit ledger; hidden file accesses or spawned forks are exposed.",
  },
  {
    num: "10",
    name: "Deterministic Teardown Sweep",
    phase: "VERIFICATION",
    duration: "16ms",
    desc: "Scans guest process tree for orphaned daemons, uncommitted disk diffs, and lingering locks.",
    telemetry: "active_pids: 0 | orphaned_daemons: 0 | dirty_pages: discarded",
    securityGuarantee: "Zero state persistence; verified absence of lingering zombie background processes.",
  },
  {
    num: "11",
    name: "SHA-256 Merkle Ledgering",
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

function CodeSnippet({
  code,
  title,
  tabs,
  activeTab,
  onTabChange,
}: {
  code: string;
  title?: string;
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/70 font-mono text-xs backdrop-blur-md shadow-2xl">
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          {title && <span className="text-[11px] text-white/50">{title}</span>}
        </div>

        <div className="flex items-center gap-2">
          {tabs && (
            <div className="flex items-center gap-1 rounded-lg bg-black/60 p-0.5 border border-white/[0.06]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  className={`rounded px-2.5 py-0.5 text-[11px] transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-black font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {copied ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </>
              )}
            </svg>
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
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

const DOC_SECTIONS = [
  { id: "getting-started", label: "1. Getting Started", short: "Getting Started" },
  { id: "installation", label: "2. Installation", short: "Installation" },
  { id: "quickstart", label: "3. Developer Quickstart", short: "Quickstart" },
  { id: "cli", label: "4. CLI Reference", short: "CLI Reference" },
  { id: "configuration", label: "5. Configuration", short: "Configuration" },
  { id: "lifecycle", label: "6. Execution Lifecycle", short: "Lifecycle" },
  { id: "security", label: "7. Security & Isolation", short: "Security" },
  { id: "receipts", label: "8. Receipts & Evidence", short: "Receipts" },
  { id: "api", label: "9. API Reference", short: "API Reference" },
  { id: "troubleshooting", label: "10. Troubleshooting", short: "Troubleshooting" },
];

export function Docs() {
  // Active section tracking for table of contents
  const [activeSection, setActiveSection] = useState("getting-started");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = DOC_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(DOC_SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(DOC_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Lifecycle state
  const [activeLifecycleStage, setActiveLifecycleStage] = useState(0);

  // CLI state
  const [activeCliCmd, setActiveCliCmd] = useState(0);

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

  const filteredTroubleshooting = troubleFilter === "all"
    ? troubleshootingItems
    : troubleshootingItems.filter((i) => i.category === troubleFilter);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/*                       CONCEPTUAL DOCS HERO                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate px-6 pt-24 pb-16 md:px-10 md:pt-32">
        <SectionBackdrop id="prove" position="70% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Breadcrumb + Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 font-mono text-sm text-white/60">
              <span>workflo</span>
              <span>/</span>
              <span className="text-white font-medium">docs</span>
            </div>

            <span className="font-mono text-xs font-medium uppercase tracking-wider text-white/50">
              DEVELOPMENT PREVIEW
            </span>
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
            <div className="font-mono text-xs uppercase tracking-wider text-white/50 mb-2">
              ABOUT WORKFLO
            </div>
            <p className="text-sm md:text-base text-white/90 font-light leading-relaxed">
              Workflo provides deterministic, cryptographically verified software execution. Every release runs inside an isolated microVM sandbox and produces a signed Ed25519 audit receipt detailing every syscall, network packet, and teardown verification.
            </p>
          </div>

          {/* Quick Pillar Jump Cards */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                id: "quickstart",
                plate: "/images/plate-execute.webp",
                tag: "GETTING STARTED",
                title: "Quickstart",
                desc: "Install and run your first verification.",
              },
              {
                id: "lifecycle",
                plate: "/images/plate-verify.webp",
                tag: "12 STAGES",
                title: "Execution Lifecycle",
                desc: "Inspect all twelve execution stages.",
              },
              {
                id: "receipts",
                plate: "/images/plate-prove.webp",
                tag: "ED25519 / MERKLE",
                title: "Receipt Verification",
                desc: "Inspect signatures and audit evidence.",
              },
              {
                id: "api",
                plate: "/images/plate-observe.webp",
                tag: "REST & SDK",
                title: "API Reference",
                desc: "Integrate through the versioned API.",
              },
            ].map((card) => (
              <a
                key={card.id}
                href={`#${card.id}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.02]"
              >
                <div>
                  <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                    <img
                      src={card.plate}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">
                        {card.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-medium text-white group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs text-white/60 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Jump to section</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*               RELEASE STATUS & ISOLATION BOUNDARY CAVEAT           */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate border-t border-white/[0.08] px-6 py-8 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/20 bg-black/40 p-6 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                  Product Release Status & Security Boundary Disclosure
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
        {/* Mobile Navigation Dropdown (< lg) */}
        <div className="lg:hidden mx-auto max-w-7xl mb-8">
          <label className="block font-mono text-xs text-white/50 mb-2">JUMP TO SECTION</label>
          <select
            value={activeSection}
            onChange={(e) => {
              const el = document.getElementById(e.target.value);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full rounded-xl border border-white/20 bg-black p-3 font-mono text-xs text-white"
          >
            {DOC_SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-12">
          
          {/* Left Sticky Navigation (Persistent Sidebar) */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-white mb-2 px-2 font-medium">
                  Documentation Index
                </p>
                <nav className="space-y-1">
                  {DOC_SECTIONS.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block rounded-lg px-2.5 py-1.5 text-xs font-mono transition-colors ${
                        activeSection === item.id
                          ? "bg-white/10 text-white font-medium border-l-2 border-white pl-2"
                          : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                      }`}
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

          {/* Center Main Article Stream */}
          <main className="lg:col-span-9 xl:col-span-7 space-y-24">

            {/* 1. Getting Started */}
            <section id="getting-started" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 1 / OVERVIEW</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Getting Started with Workflo</h2>
                <p className="mt-2 text-sm text-white/60">
                  Understand what Workflo does, why verification must be independent, and how our execution pipeline operates.
                </p>
              </div>

              <div className="space-y-4 text-sm text-white/80 leading-relaxed font-light">
                <p>
                  Workflo is <strong>software execution and verification infrastructure</strong>. It gives engineering teams a controlled environment in which to execute, test, and inspect software changes, record what happens, verify teardown, and produce evidence-backed execution receipts.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 my-6">
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
                    <h4 className="text-xs font-mono font-medium text-white uppercase mb-1">What Workflo Does</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Seals runtime environments in ephemeral microVMs, attaches eBPF kernel probes, runs test suites, records syscalls and network activity, sweeps teardown, and generates Ed25519 signed receipts.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
                    <h4 className="text-xs font-mono font-medium text-white uppercase mb-1">What Receipts Establish</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      A receipt attests to the exact repository SHA, policies enforced, syscalls executed, and teardown verification. It proves <em>what ran</em>, but does not claim that code is bug-free or universally safe.
                    </p>
                  </div>
                </div>

                <p>
                  Workflo works alongside your existing CI/CD runners, GitHub Actions, and autonomous coding agents. Follow the installation guide below to configure your host environment.
                </p>
              </div>
            </section>

            {/* 2. Installation & Host Readiness */}
            <section id="installation" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 2 / INSTALLATION</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Installation & Host Readiness</h2>
                <p className="mt-2 text-sm text-white/60">
                  Prerequisites, virtualization checks, and CLI distribution packages.
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
                  code={`# Global npm package preview (Node 20+ required)
npm install -g @workflo/cli

# Alternatively, download direct Linux binary
curl -fsSL https://releases.workflo.dev/workflo-linux-x86_64 -o /usr/local/bin/workflo
chmod +x /usr/local/bin/workflo`}
                />

                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-xs font-mono text-white/60 mt-4 backdrop-blur-md">
                  <span className="text-white font-semibold">Note on Licensing:</span> The CLI distribution
                  is currently undergoing licensing reconciliation between npm (@workflo/cli) and Python packaging manifests.
                  Inspect the licence file included with your download.
                </div>
              </div>
            </section>

            {/* 3. Developer Quickstart */}
            <section id="quickstart" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 3 / QUICKSTART</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Developer Quickstart</h2>
                <p className="mt-2 text-sm text-white/60">
                  Initialize a repository, configure execution bounds, and run your first verified test suite.
                </p>
              </div>

              <div className="space-y-4 text-sm text-white/80 leading-relaxed font-light">
                <h3 className="text-base font-medium text-white">Step 1: Initialize Configuration</h3>
                <p className="text-xs text-white/60">
                  Run <code className="font-mono text-xs text-white">workflo init</code> in your repository root:
                </p>
                <CodeSnippet
                  title="Terminal"
                  code={`cd your-project/
workflo init --template node`}
                />

                <h3 className="text-base font-medium text-white mt-6">Step 2: Execute Test Suite in Sandbox</h3>
                <p className="text-xs text-white/60">
                  Execute tests inside an isolated microVM with eBPF egress monitoring:
                </p>
                <CodeSnippet
                  title="Terminal"
                  code="workflo run 'npm test' --inspect"
                />

                <h3 className="text-base font-medium text-white mt-6">Step 3: Verify Cryptographic Receipt</h3>
                <p className="text-xs text-white/60">
                  Verify the Ed25519 signature and SHA-256 Merkle root digest:
                </p>
                <CodeSnippet
                  title="Terminal"
                  code="workflo verify ./receipt.json"
                />
              </div>
            </section>

            {/* 4. CLI Reference (INTERACTIVE PLAYGROUND) */}
            <section id="cli" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 4 / CLI REFERENCE</span>
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

              {/* Active Command Inspector */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md space-y-5">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-white/60">COMMAND SIGNATURE</span>
                  <div className="mt-2 rounded-xl border border-white/[0.08] bg-black/70 p-3 font-mono text-sm text-white">
                    <code>{CLI_COMMANDS[activeCliCmd].syntax}</code>
                  </div>
                  <p className="mt-2 text-xs text-white/80 font-light">
                    {CLI_COMMANDS[activeCliCmd].summary}
                  </p>
                </div>

                {CLI_COMMANDS[activeCliCmd].flags.length > 0 && (
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-white/60 block mb-2">FLAGS & ARGUMENTS</span>
                    <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-black/50">
                      {CLI_COMMANDS[activeCliCmd].flags.map((f) => (
                        <div key={f.flag} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 text-xs">
                          <code className="font-mono text-white font-medium">{f.flag}</code>
                          <span className="text-white/60 font-light">{f.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-white/60 block mb-2">SIMULATED TERMINAL OUTPUT</span>
                  <CodeSnippet
                    title="Console"
                    code={CLI_COMMANDS[activeCliCmd].simulatedOutput}
                  />
                </div>
              </div>
            </section>

            {/* 5. Run Configuration (INTERACTIVE BUILDER) */}
            <section id="configuration" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 5 / CONFIGURATION</span>
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

            {/* 6. Execution Lifecycle (INTERACTIVE STEPPER) */}
            <section id="lifecycle" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 6 / LIFECYCLE</span>
                <h2 className="mt-2 text-3xl font-medium text-white">12-Stage Execution Lifecycle</h2>
                <p className="mt-2 text-sm text-white/60">
                  Every execution progresses through an immutable sequence. Click any stage to inspect live runtime telemetry.
                </p>
              </div>

              {/* Reference Benchmark Notice */}
              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-xs text-white/70 font-light leading-relaxed backdrop-blur-md">
                <span className="font-mono text-[11px] uppercase tracking-wider text-white font-semibold block mb-1">
                  Illustrative Reference Benchmarks
                </span>
                Telemetry metrics and stage durations (e.g. 84ms, 4,119 syscalls) displayed below are illustrative benchmark figures recorded on an AMD EPYC 7763 microVM testbed executing containerized test suites. Actual runtime metrics vary based on workload I/O, binary image size, and guest execution complexity.
              </div>

              {/* Interactive Stage Selector Bar */}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                {LIFECYCLE_STAGES.map((s, idx) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setActiveLifecycleStage(idx)}
                    className={`rounded-lg py-2 text-center font-mono text-xs transition-colors border ${
                      activeLifecycleStage === idx
                        ? "border-white bg-white text-black font-bold"
                        : "border-white/[0.08] bg-black/40 text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {s.num}
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
            </section>

            {/* 7. Security & Isolation */}
            <section id="security" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 7 / SECURITY</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Execution Isolation & Security Boundaries</h2>
                <p className="mt-2 text-sm text-white/60">
                  Detailed specifications of how untrusted code is confined and why container escapes are mathematically mitigated.
                </p>
              </div>

              <div className="space-y-6 text-sm text-white/80 leading-relaxed font-light">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5">
                    <h4 className="text-sm font-medium text-white mb-2">Hardware-Accelerated MicroVMs</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Each job spawns a dedicated Linux guest kernel via KVM. There is zero shared memory, zero shared kernel state, and zero shared filesystem between runs.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5">
                    <h4 className="text-sm font-medium text-white mb-2">Default-Deny eBPF Network Boundary</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      All egress is dropped by default. Cloud metadata service IPs (e.g. 169.254.169.254) are unconditionally blocked. Only explicitly declared CIDRs are reachable.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5">
                    <h4 className="text-sm font-medium text-white mb-2">Immutable Ephemeral Disks</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      The root filesystem is mounted read-only with a temporary RAM overlay. On execution teardown, memory is zeroed and no artifacts persist on the host disk.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5">
                    <h4 className="text-sm font-medium text-white mb-2">Non-Custodial Host Secrets</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Workflo runners never inherit host credentials, AWS/GCP IAM tokens, or root user privileges. Code executes as an isolated unprivileged guest user.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-black/50 p-4 font-mono text-xs text-white/70">
                  <span className="text-white font-semibold">Boundary Clarification:</span> Workflo isolates execution to protect your infrastructure and audit software behavior. Sandboxing proves what code did during that run under specified constraints; it does not constitute a formal proof of application logic correctness.
                </div>
              </div>
            </section>

            {/* 8. Receipts & Evidence (PLAYGROUND) */}
            <section id="receipts" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 8 / RECEIPTS & PROOF</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Cryptographic Receipts & Evidence Playground</h2>
                <p className="mt-2 text-sm text-white/60">
                  Inspect digitally signed execution receipts, Merkle root digests, and verifiable audit ledgers.
                </p>
              </div>

              {/* Sample Fixture Mode Banner */}
              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-xs text-white/70 font-light leading-relaxed backdrop-blur-md">
                <span className="font-mono text-[11px] uppercase tracking-wider text-white font-semibold block mb-1">
                  Sample Fixture Playground Notice
                </span>
                The playground below evaluates pre-recorded execution fixtures to demonstrate Ed25519 signature checks, Merkle tree digests, and policy verdicts. To verify a live production receipt produced by your CI runner, execute <code className="text-white">workflo verify ./receipt.json</code>.
              </div>

              {/* Playground Container */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md space-y-6">
                
                {/* Sample Selector Tabs */}
                <div>
                  <label className="block font-mono text-xs text-white/60 mb-2">SELECT SAMPLE FIXTURE</label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {SAMPLE_RECEIPTS.map((r, idx) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setActiveReceiptIdx(idx);
                          setVerifiedState("idle");
                        }}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          activeReceiptIdx === idx
                            ? "border-white bg-white/10 text-white"
                            : "border-white/[0.06] bg-black/40 text-white/60 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <span className="font-mono text-xs font-semibold block">{r.name}</span>
                        <span className="text-[11px] text-white/50 block mt-1">
                          Verdict: {r.verdict}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Switcher: Visual vs JSON */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReceiptView("visual")}
                      className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors ${
                        receiptView === "visual"
                          ? "bg-white text-black font-semibold"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Visual Inspector
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptView("json")}
                      className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors ${
                        receiptView === "json"
                          ? "bg-white text-black font-semibold"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyReceipt}
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs font-mono text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {copiedReceipt ? "Copied" : "Copy JSON"}
                    </button>
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={verifiedState === "verifying"}
                      className="rounded-lg bg-white px-4 py-1 text-xs font-mono font-medium text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                      {verifiedState === "verifying" ? "Verifying..." : "Verify Signature"}
                    </button>
                  </div>
                </div>

                {/* Verification Result Banner */}
                {verifiedState === "valid" && (
                  <div className="rounded-xl border border-white/30 bg-white/[0.06] p-4 font-mono text-xs text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">ED25519 SIGNATURE VALID</span>
                      <span className="text-white/50">·</span>
                      <span className="text-white/70">Key: {currentReceipt.json.signature.key_id}</span>
                    </div>
                    <p className="mt-1 text-white/60 text-[11px]">
                      Merkle root {currentReceipt.json.merkle_root.slice(0, 24)}... verified against audit ledger.
                    </p>
                  </div>
                )}

                {/* Visual View */}
                {receiptView === "visual" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.06] bg-black/50 p-4 space-y-3">
                      <span className="font-mono text-xs uppercase text-white/50 block">EXECUTION CONTEXT</span>
                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-white/70">
                          <span>Execution ID:</span>
                          <span className="text-white font-medium">{currentReceipt.json.execution_id}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Commit SHA:</span>
                          <span className="text-white font-medium">{currentReceipt.json.commit?.sha?.slice(0, 10)}...</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Branch:</span>
                          <span className="text-white font-medium">{currentReceipt.json.commit?.branch}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Verdict:</span>
                          <span className="text-white font-bold">{currentReceipt.json.verdict}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-black/50 p-4 space-y-3">
                      <span className="font-mono text-xs uppercase text-white/50 block">AUDIT EVIDENCE</span>
                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-white/70">
                          <span>Recorded Syscalls:</span>
                          <span className="text-white font-medium">{currentReceipt.json.audit?.total_syscalls ?? "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Exit Code:</span>
                          <span className="text-white font-medium">{currentReceipt.json.audit?.exit_code ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Zombie Daemons:</span>
                          <span className="text-white font-medium">{currentReceipt.json.teardown?.zombie_processes ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Signing Key ID:</span>
                          <span className="text-white font-medium">{currentReceipt.json.signature?.key_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw JSON View */}
                {receiptView === "json" && (
                  <pre className="max-h-96 overflow-y-auto rounded-xl border border-white/[0.08] bg-black p-4 font-mono text-xs text-white/80 leading-relaxed">
                    <code>{JSON.stringify(currentReceipt.json, null, 2)}</code>
                  </pre>
                )}
              </div>
            </section>

            {/* 9. API Reference */}
            <section id="api" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 9 / API REFERENCE</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Execution API Reference (/v1/runs)</h2>
                <p className="mt-2 text-sm text-white/60">
                  Versioned REST API and client libraries for programmatic execution and receipt retrieval.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-xs font-mono text-white/70 backdrop-blur-md">
                <span className="text-white font-semibold">Authentication Header:</span> Authenticate API requests using the <code className="text-white">X-API-Key: wkf_live_...</code> header. Requests without valid keys return HTTP 401 Unauthorized.
              </div>

              {/* Endpoint Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "submit", method: "POST", path: "/v1/runs", label: "Create Run" },
                  { id: "status", method: "GET", path: "/v1/runs/:id", label: "Get Run Status" },
                  { id: "receipt", method: "GET", path: "/v1/runs/:id/receipt", label: "Get Receipt" },
                ].map((ep) => (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => setApiEndpoint(ep.id as any)}
                    className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors border ${
                      apiEndpoint === ep.id
                        ? "border-white bg-white text-black font-semibold"
                        : "border-white/[0.08] bg-black/40 text-white/60 hover:text-white"
                    }`}
                  >
                    <span className="font-bold mr-1.5">{ep.method}</span>
                    <span>{ep.path}</span>
                  </button>
                ))}
              </div>

              {/* Language Tabs & Snippets */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-white/60">CLIENT IMPLEMENTATION</span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: "curl", label: "cURL" },
                      { id: "js", label: "Node.js" },
                      { id: "python", label: "Python" },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setApiTab(lang.id as any)}
                        className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${
                          apiTab === lang.id
                            ? "bg-white text-black font-semibold"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {apiEndpoint === "submit" && apiTab === "curl" && (
                  <CodeSnippet
                    title="Submit Execution Run (cURL)"
                    code={`curl -X POST https://api.workflo.dev/v1/runs \\
  -H "X-API-Key: wkf_live_9a2f1c84..." \\
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
  -H "X-API-Key: wkf_live_9a2f1c84..."`}
                  />
                )}

                {apiEndpoint === "receipt" && (
                  <CodeSnippet
                    title="Fetch Signed Execution Receipt (cURL)"
                    code={`curl https://api.workflo.dev/v1/runs/exec_9a2f1c84/receipt \\
  -H "X-API-Key: wkf_live_9a2f1c84..."`}
                  />
                )}
              </div>
            </section>

            {/* 10. Troubleshooting */}
            <section id="troubleshooting" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">SECTION 10 / TROUBLESHOOTING</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Troubleshooting & Error Catalog</h2>
                <p className="mt-2 text-sm text-white/60">
                  Resolutions for hypervisor permissions, network policy denials, and teardown anomalies.
                </p>
              </div>

              <div className="flex gap-2">
                {[
                  { id: "all", label: "All Errors" },
                  { id: "kvm", label: "KVM / Virtualization" },
                  { id: "network", label: "Network Egress" },
                  { id: "teardown", label: "Teardown Sweeps" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTroubleFilter(f.id as any)}
                    className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors border ${
                      troubleFilter === f.id
                        ? "border-white bg-white text-black font-semibold"
                        : "border-white/[0.08] bg-black/40 text-white/60 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4">
                {filteredTroubleshooting.map((item) => (
                  <div key={item.code} className="rounded-xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                      <code className="font-mono text-xs font-semibold text-white">{item.code}</code>
                      <span className="font-mono text-[10px] uppercase text-white/40">{item.category}</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <p className="text-white/60">
                        <strong className="text-white/80 font-medium">Cause:</strong> {item.cause}
                      </p>
                      <p className="text-white/90 font-mono text-[11px] bg-black/50 p-2 rounded border border-white/[0.04]">
                        <strong>Resolution:</strong> {item.fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* Right Sticky Table of Contents ("On this page") */}
          <aside className="hidden xl:block xl:col-span-2">
            <div className="sticky top-24 space-y-5 rounded-2xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/50 px-2 font-medium">
                  On this page
                </p>
                <nav className="mt-2 space-y-1">
                  {DOC_SECTIONS.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`block rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                        activeSection === sec.id
                          ? "text-white font-medium bg-white/10"
                          : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {sec.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="border-t border-white/[0.06] pt-3 px-2">
                <span className="font-mono text-[10px] text-white/40 block mb-2 uppercase tracking-wider">Quick Actions</span>
                <div className="space-y-1.5">
                  <a
                    href="#receipts"
                    className="block text-[11px] font-mono text-white/70 hover:text-white transition-colors"
                  >
                    → Verify Receipt
                  </a>
                  <a
                    href="#configuration"
                    className="block text-[11px] font-mono text-white/70 hover:text-white transition-colors"
                  >
                    → Build YAML
                  </a>
                  <a
                    href="#api"
                    className="block text-[11px] font-mono text-white/70 hover:text-white transition-colors"
                  >
                    → Test API cURL
                  </a>
                  <a
                    href="#installation"
                    className="block text-[11px] font-mono text-white/70 hover:text-white transition-colors"
                  >
                    → Run Doctor Check
                  </a>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      <Footer />
    </div>
  );
}
