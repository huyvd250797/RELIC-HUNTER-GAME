-- RELIC HUNTER V0.7.1 – Save Sync Fix & Offline Retry
-- Adds a tiny sync receipt table so retry uploads can be confirmed idempotently.

CREATE TABLE IF NOT EXISTS sync_receipts (
  run_id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(run_id) REFERENCES run_history(id),
  FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE INDEX IF NOT EXISTS idx_sync_receipts_player_synced
ON sync_receipts(player_id, synced_at DESC);
