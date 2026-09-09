// ==========================================================================
// CONFIG — edit DEFAULT_WS_URL to your ESP32's address, or change it live
// from the "Pengaturan" page in-app (saved to localStorage, no redeploy).
// ==========================================================================

const CONFIG = {
  // Typical ESP32 SoftAP address is 192.168.4.1. If your firmware joins an
  // existing WiFi network instead, use its assigned IP or mDNS hostname,
  // e.g. "ws://kandang-ayam.local:81".
  DEFAULT_WS_URL: 'ws://192.168.4.1:81',

  // Reconnect backoff (ms)
  RECONNECT_BASE_MS: 1500,
  RECONNECT_MAX_MS: 15000,

  // After this many failed connection attempts in a row, the dashboard
  // switches to DEMO MODE (simulated data) so the UI is still explorable
  // while you finish wiring up the firmware. It keeps retrying in the
  // background and switches back automatically once the ESP32 answers.
  DEMO_FALLBACK_ATTEMPTS: 4,

  // How many entries to keep in in-memory history lists before trimming.
  MAX_HISTORY: 200,

  STORAGE_KEYS: {
    wsUrl: 'kandangku_ws_url',
    settings: 'kandangku_settings',
  },
};
