import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";

export function Architecture() {
  return (
    <section className="architecture-section section-pad" id="architecture">
      <div className="architecture-head">
        <SectionEyebrow number="09">SANDBOX ARCHITECTURE</SectionEyebrow>
        <h2>A workspace with edges.</h2>
        <p>Source, runtime, policy and evidence meet inside a defined execution context.</p>
      </div>
      <div className="architecture-diagram">
        <div className="diagram-header">
          <span>WORKFLO / EXECUTION CONTEXT</span>
          <span>BOUNDARY VIEW / ILLUSTRATIVE</span>
        </div>
        <div className="diagram-frame">
          <div className="diagram-side-label">CONTROL PLANE / RUN CONFIGURATION</div>
          <div className="diagram-sandbox">
            <div className="diagram-boundary-label">
              <i /> EXECUTION BOUNDARY <small>CONFIGURED PER RUN</small>
            </div>
            <div className="diagram-layer layer-source">
              <span>01</span>
              <b>Source snapshot</b>
              <small>revision + workspace</small>
              <i>PINNED</i>
            </div>
            <div className="diagram-layer layer-runtime">
              <span>02</span>
              <b>Runtime surface</b>
              <small>dependencies + probes</small>
              <i>PREPARED</i>
            </div>
            <div className="diagram-layer layer-policy">
              <span>03</span>
              <b>Run policy</b>
              <small>access + governed actions</small>
              <i>APPLIED</i>
            </div>
            <div className="diagram-layer layer-evidence">
              <span>04</span>
              <b>Evidence record</b>
              <small>events + artifacts</small>
              <i>COLLECTED</i>
            </div>
            <div className="diagram-orbit orbit-one" />
            <div className="diagram-orbit orbit-two" />
          </div>
          <div className="diagram-side-label diagram-bottom-label">
            RUN OUTPUT / RECEIPT + MANIFEST
          </div>
        </div>
        <div className="diagram-caption">
          <span>01 / EXECUTION CONTEXT</span>
          <span>Each run has a defined source, policy and output record.</span>
          <span>02 / EVIDENCE CONTEXT</span>
        </div>
      </div>
    </section>
  );
}
