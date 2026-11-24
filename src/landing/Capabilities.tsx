import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

const ROWS = [
  {
    title: "autonomous test generation",
    body: "tests are written from the app's own routes and states.",
  },
  {
    title: "self-healing tests",
    body: "broken selectors are repaired, not switched off.",
  },
  {
    title: "release risk scoring",
    body: "each change gets a score based on what broke.",
  },
  {
    title: "ci/cd integration",
    body: "results attach to the pull request that opened them.",
  },
];

export function Capabilities() {
  return (
    <section
      id="capabilities"
      className="relative isolate overflow-hidden px-6 py-32 md:px-10"
    >
      <SectionBackdrop id="execute" position="68% 50%" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">capabilities</p>
        </Reveal>

        <ul className="mt-10 border-y border-white/20">
          {ROWS.map((row, index) => (
            <li key={row.title} className="border-b border-white/20 last:border-b-0">
              <Reveal delay={index * 0.05}>
                <div className="group flex flex-col gap-2 py-7 md:flex-row md:items-baseline md:justify-between md:gap-10">
                  <h2 className="text-2xl font-normal leading-snug text-white/70 transition-colors group-hover:text-white">
                    {row.title}
                  </h2>
                  <p className="max-w-md text-sm leading-relaxed text-white/60 md:text-right">
                    {row.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
