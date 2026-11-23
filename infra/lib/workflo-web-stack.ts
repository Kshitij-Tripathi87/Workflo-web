import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";

export interface WorkfloWebStackProps extends cdk.StackProps {
  environmentName: "staging" | "production";
  /** CloudFront-scope WAF ACL created by the separate us-east-1 edge stack. */
  webAclArn?: string;
}

export class WorkfloWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WorkfloWebStackProps) {
    super(scope, id, props);
    const envName = props.environmentName;
    const production = envName === "production";
    const name = (part: string) => `workflo-web-${envName}-${part}`;

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: production,
      removalPolicy: production ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !production,
    });

    const table = new dynamodb.Table(this, "Submissions", {
      tableName: name("submissions"),
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: production,
      removalPolicy: production ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: "expiresAt",
    });

    const deadLetterQueue = new sqs.Queue(this, "NotificationDLQ", {
      queueName: name("notification-dlq.fifo"),
      fifo: true,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
    });
    const notificationQueue = new sqs.Queue(this, "NotificationQueue", {
      queueName: name("notifications.fifo"),
      fifo: true,
      contentBasedDeduplication: true,
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      visibilityTimeout: cdk.Duration.seconds(120),
      deadLetterQueue: { queue: deadLetterQueue, maxReceiveCount: 5 },
    });

    const commonEnvironment = {
      SUBMISSIONS_TABLE: table.tableName,
      NOTIFICATION_QUEUE_URL: notificationQueue.queueUrl,
      ALLOWED_ORIGIN: process.env.SITE_ORIGIN ?? "",
      SUBMISSION_RETENTION_DAYS: process.env.SUBMISSION_RETENTION_DAYS ?? "365",
    };

    const makeFunction = (logicalId: string, handler: string, timeout = 10) =>
      new lambda.Function(this, logicalId, {
        functionName: name(logicalId.toLowerCase()),
        runtime: lambda.Runtime.NODEJS_24_X,
        architecture: lambda.Architecture.ARM_64,
        handler,
        code: lambda.Code.fromAsset("../backend/dist"),
        timeout: cdk.Duration.seconds(timeout),
        memorySize: 256,
        logRetention: logs.RetentionDays.ONE_MONTH,
        environment: commonEnvironment,
        description: `Workflo public website ${logicalId} (${envName})`,
      });

    const contactFn = makeFunction("ContactHandler", "handlers/contact.handler");
    const earlyAccessFn = makeFunction("EarlyAccessHandler", "handlers/early-access.handler");
    const healthFn = makeFunction("HealthHandler", "handlers/health.handler");
    for (const fn of [contactFn, earlyAccessFn]) {
      table.grantWriteData(fn);
      notificationQueue.grantSendMessages(fn);
    }

    const api = new apigw.HttpApi(this, "PublicApi", {
      apiName: name("api"),
      // Browser calls are same-origin through the CloudFront /api/* behaviour.
      // Set SITE_ORIGIN only for approved direct cross-origin staging use.
      ...(process.env.SITE_ORIGIN ? {
        corsPreflight: {
          allowOrigins: [process.env.SITE_ORIGIN],
          allowMethods: [apigw.CorsHttpMethod.POST, apigw.CorsHttpMethod.GET, apigw.CorsHttpMethod.OPTIONS],
          allowHeaders: ["content-type"],
          maxAge: cdk.Duration.hours(1),
        },
      } : {}),
    });
    api.addRoutes({
      path: "/api/v1/health",
      methods: [apigw.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("HealthIntegration", healthFn),
    });
    api.addRoutes({
      path: "/api/v1/contact",
      methods: [apigw.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("ContactIntegration", contactFn),
    });
    api.addRoutes({
      path: "/api/v1/early-access",
      methods: [apigw.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("EarlyAccessIntegration", earlyAccessFn),
    });

    const apiWebAcl = new wafv2.CfnWebACL(this, "ApiWebAcl", {
      name: name("api-web-acl"),
      scope: "REGIONAL",
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: name("api-web-acl"),
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: "AWSManagedCommonRules",
          priority: 10,
          overrideAction: { none: {} },
          statement: { managedRuleGroupStatement: { vendorName: "AWS", name: "AWSManagedRulesCommonRuleSet" } },
          visibilityConfig: { cloudWatchMetricsEnabled: true, metricName: "api-common-rules", sampledRequestsEnabled: true },
        },
        {
          name: "ApiRateLimit",
          priority: 20,
          action: { block: {} },
          statement: { rateBasedStatement: { limit: production ? 1200 : 600, aggregateKeyType: "IP" } },
          visibilityConfig: { cloudWatchMetricsEnabled: true, metricName: "api-rate", sampledRequestsEnabled: true },
        },
      ],
    });
    const apiStageName = api.defaultStage?.stageName ?? "$default";
    const apiStageArn = `arn:${cdk.Aws.PARTITION}:apigateway:${cdk.Aws.REGION}::/apis/${api.apiId}/stages/${apiStageName}`;
    new wafv2.CfnWebACLAssociation(this, "ApiWebAclAssociation", {
      resourceArn: apiStageArn,
      webAclArn: apiWebAcl.attrArn,
    });

    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "connect-src 'self'",
      "upgrade-insecure-requests",
    ].join("; ");
    const securityHeaders = new cloudfront.ResponseHeadersPolicy(this, "SecurityHeaders", {
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.days(365),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          { header: "Content-Security-Policy", value: contentSecurityPolicy, override: true },
          { header: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()", override: true },
        ],
      },
    });

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        responseHeadersPolicy: securityHeaders,
      },
      additionalBehaviors: {
        "/assets/*": {
          origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          responseHeadersPolicy: securityHeaders,
        },
        "/media/*": {
          origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          responseHeadersPolicy: securityHeaders,
        },
        "/api/*": {
          origin: new origins.HttpOrigin(cdk.Fn.select(2, cdk.Fn.split("/", api.apiEndpoint))),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          responseHeadersPolicy: securityHeaders,
        },
      },
      defaultRootObject: "index.html",
    });

    const worker = new lambda.Function(this, "NotificationWorker", {
      functionName: name("notification-worker"),
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      handler: "handlers/notify.handler",
      code: lambda.Code.fromAsset("../backend/dist"),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: {
        SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS ?? "",
        LEAD_NOTIFICATION_ADDRESS: process.env.LEAD_NOTIFICATION_ADDRESS ?? "",
      },
    });
    notificationQueue.grantConsumeMessages(worker);
    const senderAddress = process.env.SES_FROM_ADDRESS;
    const senderIdentityArn = process.env.SES_IDENTITY_ARN;
    worker.addToRolePolicy(new iam.PolicyStatement({
      actions: ["ses:SendEmail"],
      resources: senderIdentityArn ? [senderIdentityArn] : ["*"],
    }));
    if (!senderIdentityArn) {
      cdk.Annotations.of(worker).addWarning("SES_IDENTITY_ARN is unset; restrict ses:SendEmail to the verified sender identity before production.");
    }
    worker.addEventSource("NotificationQueueMapping", new eventSources.SqsEventSource(notificationQueue, {
      batchSize: 5,
      reportBatchItemFailures: true,
    }));

    const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
    if (props.webAclArn) {
      cfnDistribution.addPropertyOverride("DistributionConfig.WebACLId", props.webAclArn);
    } else {
      cdk.Annotations.of(distribution).addWarning("CloudFront WAF ACL is not attached. Deploy the Edge WAF stack in us-east-1 and redeploy with -c webAclArn=<ACL ARN> before production.");
    }

    new cdk.CfnOutput(this, "SiteBucketName", { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, "CloudFrontDomain", { value: distribution.domainName });
    new cdk.CfnOutput(this, "ApiUrl", { value: api.apiEndpoint });
    new cdk.CfnOutput(this, "SubmissionsTable", { value: table.tableName });
    new cdk.CfnOutput(this, "NotificationQueue", { value: notificationQueue.queueUrl });
  }
}