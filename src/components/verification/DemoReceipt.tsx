import React from "react";
import { LogoMark } from "../navigation/Icons";

type DemoReceiptProps = {
  compact?: boolean;
};

export const capabilityRows = [
  "Pinned revision verification",
  "Isolated execution",
  "Governed agent activity",
  "Evidence integrity",
  "Verified teardown",
];

export function DemoReceipt({ compact = false }: DemoReceiptProps) {
  const demoFields = [
    ["RUN IDENTIFIER", "wf_demo_7f29"],
    ["REPOSITORY", "workflo/demo-application"],
    ["PINNED COMMIT", "9f3b7c2"],
    ["EXECUTION STATUS", "COMPLETE / DEMO"],
    ["EVIDENCE MANIFEST", "sha256: 8ac1...c409"],
    ["RECEIPT SIGNATURE", "ed25519: 2f8d...a114"],
    ["TEARDOWN", "RECORDED / DEMO"],
  ];

  return (
    <div className={`receipt-card ${compact ? "receipt-compact" : ""}`}>
      <div className="receipt-topline">
        <span className="receipt-mark">
          <LogoMark />
        </span>
        <span className="mono-label">DEMONSTRATION DATA / NOT A LIVE RUN</span>
        <span className="receipt-verified">
          <span className="status-dot" /> VERIFIED
        </span>
      </div>

      <div className="receipt-heading-row">
        <div>
          <p className="mono-label">WORKFLO / RUN ARTIFACT</p>
          <h3>Verification receipt</h3>
        </div>
        <div className="receipt-run-date">
          <span>RUN</span>
          <b>WF-7F29</b>
        </div>
      </div>

      <div className="receipt-body">
        <div className="receipt-fields">
          {demoFields.map(([label, value], index) => (
            <div className="receipt-field" data-receipt-row={index} key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </div>

        <div className="receipt-result">
          <div className="result-top">
            <span className="mono-label">TEST OUTCOMES</span>
            <span className="result-status">ALL CLEAR</span>
          </div>
          <div className="result-number">
            <span className="result-count">18</span>
            <small>/ 18 checks</small>
          </div>
          <svg
            className="receipt-sparkline"
            viewBox="0 0 250 68"
            preserveAspectRatio="none"
            aria-label="Illustrative test outcome trend"
          >
            <path className="sparkline-grid" d="M0 16.5h250M0 34h250M0 51.5h250" />
            <path
              className="sparkline-line"
              d="M1 51 22 49 42 49 60 41 79 43 100 31 119 34 141 25 161 27 181 16 200 20 221 11 249 8"
            />
            <circle cx="249" cy="8" r="3" className="sparkline-dot" />
          </svg>
          <div className="receipt-result-foot">
            <span>
              PASS <b>18</b>
            </span>
            <span>
              FAIL <b>00</b>
            </span>
            <span>DEMO</span>
          </div>
        </div>
      </div>

      <div className="receipt-footer">
        <span>RECEIPT CONTENT IS ILLUSTRATIVE</span>
        <span>WORKFLO / EVIDENCE</span>
      </div>
    </div>
  );
}
