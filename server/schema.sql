-- Schema for KandangKu (SQLite/Postgres compatible)

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
