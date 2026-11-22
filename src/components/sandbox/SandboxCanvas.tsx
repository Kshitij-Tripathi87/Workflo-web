import React, { forwardRef } from "react";

type SandboxCanvasProps = {
  backgroundCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  foregroundCanvasRef: React.RefObject<HTMLCanvasElement | null>;
};

// Files live in public/media (see public/media/README.md).
const PHOTOS = [
  { key: "hero", src: "/media/hero-chamber.webp" },
  { key: "portal", src: "/media/portal.webp" },
  { key: "hall", src: "/media/hall.webp" },
  { key: "path", src: "/media/path.webp" },
] as const;

/**
 * The wireframe canvases are no longer rendered. The refs are kept in the
 * props so useScrollStory keeps working unchanged: drawSandbox() returns
 * early when its canvas is null, so no drawing cost remains.
 */
export const SandboxCanvas = forwardRef<HTMLDivElement, SandboxCanvasProps>(
  (_props, _ref) => {
    return (
      <>
        <div className="scene-backdrop" aria-hidden="true" />
        <div className="scene-photos" aria-hidden="true">
          {PHOTOS.map((photo) => (
            <div
              className={`scene-photo scene-photo-${photo.key}`}
              data-photo={photo.key}
              key={photo.key}
            >
              <img
                src={photo.src}
                alt=""
                draggable={false}
                decoding="async"
                loading={photo.key === "hero" ? "eager" : "lazy"}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <span className="scene-photo-scrim" />
            </div>
          ))}
        </div>
        <div className="scene-mist" aria-hidden="true" />
      </>
    );
  },
);

SandboxCanvas.displayName = "SandboxCanvas";
