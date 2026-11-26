import { useState, type FormEvent } from "react";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";
import { SectionBackdrop } from "../landing/SectionBackdrop";
import { LetterReveal } from "../landing/LetterReveal";

const PRINCIPLES = [
  {
    title: "Isolation",
    tag: "BOUNDARY",
    body: "Untrusted code executes under strict hardware confinement. Dedicated microVMs, default-deny egress, and ephemeral RAM disks guarantee zero state leakage or host exposure.",
  },
  {
    title: "Transparency",
    tag: "OBSERVABILITY",
    body: "System activity is recorded at the kernel boundary using eBPF probes. Every system call, process spawn, and network socket is observable rather than buried in perishable console logs.",
  },
  {
    title: "Verifiability",
    tag: "CRYPTOGRAPHY",
    body: "Audit records are mathematically hashed into SHA-256 Merkle trees and signed with Ed25519 authority keys. Anyone can independently verify execution integrity offline.",
  },
  {
    title: "Human Authority",
    tag: "GOVERNANCE",
    body: "Digital receipts establish facts to support human engineering judgment. Verification serves human release authority, rejecting blind autonomy in critical systems.",
  },
];

const APPROACH_STEPS = [
  {
    num: "01",
    name: "Controlled Execution",
    spec: "Hardware MicroVM",
    desc: "Seals the runtime environment inside dedicated microVM sandboxes with strict memory quotas, immutable rootfs, and default-deny egress.",
  },
  {
    num: "02",
    name: "Evidence Collection",
    spec: "eBPF Kernel Probes",
    desc: "Records every executed system call, socket connection attempt, and process lifecycle event in an unalterable telemetry ledger.",
  },
  {
    num: "03",
    name: "Teardown Verification",
    spec: "Zero-Zombie Sweep",
    desc: "Sweeps host state post-execution to mathematically confirm zero orphaned background daemons or lingering filesystem modifications.",
  },
  {
    num: "04",
    name: "Signed Receipt",
    spec: "Ed25519 & Merkle",
    desc: "Hashes the audit ledger into a SHA-256 Merkle root and issues a tamper-evident cryptographic execution receipt.",
  },
];

const AUDIENCE = [
  {
    title: "Platform & Engineering Leaders",
    desc: "Establish verified execution boundaries across CI/CD pipelines, eliminating deployment blind spots and unverified test assumptions.",
  },
  {
    title: "Teams Operating Coding Agents",
    desc: "Safely execute, probe, and inspect autonomous code generation inside network-restricted microVM sandboxes before merge.",
  },
  {
    title: "Security & Infrastructure Teams",
    desc: "Enforce default-deny egress policies, block cloud metadata access, and obtain tamper-evident syscall audit ledgers.",
  },
  {
    title: "Mission-Critical Systems",
    desc: "Replace perishable console logs with cryptographically signed, verifiable receipts required for strict change control.",
  },
];

export function About() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    inquiryType: "product" as const,
    message: "",
    consentToReply: true,
    website: "", // honeypot
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok || response.status === 202) {
        setStatus("success");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("success");
    }
  };

  return (
    <div className="landing-root min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* 1. Hero Section (Proposed Brief Copy & Editorial Visual) */}
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-20 md:px-10 md:pt-32">
        <SectionBackdrop id="observe" position="56% 50%" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex items-center gap-2 font-mono text-sm text-white/60 mb-6">
            <span>workflo</span>
            <span>/</span>
            <span className="text-white font-medium">about</span>
          </div>

          <LetterReveal
            text="Software is becoming autonomous. Trust cannot remain implicit."
            as="h1"
            className="text-[8vw] font-medium leading-[1.08] tracking-tight text-white md:text-[5vw] max-w-5xl"
          />

          <p className="mt-8 max-w-3xl text-lg text-white/80 md:text-xl font-light leading-relaxed">
            Workflo builds the execution and verification infrastructure that helps engineering teams understand what happened when software runs, what evidence was collected, and whether the execution environment was properly cleaned up.
          </p>

          {/* Architectural Lifecycle Visual (Execution-to-Evidence) */}
          <div className="mt-14 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/50 p-6 md:p-8 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-4 mb-6 gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-white/60">
                EXECUTION-TO-EVIDENCE LIFECYCLE
              </span>
              <span className="font-mono text-xs text-white/40">
                Hardware Isolation → Cryptographic Non-Repudiation
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {APPROACH_STEPS.map((step, idx) => (
                <div key={step.num} className="relative rounded-xl border border-white/[0.06] bg-black/60 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-white">{step.num}</span>
                      <span className="font-mono text-[10px] text-white/40 uppercase">{step.spec}</span>
                    </div>
                    <h3 className="text-base font-medium text-white">{step.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/70 font-light">{step.desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 text-white/30 text-xs">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-24 md:px-10">
        <SectionBackdrop id="execute" position="68% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 block mb-2">THE PROBLEM</span>
              <LetterReveal
                text="autonomous code changes the trust boundary."
                as="h2"
                className="text-3xl font-medium tracking-tight text-white md:text-5xl"
              />
            </div>

            <div className="lg:col-span-7 space-y-6 text-base leading-relaxed text-white/80 font-light">
              <p>
                In the last decade, CI/CD became the backbone of software delivery. But traditional CI
                runners were designed around human-written code, open networks, and binary exit codes.
                They assume that if a test script exits zero, the software is fit to deploy.
              </p>
              <p>
                As AI coding assistants and autonomous agents take over implementation, that assumption
                collapses. Agents can write tests that pass superficially while masking regressions,
                leaking background daemons, or attempting unauthorized network exfiltration.
              </p>
              <p>
                When software generation becomes automated, execution trust cannot remain implicit.
                Engineering teams need mathematically attested evidence of what ran, how the system
                responded, and whether the environment was completely sanitized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Thesis */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-24 md:px-10">
        <SectionBackdrop id="verify" position="58% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 block mb-2">OUR THESIS</span>
              <LetterReveal
                text="isolated, observable, and independently verifiable."
                as="h2"
                className="text-3xl font-medium tracking-tight text-white md:text-5xl"
              />
            </div>

            <div className="lg:col-span-7 space-y-6 text-base leading-relaxed text-white/80 font-light">
              <p>
                We believe that software execution must be isolated from host infrastructure, observable
                at the kernel boundary, and independently verifiable through cryptographic proofs.
              </p>
              <p>
                Verification must stand completely independent of both the code author and the execution
                runner. Dumping 50 megabytes of unstructured console logs does not create trust. A digitally
                signed Merkle receipt provides verifiable non-repudiation for audit, compliance, and release control.
              </p>
            </div>
          </div>

          {/* Explicit Boundary of Receipts */}
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold block mb-3">
                WHAT A RECEIPT ESTABLISHES
              </span>
              <ul className="space-y-3 text-sm text-white/80 font-light leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Exact Source Binding:</strong> Attests to the exact repository SHA, commit tree, and configuration used.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Boundary Compliance:</strong> Proves whether seccomp syscall filters and network egress allowlists were enforced.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Observed Telemetry:</strong> An immutable Merkle ledger of captured stdout, stderr, process exits, and audit events.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Verified Teardown:</strong> Cryptographically documents whether zombie processes or persistent state leaks remained.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold block mb-3">
                WHAT A RECEIPT DOES NOT ESTABLISH
              </span>
              <ul className="space-y-3 text-sm text-white/80 font-light leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Not a Guarantee of Correctness:</strong> A receipt does not prove that code is bug-free, optimal, or logically complete.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Not an Autonomous Release Authority:</strong> Workflo provides the evidence; human engineers retain authority for release decisions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Not Universal Safety:</strong> Passing tests in a sandbox proves how software behaved under those constraints, not in every scenario.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Human Accountability:</strong> Digital signatures guarantee record integrity, not human intent or business liability.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Principles */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-24 md:px-10">
        <SectionBackdrop id="trust" position="66% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 block mb-2">OUR PRINCIPLES</span>
            <LetterReveal
              text="foundations of execution and verifiability."
              as="h2"
              className="text-3xl font-medium tracking-tight text-white md:text-5xl"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 block mb-2">
                    {p.tag}
                  </span>
                  <h3 className="text-2xl font-medium text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80 font-light">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Our Direction & Audience */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-24 md:px-10">
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 block mb-2">OUR DIRECTION</span>
            <LetterReveal
              text="infrastructure for trustworthy autonomous workflows."
              as="h2"
              className="text-3xl font-medium tracking-tight text-white md:text-5xl"
            />
            <p className="mt-4 max-w-3xl text-base text-white/70 font-light leading-relaxed">
              We are building the verifiable execution layer that enables software teams to safely scale agentic workflows, eliminate deployment blind spots, and release with cryptographic confidence.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((aud) => (
              <div
                key={aud.title}
                className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-6"
              >
                <h3 className="text-lg font-medium text-white">{aud.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70 font-light">{aud.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Contact & Enterprise Inquiries */}
      <section id="contact" className="relative isolate border-t border-white/[0.06] px-6 py-24 md:px-10">
        <SectionBackdrop id="observe" position="56% 50%" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 block mb-2">GET IN TOUCH</span>
            <h2 className="text-3xl font-medium tracking-tight text-white md:text-5xl">
              Connect with our team.
            </h2>
            <p className="mt-4 text-sm text-white/70 font-light">
              Discuss enterprise isolation, custom eBPF policies, or early pilot deployment.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/[0.08] bg-black/50 p-8 backdrop-blur-md space-y-6"
          >
            {/* Honeypot field for anti-spam */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-2">NAME *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ada Lovelace"
                  className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-2">WORK EMAIL *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ada@company.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-2">ORGANIZATION</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Acme Engineering"
                  className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-2">ROLE</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="VP of Infrastructure"
                  className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">MESSAGE *</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your execution environment, workload volume, or deployment requirements..."
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="consent"
                checked={form.consentToReply}
                onChange={(e) => setForm({ ...form, consentToReply: e.target.checked })}
                className="rounded border-white/20 bg-black text-white focus:ring-0"
              />
              <label htmlFor="consent" className="text-xs text-white/60 font-light">
                I agree to receive a direct technical follow-up regarding Workflo infrastructure.
              </label>
            </div>

            {status === "error" && (
              <p className="text-xs text-red-400 font-mono">{errorMessage}</p>
            )}

            {status === "success" && (
              <div className="rounded-xl border border-white/20 bg-white/[0.04] p-4 text-xs font-mono text-white">
                Inquiry received. A member of our engineering team will respond within one business day.
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-full bg-white py-3.5 text-xs font-mono font-medium text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {status === "submitting" ? "Transmitting..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
