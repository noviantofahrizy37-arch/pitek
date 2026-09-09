// ==========================================================================
// DATABASE ADAPTER
// Simple database abstraction for IoT dashboard.
// Default target: Supabase (PostgreSQL) for easy access and live updates.
// This file does not force a package dependency; it works when the browser
// exposes window.supabase.createClient(...) or when using localStorage fallback.
// ==========================================================================

const Database = (() => {
  const STORAGE_KEY = 'kandangku_db_config';
  const DEVICE_KEY = 'kandangku_device_id';

  function readConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        provider: parsed.provider || CONFIG.DATABASE.provider || 'none',
        enabled: Boolean(parsed.enabled ?? CONFIG.DATABASE.enabled),
        supabaseUrl: parsed.supabaseUrl || CONFIG.DATABASE.supabaseUrl || '',
        supabaseAnonKey: parsed.supabaseAnonKey || CONFIG.DATABASE.supabaseAnonKey || '',
      };
    } catch (error) {
      return {
        provider: 'none',
        enabled: false,
        supabaseUrl: '',
        supabaseAnonKey: '',
      };
    }
  }

  function writeConfig(nextConfig) {
    const current = readConfig();
    const merged = { ...current, ...nextConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }

  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'device_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }

  function createSupabaseClient() {
    const { enabled, supabaseUrl, supabaseAnonKey } = readConfig();
    if (!enabled || !supabaseUrl || !supabaseAnonKey) return null;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  }

  function getStatus() {
    const cfg = readConfig();
    const client = createSupabaseClient();
    return {
      provider: cfg.provider,
      enabled: cfg.enabled,
      ready: Boolean(client),
      hasSupabaseClient: Boolean(window.supabase && window.supabase.createClient),
      config: cfg,
    };
  }

  function saveConfig(nextConfig) {
    const config = writeConfig(nextConfig);
    return { ok: true, config, status: getStatus() };
  }

  async function ensureDeviceMeta() {
    const client = createSupabaseClient();
    if (!client) return { ok: false, mode: 'local', reason: 'Supabase belum dikonfigurasi' };

    const deviceId = getDeviceId();
    const row = {
      id: deviceId,
      name: Store.get().coop.name || 'Kandang Ayam',
      type: 'kandang',
      status: 'online',
      last_seen: new Date().toISOString(),
      location: 'kandang',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await client.from('devices').upsert([row], { onConflict: 'id' });
    if (error) return { ok: false, mode: 'supabase', error };
    return { ok: true, mode: 'supabase', data, deviceId };
  }

  async function insertSensorReading(payload) {
    const client = createSupabaseClient();
    if (!client) {
      return { ok: false, mode: 'local', reason: 'Supabase belum dikonfigurasi' };
    }

    const deviceId = getDeviceId();
    const row = {
      device_id: deviceId,
      suhu: payload.suhu ?? null,
      kelembapan: payload.kelembapan ?? null,
      ldr: payload.ldr ?? null,
      water_level: payload.waterLevel ?? null,
      gelap: Boolean(payload.gelap),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await client.from('sensor_readings').insert([row]);
    if (error) {
      return { ok: false, mode: 'supabase', error };
    }

    return { ok: true, mode: 'supabase', data };
  }

  async function insertNotification(payload) {
    const client = createSupabaseClient();
    if (!client) {
      return { ok: false, mode: 'local', reason: 'Supabase belum dikonfigurasi' };
    }

    const deviceId = getDeviceId();
    const row = {
      device_id: deviceId,
      type: payload.type || 'system',
      title: payload.title || 'Notifikasi',
      message: payload.message || '',
      level: payload.level || 'info',
      read_status: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await client.from('notifications').insert([row]);
    if (error) {
      return { ok: false, mode: 'supabase', error };
    }

    return { ok: true, mode: 'supabase', data };
  }

  async function insertRiwayat(payload) {
    const client = createSupabaseClient();
    if (!client) {
      return { ok: false, mode: 'local', reason: 'Supabase belum dikonfigurasi' };
    }

    const deviceId = getDeviceId();
    const row = {
      device_id: deviceId,
      action: payload.category || 'system',
      payload: payload,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await client.from('audit_logs').insert([row]);
    if (error) {
      return { ok: false, mode: 'supabase', error };
    }

    return { ok: true, mode: 'supabase', data };
  }

  async function getLatestSensors(limit = 20) {
    const client = createSupabaseClient();
    if (!client) {
      return { ok: false, mode: 'local', reason: 'Supabase belum dikonfigurasi' };
    }

    const { data, error } = await client
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { ok: false, mode: 'supabase', error };
    }

    return { ok: true, mode: 'supabase', data };
  }

  async function updateDeviceConfig(deviceId, payload) {
    const client = createSupabaseClient();
    if (!client) {
      return { ok: false, mode: 'local', reason: 'Supabase belum dikonfigurasi' };
    }

    const row = {
      device_id: deviceId,
      ...payload,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client.from('device_configs').upsert([row], { onConflict: 'device_id' });
    if (error) {
      return { ok: false, mode: 'supabase', error };
    }

    return { ok: true, mode: 'supabase', data };
  }

  async function syncSensorFromState(section, data) {
    if (!data || !readConfig().enabled) return { ok: false, mode: 'local', reason: 'database disabled' };
    if (section !== 'sensors') return { ok: false, mode: 'local', reason: 'not sensors section' };
    return insertSensorReading(data);
  }

  async function syncNotificationFromState(payload) {
    if (!payload || !readConfig().enabled) return { ok: false, mode: 'local', reason: 'database disabled' };
    return insertNotification(payload);
  }

  async function syncAuditFromState(payload) {
    if (!payload || !readConfig().enabled) return { ok: false, mode: 'local', reason: 'database disabled' };
    return insertRiwayat(payload);
  }

  return {
    readConfig,
    writeConfig,
    saveConfig,
    getStatus,
    getDeviceId,
    ensureDeviceMeta,
    createSupabaseClient,
    insertSensorReading,
    insertNotification,
    insertRiwayat,
    syncSensorFromState,
    syncNotificationFromState,
    syncAuditFromState,
    getLatestSensors,
    updateDeviceConfig,
  };
})();
