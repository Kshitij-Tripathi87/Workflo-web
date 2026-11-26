import { useState, useMemo } from "react";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";
import { SectionBackdrop } from "../landing/SectionBackdrop";
import { LetterReveal } from "../landing/LetterReveal";

/* -------------------------------------------------------------------------- */
/*                               RECEIPT DATA                                 */
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
        value: "c7e189a80bf...[32 bytes truncated]...49a1bc8f",
      },
    },
  },
  {
    id: "policy-violation",
    name: "02. Unauthorized Egress Blocked (Rejected)",
    verdict: "REJECTED_POLICY_VIOLATION",
    json: {
      receipt_version: "2026-11-24.1",
      execution_id: "exec_4b88a912",
      timestamp: "2026-11-24T16:15:33.882Z",
      commit: {
        sha: "e38fa9102c31889abef9012a67bc129034af109e",
        branch: "feature/auth-proxy",
        tree_clean: true,
      },
      environment: {
        runtime: "microvm-linux-x86_64",
        hypervisor: "firecracker-1.8.0",
        boot_duration_ms: 79,
        memory_mb: 4096,
        vcpu: 4,
      },
      policy: {
        egress_mode: "default_deny",
        outbound_connections_attempted: 3,
        outbound_connections_authorized: 0,
        seccomp_profile: "strict_v3",
      },
      audit: {
        total_syscalls: 894,
        stdout_bytes: 120,
        stderr_bytes: 340,
        exit_code: 1,
      },
      teardown: {
        zombie_processes: 0,
        filesystem_diff_clean: true,
        host_tamper_evident: false,
      },
      violation: {
        rule: "network_policy_violation",
        detail: "Attempted TCP connect to unauthorized destination 198.51.100.14:443",
        action_taken: "ebpf_packet_drop_and_process_terminated",
      },
      merkle_root: "sha256:32cfa8091e0a8...[truncated]...91823af0",
      signature: {
        algorithm: "Ed25519",
        key_id: "workflo-signer-2026-a",
        value: "9a01fb34091...[32 bytes truncated]...8172ac4e",
      },
    },
  },
  {
    id: "teardown-leak",
    name: "03. Teardown Leak / Zombie Process (Rejected)",
    verdict: "REJECTED_TEARDOWN_LEAK",
    json: {
      receipt_version: "2026-11-24.1",
      execution_id: "exec_19f091aa",
      timestamp: "2026-11-24T16:22:10.510Z",
      commit: {
        sha: "a90184b901fc88a10984ba10294fc8190284ab91",
        branch: "fix/background-worker",
        tree_clean: true,
      },
      environment: {
        runtime: "microvm-linux-x86_64",
        hypervisor: "firecracker-1.8.0",
        boot_duration_ms: 82,
        memory_mb: 4096,
        vcpu: 4,
      },
      policy: {
        egress_mode: "default_deny",
        outbound_connections_attempted: 0,
        outbound_connections_authorized: 0,
        seccomp_profile: "strict_v3",
      },
      audit: {
        total_syscalls: 2190,
        stdout_bytes: 4200,
        stderr_bytes: 12,
        exit_code: 0,
      },
      teardown: {
        zombie_processes: 1,
        filesystem_diff_clean: false,
        host_tamper_evident: false,
      },
      violation: {
        rule: "sandbox_leak_detected",
        detail: "Orphaned daemon process (PID 419, 'node /worker.js') retained file descriptor 3 after teardown",
        action_taken: "hard_hypervisor_reset_and_receipt_rejected",
      },
      merkle_root: "sha256:fa9012c84091b...[truncated]...190284ac",
      signature: {
        algorithm: "Ed25519",
        key_id: "workflo-signer-2026-a",
        value: "4190fae8091...[32 bytes truncated]...901824ab",
      },
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                            12 STAGES DEFINITION                            */
/* -------------------------------------------------------------------------- */

interface StageDetail {
  number: string;
  name: string;
  phase: "PREPARATION" | "EXECUTION" | "VERIFICATION";
  duration: string;
  summary: string;
  telemetry: string;
  securityGuarantee: string;
}

const STAGES: StageDetail[] = [
  {
    number: "01",
    name: "Repository Snapshot",
    phase: "PREPARATION",
    duration: "18ms",
    summary: "Captures git commit SHA, working tree diffs, and package manifests into an immutable tarball.",
    telemetry: "git_sha: 9f2a71d... | uncommitted_diffs: 0 | snapshot_bytes: 4.8MB",
    securityGuarantee: "Deterministic code boundary; no untracked file mutation allowed.",
  },
  {
    number: "02",
    name: "Policy Compilation",
    phase: "PREPARATION",
    duration: "12ms",
    summary: "Compiles seccomp-bpf syscall filters and eBPF egress network routing rules from .workflo/config.yaml.",
    telemetry: "seccomp_rules: 148 | egress_endpoints_authorized: 1 | mode: default_deny",
    securityGuarantee: "Unprivileged execution; illegal syscalls return EPERM / SIGSYS.",
  },
  {
    number: "03",
    name: "MicroVM Allocation",
    phase: "PREPARATION",
    duration: "24ms",
    summary: "Allocates dedicated KVM virtual hardware, isolated tap network interface, and cgroup v2 limits.",
    telemetry: "vcpu: 4 | memory: 4096MB | hypervisor: firecracker-1.8.0",
    securityGuarantee: "Hardware virtualization; zero shared memory or kernel state with host.",
  },
  {
    number: "04",
    name: "Rootfs Ephemeral Mount",
    phase: "PREPARATION",
    duration: "15ms",
    summary: "Mounts read-only base root filesystem with copy-on-write overlay in RAM tmpfs.",
    telemetry: "mount_mode: ro+overlayfs | tmpfs_capacity: 1024MB | discard_on_exit: true",
    securityGuarantee: "Host storage immunity; writes vanish on microVM termination.",
  },
  {
    number: "05",
    name: "Kernel Boot Sequence",
    phase: "PREPARATION",
    duration: "84ms",
    summary: "Minimal guest Linux kernel boots in under 100 milliseconds directly into the Workflo runtime agent.",
    telemetry: "kernel: linux-6.1.102-microvm | boot_clock: 84.2ms | guest_pid1: /workflo-agent",
    securityGuarantee: "Stripped kernel attack surface without modules, PCI, or USB drivers.",
  },
  {
    number: "06",
    name: "Network Sandbox Containment",
    phase: "EXECUTION",
    duration: "4ms",
    summary: "eBPF filter attaches to the tap interface, dropping all unauthorized DNS and outbound IP packets.",
    telemetry: "ebpf_hook: tc_egress | drop_count: 0 | allowed_cidrs: [api.registry.npmjs.org/32]",
    securityGuarantee: "No data exfiltration or internal cloud metadata service access.",
  },
  {
    number: "07",
    name: "Test & Command Execution",
    phase: "EXECUTION",
    duration: "1420ms",
    summary: "Executes test commands inside the guest while streaming stdout, stderr, and resource usage metrics.",
    telemetry: "cmd: npm test | exit_code: 0 | stdout_bytes: 18402 | syscall_count: 4119",
    securityGuarantee: "Isolated run; process crashes cannot affect host or neighboring jobs.",
  },
  {
    number: "08",
    name: "AI Agent Probing & Observation",
    phase: "EXECUTION",
    duration: "340ms",
    summary: "Autonomous agents inspect application routes, API responses, and runtime logs for regression anomalies.",
    telemetry: "routes_probed: 14 | status_codes: [200, 204] | anomalies_detected: 0",
    securityGuarantee: "Safe synthetic traffic; probe agent runs strictly outside the guest vm.",
  },
  {
    number: "09",
    name: "Syscall Audit Ledger Recording",
    phase: "EXECUTION",
    duration: "8ms",
    summary: "Every executed guest syscall and file descriptor action is hashed and recorded into a Merkle tree buffer.",
    telemetry: "merkle_leaves: 4119 | tree_depth: 13 | hash_algorithm: sha256",
    securityGuarantee: "Immutable tamper-evident trace of all code runtime operations.",
  },
  {
    number: "10",
    name: "Teardown & Leak Detection Sweep",
    phase: "VERIFICATION",
    duration: "16ms",
    summary: "Sweeps processes, file descriptors, and temporary mounts to verify no zombie processes or state leaks remain.",
    telemetry: "zombie_pids: 0 | open_handles: 0 | fs_diff: clean | tamper_detected: false",
    securityGuarantee: "Zero host persistence or lingering background processes.",
  },
  {
    number: "11",
    name: "Merkle Root Computation",
    phase: "VERIFICATION",
    duration: "5ms",
    summary: "Computes final 256-bit Merkle root digest over git commit, policy, stdout/stderr, and teardown audit.",
    telemetry: "merkle_root: sha256:88e09f182bc20e98124589d9abef729a765c1920831a2938472910fae8293c41",
    securityGuarantee: "Cryptographic binding; single byte alteration invalidates root digest.",
  },
  {
    number: "12",
    name: "Ed25519 Receipt Signing",
    phase: "VERIFICATION",
    duration: "3ms",
    summary: "Issues signed execution receipt with workflo hardware key ID, certifying the run's deterministic verdict.",
    telemetry: "algorithm: Ed25519 | key_id: workflo-signer-2026-a | verdict: APPROVED_YES",
    securityGuarantee: "Non-repudiation; verifiable offline with standard cryptographic tools.",
  },
];

/* -------------------------------------------------------------------------- */
/*                            CLI COMMAND SAMPLES                             */
/* -------------------------------------------------------------------------- */

interface CliCommand {
  cmd: string;
  title: string;
  description: string;
  simulatedOutput: string;
}

const CLI_COMMANDS: CliCommand[] = [
  {
    cmd: "workflo init",
    title: "Initialize Repository",
    description: "Detects package manager and test runner, writing .workflo/config.yaml.",
    simulatedOutput: `[workflo] Scanning repository...
[workflo] Detected environment: Node.js (package.json)
[workflo] Test runner identified: vitest
[workflo] Creating .workflo/config.yaml...
[workflo] Initialized repository configuration (profile: strict_v3).
[workflo] Run 'workflo doctor' to verify host virtualization.`,
  },
  {
    cmd: "workflo doctor",
    title: "Virtualization Diagnostic",
    description: "Verifies KVM kernel access, cgroups v2, and seccomp containment.",
    simulatedOutput: `[workflo] Running host readiness diagnostic...
[workflo] [PASS] Linux kernel: 6.1.0-28-amd64 (>= 5.10 required)
[workflo] [PASS] Hardware KVM (/dev/kvm): rw-rw---- (KVM available)
[workflo] [PASS] cgroups v2: unified hierarchy mounted
[workflo] [PASS] seccomp: SECCOMP_SET_MODE_FILTER supported
[workflo] [PASS] eBPF: BPF_PROG_TYPE_SCHED_CLS supported
[workflo] Host is ready for production microVM isolation.`,
  },
  {
    cmd: "workflo run --command='npm test'",
    title: "Execute Sandboxed Run",
    description: "Boots microVM, enforces policies, runs tests, and produces signed receipt.",
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
    cmd: "workflo verify ./receipt.json",
    title: "Verify Offline Receipt",
    description: "Recomputes Merkle digest and checks Ed25519 signature offline.",
    simulatedOutput: `[workflo] Reading receipt ./receipt.json...
[workflo] Execution ID: exec_9a2f1c84
[workflo] Recomputing Merkle root from audit ledger...
[workflo] Digest matches: 88e09f182bc20e98124589d9abef729a765c1920831a2938472910fae8293c41
[workflo] Verifying Ed25519 signature with key 'workflo-signer-2026-a'...
[workflo] Signature valid! Non-repudiation certified.
[workflo] Result: VERIFIED_APPROVED`,
  },
  {
    cmd: "workflo inspect ./receipt.json",
    title: "Inspect Telemetry Ledger",
    description: "Explores all 4,119 captured syscalls, network events, and resource limits.",
    simulatedOutput: `[workflo] Telemetry Ledger Summary:
- Boot duration: 84ms
- Syscalls recorded: 4,119
- Network egress attempts: 1 (1 authorized, 0 blocked)
- Memory peak: 248MB / 4096MB
- Teardown status: Clean (0 zombie processes)
- Merkle leaf count: 4,124 entries`,
  },
  {
    cmd: "workflo keygen",
    title: "Generate Verification Keypair",
    description: "Generates enterprise Ed25519 keypair for self-hosted verification signing.",
    simulatedOutput: `[workflo] Generating Ed25519 keypair...
[workflo] Public key: workflo_pub_9a10fc8120...
[workflo] Private key written to: ~/.workflo/signer.key (chmod 0600)
[workflo] Key ID registered: org-selfhost-2026-primary`,
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
  // Accordion open states (default first 2 open, or user can toggle any)
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    cli: true,
    lifecycle: false,
    config: false,
    receipt: false,
    api: false,
    setup: false,
    troubleshooting: false,
  });

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setOpenCards({
      cli: true,
      lifecycle: true,
      config: true,
      receipt: true,
      api: true,
      setup: true,
      troubleshooting: true,
    });
  };

  const collapseAll = () => {
    setOpenCards({
      cli: false,
      lifecycle: false,
      config: false,
      receipt: false,
      api: false,
      setup: false,
      troubleshooting: false,
    });
  };

  // Interactive CLI state
  const [activeCmdIndex, setActiveCmdIndex] = useState(0);

  // Interactive Lifecycle Stage state
  const [activeStageIndex, setActiveStageIndex] = useState(4); // Default to Kernel Boot

  // Interactive Config Generator state
  const [configHypervisor, setConfigHypervisor] = useState("firecracker");
  const [configMemory, setConfigMemory] = useState("4096");
  const [configVcpu, setConfigVcpu] = useState("4");
  const [configEgress, setConfigEgress] = useState("default_deny");
  const [configAgentTesting, setConfigAgentTesting] = useState(true);

  const generatedYaml = useMemo(() => {
    return `# .workflo/config.yaml
version: "2026-11-24.1"

runtime:
  hypervisor: "${configHypervisor}"
  memory_mb: ${configMemory}
  vcpu: ${configVcpu}
  boot_timeout_seconds: 5

policy:
  egress: "${configEgress}"
  allowed_endpoints:
    - "registry.npmjs.org:443"
  seccomp_profile: "strict_v3"
  deny_syscalls:
    - "ptrace"
    - "process_vm_readv"
    - "reboot"

agent_testing:
  enabled: ${configAgentTesting}
  probe_routes: true
  anomaly_scoring: true

signing:
  algorithm: "Ed25519"
  require_signed_receipt: true
  key_id: "workflo-signer-2026-a"
`;
  }, [configHypervisor, configMemory, configVcpu, configEgress, configAgentTesting]);

  // Interactive Receipt Playground state
  const [selectedReceiptId, setSelectedReceiptId] = useState("clean-run");
  const [verifiedState, setVerifiedState] = useState<"idle" | "verifying" | "valid">("idle");

  const currentReceipt = useMemo(
    () => SAMPLE_RECEIPTS.find((r) => r.id === selectedReceiptId) || SAMPLE_RECEIPTS[0],
    [selectedReceiptId]
  );

  const handleVerify = () => {
    setVerifiedState("verifying");
    setTimeout(() => {
      setVerifiedState("valid");
    }, 450);
  };

  // Interactive API Sandbox state
  const [apiEndpoint, setApiEndpoint] = useState<"submit" | "status" | "receipt">("submit");
  const [apiLang, setApiLang] = useState<"curl" | "ts" | "py">("curl");

  const apiSnippets = {
    submit: {
      curl: `curl -X POST https://api.workflo.dev/v1/runs \\
  -H "X-API-Key: wkf_live_9a2f1c84..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "repository": "https://github.com/acme/app",
    "commit_sha": "9f2a71d803be81b67f13904a1168194e432c6b41",
    "command": "npm test"
  }'`,
      ts: `import { WorkfloClient } from "@workflo/sdk";

const client = new WorkfloClient({ apiKey: process.env.WORKFLO_API_KEY });

const run = await client.runs.create({
  repository: "https://github.com/acme/app",
  commitSha: "9f2a71d803be81b67f13904a1168194e432c6b41",
  command: "npm test",
});

console.log("Run queued:", run.id);`,
      py: `from workflo import WorkfloClient

client = WorkfloClient(api_key="wkf_live_9a2f1c84...")

run = client.runs.create(
    repository="https://github.com/acme/app",
    commit_sha="9f2a71d803be81b67f13904a1168194e432c6b41",
    command="npm test"
)

print(f"Run queued: {run.id}")`,
      response: `{
  "id": "run_9a2f1c84",
  "status": "QUEUED",
  "created_at": "2026-11-26T15:40:00.000Z",
  "estimated_start_ms": 120
}`,
    },
    status: {
      curl: `curl https://api.workflo.dev/v1/runs/run_9a2f1c84 \\
  -H "X-API-Key: wkf_live_9a2f1c84..."`,
      ts: `const status = await client.runs.retrieve("run_9a2f1c84");
console.log("Execution status:", status.state, status.durationMs);`,
      py: `status = client.runs.get("run_9a2f1c84")
print(f"Status: {status.state}, duration: {status.duration_ms}ms")`,
      response: `{
  "id": "run_9a2f1c84",
  "status": "COMPLETED",
  "verdict": "APPROVED_YES",
  "duration_ms": 1840,
  "receipt_url": "https://api.workflo.dev/v1/runs/run_9a2f1c84/receipt"
}`,
    },
    receipt: {
      curl: `curl https://api.workflo.dev/v1/runs/run_9a2f1c84/receipt \\
  -H "X-API-Key: wkf_live_9a2f1c84..."`,
      ts: `const receipt = await client.runs.getReceipt("run_9a2f1c84");
const isAuthentic = await receipt.verifySignature();
console.log("Receipt verified:", isAuthentic);`,
      py: `receipt = client.runs.get_receipt("run_9a2f1c84")
is_valid = receipt.verify_signature()
print(f"Receipt verified: {is_valid}")`,
      response: `{
  "receipt_version": "2026-11-24.1",
  "execution_id": "exec_9a2f1c84",
  "verdict": "APPROVED_YES",
  "merkle_root": "sha256:88e09f182bc20e98124589d9abef729a765c1920831a2938472910fae8293c41",
  "signature": {
    "algorithm": "Ed25519",
    "key_id": "workflo-signer-2026-a",
    "value": "c7e189a80bf...49a1bc8f"
  }
}`,
    },
  };

  return (
    <div className="landing-root min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/*                                HERO                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate px-6 pt-24 pb-12 md:px-10 md:pt-32">
        <SectionBackdrop id="prove" position="70% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Breadcrumb + Status Badge */}
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

          <p className="mt-4 max-w-2xl text-base text-white/60 md:text-lg font-light leading-relaxed">
            Interactive reference and verified execution tooling for the Workflo runtime.
          </p>

          {/* 
            MINIMAL COMPANY OVERVIEW PLATE
            Crisp, on-point 2-sentence mission statement keeping docs tool-focused 
          */}
          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md">
            <div className="font-mono text-xs uppercase tracking-wider text-white/50 mb-2">
              ABOUT WORKFLO
            </div>
            <p className="text-sm md:text-base text-white/90 font-light leading-relaxed">
              Workflo provides deterministic, cryptographically verified software execution. Every release runs inside an isolated microVM sandbox and produces a signed Ed25519 audit receipt detailing every syscall, network packet, and teardown verification.
            </p>
          </div>

          {/* Global Accordion Toggle Controls */}
          <div className="mt-10 flex items-center justify-between border-b border-white/[0.08] pb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-white/60">
              INTERACTIVE TOOLING & REFERENCE
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={expandAll}
                className="font-mono text-xs text-white/60 hover:text-white transition-colors"
              >
                Expand all
              </button>
              <span className="text-white/20">/</span>
              <button
                type="button"
                onClick={collapseAll}
                className="font-mono text-xs text-white/60 hover:text-white transition-colors"
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                     INTERACTIVE ACCORDION CARDS                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate px-6 pb-28 md:px-10">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* ============================================================== */}
          {/* CARD 1: CLI PLAYGROUND                                         */}
          {/* ============================================================== */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-colors hover:border-white/20">
            {/* Card Header (Clickable) */}
            <button
              type="button"
              onClick={() => toggleCard("cli")}
              className="w-full text-left"
            >
              <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                <img
                  src="/images/plate-execute.webp"
                  alt="CLI Execution plate"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    INTERACTIVE CLI
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-medium text-white">CLI Command Reference & Playground</h2>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Select a command to view usage, flags, and simulated execution output.
                  </p>
                </div>
                <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openCards.cli ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {openCards.cli && (
              <div className="border-t border-white/[0.06] p-6 pt-2">
                <div className="grid gap-6 lg:grid-cols-12">
                  {/* Left: Command Selector */}
                  <div className="lg:col-span-5 space-y-2">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-white/50 mb-3">
                      AVAILABLE COMMANDS
                    </p>
                    {CLI_COMMANDS.map((item, idx) => (
                      <button
                        key={item.cmd}
                        type="button"
                        onClick={() => setActiveCmdIndex(idx)}
                        className={`w-full text-left rounded-xl p-3.5 transition-all border ${
                          activeCmdIndex === idx
                            ? "border-white/30 bg-white/[0.06] text-white"
                            : "border-white/[0.06] bg-black/20 text-white/70 hover:bg-white/[0.03] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-white">{item.cmd}</span>
                          <span className="font-mono text-[10px] text-white/40">v2026.1</span>
                        </div>
                        <p className="mt-1 text-xs text-white/60 line-clamp-1">{item.description}</p>
                      </button>
                    ))}
                  </div>

                  {/* Right: Terminal Simulation */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/[0.08] bg-black/80 px-4 py-2.5 rounded-t-xl border-x border-t">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                          <span className="ml-2 font-mono text-[11px] text-white/60">
                            terminal — {CLI_COMMANDS[activeCmdIndex].cmd}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-white/40">guest microvm</span>
                      </div>

                      <div className="rounded-b-xl border border-white/[0.08] bg-black p-5 font-mono text-xs">
                        <div className="flex items-center gap-2 text-white font-medium mb-3">
                          <span className="text-white/40">$</span>
                          <span>{CLI_COMMANDS[activeCmdIndex].cmd}</span>
                        </div>
                        <pre className="text-white/80 leading-relaxed font-light whitespace-pre-wrap">
                          {CLI_COMMANDS[activeCmdIndex].simulatedOutput}
                        </pre>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs">
                      <span className="text-white/60">Copy command string to clipboard:</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(CLI_COMMANDS[activeCmdIndex].cmd)}
                        className="rounded-lg border border-white/10 px-3 py-1 font-mono text-xs text-white hover:bg-white/10 transition-colors"
                      >
                        Copy Command
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* CARD 2: 12-STAGE LIFECYCLE STEPPER                            */}
          {/* ============================================================== */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-colors hover:border-white/20">
            {/* Card Header (Clickable) */}
            <button
              type="button"
              onClick={() => toggleCard("lifecycle")}
              className="w-full text-left"
            >
              <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                <img
                  src="/images/plate-verify.webp"
                  alt="Lifecycle plate"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    EXECUTION ENGINE
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-medium text-white">12-Stage Execution Lifecycle Stepper</h2>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Step through all 12 stages from repository snapshot to cryptographic Ed25519 signing.
                  </p>
                </div>
                <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openCards.lifecycle ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {openCards.lifecycle && (
              <div className="border-t border-white/[0.06] p-6 pt-2">
                {/* Stage Progress Bar / Grid */}
                <div className="mb-6 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                  {STAGES.map((s, idx) => (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => setActiveStageIndex(idx)}
                      className={`flex flex-col items-center justify-center rounded-lg p-2.5 transition-all border ${
                        activeStageIndex === idx
                          ? "border-white bg-white text-black font-semibold shadow-lg"
                          : "border-white/[0.08] bg-black/40 text-white/60 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="font-mono text-[10px]">{s.number}</span>
                      <span className="mt-1 text-[10px] line-clamp-1 text-center font-normal">
                        {s.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Stage Detail Card */}
                <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs uppercase tracking-wider text-white/60">
                          STAGE {STAGES[activeStageIndex].number} · {STAGES[activeStageIndex].phase}
                        </span>
                      </div>
                      <h3 className="mt-1 text-xl font-medium text-white">
                        {STAGES[activeStageIndex].name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-mono text-white">
                      <span className="text-white/40">Duration:</span>
                      <span>{STAGES[activeStageIndex].duration}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-white/80 leading-relaxed font-light">
                    {STAGES[activeStageIndex].summary}
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
                      <span className="font-mono text-[10px] uppercase text-white/50 block mb-1.5">
                        RUNTIME TELEMETRY STREAM
                      </span>
                      <code className="font-mono text-xs text-white/90 break-all">
                        {STAGES[activeStageIndex].telemetry}
                      </code>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
                      <span className="font-mono text-[10px] uppercase text-white/50 block mb-1.5">
                        SECURITY & NON-REPUDIATION GUARANTEE
                      </span>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        {STAGES[activeStageIndex].securityGuarantee}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Prev / Next */}
                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <button
                      type="button"
                      disabled={activeStageIndex === 0}
                      onClick={() => setActiveStageIndex((i) => Math.max(0, i - 1))}
                      className="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                    >
                      ← Previous Stage
                    </button>
                    <span className="font-mono text-xs text-white/40">
                      {activeStageIndex + 1} of {STAGES.length}
                    </span>
                    <button
                      type="button"
                      disabled={activeStageIndex === STAGES.length - 1}
                      onClick={() => setActiveStageIndex((i) => Math.min(STAGES.length - 1, i + 1))}
                      className="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                    >
                      Next Stage →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* CARD 3: CONFIG YAML GENERATOR                                  */}
          {/* ============================================================== */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-colors hover:border-white/20">
            {/* Card Header (Clickable) */}
            <button
              type="button"
              onClick={() => toggleCard("config")}
              className="w-full text-left"
            >
              <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                <img
                  src="/images/plate-observe.webp"
                  alt="Config plate"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    POLICY COMPILER
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-medium text-white">Interactive .workflo/config.yaml Builder</h2>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Adjust sandbox hypervisor, memory limits, and network egress to generate valid configuration.
                  </p>
                </div>
                <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openCards.config ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {openCards.config && (
              <div className="border-t border-white/[0.06] p-6 pt-2">
                <div className="grid gap-6 lg:grid-cols-12">
                  {/* Left: Controls */}
                  <div className="lg:col-span-5 space-y-5">
                    <div>
                      <label className="block font-mono text-xs text-white/60 mb-2">HYPERVISOR RUNTIME</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "firecracker", label: "Firecracker (KVM)" },
                          { id: "gvisor", label: "gVisor (Sandbox)" },
                          { id: "namespace", label: "Linux NS (Dev)" },
                        ].map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => setConfigHypervisor(h.id)}
                            className={`rounded-lg p-2 text-center text-xs transition-colors border ${
                              configHypervisor === h.id
                                ? "border-white bg-white/10 text-white font-medium"
                                : "border-white/[0.06] bg-black/40 text-white/60 hover:text-white"
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
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

                    <div>
                      <label className="block font-mono text-xs text-white/60 mb-2">NETWORK EGRESS POLICY</label>
                      <select
                        value={configEgress}
                        onChange={(e) => setConfigEgress(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-black p-2.5 font-mono text-xs text-white focus:outline-none focus:border-white/40"
                      >
                        <option value="default_deny">default_deny (Zero external egress)</option>
                        <option value="allowlist_strict">allowlist_strict (Scoped npm / PyPI)</option>
                        <option value="loopback_only">loopback_only (Isolated localhost only)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/40 p-3.5">
                      <div>
                        <span className="text-xs font-medium text-white block">AI Agent Application Probing</span>
                        <span className="text-[11px] text-white/60">Autonomous runtime API inspection</span>
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

                  {/* Right: Code Preview */}
                  <div className="lg:col-span-7">
                    <CodeSnippet code={generatedYaml} title=".workflo/config.yaml" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* CARD 4: RECEIPT PLAYGROUND                                    */}
          {/* ============================================================== */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-colors hover:border-white/20">
            {/* Card Header (Clickable) */}
            <button
              type="button"
              onClick={() => toggleCard("receipt")}
              className="w-full text-left"
            >
              <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                <img
                  src="/images/plate-prove.webp"
                  alt="Receipt Playground plate"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    ED25519 & MERKLE
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-medium text-white">Cryptographic Receipt Inspector</h2>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Select sample execution receipts to audit Merkle roots and verify Ed25519 signatures live.
                  </p>
                </div>
                <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openCards.receipt ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {openCards.receipt && (
              <div className="border-t border-white/[0.06] p-6 pt-2">
                {/* Sample Selector */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {SAMPLE_RECEIPTS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        setSelectedReceiptId(sample.id);
                        setVerifiedState("idle");
                      }}
                      className={`rounded-lg px-4 py-2 font-mono text-xs transition-colors border ${
                        selectedReceiptId === sample.id
                          ? "border-white bg-white text-black font-semibold"
                          : "border-white/[0.08] bg-black/40 text-white/70 hover:text-white"
                      }`}
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>

                {/* Verification Box */}
                <div className="rounded-2xl border border-white/[0.08] bg-black/80 p-5 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">Execution ID:</span>
                      <span className="text-white">{currentReceipt.json.execution_id}</span>
                      <span className="text-white/20">|</span>
                      <span className="text-white/40">Verdict:</span>
                      <span className="font-semibold text-white">{currentReceipt.verdict}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={verifiedState === "verifying"}
                      className="rounded-lg border border-white/20 bg-white/10 px-4 py-1.5 font-mono text-xs text-white hover:bg-white/20 transition-colors"
                    >
                      {verifiedState === "idle" && "Verify Cryptographic Proof"}
                      {verifiedState === "verifying" && "Recomputing Merkle Root..."}
                      {verifiedState === "valid" && "Re-verify Signature"}
                    </button>
                  </div>

                  {/* Verification Banner */}
                  {verifiedState === "valid" && (
                    <div className="mb-4 rounded-xl border border-white/30 bg-white/5 p-4 text-xs font-mono">
                      <div className="flex items-center gap-2 text-white font-semibold mb-1">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>CRYPTOGRAPHIC PROOF VERIFIED: NON-REPUDIATION VALID</span>
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        Merkle tree root recomputed over {currentReceipt.json.audit.total_syscalls} syscalls and teardown status matches published digest. Ed25519 signature is authentic under key <code className="text-white font-semibold">workflo-signer-2026-a</code>.
                      </p>
                    </div>
                  )}

                  {/* JSON Payload Display */}
                  <pre className="max-h-80 overflow-y-auto rounded-lg bg-black p-4 text-white/80 leading-relaxed font-light">
                    {JSON.stringify(currentReceipt.json, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* CARD 5: API REFERENCE SANDBOX                                  */}
          {/* ============================================================== */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-colors hover:border-white/20">
            {/* Card Header (Clickable) */}
            <button
              type="button"
              onClick={() => toggleCard("api")}
              className="w-full text-left"
            >
              <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                <img
                  src="/images/plate-execute.webp"
                  alt="API plate"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    REST & SDK
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-medium text-white">Execution API Reference & Sandbox</h2>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Tabbed cURL, TypeScript, and Python request schemas with live simulated JSON responses.
                  </p>
                </div>
                <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openCards.api ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {openCards.api && (
              <div className="border-t border-white/[0.06] p-6 pt-2">
                {/* Endpoint Tabs */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
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
                        className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors border ${
                          apiEndpoint === ep.id
                            ? "border-white bg-white text-black font-medium"
                            : "border-white/[0.06] bg-black/40 text-white/60 hover:text-white"
                        }`}
                      >
                        {ep.label}
                      </button>
                    ))}
                  </div>

                  {/* Language Selector */}
                  <div className="flex rounded-lg border border-white/10 p-0.5 bg-black">
                    {(["curl", "ts", "py"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setApiLang(lang)}
                        className={`rounded-md px-3 py-1 font-mono text-xs uppercase transition-colors ${
                          apiLang === lang ? "bg-white/20 text-white font-medium" : "text-white/40 hover:text-white"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Request Code Snippet */}
                <CodeSnippet
                  code={apiSnippets[apiEndpoint][apiLang]}
                  title={`Request (${apiLang.toUpperCase()})`}
                />

                {/* Response Preview */}
                <div className="mt-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] bg-black/80 px-4 py-2 rounded-t-xl border-x border-t">
                    <span className="font-mono text-[11px] text-white/60">Simulated Response (200 OK)</span>
                    <span className="font-mono text-[10px] text-white/40">application/json</span>
                  </div>
                  <pre className="rounded-b-xl border border-white/[0.08] bg-black p-4 font-mono text-xs text-white/80 leading-relaxed overflow-x-auto">
                    <code>{apiSnippets[apiEndpoint].response}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* CARD 6: HOST SETUP & BOUNDARIES                                */}
          {/* ============================================================== */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-colors hover:border-white/20">
            {/* Card Header (Clickable) */}
            <button
              type="button"
              onClick={() => toggleCard("setup")}
              className="w-full text-left"
            >
              <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                <img
                  src="/images/plate-verify.webp"
                  alt="Host setup plate"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    HOST REQUIREMENTS
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-medium text-white">Installation & Host Readiness Guide</h2>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Prerequisites for KVM hardware acceleration, standalone binary curl, and npm distribution.
                  </p>
                </div>
                <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openCards.setup ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {openCards.setup && (
              <div className="border-t border-white/[0.06] p-6 pt-4 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white">1. Verify KVM Virtualization</h3>
                  <p className="mt-1 text-xs text-white/60">
                    Production runs require KVM hardware acceleration. Check permissions on your Linux host:
                  </p>
                  <CodeSnippet code="ls -la /dev/kvm" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">2. Standalone One-Line Diagnostic</h3>
                  <p className="mt-1 text-xs text-white/60">
                    Test your cgroups v2 hierarchy and seccomp-bpf filter support:
                  </p>
                  <CodeSnippet code="curl -fsSL https://workflo.dev/doctor.sh | sh" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">3. Install the Workflo CLI</h3>
                  <p className="mt-1 text-xs text-white/60">
                    Install globally via npm (Node 20+ required) or standalone binary:
                  </p>
                  <CodeSnippet
                    code={`# Global npm package
npm install -g @workflo/cli

# Alternatively, direct Linux x86_64 binary
curl -fsSL https://releases.workflo.dev/workflo-linux-x86_64 -o /usr/local/bin/workflo
chmod +x /usr/local/bin/workflo`}
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-black/60 p-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold block mb-1">
                    Security Boundary Disclosure
                  </span>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    Workflo is in development preview. Firecracker/KVM is the approved production target for untrusted-code execution. Docker and Linux namespace execution modes are development-only paths and must not be represented as production-accepted isolation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* CARD 7: TROUBLESHOOTING & ERROR CATALOG                        */}
          {/* ============================================================== */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md transition-colors hover:border-white/20">
            {/* Card Header (Clickable) */}
            <button
              type="button"
              onClick={() => toggleCard("troubleshooting")}
              className="w-full text-left"
            >
              <div className="relative h-28 w-full overflow-hidden border-b border-white/[0.06]">
                <img
                  src="/images/plate-trust.webp"
                  alt="Troubleshooting plate"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    DIAGNOSTICS & FIXES
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-medium text-white">Troubleshooting & Error Catalog</h2>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Resolutions for hypervisor permissions, policy egress violations, and teardown zombie leaks.
                  </p>
                </div>
                <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${openCards.troubleshooting ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {openCards.troubleshooting && (
              <div className="border-t border-white/[0.06] p-6 pt-4 space-y-4">
                {[
                  {
                    code: "ERR_KVM_PERMISSION_DENIED",
                    category: "virtualization",
                    cause: "Host user does not have read/write access to /dev/kvm.",
                    fix: "Run `sudo usermod -aG kvm $USER` and reload session, or run `workflo doctor --fix`.",
                  },
                  {
                    code: "ERR_POLICY_EGRESS_VIOLATION",
                    category: "network",
                    cause: "The sandboxed process attempted unauthorized outbound network connection.",
                    fix: "Add the required CIDR or domain to `.workflo/config.yaml` under `boundaries.network.allowed_cidrs`.",
                  },
                  {
                    code: "ERR_TEARDOWN_ZOMBIE_DETECTED",
                    category: "teardown",
                    cause: "A background process spawned during tests did not terminate upon job completion.",
                    fix: "Ensure test scripts invoke proper cleanup handlers, or pass `--timeout` to force SIGKILL.",
                  },
                  {
                    code: "ERR_RECEIPT_SIGNATURE_MISMATCH",
                    category: "cryptography",
                    cause: "The receipt payload was altered after signature generation, or incorrect public key used.",
                    fix: "Re-run `workflo verify` with canonical keyfile or check if JSON was reformatted without preserving canonical ordering.",
                  },
                ].map((item) => (
                  <div key={item.code} className="rounded-xl border border-white/[0.08] bg-black/50 p-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2">
                      <code className="font-mono text-xs font-semibold text-white">{item.code}</code>
                      <span className="font-mono text-[10px] uppercase text-white/40">{item.category}</span>
                    </div>
                    <p className="text-xs text-white/60">
                      <strong className="text-white/80 font-medium">Cause:</strong> {item.cause}
                    </p>
                    <p className="mt-1.5 text-xs text-white/90 font-mono text-[11px] bg-black/60 p-2 rounded border border-white/[0.04]">
                      <strong>Resolution:</strong> {item.fix}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </section>

      <Footer />
    </div>
  );
}
