import React, { RefObject } from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { WordReveal } from "../components/common/WordReveal";
import { ExecutionModules } from "../components/sandbox/ExecutionModules";
import { Hotspots } from "../components/sandbox/Hotspots";
import { SandboxCanvas } from "../components/sandbox/SandboxCanvas";
import { DemoReceipt } from "../components/verification/DemoReceipt";
import { ArrowIcon } from "../components/navigation/Icons";
import { capabilityRows, executionSteps } from "../data/storyData";
import { MobileStory } from "./MobileStory";

type HeroStoryProps = {
  storyRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  foregroundCanvasRef: RefObject<HTMLCanvasElement | null>;
};

export function HeroStory({
  storyRef,
  stageRef,
  canvasRef,
  foregroundCanvasRef,
}: HeroStoryProps) {
  return (
    <section
      className="story"
      id="story"
      ref={storyRef}
      aria-label="The Workflo execution story"
    >
      <div className="cinematic-stage" ref={stageRef}>
        <SandboxCanvas
          backgroundCanvasRef={canvasRef}
          foregroundCanvasRef={foregroundCanvasRef}
        />

        {/* Hero Layer (Beat 1) */}
        <div className="story-layer hero-layer">
          <div className="hero-copy">
            <SectionEyebrow number="01">AUTONOMOUS QUALITY ENGINEERING</SectionEyebrow>
            <p className="hero-wordmark">
              Workflo<span>.</span>
            </p>
            <h1>
              Every change tested.<br />Every result verifiable.
            </h1>
            <p className="hero-description">
              Autonomous software verification, executed in a controlled sandbox and
              delivered with evidence you can inspect.
            </p>
            <div className="hero-capabilities">
              <span>Isolated execution</span>
              <i />
              <span>Autonomous QA</span>
              <i />
              <span>Verifiable receipts</span>
            </div>
          </div>
          <div className="hero-object-note">
            <span className="hero-note-line" />
            <span>SANDBOX ENVIRONMENT / 001</span>
            <span>OPEN BOUNDARY</span>
          </div>
          <div className="hero-scroll-hint">
            <span>SCROLL TO ENTER</span>
            <i>
              <b />
            </i>
          </div>
          <div className="hero-corner-mark" aria-hidden="true">
            <span>01</span>
            <i />
          </div>
        </div>

        {/* Entry Layer (Beat 2) */}
        <div className="story-layer entry-layer">
          <div className="entry-heading">
            <SectionEyebrow number="02">ENTER THE SANDBOX</SectionEyebrow>
            <h2>
              A run, assembled<br />with intent.
            </h2>
            <p>Watch a change move from pinned source to governed execution.</p>
          </div>
          <div className="entry-rail" aria-label="Execution stages">
            {executionSteps.map((step, index) => (
              <div className="entry-step" key={step.label}>
                <span className="entry-step-number">0{index + 1}</span>
                <div>
                  <b>{step.label}</b>
                  <small>{step.note}</small>
                </div>
                <i className="entry-step-indicator" />
              </div>
            ))}
          </div>
          <ExecutionModules />
          <div className="entry-footnote">
            <i /> CAMERA PATH / SOURCE TO SANDBOX
          </div>
        </div>

        {/* Inside Boundary Layer (Beat 3) */}
        <div className="story-layer inside-layer">
          <div className="inside-copy-block">
            <SectionEyebrow number="03">INSIDE THE ISOLATION BOUNDARY</SectionEyebrow>
            <h2 className="inside-copy">
              <WordReveal text="Every execution happens within a controlled environment. Workflo prepares the revision, enforces execution boundaries, governs agent actions and collects evidence from the run." />
            </h2>
            <p>Controls and access follow the configured policy for each execution.</p>
          </div>
          <Hotspots />
          <div className="inside-coordinate">
            <span>EXECUTION SPACE</span>
            <b>00.04 / 08.21</b>
            <i />
          </div>
          <div className="inside-vertical-label">
            ISOLATED EXECUTION / GOVERNED ACTIONS / CAPTURED EVIDENCE
          </div>
        </div>

        {/* Verification Station Layer (Beat 4) */}
        <div className="story-layer station-layer">
          <div className="station-heading">
            <SectionEyebrow number="04">VERIFICATION STATION</SectionEyebrow>
            <h2>
              Execution is only half the story.<br />
              <span>Proof is what matters.</span>
            </h2>
          </div>
          <div className="station-layout">
            <DemoReceipt />
            <div className="station-capabilities">
              <div className="station-capabilities-head">
                <span className="mono-label">VERIFICATION CAPABILITIES</span>
                <span>05</span>
              </div>
              {capabilityRows.map((row, index) => (
                <div className="station-feature" key={row}>
                  <span>0{index + 1}</span>
                  <b>{row}</b>
                  <i>
                    <ArrowIcon />
                  </i>
                </div>
              ))}
              <p>
                Illustrative receipt format. Run content depends on configured
                integrations and policy.
              </p>
            </div>
          </div>
          <div className="station-footnote">
            <span>RUN RECORD / DEMONSTRATION DATA</span>
            <span>REVISION 9F3B7C2 / EVIDENCE MANIFEST ATTACHED</span>
          </div>
        </div>

        {/* Overlays */}
        <div className="story-progress" aria-hidden="true">
          <span className="story-progress-fill" />
        </div>
        <div className="story-stage-code" aria-hidden="true">
          <span>WF / STORY</span>
          <i />
          SCROLL TO EXPLORE
        </div>
      </div>

      <MobileStory />
    </section>
  );
}
