import React from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { SolutionCard, solutionCards } from "../components/cards/SolutionCard";
import { ArrowIcon } from "../components/navigation/Icons";

export function Solutions() {
  return (
    <section className="solutions-section" id="solutions">
      <div className="solutions-inner">
        <div className="solutions-heading">
          <div>
            <SectionEyebrow number="05">WORKFLO SOLUTIONS</SectionEyebrow>
            <h2>
              From code changes<br />to trusted outcomes.
            </h2>
          </div>
          <p>
            One verification platform for engineering teams that need reliable test
            execution, autonomous investigation and evidence they can trust.
          </p>
        </div>
        <div className="solution-grid">
          {solutionCards.map((card) => (
            <SolutionCard key={card.id} card={card} />
          ))}
        </div>
        <div className="solutions-bottomline">
          <span>ONE EXECUTION PATH. MULTIPLE WAYS TO VERIFY.</span>
          <a href="#platform">
            Explore the platform <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
