import { useState, type FormEvent } from "react";
import { BulletList, Note, PageHeader, Section } from "../components/ui";

const TEAM_SIZES = ["1–10", "11–50", "51–200", "200+"];

export function EarlyAccess() {
  const [form, setForm] = useState({ name: "", email: "", team: "", context: "" });
  const [status, setStatus] = useState<"idle" | "invalid" | "handled">("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!form.name.trim() || !emailValid) {
      setStatus("invalid");
      return;
    }
    setStatus("handled");
  };

  return (
    <>
      <PageHeader
        title="Early access."
        lede="Hosted platform access is in early access. The CLI is designed to work without it; the platform adds a shared surface for running and reviewing executions."
        plate="/images/plate-trust.webp"
        plateLabel="Early access"
      />

      <Section title="What early access includes." lede="Concrete, and deliberately modest.">
        <BulletList
          items={[
            "Access to the hosted workspace for running and reviewing executions.",
            "A direct line for reporting what the record gets wrong.",
            "Early documentation, which will change as the interface stabilises.",
            "No commitment to pricing, availability dates or support levels.",
          ]}
        />
        <Note>
          Early access does not include a production SLA. There is no pricing page because pricing is
          not established.
        </Note>
      </Section>

      <Section title="Who it is for." lede="Teams already executing software constantly.">
        <p>
          Platform teams operating CI for AI-native products, teams running autonomous coding
          workflows, and QA or infrastructure leads who need a record of what a run actually did.
        </p>
        <p className="text-[14px] leading-relaxed text-muted">
          If you only need a test result, existing tooling already covers it. Early access is for
          teams that need the wider account of an execution.
        </p>
      </Section>

      <Section title="Request access." lede="Tell us what you are trying to verify.">
        <form onSubmit={onSubmit} noValidate className="panel p-5 md:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ea-name" className="label">
                Name
              </label>
              <input
                id="ea-name"
                name="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                aria-invalid={status === "invalid" && !form.name.trim()}
                className="mt-2 w-full border border-line bg-bg px-3 py-2 text-[13.5px] text-fg focus:border-accent/50"
              />
            </div>
            <div>
              <label htmlFor="ea-email" className="label">
                Work email
              </label>
              <input
                id="ea-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                aria-invalid={status === "invalid" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)}
                aria-describedby="ea-email-help"
                className="mt-2 w-full border border-line bg-bg px-3 py-2 text-[13.5px] text-fg focus:border-accent/50"
              />
              <p id="ea-email-help" className="mt-1.5 font-mono text-[10px] text-muted/70">
                Used only to reply about access.
              </p>
            </div>
            <div>
              <label htmlFor="ea-team" className="label">
                Team size
              </label>
              <select
                id="ea-team"
                name="team"
                value={form.team}
                onChange={(event) => setForm({ ...form, team: event.target.value })}
                className="mt-2 w-full border border-line bg-bg px-3 py-2 text-[13.5px] text-fg focus:border-accent/50"
              >
                <option value="">Select</option>
                {TEAM_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} engineers
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ea-context" className="label">
                What are you trying to verify?
              </label>
              <textarea
                id="ea-context"
                name="context"
                rows={4}
                value={form.context}
                onChange={(event) => setForm({ ...form, context: event.target.value })}
                className="mt-2 w-full border border-line bg-bg px-3 py-2 text-[13.5px] leading-relaxed text-fg focus:border-accent/50"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary">
              Send request
            </button>
            <p className="font-mono text-[10px] leading-relaxed text-muted/70">
              No submission endpoint is connected in this build.
            </p>
          </div>

          <div aria-live="polite" className="mt-4">
            {status === "invalid" ? (
              <p className="border-l-2 border-accent/60 pl-4 font-mono text-[11px] leading-relaxed text-fg/85">
                Add a name and a valid email address so a reply would be possible.
              </p>
            ) : null}
            {status === "handled" ? (
              <p className="border-l-2 border-accent/60 pl-4 font-mono text-[11px] leading-relaxed text-fg/85">
                Nothing was sent. This pre-release build has no endpoint behind the form, so no data
                left your browser and nothing was stored.
              </p>
            ) : null}
          </div>

          <p className="mt-5 border-t border-line pt-4 text-[12px] leading-relaxed text-muted">
            Privacy: this form does not transmit or store anything. If a real endpoint were
            connected, it would collect the name, email, team size and context you entered, solely to
            reply about early access.
          </p>
        </form>
      </Section>
    </>
  );
}
