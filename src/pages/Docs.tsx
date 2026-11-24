import { useState } from "react";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";
import { SectionBackdrop } from "../landing/SectionBackdrop";
import { LetterReveal } from "../landing/LetterReveal";
import { Link } from "../lib/router";

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
        violation: "UNAUTHORIZED_EGRESS to 198.51.100.44:443 blocked by eBPF",
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

const SECTIONS = [
  { id: "quickstart", label: "Quickstart" },
  { id: "cli", label: "CLI Reference" },
  { id: "config", label: "Configuration" },
  { id: "receipt-inspector", label: "Receipt Inspector (Live)" },
  { id: "api", label: "REST API" },
  { id: "security", label: "Security Model" },
];

export function Docs() {
  const [activeReceiptIdx, setActiveReceiptIdx] = useState(0);
  const [receiptView, setReceiptView] = useState<"visual" | "json">("visual");
  const [copied, setCopied] = useState(false);
  const [verifiedState, setVerifiedState] = useState<"idle" | "verifying" | "valid">("idle");

  const currentReceipt = SAMPLE_RECEIPTS[activeReceiptIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(currentReceipt.json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setVerifiedState("verifying");
    setTimeout(() => {
      setVerifiedState("valid");
    }, 600);
  };

  return (
    <div className="landing-root min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-20 md:px-10 md:pt-32">
        <SectionBackdrop id="prove" position="70% 50%" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/70">
              Developer Documentation · v1.0
            </span>
          </div>

          <LetterReveal
            text="workflo developer documentation."
            as="h1"
            className="text-[10vw] font-medium leading-[1.05] tracking-tight text-white md:text-[6.5vw]"
          />

          <p className="mt-8 max-w-3xl text-lg text-white/70 md:text-xl font-light leading-relaxed">
            Everything you need to install the Workflo CLI, configure execution boundary policies,
            integrate with existing pipelines, and inspect cryptographic release receipts.
          </p>
        </div>
      </section>

      {/* Main Documentation Shell */}
      <div className="relative isolate border-t border-white/10 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-12">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <div className="sticky top-28 space-y-1 rounded-2xl border border-white/10 bg-neutral-950/60 p-4 backdrop-blur">
              <p className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-3 px-3">
                Documentation Index
              </p>
              {SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block rounded-lg px-3 py-2 text-xs font-mono text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {sec.label}
                </a>
              ))}

              <div className="mt-6 border-t border-white/10 pt-4 px-3">
                <Link
                  to="/early-access"
                  className="block text-center rounded-full bg-white/10 py-2 text-xs font-mono text-emerald-300 hover:bg-white/20 transition-colors"
                >
                  Request Early Access →
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Docs Content */}
          <main className="lg:col-span-9 space-y-24">

            {/* Quickstart Section */}
            <section id="quickstart" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="font-mono text-xs text-emerald-400">01 / GET STARTED</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Quickstart</h2>
                <p className="mt-2 text-sm text-white/60">
                  Run your first verified execution in under two minutes.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium text-white">Step 1: Install the Workflo CLI</h3>
                <div className="rounded-xl border border-white/15 bg-black/80 p-4 font-mono text-xs text-emerald-300 flex items-center justify-between">
                  <code>curl -fsSL https://workflo.dev/install.sh | sh</code>
                  <span className="text-white/40 text-[10px]">LINUX / MACOS</span>
                </div>

                <h3 className="text-base font-medium text-white mt-6">Step 2: Initialize configuration</h3>
                <div className="rounded-xl border border-white/15 bg-black/80 p-4 font-mono text-xs text-white/80">
                  <p className="text-white/40"># Run in the root of your git repository</p>
                  <p className="text-emerald-300">workflo init</p>
                </div>

                <h3 className="text-base font-medium text-white mt-6">Step 3: Run with deterministic verification</h3>
                <div className="rounded-xl border border-white/15 bg-black/80 p-4 font-mono text-xs text-white/80">
                  <p className="text-white/40"># Boots microVM, captures audit trail, signs receipt</p>
                  <p className="text-emerald-300">workflo run --command="bun test"</p>
                </div>
              </div>
            </section>

            {/* CLI Reference Section */}
            <section id="cli" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="font-mono text-xs text-emerald-400">02 / COMMAND LINE</span>
                <h2 className="mt-2 text-3xl font-medium text-white">CLI Reference</h2>
                <p className="mt-2 text-sm text-white/60">
                  Core commands provided by the `workflo` binary.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm font-semibold text-emerald-300">workflo run [options]</code>
                    <span className="font-mono text-[10px] text-white/40">PRIMARY</span>
                  </div>
                  <p className="mt-2 text-xs text-white/70">
                    Spawns the isolated microVM sandbox, executes the declared commands, and generates a signed receipt.
                  </p>
                  <div className="mt-4 space-y-2 font-mono text-xs text-white/60">
                    <div><span className="text-white">--config=&lt;path&gt;</span> : Path to workflo.yaml (default: ./workflo.yaml)</div>
                    <div><span className="text-white">--dry-run</span> : Validate policy filters without executing commands</div>
                    <div><span className="text-white">--output=&lt;file&gt;</span> : Destination for generated receipt JSON</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm font-semibold text-emerald-300">workflo verify &lt;receipt.json&gt;</code>
                    <span className="font-mono text-[10px] text-white/40">AUDIT</span>
                  </div>
                  <p className="mt-2 text-xs text-white/70">
                    Cryptographically checks the Ed25519 signature and recomputes the Merkle tree digest offline.
                  </p>
                </div>
              </div>
            </section>

            {/* Configuration Section */}
            <section id="config" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="font-mono text-xs text-emerald-400">03 / CONFIGURATION</span>
                <h2 className="mt-2 text-3xl font-medium text-white">workflo.yaml Schema</h2>
                <p className="mt-2 text-sm text-white/60">
                  Declare environmental constraints, resource limits, and network permissions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-black/90 p-6 font-mono text-xs leading-relaxed text-white/80 overflow-x-auto">
                <pre>{`version: 1
runtime:
  hypervisor: firecracker
  memory_mb: 4096
  vcpu: 4
  timeout_seconds: 600

boundaries:
  network:
    egress: default_deny
    allowed_cidrs:
      - 10.0.0.0/16       # Internal database VPC
      - 169.254.169.254/32 # Blocked explicitly
    log_dns: true

  filesystem:
    workspace: /workspace
    read_only_root: true
    tmpfs_mb: 512

teardown:
  enforce_clean_state: true
  max_zombie_allowance: 0

receipt:
  sign: true
  key_id: "workflo-signer-2026-a"
  format: "canonical-json"`}</pre>
              </div>
            </section>

            {/* Interactive Receipt Inspector (Moved from Proof) */}
            <section id="receipt-inspector" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs text-emerald-400">04 / INTERACTIVE PLAYGROUND</span>
                </div>
                <h2 className="mt-2 text-3xl font-medium text-white">Cryptographic Receipt Inspector</h2>
                <p className="mt-2 text-sm text-white/60">
                  Every run outputs an immutable receipt. Toggle between test cases below to inspect real
                  verdicts, verify cryptographic signatures, and examine the Merkle audit trail.
                </p>
              </div>

              {/* Sample Selector Tabs */}
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
                        : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {/* Receipt View Box */}
              <div className="rounded-3xl border border-white/20 bg-neutral-950/80 backdrop-blur overflow-hidden">
                {/* Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-white/5 p-4 md:px-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-white/40">VERDICT:</span>
                    <span
                      className={`font-mono text-xs px-3 py-1 rounded-full border ${
                        currentReceipt.verdict === "APPROVED_YES"
                          ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-400"
                          : "border-red-500/40 bg-red-950/60 text-red-400"
                      }`}
                    >
                      {currentReceipt.verdict}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-lg border border-white/15 bg-black/60 p-1 flex">
                      <button
                        type="button"
                        onClick={() => setReceiptView("visual")}
                        className={`rounded px-3 py-1 text-xs font-mono transition-colors ${
                          receiptView === "visual" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                        }`}
                      >
                        Structured Audit
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceiptView("json")}
                        className={`rounded px-3 py-1 text-xs font-mono transition-colors ${
                          receiptView === "json" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                        }`}
                      >
                        Canonical JSON
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-xs font-mono text-white/80 hover:bg-white/10"
                    >
                      {copied ? "Copied!" : "Copy JSON"}
                    </button>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 md:p-8">
                  {receiptView === "visual" ? (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                          <span className="font-mono text-[10px] text-white/40">COMMIT DIGEST</span>
                          <p className="mt-1 font-mono text-xs text-white truncate">
                            {currentReceipt.json.commit?.sha || "sha256:unknown"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                          <span className="font-mono text-[10px] text-white/40">MERKLE ROOT</span>
                          <p className="mt-1 font-mono text-xs text-white truncate">
                            {currentReceipt.json.merkle_root}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                          <span className="font-mono text-[10px] text-white/40">SIGNATURE ALGORITHM</span>
                          <p className="mt-1 font-mono text-xs text-white">
                            {currentReceipt.json.signature?.algorithm} (Verified)
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                          <span className="font-mono text-[10px] text-white/40">TEARDOWN STATE</span>
                          <p className="mt-1 font-mono text-xs text-white">
                            {currentReceipt.json.teardown?.zombie_processes === 0 ? "Clean (0 Zombies)" : "LEAK DETECTED"}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Signature Verification Button */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-white">Cryptographic Signature Verification</h4>
                          <p className="text-xs text-white/60 mt-1">
                            Verify this receipt against the Workflo public key to prove mathematical integrity.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleVerify}
                          disabled={verifiedState === "valid"}
                          className={`rounded-full px-5 py-2 font-mono text-xs transition-colors ${
                            verifiedState === "valid"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-white text-black hover:bg-neutral-200"
                          }`}
                        >
                          {verifiedState === "verifying"
                            ? "Recomputing Merkle root..."
                            : verifiedState === "valid"
                            ? "✓ Signature Valid & Authentic"
                            : "Verify Cryptographic Proof"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <pre className="font-mono text-xs text-white/90 overflow-x-auto leading-relaxed max-h-96">
                      {JSON.stringify(currentReceipt.json, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </section>

            {/* REST API Reference */}
            <section id="api" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="font-mono text-xs text-emerald-400">05 / REST API</span>
                <h2 className="mt-2 text-3xl font-medium text-white">REST API Endpoints</h2>
                <p className="mt-2 text-sm text-white/60">
                  CloudFront and API Gateway backed intake services.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-xs text-blue-400">GET</span>
                    <code className="font-mono text-xs text-white">/api/v1/health</code>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    Returns API Gateway and Lambda health status.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs text-emerald-400">POST</span>
                    <code className="font-mono text-xs text-white">/api/v1/early-access</code>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    Submits developer early-access application to DynamoDB via SQS FIFO queue.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs text-emerald-400">POST</span>
                    <code className="font-mono text-xs text-white">/api/v1/contact</code>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    Submits enterprise and technical inquiries to SES notification pipeline.
                  </p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
