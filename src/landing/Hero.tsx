import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { plateSrcSet } from "../scene/plates";
import { CINEMATIC_PHASES, PHASE_STARTS, plateCutAt } from "./motion/phases";
import { Navbar } from "./Navbar";

gsap.registerPlugin(ScrollTrigger);

const WORD_CLASS =
  "hero-title absolute whitespace-nowrap text-[14vw] font-medium text-white md:text-[13vw]";

/** One environment plate per cinematic phase, crossfaded by the master timeline. */
const PLATES = [
  { id: "execute", position: "68% 50%", drift: 1 },
  { id: "observe", position: "56% 50%", drift: -1 },
  { id: "verify", position: "58% 50%", drift: 1 },
  { id: "prove", position: "70% 50%", drift: -1 },
  { id: "trust", position: "66% 50%", drift: 1 },
];

function SplitLetters({ word }: { word: string }) {
  return (
    <>
      {word.split("").map((char, index) => (
        <span
          key={index}
          data-hero-char
          className="inline-block will-change-transform"
        >
          {char}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const a1Ref = useRef<HTMLSpanElement>(null);
  const a2Ref = useRef<HTMLSpanElement>(null);
  const a3Ref = useRef<HTMLSpanElement>(null);
  const b1Ref = useRef<HTMLSpanElement>(null);
  const b2Ref = useRef<HTMLSpanElement>(null);
  const b3Ref = useRef<HTMLSpanElement>(null);
  const plateRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced) return;

    const screen = screenRef.current;
    const media = mediaRef.current;
    const overlay = overlayRef.current;
    const wipe = wipeRef.current;
    const nav = navRef.current;
    const cue = cueRef.current;
    const a1 = a1Ref.current;
    const a2 = a2Ref.current;
    const a3 = a3Ref.current;
    const b1 = b1Ref.current;
    const b2 = b2Ref.current;
    const b3 = b3Ref.current;
    if (!screen || !media) return;

    const ctx = gsap.context(() => {
      // 1. Initial Entrance: Animate "release with proof" letter-by-letter
      const aLetters = el.querySelectorAll("[data-hero-a] [data-hero-char]");
      gsap.fromTo(
        aLetters,
        { opacity: 0, y: 36, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: "power3.out",
          delay: 0.1,
        }
      );

      // 2. Master timeline driven by hero scroll
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=400%",
          pin: screen,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Photographic drift across all 5 plates
      plateRefs.current.forEach((plate, index) => {
        if (!plate) return;
        const drift = PLATES[index]?.drift ?? 1;
        tl.fromTo(
          plate,
          { scale: 1.16, xPercent: 2.2 * drift, yPercent: -1.2 },
          {
            scale: 1.02,
            xPercent: -2.2 * drift,
            yPercent: 1.2,
            duration: 1,
            ease: "none",
          },
          0,
        );
      });

      CINEMATIC_PHASES.slice(1).forEach((_, offset) => {
        const index = offset + 1;
        const incoming = plateRefs.current[index];
        const outgoing = plateRefs.current[index - 1];
        if (!incoming) return;
        const at = plateCutAt(index);
        tl.to(incoming, { opacity: 1, duration: 0.035 }, at);
        if (outgoing) tl.set(outgoing, { opacity: 0 }, at + 0.035);
      });

      const { execute, observe, verify, prove, trust } = PHASE_STARTS;

      const b1Letters = b1 ? b1.querySelectorAll("[data-hero-char]") : [];
      const b2Letters = b2 ? b2.querySelectorAll("[data-hero-char]") : [];
      const b3Letters = b3 ? b3.querySelectorAll("[data-hero-char]") : [];

      gsap.set([b1Letters, b2Letters, b3Letters], { opacity: 0, y: 40 });

      tl.addLabel("execute", execute)
        .to(cue, { opacity: 0, duration: 0.08 }, execute)
        .addLabel("observe", observe)
        .to(media, { scale: 1.15, duration: 0.22 }, observe)
        .to(a1, { y: "-12vh", duration: 0.08 }, observe)
        .to(a2, { y: "-8vh", duration: 0.08 }, observe)
        .to(a3, { y: "-4vh", duration: 0.08 }, observe)
        .addLabel("verify", verify)
        .to(media, { scale: 1.3, duration: 0.15 }, verify)
        .to(a1, { x: "-60vw", opacity: 0, duration: 0.15 }, verify)
        .to(a2, { x: "60vw", opacity: 0, duration: 0.15 }, verify)
        .to(a3, { y: "26vh", opacity: 0, duration: 0.15 }, verify)
        .to(overlay, { opacity: 0.4, duration: 0.15 }, verify)
        .addLabel("prove", prove)
        .to(media, { scale: 1.5, rotate: 3, duration: 0.2 }, prove)
        .to(
          b1Letters,
          { opacity: 1, y: 0, duration: 0.08, stagger: 0.02, ease: "power2.out" },
          prove
        )
        .to(
          b2Letters,
          { opacity: 1, y: 0, duration: 0.08, stagger: 0.02, ease: "power2.out" },
          prove + 0.05
        )
        .to(
          b3Letters,
          { opacity: 1, y: 0, duration: 0.08, stagger: 0.02, ease: "power2.out" },
          prove + 0.10
        )
        .addLabel("trust", trust)
        .to(overlay, { opacity: 0.85, duration: 0.2 }, trust)
        .to(wipe, { opacity: 1, duration: 0.01 }, trust)
        .to(wipe, { scaleY: 1, duration: 0.2 }, trust)
        .to(nav, { scale: 0.9, duration: 0.2 }, trust)
        .to(media, { opacity: 0, duration: 0.15 }, 0.85)
        .to([b1Letters, b2Letters, b3Letters], { y: "-10vh", opacity: 0, duration: 0.15, stagger: 0.01 }, 0.85);

      return tl;
    }, el);

    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} id="top" className="relative bg-black">
      <div ref={screenRef} className="relative h-screen w-full overflow-hidden bg-black">
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          {PLATES.map((plate, index) => (
            <img
              key={plate.id}
              ref={(node) => {
                plateRefs.current[index] = node;
              }}
              src={`/images/plate-${plate.id}.webp`}
              srcSet={plateSrcSet(`/images/plate-${plate.id}.webp`)}
              sizes="100vw"
              width={1600}
              height={900}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ objectPosition: plate.position, opacity: index === 0 ? 1 : 0 }}
            />
          ))}

          <div className="pointer-events-none absolute inset-0 bg-black/55" />
        </div>

        <div
          ref={overlayRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-black"
          style={{ opacity: 0 }}
        />
        <div
          ref={wipeRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 origin-bottom bg-gradient-to-t from-black via-black/90 to-transparent"
          style={{ opacity: 0, transform: "scaleY(0.2)" }}
        />

        <div className="pointer-events-none relative z-20 h-full w-full">
          <h1 className="sr-only">release</h1>

          <header
            ref={navRef}
            className="pointer-events-auto absolute left-0 right-0 top-0 z-20 origin-top"
          >
            <Navbar />
          </header>

          {/* Letter-by-letter entrance words */}
          <span
            ref={a1Ref}
            data-hero-a
            aria-hidden="true"
            className={`${WORD_CLASS} left-4 top-[18%] md:left-10`}
          >
            <SplitLetters word="release" />
          </span>
          <span
            ref={a2Ref}
            data-hero-a
            aria-hidden="true"
            className={`${WORD_CLASS} right-4 top-[38%] md:right-10`}
          >
            <SplitLetters word="with" />
          </span>
          <span
            ref={a3Ref}
            data-hero-a
            aria-hidden="true"
            className={`${WORD_CLASS} left-[18%] top-[58%] md:left-[28%]`}
          >
            <SplitLetters word="proof" />
          </span>

          {/* Scroll-revealed letter-by-letter proof words (NO side clutter) */}
          {reduced ? null : (
            <>
              <span
                ref={b1Ref}
                data-hero-b
                aria-hidden="true"
                className={`${WORD_CLASS} right-4 top-[18%] md:right-10`}
              >
                <SplitLetters word="know" />
              </span>
              <span
                ref={b2Ref}
                data-hero-b
                aria-hidden="true"
                className={`${WORD_CLASS} left-4 top-[38%] md:left-10`}
              >
                <SplitLetters word="it's" />
              </span>
              <span
                ref={b3Ref}
                data-hero-b
                aria-hidden="true"
                className={`${WORD_CLASS} right-[18%] top-[58%] md:right-[28%]`}
              >
                <SplitLetters word="safe" />
              </span>
            </>
          )}

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-48 bg-gradient-to-b from-transparent to-black" />
          {reduced ? null : (
            <div ref={cueRef} aria-hidden="true" className="scroll-cue z-30">
              <span />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
