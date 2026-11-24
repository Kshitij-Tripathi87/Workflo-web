import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

const STEPS = ["it reads your app", "it writes and runs the tests", "it decides if you can ship"];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative isolate overflow-hidden px-6 py-32 md:px-10"
    >
      <SectionBackdrop id="verify" position="58% 50%" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">how it works</p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step} delay={index * 0.12} className="h-full">
              <div className="flex h-full flex-col rounded-3xl border border-white/20 p-8">
                <span aria-hidden="true" className="text-5xl font-medium text-white/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-10 text-xl font-normal leading-snug text-white">{step}</h2>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
