// ==========================================================================
// DB LAYER — SQLite via better-sqlite3 (synchronous, no ORM, easy to read).
// One file, kandang.db, created automatically next to this file on first run.
// ==========================================================================

const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'kandang.db'));
db.pragma('journal_mode = WAL');

// ---------------------------------------------------------------- schema --
db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    sensors TEXT, pakan TEXT, lampu TEXT, suhu_control TEXT, pompa TEXT,
    telur_hari_ini INTEGER DEFAULT 0, telur_last_reset TEXT,
    settings TEXT, esp32_online INTEGER DEFAULT 0, wifi TEXT
  );

  CREATE TABLE IF NOT EXISTS sensor_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER, suhu REAL, kelembapan REAL, ldr INTEGER, water_level REAL
  );

  CREATE TABLE IF NOT EXISTS pakan_riwayat (
    id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, jumlah_gram INTEGER, sumber TEXT
  );
  CREATE TABLE IF NOT EXISTS lampu_riwayat (
    id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, aksi TEXT
  );
  CREATE TABLE IF NOT EXISTS pompa_riwayat (
    id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, aksi TEXT
  );
  CREATE TABLE IF NOT EXISTS telur_riwayat (
    id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, jumlah INTEGER
  );
  CREATE TABLE IF NOT EXISTS riwayat (
    id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, category TEXT, text TEXT
  );
  CREATE TABLE IF NOT EXISTS notifikasi (
    id TEXT PRIMARY KEY, ts INTEGER, type TEXT, title TEXT, message TEXT, level TEXT, read INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS jadwal (
    id TEXT PRIMARY KEY, type TEXT, time TEXT, label TEXT, active INTEGER DEFAULT 1
  );
`);

// ------------------------------------------------------------ seed once --
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

if (!db.prepare('SELECT id FROM app_state WHERE id = 1').get()) {
  db.prepare(`
    INSERT INTO app_state (id, sensors, pakan, lampu, suhu_control, pompa, telur_hari_ini, telur_last_reset, settings, esp32_online, wifi)
    VALUES (1, ?, ?, ?, ?, ?, 0, ?, ?, 0, ?)
  `).run(
    JSON.stringify(DEFAULTS.sensors), JSON.stringify(DEFAULTS.pakan), JSON.stringify(DEFAULTS.lampu),
    JSON.stringify(DEFAULTS.suhuControl), JSON.stringify(DEFAULTS.pompa), todayStr(),
    JSON.stringify(DEFAULTS.settings), JSON.stringify(DEFAULTS.wifi)
  );
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function newId() { return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

// ------------------------------------------------------- app_state (r/w) --
function getRawState() { return db.prepare('SELECT * FROM app_state WHERE id = 1').get(); }

function mergeJsonColumn(column, partial) {
  const row = getRawState();
  const current = JSON.parse(row[column] || '{}');
  const merged = Object.assign(current, partial);
  db.prepare(`UPDATE app_state SET ${column} = ? WHERE id = 1`).run(JSON.stringify(merged));
  return merged;
}

function updateSensors(partial) {
  const merged = mergeJsonColumn('sensors', partial);
  db.prepare('INSERT INTO sensor_history (ts, suhu, kelembapan, ldr, water_level) VALUES (?,?,?,?,?)')
    .run(Date.now(), merged.suhu ?? null, merged.kelembapan ?? null, merged.ldr ?? null, merged.waterLevel ?? null);
  return merged;
}
function updatePakan(partial) { return mergeJsonColumn('pakan', partial); }
function updateLampu(partial) { return mergeJsonColumn('lampu', partial); }
function updateSuhuControl(partial) { return mergeJsonColumn('suhu_control', partial); }
function updatePompa(partial) { return mergeJsonColumn('pompa', partial); }
function updateSettings(partial) { return mergeJsonColumn('settings', partial); }
function setEsp32Online(online) { db.prepare('UPDATE app_state SET esp32_online = ? WHERE id = 1').run(online ? 1 : 0); }
function setWifi(partial) { return mergeJsonColumn('wifi', partial); }

function ensureTelurDayFresh() {
  const row = getRawState();
  const today = todayStr();
  if (row.telur_last_reset !== today) {
    db.prepare('UPDATE app_state SET telur_hari_ini = 0, telur_last_reset = ? WHERE id = 1').run(today);
  }
}
function addTelurEvent(jumlah) {
  ensureTelurDayFresh();
  db.prepare('INSERT INTO telur_riwayat (ts, jumlah) VALUES (?, ?)').run(Date.now(), jumlah);
  db.prepare('UPDATE app_state SET telur_hari_ini = telur_hari_ini + ? WHERE id = 1').run(jumlah);
}
function getTelurHariIni() { ensureTelurDayFresh(); return getRawState().telur_hari_ini; }

// ------------------------------------------------------------- riwayat --
function addRiwayat({ category, text }) {
  db.prepare('INSERT INTO riwayat (ts, category, text) VALUES (?,?,?)').run(Date.now(), category, text);
  // keep table bounded
  db.prepare(`DELETE FROM riwayat WHERE id NOT IN (SELECT id FROM riwayat ORDER BY ts DESC LIMIT 1000)`).run();
}
function listRiwayat({ limit = 50, category = null } = {}) {
  const rows = category
    ? db.prepare('SELECT * FROM riwayat WHERE category = ? ORDER BY ts DESC LIMIT ?').all(category, limit)
    : db.prepare('SELECT * FROM riwayat ORDER BY ts DESC LIMIT ?').all(limit);
  return rows.map((r) => ({ id: String(r.id), t: r.ts, category: r.category, text: r.text }));
}

// ----------------------------------------------------------- notifikasi --
function addNotifikasi({ type, title, message, level }) {
  const id = newId();
  db.prepare('INSERT INTO notifikasi (id, ts, type, title, message, level, read) VALUES (?,?,?,?,?,?,0)')
    .run(id, Date.now(), type, title, message, level);
  return { id, t: Date.now(), type, title, message, level, read: false };
}
function listNotifikasi(limit = 50) {
  return db.prepare('SELECT * FROM notifikasi ORDER BY ts DESC LIMIT ?').all(limit)
    .map((r) => ({ id: r.id, t: r.ts, type: r.type, title: r.title, message: r.message, level: r.level, read: !!r.read }));
}
function markNotifRead(id) { db.prepare('UPDATE notifikasi SET read = 1 WHERE id = ?').run(id); }

// ---------------------------------------------------------------- jadwal --
function listJadwal() {
  return db.prepare('SELECT * FROM jadwal ORDER BY time ASC').all()
    .map((r) => ({ id: r.id, type: r.type, time: r.time, label: r.label, active: !!r.active }));
}
function addJadwal({ type, time, label, active = true }) {
  const id = newId();
  db.prepare('INSERT INTO jadwal (id, type, time, label, active) VALUES (?,?,?,?,?)').run(id, type, time, label, active ? 1 : 0);
  return { id, type, time, label, active };
}
function updateJadwal(id, partial) {
  const existing = db.prepare('SELECT * FROM jadwal WHERE id = ?').get(id);
  if (!existing) return null;
  const merged = { ...existing, ...partial };
  db.prepare('UPDATE jadwal SET type=?, time=?, label=?, active=? WHERE id=?')
    .run(merged.type, merged.time, merged.label, merged.active ? 1 : 0, id);
  return merged;
}
function deleteJadwal(id) { db.prepare('DELETE FROM jadwal WHERE id = ?').run(id); }

// ----------------------------------------------------------- pakan/lampu/pompa events --
function addPakanEvent({ jumlahGram, sumber }) {
  db.prepare('INSERT INTO pakan_riwayat (ts, jumlah_gram, sumber) VALUES (?,?,?)').run(Date.now(), jumlahGram, sumber || 'Otomatis');
}
function listPakanRiwayat(limit = 30) {
  return db.prepare('SELECT * FROM pakan_riwayat ORDER BY ts DESC LIMIT ?').all(limit)
    .map((r) => ({ id: String(r.id), t: r.ts, jumlahGram: r.jumlah_gram, sumber: r.sumber }));
}
function addLampuEvent(aksi) { db.prepare('INSERT INTO lampu_riwayat (ts, aksi) VALUES (?,?)').run(Date.now(), aksi); }
function listLampuRiwayat(limit = 30) {
  return db.prepare('SELECT * FROM lampu_riwayat ORDER BY ts DESC LIMIT ?').all(limit)
    .map((r) => ({ id: String(r.id), t: r.ts, aksi: r.aksi }));
}
function addPompaEvent(aksi) { db.prepare('INSERT INTO pompa_riwayat (ts, aksi) VALUES (?,?)').run(Date.now(), aksi); }
function listPompaRiwayat(limit = 30) {
  return db.prepare('SELECT * FROM pompa_riwayat ORDER BY ts DESC LIMIT ?').all(limit)
    .map((r) => ({ id: String(r.id), t: r.ts, aksi: r.aksi }));
}

// ------------------------------------------------------------ history/stats --
function getSensorHistory(hours = 24) {
  const since = Date.now() - hours * 3600 * 1000;
  return db.prepare('SELECT * FROM sensor_history WHERE ts >= ? ORDER BY ts ASC').all(since);
}
function getTelurRiwayat(limit = 20) {
  return db.prepare('SELECT * FROM telur_riwayat ORDER BY ts DESC LIMIT ?').all(limit)
    .map((r) => ({ t: r.ts, jumlah: r.jumlah }));
}
function getTelurPerHari(days = 7) {
  const rows = db.prepare(`
    SELECT date(ts / 1000, 'unixepoch', 'localtime') AS day, SUM(jumlah) AS total
    FROM telur_riwayat
    WHERE ts >= ?
    GROUP BY day ORDER BY day ASC
  `).all(Date.now() - days * 86400 * 1000);
  const labels = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return rows.map((r) => ({ label: labels[new Date(r.day).getDay()], val: r.total }));
}

// --------------------------------------------------------- full snapshot --
function getFullState() {
  const raw = getRawState();
  return {
    sensors: JSON.parse(raw.sensors),
    pakan: JSON.parse(raw.pakan),
    lampu: JSON.parse(raw.lampu),
    suhuControl: JSON.parse(raw.suhu_control),
    pompa: JSON.parse(raw.pompa),
    telur: { hariIni: getTelurHariIni(), riwayatDeteksi: getTelurRiwayat(20), perHari: getTelurPerHari(7) },
    settings: JSON.parse(raw.settings),
    esp32: { online: !!raw.esp32_online },
    wifi: JSON.parse(raw.wifi),
    jadwal: listJadwal(),
    riwayat: listRiwayat({ limit: 50 }),
    notifikasi: listNotifikasi(30),
  };
}

module.exports = {
  db, getFullState,
  updateSensors, updatePakan, updateLampu, updateSuhuControl, updatePompa, updateSettings,
  setEsp32Online, setWifi,
  addTelurEvent, getTelurHariIni, getTelurRiwayat, getTelurPerHari,
  addRiwayat, listRiwayat,
  addNotifikasi, listNotifikasi, markNotifRead,
  listJadwal, addJadwal, updateJadwal, deleteJadwal,
  addPakanEvent, listPakanRiwayat, addLampuEvent, listLampuRiwayat, addPompaEvent, listPompaRiwayat,
  getSensorHistory,
};
