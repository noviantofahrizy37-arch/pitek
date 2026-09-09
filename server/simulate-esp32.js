// ==========================================================================
// ESP32 SIMULATOR — connects to the backend exactly like real firmware
// would (role: "esp32"), sends realistic periodic data, and reacts to
// commands from the dashboard. Run this alongside `npm start` to test
// the whole pipeline (device → backend → SQLite → dashboard) with zero
// hardware. Not meant for production — it's a stand-in for firmware
// during development.
//
// Usage:  npm run simulate   (from the server/ folder, backend must be running)
// ==========================================================================

const WebSocket = require('ws');

const URL = process.env.SIM_URL || 'ws://localhost:3001/ws';

let state = {
  suhu: 29.4, kelembapan: 68, ldr: 320, waterLevel: 74,
  pakanMode: 'auto', lampuMode: 'auto', lampuOn: false, ldrThreshold: 40,
  suhuMode: 'auto', suhuMin: 24, suhuMax: 32, kipasOn: false,
  pompaMode: 'auto', pompaOn: false, pompaMin: 20, pompaMax: 90,
};

function connect() {
  const ws = new WebSocket(URL);

  ws.on('open', () => {
    console.log('[simulator] connected to backend as ESP32');
    ws.send(JSON.stringify({ type: 'hello', role: 'esp32' }));
    startLoop(ws);
  });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }
    handleCommand(ws, msg);
  });

  ws.on('close', () => {
    console.log('[simulator] disconnected, retrying in 3s...');
    setTimeout(connect, 3000);
  });
  ws.on('error', () => {});
}

function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function send(ws, type, data) { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type, data })); }

function startLoop(ws) {
  setInterval(() => {
    // Random-walk the sensors
    state.suhu = clamp(+(state.suhu + rand(-0.3, 0.3)).toFixed(1), 22, 36);
    state.kelembapan = clamp(Math.round(state.kelembapan + rand(-1.5, 1.5)), 40, 90);
    state.ldr = clamp(Math.round(state.ldr + rand(-15, 15)), 0, 800);
    state.waterLevel = clamp(Math.round(state.waterLevel + rand(-1, 0.5)), 5, 100);
    const gelap = state.ldr < state.ldrThreshold * 8;

    send(ws, 'sensor_update', { suhu: state.suhu, kelembapan: state.kelembapan, ldr: state.ldr, gelap, waterLevel: state.waterLevel });

    // Auto behaviours mirroring the flowchart logic
    if (state.lampuMode === 'auto' && gelap !== state.lampuOn) {
      state.lampuOn = gelap;
      send(ws, 'lampu_status', { mode: 'auto', isOn: state.lampuOn });
      send(ws, 'lampu_event', { aksi: `Lampu ${state.lampuOn ? 'ON' : 'OFF'} — otomatis (${gelap ? 'gelap' : 'terang'})` });
    }
    if (state.suhuMode === 'auto') {
      const shouldFan = state.suhu > state.suhuMax;
      if (shouldFan !== state.kipasOn) { state.kipasOn = shouldFan; send(ws, 'suhu_status', { kipasOn: state.kipasOn }); }
    }
    if (state.pompaMode === 'auto') {
      const shouldPump = state.waterLevel < state.pompaMin;
      if (shouldPump !== state.pompaOn) {
        state.pompaOn = shouldPump;
        send(ws, 'pompa_status', { isOn: state.pompaOn });
        send(ws, 'pompa_event', { aksi: `Pompa ${state.pompaOn ? 'ON' : 'OFF'} — otomatis (level ${state.waterLevel}%)` });
      }
    }
  }, 4000);

  // Occasional egg detection
  setInterval(() => {
    if (Math.random() < 0.3) send(ws, 'telur_detected', { jumlah: 1 + Math.floor(Math.random() * 2) });
  }, 30000);
}

function handleCommand(ws, msg) {
  const { type, payload = {} } = msg;
  console.log('[simulator] command received:', type, payload);
  switch (type) {
    case 'feed_now':
      send(ws, 'pakan_event', { jumlahGram: 250, sumber: 'Manual' });
      break;
    case 'set_pakan_mode': state.pakanMode = payload.mode; break;
    case 'set_lampu_mode': state.lampuMode = payload.mode; break;
    case 'set_lampu_manual':
      state.lampuOn = payload.on;
      send(ws, 'lampu_status', { isOn: payload.on });
      send(ws, 'lampu_event', { aksi: `Lampu ${payload.on ? 'ON' : 'OFF'} — manual` });
      break;
    case 'set_lampu_threshold': state.ldrThreshold = payload.ldrThreshold; break;
    case 'set_suhu_config':
      state.suhuMin = payload.minC; state.suhuMax = payload.maxC; state.suhuMode = payload.mode;
      break;
    case 'set_kipas_manual': state.kipasOn = payload.on; send(ws, 'suhu_status', { kipasOn: payload.on }); break;
    case 'set_pompa_mode': state.pompaMode = payload.mode; break;
    case 'set_pompa_manual':
      state.pompaOn = payload.on;
      send(ws, 'pompa_status', { isOn: payload.on });
      send(ws, 'pompa_event', { aksi: `Pompa ${payload.on ? 'ON' : 'OFF'} — manual` });
      break;
    case 'set_pompa_threshold': state.pompaMin = payload.minLevel; state.pompaMax = payload.maxLevel; break;
    case 'calibrate_sensor':
      send(ws, 'riwayat_entry', { category: 'sistem', text: `Kalibrasi ${payload.sensor} selesai` });
      break;
    default: break;
  }
}

connect();
