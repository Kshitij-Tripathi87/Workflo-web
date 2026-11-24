import { useEffect, useRef } from "react";
import { PHASES } from "../scene/phases";
import { stage } from "../scroll/stage";

const OBJECT_POSITION: Record<string, string> = {
  execute: "68% 50%",
  observe: "56% 50%",
  verify: "58% 50%",
  prove: "70% 50%",
  trust: "66% 50%",
};

/**
 * One environment plate per lifecycle phase. Crossfaded and drifted from the
 * same scroll progress that drives the 3D chamber, so the photographic layer
 * and the structure move as a single composition.
 */
export function HeroPlates({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-hero-plate]"));

    const paint = (position: number) => {
      layers.forEach((layer, index) => {
        const raw = Math.max(0, 1 - Math.abs(position - index));
        const weight = raw * raw * (3 - 2 * raw);
        layer.style.opacity = (weight * 0.92).toFixed(3);
        layer.style.transform = `translate3d(0, ${((index - position) * 16).toFixed(2)}px, 0) scale(${(
          1.16 -
          0.08 * weight
        ).toFixed(3)})`;
      });
    };

    if (reduced) {
      paint(0);
      return;
    }

    let frame = 0;
    let visible = true;

    // Sync the first paint so the plate sequence matches scroll position
    // before the first animation frame is served.
    paint(stage.progress * (PHASES.length - 1));

    const loop = () => {
      if (visible) paint(stage.progress * (PHASES.length - 1));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
        },
        { rootMargin: "160px" },
      );
      observer.observe(el);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [reduced]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {PHASES.map((phase, index) => (
        <div
          key={phase.id}
          data-hero-plate
          className="hero-plate"
          style={{ opacity: index === 0 ? 1 : 0 }}
        >
          <img
            src={`/images/plate-${phase.id}.webp`}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority={index === 0 ? "high" : "auto"}
            style={{ objectPosition: OBJECT_POSITION[phase.id] }}
          />
        </div>
      ))}
    </div>
  );
}
