import type { DynamoDBStreamHandler } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION ?? "ap-south-1" });

export const handler: DynamoDBStreamHandler = async (event) => {
  const queueUrl = process.env.NOTIFICATION_QUEUE_URL;
  if (!queueUrl) throw new Error("NOTIFICATION_QUEUE_URL is not configured");

  for (const record of event.Records) {
    if (record.eventName !== "INSERT") continue;
    const image = record.dynamodb?.NewImage;
    const id = image?.id?.S;
    const kind = image?.kind?.S;
    const createdAt = image?.createdAt?.S;
    if (!id || !createdAt || (kind !== "contact" && kind !== "early_access")) continue;

    // The submission is already durable in DynamoDB. Stream retries and the
    // failure destination protect the notification path from transient faults.
    await sqs.send(new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ id, kind, createdAt }),
      MessageGroupId: kind,
      MessageDeduplicationId: id,
    }));
  }
};
