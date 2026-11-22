import React, { useState } from "react";
import { HotspotItem } from "../../types";

export const hotspotItems: HotspotItem[] = [
  { id: "01", title: "Source snapshot", text: "The exact revision and workspace being verified." },
  { id: "02", title: "Filesystem boundary", text: "Access is scoped to the execution workspace and configured policy." },
  { id: "03", title: "Network policy", text: "Network access follows the restrictions configured for the run." },
  { id: "04", title: "Governed actions", text: "Agent actions are evaluated through the configured execution policy." },
  { id: "05", title: "Evidence collection", text: "Execution events and artifacts are gathered for the run record." },
];

export function Hotspots() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="hotspot-field" aria-label="Sandbox controls and evidence">
      {hotspotItems.map((item, index) => (
        <div
          className={`hotspot hotspot-${index + 1} ${openId === item.id ? "is-open" : ""}`}
          key={item.id}
        >
          <button
            className="hotspot-trigger"
            aria-expanded={openId === item.id}
            aria-controls={`hotspot-detail-${item.id}`}
            onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
          >
            <span className="hotspot-point">
              <span>+</span>
            </span>
            <span className="hotspot-label">
              <span className="hotspot-number">{item.id}</span>
              {item.title}
            </span>
          </button>
          <div
            className="hotspot-detail"
            id={`hotspot-detail-${item.id}`}
            aria-hidden={openId !== item.id}
          >
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
