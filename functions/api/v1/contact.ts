import { handleSubmission } from "../../_shared/handlers";
import type { PagesContext } from "../../_shared/types";

export async function onRequest(context: PagesContext): Promise<Response> {
  return handleSubmission(context.request, context.env, "contact");
}
