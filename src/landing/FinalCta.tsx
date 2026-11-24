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

    const tween = gsap.fromTo(
      el,
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <section id="book" className="relative isolate overflow-hidden px-6 py-32 md:px-10">
      <SectionBackdrop id="trust" position="66% 50%" />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
        <h2
          ref={headingRef}
          className="hero-title text-[14vw] font-medium text-white md:text-[13vw]"
        >
          ship with proof
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
