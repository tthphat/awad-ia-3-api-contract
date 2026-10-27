CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  status INTEGER NOT NULL,
  location TEXT,
  body TEXT,
  created_at TEXT NOT NULL
);
