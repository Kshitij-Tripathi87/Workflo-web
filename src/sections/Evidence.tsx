import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { ArrowIcon } from "../components/navigation/Icons";

export function Evidence() {
  return (
    <section className="evidence-section section-pad" id="evidence">
      <div className="evidence-copy">
        <SectionEyebrow number="11">EVIDENCE & RECEIPT VERIFICATION</SectionEyebrow>
        <h2>
          Proof should point<br />back to the run.
        </h2>
        <p>
          A receipt ties the execution outcome to the revision, run context and
          evidence manifest available for inspection.
        </p>
        <a href="#solutions" className="text-link">
          See Workflo solutions <ArrowIcon />
        </a>
      </div>
      <div className="evidence-manifest">
        <div className="manifest-top">
          <span>RECEIPT MANIFEST / DEMO</span>
          <span className="manifest-status">
            <i /> EXAMPLE
          </span>
        </div>
        <div className="manifest-main">
          <div className="manifest-seal">
            <span>WF</span>
            <i />
          </div>
          <div>
            <small>RUN REFERENCE</small>
            <b>WF / 7F29 / DEMO</b>
          </div>
        </div>
        <div className="manifest-row">
          <span>REVISION LINK</span>
          <b>9f3b7c2</b>
          <i>BOUND</i>
        </div>
        <div className="manifest-row">
          <span>EVIDENCE DIGEST</span>
          <b>sha256 / 8ac1...c409</b>
          <i>RECORDED</i>
        </div>
        <div className="manifest-row">
          <span>RECEIPT SIGNATURE</span>
          <b>ed25519 / 2f8d...a114</b>
          <i>DEMO</i>
        </div>
        <div className="manifest-footer">
          <span>ILLUSTRATIVE DATA</span>
          <span>INSPECT / COMPARE / VERIFY</span>
        </div>
      </div>
    </section>
  );
}
