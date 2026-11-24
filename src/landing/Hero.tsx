import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { plateSrcSet } from "../scene/plates";
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
          style={{ opacity: 0, transform: "translate3d(0, 24px, 0)" }}
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
        y: 24,
      });

      // Master timeline driven directly by scroll scrub
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=450%",
          pin: screen,
          scrub: 0.35,
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

      // Scroll cue fades out immediately on initial scroll
      tl.to(cue, { opacity: 0, duration: 0.03 }, 0.0);

      // --- SCROLL-DRIVEN LETTER-BY-LETTER REVEAL ---
      // 1. "release" (r, e, l, e, a, s, e) - reveals letter by letter as user scrolls down
      tl.to(
        a1Letters,
        {
          opacity: 1,
          y: 0,
          stagger: 0.018,
          duration: 0.02,
          ease: "none",
        },
        0.01
      );

      // 2. "with" (w, i, t, h) - reveals letter by letter at the side as user continues scrolling
      tl.to(
        a2Letters,
        {
          opacity: 1,
          y: 0,
          stagger: 0.018,
          duration: 0.02,
          ease: "none",
        },
        0.15
      );

      // 3. "proof" (p, r, o, o, f) - reveals letter by letter as user scrolls further
      tl.to(
        a3Letters,
        {
          opacity: 1,
          y: 0,
          stagger: 0.018,
          duration: 0.02,
          ease: "none",
        },
        0.24
      );

      // --- OBSERVE PHASE ---
      const atObserve = 0.38;
      tl.addLabel("observe", atObserve);
      const p1 = plateRefs.current[1];
      const p0 = plateRefs.current[0];
      if (p1) tl.to(p1, { opacity: 1, duration: 0.035 }, atObserve);
      if (p0) tl.set(p0, { opacity: 0 }, atObserve + 0.035);

      tl.to(media, { scale: 1.15, duration: 0.12 }, atObserve)
        .to(a1, { y: "-12vh", duration: 0.08 }, atObserve)
        .to(a2, { y: "-8vh", duration: 0.08 }, atObserve)
        .to(a3, { y: "-4vh", duration: 0.08 }, atObserve);

      // --- VERIFY PHASE ---
      const atVerify = 0.50;
      tl.addLabel("verify", atVerify);
      const p2 = plateRefs.current[2];
      if (p2) tl.to(p2, { opacity: 1, duration: 0.035 }, atVerify);
      if (p1) tl.set(p1, { opacity: 0 }, atVerify + 0.035);

      tl.to(media, { scale: 1.3, duration: 0.12 }, atVerify)
        .to(a1, { x: "-60vw", opacity: 0, duration: 0.12 }, atVerify)
        .to(a2, { x: "60vw", opacity: 0, duration: 0.12 }, atVerify)
        .to(a3, { y: "26vh", opacity: 0, duration: 0.12 }, atVerify)
        .to(overlay, { opacity: 0.4, duration: 0.12 }, atVerify);

      // --- PROVE PHASE ("know it's safe" reveals letter by letter on scroll) ---
      const atProve = 0.65;
      tl.addLabel("prove", atProve);
      const p3 = plateRefs.current[3];
      if (p3) tl.to(p3, { opacity: 1, duration: 0.035 }, atProve);
      if (p2) tl.set(p2, { opacity: 0 }, atProve + 0.035);

      tl.to(media, { scale: 1.5, rotate: 3, duration: 0.15 }, atProve)
        .to(
          b1Letters,
          { opacity: 1, y: 0, stagger: 0.015, duration: 0.02, ease: "none" },
          atProve + 0.02
        )
        .to(
          b2Letters,
          { opacity: 1, y: 0, stagger: 0.015, duration: 0.02, ease: "none" },
          atProve + 0.08
        )
        .to(
          b3Letters,
          { opacity: 1, y: 0, stagger: 0.015, duration: 0.02, ease: "none" },
          atProve + 0.14
        );

      // --- TRUST PHASE ---
      const atTrust = 0.85;
      tl.addLabel("trust", atTrust);
      const p4 = plateRefs.current[4];
      if (p4) tl.to(p4, { opacity: 1, duration: 0.035 }, atTrust);
      if (p3) tl.set(p3, { opacity: 0 }, atTrust + 0.035);

      tl.to(overlay, { opacity: 0.85, duration: 0.12 }, atTrust)
        .to(wipe, { opacity: 1, duration: 0.01 }, atTrust)
        .to(wipe, { scaleY: 1, duration: 0.12 }, atTrust)
        .to(nav, { scale: 0.9, duration: 0.12 }, atTrust)
        .to(media, { opacity: 0, duration: 0.12 }, atTrust)
        .to([b1Letters, b2Letters, b3Letters], { y: "-10vh", opacity: 0, duration: 0.12, stagger: 0.01 }, atTrust);

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

          {/* Letter-by-letter scroll-scrubbed entrance words */}
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

          {/* Letter-by-letter scroll-scrubbed proof words */}
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
