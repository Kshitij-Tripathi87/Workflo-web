import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";
import { useReducedMotion } from "../lib/hooks";

gsap.registerPlugin(ScrollTrigger);

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

function CapabilityTitle({ text, delay }: { text: string; delay: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const chars = el.querySelectorAll<HTMLElement>("[data-cap-char]");
    const tween = gsap.fromTo(
      chars,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.02,
        duration: 0.35,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced, delay]);

  const words = text.split(" ");
  return (
    <h2
      ref={ref}
      className="text-2xl font-normal leading-snug text-white/70 transition-colors group-hover:text-white"
    >
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, cIdx) => (
            <span
              key={cIdx}
              data-cap-char
              className="inline-block will-change-transform"
              style={reduced ? undefined : { opacity: 0 }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}

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
                  <CapabilityTitle text={row.title} delay={index * 0.06} />
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
