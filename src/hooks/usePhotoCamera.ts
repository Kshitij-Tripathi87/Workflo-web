import { RefObject, useEffect } from "react";
import { clamp, smoothstep } from "../components/sandbox/CameraController";

type Props = {
  storyRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
};

type Pose = { x: number; y: number; scale: number; rotate: number };

const pose = ({ x, y, scale, rotate }: Pose) =>
  `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(3)}deg) scale(${scale.toFixed(4)})`;

/**
 * Drives the four full-bleed photographs of the story like a camera:
 *  1. hero    - slow push toward the glass chamber
 *  2. portal  - accelerating dolly into the doorway
 *  3. hall    - steady forward dolly across the hall floor
 *  4. path    - lateral pan following the glowing path
 *
 * Each later photo is faded in on top of the previous one and stays opaque,
 * so a crossfade never reveals the page background.
 *
 * Uses its own time-normalised smoothing with the same rate as useScrollStory
 * so both stay in step. Does nothing for reduced motion / mobile, where the
 * default CSS state (hero photo only) applies.
 */
export function usePhotoCamera({ storyRef, stageRef }: Props) {
  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    if (!story || !stage) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 760px)");

    const layer = (name: string) =>
      stage.querySelector<HTMLElement>(`[data-photo="${name}"]`);
    const hero = layer("hero");
    const portal = layer("portal");
    const hall = layer("hall");
    const path = layer("path");
    if (!hero || !portal || !hall || !path) return;

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

      // 1. Hero: slow push toward the chamber, tiny drift to the right.
      const tHero = smoothstep(0, 0.24, progress);
      hero.style.transform = pose({
        x: -px * 12 - tHero * w * 0.012,
        y: -py * 7,
        scale: 1.03 + 0.2 * Math.pow(tHero, 1.35),
        rotate: 0,
      });

      // 2. Portal: accelerating dolly toward the doorway.
      const tPortal = smoothstep(0.12, 0.5, progress);
      portal.style.transform = pose({
        x: -px * 18 - tPortal * w * 0.015,
        y: -py * 10,
        scale: 1.04 + 1.45 * tPortal * tPortal,
        rotate: -1.1 * tPortal,
      });

      // 3. Hall: steady forward dolly with a slight roll for depth.
      const tHall = smoothstep(0.35, 0.73, progress);
      hall.style.transform = pose({
        x: -px * 22,
        y: -py * 12 + (0.5 - tHall) * h * 0.012,
        scale: 1.0 + 0.3 * tHall,
        rotate: (tHall - 0.5) * 0.9,
      });

      // 4. Path: lateral pan along the glowing path, settling as it ends.
      const tPath = smoothstep(0.59, 0.96, progress);
      path.style.transform = pose({
        x: -px * 16 + (0.5 - tPath) * w * 0.05,
        y: -py * 9 + (0.5 - tPath) * h * 0.03,
        scale: 1.16 - 0.09 * tPath,
        rotate: 0.7 * (1 - tPath),
      });

      stage.style.setProperty("--photo-portal", smoothstep(0.12, 0.2, progress).toFixed(3));
      stage.style.setProperty("--photo-hall", smoothstep(0.35, 0.44, progress).toFixed(3));
      stage.style.setProperty("--photo-path", smoothstep(0.59, 0.68, progress).toFixed(3));

      const tone = progress > 0.16 ? "dark" : "light";
      if (stage.dataset.tone !== tone) stage.dataset.tone = tone;

      if (
        Math.abs(raw - progress) > 0.001 ||
        Math.abs(targetX - px) > 0.003 ||
        Math.abs(targetY -