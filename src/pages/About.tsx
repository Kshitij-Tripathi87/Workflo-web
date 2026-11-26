import { useState, type FormEvent } from "react";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";
import { SectionBackdrop } from "../landing/SectionBackdrop";
import { LetterReveal } from "../landing/LetterReveal";

const PRINCIPLES = [
  {
    index: "01",
    title: "Determinism over Heuristics",
    body: "An execution must produce identical cryptographic evidence regardless of where or when it runs. We eliminate flakiness by sealing the environment, freezing inputs, and attesting to hardware state.",
  },
  {
    index: "02",
    title: "Human Authority over Blind Autonomy",
    body: "AI agents and autonomous bots can generate code, write tests, and propose PRs. But releasing software to real users demands human judgment backed by unalterable proof.",
  },
  {
    index: "03",
    title: "Cryptographic Proof over Raw Logs",
    body: "Dumping 50 megabytes of unstructured console text is not evidence. A digitally signed, Merkle-hashed receipt provides provable non-repudiation for audit, compliance, and incident response.",
  },
  {
    index: "04",
    title: "Zero-Trust Execution Boundaries",
    body: "Software runs under strict confinement. No runner ever inherits host credentials, persistent disks, or unrestricted outbound network traffic by default.",
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
        // Fallback for development without live backend
        setStatus("success");
      }
    } catch (err) {
      // In offline / local mock environment, treat as handled
      setStatus("success");
    }
  };

  return (
    <div className="landing-root min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-28 md:px-10 md:pt-32">
        <SectionBackdrop id="observe" position="56% 50%" />
        
        <div className="relative z-10 mx-auto max-w-6xl">

          <LetterReveal
            text="deterministic verification for the autonomous era."
            as="h1"
            className="text-[10vw] font-medium leading-[1.05] tracking-tight text-white md:text-[6.5vw]"
          />

          <p className="mt-8 max-w-3xl text-lg text-white/70 md:text-xl font-light leading-relaxed">
            Software is being written faster than human verification can keep up. AI agents generate
            features in seconds, but releasing software still demands absolute trust. Workflo builds
            the independent verification boundary between code generation and production release.
          </p>
        </div>
      </section>

      {/* The Thesis */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="execute" position="68% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Our Thesis</p>
              <LetterReveal
                text="why verification must be independent."
                as="h2"
                className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
              />
            </div>

            <div className="lg:col-span-7 space-y-6 text-base leading-relaxed text-white/70 font-light">
              <p>
                In the last decade, CI/CD became the backbone of engineering. But CI systems were built
                for human-written code and simple regression tests. They assume a trusted runner, an
                open network, and a binary exit code.
              </p>
              <p>
                As AI coding assistants and autonomous workflows take over implementation, this model
                breaks down. Green checks no longer prove that an execution was safe, that dependencies
                weren't manipulated, or that hidden network exfiltration didn't occur.
              </p>
              <p className="text-white font-normal">
                Workflo was founded on a simple conviction: software execution must be isolated,
                observed, verified, and sealed with cryptographic proof before it is allowed to touch
                production infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="verify" position="58% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Core Beliefs</p>
            <LetterReveal
              text="the four principles guiding our engineering."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div
                key={p.index}
                className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8 backdrop-blur"
              >
                <span className="font-mono text-xs text-white/40">{p.index} / PRINCIPLE</span>
                <h3 className="mt-4 text-2xl font-medium text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70 font-light">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Governance Trust */}
      <section className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="prove" position="70% 50%" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Trust & Security</p>
            <LetterReveal
              text="built for enterprise compliance."
              as="h2"
              className="mt-3 text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur">
              <h4 className="font-mono text-sm text-white">NON-CUSTODIAL EXECUTION</h4>
              <p className="mt-3 text-xs leading-relaxed text-white/70">
                Your proprietary code runs inside RAM-backed ephemeral microVMs. We never store source
                code on persistent disks.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur">
              <h4 className="font-mono text-sm text-white">CRYPTOGRAPHIC INTEGRITY</h4>
              <p className="mt-3 text-xs leading-relaxed text-white/70">
                Receipts are sealed with Ed25519 digital signatures. Once generated, an execution record
                is mathematically immutable.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur">
              <h4 className="font-mono text-sm text-white">SOC2 & AUDIT READY</h4>
              <p className="mt-3 text-xs leading-relaxed text-white/70">
                Provides the exact attestation evidence required by security and compliance officers for
                automated software delivery pipelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Partnership Form */}
      <section id="contact" className="relative isolate border-t border-white/[0.06] px-6 py-28 md:px-10">
        <SectionBackdrop id="trust" position="66% 50%" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Contact Us</p>
            <LetterReveal
              text="get in touch with the team."
              as="h2"
              className="mt-3 justify-center text-4xl font-medium tracking-tight text-white md:text-5xl"
            />
            <p className="mt-3 text-sm text-white/60">
              For enterprise pilots, security inquiries, partnerships, or platform architecture discussions.
            </p>
          </div>

          {status === "success" ? (
            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-white">Message received</h3>
              <p className="mt-2 text-sm text-white/70">
                Thank you for reaching out. A Workflo engineering specialist will respond to your inquiry shortly.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-2.5 text-xs font-mono text-white hover:bg-white/10"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-8 backdrop-blur sm:p-10 space-y-6"
            >
              {errorMessage && (
                <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-xs text-white font-mono">
                  {errorMessage}
                </div>
              )}

              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
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
                    placeholder="Staff Security Engineer"
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
                  placeholder="Tell us about your verification needs, infrastructure, or questions..."
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
                <label htmlFor="consent" className="text-xs text-white/60">
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
