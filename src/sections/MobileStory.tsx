import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { DemoReceipt } from "../components/verification/DemoReceipt";
import { ArrowIcon } from "../components/navigation/Icons";
import { capabilityRows, executionSteps, hotspotItems } from "../data/storyData";

export function MobileStory() {
  return (
    <div className="story-reduced">
      <section className="reduced-hero">
        <div className="reduced-hero-copy">
          <SectionEyebrow number="01">AUTONOMOUS QUALITY ENGINEERING</SectionEyebrow>
          <p className="reduced-brand">
            Workflo<span>.</span>
          </p>
          <h1>
            Every change tested.<br />Every result verifiable.
          </h1>
          <p className="reduced-lede">
            A controlled execution environment for software verification, autonomous
            QA and evidence you can inspect.
          </p>
          <div className="hero-capabilities">
            <span>Isolated execution</span>
            <i />
            <span>Autonomous QA</span>
            <i />
            <span>Verifiable receipts</span>
          </div>
        </div>
        <div
          className="mobile-sandbox-art"
          aria-label="Wireframe illustration of the Workflo sandbox"
        >
          <svg
            viewBox="0 0 640 360"
            role="img"
            aria-labelledby="mobile-sandbox-title"
          >
            <title id="mobile-sandbox-title">
              Triangulated sandbox enclosure with execution surfaces
            </title>
            <defs>
              <linearGradient id="sandboxStroke" x1="0" x2="1">
                <stop stopColor="#5E716D" stopOpacity=".23" />
                <stop offset=".56" stopColor="#364440" stopOpacity=".64" />
                <stop offset="1" stopColor="#B18465" stopOpacity=".54" />
              </linearGradient>
              <radialGradient id="sandboxGlow">
                <stop stopColor="#E0E6E3" stopOpacity=".68" />
                <stop offset="1" stopColor="#F7F7F5" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="372" cy="174" rx="245" ry="144" fill="url(#sandboxGlow)" />
            <g fill="none" stroke="url(#sandboxStroke)" strokeWidth=".75">
              <path d="m89 119 231-73 230 55-221 100zM89 119v138l240 67V201m221-100v147l-221 76M320 46v155m-231-82 461 129M89 165l240 73 231-96M89 211l240 67 231-83M135 105l8 153m47-168 10 182m47-197 4 203m116-196-6 174m58-160-11 143m58-130-12 117M130 106l218 94m-161-108 206 88m-147-105 193 83m-93 39-11 115m72-142-10 164m75-191-10 217M118 155l460-97m-460 143 459-101m-459 147 459-100M155 99l-66 158m110-174-64 186m116-202-62 216m270-160 68 184m-113-197 75 183m-128-199 83 197" />
              <path
                d="m151 229 331-80M145 250l326-80M189 266l272-66M179 175l265-58M275 236l-20-114m93 132-10-111m107 78-4-125"
                strokeOpacity=".47"
              />
            </g>
            <g fill="#B18465">
              <circle cx="320" cy="201" r="3" />
              <circle cx="430" cy="180" r="2.5" />
              <circle cx="250" cy="236" r="2" />
            </g>
          </svg>
        </div>
      </section>

      <section className="reduced-block">
        <SectionEyebrow number="02">ENTER THE SANDBOX</SectionEyebrow>
        <h2>A run, assembled with intent.</h2>
        <p>Each stage is prepared and recorded as part of a single execution path.</p>
        <ol className="mobile-step-list">
          {executionSteps.map((step, index) => (
            <li key={step.label}>
              <span>0{index + 1}</span>
              <div>
                <b>{step.label}</b>
                <small>{step.note}</small>
              </div>
              <i>+</i>
            </li>
          ))}
        </ol>
      </section>

      <section className="reduced-block reduced-boundary">
        <SectionEyebrow number="03">INSIDE THE ISOLATION BOUNDARY</SectionEyebrow>
        <h2>Every run has a defined context.</h2>
        <p>
          Every execution happens within a controlled environment. Workflo prepares
          the revision, enforces execution boundaries, governs agent actions and
          collectes evidence from the run.
        </p>
        <div className="mobile-hotspot-list">
          {hotspotItems.map((item) => (
            <details key={item.id}>
              <summary>
                <span>{item.id}</span>
                {item.title}
                <i>+</i>
              </summary>
              <p>{item.text}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="reduced-block reduced-verification">
        <SectionEyebrow number="04">VERIFICATION STATION</SectionEyebrow>
        <h2>
          Execution is only half the story.<br />Proof is what matters.
        </h2>
        <DemoReceipt compact />
        <div className="mobile-capability-list">
          {capabilityRows.map((row, index) => (
            <div key={row}>
              <span>0{index + 1}</span>
              {row}
              <ArrowIcon />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
