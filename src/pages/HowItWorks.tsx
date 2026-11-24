import { useState } from "react";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";
import { SectionBackdrop } from "../landing/SectionBackdrop";
import { LetterReveal } from "../landing/LetterReveal";
import { Link } from "../lib/router";

interface Stage {
  number: string;
  name: string;
  phase: "PRE-FLIGHT" | "EXECUTION" | "POST-FLIGHT" | "RECEIPT";
  description: string;
  securityGuarantee: string;
  terminalLog: string;
}

const STAGES: Stage[] = [
  {
    number: "01",
    name: "Context Ingestion",
    phase: "PRE-FLIGHT",
    description: "Captures the exact git commit tree, parent hashes, environment flags, and pipeline triggers.",
    securityGuarantee: "Deterministic origin identification; zero implicit environment inheritance.",
    terminalLog: "[INGEST] commit=9f2a71d branch=main tree_hash=sha256:4b1a8d... status=SEALED"
  },
  {
    number: "02",
    name: "Dependency Seal",
    phase: "PRE-FLIGHT",
    description: "Resolves package manifests against lockfile digests to block phantom supply-chain poisoning.",
    securityGuarantee: "Guarantees runtime dependencies match verified checksums exactly.",
    terminalLog: "[DEPS] verifying 142 dependencies against lockfile digests... 142/142 VALID"
  },
  {
    number: "03",
    name: "Policy Compilation",
    phase: "PRE-FLIGHT",
    description: "Transforms declarative security policies into seccomp BPF filters and network firewall rules.",
    securityGuarantee: "Hard boundaries enforced before a single byte of user instructions runs.",
    terminalLog: "[POLICY] compiled 24 seccomp filters + egress CIDR allowlist: [internal-db, kms]"
  },
  {
    number: "04",
    name: "MicroVM Provisioning",
    phase: "PRE-FLIGHT",
    description: "Boots a dedicated, hardware-isolated microVM instance with a pristine, read-only root image.",
    securityGuarantee: "Hardware-level memory and CPU virtualization. Zero container escape surface.",
    terminalLog: "[VM] boot guest hypervisor: id=vm-9902 time=84ms mem=4096MB vcpu=4"
  },
  {
    number: "05",
    name: "Pre-Flight Attestation",
    phase: "PRE-FLIGHT",
    description: "Validates host kernel integrity, seccomp enablement, and clock synchronization prior to launch.",
    securityGuarantee: "Confirms host environment has not been tampered with or modified.",
    terminalLog: "[ATTEST] kernel_integrity=OK seccomp=ACTIVE clock_drift=0.001ms"
  },
  {
    number: "06",
    name: "Controlled Execution",
    phase: "EXECUTION",
    description: "Executes the build or test command under strict supervisor monitoring and stdout/stderr capture.",
    securityGuarantee: "Every output stream is timestamped to the microsecond and indexed into the ledger.",
    terminalLog: "[EXEC] running: bun test --bail (PID 104) ... 38 test suites passed in 1.42s"
  },
  {
    number: "07",
    name: "Syscall & Network Audit",
    phase: "EXECUTION",
    description: "eBPF tracing monitors every system call, file descriptor access, and socket outbound transmission.",
    securityGuarantee: "Detects unauthorized egress attempts, unexpected sub-processes, or privilege escalations.",
    terminalLog: "[AUDIT] traced 4,119 syscalls | outbound sockets: 1 (authorized kms.us-east-1)"
  },
  {
    number: "08",
    name: "Output Artifact Digest",
    phase: "EXECUTION",
    description: "Calculates cryptographic SHA-256 digests of generated binaries, test outputs, and coverage reports.",
    securityGuarantee: "Cryptographic binding of all outputs to this specific execution lifecycle.",
    terminalLog: "[DIGEST] build_dist=sha256:7c9921e... coverage_xml=sha256:fa2341..."
  },
  {
    number: "09",
    name: "Teardown Enforcement",
    phase: "POST-FLIGHT",
    description: "Issues SIGKILL to any background daemons, cleans temporary storage, and halts the microVM.",
    securityGuarantee: "No zombie processes, dangling network listeners, or cached memory state survived.",
    terminalLog: "[TEARDOWN] sweeping orphaned processes: 0 found | filesystem scrub verified"
  },
  {
    number: "10",
    name: "Post-Flight Verification",
    phase: "POST-FLIGHT",
    description: "Audits host diff state to prove the execution left zero footprint on the underlying host.",
    securityGuarantee: "Mathematically confirms absolute sandbox cleanliness.",
    terminalLog: "[VERIFY] diff /tmp vs clean_state: 0 diffs. host_integrity=INTACT"
  },
  {
    number: "11",
    name: "Merkle Tree Generation",
    phase: "RECEIPT",
    description: "Hashes every ledger block, syscall trace, and artifact digest into a single Merkle root.",
    securityGuarantee: "Immutable tamper-evident proof: altering any past log entry invalidates the root.",
    terminalLog: "[MERKLE] constructed 8-level tree: root=sha256:88e09f182bc2..."
  },
  {
    number: "12",
    name: "Receipt Signing",
    phase: "RECEIPT",
    description: "Workflo cryptographic authority signs the receipt payload with Ed25519 private key.",
    securityGuarantee: "Offline verifiable by any third party; non-repudiation release verdict.",
    terminalLog: "[RECEIPT] signature=ed25519:6c291... verdict=APPROVED_YES (receipt-9902.json)"
  }
];

export function HowItWorks() {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const activeStage = STAGES[activeStageIdx];

  return (
    <div className="landing-root min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-28 md:px-10 md:pt-32">
        <SectionBackdrop id="verify" position="58% 50%" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/5 px-4 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C7F36B] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/70">
              Execution Lifecycle · Step-by-Step
            </span>
          </div>

          <LetterReveal
            text="what happens between a commit and a receipt."
            as="h1"
            className="text-[10vw] font-medium leading-[1.05] tracking-tight text-white md:text-[6.5vw]"
          />

          <p className="mt-8 max-w-3xl text-lg text-white/70 md:text-xl font-light leading-relaxed">
            An execution is an immutable sequence. Context is captured first, boundaries are applied
            before code runs, and teardown is verified before a cryptographic receipt exists.
          </p>
        </div>
      </section>

      {/* 12-Stage Lifecycle Explorer */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="execute" position="68% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">The Lifecycle</p>
            <LetterReveal
              text="the twelve stages of deterministic proof."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
            <p className="mt-4 max-w-2xl text-base text-white/60">
              Select any stage below to inspect how Workflo controls the environment, gathers evidence,
              and compiles the release receipt.
            </p>
          </div>

          {/* Stage Buttons Carousel / Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 mb-8">
            {STAGES.map((s, idx) => {
              const isSelected = activeStageIdx === idx;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setActiveStageIdx(idx)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 font-mono transition-all ${
                    isSelected
                      ? "border-[#C7F36B]/40 bg-[#C7F36B]/10 text-[#C7F36B] "
                      : "border-white/[0.06] bg-black/40 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className="text-sm font-bold">{s.number}</span>
                  <span className="text-[10px] uppercase truncate w-full text-center mt-1">
                    {s.phase.split("-")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detailed Panel */}
          <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md backdrop-blur">
            <div className="grid gap-8 p-8 lg:grid-cols-12 lg:p-10">
              {/* Left Column: Details */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#C7F36B]/10 px-3 py-1 font-mono text-xs tracking-wider text-[#C7F36B] border border-[#C7F36B]/20">
                      {activeStage.phase} PHASE
                    </span>
                    <span className="font-mono text-xs text-white/40">
                      STAGE {activeStage.number} OF 12
                    </span>
                  </div>

                  <h3 className="mt-5 text-3xl font-medium text-white">{activeStage.name}</h3>

                  <p className="mt-4 text-base leading-relaxed text-white/70">
                    {activeStage.description}
                  </p>

                  <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                    <p className="font-mono text-xs uppercase tracking-wider text-white/50">
                      Security Guarantee
                    </p>
                    <p className="mt-2 text-sm text-[#C7F36B] font-light">
                      {activeStage.securityGuarantee}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-5">
                  <button
                    type="button"
                    disabled={activeStageIdx === 0}
                    onClick={() => setActiveStageIdx((i) => Math.max(0, i - 1))}
                    className="font-mono text-xs text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    PREVIOUS STAGE
                  </button>
                  <button
                    type="button"
                    disabled={activeStageIdx === STAGES.length - 1}
                    onClick={() => setActiveStageIdx((i) => Math.min(STAGES.length - 1, i + 1))}
                    className="font-mono text-xs text-white hover:text-[#C7F36B] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    NEXT STAGE
                  </button>
                </div>
              </div>

              {/* Right Column: Live Terminal Telemetry Output */}
              <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-black/90 p-5 font-mono lg:col-span-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs text-white/40">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                    <span className="ml-2">workflo-supervisor.log</span>
                  </div>
                  <span className="text-[#C7F36B]">ONLINE</span>
                </div>

                <div className="mt-4 flex-1 space-y-3 text-xs leading-relaxed text-white/80">
                  <p className="text-white/40">$ workflo run --stage={activeStage.number}</p>
                  <p className="text-[#C7F36B]">{activeStage.terminalLog}</p>
                  <div className="mt-6 border-t border-white/5 pt-4 text-[11px] text-white/40">
                    <div>CPU: 0.8% | MEM: 142MB | THREADS: 4</div>
                    <div>SELINUX: ENFORCING | EBPF: ACTIVE</div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-white/5 p-3 text-[11px] text-white/60">
                  Stage {activeStage.number} emits an immutable proof chunk to the Merkle buffer.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications & Performance Metrics */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="prove" position="70% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Performance & Specs</p>
            <LetterReveal
              text="engineered for minimal pipeline latency."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
            <p className="mt-4 max-w-2xl text-base text-white/60">
              Security should not slow down deployment. Workflo hypervisors are optimized for fast-start
              microVM execution.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8 backdrop-blur">
              <span className="font-mono text-3xl font-light text-white md:text-4xl">&lt; 120ms</span>
              <h4 className="mt-3 text-lg font-medium text-white">MicroVM Boot Time</h4>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Pre-warmed kernel images and minimal microVM memory footprints ensure sandboxes start
                virtually instantaneously.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8 backdrop-blur">
              <span className="font-mono text-3xl font-light text-white md:text-4xl">&lt; 1.2%</span>
              <h4 className="mt-3 text-lg font-medium text-white">eBPF Audit Overhead</h4>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                In-kernel eBPF ring buffers stream syscall telemetry asynchronously without stalling
                user-space build commands.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8 backdrop-blur">
              <span className="font-mono text-3xl font-light text-white md:text-4xl">0.4ms</span>
              <h4 className="mt-3 text-lg font-medium text-white">Receipt Verification</h4>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Ed25519 signatures and compact SHA-256 Merkle trees can be verified in sub-millisecond
                offline CLI operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 text-center md:px-10">
        <SectionBackdrop id="trust" position="66% 50%" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <LetterReveal
            text="inspect the receipts generated by these stages."
            as="h2"
            className="justify-center text-4xl font-medium tracking-tight text-white md:text-6xl"
          />
          <p className="mt-6 text-base text-white/70 md:text-lg">
            See the exact cryptographic receipt schema and try the interactive receipt inspector in our docs.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/docs"
              className="rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
            >
              Open Interactive Docs & Receipts
            </Link>
            <Link
              to="/early-access"
              className="rounded-full border border-white/[0.08] bg-white/5 px-8 py-4 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Request early access
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
