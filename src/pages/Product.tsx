import { Plate } from "../components/Plate";
import {
  BulletList,
  CliBlock,
  Cta,
  KeyValueList,
  Note,
  PageHeader,
  Section,
  TextLink,
} from "../components/ui";

export function Product() {
  return (
    <>
      <PageHeader
        title="A verification layer for software execution."
        lede="Workflo runs software in controlled environments, records what happens, and produces evidence you can inspect afterwards. It works alongside your pipeline rather than replacing it."
        plate="/images/plate-trust.webp"
        plateLabel="Product"
      />

      <Section
        title="One execution, described end to end."
        lede="Workflo is built around a single unit of work: one controlled execution with a declared context and a recorded outcome."
      >
        <p>
          Most tooling answers a narrow question: did the tests pass. Workflo answers the wider
          question the tests sit inside: what environment ran, what was it allowed to touch, what was
          observed, and was the environment cleaned up.
        </p>
        <BulletList
          items={[
            "Capture the repository, revision, dependencies and runtime for the run.",
            "Apply isolation and security policies before the first command.",
            "Run tests and application probes inside the prepared environment.",
            "Use agents to inspect behaviour, APIs and logs during the run.",
            "Record execution activity into one evidence ledger.",
            "Verify teardown and produce a signed execution receipt.",
          ]}
        />
      </Section>

      <Section
        title="Who it is for."
        lede="Workflo is aimed at teams that execute software constantly — by hand, in pipelines and through agents — and need a reliable account of what happened."
      >
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
          <div className="bg-bg p-5">
            <h3 className="text-[13.5px] font-medium">Primary</h3>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted">
              <li>Engineering leaders at AI-native software companies.</li>
              <li>Platform engineering teams.</li>
              <li>Teams building or operating autonomous coding workflows.</li>
            </ul>
          </div>
          <div className="bg-bg p-5">
            <h3 className="text-[13.5px] font-medium">Also</h3>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted">
              <li>QA and test-automation leads.</li>
              <li>DevOps and infrastructure engineers.</li>
              <li>Engineering managers and technical founders.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section
        title="What Workflo is not."
        lede="The boundaries are part of the product. Being precise about them is more useful than claiming a wider category."
      >
        <BulletList
          items={[
            "Not an autonomous QA testing product.",
            "Not an AI test-generation or test-maintenance tool.",
            "Not an AI coding assistant.",
            "Not a replacement for CI/CD.",
            "Not a replacement for human release decisions.",
          ]}
        />
        <Note>
          A signed receipt provides evidence about the recorded execution and receipt integrity. It
          does not prove that the software is correct.
        </Note>
      </Section>

      <Section
        title="The evidence model."
        lede="A receipt is a record of one execution, not a verdict about a codebase."
      >
        <KeyValueList
          items={[
            { k: "context", v: "repository, revision, environment, policy set" },
            { k: "activity", v: "tests, probes, API interactions, logs, inspection" },
            { k: "teardown", v: "verification result, including failures" },
            { k: "integrity", v: "signed artifact, scope-limited claim" },
          ]}
        />
        <p className="text-[14px] leading-relaxed text-muted">
          Inspect a sample receipt on the{" "}
          <TextLink to="/">homepage evidence section</TextLink>.
        </p>
      </Section>

      <Plate
        src="/images/plate-observe.webp"
        label="Record"
        index="01 / 02"
        caption="Tests, probes, API calls, logs and agent inspection land in one execution record."
        meta={["context", "activity", "teardown", "integrity"]}
        className="min-h-[58vh]"
      />

      <Section
        title="Agent inspection, bounded."
        lede="Agents are useful for looking. They are not the authority on whether a change ships."
      >
        <p>
          During an execution, agents can inspect application behaviour, API responses and logs. What
          they do is recorded like any other activity, so the inspection can be reviewed rather than
          taken on trust.
        </p>
        <p className="text-muted">
          Interpretation and release decisions stay with people. Workflo makes the activity
          inspectable; it does not decide what the activity means.
        </p>
      </Section>

      <Section title="Developer workflow." lede="Four commands describe the intended surface.">
        <CliBlock
          title="workflo cli"
          lines={[
            { type: "cmd", text: "workflo init" },
            { type: "cmd", text: "workflo run" },
            { type: "cmd", text: "workflo inspect" },
            { type: "cmd", text: "workflo receipt" },
            { type: "comment", text: "# illustrative command surface — not final" },
          ]}
          note="The CLI is not published. Syntax and output will change."
        />
        <p className="text-[14px] leading-relaxed text-muted">
          See the <TextLink to="/docs">documentation</TextLink> for the intended lifecycle and
          configuration shape.
        </p>
      </Section>

      <section>
        <div className="shell flex flex-wrap items-center justify-between gap-6 py-14">
          <h2 className="h-sub max-w-[30ch]">
            Add a verification layer without replacing the workflow you already have.
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <Cta to="/docs#installation">Get started</Cta>
            <Cta to="/how-it-works" variant="ghost">
              How it works
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
