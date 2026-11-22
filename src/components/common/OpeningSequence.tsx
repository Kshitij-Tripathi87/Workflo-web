import React, { useEffect, useState } from "react";

/**
 * Cinematic opening: black screen, an amber seam, two shutters part to reveal
 * the machine. Pure CSS animation (see cinematic.css). It never blocks input
 * (pointer-events: none), is skipped for reduced motion or when the page
 * loads already scrolled, and unmounts itself once the shutters are open.
 */
export function OpeningSequence() {
  const [active, setActive] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.scrollY < 40,
  );

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setActive(false), 2100);
    return () => window.clearTimeout(id);
  }, [active]);

  if (!active) return null;

  return (
    <div className="opening" aria-hidden="true">
      <i className="opening-panel opening-panel-left" />
      <i className="opening-panel opening-panel-right" />
      <span className="opening-seam" />
      <span className="opening-label">WORKFLO / EXECUTION FACILITY / INITIALISING</span>
    </div>
  );
}
