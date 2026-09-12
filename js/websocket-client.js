// ==========================================================================
// WEBSOCKET CLIENT
// ==========================================================================
//
// PROTOCOL — share this block with whoever writes the ESP32 firmware.
//
// Every message, both directions, is a single JSON object with a "type"
// field. The dashboard never assumes field order and ignores unknown
// fields, so the firmware can add fields later without breaking the UI.
//
// ─── ESP32 → DASHBOARD (server pushes) ──────────────────────────────────
//
//  { "type": "state_snapshot", "data": { ...full state, sent once right
//      after the socket opens, so the UI isn't empty until the next
//      sensor tick. Shape mirrors the individual update messages below,
//      nested under the same keys (sensors, pakan, lampu, suhuControl,
//      pompa, telur, jadwal, notifikasi, riwayat). } }
//
//  { "type": "sensor_update", "data": {
//      "suhu": 29.4, "kelembapan": 68, "ldr": 320, "gelap": false,
//      "waterLevel": 74 } }
//
//  { "type": "pakan_status", "data": {
//      "mode": "auto", "currentGram": 180, "sisaPersen": 62 } }
//
//  { "type": "lampu_status", "data": {
//      "mode": "auto", "isOn": true } }
//
//  { "type": "suhu_status", "data": {
//      "kipasOn": true } }
//
//  { "type": "pompa_status", "data": {
//      "isOn": false, "waterLevel": 74 } }
//
//  { "type": "telur_detected", "data": {
//      "t": 1717999999000, "jumlah": 1 } }
//
//  { "type": "riwayat_entry", "data": {
//      "category": "pakan", "text": "Pakan diberikan (180g)" } }
//
//  { "type": "notifikasi", "data": {
//      "notifType": "pakan_habis", "title": "Pakan hampir habis",
//      "message": "Sisa pakan 8%, segera isi ulang.", "level": "warn" } }
//
//  { "type": "esp32_status", "data": { "online": true } }
//  { "type": "wifi_status",  "data": { "connected": true, "rssi": -58 } }
//
// ─── DASHBOARD → ESP32 (commands) ───────────────────────────────────────
//
//  { "type": "feed_now" }
//  { "type": "set_pakan_mode",   "payload": { "mode": "auto" } }
//  { "type": "set_pakan_config", "payload": { "targetGram": 250, "durasiMotorDetik": 4 } }
//
//  { "type": "set_lampu_mode",      "payload": { "mode": "manual" } }
//  { "type": "set_lampu_manual",    "payload": { "on": true } }
//  { "type": "set_lampu_threshold", "payload": { "ldrThreshold": 40 } }
//
//  { "type": "set_suhu_config",  "payload": { "minC": 24, "maxC": 32, "mode": "auto" } }
//  { "type": "set_kipas_manual", "payload": { "on": true } }
//
//  { "type": "set_pompa_mode",      "payload": { "mode": "auto" } }
//  { "type": "set_pompa_manual",    "payload": { "on": true } }
//  { "type": "set_pompa_threshold", "payload": { "minLevel": 20, "maxLevel": 90 } }
//
//  { "type": "add_jadwal",    "payload": { "jenis": "pakan", "waktu": "06:00", "label": "Pagi", "active": true } }
//  { "type": "update_jadwal", "payload": { "id": "...", "active": false } }
//  { "type": "delete_jadwal", "payload": { "id": "..." } }
//
//  { "type": "update_settings", "payload": { "namaKandang": "...", ... } }
//  { "type": "calibrate_sensor", "payload": { "sensor": "loadcell" | "ldr" } }
//  { "type": "mark_notif_read",  "payload": { "id": "..." } }
//
// All outgoing commands are also stamped with a "ts" (client timestamp,
// ms) by sendCommand() below.
// ==========================================================================

const KandangSocket = (() => {
  let ws = null;
  let attempts = 0;
  let reconnectTimer = null;
  let manuallyClosed = false;
  let demoStop = null; // set to the MockData stop() fn when demo mode is active

  function currentUrl() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.wsUrl) || CONFIG.DEFAULT_WS_URL;
  }

  function setUrl(url) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.wsUrl, url);
    attempts = 0;
    reconnect(true);
  }

  function connect() {
    manuallyClosed = false;
    const url = currentUrl();
    Store.patch('connection', { status: 'connecting', wsUrl: url });

    try {
      ws = new WebSocket(url);
    } catch (e) {
      handleFailure();
      return;
    }

    ws.onopen = () => {
      const wasDown = Store.get().connection.status !== 'online';
      attempts = 0;
      stopDemoIfRunning();
      Store.patch('connection', { status: 'online', wsUrl: url, demo: false });
      Store.patch('esp32', { online: true });
      if (wasDown) Store.addRiwayat({ category: 'sistem', text: 'ESP32 tersambung' });
    };

    ws.onmessage = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch (e) { return; }
      handleIncoming(msg);
    };

    ws.onerror = () => { /* onclose fires right after; handled there */ };

    ws.onclose = () => {
      const wasOnline = Store.get().connection.status === 'online';
      Store.patch('esp32', { online: false });
      if (wasOnline && !manuallyClosed) {
        Store.addNotifikasi({ type: 'esp32_offline', title: 'ESP32 terputus', message: 'Koneksi ke perangkat terputus, mencoba menghubungkan kembali…', level: 'danger' });
        Store.addRiwayat({ category: 'sistem', text: 'ESP32 terputus dari dashboard' });
      }
      if (!manuallyClosed) handleFailure();
    };
  }

  function handleFailure() {
    attempts += 1;
    Store.patch('connection', { status: 'offline' });
    if (attempts >= CONFIG.DEMO_FALLBACK_ATTEMPTS && !demoStop) {
      startDemo();
    }
    const delay = Math.min(CONFIG.RECONNECT_BASE_MS * attempts, CONFIG.RECONNECT_MAX_MS);
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, delay);
  }

  function startDemo() {
    Store.patch('connection', { status: 'demo', demo: true });
    demoStop = MockData.start();
  }
  function stopDemoIfRunning() {
    if (demoStop) { demoStop(); demoStop = null; }
  }

  // Public controls for demo mode (useful from settings UI)
  function startDemoPublic() {
    if (!demoStop) startDemo();
  }
  function stopDemoPublic() {
    stopDemoIfRunning();
    Store.patch('connection', { status: 'offline', demo: false });
  }

  function reconnect(immediate = false) {
    clearTimeout(reconnectTimer);
    stopDemoIfRunning();
    if (ws) { manuallyClosed = true; try { ws.close(); } catch (e) {} }
    attempts = 0;
    if (immediate) connect(); else reconnectTimer = setTimeout(connect, 300);
  }

  function sendCommand(type, payload) {
    const msg = JSON.stringify({ type, payload, ts: Date.now() });
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
      return true;
    }
    // In demo mode / offline: apply optimistically to the local mock so
    // the UI still responds, but flag that it never reached real hardware.
    if (Store.get().connection.demo) MockData.applyCommand(type, payload);
    Toast.show(
      Store.get().connection.demo
        ? 'Mode demo — perintah disimulasikan, belum terkirim ke ESP32 asli.'
        : 'Tidak terhubung ke ESP32 — perintah belum terkirim.',
      Store.get().connection.demo ? 'info' : 'danger'
    );
    return false;
  }

  function handleIncoming(msg) {
    const { type, data } = msg;
    switch (type) {
      case 'state_snapshot':
        if (data.sensors) Store.patch('sensors', data.sensors);
        if (data.pakan) Store.patch('pakan', data.pakan);
        if (data.lampu) Store.patch('lampu', data.lampu);
        if (data.suhuControl) Store.patch('suhuControl', data.suhuControl);
        if (data.pompa) Store.patch('pompa', data.pompa);
        if (data.telur) Store.patch('telur', data.telur);
        if (data.jadwal) { Store.get().jadwal = data.jadwal; Store.notify('jadwal'); }
        if (data.riwayat) { Store.get().riwayat = data.riwayat; Store.notify('riwayat'); }
        if (data.notifikasi) { Store.get().notifikasi = data.notifikasi; Store.notify('notifikasi'); }
        break;
      case 'sensor_update':
        Store.patch('sensors', data);
        if (typeof data.suhu === 'number') Store.pushCapped(Store.get().sensors.suhuHistory, { t: Date.now(), v: data.suhu });
        if (typeof data.kelembapan === 'number') Store.pushCapped(Store.get().sensors.kelembapanHistory, { t: Date.now(), v: data.kelembapan });
        if (typeof data.waterLevel === 'number') Store.pushCapped(Store.get().sensors.waterLevelHistory, { t: Date.now(), v: data.waterLevel });
        break;
      case 'pakan_status': Store.patch('pakan', data); break;
      case 'lampu_status': Store.patch('lampu', data); break;
      case 'suhu_status': Store.patch('suhuControl', data); break;
      case 'pompa_status': Store.patch('pompa', data); break;
      case 'telur_detected':
        Store.get().telur.hariIni += (data.jumlah || 1);
        Store.pushCapped(Store.get().telur.riwayatDeteksi, { t: data.t || Date.now(), jumlah: data.jumlah || 1 });
        Store.notify('telur');
        break;
      case 'riwayat_entry': Store.addRiwayat(data); break;
      case 'notifikasi':
        Store.addNotifikasi({ type: data.notifType, title: data.title, message: data.message, level: data.level });
        Toast.show(data.title, data.level === 'danger' ? 'danger' : 'info');
        break;
      case 'esp32_status': Store.patch('esp32', data); break;
      case 'wifi_status': Store.patch('wifi', data); break;
      default: break;
    }
  }

  return { connect, reconnect, setUrl, currentUrl, sendCommand, startDemo: startDemoPublic, stopDemo: stopDemoPublic };
})();
