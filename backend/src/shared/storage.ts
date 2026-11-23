import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION ?? "ap-south-1";
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
});

export type Submission = {
  id: string;
  kind: "contact" | "early_access";
  createdAt: string;
  expiresAt: number;
  status: "received";
  payload: Record<string, unknown>;
};

export function submissionExpiryEpoch(): number {
  const configuredDays = Number(process.env.SUBMISSION_RETENTION_DAYS ?? "365");
  const retentionDays = Number.isFinite(configuredDays) ? Math.min(3650, Math.max(30, configuredDays)) : 365;
  return Math.floor(Date.now() / 1000) + retentionDays * 24 * 60 * 60;
}

export async function persistSubmission(record: Submission): Promise<void> {
  const tableName = process.env.SUBMISSIONS_TABLE;
  if (!tableName) throw new Error("SUBMISSIONS_TABLE is not configured");
  await ddb.send(new PutCommand({
    TableName: tableName,
    Item: record,
    ConditionExpression: "attribute_not_exists(id)",
  }));
}
