import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { plateSrcSet } from "../scene/plates";
import { heroStat } from "../content/landing";
import { CINEMATIC_PHASES, PHASE_STARTS, plateCutAt } from "./motion/phases";
import { Navbar } from "./Navbar";
import { StatBlock } from "./StatBlock";

gsap.registerPlugin(ScrollTrigger);

const DESCRIPTION =
  "workflo writes and runs tests for your app on its own, then tells you whether it is safe to ship";

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

export function Hero() {
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const a1Ref = useRef<HTMLSpanElement>(null);
  const a2Ref = useRef<HTMLSpanElement>(null);
  const a3Ref = useRef<HTMLSpanElement>(null);
  const b1Ref = useRef<HTMLSpanElement>(null);
  const b2Ref = useRef<HTMLSpanElement>(null);
  const b3Ref = useRef<HTMLSpanElement>(null);
  const statTopRef = useRef<HTMLDivElement>(null);
  const statLeftRef = useRef<HTMLDivElement>(null);
  const statRightRef = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced) return;

    const screen = screenRef.current;
    const media = mediaRef.current;
    const overlay = overlayRef.current;
    const wipe = wipeRef.current;
    const nav = navRef.current;
    const desc = descRef.current;
    const cue = cueRef.current;
    const a1 = a1Ref.current;
    const a2 = a2Ref.current;
    const a3 = a3Ref.current;
    const b1 = b1Ref.current;
    const b2 = b2Ref.current;
    const b3 = b3Ref.current;
    const statTop = statTopRef.current;
    const statLeft = statLeftRef.current;
    const statRight = statRightRef.current;
    if (!screen || !media) return;

    const ctx = gsap.context(() => {
      // One master timeline. Beat boundaries are the named phases below, and the
      // hero's single ScrollTrigger is the only thing driving them.
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

      // Photographic drift: every plate moves inside its own frame for the whole
      // pinned track, so an image is never sitting still while it is on screen.
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
        .to(desc, { opacity: 0, duration: 0.15 }, verify)
        .to(overlay, { opacity: 0.4, duration: 0.15 }, verify)
        .to(statTop, { x: "10vw", y: "-6vh", opacity: 0, duration: 0.15 }, verify)
        .to(statLeft, { x: "-10vw", y: "6vh", opacity: 0, duration: 0.15 }, verify)
        .to(statRight, { x: "10vw", y: "6vh", opacity: 0, duration: 0.15 }, verify)
        .addLabel("prove", prove)
        .to(media, { scale: 1.5, rotate: 3, duration: 0.2 }, prove)
        .to(b1, { x: 0, y: 0, opacity: 1, duration: 0.13 }, prove)
        .to(b2, { x: 0, y: 0, opacity: 1, duration: 0.13 }, prove + 0.03)
        .to(b3, { x: 0, y: 0, opacity: 1, duration: 0.13 }, prove + 0.06)
        .addLabel("trust", trust)
        .to(overlay, { opacity: 0.85, duration: 0.2 }, trust)
        .to(wipe, { opacity: 1, duration: 0.01 }, trust)
        .to(wipe, { scaleY: 1, duration: 0.2 }, trust)
        .to(nav, { scale: 0.9, duration: 0.2 }, trust)
        .to(media, { opacity: 0, duration: 0.15 }, 0.85)
        .to([b1, b2, b3], { y: "-10vh", opacity: 0, duration: 0.15 }, 0.85);

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
          <h1 className="sr-only">release with proof</h1>

          <header
            ref={navRef}
            className="pointer-events-auto absolute left-0 right-0 top-0 z-20 origin-top"
          >
            <Navbar />
          </header>

          <span ref={a1Ref} aria-hidden="true" className={`${WORD_CLASS} left-4 top-[18%] md:left-10`}>
            release
          </span>
          <span
            ref={a2Ref}
            aria-hidden="true"
            className={`${WORD_CLASS} right-4 top-[38%] md:right-10`}
          >
            with
          </span>
          <span
            ref={a3Ref}
            aria-hidden="true"
            className={`${WORD_CLASS} left-[18%] top-[58%] md:left-[28%]`}
          >
            proof
          </span>

          <p
            ref={descRef}
            className="absolute left-6 top-[46%] max-w-[240px] text-[15px] leading-snug text-white/90 md:left-10"
          >
            {DESCRIPTION}
          </p>

          {reduced ? null : (
            <>
              <span
                ref={b1Ref}
                aria-hidden="true"
                className={`${WORD_CLASS} right-4 top-[18%] opacity-0 md:right-10`}
                style={{ transform: "translate3d(40vw, 30vh, 0)" }}
              >
                know
              </span>
              <span
                ref={b2Ref}
                aria-hidden="true"
                className={`${WORD_CLASS} left-4 top-[38%] opacity-0 md:left-10`}
                style={{ transform: "translate3d(40vw, 30vh, 0)" }}
              >
                it's
              </span>
              <span
                ref={b3Ref}
                aria-hidden="true"
                className={`${WORD_CLASS} right-[18%] top-[58%] opacity-0 md:right-[28%]`}
                style={{ transform: "translate3d(40vw, 30vh, 0)" }}
              >
                safe
              </span>
            </>
          )}

          <div ref={statTopRef} className="absolute right-6 top-[14%] md:right-24">
            <StatBlock {...heroStat("tests")} align="right" divider="before" rotate={20} />
          </div>

          <div ref={statLeftRef} className="absolute bottom-20 left-6 md:bottom-24 md:left-20">
            <StatBlock {...heroStat("checks")} divider="after" rotate={-20} />
          </div>

          <div ref={statRightRef} className="absolute bottom-16 right-6 md:bottom-20 md:right-20">
            <StatBlock {...heroStat("bugs")} align="right" divider="before" rotate={-20} />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-48 bg-gradient-to-b from-transparent to-black" />

        {reduced ? null : (
          <div ref={cueRef} aria-hidden="true" className="scroll-cue z-30">
            <span />
          </div>
        )}
      </div>
    </section>
  );
}
