export type IntegrationTier = {
  id: "available" | "planned" | "roadmap";
  label: string;
  note: string;
  items: { name: string; detail: string }[];
};

export const INTEGRATION_TIERS: IntegrationTier[] = [
  {
    id: "available",
    label: "Available",
    note: "Nothing is publicly available yet. Workflo is pre-release, and this site does not claim partners it does not have.",
    items: [],
  },
  {
    id: "planned",
    label: "Planned",
    note: "Designed into the execution model. Not shipped.",
    items: [
      {
        name: "CLI in an existing CI job",
        detail: "Run a controlled execution from a CI step without replacing the pipeline.",
      },
      {
        name: "Git repositories over HTTPS or SSH",
        detail: "Capture the repository and revision an execution starts from.",
      },
      {
        name: "GitHub Actions workflow step",
        detail: "Invoke an execution from a workflow and keep the receipt as an artifact.",
      },
      {
        name: "Generic webhook trigger",
        detail: "Start an execution from an event in a system Workflo does not integrate with directly.",
      },
    ],
  },
  {
    id: "roadmap",
    label: "Roadmap",
    note: "Under consideration. Order and scope may change.",
    items: [
      { name: "JUnit XML import", detail: "Attach results from an existing test runner to an execution record." },
      { name: "GitLab CI component", detail: "Equivalent execution step for GitLab pipelines." },
      { name: "S3-compatible evidence export", detail: "Push receipts and artifacts to storage you control." },
      { name: "Slack notifications", detail: "Post execution outcomes and receipt links to a channel." },
      { name: "Issue tracker links", detail: "Attach an execution receipt to the change it verifies." },
    ],
  },
];
