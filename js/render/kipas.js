const PageKipas = (() => {
  let el;
  function mount() { el = document.getElementById('page-kipas'); Store.subscribe((section) => { if (section === 'sensors' || section === 'suhuControl') render(); }); }

  function render() {
    if (!el) return;
    const sc = Store.get().suhuControl;
    const sensors = Store.get().sensors;
    const isAuto = sc.mode === 'auto';
    const _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Kipas Pendingin</div>
        <div class="page-subtitle">Kontrol kipas untuk menjaga suhu kandang</div>
      </div>

      <div class="card">
        <div class="card-row"><div class="li-title">Status Suhu</div></div>
        <div class="kpi-grid mt-12">
          <div class="kpi-card primary">
            <div class="kpi-icon">${_ICONS.thermo || ''}</div>
            <div class="kpi-label">Temperatur Realtime</div>
            <div class="kpi-value">${sensors.suhu ?? '--'}°C</div>
          </div>
          <div class="kpi-card plain">
            <div class="kpi-icon">${_ICONS.fan || ''}</div>
            <div class="kpi-label">Kipas</div>
            <div class="kpi-value">${sc.kipasOn ? 'Nyala' : 'Mati'}</div>
          </div>
        </div>
      </div>

      <div class="section-label">Kontrol Kipas</div>
      <div class="card">
        <div class="card-row"><div class="li-title">Mode</div></div>
        <div class="segmented mt-12">
          <button data-mode="auto" class="${isAuto ? 'active' : ''}">Otomatis</button>
          <button data-mode="manual" class="${!isAuto ? 'active' : ''}">Manual</button>
        </div>

        <div class="card-row mt-12" style="padding-top:14px;border-top:1px solid var(--border)">
          <div class="flex items-center gap-12">
            <div class="li-icon" style="background:var(--water-soft);color:var(--water)">${_ICONS.fan || ''}</div>
            <div><div class="li-title">Kipas Pendingin</div><div class="li-sub">${isAuto ? `Otomatis — menyala saat suhu > ${sc.maxC}°C` : 'Kontrol manual'}</div></div>
          </div>
          <label class="switch">
            <input type="checkbox" id="kp-toggle" ${sc.kipasOn ? 'checked' : ''} ${isAuto ? 'disabled' : ''}>
            <span class="track"></span>
          </label>
        </div>
      </div>
    `;

    el.querySelectorAll('.segmented button').forEach((btn) => {
      btn.onclick = () => KandangSocket.sendCommand('set_suhu_config', { minC: sc.minC, maxC: sc.maxC, mode: btn.dataset.mode });
    });
    document.getElementById('kp-toggle').onchange = (e) => KandangSocket.sendCommand('set_kipas_manual', { on: e.target.checked });
  }

  return { mount, render };
})();
