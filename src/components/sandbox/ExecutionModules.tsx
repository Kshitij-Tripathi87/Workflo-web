import React from "react";
import { ExecutionStep } from "../../types";

export const executionSteps: ExecutionStep[] = [
  { label: "Pinned source revision", note: "Commit and workspace snapshot" },
  { label: "Runtime preparation", note: "Dependencies and execution surface" },
  { label: "Isolation boundaries", note: "Configured filesystem and network policy" },
  { label: "Governed probes", note: "Actions evaluated against run policy" },
  { label: "Evidence collection", note: "Events and artifacts linked to the run" },
];

export function ExecutionModules() {
  return (
    <>
      <div className="execution-module module-revision">
        <span>REVISION / PINNED</span>
        <b>9f3b7c2</b>
        <small>WORKSPACE SNAPSHOT READY</small>
      </div>
      <div className="execution-module module-policy">
        <span>EXECUTION POLICY</span>
        <b>filesystem / scoped</b>
        <small>network / configured</small>
      </div>
      <div className="execution-module module-probe">
        <span>PROBE QUEUE / DEMO</span>
        <b>18 checks prepared</b>
        <small>agent actions governed</small>
      </div>
    </>
  );
}
