import React, { forwardRef } from "react";

type SandboxCanvasProps = {
  backgroundCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  foregroundCanvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export const SandboxCanvas = forwardRef<HTMLDivElement, SandboxCanvasProps>(
  ({ backgroundCanvasRef, foregroundCanvasRef }, _ref) => {
    return (
      <>
        <div className="scene-backdrop" aria-hidden="true" />
        <canvas className="scene-canvas" ref={backgroundCanvasRef} aria-hidden="true" />
        <canvas className="scene-foreground" ref={foregroundCanvasRef} aria-hidden="true" />
        <div className="scene-mist" aria-hidden="true" />
      </>
    );
  },
);

SandboxCanvas.displayName = "SandboxCanvas";
