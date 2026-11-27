import { cleanupExpiredSubmissions } from "../functions/_shared/submissions";
import type { D1Database } from "../functions/_shared/types";

export interface RetentionWorkerEnv {
  STAGING_DB?: D1Database;
  PRODUCTION_DB?: D1Database;
}

export interface ScheduledControllerLike {
  scheduledTime: number;
  cron: string;
}

export interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

export async function runScheduledCleanup(env: RetentionWorkerEnv, nowEpoch?: number) {
  const results: Record<string, { deletedSubmissions: number }> = {};

  if (env.STAGING_DB) {
    results.staging = await cleanupExpiredSubmissions(env.STAGING_DB, nowEpoch);
  }
  if (env.PRODUCTION_DB) {
    results.production = await cleanupExpiredSubmissions(env.PRODUCTION_DB, nowEpoch);
  }

  return results;
}

export default {
  async fetch(): Promise<Response> {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },

  async scheduled(
    _controller: ScheduledControllerLike,
    env: RetentionWorkerEnv,
    ctx: ExecutionContextLike,
  ): Promise<void> {
    ctx.waitUntil(
      runScheduledCleanup(env).then((summary) => {
        console.log(JSON.stringify({ event: "retention_cleanup_completed", summary }));
      }),
    );
  },
};
