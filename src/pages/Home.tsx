import { ExecutionConsole } from "../components/ExecutionConsole";
import { LifecycleSection } from "../components/LifecycleSection";
import { BackdropSection, Plate } from "../components/Plate";
import { PhaseReel } from "../components/PhaseReel";
import { Receipt } from "../components/Receipt";
import { SplitFeature } from "../components/SplitFeature";
import { Stage } from "../components/Stage";
import { Cta, Section, TextLink } from "../components/ui";

const STANDING = [
  {
    title: "CI/CD stays in charge",
    body: "Builds and promotion stay in your pipeline.",
  },
  {
    title: "People decide the release",
    body: "Agents inspect. They do not approve a change.",
  },
  {
    title: "Claims stay bounded",
    body: "A receipt records one run, not correctness.",
  },
];

export function Home() {
  return (
    <>
      <Stage />

      <Plate
        src="/images/plate-execute.webp"
        label="Manifesto"
        index="01 / 05"
        className="min-h-[88vh]"
        priority
      >
        <h2
          data-plate-reveal
          className="mt-5 max-w-[16ch] text-[clamp(2.1rem,5vw,4rem)] font-semibold leading-[0.94] tracking-[-0.035em]"
        >
          Don’t just run the code.
        </h2>
        <p
          data-plate-reveal
          className="mt-4 text-[clamp(1.2rem,2.4vw,1.85rem)] font-medium leading-[1.12] tracking-[-0.02em] text-accent"
        >
          Know what happened.
        </p>
        <div data-plate-reveal className="mt-8 flex flex-wrap gap-2.5">
          <Cta to="/docs#installation">Get started</Cta>
          <Cta to="/how-it-works" variant="ghost">
            See the lifecycle
          </Cta>
        </div>
      </Plate>

      <PhaseReel />

      <BackdropSection
        src="/images/plate-observe.webp"
        label="The record"
        title="One run. One record."
        lede="Context, activity and teardown attached to one execution."
      >
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <ExecutionConsole />
          <Receipt />
        </div>
      </BackdropSection>

      <Section
        wide
        title="Twelve stages. One execution."
        lede="Isolation and policy before code runs. Teardown verified before the receipt."
      >
        <LifecycleSection />
      </Section>

      <SplitFeature
        src="/images/plate-prove.webp"
        label="Boundaries"
        title="Applied before the first command."
        body="Filesystem, process and network limits are configuration. The record states what the run could touch."
        meta={["filesystem", "process", "network", "policy"]}
        to="/security"
        linkLabel="Read the security model"
      />

      <Section
        wide
        title="It sits beside what you already run."
        lede="No replacement for CI/CD, no autonomous release, no absolute security claim."
      >
        <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
          {STANDING.map((item) => (
            <div key={item.title} className="bg-bg p-5">
              <h3 className="text-[14px] font-medium text-fg">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <TextLink to="/integrations">How it fits into a pipeline</TextLink>
        </div>
      </Section>

      <Plate
        src="/images/plate-trust.webp"
        label="Trust"
        index="05 / 05"
        className="min-h-[80vh]"
      >
        <h2 data-plate-reveal className="h-section mt-5 max-w-[24ch]">
          Know what ran. Know what happened.
        </h2>
        <p data-plate-reveal className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-muted">
          Receipts for teams that need more than a green check.
        </p>
        <div data-plate-reveal className="mt-8 flex flex-wrap gap-2.5">
          <Cta to="/docs#installation">Get started</Cta>
          <Cta to="/docs" variant="ghost">
            Read the documentation
          </Cta>
          <Cta to="/early-access" variant="ghost">
            Request early access
          </Cta>
        </div>
      </Plate>
    </>
  );
}
