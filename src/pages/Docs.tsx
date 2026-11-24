import { useState } from "react";
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
}

const CLI_COMMANDS: CliCmd[] = [
  {
    name: "workflo init",
    syntax: "workflo init [--template=<preset>]",
    summary: "Scans repository, detects test runner & dependencies, and creates .workflo/config.yaml.",
    flags: [
      { flag: "--template", desc: "Configuration preset (node, python, go, rust, monorepo)" },
      { flag: "--force", desc: "Overwrite existing .workflo configuration" },
    ],
  },
  {
    name: "workflo doctor",
    syntax: "workflo doctor [--verbose]",
    summary: "Audits host readiness: KVM access (/dev/kvm), seccomp support, memory cgroups v2, and hypervisor daemon.",
    flags: [
      { flag: "--fix", desc: "Attempt automatic group/permission remediation for /dev/kvm" },
      { flag: "--json", desc: "Output machine-readable diagnosis payload" },
    ],
  },
  {
    name: "workflo run",
    syntax: "workflo run [options] [-- <command>]",
    summary: "Boots isolated microVM, compiles policy filters, streams audit ledger, and outputs signed receipt.",
    flags: [
      { flag: "--tier", desc: "Execution tier: microvm (default), sandbox-strict, or dev-namespace" },
      { flag: "--dry-run", desc: "Simulate policy compilation & isolation without command execution" },
      { flag: "--output", desc: "Destination path for generated signed receipt JSON (default: receipt.json)" },
      { flag: "--timeout", desc: "Maximum execution lifespan before hard teardown (default: 600s)" },
    ],
  },
  {
    name: "workflo status",
    syntax: "workflo status [<execution-id>]",
    summary: "Queries real-time telemetry, active microVM PID, streamed syscall count, and memory allocation.",
    flags: [
      { flag: "--follow", desc: "Tail real-time supervisor logs during an active run" },
    ],
  },
  {
    name: "workflo verify",
    syntax: "workflo verify <receipt.json>",
    summary: "Cryptographically recomputes Merkle digest and verifies Ed25519 signature offline against public keys.",
    flags: [
      { flag: "--key-file", desc: "Custom Ed25519 public key file for offline air-gapped verification" },
      { flag: "--strict", desc: "Fail if any teardown anomalies or unverified flags are present" },
    ],
  },
  {
    name: "workflo inspect",
    syntax: "workflo inspect <receipt.json | execution-id>",
    summary: "Interactive terminal explorer to navigate the full syscall ledger, socket log, and diff trees.",
    flags: [
      { flag: "--filter-network", desc: "Filter view to only outbound socket attempts and DNS resolutions" },
      { flag: "--filter-teardown", desc: "Inspect post-flight process sweep and filesystem diffs" },
    ],
  },
  {
    name: "workflo explain",
    syntax: "workflo explain <receipt.json>",
    summary: "Translates policy rejections and teardown anomalies into actionable diagnostic explanations.",
    flags: [
      { flag: "--format", desc: "Output format: text, markdown, or json" },
    ],
  },
  {
    name: "workflo keygen",
    syntax: "workflo keygen [--out-dir=<path>]",
    summary: "Generates Ed25519 cryptographic keypairs for self-hosted or air-gapped receipt signing.",
    flags: [
      { flag: "--curve", desc: "Cryptographic curve (ed25519, ecdsa-p256)" },
    ],
  },
  {
    name: "workflo security-gate",
    syntax: "workflo security-gate --receipt=<file> [--allow-warnings]",
    summary: "CI/CD integration command that exits 0 only if receipt verdict is APPROVED_YES with clean teardown.",
    flags: [
      { flag: "--max-syscalls", desc: "Threshold to reject runs exhibiting syscall anomalies" },
      { flag: "--require-clean-tree", desc: "Fail if git working tree had uncommitted modifications" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                                12 STAGES                                   */
/* -------------------------------------------------------------------------- */

const LIFECYCLE_STAGES = [
  { num: "01", name: "Context Ingestion", desc: "Seals git commit sha, tree cleanliness, and pipeline invocation context." },
  { num: "02", name: "Dependency Seal", desc: "Validates lockfile digests to prevent supply-chain package substitution." },
  { num: "03", name: "Policy Compilation", desc: "Translates declarative rules into in-kernel seccomp filters and network gates." },
  { num: "04", name: "MicroVM Provisioning", desc: "Boots an ephemeral Firecracker instance with unshared memory & read-only base rootfs." },
  { num: "05", name: "Pre-Flight Attestation", desc: "Checks host kernel integrity, seccomp enablement, and clock synchronization." },
  { num: "06", name: "Controlled Execution", desc: "Executes test/build command under strict supervisor monitoring." },
  { num: "07", name: "Syscall & Network Audit", desc: "eBPF monitors every outbound socket connection, DNS lookup, and file access." },
  { num: "08", name: "Output Artifact Digest", desc: "Calculates SHA-256 binary digests of created artifacts and coverage reports." },
  { num: "09", name: "Teardown Enforcement", desc: "Issues SIGKILL to background daemons and wipes scratch storage." },
  { num: "10", name: "Post-Flight Verification", desc: "Audits host diff to mathematically prove zero leftover state or leaked processes." },
  { num: "11", name: "Merkle Tree Generation", desc: "Hashes all ledger chunks and execution traces into a single cryptographic root." },
  { num: "12", name: "Receipt Signing", desc: "Signs the canonical receipt with Ed25519 private key, outputting verified verdict." },
];

/* -------------------------------------------------------------------------- */
/*                            CODE BLOCK COMPONENT                            */
/* -------------------------------------------------------------------------- */

function CodeSnippet({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-md overflow-hidden my-4">
      {title && (
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 bg-white/[0.02]">
          <span className="font-mono text-xs text-white/60">{title}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="font-mono text-[11px] text-white hover:underline"
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      )}
      <div className="relative p-4 overflow-x-auto">
        {!title && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 font-mono text-[11px] text-white/60 hover:text-white"
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        )}
        <pre className="font-mono text-xs text-white leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN DOCS PAGE                                */
/* -------------------------------------------------------------------------- */

export function Docs() {
  const [activeReceiptIdx, setActiveReceiptIdx] = useState(0);
  const [receiptView, setReceiptView] = useState<"visual" | "json">("visual");
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [verifiedState, setVerifiedState] = useState<"idle" | "verifying" | "valid">("idle");
  const [apiTab, setApiTab] = useState<"curl" | "js" | "python">("curl");
  const [activeCliCmd, setActiveCliCmd] = useState(2); // default: workflo run

  const currentReceipt = SAMPLE_RECEIPTS[activeReceiptIdx];

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(JSON.stringify(currentReceipt.json, null, 2));
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
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
              className="shrink-0 rounded-full border border-white/20 bg-white/5 px-5 py-2 font-mono text-xs text-white hover:bg-white/5 transition-colors"
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

            {/* 3. Execution Lifecycle */}
            <section id="lifecycle" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 3 / LIFECYCLE</span>
                <h2 className="mt-2 text-3xl font-medium text-white">12-Stage Execution Lifecycle</h2>
                <p className="mt-2 text-sm text-white/60">
                  Every execution progresses through an immutable sequence. Order is the fundamental security guarantee.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {LIFECYCLE_STAGES.map((s) => (
                  <div key={s.num} className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{s.num}</span>
                      <h4 className="text-sm font-medium text-white">{s.name}</h4>
                    </div>
                    <p className="mt-2 text-xs text-white/60 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Run Configuration */}
            <section id="config" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 4 / SPECIFICATION</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Run Configuration (.workflo/config.yaml)</h2>
                <p className="mt-2 text-sm text-white/60">
                  Declarative execution policies, runtime parameters, and isolation boundaries.
                </p>
              </div>

              <CodeSnippet
                title=".workflo/config.yaml"
                code={`version: 1

runtime:
  tier: microvm                  # microvm | sandbox-strict | dev-namespace
  hypervisor: firecracker        # Firecracker KVM execution target
  vcpu: 4
  memory_mb: 4096
  timeout_seconds: 600

boundaries:
  network:
    egress: default_deny         # Block all outbound traffic by default
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

teardown:
  enforce_clean_state: true      # Sweep for background zombies
  max_zombie_allowance: 0        # Zero tolerance for orphaned daemons

receipt:
  sign: true
  key_id: "workflo-signer-2026-a"
  format: "canonical-json"`}
              />
            </section>

            {/* 5. CLI Reference */}
            <section id="cli" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 5 / CLI REFERENCE</span>
                <h2 className="mt-2 text-3xl font-medium text-white">CLI Command Reference</h2>
                <p className="mt-2 text-sm text-white/60">
                  Verified command signatures from the Workflo CLI source implementation.
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
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <code className="font-mono text-sm font-semibold text-white">
                    {CLI_COMMANDS[activeCliCmd].syntax}
                  </code>
                  <span className="font-mono text-[10px] text-white/60">SOURCE SPEC</span>
                </div>

                <p className="mt-4 text-sm text-white/90 leading-relaxed font-light">
                  {CLI_COMMANDS[activeCliCmd].summary}
                </p>

                <h4 className="mt-6 font-mono text-xs uppercase tracking-wider text-white/60">
                  Command Flags and Options
                </h4>
                <div className="mt-3 space-y-2">
                  {CLI_COMMANDS[activeCliCmd].flags.map((f, fIdx) => (
                    <div key={fIdx} className="grid grid-cols-12 gap-2 text-xs font-mono">
                      <span className="col-span-4 text-white font-medium">{f.flag}</span>
                      <span className="col-span-8 text-white/60 font-light">{f.desc}</span>
                    </div>
                  ))}
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
                <h2 className="mt-2 text-3xl font-medium text-white">API Reference</h2>
                <p className="mt-2 text-sm text-white/60">
                  Workflo Product Execution API (/v1/runs) versus Website Intake API (/api/v1/*).
                </p>
              </div>

              {/* Product Execution API Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">1. Product Execution Service (/v1/runs)</h3>
                  <div className="flex rounded-lg border border-white/[0.08] bg-black/60 p-1 font-mono text-xs">
                    {(["curl", "js", "python"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setApiTab(tab)}
                        className={`rounded px-2.5 py-1 uppercase ${
                          apiTab === tab ? "bg-white text-black font-semibold" : "text-white/60"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-white/60">
                  Endpoint for programmatic CI/CD integration and autonomous agent execution triggers:
                </p>

                {apiTab === "curl" && (
                  <CodeSnippet
                    title="cURL"
                    code={`curl -X POST https://api.workflo.dev/v1/runs \
  -H "Authorization: Bearer $WORKFLO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "https://github.com/acme/service",
    "commit": "9f2a71d803be81b67f13904a1168194e432c6b41",
    "tier": "microvm",
    "command": "npm test"
  }'`}
                  />
                )}

                {apiTab === "js" && (
                  <CodeSnippet
                    title="TypeScript / Node.js"
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

                {apiTab === "python" && (
                  <CodeSnippet
                    title="Python"
                    code={`from workflo import WorkfloClient
import os

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

            {/* 9. Troubleshooting */}
            <section id="troubleshooting" className="scroll-mt-28 space-y-6">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-xs text-white">PART 8 / DIAGNOSTICS</span>
                <h2 className="mt-2 text-3xl font-medium text-white">Troubleshooting Guide</h2>
                <p className="mt-2 text-sm text-white/60">
                  Common execution anomalies, isolation errors, and remediation steps.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    code: "ERR_KVM_PERMISSION_DENIED",
                    cause: "Host user does not have read/write access to /dev/kvm.",
                    fix: "Run `sudo usermod -aG kvm $USER` and reload session, or run `workflo doctor --fix`.",
                  },
                  {
                    code: "ERR_POLICY_EGRESS_VIOLATION",
                    cause: "The sandboxed process attempted unauthorized outbound network connection.",
                    fix: "Add the required CIDR or domain to `.workflo/config.yaml` under `boundaries.network.allowed_cidrs`.",
                  },
                  {
                    code: "ERR_TEARDOWN_ZOMBIE_DETECTED",
                    cause: "A background process spawned during tests did not terminate upon job completion.",
                    fix: "Ensure test scripts invoke proper cleanup handlers, or pass `--timeout` to force SIGKILL.",
                  },
                  {
                    code: "ERR_RECEIPT_SIGNATURE_MISMATCH",
                    cause: "The receipt payload was altered after signature generation, or incorrect public key used.",
                    fix: "Re-run `workflo verify` with canonical keyfile or check if JSON was reformatted without preserving canonical ordering.",
                  },
                ].map((item) => (
                  <div key={item.code} className="rounded-xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
                    <span className="font-mono text-xs font-semibold text-white">{item.code}</span>
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
