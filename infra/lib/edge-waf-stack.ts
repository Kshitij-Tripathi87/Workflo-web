import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";

export interface EdgeWafStackProps extends cdk.StackProps {
  environmentName: "staging" | "production";
}

export class EdgeWafStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EdgeWafStackProps) {
    super(scope, id, props);
    const production = props.environmentName === "production";
    const acl = new wafv2.CfnWebACL(this, "CloudFrontWebAcl", {
      name: `workflo-web-${props.environmentName}-cloudfront`,
      scope: "CLOUDFRONT",
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `workflo-web-${props.environmentName}-cloudfront`,
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: "AWSManagedCommonRules",
          priority: 10,
          overrideAction: { none: {} },
          statement: { managedRuleGroupStatement: { vendorName: "AWS", name: "AWSManagedRulesCommonRuleSet" } },
          visibilityConfig: { cloudWatchMetricsEnabled: true, metricName: "common-rules", sampledRequestsEnabled: true },
        },
        {
          name: "PublicRequestRateLimit",
          priority: 20,
          action: { block: {} },
          statement: { rateBasedStatement: { limit: production ? 1200 : 600, aggregateKeyType: "IP" } },
          visibilityConfig: { cloudWatchMetricsEnabled: true, metricName: "request-rate", sampledRequestsEnabled: true },
        },
      ],
    });
    new cdk.CfnOutput(this, "CloudFrontWebAclArn", {
      value: acl.attrArn,
      description: "Pass this ARN as -c webAclArn=... to the matching regional website stack.",
    });
  }
}
