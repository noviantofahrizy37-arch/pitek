const PageOverview = (() => {
  let el;
  function mount() { el = document.getElementById('page-overview'); Store.subscribe(render); }
  const _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));

  function statusPill(ok) {
    return ok
      ? `<span class="pill up">${_ICONS.check || ''}Normal</span>`
      : `<span class="pill down">${_ICONS.warning || ''}Warning</span>`;
  }

  function render() {
    if (!el) return;
    const s = Store.get();
    const conn = s.connection;

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Selamat datang </div>
        <div class="page-subtitle">${Fmt.todayLabel()}</div>
      </div>

      ${conn.demo ? `<div class="banner warn">${_ICONS.warning || ''}<div><b>Mode demo aktif</b>Belum terhubung ke ESP32 — data di bawah simulasi. Atur alamat perangkat di halaman Pengaturan.</div></div>` : ''}

      <div class="status-scroll">
        <div class="status-chip">
          <div class="label">Status Kandang</div>
          <div class="value">${statusPill(s.coop.overallStatus === 'normal')}</div>
        </div>
        <div class="status-chip">
          <div class="label">${_ICONS.bolt || ''}ESP32</div>
          <div class="value" style="color:${s.esp32.online ? 'var(--success)' : 'var(--danger)'}">${s.esp32.online ? 'Online' : 'Offline'}</div>
        </div>
        <div class="status-chip">
          <div class="label">${_ICONS.wifi || ''}WiFi</div>
          <div class="value">${s.wifi.connected ? `Terhubung (${s.wifi.rssi} dBm)` : 'Terputus'}</div>
        </div>
        <div class="status-chip">
          <div class="label">${_ICONS.clock || ''}Aktivitas Terakhir</div>
          <div class="value">${Fmt.relative(s.coop.lastActivityAt)}</div>
        </div>
      </div>

      <div class="section-label">Ringkasan Sensor</div>
      <div class="kpi-grid">
        <div class="kpi-card primary">
          <div class="kpi-icon">${_ICONS.thermo || ''}</div>
          <div class="kpi-label">Suhu Kandang</div>
          <div class="kpi-value">${s.sensors.suhu ?? '--'}°C</div>
        </div>
        <div class="kpi-card plain">
          <div class="kpi-icon">${_ICONS.droplet || ''}</div>
          <div class="kpi-label">Kelembapan</div>
          <div class="kpi-value">${s.sensors.kelembapan ?? '--'}%</div>
        </div>
        <div class="kpi-card plain">
          <div class="kpi-icon">${_ICONS.feed || ''}</div>
          <div class="kpi-label">Sisa Pakan</div>
          <div class="kpi-value">${s.pakan.sisaPersen}%</div>
        </div>
        <div class="kpi-card plain">
          <div class="kpi-icon">${_ICONS.droplet || ''}</div>
          <div class="kpi-label">Level Air</div>
          <div class="kpi-value">${s.sensors.waterLevel ?? '--'}%</div>
        </div>
      </div>

      <div class="section-label">Status Perangkat</div>
      <div class="card">
        <div class="card-row">
          <div class="flex items-center gap-12">
            <div class="li-icon" style="background:var(--light-soft);color:var(--light)">${_ICONS.lamp || ''}</div>
            <div><div class="li-title">Lampu Kandang</div><div class="li-sub">${s.lampu.mode === 'auto' ? 'Mode otomatis' : 'Mode manual'}</div></div>
          </div>
          <span class="pill ${s.lampu.isOn ? 'up' : 'neutral'}">${s.lampu.isOn ? 'ON' : 'OFF'}</span>
        </div>
        <div class="card-row mt-12" style="padding-top:12px;border-top:1px solid var(--border)">
          <div class="flex items-center gap-12">
            <div class="li-icon" style="background:var(--water-soft);color:var(--water)">${_ICONS.droplet || ''}</div>
            <div><div class="li-title">Pompa Air</div><div class="li-sub">${s.pompa.mode === 'auto' ? 'Mode otomatis' : 'Mode manual'}</div></div>
          </div>
          <span class="pill ${s.pompa.isOn ? 'up' : 'neutral'}">${s.pompa.isOn ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      <div class="section-label">Aksi Cepat</div>
      <div class="card">
          <div class="kpi-grid">
          <button class="btn btn-feed" id="ov-feed-now">${_ICONS.feed || ''} Beri Pakan</button>
          <button class="btn btn-primary" id="ov-lamp-toggle">${_ICONS.lamp || ''} Lampu</button>
        </div>
        <div style="margin-top:12px" class="kpi-grid">
          <button class="btn btn-outline" id="ov-pompa-toggle">${_ICONS.droplet || ''} Pompa</button>
          <button class="btn btn-outline" id="ov-kipas-toggle">${_ICONS.fan || ''} Kipas</button>
        </div>
        <div style="margin-top:12px" class="kpi-grid">
          <button class="btn btn-outline" id="ov-jadwal">${_ICONS.calendar || ''} Jadwal</button>
          <button class="btn btn-outline" id="ov-settings">${_ICONS.settings || ''} Pengaturan</button>
        </div>
      </div>

      <div class="section-label">Aktivitas Terbaru<span class="hint" id="ov-see-all" style="cursor:pointer">Lihat semua ${_ICONS.chevronRight || ''}</span></div>
      <div class="card">
        ${s.riwayat.slice(-4).reverse().map(riwayatRow).join('') || emptyRiwayat()}
      </div>
    `;

    // Feed
    document.getElementById('ov-feed-now').onclick = () => {
      KandangSocket.sendCommand('feed_now');
      Toast.show('Perintah beri pakan terkirim', 'success');
    };

    // Lampu toggle (disabled when lampu in auto)
    const lampBtn = document.getElementById('ov-lamp-toggle');
    lampBtn.innerHTML = (_ICONS.lamp || '') + (s.lampu.isOn ? ' Matikan' : ' Nyalakan');
    lampBtn.disabled = s.lampu.mode === 'auto';
    lampBtn.onclick = () => {
      const newOn = !s.lampu.isOn;
      KandangSocket.sendCommand('set_lampu_manual', { on: newOn });
      Toast.show('Perintah lampu dikirim', 'success');
    };

    // Pompa toggle
    const pompaBtn = document.getElementById('ov-pompa-toggle');
    pompaBtn.innerHTML = (_ICONS.droplet || '') + (s.pompa.isOn ? ' Matikan' : ' Nyalakan');
    pompaBtn.disabled = s.pompa.mode === 'auto';
    pompaBtn.onclick = () => {
      const newOn = !s.pompa.isOn;
      KandangSocket.sendCommand('set_pompa_manual', { on: newOn });
      Toast.show('Perintah pompa dikirim', 'success');
    };

    // Kipas toggle
    const kipasBtn = document.getElementById('ov-kipas-toggle');
    kipasBtn.innerHTML = (_ICONS.fan || '') + (s.suhuControl.kipasOn ? ' Matikan' : ' Nyalakan');
    kipasBtn.disabled = s.suhuControl.mode === 'auto';
    kipasBtn.onclick = () => {
      const newOn = !s.suhuControl.kipasOn;
      KandangSocket.sendCommand('set_kipas_manual', { on: newOn });
      Toast.show('Perintah kipas dikirim', 'success');
    };

    // Navigation quick links
    document.getElementById('ov-jadwal').onclick = () => App.navigate('jadwal');
    document.getElementById('ov-settings').onclick = () => App.navigate('pengaturan');

    document.getElementById('ov-see-all').onclick = () => App.navigate('riwayat');
  }

  function riwayatRow(r) {
    const meta = catMeta(r.category);
    return `<div class="list-item">
      <div class="li-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</div>
      <div class="li-main"><div class="li-title">${r.text}</div></div>
      <div class="li-time">${Fmt.relative(r.t)}</div>
    </div>`;
  }
  function catMeta(cat) {
    const map = {
      pakan: { icon: _ICONS.feed || '', bg: 'var(--feed-soft)', color: 'var(--feed)' },
      lampu: { icon: _ICONS.lamp || '', bg: 'var(--light-soft)', color: 'var(--light)' },
      pompa: { icon: _ICONS.droplet || '', bg: 'var(--water-soft)', color: 'var(--water)' },
      telur: { icon: _ICONS.egg || '', bg: 'var(--egg-soft)', color: 'var(--egg)' },
      sistem: { icon: _ICONS.settings || '', bg: 'var(--surface-alt)', color: 'var(--text-secondary)' },
    };
    return map[cat] || map.sistem;
  }
  function emptyRiwayat() {
    return `<div class="empty-state">${_ICONS.history || ''}<div class="es-title">Belum ada aktivitas</div><div class="es-sub">Aktivitas terbaru akan muncul di sini</div></div>`;
  }

  return { mount, render, catMeta };
})();
