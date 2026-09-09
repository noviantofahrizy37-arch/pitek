# KandangKu — Server

Simple Express API that exposes the SQLite-backed `server/db.js` functions.

Run:

```bash
cd server
npm install
npm start
```

Endpoints:
- `GET /api/state` — full snapshot
- `POST /api/command` — JSON { type, data } to write updates
- `GET /api/sensors?hours=24` — sensor history
- `GET /api/riwayat` — recent riwayat
- `GET /api/notifikasi` — recent notifikasi
- `POST /api/notifikasi` — add notif
- `POST /api/notifikasi/:id/read` — mark read
- `GET/POST/PUT/DELETE /api/jadwal` — jadwal CRUD
