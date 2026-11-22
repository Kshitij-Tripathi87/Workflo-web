import { RefObject, useEffect } from "react";
import { clamp, smoothstep } from "../components/sandbox/CameraController";

type Props = {
  storyRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
};

type Pose = { x: number; y: number; scale: number; rotate: number };

type Shot = {
  key: string;
  /** 0..1 progress of this shot's own camera move */
  t: (progress: number) => number;
  /** camera pose for this shot */
  pose: (t: number, px: number, py: number, w: number, h: number) => Pose;
  /** how strongly the pointer moves this shot (px per unit) */
  depth: number;
};

const toCss = ({ x, y, scale, rotate }: Pose) =>
  `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(3)}deg) scale(${scale.toFixed(4)})`;

/**
 * Camera choreography. One shot per photograph:
 *  exterior - dolly forward toward the machine
 *  portal   - accelerating push-through of the ring
 *  hall     - tilt down onto the platform with a slight orbit
 *  path     - tracking move along the illuminated route
 *  sealed   - slow approach with lateral movement
 *
 * Every later photograph is faded in on top of the previous one and stays
 * opaque, so a crossfade never reveals the page background.
 */
const SHOTS: Shot[] = [
  {
    key: "exterior",
    depth: 1,
    t: (p) => smoothstep(0, 0.22, p),
    pose: (t, px, py, w, h) => ({
      x: -px * 12 - t * w * 0.015,
      y: -py * 7 + t * h * 0.01,
      scale: 1.06 + 0.26 * Math.pow(t, 1.2),
      rotate: 0,
    }),
  },
  {
    key: "portal",
    depth: 1.3,
    t: (p) => smoothstep(0.12, 0.42, p),
    pose: (t, px, py, w) => ({
      x: -px * 18 - t * w * 0.01,
      y: -py * 10,
      scale: 1 + 2.2 * Math.pow(t, 2.2),
      rotate: -1.2 * t,
    }),
  },
  {
    key: "hall",
    depth: 1.6,
    t: (p) => smoothstep(0.36, 0.58, p),
    pose: (t, px, py, w, h) => ({
      x: -px * 22 + (t - 0.5) * w * 0.02,
      y: -py * 12 + (0.5 - t) * h * 0.11,
      scale: 1.2 - 0.1 * t,
      rotate: (t - 0.5) * 0.8,
    }),
  },
  {
    key: "path",
    depth: 1.2,
    t: (p) => smoothstep(0.52, 0.76, p),
    pose: (t, px, py, w) => ({
      x: -px * 16 + (0.5 - t) * w * 0.03,
      y: -py * 9,
      scale: 1.08 + 0.42 * Math.pow(t, 1.3),
      rotate: 0.6 * (1 - t),
    }),
  },
  {
    key: "sealed",
    depth: 1,
    t: (p) => smoothstep(0.68, 1, p),
    pose: (t, px, py, w) => ({
      x: -px * 14 + (0.5 - t) * w * 0.06,
      y: -py * 8,
      scale: 1.12 + 0.2 * t,
      rotate: (t - 0.5) * 1.4,
    }),
  },
];

/** [fade start, fade end] of each photograph on top of the previous one */
const FADES: Record<string, [number, number]> = {
  portal: [0.12, 0.2],
  hall: [0.36, 0.44],
  path: [0.52, 0.6],
  sealed: [0.68, 0.76],
};

/**
 * Drives the photographs of the story like a camera. Uses its own
 * time-normalised smoothing, at the same rate as useScrollStory, so both stay
 * in step. Does nothing for reduced motion / mobile, where the default CSS
 * state (first photograph only) applies.
 */
export function usePhotoCamera({ storyRef, stageRef }: Props) {
  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    if (!story || !stage) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 760px)");

    const rigs = SHOTS.map((shot) => {
      const el = stage.querySelector<HTMLElement>(`[data-photo="${shot.key}"]`);
      return {
        shot,
        el,
        near: el?.querySelector<HTMLElement>(".scene-photo-near") ?? null,
      };
    });
    if (rigs.some((rig) => !rig.el)) return;

    let frame = 0;
    let progress = 0;
    let px = 0;
    let py = 0;
    let targetX = 0;
    let targetY = 0;
    let last = performance.now();
    let scrollable = Math.max(1, story.offsetHeight - window.innerHeight);

    const paint = () => {
      frame = 0;
      if (mobileQuery.matches || motionQuery.matches) return;

      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const raw = clamp(-story.getBoundingClientRect().top / scrollable);
      progress += (raw - progress) * (1 - Math.exp(-7 * dt));
      if (Math.abs(raw - progress) < 0.0006) progress = raw;

      const pd = 1 - Math.exp(-4.2 * dt);
      px += (targetX - px) * pd;
      py += (targetY - py) * pd;
      if (Math.abs(targetX - px) < 0.0015) px = targetX;
      if (Math.abs(targetY - py) < 0.0015) py = targetY;

      const w = window.innerWidth;
      const h = window.innerHeight;

      for (const { shot, el, near } of rigs) {
        if (!el) continue;
        const t = shot.t(progress);
        el.style.transform = toCss(shot.pose(t, px * shot.depth, py * shot.depth, w, h));
        // Foreground floor plane travels a little faster than the scene:
        // cheap depth separation using the feathered copy of the photograph.
        if (near) {
          near.style.transform = `translate3d(${(-px * 10).toFixed(2)}px, ${(t * h * 0.02).toFixed(2)}px, 0) scale(${(1 + 0.04 * t).toFixed(4)})`;
        }
      }

      for (const [key, [from, to]] of Object.entries(FADES)) {
        stage.style.setProperty(`--photo-${key}`, smoothstep(from, to, progress).toFixed(3));
      }

      if (
        Math.abs(raw - progress) > 0.001 ||
        Math.abs(targetX - px) > 0.003 ||
        Math.abs(targetY - py) > 0.003
      ) {
        schedule();
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || mobileQuery.matches) return;
      targetX = clamp((event.clientX / Math.max(1, window.innerWidth)) * 2 - 1, -1, 1);
      targetY = clamp((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1, -1, 1);
      schedule();
    };

    const onResize = () => {
      scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
      targetX = 0;
      targetY = 0;
      last = performance.now();
      schedule();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    motionQuery.addEventListener("change", onResize);
    mobileQuery.addEventListener("change", onResize);

    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", onResize);
      mobileQuery.removeEventListener("change", onResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [storyRef, stageRef]);
}
