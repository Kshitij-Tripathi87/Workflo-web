import type { D1Database, Env } from "./types";

export type SubmissionKind = "contact" | "early_access";

export async function persistSubmission(
  db: D1Database,
  id: string,
  kind: SubmissionKind,
  payload: Record<string, unknown>,
  createdAt: string,
  expiresAt: number,
): Promise<void> {
  const insertSubmission = db.prepare(
    `INSERT INTO submissions
      (id, kind, created_at, expires_at, status, payload_json, notification_status)
     VALUES (?, ?, ?, ?, 'received', ?, 'pending')`,
  ).bind(id, kind, createdAt, expiresAt, JSON.stringify(payload));

  const insertOutbox = db.prepare(
    `INSERT INTO notification_outbox
      (id, submission_id, status, created_at, attempt_count)
     VALUES (?, ?, 'pending', ?, 0)`,
  ).bind(crypto.randomUUID(), id, createdAt);

  const results = await db.batch([insertSubmission, insertOutbox]);
  if (results.length !== 2 || results.some((result) => !result.success)) {
    throw new Error("submission_persistence_failed");
  }
}

export function submissionExpiryEpoch(env: Env): number {
  const configuredDays = Number(env.SUBMISSION_RETENTION_DAYS ?? "365");
  const retentionDays = Number.isFinite(configuredDays)
    ? Math.min(3650, Math.max(30, configuredDays))
    : 365;
  return Math.floor(Date.now() / 1000) + retentionDays * 24 * 60 * 60;
}
