# KandangKu — Server

Project ini dipisah sesuai arsitektur yang benar:

- API Vercel / REST: `server/index.js` + `server/db.js`
- WebSocket backend untuk ESP32: `server/server.js`

`server/db.js` memakai Neon PostgreSQL via `pg` dan koneksi dari `DATABASE_URL` atau `NEON_DATABASE_URL`.

Setup:

```bash
cd server
cp .env.example .env
npm install
```

Jalankan API:

```bash
npm start
```

Jalankan WebSocket backend untuk ESP32:

```bash
npm run ws
```

Set your Neon connection string in `.env`:

```bash
DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

You can also use `NEON_DATABASE_URL` if you prefer that variable name.

API Endpoints:
- `GET /api/health` — health check
- `GET /api/state` — full snapshot
- `POST /api/command` — JSON { type, data } to write updates
- `GET /api/sensors?hours=24` — sensor history
- `GET /api/riwayat` — recent riwayat
- `GET /api/notifikasi` — recent notifikasi
- `POST /api/notifikasi` — add notif
- `POST /api/notifikasi/:id/read` — mark read
- `GET/POST/PUT/DELETE /api/jadwal` — jadwal CRUD

Catatan:
- Jangan commit file `.env` ke GitHub.
- Rotasi credential Neon yang sudah pernah terekspos ke repositori.
- WebSocket dan REST tidak boleh dipaksa ke satu proses Vercel yang tidak cocok untuk koneksi persistent.
