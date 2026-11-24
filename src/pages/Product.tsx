import { useState } from "react";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";
import { SectionBackdrop } from "../landing/SectionBackdrop";
import { LetterReveal } from "../landing/LetterReveal";
import { Link } from "../lib/router";

const PILLARS = [
  {
    id: "isolation",
    index: "01",
    title: "Isolated MicroVM Runtime",
    summary: "Sealed, ephemeral sandboxes booted in under 120ms with unshared memory and read-only base layers.",
    details: [
      "Zero shared state between execution runs",
      "Memory ballooning with strict limits and cgroups v2 resource capping",
      "Ephemeral rootfs discarded immediately on completion",
      "Hardware-level virtualization avoiding container escape vulnerabilities"
    ],
    tag: "FIRECRACKER / EPH_VIRT"
  },
  {
    id: "policy",
    index: "02",
    title: "Pre-Flight Policy Enforcement",
    summary: "Hardware-level eBPF probes and seccomp filters applied before the first user command is evaluated.",
    details: [
      "Default-deny outbound network access with explicit CIDR allowlists",
      "Filesystem write restrictions limiting writes to designated workspace dirs",
      "Process spawn constraints blocking privilege escalation and fork-bombs",
      "Environment variable sanitizer redacting host secrets from runtime"
    ],
    tag: "SECCOMP / eBPF_FILTER"
  },
  {
    id: "ledger",
    index: "03",
    title: "Observable Audit Ledger",
    summary: "Every system call, socket connection, and file modification is streamed to an immutable Merkle tree.",
    details: [
      "Deterministic event ordering with microsecond timestamping",
      "Cryptographic digest calculated per ledger block",
      "Real-time anomaly detection flagging unexpected network transmissions",
      "Full stdout, stderr, and exit code capture linked to syscall signatures"
    ],
    tag: "MERKLE / STREAM_V2"
  },
  {
    id: "teardown",
    index: "04",
    title: "Teardown Verification",
    summary: "Post-flight sanitation verification confirming zero leftover daemons, memory leaks, or uncleaned state.",
    details: [
      "Rigorous sweep for orphaned background processes and rogue sockets",
      "Filesystem diff verification ensuring no untracked artifacts persist",
      "Memory wipe and sandbox destruction attestation",
      "Immediate teardown report included in the final verification verdict"
    ],
    tag: "POST_FLIGHT / ATTEST"
  },
  {
    id: "receipt",
    index: "05",
    title: "Cryptographic Signed Receipts",
    summary: "Compact, tamper-proof JSON receipts carrying Ed25519 digital signatures and SHA-256 tree hashes.",
    details: [
      "Self-contained proof that can be verified offline by any auditor",
      "Encapsulates commit hash, policy hash, execution trace, and teardown state",
      "Directly ingested by release governance gates and compliance pipelines",
      "Immutable evidence replacing ambiguous 100MB CI console logs"
    ],
    tag: "ED25519 / SHA256_PROOF"
  }
];

const COMPARISON = [
  {
    dimension: "Execution Sandbox",
    traditional: "Shared runner VM or Docker-in-Docker with residual host state",
    workflo: "Dedicated microVM booted per-run; zero persistent state",
  },
  {
    dimension: "Network Perimeter",
    traditional: "Unrestricted egress; secrets can leak to any arbitrary endpoint",
    workflo: "Default-deny policy enforced at kernel level with full DNS logging",
  },
  {
    dimension: "Audit Trail",
    traditional: "Unstructured, ephemeral console text logs subject to truncation",
    workflo: "Cryptographic Merkle event stream with tamper-evident hashes",
  },
  {
    dimension: "Teardown Audit",
    traditional: "Assumed clean; background zombies frequently contaminate runner",
    workflo: "Strict post-flight verification with process & filesystem diff proof",
  },
  {
    dimension: "Release Evidence",
    traditional: "Simple 0 exit code from test runner; no environmental guarantees",
    workflo: "Digitally signed receipt proving exactly what executed and touched what",
  },
];

export function Product() {
  const [activePillar, setActivePillar] = useState(0);

  return (
    <div className="landing-root min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-28 md:px-10 md:pt-32">
        <SectionBackdrop id="trust" position="66% 50%" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C7F36B] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/70">
              Product Overview · Verification Layer
            </span>
          </div>

          <LetterReveal
            text="a verification layer for software execution."
            as="h1"
            className="text-[10vw] font-medium leading-[1.05] tracking-tight text-white md:text-[6.5vw]"
          />

          <p className="mt-8 max-w-3xl text-lg text-white/70 md:text-xl font-light leading-relaxed">
            Workflo executes software inside hardware-isolated microVMs, audits every syscall and
            network packet, verifies complete environment teardown, and produces cryptographically
            signed proof for human release decisions.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/early-access"
              className="rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
            >
              Request early access
            </Link>
            <Link
              to="/docs"
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-8 py-4 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Read technical docs 
            </Link>
          </div>
        </div>
      </section>

      {/* Core Architecture Pillars Section */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="execute" position="68% 50%" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Architecture</p>
            <LetterReveal
              text="five properties of every verified run."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
            <p className="mt-4 max-w-2xl text-base text-white/60">
              Most CI systems only check whether a command exited zero. Workflo guarantees the
              environment, isolates the boundaries, and proves what actually happened.
            </p>
          </div>

          {/* Interactive Pillar Explorer */}
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Nav */}
            <div className="flex flex-col gap-2 lg:col-span-5">
              {PILLARS.map((pillar, idx) => {
                const isActive = activePillar === idx;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillar(idx)}
                    className={`group flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                      isActive
                        ? "border-[#C7F36B]/30 bg-[#C7F36B]/10 backdrop-blur"
                        : "border-white/[0.06] bg-black/40 hover:border-white/[0.08] hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="font-mono text-xs text-white/40 group-hover:text-white/70">
                      {pillar.index}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-white">{pillar.title}</h3>
                      </div>
                      <p className="mt-1.5 text-xs text-white/60 line-clamp-2">{pillar.summary}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Display Panel */}
            <div className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8 backdrop-blur lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
                  <span className="font-mono text-xs tracking-widest text-[#C7F36B]">
                    {PILLARS[activePillar].tag}
                  </span>
                  <span className="font-mono text-xs text-white/40">
                    STAGE {PILLARS[activePillar].index} / 05
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-medium text-white">
                  {PILLARS[activePillar].title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-white/70">
                  {PILLARS[activePillar].summary}
                </p>

                <div className="mt-8 space-y-3">
                  <p className="font-mono text-xs uppercase tracking-wider text-white/40">
                    Verification Specifications
                  </p>
                  {PILLARS[activePillar].details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 border-t border-white/[0.06] pt-6 flex items-center justify-between">
                <span className="font-mono text-xs text-white/40">DETERMINISTIC ASSURANCE</span>
                <Link
                  to="/how-it-works"
                  className="font-mono text-xs text-white hover:text-[#C7F36B] transition-colors"
                >
                  See lifecycle execution sequence 
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section: Traditional CI vs Workflo */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="observe" position="56% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Comparison</p>
            <LetterReveal
              text="why standard CI is not verification."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
            <p className="mt-4 max-w-2xl text-base text-white/60">
              CI pipelines answer: "did scripts exit without crashing?" Workflo answers: "did the code
              respect its boundaries and is the release provably safe?"
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md backdrop-blur">
            <div className="grid grid-cols-12 border-b border-white/[0.06] bg-white/[0.02] p-4 text-xs font-mono tracking-wider text-white/50 md:p-6">
              <div className="col-span-3">VERIFICATION DIMENSION</div>
              <div className="col-span-4 text-neutral-400">TRADITIONAL CI RUNNER</div>
              <div className="col-span-5 text-[#C7F36B]">WORKFLO VERIFICATION LAYER</div>
            </div>

            <div className="divide-y divide-white/10">
              {COMPARISON.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 p-4 text-sm transition-colors hover:bg-white/[0.02] md:p-6"
                >
                  <div className="col-span-3 font-medium text-white/90 pr-2">
                    {row.dimension}
                  </div>
                  <div className="col-span-4 text-neutral-400 text-xs md:text-sm pr-4 font-light">
                    {row.traditional}
                  </div>
                  <div className="col-span-5 text-white text-xs md:text-sm font-normal">
                    {row.workflo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Flow Diagram */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="verify" position="58% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Execution Pipeline</p>
            <LetterReveal
              text="from revision to cryptographically sealed receipt."
              as="h2"
              className="mt-3 justify-center text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur">
              <span className="font-mono text-xs text-white/40">STEP 01</span>
              <h4 className="mt-3 text-lg font-medium text-white">Capture & Seal</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Calculates cryptographic hashes of repo commit, dependency tree, and declared policy rules.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur">
              <span className="font-mono text-xs text-white/40">STEP 02</span>
              <h4 className="mt-3 text-lg font-medium text-white">Boot & Isolate</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Spawns a clean microVM sandbox. Injects eBPF network monitors and locks seccomp profiles.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur">
              <span className="font-mono text-xs text-white/40">STEP 03</span>
              <h4 className="mt-3 text-lg font-medium text-white">Audit & Teardown</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Monitors every system call and socket packet. Verifies zero orphaned threads upon completion.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur border-[#C7F36B]/30">
              <span className="font-mono text-xs text-[#C7F36B]">STEP 04</span>
              <h4 className="mt-3 text-lg font-medium text-white">Sign Receipt</h4>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Compiles the Merkle root and signs the immutable release receipt with Ed25519 keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 text-center md:px-10">
        <SectionBackdrop id="prove" position="70% 50%" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <LetterReveal
            text="stop guessing what code executes in production."
            as="h2"
            className="justify-center text-4xl font-medium tracking-tight text-white md:text-6xl"
          />
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Deploy with deterministic verification. Request an enterprise pilot or explore our developer documentation.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/early-access"
              className="rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
            >
              Get early access
            </Link>
            <Link
              to="/docs"
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-8 py-4 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Explore docs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
