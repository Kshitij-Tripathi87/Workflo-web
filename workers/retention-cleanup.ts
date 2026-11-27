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

export type RetentionTargetResult =
  | { status: "fulfilled"; deletedSubmissions: number }
  | { status: "rejected"; error: string };

export interface RetentionSummary {
  staging?: RetentionTargetResult;
  production?: RetentionTargetResult;
  hasFailures: boolean;
}

export async function runScheduledCleanup(
  env: RetentionWorkerEnv,
  nowEpoch?: number,
): Promise<RetentionSummary> {
  const targets: Array<{ name: "staging" | "production"; db: D1Database }> = [];
  if (env.STAGING_DB) targets.push({ name: "staging", db: env.STAGING_DB });
  if (env.PRODUCTION_DB) targets.push({ name: "production", db: env.PRODUCTION_DB });

  const settlements = await Promise.allSettled(
    targets.map((target) => cleanupExpiredSubmissions(target.db, nowEpoch)),
  );

  const summary: RetentionSummary = { hasFailures: false };

  settlements.forEach((result, idx) => {
    const targetName = targets[idx].name;
    if (result.status === "fulfilled") {
      summary[targetName] = {
        status: "fulfilled",
        deletedSubmissions: result.value.deletedSubmissions,
      };
    } else {
      summary.hasFailures = true;
      const errorMsg =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason ?? "retention_cleanup_failed");
      summary[targetName] = {
        status: "rejected",
        error: errorMsg,
      };
      console.error(
        JSON.stringify({
          event: "retention_cleanup_target_failed",
          database: targetName,
          error: errorMsg,
        }),
      );
    }
  });

  return summary;
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
        if (summary.hasFailures) {
          console.error(
            JSON.stringify({
              event: "retention_cleanup_finished_with_failures",
              summary,
            }),
          );
        } else {
          console.log(
            JSON.stringify({
              event: "retention_cleanup_completed",
              summary,
            }),
          );
        }
      }),
    );
  },
};
