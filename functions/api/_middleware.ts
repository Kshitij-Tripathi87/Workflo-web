import { createRequestId, jsonResponse } from "../_shared/http";
import type { PagesContext } from "../_shared/types";

export async function onRequest(context: PagesContext): Promise<Response> {
  const requestId = createRequestId();

  try {
    if (!context.next) {
      return jsonResponse(404, { error: "not_found", requestId }, context.request, requestId);
    }

    const response = await context.next();
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("text/html")) {
      return jsonResponse(404, { error: "not_found", requestId }, context.request, requestId);
    }
    return response;
  } catch (error) {
    console.error(JSON.stringify({
      event: "api_unhandled_error",
      requestId,
      name: error instanceof Error ? error.name : "unknown",
    }));
    return jsonResponse(500, { error: "internal_error", requestId }, context.request, requestId);
  }
}
