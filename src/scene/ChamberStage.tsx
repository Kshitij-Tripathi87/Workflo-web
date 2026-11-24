import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { LAYERS } from "./Chamber";
import { SceneContents } from "./SceneContents";

type Props = {
  reduced: boolean;
  compact: boolean;
};

export function ChamberStage({ reduced, compact }: Props) {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const callout = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: "140px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAnchor = useCallback((point: { x: number; y: number } | null) => {
    const el = callout.current;
    if (!el) return;

    if (!point) {
      el.style.opacity = "0";
      return;
    }

    el.style.opacity = "1";
    el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -165%)`;
  }, []);

  const activeLayer = hovered === null ? null : LAYERS[hovered];

  return (
    <div
      ref={wrapper}
      className="absolute inset-0"
      onPointerLeave={() => setHovered(null)}
      style={{ cursor: hovered === null ? undefined : "crosshair" }}
    >
      <Canvas
        dpr={compact ? [1, 1.4] : [1, 1.75]}
        frameloop={reduced || !inView ? "demand" : "always"}
        camera={{ position: [0, 0, 7.4], fov: 42, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ touchAction: "pan-y" }}
      >
        <SceneContents
          reduced={reduced}
          compact={compact}
          hovered={hovered}
          onHover={setHovered}
          onAnchor={handleAnchor}
        />
      </Canvas>

      <p className="sr-only">
        Execution chamber inspection. Three boundaries are labelled: execution boundary, isolation
        boundary and policy surface. Select a marker, or use the layer list, to read what each
        boundary controls.
      </p>

      <div
        ref={callout}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 w-60 border border-line bg-surface/95 p-3 opacity-0 transition-opacity duration-150"
      >
        <p className="label">{activeLayer?.label}</p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{activeLayer?.detail}</p>
      </div>

      <div className="pointer-events-auto absolute bottom-6 right-5 hidden flex-col gap-px md:flex">
        <p className="label mb-2">inspect layers</p>
        {LAYERS.map((layer, index) => (
          <button
            key={layer.id}
            type="button"
            aria-pressed={hovered === index}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
            onClick={() => setHovered((current) => (current === index ? null : index))}
            className={`flex items-center gap-3 border px-2.5 py-1.5 text-left transition-colors ${
              hovered === index
                ? "border-accent/60 bg-accent/10 text-fg"
                : "border-line/70 bg-bg/40 text-muted hover:text-fg"
            }`}
          >
            <span className="font-mono text-[10px] tracking-[0.12em]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[11.5px]">{layer.label}</span>
          </button>
        ))}
        <p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-muted/80">
          drag · arrow keys
        </p>
      </div>
    </div>
  );
}
