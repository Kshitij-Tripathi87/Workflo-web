PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'early_access')),
  created_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received')),
  payload_json TEXT NOT NULL,
  notification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (notification_status IN ('pending', 'sent', 'failed', 'disabled'))
);

CREATE INDEX IF NOT EXISTS idx_submissions_kind_created
  ON submissions (kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_expiry
  ON submissions (expires_at);

CREATE TABLE IF NOT EXISTS notification_outbox (
  id TEXT PRIMARY KEY NOT NULL,
  submission_id TEXT NOT NULL UNIQUE
    REFERENCES submissions (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'disabled')),
  created_at TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  last_error TEXT,
  sent_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_status_created
  ON notification_outbox (status, created_at);
