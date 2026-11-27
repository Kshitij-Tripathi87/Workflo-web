import type { PagesContext } from "./types";

export const MAX_BODY_BYTES = 16_384;

export class HttpInputError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(code);
    this.name = "HttpInputError";
  }
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export function jsonResponse(
  status: number,
  body: unknown,
  request: Request,
  requestId: string,
): Response {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    "x-request-id": requestId,
    vary: "Origin",
  });

  const origin = request.headers.get("origin");
  if (origin && origin === new URL(request.url).origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST,GET,OPTIONS");
    headers.set("access-control-allow-headers", "content-type");
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export function optionsResponse(request: Request, requestId: string): Response {
  const headers = new Headers({
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "x-request-id": requestId,
    vary: "Origin",
  });

  const origin = request.headers.get("origin");
  if (origin && origin === new URL(request.url).origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST,GET,OPTIONS");
    headers.set("access-control-allow-headers", "content-type");
    headers.set("access-control-max-age", "600");
  }

  return new Response(null, { status: 204, headers });
}

export async function parseJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new HttpInputError(413, "payload_too_large");
  }

  const raw = await request.text();
  if (!raw) throw new HttpInputError(400, "request_body_required");
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    throw new HttpInputError(413, "payload_too_large");
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new HttpInputError(400, "invalid_json");
  }
}

export function isPagesContext(value: unknown): value is PagesContext {
  return typeof value === "object" && value !== null && "request" in value && "env" in value;
}
