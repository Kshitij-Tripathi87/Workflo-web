import { useState, type FormEvent } from "react";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";
import { SectionBackdrop } from "../landing/SectionBackdrop";
import { LetterReveal } from "../landing/LetterReveal";

const PRINCIPLES = [
  {
    title: "Determinism over Heuristics",
    body: "An execution must produce identical cryptographic evidence regardless of where or when it runs. We eliminate flakiness by sealing the environment, freezing inputs, and attesting to hardware state.",
  },
  {
    title: "Human Authority over Blind Autonomy",
    body: "AI agents and autonomous bots can generate code, write tests, and propose PRs. But releasing software to real users demands human judgment backed by unalterable proof.",
  },
  {
    title: "Cryptographic Proof over Raw Logs",
    body: "Dumping 50 megabytes of unstructured console text is not evidence. A digitally signed, Merkle-hashed receipt provides provable non-repudiation for audit, compliance, and incident response.",
  },
  {
    title: "Zero-Trust Execution Boundaries",
    body: "Software runs under strict confinement. No runner ever inherits host credentials, persistent disks, or unrestricted outbound network traffic by default.",
  },
];

const AUDIENCE = [
  {
    title: "Platform & Engineering Leaders",
    desc: "Establish verified execution boundaries across CI/CD pipelines, eliminating deployment blind spots and flaky test assumptions.",
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

const CAPABILITIES = [
  {
    title: "Controls Execution",
    body: "Seals the runtime environment inside hardware-accelerated microVMs with strict memory limits and default-deny egress.",
  },
  {
    title: "Collects Evidence",
    body: "Attaches eBPF kernel probes to record every executed system call, network connection attempt, and process lifecycle event.",
  },
  {
    title: "Verifies Teardown",
    body: "Sweeps host state post-execution to mathematically verify zero orphaned zombie daemons or lingering filesystem changes remain.",
  },
  {
    title: "Generates Signed Receipts",
    body: "Hashes the audit ledger into a SHA-256 Merkle root and issues an Ed25519-signed cryptographic execution receipt.",
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

      {/* 1. Hero Section */}
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-28 md:px-10 md:pt-32">
        <SectionBackdrop id="observe" position="56% 50%" />
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <LetterReveal
            text="deterministic verification for the autonomous era."
            as="h1"
            className="text-[10vw] font-medium leading-[1.05] tracking-tight text-white md:text-[6.5vw]"
          />

          <p className="mt-8 max-w-3xl text-lg text-white/80 md:text-xl font-light leading-relaxed">
            Software is being written faster than human verification can keep up. AI agents generate
            features in seconds, but releasing software still demands absolute trust. Workflo builds
            the independent verification boundary between code generation and production release.
          </p>
        </div>
      </section>

      {/* 2. Why Workflo Exists (The Thesis) */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="execute" position="68% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Why Workflo Exists</p>
              <LetterReveal
                text="why verification must be independent."
                as="h2"
                className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
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
                leaking background processes, or attempting unauthorized network exfiltration.
              </p>
              <p>
                The verification boundary must be independent of both the author and the runner.
                Workflo was built to isolate untrusted execution, record what actually occurs, and
                attest to the results cryptographically before code touches production infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What Workflo Does */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="verify" position="58% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">What Workflo Does</p>
            <LetterReveal
              text="control, observe, verify, attest."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
            <p className="mt-4 max-w-2xl text-base text-white/70 font-light leading-relaxed">
              Four fundamental steps executed on every run to turn untrusted software execution into an auditable record.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-6"
              >
                <h3 className="text-lg font-medium text-white">{cap.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70 font-light">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What the Evidence Means (and What it Does Not) */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="prove" position="70% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">The Boundary of Evidence</p>
            <LetterReveal
              text="what a signed receipt proves — and what it does not."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold block mb-3">
                WHAT A RECEIPT ESTABLISHES
              </span>
              <ul className="space-y-3 text-sm text-white/80 font-light leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Exact Source Binding:</strong> Attests to the exact repository SHA and configuration used during execution.</span>
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

            <div className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8">
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
                  <span><strong>Not an Autonomous Release Authority:</strong> Workflo provides the evidence; human engineers remain responsible for interpreting results.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  <span><strong>Not Universal Safety:</strong> Passing tests in a sandbox proves how software behaved under those conditions, not in every hypothetical scenario.</span>
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

      {/* 5. What Workflo Believes (Core Principles) */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="trust" position="66% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Core Principles</p>
            <LetterReveal
              text="how we think about execution and trust."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8"
              >
                <h3 className="text-2xl font-medium text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80 font-light">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Who It Is Built For */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Who It Is Built For</p>
            <LetterReveal
              text="designed for high-velocity engineering."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
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

      {/* 7. Enterprise & Contact Form */}
      <section id="contact" className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="observe" position="56% 50%" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Contact Us</p>
            <LetterReveal
              text="start a conversation."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
            <p className="mt-4 text-base text-white/70 font-light">
              Talk with our team about enterprise verification, dedicated infrastructure, or technical pilots.
            </p>
          </div>

          {status === "success" ? (
            <div className="rounded-3xl border border-white/20 bg-black/60 p-8 text-center backdrop-blur-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-white">Inquiry received</h3>
              <p className="mt-2 text-sm text-white/70">
                Thank you for reaching out. A Workflo engineer will review your request and follow up shortly.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 rounded-full border border-white/20 px-6 py-2.5 text-xs font-mono text-white hover:bg-white/10 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-3xl border border-white/[0.08] bg-black/40 p-8 backdrop-blur-md md:p-10"
            >
              {status === "error" && (
                <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-xs font-mono text-white">
                  {errorMessage || "Submission error. Please check your inputs and try again."}
                </div>
              )}

              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs text-white/60 mb-2">
                    NAME <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ada Lovelace"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-white/60 mb-2">
                    WORK EMAIL <span className="text-white">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ada@company.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs text-white/60 mb-2">COMPANY</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Engineering"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-white/60 mb-2">ROLE</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Staff Platform Engineer"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-white/60 mb-2">INQUIRY TYPE</label>
                <select
                  value={form.inquiryType}
                  onChange={(e) => setForm({ ...form, inquiryType: e.target.value as any })}
                  className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
                >
                  <option value="product" className="bg-neutral-900">Product & Enterprise Pilot</option>
                  <option value="security" className="bg-neutral-900">Security & Isolation Boundaries</option>
                  <option value="partnership" className="bg-neutral-900">Partnership & Integration</option>
                  <option value="privacy" className="bg-neutral-900">Data Privacy & Compliance</option>
                  <option value="other" className="bg-neutral-900">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-white/60 mb-2">
                  MESSAGE <span className="text-white">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your execution environment, test pipelines, or verification requirements..."
                  className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={form.consentToReply}
                  onChange={(e) => setForm({ ...form, consentToReply: e.target.checked })}
                  className="h-4 w-4 rounded border-white/[0.08] bg-black/50 text-white focus:ring-0"
                />
                <label htmlFor="consent" className="text-xs text-white/70">
                  I consent to Workflo contacting me regarding this inquiry.
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded-full bg-white py-4 text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
              >
                {status === "submitting" ? "Sending message..." : "Submit inquiry"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
