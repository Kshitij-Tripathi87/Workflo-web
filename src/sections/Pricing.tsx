import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { ArrowIcon } from "../components/navigation/Icons";

export function Pricing() {
  return (
    <section className="pricing-section section-pad" id="pricing">
      <div>
        <SectionEyebrow number="13">PRICING / START WITH YOUR RUN</SectionEyebrow>
        <h2>
          Verification sized<br />to your workflow.
        </h2>
      </div>
      <div className="pricing-copy">
        <p>
          Execution needs vary by repository, runtime and policy. Talk with the
          Workflo team to map the right starting point for your environment.
        </p>
        <a href="#contact" className="button-dark">
          Discuss your workflow <ArrowIcon />
        </a>
        <span>No public plans or usage figures are represented on this page.</span>
      </div>
    </section>
  );
}
