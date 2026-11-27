import { createRequestId, isSameOrigin, jsonResponse, optionsResponse } from "../../_shared/http";
import type { PagesContext } from "../../_shared/types";

export async function onRequest(context: PagesContext): Promise<Response> {
  const request = context.request;
  const id = createRequestId();

  if (!isSameOrigin(request)) {
    return jsonResponse(403, { error: "origin_not_allowed", requestId: id }, request, id);
  }
  if (request.method.toUpperCase() === "OPTIONS") return optionsResponse(request, id);
  if (request.method.toUpperCase() !== "GET") {
    return jsonResponse(405, { error: "method_not_allowed", requestId: id }, request, id);
  }

  return jsonResponse(200, {
    status: "ok",
    service: "workflo-web-api",
    timestamp: new Date().toISOString(),
  }, request, id);
}
