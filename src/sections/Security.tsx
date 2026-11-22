import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";

export function Security() {
  return (
    <section className="security-section section-pad" id="security">
      <div className="security-copy">
        <SectionEyebrow number="10">SECURITY & ISOLATION</SectionEyebrow>
        <h2>
          Make the boundary<br />part of the run.
        </h2>
        <p>
          Isolation is described through the policies and runtime controls
          configured for an execution, not assumed from a diagram.
        </p>
        <p className="security-caveat">
          Available controls depend on the deployment, integrations and run
          configuration. The interface shown here is illustrative and is not a
          deployment-specific security guarantee.
        </p>
      </div>
      <div className="policy-table">
        <div className="policy-table-head">
          <span>CONTROL SURFACE</span>
          <span>RUN CONTEXT</span>
          <span>RECORD</span>
        </div>
        <div>
          <b>Filesystem</b>
          <span>Configured workspace access</span>
          <i>POLICY</i>
        </div>
        <div>
          <b>Network</b>
          <span>Configured access restrictions</span>
          <i>POLICY</i>
        </div>
        <div>
          <b>Agent actions</b>
          <span>Governed by run policy</span>
          <i>POLICY</i>
        </div>
        <div>
          <b>Teardown</b>
          <span>Recorded as run evidence</span>
          <i>EVENT</i>
        </div>
        <p>
          <i /> Exact behavior is defined by the active runtime and policy.
        </p>
      </div>
    </section>
  );
}
