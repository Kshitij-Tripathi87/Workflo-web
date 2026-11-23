import { randomUUID } from "node:crypto";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "";

export class HttpInputError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = "HttpInputError";
  }
}

export function json(statusCode: number, body: unknown, event?: APIGatewayProxyEventV2): APIGatewayProxyResultV2 {
  const origin = event?.headers.origin ?? "";
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    vary: "Origin",
  };
  if (allowedOrigin && origin === allowedOrigin) {
    headers["access-control-allow-origin"] = allowedOrigin;
    headers["access-control-allow-methods"] = "POST,GET,OPTIONS";
    headers["access-control-allow-headers"] = "content-type";
  }
  return { statusCode, headers, body: JSON.stringify(body) };
}

export function parseJson(event: APIGatewayProxyEventV2): unknown {
  if (!event.body) throw new HttpInputError(400, "request_body_required");
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  if (Buffer.byteLength(raw, "utf8") > 16_384) throw new HttpInputError(413, "payload_too_large");
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpInputError(400, "invalid_json");
  }
}

export function requestId(event: APIGatewayProxyEventV2): string {
  return event.requestContext.requestId || randomUUID();
}
