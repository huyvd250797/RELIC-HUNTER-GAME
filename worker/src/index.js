const json = (data, status = 200, cors = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...cors
    }
  });

const corsHeaders = (env, request) => {
  const configured = env.ALLOWED_ORIGIN || '*';
  const origin = request.headers.get('Origin') || '*';
  const allowOrigin = configured === '*' ? '*' : configured.split(',').map(x => x.trim()).includes(origin) ? origin : configured.split(',')[0].trim();
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RelicHunter-Idempotency-Key',
    'Access-Control-Max-Age': '86400'
  };
};

const cleanText = (value, fallback = '') => String(value ?? fallback).slice(0, 200);
const asInt = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : fallback;
const asBoolInt = (value) => value ? 1 : 0;

async function upsertProgress(env, playerId, run) {
  const current = await env.DB.prepare('SELECT * FROM player_progress WHERE player_id = ?').bind(playerId).first();
  const oldRelics = current ? JSON.parse(current.relics_discovered_json || '[]') : [];
  const nextRelics = [...new Set([...oldRelics, ...(Array.isArray(run.relics) ? run.relics : [])])];
  const result = cleanText(run.result, 'LOSE') === 'WIN' ? 'WIN' : 'LOSE';
  const timeMs = asInt(run.timeMs);
  const bestTime = result === 'WIN'
    ? (current?.best_time_ms == null ? timeMs : Math.min(current.best_time_ms, timeMs))
    : current?.best_time_ms ?? null;

  const data = {
    totalRuns: (current?.total_runs || 0) + 1,
    wins: (current?.wins || 0) + (result === 'WIN' ? 1 : 0),
    totalCoins: (current?.total_coins || 0) + asInt(run.coinsEarned),
    bossDefeats: (current?.boss_defeats || 0) + (run.bossDefeated ? 1 : 0),
    bestTime,
    mostRelics: Math.max(current?.most_relics || 0, asInt(run.relicsCollected, Array.isArray(run.relics) ? run.relics.length : 0)),
    highestDamageDealt: Math.max(current?.highest_damage_dealt || 0, asInt(run.damageDealt)),
    relicsJson: JSON.stringify(nextRelics)
  };

  await env.DB.prepare(`
    INSERT INTO player_progress (
      player_id,total_runs,wins,total_coins,boss_defeats,best_time_ms,most_relics,highest_damage_dealt,relics_discovered_json,updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(player_id) DO UPDATE SET
      total_runs=excluded.total_runs,
      wins=excluded.wins,
      total_coins=excluded.total_coins,
      boss_defeats=excluded.boss_defeats,
      best_time_ms=excluded.best_time_ms,
      most_relics=excluded.most_relics,
      highest_damage_dealt=excluded.highest_damage_dealt,
      relics_discovered_json=excluded.relics_discovered_json,
      updated_at=CURRENT_TIMESTAMP
  `).bind(
    playerId,
    data.totalRuns,
    data.wins,
    data.totalCoins,
    data.bossDefeats,
    data.bestTime,
    data.mostRelics,
    data.highestDamageDealt,
    data.relicsJson
  ).run();

  return data;
}

async function handleSaveRun(request, env, cors) {
  const body = await request.json().catch(() => null);
  if (!body || !body.playerId || !body.run) return json({ ok: false, error: 'Invalid payload' }, 400, cors);

  const playerId = cleanText(body.playerId, 'LOCAL');
  const playerName = cleanText(body.playerName, 'KAI');
  const run = body.run || {};
  const result = cleanText(run.result, 'LOSE') === 'WIN' ? 'WIN' : 'LOSE';
  const relics = Array.isArray(run.relics) ? run.relics.map(x => cleanText(x)).slice(0, 30) : [];
  const runId = cleanText(run.id, `${playerId}-${Date.now()}`);
  const idempotencyKey = cleanText(request.headers.get('X-RelicHunter-Idempotency-Key') || run.idempotencyKey || `${playerId}:${runId}`);

  const existing = await env.DB.prepare('SELECT id, player_id, result FROM run_history WHERE id = ?').bind(runId).first();
  const duplicate = !!existing;

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO players (id, display_name, created_at, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name, updated_at=CURRENT_TIMESTAMP
    `).bind(playerId, playerName),
    env.DB.prepare(`
      INSERT INTO run_history (
        id, player_id, result, world, version, time_ms, kills, elites, boss_defeated,
        relics_json, relics_collected, coins_earned, damage_dealt, damage_taken,
        best_combo, puzzle_seals, root_gate_opened, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        result=excluded.result,
        time_ms=excluded.time_ms,
        kills=excluded.kills,
        elites=excluded.elites,
        boss_defeated=excluded.boss_defeated,
        relics_json=excluded.relics_json,
        relics_collected=excluded.relics_collected,
        coins_earned=excluded.coins_earned,
        damage_dealt=excluded.damage_dealt,
        damage_taken=excluded.damage_taken,
        best_combo=excluded.best_combo,
        puzzle_seals=excluded.puzzle_seals,
        root_gate_opened=excluded.root_gate_opened
    `).bind(
      runId,
      playerId,
      result,
      cleanText(run.world, 'World 1 - Whispering Forest'),
      cleanText(run.version, '0.7.1'),
      asInt(run.timeMs),
      asInt(run.kills),
      asInt(run.elites),
      asBoolInt(run.bossDefeated),
      JSON.stringify(relics),
      asInt(run.relicsCollected, relics.length),
      asInt(run.coinsEarned),
      asInt(run.damageDealt),
      asInt(run.damageTaken),
      asInt(run.bestCombo),
      asInt(run.puzzleSeals),
      asBoolInt(run.rootGateOpened),
      cleanText(run.createdAt, new Date().toISOString())
    )
  ]);

  // V0.7.1 receipt is optional-safe. If migration 0002 has not been applied yet,
  // the save still succeeds and the client will still mark the run as synced.
  let receiptSaved = false;
  try {
    await env.DB.prepare(`
      INSERT INTO sync_receipts (run_id, player_id, idempotency_key, synced_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(run_id) DO UPDATE SET
        player_id=excluded.player_id,
        idempotency_key=excluded.idempotency_key,
        synced_at=CURRENT_TIMESTAMP
    `).bind(runId, playerId, idempotencyKey).run();
    receiptSaved = true;
  } catch (error) {
    receiptSaved = false;
  }

  let progress;
  if (!duplicate) {
    progress = await upsertProgress(env, playerId, { ...run, result, relics });
  } else {
    progress = await env.DB.prepare('SELECT * FROM player_progress WHERE player_id = ?').bind(playerId).first();
  }

  return json({
    ok: true,
    mode: 'cloud',
    version: '0.7.1',
    duplicate,
    idempotent: true,
    receiptSaved,
    runId,
    playerId,
    progress,
    syncedAt: new Date().toISOString()
  }, 200, cors);
}

async function handleGetProgress(url, env, cors) {
  const playerId = cleanText(url.searchParams.get('playerId'), '');
  if (!playerId) return json({ ok: false, error: 'Missing playerId' }, 400, cors);
  const row = await env.DB.prepare('SELECT * FROM player_progress WHERE player_id = ?').bind(playerId).first();
  return json({ ok: true, progress: row || null }, 200, cors);
}

async function handleGetRuns(url, env, cors) {
  const playerId = cleanText(url.searchParams.get('playerId'), '');
  const limit = Math.min(50, Math.max(1, asInt(url.searchParams.get('limit'), 20)));
  if (!playerId) return json({ ok: false, error: 'Missing playerId' }, 400, cors);
  const { results } = await env.DB.prepare(
    'SELECT * FROM run_history WHERE player_id = ? ORDER BY created_at DESC LIMIT ?'
  ).bind(playerId, limit).all();
  return json({ ok: true, runs: results || [] }, 200, cors);
}

async function handleSyncStatus(url, env, cors) {
  const runId = cleanText(url.searchParams.get('runId'), '');
  if (!runId) return json({ ok: false, error: 'Missing runId' }, 400, cors);
  try {
    const receipt = await env.DB.prepare('SELECT * FROM sync_receipts WHERE run_id = ?').bind(runId).first();
    if (receipt) return json({ ok: true, synced: true, receipt }, 200, cors);
  } catch (error) {
    // Migration 0002 might not exist yet; fall back to run_history.
  }
  const row = await env.DB.prepare('SELECT id, player_id, created_at FROM run_history WHERE id = ?').bind(runId).first();
  return json({ ok: true, synced: !!row, receipt: row || null, fallback: true }, 200, cors);
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env, request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/health') {
        return json({ ok: true, service: 'relic-hunter-cloud-save', version: '0.7.1' }, 200, cors);
      }
      if (url.pathname === '/api/runs' && request.method === 'POST') return handleSaveRun(request, env, cors);
      if (url.pathname === '/api/progress' && request.method === 'GET') return handleGetProgress(url, env, cors);
      if (url.pathname === '/api/runs' && request.method === 'GET') return handleGetRuns(url, env, cors);
      if (url.pathname === '/api/sync-status' && request.method === 'GET') return handleSyncStatus(url, env, cors);
      return json({ ok: false, error: 'Not found' }, 404, cors);
    } catch (error) {
      return json({ ok: false, error: error?.message || 'Server error' }, 500, cors);
    }
  }
};
