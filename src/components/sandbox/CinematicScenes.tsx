import React from "react";
import ringExterior from "../../assets/scenes/ring-exterior.png";
import vaultInterior from "../../assets/scenes/vault-interior.png";
import vaultInteriorDepth from "../../assets/scenes/vault-interior-depth.png";
import tunnelPortal from "../../assets/scenes/tunnel-portal.png";
import glassChamber from "../../assets/scenes/glass-chamber.png";

/**
 * Photographic scene stack for the scroll-driven cinematic story.
 * Each beat gets a far (blurred, slow-parallax) plate and a near
 * (sharp, fast-parallax) plate so the mouse-driven parallax in
 * useScrollStory reads as genuine depth rather than a flat photo.
 * Opacity per beat is controlled by the existing --hero-alpha /
 * --enter-alpha / --inside-alpha / --station-alpha custom properties
 * that useScrollStory already writes on .cinematic-stage.
 */
export function CinematicScenes() {
  return (
    <div className="scene-photo-stack" aria-hidden="true">
      <div className="scene-photo-layer scene-photo-hero">
        <img className="scene-photo scene-photo-far scene-kb-a" src={ringExterior} alt="" />
        <img className="scene-photo scene-photo-near scene-kb-b" src={ringExterior} alt="" />
      </div>

      <div className="scene-photo-layer scene-photo-entry">
        <img className="scene-photo scene-photo-far scene-kb-c" src={tunnelPortal} alt="" />
        <img className="scene-photo scene-photo-near scene-kb-d" src={tunnelPortal} alt="" />
      </div>

      <div className="scene-photo-layer scene-photo-inside">
        <img className="scene-photo scene-photo-far scene-kb-a" src={vaultInteriorDepth} alt="" />
        <img className="scene-photo scene-photo-near scene-kb-c" src={vaultInterior} alt="" />
      </div>

      <div className="scene-photo-layer scene-photo-station">
        <img className="scene-photo scene-photo-far scene-kb-b" src={glassChamber} alt="" />
        <img className="scene-photo scene-photo-near scene-kb-d" src={glassChamber} alt="" />
      </div>
    </div>
  );
}
