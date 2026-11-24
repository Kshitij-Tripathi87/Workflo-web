import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCompact, useReducedMotion } from "../lib/hooks";
import { PHASES } from "../scene/phases";
import { plateSrcSet } from "../scene/plates";

gsap.registerPlugin(ScrollTrigger);

/**
 * A pinned, scroll-scrubbed reel: the five environment plates travel through a
 * perspective field, tilting away from the centre of the viewport. The scroll
 * position doubles as the active lifecycle state.
 */
export function PhaseReel() {
  const reduced = useReducedMotion();
  const compact = useCompact();
  const staticMode = reduced || compact;

  const section = useRef<HTMLElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const lastActive = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr || staticMode) return;

    const cards = Array.from(tr.querySelectorAll<HTMLElement>("[data-reel-card]"));

    const ctx = gsap.context(() => {
      // The track is max-content wide, so clientWidth is its own full width.
      // Measure against the section viewport instead.
      const travel = () => Math.max(tr.scrollWidth - el.clientWidth, 1);

      gsap.to(tr, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${travel() + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const mid = window.innerWidth / 2;
            const trackLeft = tr.getBoundingClientRect().left;

            cards.forEach((card) => {
              // offsetLeft is immune to the transform we set below, so the
              // measurement does not feed back into itself.
              const center = trackLeft + card.offsetLeft + card.offsetWidth / 2;
              const delta = (center - mid) / window.innerWidth;
              const tilt = gsap.utils.clamp(-14, 14, delta * -26);
              card.style.transform = `rotateY(${tilt}deg) translateZ(${
                -Math.abs(delta) * 70
              }px)`;
            });

            const next = Math.round(self.progress * (PHASES.length - 1));
            if (next !== lastActive.current) {
              lastActive.current = next;
              setActive(next);
            }
          },
        },
      });
    }, el);

    return () => {
      lastActive.current = 0;
      ctx.revert();
    };
  }, [staticMode]);

  return (
    <section ref={section} className="reel" aria-label="Lifecycle states">
      <div className={`reel-inner ${staticMode ? "reel-inner--static" : ""}`}>
        <div className="shell reel-head">
          <div>
            <p className="label flex items-center gap-3">
              <span className="h-px w-6 bg-accent/70" />
              Lifecycle
            </p>
            <h2 className="h-section mt-4 max-w-[18ch]">Five states. One execution.</h2>
          </div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted/60">
            {staticMode ? "SWIPE" : "SCROLL TO ADVANCE"}
          </p>
        </div>

        <div className="reel-viewport">
          <div
            ref={track}
            role="group"
            aria-label="Lifecycle state plates"
            tabIndex={staticMode ? 0 : undefined}
            className={`reel-track ${staticMode ? "reel-track--static" : ""}`}
          >
            {PHASES.map((phase) => (
              <article key={phase.id} data-reel-card className="reel-card">
                <img
                  src={`/images/plate-${phase.id}.webp`}
                  srcSet={plateSrcSet(`/images/plate-${phase.id}.webp`)}
                  sizes="(min-width: 1024px) 54vw, 86vw"
                  alt=""
                  width={1600}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
                <div className="reel-grade" aria-hidden="true" />
                <div className="reel-card-body">
                  <span className="reel-index">{phase.index}</span>
                  <h3 className="reel-word">{phase.word}</h3>
                  <p className="reel-intent">{phase.intent}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="shell reel-foot">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="reel-dots">
              {PHASES.map((phase, index) => (
                <span
                  key={phase.id}
                  data-on={index === active}
                  className="reel-dot"
                />
              ))}
            </div>
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted">
              {String(active + 1).padStart(2, "0")} / 05
            </span>
          </div>
          <p className="hidden font-mono text-[10px] tracking-[0.16em] text-muted/55 sm:block">
            {PHASES[active].intent}
          </p>
        </div>
      </div>
    </section>
  );
}
