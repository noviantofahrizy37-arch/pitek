// ==========================================================================
// DB LAYER — Neon Postgres (serverless PostgreSQL)
// Configure DATABASE_URL (or NEON_DATABASE_URL) in a .env file.
// ==========================================================================

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const db = new Pool({
  connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false,
});

db.on('error', (err) => {
  console.error('Unexpected PostgreSQL idle client error:', err.message);
});

const DEFAULTS = {
  sensors: { suhu: null, kelembapan: null, ldr: null, gelap: false, waterLevel: null },
  pakan: { mode: 'auto', targetGram: 250, currentGram: 0, durasiMotorDetik: 4, sisaPersen: 100 },
  lampu: { mode: 'auto', manualOn: false, isOn: false, ldrThreshold: 40 },
  suhuControl: { minC: 24, maxC: 32, mode: 'auto', kipasOn: false },
  pompa: { mode: 'auto', isOn: false, minLevel: 20, maxLevel: 90 },
  settings: {
    namaKandang: 'Kandang Ayam A', thresholdSuhuMin: 24, thresholdSuhuMax: 32,
    thresholdLdr: 40, targetPakanDefault: 250,
  },
  wifi: { connected: false, rssi: -100 },
};

async function initSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      sensors JSONB DEFAULT '{}',
      pakan JSONB DEFAULT '{}',
      lampu JSONB DEFAULT '{}',
      suhu_control JSONB DEFAULT '{}',
      pompa JSONB DEFAULT '{}',
      telur_hari_ini INTEGER DEFAULT 0,
      telur_last_reset TEXT,
      settings JSONB DEFAULT '{}',
      esp32_online BOOLEAN DEFAULT false,
      wifi JSONB DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS sensor_history (
      id SERIAL PRIMARY KEY,
      ts BIGINT,
      suhu DOUBLE PRECISION,
      kelembapan DOUBLE PRECISION,
      ldr INTEGER,
      water_level DOUBLE PRECISION
    );

    CREATE TABLE IF NOT EXISTS pakan_riwayat (
      id SERIAL PRIMARY KEY,
      ts BIGINT,
      jumlah_gram INTEGER,
      sumber TEXT
    );
    CREATE TABLE IF NOT EXISTS lampu_riwayat (
      id SERIAL PRIMARY KEY,
      ts BIGINT,
      aksi TEXT
    );
    CREATE TABLE IF NOT EXISTS pompa_riwayat (
      id SERIAL PRIMARY KEY,
      ts BIGINT,
      aksi TEXT
    );
    CREATE TABLE IF NOT EXISTS telur_riwayat (
      id SERIAL PRIMARY KEY,
      ts BIGINT,
      jumlah INTEGER
    );
    CREATE TABLE IF NOT EXISTS riwayat (
      id SERIAL PRIMARY KEY,
      ts BIGINT,
      category TEXT,
      text TEXT
    );
    CREATE TABLE IF NOT EXISTS notifikasi (
      id TEXT PRIMARY KEY,
      ts BIGINT,
      type TEXT,
      title TEXT,
      message TEXT,
      level TEXT,
      read BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS jadwal (
      id TEXT PRIMARY KEY,
      type TEXT,
      time TEXT,
      label TEXT,
      active BOOLEAN DEFAULT true
    );
  `);

  const existing = await db.query('SELECT 1 FROM app_state WHERE id = 1');
  if (existing.rowCount === 0) {
    await db.query(`
      INSERT INTO app_state (
        id, sensors, pakan, lampu, suhu_control, pompa, telur_hari_ini,
        telur_last_reset, settings, esp32_online, wifi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      1,
      JSON.stringify(DEFAULTS.sensors),
      JSON.stringify(DEFAULTS.pakan),
      JSON.stringify(DEFAULTS.lampu),
      JSON.stringify(DEFAULTS.suhuControl),
      JSON.stringify(DEFAULTS.pompa),
      0,
      todayStr(),
      JSON.stringify(DEFAULTS.settings),
      false,
      JSON.stringify(DEFAULTS.wifi),
    ]);
  }
}

initSchema().catch((err) => {
  console.error('Failed to initialize Neon schema:', err);
});

function todayStr() { return new Date().toISOString().slice(0, 10); }
function newId() { return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function parseJson(value, fallback = {}) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (error) { return fallback; }
  }
  if (typeof value === 'object') return value;
  return fallback;
}

async function getRawState() {
  const { rows } = await db.query('SELECT * FROM app_state WHERE id = 1');
  return rows[0] || null;
}

async function mergeJsonColumn(column, partial) {
  const row = await getRawState();
  const current = parseJson(row && row[column], {});
  const merged = { ...current, ...partial };
  await db.query(`UPDATE app_state SET ${column} = COALESCE(${column}, '{}'::jsonb) || $1::jsonb WHERE id = 1`, [JSON.stringify(merged)]);
  return merged;
}

async function updateSensors(partial) {
  const merged = await mergeJsonColumn('sensors', partial);
  await db.query(
    'INSERT INTO sensor_history (ts, suhu, kelembapan, ldr, water_level) VALUES ($1, $2, $3, $4, $5)',
    [Date.now(), merged.suhu ?? null, merged.kelembapan ?? null, merged.ldr ?? null, merged.waterLevel ?? null]
  );
  return merged;
}
async function updatePakan(partial) { return mergeJsonColumn('pakan', partial); }
async function updateLampu(partial) { return mergeJsonColumn('lampu', partial); }
async function updateSuhuControl(partial) { return mergeJsonColumn('suhu_control', partial); }
async function updatePompa(partial) { return mergeJsonColumn('pompa', partial); }
async function updateSettings(partial) { return mergeJsonColumn('settings', partial); }
async function setEsp32Online(online) {
  await db.query('UPDATE app_state SET esp32_online = $1 WHERE id = 1', [Boolean(online)]);
}
async function setWifi(partial) { return mergeJsonColumn('wifi', partial); }

async function ensureTelurDayFresh() {
  const row = await getRawState();
  const today = todayStr();
  if (!row || row.telur_last_reset !== today) {
    await db.query('UPDATE app_state SET telur_hari_ini = 0, telur_last_reset = $1 WHERE id = 1', [today]);
  }
}

async function addTelurEvent(jumlah) {
  await ensureTelurDayFresh();
  await db.query('INSERT INTO telur_riwayat (ts, jumlah) VALUES ($1, $2)', [Date.now(), jumlah]);
  await db.query('UPDATE app_state SET telur_hari_ini = telur_hari_ini + $1 WHERE id = 1', [jumlah]);
}

async function getTelurHariIni() {
  await ensureTelurDayFresh();
  const row = await getRawState();
  return Number(row?.telur_hari_ini || 0);
}

async function addRiwayat({ category, text }) {
  await db.query('INSERT INTO riwayat (ts, category, text) VALUES ($1, $2, $3)', [Date.now(), category, text]);
  await db.query(`DELETE FROM riwayat WHERE id NOT IN (SELECT id FROM riwayat ORDER BY ts DESC LIMIT 1000)`);
}

async function listRiwayat({ limit = 50, category = null } = {}) {
  const query = category
    ? 'SELECT * FROM riwayat WHERE category = $1 ORDER BY ts DESC LIMIT $2'
    : 'SELECT * FROM riwayat ORDER BY ts DESC LIMIT $1';
  const params = category ? [category, Number(limit)] : [Number(limit)];
  const { rows } = await db.query(query, params);
  return rows.map((r) => ({ id: String(r.id), t: r.ts, category: r.category, text: r.text }));
}

async function addNotifikasi({ type, title, message, level }) {
  const id = newId();
  const now = Date.now();
  await db.query('INSERT INTO notifikasi (id, ts, type, title, message, level, read) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id, now, type, title, message, level, false]);
  return { id, t: now, type, title, message, level, read: false };
}

async function listNotifikasi(limit = 50) {
  const { rows } = await db.query('SELECT * FROM notifikasi ORDER BY ts DESC LIMIT $1', [Number(limit)]);
  return rows.map((r) => ({ id: r.id, t: r.ts, type: r.type, title: r.title, message: r.message, level: r.level, read: Boolean(r.read) }));
}

async function markNotifRead(id) {
  await db.query('UPDATE notifikasi SET read = true WHERE id = $1', [id]);
}

async function listJadwal() {
  const { rows } = await db.query('SELECT * FROM jadwal ORDER BY time ASC');
  return rows.map((r) => ({ id: r.id, type: r.type, time: r.time, label: r.label, active: Boolean(r.active) }));
}

async function addJadwal({ type, time, label, active = true }) {
  const id = newId();
  await db.query('INSERT INTO jadwal (id, type, time, label, active) VALUES ($1, $2, $3, $4, $5)', [id, type, time, label, Boolean(active)]);
  return { id, type, time, label, active };
}

async function updateJadwal(id, partial) {
  const existing = await db.query('SELECT * FROM jadwal WHERE id = $1', [id]);
  if (existing.rowCount === 0) return null;
  const merged = { ...existing.rows[0], ...partial };
  await db.query('UPDATE jadwal SET type = $1, time = $2, label = $3, active = $4 WHERE id = $5', [merged.type, merged.time, merged.label, Boolean(merged.active), id]);
  return merged;
}

async function deleteJadwal(id) {
  await db.query('DELETE FROM jadwal WHERE id = $1', [id]);
}

async function addPakanEvent({ jumlahGram, sumber }) {
  await db.query('INSERT INTO pakan_riwayat (ts, jumlah_gram, sumber) VALUES ($1, $2, $3)', [Date.now(), jumlahGram, sumber || 'Otomatis']);
}

async function listPakanRiwayat(limit = 30) {
  const { rows } = await db.query('SELECT * FROM pakan_riwayat ORDER BY ts DESC LIMIT $1', [Number(limit)]);
  return rows.map((r) => ({ id: String(r.id), t: r.ts, jumlahGram: r.jumlah_gram, sumber: r.sumber }));
}

async function addLampuEvent(aksi) {
  await db.query('INSERT INTO lampu_riwayat (ts, aksi) VALUES ($1, $2)', [Date.now(), aksi]);
}

async function listLampuRiwayat(limit = 30) {
  const { rows } = await db.query('SELECT * FROM lampu_riwayat ORDER BY ts DESC LIMIT $1', [Number(limit)]);
  return rows.map((r) => ({ id: String(r.id), t: r.ts, aksi: r.aksi }));
}

async function addPompaEvent(aksi) {
  await db.query('INSERT INTO pompa_riwayat (ts, aksi) VALUES ($1, $2)', [Date.now(), aksi]);
}

async function listPompaRiwayat(limit = 30) {
  const { rows } = await db.query('SELECT * FROM pompa_riwayat ORDER BY ts DESC LIMIT $1', [Number(limit)]);
  return rows.map((r) => ({ id: String(r.id), t: r.ts, aksi: r.aksi }));
}

async function getSensorHistory(hours = 24) {
  const since = Date.now() - hours * 3600 * 1000;
  const { rows } = await db.query('SELECT * FROM sensor_history WHERE ts >= $1 ORDER BY ts ASC', [since]);
  return rows;
}

async function getTelurRiwayat(limit = 20) {
  const { rows } = await db.query('SELECT * FROM telur_riwayat ORDER BY ts DESC LIMIT $1', [Number(limit)]);
  return rows.map((r) => ({ t: r.ts, jumlah: r.jumlah }));
}

async function getTelurPerHari(days = 7) {
  const since = Date.now() - days * 86400 * 1000;
  const { rows } = await db.query(`
    SELECT date(to_timestamp(ts / 1000)) AS day, SUM(jumlah) AS total
    FROM telur_riwayat
    WHERE ts >= $1
    GROUP BY date(to_timestamp(ts / 1000))
    ORDER BY day ASC
  `, [since]);
  const labels = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return rows.map((row) => ({
    label: labels[new Date(row.day).getDay()],
    val: Number(row.total || 0),
  }));
}

async function getFullState() {
  const raw = await getRawState();
  if (!raw) return { sensors: {}, pakan: {}, lampu: {}, suhuControl: {}, pompa: {}, telur: { hariIni: 0, riwayatDeteksi: [], perHari: [] }, settings: {}, esp32: { online: false }, wifi: {}, jadwal: [], riwayat: [], notifikasi: [] };

  return {
    sensors: parseJson(raw.sensors, {}),
    pakan: parseJson(raw.pakan, {}),
    lampu: parseJson(raw.lampu, {}),
    suhuControl: parseJson(raw.suhu_control, {}),
    pompa: parseJson(raw.pompa, {}),
    telur: {
      hariIni: await getTelurHariIni(),
      riwayatDeteksi: await getTelurRiwayat(20),
      perHari: await getTelurPerHari(7),
    },
    settings: parseJson(raw.settings, {}),
    esp32: { online: Boolean(raw.esp32_online) },
    wifi: parseJson(raw.wifi, {}),
    jadwal: await listJadwal(),
    riwayat: await listRiwayat({ limit: 50 }),
    notifikasi: await listNotifikasi(30),
  };
}

module.exports = {
  db,
  getFullState,
  updateSensors,
  updatePakan,
  updateLampu,
  updateSuhuControl,
  updatePompa,
  updateSettings,
  setEsp32Online,
  setWifi,
  addTelurEvent,
  getTelurHariIni,
  getTelurRiwayat,
  getTelurPerHari,
  addRiwayat,
  listRiwayat,
  addNotifikasi,
  listNotifikasi,
  markNotifRead,
  listJadwal,
  addJadwal,
  updateJadwal,
  deleteJadwal,
  addPakanEvent,
  listPakanRiwayat,
  addLampuEvent,
  listLampuRiwayat,
  addPompaEvent,
  listPompaRiwayat,
  getSensorHistory,
};
