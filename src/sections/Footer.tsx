import React from "react";
import { BrandLink } from "../components/navigation/BrandLink";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <BrandLink />
        <p>
          Autonomous software verification<br />
          with evidence attached.
        </p>
        <div className="footer-links">
          <a href="#platform">Platform</a>
          <a href="#security">Security</a>
          <a href="#evidence">Evidence</a>
          <a href="#pricing">Pricing</a>
        </div>
        <a className="footer-top-link" href="#top">
          BACK TO TOP{" "}
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 13V3m-4 4 4-4 4 4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
      <div className="footer-bottom">
        <span>© WORKFLO / AUTONOMOUS QUALITY ENGINEERING</span>
        <span>EXECUTION CONTEXT / VERIFIED EVIDENCE</span>
        <span>ILLUSTRATIVE PRODUCT EXPERIENCE</span>
      </div>
    </footer>
  );
}
