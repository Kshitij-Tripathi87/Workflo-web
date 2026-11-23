import type { SQSEvent, SQSHandler } from "aws-lambda";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({ region: process.env.AWS_REGION ?? "ap-south-1" });

export const handler: SQSHandler = async (event: SQSEvent) => {
  const from = process.env.SES_FROM_ADDRESS;
  const to = process.env.LEAD_NOTIFICATION_ADDRESS;
  if (!from || !to) throw new Error("SES_FROM_ADDRESS and LEAD_NOTIFICATION_ADDRESS are required");

  for (const message of event.Records) {
    const payload = JSON.parse(message.body) as { id: string; kind: string; createdAt: string };
    await ses.send(new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: `Workflo ${payload.kind.replace("_", " ")} submission` },
          Body: {
            Text: { Data: `A new ${payload.kind} submission was received. Reference: ${payload.id}. Received at: ${payload.createdAt}. Review it in the secured lead store.` }
          }
        }
      }
    }));
  }
};