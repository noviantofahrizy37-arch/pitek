const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Full state
app.get('/api/state', (req, res) => {
  try {
    return res.json(db.getFullState());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

// Sensor history
app.get('/api/sensors', (req, res) => {
  const hours = Number(req.query.hours || 24);
  try {
    const rows = db.getSensorHistory(hours);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

// Commands (accepts JSON with { type, data })
app.post('/api/command', (req, res) => {
  const { type, data } = req.body || {};
  try {
    switch (type) {
      case 'sensor_update': db.updateSensors(data); break;
      case 'pakan_status': db.updatePakan(data); break;
      case 'lampu_status': db.updateLampu(data); break;
      case 'suhu_status': db.updateSuhuControl(data); break;
      case 'pompa_status': db.updatePompa(data); break;
      case 'telur_detected': db.addTelurEvent(data.jumlah || 1); break;
      case 'riwayat_entry': db.addRiwayat(data); break;
      case 'notifikasi': db.addNotifikasi(data); break;
      case 'esp32_status': db.setEsp32Online(Boolean(data.online)); break;
      case 'wifi_status': db.setWifi(data); break;
      default: return res.status(400).json({ error: 'unknown_command' });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

// Riwayat
app.get('/api/riwayat', (req, res) => {
  const limit = Number(req.query.limit || 50);
  const category = req.query.category || null;
  try {
    return res.json(db.listRiwayat({ limit, category }));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

// Notifikasi
app.get('/api/notifikasi', (req, res) => {
  const limit = Number(req.query.limit || 50);
  try {
    return res.json(db.listNotifikasi(limit));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/notifikasi', (req, res) => {
  try {
    const row = db.addNotifikasi(req.body);
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/notifikasi/:id/read', (req, res) => {
  try {
    db.markNotifRead(req.params.id);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

// Jadwal CRUD
app.get('/api/jadwal', (req, res) => res.json(db.listJadwal()));
app.post('/api/jadwal', (req, res) => res.json(db.addJadwal(req.body)));
app.put('/api/jadwal/:id', (req, res) => res.json(db.updateJadwal(req.params.id, req.body)));
app.delete('/api/jadwal/:id', (req, res) => { db.deleteJadwal(req.params.id); res.json({ ok: true }); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Kandang API listening on', PORT));
