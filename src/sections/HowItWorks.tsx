import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { ArrowIcon } from "../components/navigation/Icons";

const runSteps = [
  {
    index: "01",
    title: "Select the revision",
    description: "Choose the exact source revision and workspace to verify.",
  },
  {
    index: "02",
    title: "Prepare the environment",
    description: "Resolve the required runtime and dependencies for the run.",
  },
  {
    index: "03",
    title: "Apply run policy",
    description: "Set the filesystem, network and agent-action boundaries for the execution.",
  },
  {
    index: "04",
    title: "Execute and investigate",
    description: "Run tests and governed probes against the prepared application.",
  },
  {
    index: "05",
    title: "Collect and verify",
    description: "Gather outcomes and artifacts into an inspectable run record.",
  },
];

export function HowItWorks() {
  return (
    <section className="run-section section-pad" id="run">
      <div className="run-heading">
        <SectionEyebrow number="08">HOW A RUN WORKS</SectionEyebrow>
        <h2>From source to receipt.</h2>
        <p>A visible sequence, with the context and result kept connected.</p>
      </div>
      <div className="run-timeline">
        {runSteps.map((step) => (
          <article className="run-step" key={step.index}>
            <span>{step.index}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            <i>
              <ArrowIcon />
            </i>
          </article>
        ))}
      </div>
    </section>
  );
}
