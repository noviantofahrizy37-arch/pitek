// ==========================================================================
// STORE — single source of truth for the whole dashboard. Plain pub/sub,
// no framework needed. WS messages and mock data both write here; every
// render/*.js file only *reads* from here and re-renders on change.
// ==========================================================================

const Store = (() => {
  const state = {
    connection: { status: 'connecting', wsUrl: null, demo: false },

    coop: { name: 'Kandang Ayam A', overallStatus: 'normal', lastActivityAt: Date.now() },
    esp32: { online: false },
    wifi: { connected: false, rssi: -100 },

    sensors: {
      suhu: null, kelembapan: null,
      suhuHistory: [], kelembapanHistory: [],
      ldr: null, gelap: false,
      waterLevel: null, waterLevelHistory: [],
    },

    pakan: {
      mode: 'auto', targetGram: 250, currentGram: 0,
      durasiMotorDetik: 4, sisaPersen: 100,
      riwayat: [],
    },

    lampu: {
      mode: 'auto', manualOn: false, isOn: false, ldrThreshold: 40,
      riwayat: [],
    },

    suhuControl: { minC: 32, maxC: 35, mode: 'auto', kipasOn: false, kipasManual: false },

    pompa: {
      mode: 'auto', isOn: false, minLevel: 20, maxLevel: 90,
      riwayat: [],
    },

    telur: { hariIni: 0, riwayatDeteksi: [], perHari: [] },

    jadwal: [],

    riwayat: [],

    notifikasi: [],

    settings: {
      namaKandang: 'Kandang Ayam A',
      thresholdSuhuMin: 32, thresholdSuhuMax: 35,
      thresholdLdr: 40, targetPakanDefault: 250,
      apiKey: '',
    },
  };

  const listeners = new Set();
  function notify(section) { listeners.forEach((fn) => fn(section, state)); }

  function get() { return state; }

  // Shallow-merge patch into state[section]
  function patch(section, partial) {
    if (!state[section]) return;
    Object.assign(state[section], partial);
    notify(section);
  }

  function pushCapped(arr, item, max = CONFIG.MAX_HISTORY) {
    arr.push(item);
    if (arr.length > max) arr.splice(0, arr.length - max);
  }

  function addRiwayat({ category, text }) {
    pushCapped(state.riwayat, { id: cryptoId(), t: Date.now(), category, text });
    state.coop.lastActivityAt = Date.now();
    notify('riwayat');
    notify('coop');
  }

  function addNotifikasi({ type, title, message, level = 'info' }) {
    pushCapped(state.notifikasi, {
      id: cryptoId(), t: Date.now(), type, title, message, level, read: false,
    });
    notify('notifikasi');
  }

  function unreadNotifCount() {
    return state.notifikasi.filter((n) => !n.read).length;
  }

  function markAllNotifRead() {
    state.notifikasi.forEach((n) => (n.read = true));
    notify('notifikasi');
  }

  function addJadwal(item) {
    state.jadwal.push({ id: cryptoId(), active: true, ...item });
    notify('jadwal');
  }
  function updateJadwal(id, partial) {
    const j = state.jadwal.find((x) => x.id === id);
    if (j) Object.assign(j, partial);
    notify('jadwal');
  }
  function deleteJadwal(id) {
    const idx = state.jadwal.findIndex((x) => x.id === id);
    if (idx > -1) state.jadwal.splice(idx, 1);
    notify('jadwal');
  }

  function cryptoId() {
    return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  return {
    get, patch, subscribe, pushCapped,
    addRiwayat, addNotifikasi, unreadNotifCount, markAllNotifRead,
    addJadwal, updateJadwal, deleteJadwal,
    cryptoId, notify,
  };
})();
