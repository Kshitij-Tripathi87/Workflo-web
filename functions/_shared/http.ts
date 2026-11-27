import type { PagesContext } from "./types";

export const MAX_BODY_BYTES = 16_384;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

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

export function securityHeaders(request: Request, requestId: string): Headers {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    "x-request-id": requestId,
    vary: "Origin",
  });

  const origin = request.headers.get("origin");
  if (origin && origin === new URL(request.url).origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST,GET,OPTIONS");
    headers.set("access-control-allow-headers", "content-type,idempotency-key");
  }

  return headers;
}

export function jsonResponse(
  status: number,
  body: unknown,
  request: Request,
  requestId: string,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: securityHeaders(request, requestId),
  });
}

export function optionsResponse(request: Request, requestId: string): Response {
  const headers = securityHeaders(request, requestId);
  headers.delete("content-type");
  if (headers.has("access-control-allow-origin")) {
    headers.set("access-control-max-age", "600");
  }

  return new Response(null, { status: 204, headers });
}

export function parseIdempotencyKey(request: Request): string | undefined {
  const raw = request.headers.get("idempotency-key");
  if (raw === null) return undefined;
  const trimmed = raw.trim();
  if (!IDEMPOTENCY_KEY_PATTERN.test(trimmed)) {
    throw new HttpInputError(400, "invalid_idempotency_key");
  }
  return trimmed;
}

export async function sha256Hex(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
