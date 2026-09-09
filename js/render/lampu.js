const PageLampu = (() => {
  let el;
  function mount() { el = document.getElementById('page-lampu'); Store.subscribe((section) => { if (section === 'lampu' || section === 'sensors') render(); }); }

  function render() {
    if (!el) return;
    const s = Store.get().lampu;
    const ldr = Store.get().sensors.ldr;
    const isAuto = s.mode === 'auto';

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Kontrol Lampu</div>
        <div class="page-subtitle">Otomatis berdasarkan sensor cahaya (LDR)</div>
      </div>

      <div class="card">
        <div class="card-row">
          <div class="flex items-center gap-12">
            <div class="li-icon" style="background:var(--light-soft);color:var(--light);width:46px;height:46px;border-radius:16px">${ICONS.lamp}</div>
            <div>
              <div class="li-title">Lampu Kandang</div>
              <div class="li-sub">Kondisi: ${Store.get().sensors.gelap ? 'Gelap' : 'Terang'} (LDR ${ldr ?? '--'})</div>
            </div>
          </div>
          <span class="pill ${s.isOn ? 'up' : 'neutral'}">${s.isOn ? 'ON' : 'OFF'}</span>
        </div>

        <div class="segmented mt-12">
          <button data-mode="auto" class="${isAuto ? 'active' : ''}">Otomatis</button>
          <button data-mode="manual" class="${!isAuto ? 'active' : ''}">Manual</button>
        </div>

        <div class="card-row mt-12" style="padding-top:14px;border-top:1px solid var(--border)">
          <div>
            <div class="li-title">Saklar Manual</div>
            <div class="li-sub">${isAuto ? 'Aktifkan mode manual untuk kontrol langsung' : 'Nyala/matikan lampu langsung'}</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="lp-manual-toggle" ${s.manualOn ? 'checked' : ''} ${isAuto ? 'disabled' : ''}>
            <span class="track"></span>
          </label>
        </div>
      </div>

      <div class="section-label">Sensor Cahaya (LDR)</div>
      <div class="card">
        <div class="field" style="margin-bottom:6px">
          <label>Batas Sensor LDR (nyalakan lampu di bawah nilai ini)</label>
          <input type="range" id="lp-threshold" min="0" max="100" value="${s.ldrThreshold}">
          <div class="range-row"><span>0</span><span id="lp-threshold-val">${s.ldrThreshold}</span><span>100</span></div>
        </div>
        <div class="field-hint">Nilai LDR saat ini: ${ldr ?? '--'} — ${Store.get().sensors.gelap ? 'di bawah ambang batas (gelap)' : 'di atas ambang batas (terang)'}</div>
      </div>

      <div class="section-label">Jadwal Lampu<span class="hint" id="lp-see-jadwal" style="cursor:pointer">Kelola ${ICONS.chevronRight}</span></div>
      <div class="card">${jadwalPreview()}</div>

      <div class="section-label">Riwayat Lampu</div>
      <div class="card">
        ${s.riwayat.slice().reverse().map(row).join('') || empty()}
      </div>
    `;

    el.querySelectorAll('.segmented button').forEach((btn) => {
      btn.onclick = () => KandangSocket.sendCommand('set_lampu_mode', { mode: btn.dataset.mode });
    });
    document.getElementById('lp-manual-toggle').onchange = (e) => KandangSocket.sendCommand('set_lampu_manual', { on: e.target.checked });
    const range = document.getElementById('lp-threshold');
    range.oninput = (e) => { document.getElementById('lp-threshold-val').textContent = e.target.value; };
    range.onchange = (e) => KandangSocket.sendCommand('set_lampu_threshold', { ldrThreshold: +e.target.value });
    document.getElementById('lp-see-jadwal').onclick = () => App.navigate('jadwal');
  }

  function jadwalPreview() {
    const list = Store.get().jadwal.filter((j) => j.type === 'lampu');
    if (!list.length) return `<div class="empty-state">${ICONS.lamp}<div class="es-title">Kosong</div><div class="es-sub">Belum ada jadwal lampu</div></div>`;
    return list.map((j) => `<div class="list-item">
      <div class="li-icon" style="background:var(--light-soft);color:var(--light)">${ICONS.clock}</div>
      <div class="li-main"><div class="li-title">${j.label}</div><div class="li-sub">${j.time}</div></div>
      <span class="pill ${j.active ? 'up' : 'neutral'}">${j.active ? 'Aktif' : 'Nonaktif'}</span>
    </div>`).join('');
  }
  function row(r) {
    return `<div class="list-item">
      <div class="li-icon" style="background:var(--light-soft);color:var(--light)">${ICONS.lamp}</div>
      <div class="li-main"><div class="li-title">${r.aksi}</div></div>
      <div class="li-time">${Fmt.time(r.t)}</div>
    </div>`;
  }
  function empty() { return `<div class="empty-state">${ICONS.lamp}<div class="es-title">Kosong</div><div class="es-sub">Belum ada riwayat lampu</div></div>`; }

  return { mount, render };
})();
