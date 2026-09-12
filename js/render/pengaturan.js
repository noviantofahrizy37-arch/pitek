const PagePengaturan = (() => {
  let el;
  function mount() { el = document.getElementById('page-pengaturan'); Store.subscribe((section) => { if (section === 'settings' || section === 'connection') render(); }); }

  function render() {
    if (!el) return;
    const st = Store.get().settings;
    const conn = Store.get().connection;
    const _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Pengaturan</div>
        <div class="page-subtitle">Konfigurasi sistem &amp; koneksi perangkat</div>
      </div>

      <div class="section-label">Koneksi Perangkat IoT</div>
      <div class="card">
        <div class="card-row">
          <div class="flex items-center gap-8"><span class="dot ${conn.status === 'online' ? 'online' : conn.status === 'demo' ? 'warn' : 'offline'}"></span>
            <span class="li-title">${conn.status === 'online' ? 'Terhubung ke ESP32' : conn.status === 'demo' ? 'Mode Demo (simulasi)' : conn.status === 'connecting' ? 'Menghubungkan…' : 'Tidak terhubung'}</span>
          </div>
        </div>
        <div class="field mt-12" style="margin-bottom:8px">
          <label>Alamat WebSocket ESP32</label>
          <input type="text" id="pg-ws-url" value="${KandangSocket.currentUrl()}" placeholder="ws://192.168.4.1:81">
          <div class="field-hint">Format: ws://[IP atau hostname ESP32]:[port]. Default AP: ws://192.168.4.1:81</div>
        </div>
          <div class="flex gap-8">
            <button class="btn btn-primary btn-sm" id="pg-connect">${_ICONS.refresh || ''} Simpan &amp; Hubungkan</button>
            <button class="btn btn-outline btn-sm" id="pg-demo-toggle">${_ICONS.home || ''} Aktifkan Demo</button>
          </div>
      </div>

      

      <div class="section-label">Identitas Kandang</div>
      <div class="card">
        <div class="field" style="margin-bottom:0">
          <label>Nama Kandang</label>
          <input type="text" id="pg-nama" value="${st.namaKandang}">
        </div>
      </div>

      <div class="section-label">Nilai Default</div>
      <div class="card">
        <div class="field">
          <label>Target Berat Pakan Default (gram)</label>
          <input type="number" id="pg-target-pakan" value="${st.targetPakanDefault}">
        </div>
        <div class="field">
          <label>Threshold Suhu Min / Max (°C)</label>
          <div class="flex gap-8"><input type="number" id="pg-suhu-min" value="${st.thresholdSuhuMin}"><input type="number" id="pg-suhu-max" value="${st.thresholdSuhuMax}"></div>
        </div>
        <div class="field" style="margin-bottom:0">
          <label>Threshold LDR</label>
          <input type="number" id="pg-ldr" value="${st.thresholdLdr}">
        </div>
      </div>
      <button class="btn btn-outline btn-sm mt-12" id="pg-save-settings">Simpan Pengaturan</button>

      <div class="section-label">Kalibrasi Sensor</div>
      <div class="card">
        <div class="list-item">
          <div class="li-icon" style="background:var(--feed-soft);color:var(--feed)">${_ICONS.scale || ''}</div>
          <div class="li-main"><div class="li-title">Load Cell (Sensor Pakan)</div><div class="li-sub">Tara ulang titik nol sensor</div></div>
          <button class="btn btn-outline btn-sm" data-cal="loadcell">Kalibrasi</button>
        </div>
        <div class="list-item">
          <div class="li-icon" style="background:var(--light-soft);color:var(--light)">${_ICONS.eye || ''}</div>
          <div class="li-main"><div class="li-title">LDR (Sensor Cahaya)</div><div class="li-sub">Sesuaikan dengan kondisi kandang</div></div>
          <button class="btn btn-outline btn-sm" data-cal="ldr">Kalibrasi</button>
        </div>
      </div>

      <div class="section-label">Tentang</div>
      <div class="card">
        <div class="card-row"><span class="text-secondary text-sm">Versi Dashboard</span><span class="text-sm">1.0.0</span></div>
        <div class="card-row mt-8"><span class="text-secondary text-sm">Protokol</span><span class="text-sm">WebSocket (JSON)</span></div>
      </div>
    `;

    document.getElementById('pg-connect').onclick = () => {
      const url = document.getElementById('pg-ws-url').value.trim();
      if (!url) return Toast.show('Alamat tidak boleh kosong', 'danger');
      KandangSocket.setUrl(url);
      Toast.show('Menghubungkan ke ' + url + ' …');
    };

    // Demo toggle
    const demoBtn = document.getElementById('pg-demo-toggle');
    function updateDemoLabel() {
      const conn = Store.get().connection;
      if (conn.status === 'online') {
        demoBtn.textContent = 'Demo (dinonaktifkan saat online)';
        demoBtn.disabled = true;
        demoBtn.title = 'Nonaktifkan ESP32 terlebih dahulu untuk mengaktifkan mode demo.';
        return;
      }
      demoBtn.disabled = false;
      demoBtn.title = '';
      demoBtn.textContent = conn.demo ? 'Nonaktifkan Demo' : 'Aktifkan Demo';
    }
    updateDemoLabel();
    demoBtn.onclick = () => {
      const conn = Store.get().connection;
      if (conn.status === 'online') return Toast.show('Tidak bisa mengaktifkan demo saat ESP32 terhubung', 'danger');
      if (conn.demo) {
        KandangSocket.stopDemo();
        Toast.show('Mode demo dimatikan', 'info');
      } else {
        KandangSocket.startDemo();
        Toast.show('Mode demo diaktifkan', 'info');
      }
      setTimeout(updateDemoLabel, 120);
    };

    

    document.getElementById('pg-save-settings').onclick = () => {
      const payload = {
        namaKandang: document.getElementById('pg-nama').value.trim(),
        targetPakanDefault: +document.getElementById('pg-target-pakan').value,
        thresholdSuhuMin: +document.getElementById('pg-suhu-min').value,
        thresholdSuhuMax: +document.getElementById('pg-suhu-max').value,
        thresholdLdr: +document.getElementById('pg-ldr').value,
      };
      KandangSocket.sendCommand('update_settings', payload);
      Object.assign(Store.get().settings, payload);
      Store.get().coop.name = payload.namaKandang;
      Store.notify('coop');
      Toast.show('Pengaturan disimpan', 'success');
    };
    el.querySelectorAll('[data-cal]').forEach((b) => (b.onclick = () => {
      KandangSocket.sendCommand('calibrate_sensor', { sensor: b.dataset.cal });
      Toast.show('Perintah kalibrasi terkirim', 'success');
    }));
  }

  return { mount, render };
})();
