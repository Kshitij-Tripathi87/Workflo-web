import { LifecycleSection } from "../components/LifecycleSection";
import { Plate } from "../components/Plate";
import { BulletList, CliBlock, Cta, Note, PageHeader, Section, TextLink } from "../components/ui";

export function HowItWorks() {
  return (
    <>
      <PageHeader
        title="What happens between a commit and a receipt."
        lede="An execution is a sequence, and the order is the point. Context is captured first, boundaries are applied before code runs, and teardown is checked before a receipt exists."
        plate="/images/plate-verify.webp"
        plateLabel="Lifecycle"
      />

      <Section
        wide
        title="The twelve stages."
        lede="Select a stage to see its role and the part of the execution structure it touches. The schematic changes with the selection."
      >
        <LifecycleSection />
      </Section>

      <Plate
        src="/images/plate-execute.webp"
        label="Execute"
        index="01 / 02"
        caption="Declared environment. Boundaries applied. Activity recorded as it happens."
        meta={["repository", "revision", "environment", "policy"]}
        className="min-h-[56vh]"
      />

      <Section
        title="Why the order matters."
        lede="Each stage constrains the one after it."
      >
        <p>
          Capturing the revision before preparing dependencies means the run is tied to one commit.
          Applying isolation before tests means the tests execute under the boundaries the receipt
          will describe. Recording activity before teardown means the record explains what was
          cleaned up, not just that cleanup ran.
        </p>
        <BulletList
          items={[
            "Context is captured before anything executes.",
            "Isolation and policy are applied before the first command.",
            "Activity is recorded while it happens, not reconstructed afterwards.",
            "Teardown verification precedes receipt generation.",
          ]}
        />
        <Note>
          No stage is presented as guaranteed to succeed. A failure is part of the record.
        </Note>
      </Section>

      <Section
        title="Sequence, in practice."
        lede="The intended command surface follows the same sequence."
      >
        <CliBlock
          title="execution sequence"
          lines={[
            { type: "cmd", text: "workflo init" },
            { type: "out", text: "write execution definition" },
            { type: "cmd", text: "workflo run" },
            { type: "out", text: "capture context · prepare environment" },
            { type: "out", text: "apply isolation and policy" },
            { type: "out", text: "run tests and probes · record activity" },
            { type: "out", text: "verify teardown · sign receipt" },
            { type: "cmd", text: "workflo inspect" },
            { type: "cmd", text: "workflo receipt" },
            { type: "comment", text: "# illustrative sequence — not a live system" },
          ]}
          note="Commands and output are illustrative."
        />
        <p className="text-[14px] leading-relaxed text-muted">
          The <TextLink to="/docs">documentation</TextLink> describes each stage in more detail,
          including how a failed stage is recorded.
        </p>
      </Section>

      <Section
        title="When a stage fails."
        lede="A record that hides failures is not evidence."
      >
        <p>
          If dependency preparation fails, the execution does not reach tests. If teardown
          verification fails, that result belongs in the receipt. If an agent could not reach the
          application, the activity shows it. The value of the record depends on it being a faithful
          account rather than a success report.
        </p>
        <BulletList
          items={[
            "Failures are recorded at the stage where they occurred.",
            "A missing observation is distinguishable from an observation that found nothing.",
            "Receipts describe the execution, including its incomplete parts.",
          ]}
        />
      </Section>

      <section>
        <div className="shell flex flex-wrap items-center justify-between gap-6 py-14">
          <h2 className="h-sub max-w-[30ch]">Read the reference, or start with a single run.</h2>
          <div className="flex flex-wrap gap-2.5">
            <Cta to="/docs#quickstart">Quickstart</Cta>
            <Cta to="/platform" variant="ghost">
              Platform architecture
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
