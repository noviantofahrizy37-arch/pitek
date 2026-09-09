const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() AS now');
    res.json({
      success: true,
      message: 'Vercel berhasil terhubung ke Neon',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.get('/api/state', async (req, res) => {
  try {
    return res.json(await db.getFullState());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/sensors', async (req, res) => {
  const hours = Number(req.query.hours || 24);
  try {
    const rows = await db.getSensorHistory(hours);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/command', async (req, res) => {
  const { type, data } = req.body || {};
  try {
    switch (type) {
      case 'sensor_update': await db.updateSensors(data); break;
      case 'pakan_status': await db.updatePakan(data); break;
      case 'lampu_status': await db.updateLampu(data); break;
      case 'suhu_status': await db.updateSuhuControl(data); break;
      case 'pompa_status': await db.updatePompa(data); break;
      case 'telur_detected': await db.addTelurEvent(data.jumlah || 1); break;
      case 'riwayat_entry': await db.addRiwayat(data); break;
      case 'notifikasi': await db.addNotifikasi(data); break;
      case 'esp32_status': await db.setEsp32Online(Boolean(data.online)); break;
      case 'wifi_status': await db.setWifi(data); break;
      default: return res.status(400).json({ error: 'unknown_command' });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/riwayat', async (req, res) => {
  const limit = Number(req.query.limit || 50);
  const category = req.query.category || null;
  try {
    return res.json(await db.listRiwayat({ limit, category }));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/notifikasi', async (req, res) => {
  const limit = Number(req.query.limit || 50);
  try {
    return res.json(await db.listNotifikasi(limit));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/notifikasi', async (req, res) => {
  try {
    const row = await db.addNotifikasi(req.body);
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/notifikasi/:id/read', async (req, res) => {
  try {
    await db.markNotifRead(req.params.id);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/jadwal', async (req, res) => res.json(await db.listJadwal()));
app.post('/api/jadwal', async (req, res) => res.json(await db.addJadwal(req.body)));
app.put('/api/jadwal/:id', async (req, res) => res.json(await db.updateJadwal(req.params.id, req.body)));
app.delete('/api/jadwal/:id', async (req, res) => { await db.deleteJadwal(req.params.id); res.json({ ok: true }); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Kandang API listening on', PORT));
