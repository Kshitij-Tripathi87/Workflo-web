import { useEffect, useState } from "react";

const GROUPS = [
  {
    id: "context",
    title: "Execution context",
    rows: [
      { k: "execution", v: "exec_0001" },
      { k: "repository", v: "example/atlas-service" },
      { k: "revision", v: "a7f3c91" },
      { k: "environment digest", v: "sha256:9f2c…7ab1" },
      { k: "policy set", v: "default-ci" },
    ],
  },
  {
    id: "activity",
    title: "Recorded activity",
    rows: [
      { k: "tests", v: "recorded" },
      { k: "probes", v: "3 requests recorded" },
      { k: "agent inspection", v: "recorded" },
      { k: "logs", v: "captured" },
    ],
  },
  {
    id: "teardown",
    title: "Teardown",
    rows: [
      { k: "processes", v: "checked" },
      { k: "mounts", v: "checked" },
      { k: "result", v: "verified" },
    ],
  },
  {
    id: "integrity",
    title: "Integrity",
    rows: [
      { k: "receipt digest", v: "sha256:4d7e…c0a3" },
      { k: "signature", v: "present" },
      { k: "algorithm", v: "not shown in preview" },
      { k: "scope", v: "this execution" },
    ],
  },
];

const STEPS = [
  "Receipt digest matches the recorded activity",
  "Teardown record is attached to the receipt",
  "Signature verifies against the issuer key",
];

export function Receipt() {
  const [step, setStep] = useState(-1);
  const running = step >= 0 && step < STEPS.length;
  const done = step >= STEPS.length;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setStep((value) => value + 1), 460);
    return () => window.clearTimeout(timer);
  }, [running, step]);

  return (
    <div className="panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="label">Execution receipt</p>
        <p className="font-mono text-[9.5px] tracking-[0.16em] text-muted/70">ILLUSTRATIVE</p>
      </div>

      <div className="divide-y divide-line/70">
        <div className="px-4 py-3">
          <p className="text-[13px] text-fg">{GROUPS[0].title}</p>
          <dl className="mt-3 space-y-1.5 font-mono text-[11.5px]">
            {GROUPS[0].rows.map((row) => (
              <div key={row.k} className="flex items-baseline justify-between gap-6">
                <dt className="text-muted">{row.k}</dt>
                <dd className="text-right text-fg/85">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {GROUPS.slice(1).map((group) => (
          <details key={group.id} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13px] text-fg">
              <span>{group.title}</span>
              <span
                aria-hidden="true"
                className="font-mono text-[11px] text-muted/70 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <dl className="mt-3 space-y-1.5 font-mono text-[11.5px]">
              {group.rows.map((row) => (
                <div key={row.k} className="flex items-baseline justify-between gap-6">
                  <dt className="text-muted">{row.k}</dt>
                  <dd className="text-right text-fg/85">{row.v}</dd>
                </div>
              ))}
            </dl>
          </details>
        ))}
      </div>

      <div className="border-t border-line px-4 py-4">
        <ol className="space-y-2">
          {STEPS.map((label, index) => {
            const complete = index < step;
            const activeStep = running && index === step;
            return (
              <li key={label} className="flex items-baseline gap-3 font-mono text-[11px]">
                <span
                  aria-hidden="true"
                  className={`mt-[3px] h-1.5 w-1.5 shrink-0 ${
                    complete ? "bg-accent" : activeStep ? "bg-accent/70" : "bg-line"
                  }`}
                />
                <span className={complete ? "text-fg/85" : activeStep ? "text-fg" : "text-muted/70"}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(0)}
            disabled={running}
            className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
          >
            Run illustrative verification
          </button>
          {done || step >= 0 ? (
            <button
              type="button"
              onClick={() => setStep(-1)}
              className="font-mono text-[11px] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg"
            >
              Reset
            </button>
          ) : null}
        </div>

        <p role="status" className="mt-3 font-mono text-[10.5px] leading-relaxed text-muted/75">
          {done
            ? "Illustrative sequence complete. This preview performs no real cryptography and proves nothing about the software."
            : "Illustrative sequence only. A receipt is evidence about a recorded execution, not a guarantee of correctness."}
        </p>
      </div>
    </div>
  );
}
