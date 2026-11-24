import { IntegrationTiers } from "../components/IntegrationTiers";
import { Plate } from "../components/Plate";
import { BulletList, Cta, Note, PageHeader, Section } from "../components/ui";

export function Integrations() {
  return (
    <>
      <PageHeader
        title="Works alongside your engineering workflow."
        lede="Workflo is designed to complement existing development, CI/CD, source-control and testing workflows. This page lists what exists and what does not, without inventing partners."
        plate="/images/plate-trust.webp"
        plateLabel="Integrations"
      />

      <Section
        wide
        title="Availability, labelled."
        lede="Nothing on this page is presented as available unless it is. Workflo is pre-release."
      >
        <IntegrationTiers />
      </Section>

      <Section
        title="How it fits into a pipeline."
        lede="An execution is a step, not a platform migration."
      >
        <p>
          The intended shape is a step in the pipeline you already have: the job checks out the
          revision, invokes an execution, and keeps the receipt as an artifact. The pipeline keeps
          doing its job; the execution adds a record of what happened inside it.
        </p>
        <BulletList
          items={[
            "CI keeps ownership of build, deploy and promotion.",
            "Workflo adds a controlled execution with a recorded outcome.",
            "Receipts can be kept as build artifacts for later inspection.",
          ]}
        />
        <Note>
          No GitHub, GitLab, Slack or issue-tracker partnership is claimed. Items above are planned
          or roadmap only.
        </Note>
      </Section>

      <Section
        title="What is not planned."
        lede="Some things are deliberately out of scope."
      >
        <p>
          Workflo is not designed to replace a CI system, a test runner or a release process. It also
          does not generate or maintain tests, and it is not an autonomous QA service. If a workflow
          depends on those, Workflo is meant to sit next to it rather than stand in for it.
        </p>
      </Section>

      <Plate
        src="/images/plate-execute.webp"
        label="Pipeline"
        index="01 / 01"
        caption="An execution is a step in the pipeline you already have — not a platform migration."
        meta={["checkout", "execute", "receipt artifact"]}
        className="min-h-[54vh]"
      />

      <section>
        <div className="shell flex flex-wrap items-center justify-between gap-6 py-14">
          <h2 className="h-sub max-w-[30ch]">Need a specific integration for a pilot?</h2>
          <div className="flex flex-wrap gap-2.5">
            <Cta to="/early-access">Request early access</Cta>
            <Cta to="/docs#cli" variant="ghost">
              CLI reference
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
