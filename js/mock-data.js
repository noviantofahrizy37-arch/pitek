// ==========================================================================
// MOCK DATA — makes the dashboard feel alive before real hardware is
// connected. seed() runs once on load so the UI is never empty; start()
// begins a light random-walk simulation used only while connection.demo
// is true (see websocket-client.js). Swap CONFIG.DEFAULT_WS_URL to your
// ESP32 and all of this quietly stops being used.
// ==========================================================================

const MockData = (() => {
  let interval = null;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function seed() {
    const s = Store.get();
    const now = Date.now();

    s.sensors.suhu = 29.4;
    s.sensors.kelembapan = 68;
    s.sensors.ldr = 320;
    s.sensors.gelap = false;
    s.sensors.waterLevel = 74;
    for (let i = 23; i >= 0; i--) {
      const t = now - i * 60 * 60 * 1000;
      s.sensors.suhuHistory.push({ t, v: +(28 + Math.sin(i / 3) * 2.5 + rand(-0.4, 0.4)).toFixed(1) });
      s.sensors.kelembapanHistory.push({ t, v: Math.round(65 + Math.cos(i / 4) * 8 + rand(-2, 2)) });
      s.sensors.waterLevelHistory.push({ t, v: clamp(Math.round(80 - i * 0.5 + rand(-2, 2)), 15, 100) });
    }

    s.pakan.currentGram = 180;
    s.pakan.sisaPersen = 62;
    s.pakan.riwayat = [
      { id: Store.cryptoId(), t: now - 3 * 3600e3, jumlahGram: 250, sumber: 'Jadwal Pagi' },
      { id: Store.cryptoId(), t: now - 9 * 3600e3, jumlahGram: 220, sumber: 'Jadwal Siang' },
      { id: Store.cryptoId(), t: now - 27 * 3600e3, jumlahGram: 240, sumber: 'Manual' },
    ];

    s.lampu.isOn = false;
    s.lampu.riwayat = [
      { id: Store.cryptoId(), t: now - 11 * 3600e3, aksi: 'Lampu ON (otomatis — gelap terdeteksi)' },
      { id: Store.cryptoId(), t: now - 2 * 3600e3, aksi: 'Lampu OFF (otomatis — cukup terang)' },
    ];

    s.pompa.isOn = false;
    s.pompa.riwayat = [
      { id: Store.cryptoId(), t: now - 5 * 3600e3, aksi: 'Pompa ON (level air rendah)' },
      { id: Store.cryptoId(), t: now - 4.5 * 3600e3, aksi: 'Pompa OFF (level air cukup)' },
    ];

    s.telur.hariIni = 14;
    s.telur.riwayatDeteksi = [
      { t: now - 1 * 3600e3, jumlah: 2 },
      { t: now - 3 * 3600e3, jumlah: 1 },
      { t: now - 6 * 3600e3, jumlah: 3 },
    ];
    s.telur.perHari = [
      { label: 'Sen', val: 11 }, { label: 'Sel', val: 13 }, { label: 'Rab', val: 9 },
      { label: 'Kam', val: 15 }, { label: 'Jum', val: 12 }, { label: 'Sab', val: 16 }, { label: 'Ming', val: 14 },
    ];

    s.jadwal = [
      { id: Store.cryptoId(), type: 'pakan', time: '06:00', label: 'Pakan Pagi', active: true },
      { id: Store.cryptoId(), type: 'pakan', time: '17:00', label: 'Pakan Sore', active: true },
      { id: Store.cryptoId(), type: 'lampu', time: '05:30', label: 'Lampu Nyala', active: true },
      { id: Store.cryptoId(), type: 'lampu', time: '18:30', label: 'Lampu Mati', active: false },
    ];

    s.riwayat = [
      { id: Store.cryptoId(), t: now - 0.2 * 3600e3, category: 'pakan', text: 'Pakan diberikan (180g) — otomatis' },
      { id: Store.cryptoId(), t: now - 2 * 3600e3, category: 'lampu', text: 'Lampu OFF — kondisi terang' },
      { id: Store.cryptoId(), t: now - 4.5 * 3600e3, category: 'pompa', text: 'Pompa OFF — level air cukup' },
      { id: Store.cryptoId(), t: now - 5 * 3600e3, category: 'pompa', text: 'Pompa ON — level air rendah' },
      { id: Store.cryptoId(), t: now - 6 * 3600e3, category: 'telur', text: '3 telur baru terdeteksi' },
      { id: Store.cryptoId(), t: now - 9 * 3600e3, category: 'pakan', text: 'Pakan diberikan (220g) — jadwal siang' },
      { id: Store.cryptoId(), t: now - 11 * 3600e3, category: 'lampu', text: 'Lampu ON — kondisi gelap' },
      { id: Store.cryptoId(), t: now - 20 * 3600e3, category: 'sistem', text: 'ESP32 tersambung kembali' },
    ];

    s.notifikasi = [
      { id: Store.cryptoId(), t: now - 1.5 * 3600e3, type: 'pakan_rendah', title: 'Pakan menipis', message: 'Sisa pakan tinggal 62%, pertimbangkan isi ulang dalam 1-2 hari.', level: 'warn', read: false },
      { id: Store.cryptoId(), t: now - 20 * 3600e3, category: 'sistem', type: 'esp32_reconnect', title: 'ESP32 tersambung kembali', message: 'Koneksi sempat terputus ± 3 menit.', level: 'info', read: true },
    ];

    Store.notify('sensors'); Store.notify('pakan'); Store.notify('lampu'); Store.notify('pompa');
    Store.notify('telur'); Store.notify('jadwal'); Store.notify('riwayat'); Store.notify('notifikasi');
  }

  function tick() {
    const s = Store.get();
    const now = Date.now();

    s.sensors.suhu = clamp(+(s.sensors.suhu + rand(-0.3, 0.3)).toFixed(1), 22, 36);
    s.sensors.kelembapan = clamp(Math.round(s.sensors.kelembapan + rand(-1.5, 1.5)), 40, 90);
    s.sensors.ldr = clamp(Math.round(s.sensors.ldr + rand(-15, 15)), 0, 800);
    s.sensors.gelap = s.sensors.ldr < s.lampu.ldrThreshold * 8;
    s.sensors.waterLevel = clamp(Math.round(s.sensors.waterLevel + rand(-1, 0.5)), 5, 100);

    Store.pushCapped(s.sensors.suhuHistory, { t: now, v: s.sensors.suhu });
    Store.pushCapped(s.sensors.kelembapanHistory, { t: now, v: s.sensors.kelembapan });
    Store.pushCapped(s.sensors.waterLevelHistory, { t: now, v: s.sensors.waterLevel });

    // Auto behaviours mirroring the ESP32 flowchart logic, so demo mode
    // *feels* like the real automation loop.
    // Temperature control (DOC rules):
    // - Cold: suhu < minC -> pemanas (lampu) ON, kipas OFF
    // - Normal: minC <= suhu <= maxC -> pemanas OFF, kipas OFF
    // - Hot: suhu > maxC -> pemanas OFF, kipas ON
    if (s.suhuControl.mode === 'auto') {
      const temp = s.sensors.suhu;
      const min = s.suhuControl.minC;
      const max = s.suhuControl.maxC;
      const shouldHeater = temp < min;
      const shouldKipas = temp > max;

      // Heater implemented via `lampu.isOn` (pemanas). Respect manual override.
      if (!s.lampu.manualOn) {
        if (shouldHeater !== s.lampu.isOn) {
          s.lampu.isOn = shouldHeater;
          Store.addRiwayat({ category: 'lampu', text: `Pemanas ${shouldHeater ? 'ON' : 'OFF'} — suhu ${temp}°C` });
        }
      }

      if (shouldKipas !== s.suhuControl.kipasOn) {
        s.suhuControl.kipasOn = shouldKipas;
        Store.addRiwayat({ category: 'sistem', text: `Kipas ${shouldKipas ? 'ON' : 'OFF'} — suhu ${temp}°C` });
      }
    } else {
      // Fallback: when suhuControl not auto, keep lampu auto based on light sensor
      if (s.lampu.mode === 'auto') {
        const shouldBeOn = s.sensors.gelap;
        if (shouldBeOn !== s.lampu.isOn) {
          s.lampu.isOn = shouldBeOn;
          Store.addRiwayat({ category: 'lampu', text: `Lampu ${shouldBeOn ? 'ON' : 'OFF'} — otomatis (${shouldBeOn ? 'gelap' : 'terang'})` });
        }
      }
    }
    if (s.pompa.mode === 'auto') {
      const shouldPump = s.sensors.waterLevel < s.pompa.minLevel;
      if (shouldPump !== s.pompa.isOn) {
        s.pompa.isOn = shouldPump;
        Store.addRiwayat({ category: 'pompa', text: `Pompa ${shouldPump ? 'ON' : 'OFF'} — otomatis (level ${s.sensors.waterLevel}%)` });
      }
    }
    if (s.sensors.waterLevel < 15) {
      Store.addNotifikasi({ type: 'air_rendah', title: 'Level air rendah', message: `Level air tinggal ${s.sensors.waterLevel}%.`, level: 'danger' });
    }

    Store.notify('sensors'); Store.notify('lampu'); Store.notify('suhuControl'); Store.notify('pompa');
  }

  function start() {
    if (interval) return () => stop();
    interval = setInterval(tick, 4000);
    return () => stop();
  }
  function stop() { clearInterval(interval); interval = null; }

  // Optimistically apply a command locally while in demo/offline mode so
  // toggles still feel responsive without a real ESP32 attached.
  function applyCommand(type, payload = {}) {
    const s = Store.get();
    switch (type) {
      case 'feed_now':
        s.pakan.currentGram = s.pakan.targetGram;
        s.pakan.sisaPersen = clamp(s.pakan.sisaPersen - 6, 0, 100);
        Store.addRiwayat({ category: 'pakan', text: `Pakan diberikan (${s.pakan.targetGram}g) — manual` });
        Store.notify('pakan');
        break;
      case 'set_pakan_mode': s.pakan.mode = payload.mode; Store.notify('pakan'); break;
      case 'set_pakan_config': Object.assign(s.pakan, payload); Store.notify('pakan'); break;
      case 'set_lampu_mode': s.lampu.mode = payload.mode; Store.notify('lampu'); break;
      case 'set_lampu_manual':
        s.lampu.manualOn = payload.on; s.lampu.isOn = payload.on;
        Store.addRiwayat({ category: 'lampu', text: `Lampu ${payload.on ? 'ON' : 'OFF'} — manual` });
        Store.notify('lampu');
        break;
      case 'set_lampu_threshold': s.lampu.ldrThreshold = payload.ldrThreshold; Store.notify('lampu'); break;
      case 'set_suhu_config': Object.assign(s.suhuControl, payload); Store.notify('suhuControl'); break;
      case 'set_kipas_manual': s.suhuControl.kipasOn = payload.on; Store.notify('suhuControl'); break;
      case 'set_pompa_mode': s.pompa.mode = payload.mode; Store.notify('pompa'); break;
      case 'set_pompa_manual':
        s.pompa.isOn = payload.on;
        Store.addRiwayat({ category: 'pompa', text: `Pompa ${payload.on ? 'ON' : 'OFF'} — manual` });
        Store.notify('pompa');
        break;
      case 'set_pompa_threshold': Object.assign(s.pompa, payload); Store.notify('pompa'); break;
      case 'add_jadwal': Store.addJadwal({ type: payload.jenis, time: payload.waktu, label: payload.label, active: payload.active !== false }); break;
      case 'update_jadwal': Store.updateJadwal(payload.id, payload); break;
      case 'delete_jadwal': Store.deleteJadwal(payload.id); break;
      case 'update_settings': Object.assign(s.settings, payload); Store.notify('settings'); break;
      case 'mark_notif_read': {
        const n = s.notifikasi.find((x) => x.id === payload.id);
        if (n) n.read = true;
        Store.notify('notifikasi');
        break;
      }
      default: break;
    }
  }

  return { seed, start, stop, applyCommand };
})();
