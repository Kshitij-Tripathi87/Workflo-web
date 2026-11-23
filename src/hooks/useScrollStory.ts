import { RefObject, useEffect } from "react";
import {
  clamp,
  drawSandbox,
  smoothstep,
} from "../components/sandbox/CameraController";
import { executionSteps } from "../data/storyData";

type UseScrollStoryProps = {
  storyRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  foregroundCanvasRef: RefObject<HTMLCanvasElement | null>;
};

export function useScrollStory({
  storyRef,
  stageRef,
  canvasRef,
  foregroundCanvasRef,
}: UseScrollStoryProps) {
  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    if (!story || !stage) return;

    let frame = 0;
    let progress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let lastPainted = -2;
    let firstPaint = true;
    let lastTime = performance.now();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    let scrollable = Math.max(1, story.offsetHeight - window.innerHeight);

    const heroLayer = stage.querySelector<HTMLElement>(".hero-layer");
    const entryLayer = stage.querySelector<HTMLElement>(".entry-layer");
    const insideLayer = stage.querySelector<HTMLElement>(".inside-layer");
    const stationLayer = stage.querySelector<HTMLElement>(".station-layer");
    const progressLine = stage.querySelector<HTMLElement>(".story-progress-fill");
    const wordSpans = Array.from(
      stage.querySelectorAll<HTMLElement>(".story-word")
    );
    const entranceSteps = Array.from(
      stage.querySelectorAll<HTMLElement>(".entry-step")
    );
    const modules = Array.from(
      stage.querySelectorAll<HTMLElement>(".execution-module")
    );
    const receiptRows = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-receipt-row]")
    );
    const featureRows = Array.from(
      stage.querySelectorAll<HTMLElement>(".station-feature")
    );
    const resultCount = stage.querySelector<HTMLElement>(".result-count");
    const sparkline = stage.querySelector<SVGPathElement>(".sparkline-line");
    const sparklineLength = sparkline?.getTotalLength() ?? 0;

    const writeLayer = (element: HTMLElement | null, opacity: number) => {
      if (!element) return;
      element.style.opacity = opacity.toFixed(3);
      const visibility = opacity > 0.008 ? "visible" : "hidden";
      if (element.style.visibility !== visibility) element.style.visibility = visibility;
    };

    const paint = () => {
      frame = 0;
      if (mobileQuery.matches || motionQuery.matches) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const rect = story.getBoundingClientRect();
      const raw = clamp(-rect.top / scrollable);

      // Time-normalized exponential smoothing for 60Hz/120Hz/variable refresh rates
      const progressDecay = 1 - Math.exp(-7.0 * dt);
      progress += (raw - progress) * progressDecay;
      if (Math.abs(raw - progress) < 0.0006) progress = raw;

      const pointerDecay = 1 - Math.exp(-4.2 * dt);
      pointerX += (targetPointerX - pointerX) * pointerDecay;
      pointerY += (targetPointerY - pointerY) * pointerDecay;
      if (Math.abs(targetPointerX - pointerX) < 0.0015) pointerX = targetPointerX;
      if (Math.abs(targetPointerY - pointerY) < 0.0015) pointerY = targetPointerY;

      const hero = 1 - smoothstep(0.135, 0.22, progress);
      // Each chapter hands off before the next copy block takes over. This keeps
      // long editorial headlines from stacking during the pinned camera move.
      const entering =
        smoothstep(0.12, 0.19, progress) * (1 - smoothstep(0.37, 0.41, progress));
      const inside =
        smoothstep(0.39, 0.45, progress) * (1 - smoothstep(0.59, 0.63, progress));
      const station =
        smoothstep(0.63, 0.69, progress) * (1 - smoothstep(0.88, 0.96, progress));
      const fly = smoothstep(0.12, 0.46, progress);
      const frontMesh = (1 - smoothstep(0.12, 0.31, progress)) * 0.9;

      stage.style.setProperty("--hero-alpha", hero.toFixed(3));
      stage.style.setProperty("--enter-alpha", entering.toFixed(3));
      stage.style.setProperty("--inside-alpha", inside.toFixed(3));
      stage.style.setProperty("--station-alpha", station.toFixed(3));
      stage.style.setProperty("--fly-progress", fly.toFixed(3));
      stage.style.setProperty("--front-alpha", frontMesh.toFixed(3));
      stage.style.setProperty("--story-progress", progress.toFixed(4));
      stage.style.setProperty("--pointer-x", pointerX.toFixed(3));
      stage.style.setProperty("--pointer-y", pointerY.toFixed(3));

      writeLayer(heroLayer, hero);
      writeLayer(entryLayer, entering);
      writeLayer(insideLayer, inside);
      writeLayer(stationLayer, station);

      const entryAmount = smoothstep(0.16, 0.27, progress);
      entranceSteps.forEach((element, index) => {
        const amount = clamp(entryAmount * (executionSteps.length + 1) - index);
        element.style.opacity = amount.toFixed(3);
        element.style.transform = `translate3d(${(1 - amount) * -10}px, 0, 0)`;
      });

      modules.forEach((element, index) => {
        const start = 0.205 + index * 0.045;
        const show =
          smoothstep(start, start + 0.065, progress) *
          (1 - smoothstep(0.42, 0.49, progress));
        const drift = (1 - show) * (index % 2 === 0 ? 28 : -28);
        element.style.opacity = show.toFixed(3);
        element.style.transform = `translate3d(${drift + pointerX * (index + 1) * 5}px, ${-drift * 0.45 + pointerY * 4}px, 0) rotate(${(1 - show) * (index % 2 === 0 ? -4 : 4)}deg)`;
      });

      const wordProgress = smoothstep(0.43, 0.59, progress);
      wordSpans.forEach((word, index) => {
        const amount = clamp(wordProgress * (wordSpans.length + 2) - index);
        word.style.opacity = amount.toFixed(3);
        word.style.transform = `translate3d(0, ${(1 - amount) * 9}px, 0)`;
        word.style.filter = `blur(${(1 - amount) * 3}px)`;
      });

      const stationProgress = smoothstep(0.69, 0.85, progress);
      receiptRows.forEach((row, index) => {
        const amount = clamp(
          stationProgress * (receiptRows.length + 1) - index * 0.88
        );
        row.style.opacity = amount.toFixed(3);
        row.style.transform = `translate3d(${(1 - amount) * 8}px, 0, 0)`;
      });

      featureRows.forEach((row, index) => {
        const amount = clamp(
          stationProgress * (featureRows.length + 1) - index
        );
        row.style.opacity = amount.toFixed(3);
        row.style.transform = `translate3d(${(1 - amount) * 13}px, 0, 0)`;
      });

      if (resultCount) {
        resultCount.textContent = String(
          Math.round(18 * smoothstep(0.68, 0.82, progress))
        );
      }

      if (sparkline) {
        sparkline.style.strokeDasharray = `${sparklineLength}`;
        sparkline.style.strokeDashoffset = `${sparklineLength * (1 - stationProgress)}`;
      }

      if (progressLine) {
        progressLine.style.transform = `scaleX(${progress.toFixed(4)})`;
      }

      const shouldPaint =
        firstPaint ||
        Math.abs(progress - lastPainted) > 0.0004 ||
        Math.abs(pointerX - targetPointerX) > 0.002 ||
        Math.abs(pointerY - targetPointerY) > 0.002;

      if (shouldPaint) {
        drawSandbox(canvasRef.current, progress, pointerX, pointerY);
        drawSandbox(foregroundCanvasRef.current, progress, pointerX, pointerY, true);
      }
      lastPainted = progress;
      firstPaint = false;

      if (
        Math.abs(raw - progress) > 0.001 ||
        Math.abs(targetPointerX - pointerX) > 0.003 ||
        Math.abs(targetPointerY - pointerY) > 0.003
      ) {
        schedule();
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || mobileQuery.matches) return;
      targetPointerX = clamp(
        (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
        -1,
        1
      );
      targetPointerY = clamp(
        (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1,
        -1,
        1
      );
      schedule();
    };

    const onResize = () => {
      scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
      targetPointerX = 0;
      targetPointerY = 0;
      firstPaint = true;
      lastTime = performance.now();
      schedule();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    motionQuery.addEventListener("change", onResize);
    mobileQuery.addEventListener("change", onResize);

    lastTime = performance.now();
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", onResize);
      mobileQuery.removeEventListener("change", onResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [storyRef, stageRef, canvasRef, foregroundCanvasRef]);
}
