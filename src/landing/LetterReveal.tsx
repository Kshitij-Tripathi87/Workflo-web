import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";

gsap.registerPlugin(ScrollTrigger);

interface LetterRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  scrub?: boolean;
  stagger?: number;
  start?: string;
  end?: string;
}

export function LetterReveal({
  text,
  className = "",
  as: Component = "h2",
  scrub = true,
  stagger = 0.02,
  start = "top 85%",
  end = "center 50%",
}: LetterRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduced) return;

    const chars = el.querySelectorAll<HTMLElement>("[data-reveal-char]");
    if (!chars.length) return;

    if (scrub) {
      const tween = gsap.fromTo(
        chars,
        { opacity: 0.15, y: 3 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.02,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: true,
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    } else {
      const tween = gsap.fromTo(
        chars,
        { opacity: 0, y: 4 },
        {
          opacity: 1,
          y: 0,
          stagger,
          duration: 0.35,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }
  }, [reduced, scrub, stagger, start, end, text]);

  const words = text.split(" ");

  return (
    <Component
      ref={containerRef as any}
      className={`hero-title flex flex-wrap gap-x-[0.25em] ${className}`}
    >
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap">
          {word.split("").map((char, cIdx) => (
            <span
              key={cIdx}
              data-reveal-char
              className="inline-block will-change-transform"
              style={reduced ? { opacity: 1 } : { opacity: 0.15 }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Component>
  );
}
