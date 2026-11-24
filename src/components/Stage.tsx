import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCompact, useReducedMotion } from "../lib/hooks";
import { Link } from "../lib/router";
import { PHASES } from "../scene/phases";
import { plateSrcSet } from "../scene/plates";
import { HOLD, SHOTS, lerpPose, smoothstep } from "../scene/shots";
import { stage } from "../scroll/stage";

gsap.registerPlugin(ScrollTrigger);

const LAST = PHASES.length - 1;

/** Text and word follow the frame once the incoming plate is mostly revealed. */
function indexForPhasePos(phasePos: number) {
  return Math.min(LAST, Math.max(0, Math.floor(phasePos + 0.32)));
}

/**
 * Reduced-motion variant: the same five plates, no pin, no camera movement.
 */
function StaticStage() {
  return (
    <>
      <section className="stage-static-hero" aria-labelledby="stage-heading">
        <img
          src="/images/plate-execute.webp"
          srcSet={plateSrcSet("/images/plate-execute.webp")}
          sizes="100vw"
          width={1600}
          height={900}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="stage-static-grade" aria-hidden="true" />
        <div className="shell relative z-10 pb-14">
          <h1 id="stage-heading" className="h-display mt-5 max-w-[18ch]">
            Software execution. Independently verified.
          </h1>
          <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-muted">
            Controlled execution. Recorded activity. Evidence you can inspect.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link to="/docs#installation" className="btn btn-primary">
              Get started
            </Link>
            <Link to="/docs" className="btn btn-ghost">
              Read the documentation
            </Link>
          </div>
        </div>
      </section>

      <ol className="stage-static-list">
        {PHASES.map((phase) => (
          <li key={phase.id} className="stage-static-item">
            <div className="stage-static-media">
              <img
                src={`/images/plate-${phase.id}.webp`}
                srcSet={plateSrcSet(`/images/plate-${phase.id}.webp`)}
                sizes="(min-width: 768px) 40vw, 100vw"
                width={1600}
                height={900}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <p className="label">
                {phase.index} · {phase.word}
              </p>
              <h2 className="h-sub mt-3 max-w-[24ch]">{phase.title}</h2>
              <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
                {phase.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

export function Stage() {
  const reduced = useReducedMotion();
  const compact = useCompact();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  const phase = PHASES[index];
  const opening = index === 0;

  useEffect(() => {
    if (reduced) {
      stage.progress = 0;
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const frames = Array.from(section.querySelectorAll<HTMLElement>("[data-frame]"));
    const cams = frames.map((frame) => frame.querySelector<HTMLElement>("[data-cam]"));
    const bar = section.querySelector<HTMLElement>("[data-progress]");
    const word = section.querySelector<HTMLElement>("[data-word]");

    const paint = () => {
      const p = stage.progress;
      const phasePos = p * LAST;

      for (let i = 0; i < PHASES.length; i += 1) {
        const frame = frames[i];
        const cam = cams[i];
        if (!frame || !cam) continue;

        const local = phasePos - i;
        let reveal: number;
        let camT: number;
        let show: boolean;

        if (local >= 0) {
          // Current plate: fully revealed while its own camera move runs.
          reveal = 1;
          camT = Math.min(local, 1);
          show = local < 1;
        } else {
          // Incoming plate: wiped in over the last HOLD→1 of the previous phase.
          const prev = phasePos - (i - 1);
          const t = smoothstep((prev - HOLD) / (1 - HOLD));
          reveal = t;
          camT = 0;
          show = t > 0.002;
        }

        if (!show) {
          if (frame.style.visibility !== "hidden") frame.style.visibility = "hidden";
          continue;
        }

        if (frame.style.visibility !== "visible") frame.style.visibility = "visible";
        frame.style.zIndex = String(10 + i);

        if (reveal >= 0.999) {
          frame.style.clipPath = "none";
        } else {
          const inset = ((1 - reveal) * 100).toFixed(2);
          frame.style.clipPath =
            i % 2 === 1 ? `inset(0 0 0 ${inset}%)` : `inset(0 ${inset}% 0 0)`;
        }

        // Incoming plates ride in from the side they are revealed from, with a
        // short rack-focus, so the cut is a camera move rather than a slide rule.
        const entry = local < 0 ? 1 - reveal : 0;
        const fromRight = i % 2 === 1;
        const own = SHOTS[PHASES[i].id];
        const pose = lerpPose(own.from, own.to, smoothstep(camT));
        const x = pose.x + (fromRight ? 1 : -1) * entry * 9;
        const y = pose.y - entry * 2.5;

        cam.style.transform =
          `perspective(1500px) translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0) ` +
          `rotateX(${pose.rx.toFixed(2)}deg) rotateY(${pose.ry.toFixed(2)}deg) ` +
          `rotateZ(${pose.rz.toFixed(2)}deg) scale(${(pose.scale + entry * 0.08).toFixed(4)})`;
        cam.style.filter = entry > 0.01 ? `blur(${(entry * 6).toFixed(2)}px)` : "";
      }

      // Frame marks open after each cut and settle back, like a lens breathing.
      const cut = phasePos - Math.floor(phasePos);
      section.style.setProperty(
        "--stage-inset",
        `${(14 + (1 - smoothstep(Math.min(cut / 0.5, 1))) * 26).toFixed(1)}px`,
      );

      // The word drifts against the camera, which separates the two depths.
      if (word) {
        word.style.transform = `translate3d(${((cut - 0.5) * -2.4).toFixed(2)}%, 0, 0)`;
      }

      if (bar) bar.style.width = `${(p * 100).toFixed(2)}%`;
    };

    const apply = (progress: number) => {
      stage.progress = progress;
      const next = indexForPhasePos(progress * LAST);
      if (next !== indexRef.current) {
        indexRef.current = next;
        setIndex(next);
      }
      paint();
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });

    paint();

    const onResize = () => paint();

    const onVisibility = () => {
      if (!document.hidden) paint();
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      stage.progress = 0;
    };
  }, [reduced]);

  if (reduced) return <StaticStage />;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="stage-heading"
      className="stage"
      style={{ height: compact ? "calc(320vh - 4rem)" : "calc(700vh - 4rem)" }}
    >
      <div className="stage-pin">
        <div className="stage-frames" aria-hidden="true">
          {PHASES.map((item, i) => (
            <div
              key={item.id}
              data-frame
              className="stage-frame"
              style={{ visibility: i === 0 ? "visible" : "hidden" }}
            >
              <div className="stage-cam" data-cam>
                <img
                  src={`/images/plate-${item.id}.webp`}
                  srcSet={plateSrcSet(`/images/plate-${item.id}.webp`)}
                  sizes="100vw"
                  width={1600}
                  height={900}
                  alt=""
                  loading="eager"
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  style={{ objectPosition: SHOTS[item.id].position }}
                />
              </div>
              <div className="stage-grade" />
            </div>
          ))}
        </div>

        <div className="stage-vignette" aria-hidden="true" />
        <div className="stage-grain" aria-hidden="true" />

        <span className="stage-corner stage-corner--tl" aria-hidden="true" />
        <span className="stage-corner stage-corner--tr" aria-hidden="true" />
        <span className="stage-corner stage-corner--bl" aria-hidden="true" />
        <span className="stage-corner stage-corner--br" aria-hidden="true" />

        <div className="stage-ui">
          <div className="shell stage-shell">
            <div className="stage-copy">
              <h1
                id="stage-heading"
                className={
                  opening
                    ? "h-display mt-5 max-w-[18ch]"
                    : "mt-5 max-w-[30ch] text-[14px] font-medium leading-snug tracking-[-0.005em] text-fg/70"
                }
              >
                Software execution. Independently verified.
              </h1>

              {opening ? (
                <>
                  <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-muted md:text-[16px]">
                    Controlled execution. Recorded activity. Evidence you can inspect.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-2.5">
                    <Link to="/docs#installation" className="btn btn-primary">
                      Get started
                    </Link>
                    <Link to="/docs" className="btn btn-ghost">
                      Read the documentation
                    </Link>
                  </div>
                </>
              ) : (
                <div key={phase.id} className="phase-in">
                  <h2 className="h-section mt-4 max-w-[20ch]">{phase.title}</h2>
                  <p className="mt-4 max-w-[34ch] text-[14.5px] leading-relaxed text-muted md:text-[15px]">
                    {phase.body}
                  </p>
                </div>
              )}
            </div>

            <div className="stage-bottom">
              <div className="stage-word" data-word aria-hidden="true">
                <span key={phase.id} className="stage-word-text">
                  {[...phase.word].map((char, i) => (
                    <span
                      key={`${char}-${i}`}
                      className="stage-letter"
                      style={{ animationDelay: `${i * 36}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </div>

              <div className="stage-progress" aria-hidden="true">
                <i data-progress />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
