import type { SQSEvent, SQSHandler } from "aws-lambda";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION ?? "ap-south-1";
const ses = new SESv2Client({ region });
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

type Submission = {
  id: string;
  kind: "contact" | "early_access";
  createdAt: string;
  payload: Record<string, unknown>;
};

export const handler: SQSHandler = async (event: SQSEvent) => {
  const from = process.env.SES_FROM_ADDRESS;
  const to = process.env.LEAD_NOTIFICATION_ADDRESS;
  const tableName = process.env.SUBMISSIONS_TABLE;
  if (!from || !to || !tableName) throw new Error("SES_FROM_ADDRESS, LEAD_NOTIFICATION_ADDRESS and SUBMISSIONS_TABLE are required");

  for (const message of event.Records) {
    const notification = JSON.parse(message.body) as { id: string; kind: string; createdAt: string };
    const result = await db.send(new GetCommand({
      TableName: tableName,
      Key: { id: notification.id },
      ConsistentRead: true,
    }));
    const submission = result.Item as Submission | undefined;
    if (!submission) throw new Error(`Submission ${notification.id} is not present in the durable store`);

    const details = Object.entries(submission.payload)
      .filter(([key]) => key !== "consentToReply")
      .map(([key, value]) => `${key}: ${String(value ?? "")}`)
      .join("\n");

    await ses.send(new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: `Workflo ${submission.kind.replace("_", " ")} submission / ${submission.id.slice(0, 8)}` },
          Body: {
            Text: {
              Data: [
                `A new ${submission.kind.replace("_", " ")} request was received.`,
                `Reference: ${submission.id}`,
                `Received: ${submission.createdAt}`,
                "",
                details,
                "",
                "This notification contains submitted enquiry details. Handle it as confidential business information and do not forward outside the authorised team.",
              ].join("\n"),
            },
          },
        },
      },
    }));
  }
};
