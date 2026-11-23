import { randomUUID } from "node:crypto";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { z } from "zod";
import { HttpInputError, json, parseJson, requestId } from "../shared/http.js";
import { persistSubmission, submissionExpiryEpoch } from "../shared/storage.js";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160).optional().default(""),
  role: z.string().trim().max(120).optional().default(""),
  inquiryType: z.enum(["product", "security", "partnership", "privacy", "other"]),
  message: z.string().trim().min(10).max(5000),
  consentToReply: z.literal(true),
  website: z.string().max(0).optional().default("")
}).strict();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const id = requestId(event);
  try {
    if (event.requestContext.http.method === "OPTIONS") return json(204, {}, event);
    if (event.requestContext.http.method !== "POST") return json(405, { error: "method_not_allowed", requestId: id }, event);
    const input = schema.safeParse(parseJson(event));
    if (!input.success) return json(400, { error: "invalid_request", issues: input.error.flatten(), requestId: id }, event);
    if (input.data.website) return json(202, { accepted: true, requestId: id }, event);

    const record = {
      id: randomUUID(),
      kind: "contact" as const,
      createdAt: new Date().toISOString(),
      expiresAt: submissionExpiryEpoch(),
      status: "received" as const,
      payload: {
        name: input.data.name,
        email: input.data.email,
        company: input.data.company,
        role: input.data.role,
        inquiryType: input.data.inquiryType,
        message: input.data.message,
        consentToReply: true
      }
    };
    await persistSubmission(record);
    return json(202, { accepted: true, reference: record.id, requestId: id }, event);
  } catch (error) {
    const inputError = error instanceof HttpInputError ? error : undefined;
    console.error(JSON.stringify({ event: "contact_submission_failed", requestId: id, name: error instanceof Error ? error.name : "unknown" }));
    return json(inputError?.statusCode ?? 503, { error: inputError?.message ?? "submission_unavailable", requestId: id }, event);
  }
};