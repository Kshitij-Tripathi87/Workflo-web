import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { Link } from "../lib/router";
import { plateSrcSet } from "../scene/plates";

gsap.registerPlugin(ScrollTrigger);

/**
 * Half-bleed photographic section: the image fills one side of the viewport
 * with parallax and a clip reveal, the copy stays to a few lines.
 */
export function SplitFeature({
  src,
  label,
  title,
  body,
  to,
  linkLabel,
  meta,
  side = "right",
  children,
}: {
  src: string;
  label: string;
  title: string;
  body?: string;
  to?: string;
  linkLabel?: string;
  meta?: string[];
  side?: "left" | "right";
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-split-media]",
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );

      gsap.from("[data-split-img]", {
        scale: 1.18,
        duration: 1.5,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });

      gsap.from("[data-split-reveal]", {
        y: 20,
        opacity: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 72%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} className="split">
      <div className={`split-grid ${side === "left" ? "split-grid--left" : ""}`}>
        <div className="split-media">
          <div className="split-media-inner" data-split-media aria-hidden="true">
            <img
              data-split-img
              src={src}
              srcSet={plateSrcSet(src)}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt=""
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="split-grade" aria-hidden="true" />
          <div className="split-frame" aria-hidden="true" />
          {meta ? (
            <ul className="split-meta" aria-hidden="true">
              {meta.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="split-copy">
          <p data-split-reveal className="label flex items-center gap-3">
            <span className="h-px w-6 bg-accent/70" />
            {label}
          </p>
          <h2 data-split-reveal className="h-section mt-5 max-w-[18ch]">
            {title}
          </h2>
          {body ? (
            <p
              data-split-reveal
              className="mt-5 max-w-[42ch] text-[14.5px] leading-relaxed text-muted"
            >
              {body}
            </p>
          ) : null}
          {children ? <div data-split-reveal className="mt-6">{children}</div> : null}
          {to && linkLabel ? (
            <div data-split-reveal className="mt-7">
              <Link
                to={to}
                className="inline-flex items-center border-b border-line pb-0.5 text-[13.5px] text-fg transition-colors hover:border-accent hover:text-accent"
              >
                {linkLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
