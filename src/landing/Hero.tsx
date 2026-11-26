import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { plateSrcSet } from "../scene/plates";
import { Navbar } from "./Navbar";

gsap.registerPlugin(ScrollTrigger);

const WORD_CLASS =
  "hero-title absolute whitespace-nowrap text-[13vw] font-medium text-white md:text-[11.5vw] tracking-tight drop-shadow-2xl";

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
          style={{ opacity: 0, transform: "translate3d(0, 20px, 0)" }}
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
      const a1Letters = a1 ? Array.from(a1.querySelectorAll<HTMLElement>("[data-hero-char]")) : [];
      const a2Letters = a2 ? Array.from(a2.querySelectorAll<HTMLElement>("[data-hero-char]")) : [];
      const a3Letters = a3 ? Array.from(a3.querySelectorAll<HTMLElement>("[data-hero-char]")) : [];
      const b1Letters = b1 ? Array.from(b1.querySelectorAll<HTMLElement>("[data-hero-char]")) : [];
      const b2Letters = b2 ? Array.from(b2.querySelectorAll<HTMLElement>("[data-hero-char]")) : [];
      const b3Letters = b3 ? Array.from(b3.querySelectorAll<HTMLElement>("[data-hero-char]")) : [];

      // Initial state of letter spans: hidden
      gsap.set([...a1Letters, ...a2Letters, ...a3Letters, ...b1Letters, ...b2Letters, ...b3Letters], {
        opacity: 0,
        y: 20,
      });

      // Master timeline driven directly by scroll scrub
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=420%",
          pin: screen,
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Photographic drift across all 5 plates
      plateRefs.current.forEach((plate, index) => {
        if (!plate) return;
        const drift = PLATES[index]?.drift ?? 1;
        tl.fromTo(
          plate,
          { scale: 1.14, xPercent: 1.8 * drift, yPercent: -1.0 },
          {
            scale: 1.02,
            xPercent: -1.8 * drift,
            yPercent: 1.0,
            duration: 1,
            ease: "none",
          },
          0,
        );
      });

      // Scroll cue fades out immediately on initial scroll
      tl.to(cue, { opacity: 0, duration: 0.02 }, 0.0);

      // --- PHASE 1: "release with proof" reveals letter by letter ---
      // 1. "release" (0.01 - 0.12)
      tl.to(
        a1Letters,
        {
          opacity: 1,
          y: 0,
          stagger: 0.014,
          duration: 0.015,
          ease: "none",
        },
        0.01
      );

      // 2. "with" (0.13 - 0.20)
      tl.to(
        a2Letters,
        {
          opacity: 1,
          y: 0,
          stagger: 0.014,
          duration: 0.015,
          ease: "none",
        },
        0.13
      );

      // 3. "proof" (0.21 - 0.29)
      tl.to(
        a3Letters,
        {
          opacity: 1,
          y: 0,
          stagger: 0.014,
          duration: 0.015,
          ease: "none",
        },
        0.21
      );

      // --- OBSERVE TRANSITION (0.34 - 0.44) ---
      const atObserve = 0.34;
      tl.addLabel("observe", atObserve);
      const p1 = plateRefs.current[1];
      const p0 = plateRefs.current[0];
      if (p1) tl.to(p1, { opacity: 1, duration: 0.04 }, atObserve);
      if (p0) tl.set(p0, { opacity: 0 }, atObserve + 0.04);

      tl.to(media, { scale: 1.12, duration: 0.10 }, atObserve);

      // --- VERIFY & PHASE A CLEAN DISSOLVE (0.44 - 0.52) ---
      // Instead of throwing words to opposite off-screen edges, cleanly dissolve Phase A together
      const atVerify = 0.46;
      tl.addLabel("verify", atVerify);
      const p2 = plateRefs.current[2];
      if (p2) tl.to(p2, { opacity: 1, duration: 0.04 }, atVerify);
      if (p1) tl.set(p1, { opacity: 0 }, atVerify + 0.04);

      tl.to(media, { scale: 1.22, duration: 0.10 }, atVerify)
        .to([a1, a2, a3], { opacity: 0, y: -28, duration: 0.06 }, atVerify)
        .to(overlay, { opacity: 0.35, duration: 0.08 }, atVerify);

      // --- PROVE PHASE: "knowing it's safe" reveals in a cohesive composition (0.54 - 0.76) ---
      const atProve = 0.54;
      tl.addLabel("prove", atProve);
      const p3 = plateRefs.current[3];
      if (p3) tl.to(p3, { opacity: 1, duration: 0.04 }, atProve);
      if (p2) tl.set(p2, { opacity: 0 }, atProve + 0.04);

      tl.to(media, { scale: 1.34, duration: 0.14 }, atProve)
        .to(
          b1Letters,
          { opacity: 1, y: 0, stagger: 0.012, duration: 0.015, ease: "none" },
          atProve + 0.02
        )
        .to(
          b2Letters,
          { opacity: 1, y: 0, stagger: 0.012, duration: 0.015, ease: "none" },
          atProve + 0.08
        )
        .to(
          b3Letters,
          { opacity: 1, y: 0, stagger: 0.012, duration: 0.015, ease: "none" },
          atProve + 0.14
        );

      // --- TRUST & SETTLE PHASE (0.78 - 0.96) ---
      // Let the text settle into a balanced, highly legible lockup before final dissolve
      const atTrust = 0.80;
      tl.addLabel("trust", atTrust);
      const p4 = plateRefs.current[4];
      if (p4) tl.to(p4, { opacity: 1, duration: 0.04 }, atTrust);
      if (p3) tl.set(p3, { opacity: 0 }, atTrust + 0.04);

      tl.to(overlay, { opacity: 0.85, duration: 0.12 }, atTrust)
        .to(wipe, { opacity: 1, duration: 0.01 }, atTrust)
        .to(wipe, { scaleY: 1, duration: 0.12 }, atTrust)
        .to(nav, { scale: 0.95, opacity: 0.8, duration: 0.10 }, atTrust)
        .to(media, { opacity: 0, duration: 0.12 }, atTrust)
        .to([b1, b2, b3], { y: -30, opacity: 0, duration: 0.10 }, atTrust + 0.04);

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

          {/* Scrim overlay with subtle metallic reflection depth */}
          <div className="pointer-events-none absolute inset-0 bg-black/45" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
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
          <h1 className="sr-only">release with proof</h1>

          <header
            ref={navRef}
            className="pointer-events-auto absolute left-0 right-0 top-0 z-20 origin-top"
          >
            <Navbar />
          </header>

          {/* Phase 1: Letter-by-letter entrance words */}
          <span
            ref={a1Ref}
            data-hero-a
            aria-hidden="true"
            className={`${WORD_CLASS} left-6 top-[20%] md:left-14`}
          >
            <SplitLetters word="release" />
          </span>
          <span
            ref={a2Ref}
            data-hero-a
            aria-hidden="true"
            className={`${WORD_CLASS} right-6 top-[38%] md:right-16`}
          >
            <SplitLetters word="with" />
          </span>
          <span
            ref={a3Ref}
            data-hero-a
            aria-hidden="true"
            className={`${WORD_CLASS} left-10 top-[56%] md:left-28`}
          >
            <SplitLetters word="proof" />
          </span>

          {/* Phase 2: Letter-by-letter cohesive lockup: knowing it's safe */}
          {reduced ? null : (
            <>
              <span
                ref={b1Ref}
                data-hero-b
                aria-hidden="true"
                className={`${WORD_CLASS} left-6 top-[20%] md:left-14`}
              >
                <SplitLetters word="knowing" />
              </span>
              <span
                ref={b2Ref}
                data-hero-b
                aria-hidden="true"
                className={`${WORD_CLASS} right-6 top-[38%] md:right-16`}
              >
                <SplitLetters word="it's" />
              </span>
              <span
                ref={b3Ref}
                data-hero-b
                aria-hidden="true"
                className={`${WORD_CLASS} left-10 top-[56%] md:left-28`}
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
