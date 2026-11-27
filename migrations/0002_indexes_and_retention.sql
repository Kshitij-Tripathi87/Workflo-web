PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS submission_events (
  id TEXT PRIMARY KEY NOT NULL,
  submission_id TEXT NOT NULL
    REFERENCES submissions (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  detail_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submission_events_submission_created
  ON submission_events (submission_id, created_at);

CREATE TABLE IF NOT EXISTS api_idempotency (
  idempotency_key TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'early_access')),
  submission_id TEXT NOT NULL
    REFERENCES submissions (id) ON DELETE CASCADE,
  request_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (idempotency_key, kind)
);

CREATE INDEX IF NOT EXISTS idx_api_idempotency_expiry
  ON api_idempotency (expires_at);

CREATE TABLE IF NOT EXISTS retention_runs (
  id TEXT PRIMARY KEY NOT NULL,
  ran_at TEXT NOT NULL,
  deleted_submissions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('ok', 'error')),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_notification_status
  ON submissions (notification_status, created_at);
