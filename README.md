# KandangKu — Dashboard Kandang Ayam Pintar

Dashboard web mobile untuk sistem IoT kandang ayam otomatis (pakan + lampu +
suhu/kelembapan + air/pompa + telur), sesuai flowchart dan spesifikasi fitur
yang diberikan. Dibangun **HTML/CSS/JS murni** — tanpa framework, tanpa
build step, tanpa dependensi CDN — supaya bisa langsung di-serve dari ESP32
(SPIFFS/LittleFS) sekalipun ESP32 tidak punya akses internet.

## Menjalankan cepat (mode demo)

Cukup buka `index.html` di browser HP/laptop. Dashboard otomatis masuk
**Mode Demo** (data disimulasikan) kalau tidak menemukan ESP32 di alamat
WebSocket default — jadi kamu bisa langsung eksplor semua halaman & fitur
sebelum hardware-nya siap.

## Menghubungkan ke ESP32 asli

1. Pastikan firmware ESP32 menjalankan **WebSocket server** (lihat protokol
   di bawah / di komentar atas `js/websocket-client.js`).
2. Buka dashboard → menu **Pengaturan** → isi kolom *Alamat WebSocket ESP32*,
   contoh:
   - Mode Access Point (default ESP32): `ws://192.168.4.1:81`
   - Ikut WiFi rumah + mDNS: `ws://kandang-ayam.local:81`
   - IP statis: `ws://192.168.1.50:81`
3. Tekan **Simpan & Hubungkan**. Dashboard akan reconnect otomatis kalau
   koneksi putus, dan otomatis balik ke Mode Demo kalau ESP32 tidak
   terjangkau setelah beberapa percobaan (lalu terus mencoba di background).

Alamat WS disimpan di `localStorage`, jadi tidak perlu edit kode untuk
ganti IP kandang lain.

## Protokol komunikasi (WebSocket, JSON)

Dokumentasi lengkap tipe pesan (arah ESP32→dashboard dan dashboard→ESP32)
ada di bagian atas file `js/websocket-client.js` — kirim file itu ke siapa
pun yang mengerjakan firmware. Ringkasnya:

- ESP32 kirim `state_snapshot` sekali saat koneksi terbuka (biar dashboard
  tidak kosong), lalu event kecil (`sensor_update`, `pakan_status`,
  `lampu_status`, `telur_detected`, `notifikasi`, dll) tiap ada perubahan.
- Dashboard kirim command (`feed_now`, `set_pakan_mode`, `set_lampu_manual`,
  `add_jadwal`, dst) tiap user menekan tombol/toggle/slider.
- Semua pesan punya field `"type"` dan payload di `"data"` (dari ESP32) atau
  `"payload"` (ke ESP32). Field tak dikenal diabaikan, jadi aman ditambah
  belakangan tanpa merusak UI.

## Struktur file

```
index.html              shell halaman + semua 10 section (Overview, Pakan,
                         Lampu, Suhu, Air, Telur, Jadwal, Riwayat,
                         Notifikasi, Pengaturan)
css/style.css            seluruh desain (soft-UI, warna, komponen)
js/config.js             alamat WS default & konstanta
js/icons.js              ikon SVG inline (tanpa font/CDN)
js/utils.js              format waktu/angka
js/store.js              state management (pub-sub sederhana)
js/toast.js              notifikasi toast kecil
js/charts.js             grafik garis di <canvas> (tanpa Chart.js)
js/modal.js              bottom-sheet modal generik
js/mock-data.js          data simulasi untuk Mode Demo
js/websocket-client.js   koneksi WS + dokumentasi protokol lengkap
js/render/*.js           satu file per halaman (logic + tampilan)
js/app.js                navigasi, header, drawer, boot sequence
```

## Deploy ke ESP32

Upload seluruh isi folder ini (index.html, css/, js/) ke SPIFFS/LittleFS
ESP32, lalu arahkan web server-nya (mis. `ESPAsyncWebServer` +
`serveStatic("/", SPIFFS, "/")`) ke folder tersebut. Jalankan WebSocket
server di path/port sesuai yang kamu isi di Pengaturan (default port `81`).

## Kustomisasi

- **Ganti nama/warna kandang**: edit variabel warna di `css/style.css`
  bagian `:root` (`--accent`, `--feed`, `--light`, `--water`, dst).
- **Ubah default target pakan / threshold**: `js/store.js` bagian `settings`.
- **Tambah tipe notifikasi baru**: kirim pesan `notifikasi` dari firmware
  dengan `level: "info" | "warn" | "danger"` — ikon & warna menyesuaikan
  otomatis.
# pitek
