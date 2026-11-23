import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { json } from "../shared/http.js";

export const handler: APIGatewayProxyHandlerV2 = async (event) =>
  json(200, { status: "ok", service: "workflo-web-api", timestamp: new Date().toISOString() }, event);