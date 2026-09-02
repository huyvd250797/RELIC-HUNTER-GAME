-- RELIC HUNTER V0.7.1 – Cloud Save + Workers + D1

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT 'KAI',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS run_history (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('WIN','LOSE')),
  world TEXT NOT NULL DEFAULT 'World 1 - Whispering Forest',
  version TEXT NOT NULL DEFAULT '0.7.1',
  time_ms INTEGER NOT NULL DEFAULT 0,
  kills INTEGER NOT NULL DEFAULT 0,
  elites INTEGER NOT NULL DEFAULT 0,
  boss_defeated INTEGER NOT NULL DEFAULT 0,
  relics_json TEXT NOT NULL DEFAULT '[]',
  relics_collected INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  damage_taken INTEGER NOT NULL DEFAULT 0,
  best_combo INTEGER NOT NULL DEFAULT 0,
  puzzle_seals INTEGER NOT NULL DEFAULT 0,
  root_gate_opened INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE INDEX IF NOT EXISTS idx_run_history_player_created
ON run_history(player_id, created_at DESC);

CREATE TABLE IF NOT EXISTS player_progress (
  player_id TEXT PRIMARY KEY,
  total_runs INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  total_coins INTEGER NOT NULL DEFAULT 0,
  boss_defeats INTEGER NOT NULL DEFAULT 0,
  best_time_ms INTEGER,
  most_relics INTEGER NOT NULL DEFAULT 0,
  highest_damage_dealt INTEGER NOT NULL DEFAULT 0,
  relics_discovered_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(player_id) REFERENCES players(id)
);


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
