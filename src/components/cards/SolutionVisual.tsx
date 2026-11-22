import React from "react";
import { ArrowIcon, LogoMark } from "../navigation/Icons";

export function SolutionVisual({ type }: { type: string }) {
  if (type === "revision") {
    return (
      <div className="solution-visual revision-visual" aria-hidden="true">
        <div className="visual-window-bar">
          <span />
          <span />
          <span />
          <b>pull-request / verify</b>
          <i>RUN 04</i>
        </div>
        <div className="revision-panel">
          <div className="revision-meta">
            <span>PINNED REVISION</span>
            <b>9f3b7c2</b>
            <em>LOCKED</em>
          </div>
          <div className="code-lines">
            <span>
              <i>12</i>
              <b className="code-muted">const</b> checkout = <strong>await</strong> sandbox.init()
            </span>
            <span>
              <i>13</i>
              <b className="code-muted">const</b> receipt = <strong>await</strong> run.verify()
            </span>
            <span className="code-added">
              <i>14</i>receipt.bind(revision)
            </span>
            <span>
              <i>15</i>
              <b className="code-muted">return</b> checkout.result
            </span>
          </div>
          <div className="revision-footer">
            <span>
              <i /> WORKSPACE SNAPSHOT
            </span>
            <span>
              VIEW DIFF <ArrowIcon />
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "quality") {
    return (
      <div className="solution-visual quality-visual" aria-hidden="true">
        <div className="quality-window-top">
          <span>APP PROBE / CHECKOUT FLOW</span>
          <span>SESSION 004</span>
        </div>
        <div className="browser-frame">
          <div className="browser-toolbar">
            <i />
            <i />
            <i />
            <span>localhost / checkout</span>
          </div>
          <div className="browser-content">
            <div className="browser-nav">
              <b>STORE</b>
              <span>Products</span>
              <span>Cart</span>
              <small>02</small>
            </div>
            <div className="browser-product">
              <div className="product-slab">
                <span>OBJECT / 01</span>
                <b>
                  FORM
                  <br />
                  STATE
                </b>
              </div>
              <div className="product-copy">
                <span>ITEM NO. 023</span>
                <b>
                  Every detail,
                  <br />
                  in its place.
                </b>
                <i>
                  ADD TO BAG <ArrowIcon />
                </i>
              </div>
            </div>
          </div>
        </div>
        <div className="probe-status">
          <span>
            <i /> ACTION GOVERNED
          </span>
          <b>CHECK 04 / 07</b>
        </div>
      </div>
    );
  }

  return (
    <div className="solution-visual evidence-visual" aria-hidden="true">
      <div className="evidence-top">
        <span>RUN ARTIFACT / RECEIPT</span>
        <span>DEMO</span>
      </div>
      <div className="evidence-sheet">
        <div className="evidence-sheet-head">
          <LogoMark />
          <div>
            <b>VERIFICATION</b>
            <span>WF / 7F29</span>
          </div>
          <i>01</i>
        </div>
        <div className="evidence-seal">
          <span>
            PROOF
            <br />
            OF RUN
          </span>
          <b>01</b>
        </div>
        <div className="evidence-rows">
          <span>
            <i>REVISION</i>
            <b>9f3b7c2</b>
          </span>
          <span>
            <i>OUTCOME</i>
            <b>18 / 18 PASS</b>
          </span>
          <span>
            <i>MANIFEST</i>
            <b>SHA256 VERIFIED</b>
          </span>
        </div>
        <div className="evidence-signature">2f8d 71ae 90c3 8bc1 4d0e 12a6 53f8</div>
      </div>
    </div>
  );
}
