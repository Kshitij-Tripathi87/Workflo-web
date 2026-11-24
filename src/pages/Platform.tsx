import { Plate } from "../components/Plate";
import { BulletList, Cta, Note, PageHeader, Section, TextLink } from "../components/ui";

const mono = (size: number, fill: string) => ({
  fontFamily: "var(--font-mono)",
  fontSize: size,
  fill,
});

function PlatformDiagram() {
  return (
    <svg
      viewBox="0 0 660 300"
      role="img"
      aria-labelledby="platform-diagram-title platform-diagram-desc"
      className="w-full"
    >
      <title id="platform-diagram-title">Platform layers</title>
      <desc id="platform-diagram-desc">
        Your environment provides a repository and a CI job. A controlled execution applies isolation
        and policy while running tests, probes, agents and logs. The execution produces a record:
        activity ledger, teardown result and signed receipt.
      </desc>

      <rect x="8" y="72" width="176" height="156" fill="rgba(18,21,24,0.5)" stroke="#292e31" />
      <text x="20" y="94" style={mono(9, "#f1f2ee")}>YOUR ENVIRONMENT</text>
      <text x="20" y="124" style={mono(8.5, "#90969a")}>repository + revision</text>
      <text x="20" y="144" style={mono(8.5, "#90969a")}>CI job or local shell</text>
      <text x="20" y="164" style={mono(8.5, "#90969a")}>build artifacts</text>

      <path d="M190 150 H220" stroke="#292e31" />
      <path d="M214 146 L220 150 L214 154" fill="none" stroke="#90969a" />

      <rect x="232" y="40" width="232" height="220" fill="rgba(18,21,24,0.5)" stroke="#292e31" />
      <text x="244" y="62" style={mono(9, "#f1f2ee")}>CONTROLLED EXECUTION</text>
      <rect x="248" y="84" width="200" height="140" fill="none" stroke="#3a4247" />
      <text x="258" y="104" style={mono(8.5, "#90969a")}>ISOLATION + POLICY</text>
      <text x="258" y="134" style={mono(8.5, "#d5d8d4")}>tests</text>
      <text x="258" y="154" style={mono(8.5, "#d5d8d4")}>probes</text>
      <text x="258" y="174" style={mono(8.5, "#d5d8d4")}>agents</text>
      <text x="258" y="194" style={mono(8.5, "#d5d8d4")}>logs</text>
      <text x="244" y="242" style={mono(8.5, "#90969a")}>teardown verified before receipt</text>

      <path d="M470 150 H500" stroke="#292e31" />
      <path d="M494 146 L500 150 L494 154" fill="none" stroke="#90969a" />

      <rect x="504" y="72" width="148" height="156" fill="rgba(199,243,107,0.06)" stroke="#c7f36b" strokeOpacity="0.55" />
      <text x="516" y="94" style={mono(9, "#f1f2ee")}>RECORD</text>
      <text x="516" y="124" style={mono(8.5, "#90969a")}>activity ledger</text>
      <text x="516" y="144" style={mono(8.5, "#90969a")}>teardown result</text>
      <text x="516" y="164" style={mono(8.5, "#90969a")}>signed receipt</text>

      <text x="8" y="24" style={mono(8.5, "#90969a")}>INPUT</text>
      <text x="504" y="24" style={mono(8.5, "#90969a")}>EVIDENCE</text>
    </svg>
  );
}

export function Platform() {
  return (
    <>
      <PageHeader
        title="Controlled execution, described plainly."
        lede="Workflo's architecture follows the lifecycle: declare the environment, bound it, observe it, record it, verify teardown, sign the record."
        plate="/images/plate-observe.webp"
        plateLabel="Platform"
      />

      <Section
        wide
        title="Your environment, a bounded execution, one record."
        lede="Workflo sits between the system you already run software in and the evidence you need afterwards."
      >
        <div className="panel p-4 md:p-6">
          <PlatformDiagram />
        </div>
        <p className="mt-5 max-w-[68ch] text-[14px] leading-relaxed text-muted">
          This diagram describes the model, not internal implementation. Details that are not public
          are not described here.
        </p>
      </Section>

      <Plate
        src="/images/plate-prove.webp"
        label="Boundaries"
        index="01 / 02"
        caption="Isolation is configuration. The record states what the run was permitted to touch."
        meta={["filesystem", "process", "network", "policy set"]}
        className="min-h-[56vh]"
      />

      <Section
        title="Execution environment model."
        lede="The run gets a declared environment instead of borrowing the host's."
      >
        <p>
          Toolchains, environment variables and mounted paths are established for the execution.
          Dependency state comes from the repository's lockfile rather than a fresh resolve. The
          environment description is part of the record.
        </p>
        <BulletList
          items={[
            "Repository and revision are captured before execution.",
            "Dependency preparation follows the repository's declared lockfile.",
            "Runtime and mounted paths are described for the execution.",
          ]}
        />
      </Section>

      <Section
        title="Isolation model."
        lede="Boundaries are applied before the first command, not enforced by convention."
      >
        <p>
          Filesystem access, process creation and network reach are bounded for the execution. What
          the run could touch is configuration, and it is described in the receipt rather than left
          to be inferred.
        </p>
      </Section>

      <Section
        title="Security policy model."
        lede="A policy set travels with an execution."
      >
        <p>
          Policies describe what an execution may do and what must be recorded. Applying the policy
          set is part of the execution, and its application is recorded alongside other activity.
        </p>
        <Note>
          Policies reduce exposure; they do not make a system absolutely secure. Workflo does not
          claim otherwise.
        </Note>
      </Section>

      <Section
        title="Activity and evidence capture."
        lede="One ledger per execution, written as activity happens."
      >
        <p>
          Test results, probe responses, API interactions, log output and agent inspection activity
          are recorded together. The point of correlation is the execution, not a dashboard assembled
          afterwards from four systems.
        </p>
        <BulletList
          items={[
            "Tests and probes record their results inside the execution.",
            "Agent inspection activity is recorded like any other activity.",
            "API interactions and logs attach to the same execution record.",
            "The ledger describes the execution and its artifacts.",
          ]}
        />
      </Section>

      <Section
        title="Receipt generation."
        lede="A record with an integrity check, not a certificate of correctness."
      >
        <p>
          The activity ledger and teardown result are consolidated into a receipt describing the
          execution. The receipt is signed so it can be checked for integrity after the fact. It
          makes no claim about whether the software is correct.
        </p>
        <p className="text-[14px] leading-relaxed text-muted">
          Receipt fields and signature details shown anywhere on this site are illustrative.
        </p>
      </Section>

      <Section
        title="Teardown verification."
        lede="The run is not finished when the command exits."
      >
        <p>
          Processes, mounts and temporary state created during the execution are checked. The result
          is recorded, including failures, before a receipt is produced.
        </p>
      </Section>

      <Section
        title="Local-first privacy."
        lede="Execution does not require sending source code to hosted inference."
      >
        <p>
          Source code is not sent to hosted inference through the Workflo inference pathway. The CLI
          is designed to operate in the environment you control, with the hosted platform as an
          optional surface for reviewing executions.
        </p>
        <p className="text-[13px] leading-relaxed text-muted/80">
          Read the <TextLink to="/security">security page</TextLink> for the boundaries and the
          limitations that come with them.
        </p>
      </Section>

      <section>
        <div className="shell flex flex-wrap items-center justify-between gap-6 py-14">
          <h2 className="h-sub max-w-[32ch]">
            The model is only useful if the record is inspectable.
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <Cta to="/docs#architecture">Architecture docs</Cta>
            <Cta to="/security" variant="ghost">
              Security
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
