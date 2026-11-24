import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { SectionBackdrop } from "./SectionBackdrop";
import { BOOKING_HREF } from "../content/booking";

gsap.registerPlugin(ScrollTrigger);

export function FinalCta() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = headingRef.current;
    if (!el || reduced) return;

    const chars = el.querySelectorAll<HTMLElement>("[data-cta-char]");
    const tween = gsap.fromTo(
      chars,
      { opacity: 0, y: 28, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.03,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  const words = "ship with proof".split(" ");

  return (
    <section id="book" className="relative isolate overflow-hidden px-6 py-32 md:px-10">
      <SectionBackdrop id="trust" position="66% 50%" />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
        <h2
          ref={headingRef}
          className="hero-title text-[14vw] font-medium text-white md:text-[13vw]"
        >
          {words.map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
              {word.split("").map((char, cIdx) => (
                <span
                  key={cIdx}
                  data-cta-char
                  className="inline-block will-change-transform"
                  style={reduced ? undefined : { opacity: 0 }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h2>

        <a
          href={BOOKING_HREF}
          className="mt-10 rounded-full bg-white px-8 py-4 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
        >
          book a demo
        </a>
      </div>
    </section>
  );
}
