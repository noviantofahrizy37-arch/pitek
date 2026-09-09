-- Schema for KandangKu (Neon/Postgres)

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
