import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { ArrowIcon } from "../components/navigation/Icons";
import { featureItems } from "../data/storyData";

export function Features() {
  return (
    <section className="features-section section-pad" id="features">
      <div className="features-intro">
        <SectionEyebrow number="07">CORE CAPABILITIES</SectionEyebrow>
        <h2>
          Quality work with<br />a clearer boundary.
        </h2>
        <p>
          Purpose-built execution and evidence primitives for teams building
          software with autonomous systems.
        </p>
      </div>
      <div className="feature-list">
        {featureItems.map((item) => (
          <article className="feature-row" key={item.index}>
            <span className="feature-row-index">{item.index}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <a href={item.destination} aria-label={`Learn more about ${item.title}`}>
              <ArrowIcon diagonal />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
