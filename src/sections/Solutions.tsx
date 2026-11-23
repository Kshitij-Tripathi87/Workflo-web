import React, { useEffect, useRef } from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { SolutionVisual, solutionCards } from "../components/cards/SolutionCard";
import { ArrowIcon } from "../components/navigation/Icons";

export function Solutions() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      rows.forEach((row) => row.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="solutions-section" id="solutions">
      <div className="solutions-inner">
        <div className="solutions-heading">
          <div>
            <SectionEyebrow number="05">WORKFLO / THE VERIFICATION PATH</SectionEyebrow>
            <h2>Three guarantees.<br/>One connected run.</h2>
          </div>
          <p>
            Workflo pins the change under test, executes it inside a controlled
            environment, and binds the outcome to evidence that can be inspected.
            Each stage answers a different engineering question.
          </p>
        </div>

        <div className="solution-editorial-list" ref={listRef}>
          {solutionCards.map((card, index) => (
            <a
              className={`solution-editorial-row solution-editorial-row-${card.visual}`}
              href={card.destination}
              key={card.id}
              data-reveal
            >
              <span className="solution-editorial-index">{card.id}</span>
              <div className="solution-editorial-copy">
                <span className="solution-editorial-kicker">
                  {index === 0 ? "PIN THE CHANGE" : index === 1 ? "INSPECT THE EXECUTION" : "KEEP THE PROOF"}
                </span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="solution-editorial-link">
                  {index === 0 ? "See the run lifecycle" : index === 1 ? "Explore the architecture" : "Inspect a receipt"}
                  <ArrowIcon diagonal />
                </span>
              </div>
              <div className="solution-editorial-art">
                <SolutionVisual type={card.visual}/>
              </div>
              <span className="solution-editorial-arrow" aria-hidden="true"><ArrowIcon diagonal/></span>
            </a>
          ))}
        </div>

        <div className="solutions-bottomline">
          <span>REVISION → ISOLATION → EVIDENCE</span>
          <a href="#platform">Explore the platform <ArrowIcon /></a>
        </div>
      </div>
    </section>
  );
}
