import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { ArrowIcon } from "../components/navigation/Icons";

const integrationCategories = [
  {
    index: "01",
    title: "Source control",
    description: "Repository and revision context",
  },
  {
    index: "02",
    title: "Build environments",
    description: "Runtime and dependency preparation",
  },
  {
    index: "03",
    title: "Test frameworks",
    description: "Existing checks and application probes",
  },
  {
    index: "04",
    title: "Evidence outputs",
    description: "Artifacts and run review",
  },
];

export function Integrations() {
  return (
    <section className="integrations-section section-pad" id="integrations">
      <div className="integrations-intro">
        <SectionEyebrow number="12">INTEGRATIONS</SectionEyebrow>
        <h2>
          Fit the workflow<br />you already run.
        </h2>
        <p>
          Connect the source, build and testing surfaces needed for your
          verification path.
        </p>
      </div>
      <div className="integration-list">
        {integrationCategories.map((item) => (
          <div key={item.index}>
            <span>{item.index}</span>
            <b>{item.title}</b>
            <small>{item.description}</small>
            <i>
              <ArrowIcon />
            </i>
          </div>
        ))}
        <p>Available connectors depend on your Workflo deployment.</p>
      </div>
    </section>
  );
}
