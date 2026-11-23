import React from "react";
import { BrandLink } from "../components/navigation/BrandLink";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <BrandLink />
        <p>
          Software verification<br />
          with evidence attached.
        </p>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#platform">Platform</a>
          <a href="#security">Security</a>
          <a href="#evidence">Evidence</a>
          <a href="#early-access">Early access</a>
        </nav>
        <nav className="footer-legal" aria-label="Legal and privacy">
          <a href="/privacy.html">Privacy</a>
          <a href="/cookies.html">Cookies</a>
          <a href="/terms.html">Terms</a>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("workflo:open-privacy-settings"))}>Privacy settings</button>
        </nav>
        <a className="footer-top-link" href="#top">
          BACK TO TOP
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 13V3m-4 4 4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <div className="footer-bottom">
        <span>© WORKFLO / AUTONOMOUS QUALITY ENGINEERING</span>
        <span>ILLUSTRATIVE PRODUCT EXPERIENCE</span>
        <span>SECURE EXECUTION / INSPECTABLE EVIDENCE</span>
      </div>
    </footer>
  );
}
