import * as cdk from "aws-cdk-lib";
import { WorkfloWebStack } from "../lib/workflo-web-stack.js";

const app = new cdk.App();
const environment = app.node.tryGetContext("environment") ?? "staging";
if (!["staging", "production"].includes(environment)) {
  throw new Error("Set -c environment=staging or production");
}
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION ?? "ap-south-1";
if (!account) throw new Error("CDK_DEFAULT_ACCOUNT is required; run aws sts get-caller-identity first");

new WorkfloWebStack(app, environment === "production" ? "WorkfloWebProduction" : "WorkfloWebStaging", {
  env: { account, region },
  environmentName: environment,
  description: `Workflo public website and lead intake (${environment})`,
});