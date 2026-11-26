import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { plateSrcSet } from "../scene/plates";

gsap.registerPlugin(ScrollTrigger);

/**
 * Full-bleed environment plate behind a section with refined, varied lighting
 * tailored to each photographic plate's architectural composition.
 */
export function SectionBackdrop({
  id,
  position = "62% 50%",
}: {
  id: string;
  position?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const image = el.querySelector("img");
    if (!image) return;

    const tween = gsap.fromTo(
      image,
      { yPercent: -4, scale: 1.04 },
      {
        yPercent: 4,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  // Lighting variations per plate to avoid repetitive dark washes
  const overlayMap: Record<string, string> = {
    execute: "bg-gradient-to-b from-black via-black/20 to-black/90",
    observe: "bg-gradient-to-b from-black via-black/15 to-black/85",
    verify: "bg-gradient-to-b from-black via-black/25 to-black/95",
    prove: "bg-gradient-to-b from-black via-black/20 to-black/90",
    trust: "bg-gradient-to-b from-black via-black/30 to-black/95",
  };

  const overlayGrad = overlayMap[id] || "bg-gradient-to-b from-black via-black/25 to-black/90";

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <img
        src={`/images/plate-${id}.webp`}
        srcSet={plateSrcSet(`/images/plate-${id}.webp`)}
        sizes="100vw"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-x-0 h-[120%] w-full object-cover will-change-transform opacity-75"
        style={{ top: "-10%", objectPosition: position }}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className={`absolute inset-0 ${overlayGrad}`} />
    </div>
  );
}
