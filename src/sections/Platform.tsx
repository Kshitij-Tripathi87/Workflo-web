import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { ArrowIcon } from "../components/navigation/Icons";

export function Platform() {
  return (
    <section className="platform-section section-pad" id="platform">
      <div className="platform-heading">
        <SectionEyebrow number="06">THE WORKFLO PLATFORM</SectionEyebrow>
        <h2>
          Verification is a workflow,<br />not a final checkbox.
        </h2>
      </div>
      <div className="platform-content">
        <p className="platform-lede">
          Bring the code change, the execution context and the evidence of what
          happened into one traceable run.
        </p>
        <div className="platform-flow" aria-label="Workflo run connection">
          <div>
            <span>01</span>
            <b>Change</b>
            <small>revision + workspace</small>
          </div>
          <i />
          <div>
            <span>02</span>
            <b>Execute</b>
            <small>configured environment</small>
          </div>
          <i />
          <div>
            <span>03</span>
            <b>Verify</b>
            <small>results + evidence</small>
          </div>
        </div>
        <a className="text-link" href="#run">
          See how a run works <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
