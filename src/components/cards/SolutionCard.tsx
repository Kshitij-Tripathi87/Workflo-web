import React, { type PointerEvent as ReactPointerEvent } from "react";
import { SolutionCardItem } from "../../types";
import { ArrowIcon } from "../navigation/Icons";
import { SolutionVisual } from "./SolutionVisual";

export const solutionCards: SolutionCardItem[] = [
  {
    id: "01",
    title: "Pull request verification",
    description:
      "Connect a code change to its tested revision and verify it before release in an isolated execution sandbox.",
    visual: "revision",
    destination: "#run",
  },
  {
    id: "02",
    title: "Autonomous quality engineering",
    description:
      "Run governed test generation, application probes, and deep regression investigation against the prepared workspace.",
    visual: "quality",
    destination: "#architecture",
  },
  {
    id: "03",
    title: "Verifiable execution evidence",
    description:
      "Collect run artifacts, event logs, and produce cryptographically signed receipts tied to the immutable commit SHA.",
    visual: "evidence",
    destination: "#evidence",
  },
];

type SolutionCardProps = {
  card: SolutionCardItem;
};

export function SolutionCard({ card }: SolutionCardProps) {
  const handlePointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    // Clamped subtle 3D tilt
    const maxTilt = 3.5;
    const tiltX = Math.max(-maxTilt, Math.min(maxTilt, (x - 0.5) * 6));
    const tiltY = Math.max(-maxTilt, Math.min(maxTilt, (0.5 - y) * 5));
    event.currentTarget.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
  };

  const resetTilt = (element: HTMLAnchorElement) => {
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <a
      href={card.destination}
      className={`solution-card solution-${card.visual}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={(event) => resetTilt(event.currentTarget)}
      onBlur={(event) => resetTilt(event.currentTarget)}
    >
      <div className="solution-card-art">
        <SolutionVisual type={card.visual} />
      </div>
      <div className="solution-card-gradient" />
      <div className="solution-card-top">
        <span className="mono-label">{card.id} / WORKFLO SOLUTIONS</span>
        <span className="solution-card-arrow">
          <ArrowIcon diagonal />
        </span>
      </div>
      <div className="solution-card-copy">
        <h3>{card.title}</h3>
        <p>{card.description}</p>
      </div>
    </a>
  );
}
