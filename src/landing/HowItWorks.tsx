import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";
import { useReducedMotion } from "../lib/hooks";

gsap.registerPlugin(ScrollTrigger);

const STEPS = ["it reads your app", "it writes and runs the tests", "it decides if you can ship"];

function StepHeading({ text, delay }: { text: string; delay: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const chars = el.querySelectorAll<HTMLElement>("[data-step-char]");
    const tween = gsap.fromTo(
      chars,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.02,
        duration: 0.4,
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
    <h2 ref={ref} className="mt-10 text-xl font-normal leading-snug text-white">
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, cIdx) => (
            <span
              key={cIdx}
              data-step-char
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
                <StepHeading text={step} delay={index * 0.1} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
