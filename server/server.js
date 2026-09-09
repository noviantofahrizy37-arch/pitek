// ==========================================================================
// SERVER — Express (REST API + serves the dashboard static files) and a
// WebSocket hub on the same HTTP server/port. See db.js for persistence
// and the top of ../js/websocket-client.js for the dashboard-facing
// protocol this implements. The ESP32-facing half is documented below.
// ==========================================================================
//
// ESP32 ⟷ BACKEND protocol
// -------------------------
// Identical message shapes to the Dashboard ⟷ Backend protocol documented
// in js/websocket-client.js, with these ESP32-specific additions the
// backend understands on top:
//
//   ESP32 → Backend (in addition to sensor_update/pakan_status/etc.):
//     { "type": "pakan_event", "data": { "jumlahGram": 180, "sumber": "Otomatis" } }
//     { "type": "lampu_event", "data": { "aksi": "Lampu ON — otomatis (gelap)" } }
//     { "type": "pompa_event", "data": { "aksi": "Pompa ON — level rendah" } }
//   These log a row to the relevant *_riwayat table AND the combined
//   riwayat table, then get broadcast to dashboards as riwayat_entry +
//   the corresponding *_status. Continuous readings (pakan_status,
//   lampu_status, suhu_status, pompa_status, sensor_update) should be
//   sent often (e.g. every 1-5s); the *_event messages only when a
//   discrete thing happens (a feeding completes, a relay flips, etc).
//
//   Every ESP32 connection MUST start with:
//     { "type": "hello", "role": "esp32" }
//   Every Dashboard connection sends the same with "role": "dashboard".
//   The backend uses this single "hello" to decide how to treat the
//   socket — there is no separate auth in this starter (see README for
//   notes on adding an API key before exposing this beyond your LAN).
//
//   Backend → ESP32: forwards the dashboard's commands verbatim (same
//   "type"/"payload" shape documented in js/websocket-client.js).
// ==========================================================================

const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const db = require('./db');

const PORT = process.env.PORT || 3001;
const FRONTEND_DIR = path.join(__dirname, '..'); // the kandang-ayam/ folder (index.html, css/, js/)

const app = express();
app.use(express.json());
app.use(express.static(FRONTEND_DIR));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// ------------------------------------------------------------- clients --
const dashboards = new Set();
const esp32s = new Set();

function broadcastToDashboards(type, data) {
  const msg = JSON.stringify({ type, data });
  dashboards.forEach((ws) => { if (ws.readyState === ws.OPEN) ws.send(msg); });
}
function forwardToEsp32(type, payload) {
  const msg = JSON.stringify({ type, payload });
  esp32s.forEach((ws) => { if (ws.readyState === ws.OPEN) ws.send(msg); });
}
async function logAndBroadcastRiwayat(category, text) {
  await db.addRiwayat({ category, text });
  broadcastToDashboards('riwayat_entry', { category, text });
}

wss.on('connection', (ws) => {
  ws.role = null;

  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }

    if (msg.type === 'hello') {
      ws.role = msg.role === 'esp32' ? 'esp32' : 'dashboard';
      if (ws.role === 'esp32') {
        esp32s.add(ws);
        await db.setEsp32Online(true);
        broadcastToDashboards('esp32_status', { online: true });
        await logAndBroadcastRiwayat('sistem', 'ESP32 tersambung ke backend');
      } else {
        dashboards.add(ws);
        ws.send(JSON.stringify({ type: 'state_snapshot', data: await db.getFullState() }));
      }
      return;
    }

    if (ws.role === 'esp32') await handleEsp32Message(msg);
    else if (ws.role === 'dashboard') await handleDashboardMessage(msg);
  });

  ws.on('close', async () => {
    if (ws.role === 'esp32') {
      esp32s.delete(ws);
      if (esp32s.size === 0) {
        await db.setEsp32Online(false);
        broadcastToDashboards('esp32_status', { online: false });
        await logAndBroadcastRiwayat('sistem', 'ESP32 terputus dari backend');
        await db.addNotifikasi({ type: 'esp32_offline', title: 'ESP32 terputus', message: 'Perangkat kehilangan koneksi ke backend.', level: 'danger' });
        broadcastToDashboards('notifikasi', { notifType: 'esp32_offline', title: 'ESP32 terputus', message: 'Perangkat kehilangan koneksi ke backend.', level: 'danger' });
      }
    } else if (ws.role === 'dashboard') {
      dashboards.delete(ws);
    }
  });
});

// ---------------------------------------------------- ESP32 -> backend --
async function handleEsp32Message(msg) {
  const { type, data = {} } = msg;
  switch (type) {
    case 'sensor_update': {
      const merged = await db.updateSensors(data);
      broadcastToDashboards('sensor_update', merged);
      break;
    }
    case 'pakan_status': {
      const merged = await db.updatePakan(data);
      broadcastToDashboards('pakan_status', merged);
      break;
    }
    case 'pakan_event': {
      await db.addPakanEvent({ jumlahGram: data.jumlahGram, sumber: data.sumber || 'Otomatis' });
      await logAndBroadcastRiwayat('pakan', `Pakan diberikan (${data.jumlahGram}g) — ${data.sumber || 'otomatis'}`);
      broadcastToDashboards('pakan_status', await db.updatePakan({ currentGram: data.jumlahGram }));
      break;
    }
    case 'lampu_status': {
      const merged = await db.updateLampu(data);
      broadcastToDashboards('lampu_status', merged);
      break;
    }
    case 'lampu_event': {
      await db.addLampuEvent(data.aksi);
      await logAndBroadcastRiwayat('lampu', data.aksi);
      break;
    }
    case 'suhu_status': {
      const merged = await db.updateSuhuControl(data);
      broadcastToDashboards('suhu_status', merged);
      break;
    }
    case 'pompa_status': {
      const merged = await db.updatePompa(data);
      broadcastToDashboards('pompa_status', merged);
      break;
    }
    case 'pompa_event': {
      await db.addPompaEvent(data.aksi);
      await logAndBroadcastRiwayat('pompa', data.aksi);
      break;
    }
    case 'telur_detected': {
      await db.addTelurEvent(data.jumlah || 1);
      await logAndBroadcastRiwayat('telur', `${data.jumlah || 1} telur baru terdeteksi`);
      broadcastToDashboards('telur_detected', { t: Date.now(), jumlah: data.jumlah || 1 });
      break;
    }
    case 'riwayat_entry':
      await logAndBroadcastRiwayat(data.category, data.text);
      break;
    case 'notifikasi': {
      await db.addNotifikasi({ type: data.notifType, title: data.title, message: data.message, level: data.level });
      broadcastToDashboards('notifikasi', data);
      break;
    }
    case 'wifi_status': {
      const merged = await db.setWifi(data);
      broadcastToDashboards('wifi_status', merged);
      break;
    }
    default: break;
  }
}

// -------------------------------------------------- Dashboard -> backend --
async function handleDashboardMessage(msg) {
  const { type, payload = {} } = msg;
  switch (type) {
    case 'feed_now':
      forwardToEsp32('feed_now');
      break;
    case 'set_pakan_mode':
      broadcastToDashboards('pakan_status', await db.updatePakan({ mode: payload.mode }));
      forwardToEsp32('set_pakan_mode', payload);
      break;
    case 'set_pakan_config':
      broadcastToDashboards('pakan_status', await db.updatePakan(payload));
      forwardToEsp32('set_pakan_config', payload);
      break;
    case 'set_lampu_mode':
      broadcastToDashboards('lampu_status', await db.updateLampu({ mode: payload.mode }));
      forwardToEsp32('set_lampu_mode', payload);
      break;
    case 'set_lampu_manual':
      broadcastToDashboards('lampu_status', await db.updateLampu({ manualOn: payload.on, isOn: payload.on }));
      forwardToEsp32('set_lampu_manual', payload);
      break;
    case 'set_lampu_threshold':
      broadcastToDashboards('lampu_status', await db.updateLampu(payload));
      forwardToEsp32('set_lampu_threshold', payload);
      break;
    case 'set_suhu_config':
      broadcastToDashboards('suhu_status', await db.updateSuhuControl(payload));
      forwardToEsp32('set_suhu_config', payload);
      break;
    case 'set_kipas_manual':
      broadcastToDashboards('suhu_status', await db.updateSuhuControl({ kipasOn: payload.on }));
      forwardToEsp32('set_kipas_manual', payload);
      break;
    case 'set_pompa_mode':
      broadcastToDashboards('pompa_status', await db.updatePompa({ mode: payload.mode }));
      forwardToEsp32('set_pompa_mode', payload);
      break;
    case 'set_pompa_manual':
      broadcastToDashboards('pompa_status', await db.updatePompa({ isOn: payload.on }));
      forwardToEsp32('set_pompa_manual', payload);
      break;
    case 'set_pompa_threshold':
      broadcastToDashboards('pompa_status', await db.updatePompa(payload));
      forwardToEsp32('set_pompa_threshold', payload);
      break;
    case 'add_jadwal':
      await db.addJadwal(payload);
      broadcastToDashboards('jadwal_sync', { jadwal: await db.listJadwal() });
      forwardToEsp32('add_jadwal', payload);
      break;
    case 'update_jadwal':
      await db.updateJadwal(payload.id, payload);
      broadcastToDashboards('jadwal_sync', { jadwal: await db.listJadwal() });
      forwardToEsp32('update_jadwal', payload);
      break;
    case 'delete_jadwal':
      await db.deleteJadwal(payload.id);
      broadcastToDashboards('jadwal_sync', { jadwal: await db.listJadwal() });
      forwardToEsp32('delete_jadwal', payload);
      break;
    case 'update_settings':
      broadcastToDashboards('settings_sync', { settings: await db.updateSettings(payload) });
      break;
    case 'calibrate_sensor':
      await logAndBroadcastRiwayat('sistem', `Kalibrasi sensor ${payload.sensor} diminta`);
      forwardToEsp32('calibrate_sensor', payload);
      break;
    case 'mark_notif_read':
      await db.markNotifRead(payload.id);
      break;
    default: break;
  }
}

// -------------------------------------------------------------- REST API --
app.get('/api/state', async (req, res) => res.json(await db.getFullState()));

app.get('/api/riwayat', async (req, res) => {
  res.json(await db.listRiwayat({ limit: +req.query.limit || 50, category: req.query.category || null }));
});
app.get('/api/notifikasi', async (req, res) => res.json(await db.listNotifikasi(+req.query.limit || 50)));
app.post('/api/notifikasi/:id/read', (req, res) => { db.markNotifRead(req.params.id); res.json({ ok: true }); });

app.get('/api/jadwal', (req, res) => res.json(db.listJadwal()));
app.post('/api/jadwal', (req, res) => res.json(db.addJadwal(req.body)));
app.put('/api/jadwal/:id', (req, res) => res.json(db.updateJadwal(req.params.id, req.body)));
app.delete('/api/jadwal/:id', (req, res) => { db.deleteJadwal(req.params.id); res.json({ ok: true }); });

app.get('/api/pakan/riwayat', (req, res) => res.json(db.listPakanRiwayat(+req.query.limit || 30)));
app.get('/api/lampu/riwayat', (req, res) => res.json(db.listLampuRiwayat(+req.query.limit || 30)));
app.get('/api/pompa/riwayat', (req, res) => res.json(db.listPompaRiwayat(+req.query.limit || 30)));
app.get('/api/telur/riwayat', (req, res) => res.json(db.getTelurRiwayat(+req.query.limit || 20)));
app.get('/api/telur/per-hari', (req, res) => res.json(db.getTelurPerHari(+req.query.days || 7)));

app.get('/api/sensors/history', (req, res) => res.json(db.getSensorHistory(+req.query.hours || 24)));

app.get('/api/settings', (req, res) => res.json(db.getFullState().settings));
app.put('/api/settings', (req, res) => res.json(db.updateSettings(req.body)));

server.listen(PORT, () => {
  console.log(`KandangKu backend running: http://localhost:${PORT}  (WebSocket at ws://localhost:${PORT}/ws)`);
});
