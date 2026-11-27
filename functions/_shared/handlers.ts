import { createRequestId, HttpInputError, isSameOrigin, jsonResponse, optionsResponse, parseJson } from "./http";
import { persistSubmission, submissionExpiryEpoch, type SubmissionKind } from "./submissions";
import type { Env } from "./types";
import { validateContact, validateEarlyAccess } from "./validation";

export async function handleSubmission(
  request: Request,
  env: Env,
  kind: SubmissionKind,
): Promise<Response> {
  const id = createRequestId();
  const method = request.method.toUpperCase();

  if (!isSameOrigin(request)) {
    return jsonResponse(403, { error: "origin_not_allowed", requestId: id }, request, id);
  }
  if (method === "OPTIONS") return optionsResponse(request, id);
  if (method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed", requestId: id }, request, id);
  }

  try {
    const body = await parseJson(request);
    const validation = kind === "contact" ? validateContact(body) : validateEarlyAccess(body);
    if (!validation.success) {
      return jsonResponse(
        400,
        { error: "invalid_request", issues: validation.issues, requestId: id },
        request,
        id,
      );
    }

    const input = validation.data;
    if (input.website) {
      return jsonResponse(202, { accepted: true, requestId: id }, request, id);
    }

    const reference = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const { website: _honeypot, ...payload } = input;
    await persistSubmission(
      env.DB,
      reference,
      kind,
      payload,
      createdAt,
      submissionExpiryEpoch(env),
    );

    return jsonResponse(
      202,
      { accepted: true, reference, requestId: id },
      request,
      id,
    );
  } catch (error) {
    const inputError = error instanceof HttpInputError ? error : undefined;
    console.error(JSON.stringify({
      event: `${kind}_submission_failed`,
      requestId: id,
      name: error instanceof Error ? error.name : "unknown",
    }));
    return jsonResponse(
      inputError?.statusCode ?? 503,
      { error: inputError?.code ?? "submission_unavailable", requestId: id },
      request,
      id,
    );
  }
}
