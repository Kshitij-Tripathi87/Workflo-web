import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const region = process.env.AWS_REGION ?? "ap-south-1";
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
});
const sqs = new SQSClient({ region });

export type Submission = {
  id: string;
  kind: "contact" | "early_access";
  createdAt: string;
  status: "received";
  payload: Record<string, unknown>;
};

export async function persistSubmission(record: Submission): Promise<void> {
  const tableName = process.env.SUBMISSIONS_TABLE;
  if (!tableName) throw new Error("SUBMISSIONS_TABLE is not configured");
  await ddb.send(new PutCommand({
    TableName: tableName,
    Item: record,
    ConditionExpression: "attribute_not_exists(id)",
  }));
}

export async function enqueueNotification(record: Submission): Promise<void> {
  const queueUrl = process.env.NOTIFICATION_QUEUE_URL;
  if (!queueUrl) throw new Error("NOTIFICATION_QUEUE_URL is not configured");
  await sqs.send(new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ id: record.id, kind: record.kind, createdAt: record.createdAt }),
    MessageGroupId: record.kind,
    MessageDeduplicationId: record.id,
  }));
}