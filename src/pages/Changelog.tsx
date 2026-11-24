import { CHANGELOG, type ChangeState } from "../content/changelog";
import { Cta, Note, PageHeader, Section } from "../components/ui";

const STATES: { id: ChangeState; label: string; note: string }[] = [
  {
    id: "shipped",
    label: "Shipped",
    note: "Released and documented. Nothing has shipped publicly yet.",
  },
  {
    id: "experimental",
    label: "Experimental",
    note: "Available in a limited preview. Nothing is in an experimental release yet.",
  },
  {
    id: "planned",
    label: "Planned",
    note: "Designed, not available. Listed so planned work is not mistaken for shipped work.",
  },
];

export function Changelog() {
  return (
    <>
      <PageHeader
        title="Changelog."
        lede="What shipped, what is experimental and what is planned — kept separate on purpose. No public release has shipped."
        plate="/images/plate-verify.webp"
        plateLabel="Changelog"
      />

      <div className="shell pb-20">
        <Note>
          There are no version numbers yet because there are no releases. Nothing on this page
          should be read as an announcement.
        </Note>

        {STATES.map((state) => {
          const entries = CHANGELOG.filter((entry) => entry.state === state.id);

          return (
            <Section key={state.id} id={`changelog-${state.id}`} title={state.label} lede={state.note}>
              {entries.length === 0 ? (
                <div className="panel p-5">
                  <p className="font-mono text-[11.5px] text-muted">
                    No {state.label.toLowerCase()} entries.
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    When something ships, its entry will go here with a date and a link to the
                    documentation that describes it.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-line border-y border-line">
                  {entries.map((entry) => (
                    <li key={entry.id} className="py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-[14.5px] font-medium text-fg">{entry.title}</h3>
                        <span className="font-mono text-[9.5px] tracking-[0.16em] text-muted/60">
                          {state.label.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1.5 max-w-[64ch] text-[13.5px] leading-relaxed text-muted">
                        {entry.summary}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          );
        })}

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-6 py-14">
            <h2 className="h-sub max-w-[30ch]">Want to be told when there is a release?</h2>
            <div className="flex flex-wrap gap-2.5">
              <Cta to="/early-access">Request early access</Cta>
              <Cta to="/docs" variant="ghost">
                Documentation
              </Cta>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
