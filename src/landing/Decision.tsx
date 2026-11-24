import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { SectionBackdrop } from "./SectionBackdrop";

gsap.registerPlugin(ScrollTrigger);

const SENTENCE = "every release gets a clear yes or no.".split(" ");
const EXPLAINS = ["what failed", "how risky it is", "what to fix first"];

export function Decision() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced) return;

    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    const tween = gsap.fromTo(
      words,
      { opacity: 0.2 },
      {
        opacity: 1,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "center 45%",
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="product"
      className="relative isolate overflow-hidden px-6 py-32 md:px-10"
    >
      <SectionBackdrop id="prove" position="70% 50%" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <h2 className="hero-title flex flex-wrap gap-x-[0.22em] text-[8vw] font-medium text-white">
          {SENTENCE.map((word, index) => (
            <span
              key={`${word}-${index}`}
              data-word
              className="inline-block"
              style={reduced ? undefined : { opacity: 0.2 }}
            >
              {word}
            </span>
          ))}
        </h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {EXPLAINS.map((item) => (
            <div key={item} className="border-t border-white/20 pt-4 text-base text-white/70">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
