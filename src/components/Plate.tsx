import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { plateSrcSet } from "../scene/plates";

gsap.registerPlugin(ScrollTrigger);

function useBackdropMotion<T extends HTMLElement>(
  ref: RefObject<T | null>,
  reduced: boolean,
  scrub = 7,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const media = el.querySelector<HTMLElement>("[data-plate-media]");
    if (!media) return;

    const tween = gsap.fromTo(
      media,
      { yPercent: -scrub },
      {
        yPercent: scrub,
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
  }, [ref, reduced, scrub]);
}

/**
 * A photographic environment plate used behind page headers.
 * Purely atmospheric: the image is decorative, the copy carries the meaning.
 */
export function PlateBackdrop({
  src,
  variant = "band",
}: {
  src: string;
  variant?: "band" | "header";
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  useBackdropMotion(ref, reduced);

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="plate-media" data-plate-media>
        <img
          src={src}
          srcSet={plateSrcSet(src)}
          sizes="100vw"
          alt=""
          width={1600}
          height={900}
          loading="eager"
          decoding="async"
        />
      </div>
      <div className={variant === "header" ? "plate-grade plate-grade-header" : "plate-grade"} />
      <div className="plate-grain" />
    </div>
  );
}

/**
 * Full-bleed image section that carries real interface content on top of it.
 * Heavier grade than the editorial plates because panels sit over the image.
 */
export function BackdropSection({
  src,
  label,
  title,
  lede,
  children,
}: {
  src: string;
  label: string;
  title: string;
  lede: string;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  useBackdropMotion(ref, reduced, 6);

  return (
    <section ref={ref} className="backdrop-section">
      <div className="plate-media" data-plate-media aria-hidden="true">
        <img
          src={src}
          srcSet={plateSrcSet(src)}
          sizes="100vw"
          alt=""
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="backdrop-grade" aria-hidden="true" />
      <div className="plate-grain" aria-hidden="true" />

      <div className="shell relative z-10 py-16 md:py-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
          <div>
            <p className="label flex items-center gap-3">
              <span className="h-px w-6 bg-accent/70" />
              {label}
            </p>
            <h2 className="h-section mt-5 max-w-[20ch]">{title}</h2>
          </div>
          <p className="max-w-[46ch] text-[14.5px] leading-relaxed text-muted">{lede}</p>
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

/**
 * Full-bleed editorial band: parallax plate, HUD frame, caption block.
 */
export function Plate({
  src,
  label,
  index,
  caption,
  meta,
  className = "min-h-[64vh]",
  priority = false,
  children,
}: {
  src: string;
  label: string;
  index?: string;
  caption?: string;
  meta?: string[];
  className?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  useBackdropMotion(ref, reduced);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-plate-img]", {
        scale: 1.22,
        duration: 1.7,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });

      gsap.from("[data-plate-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 76%", once: true },
      });

      gsap.from("[data-plate-rule]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 76%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} className={`plate ${className}`}>
      <div className="plate-media" data-plate-media aria-hidden="true">
        <img
          data-plate-img
          src={src}
          srcSet={plateSrcSet(src)}
          sizes="100vw"
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
      <div className="plate-grade" aria-hidden="true" />
      <div className="plate-grain" aria-hidden="true" />

      <div className="shell relative z-10 flex min-h-[inherit] flex-col justify-between pb-12 pt-6 md:pb-16 md:pt-7">
        <div className="flex items-center justify-between gap-6">
          <p className="label flex items-center gap-3">
            <span className="h-px w-6 bg-accent/70" />
            {label}
          </p>
          {index ? (
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted/60">{index}</p>
          ) : null}
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-[54ch]">
            <div data-plate-rule className="h-px w-full max-w-[15rem] bg-fg/25" />
            {children ?? (
              <p
                data-plate-reveal
                className="mt-5 text-[clamp(1.3rem,2.4vw,2.05rem)] font-medium leading-[1.14] tracking-[-0.02em] text-fg"
              >
                {caption}
              </p>
            )}
          </div>

          {meta ? (
            <ul
              data-plate-reveal
              className="hidden shrink-0 space-y-1.5 border-l border-fg/15 pl-5 font-mono text-[10.5px] tracking-[0.08em] text-fg/60 md:block"
            >
              {meta.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
