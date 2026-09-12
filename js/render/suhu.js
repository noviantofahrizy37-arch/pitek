const PageSuhu = (() => {
  let el;
  function mount() { el = document.getElementById('page-suhu'); Store.subscribe((section) => { if (section === 'sensors' || section === 'suhuControl') render(); }); }

  function render() {
    if (!el) return;
    const sc = Store.get().suhuControl;
    const sensors = Store.get().sensors;
    const isAuto = sc.mode === 'auto';
    const outOfRange = sensors.suhu != null && (sensors.suhu < sc.minC || sensors.suhu > sc.maxC);
    const _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Suhu &amp; Kelembapan</div>
        <div class="page-subtitle">Sensor DHT22 · kontrol kipas otomatis</div>
      </div>

      ${outOfRange ? `<div class="banner danger">${_ICONS.warning || ''}<div><b>Suhu di luar batas aman</b>Suhu saat ini ${sensors.suhu}°C, batas ${sc.minC}–${sc.maxC}°C.</div></div>` : ''}

      <div class="kpi-grid">
        <div class="kpi-card primary">
          <div class="kpi-icon">${_ICONS.thermo || ''}</div>
          <div class="kpi-label">Temperatur Realtime</div>
          <div class="kpi-value">${sensors.suhu ?? '--'}°C</div>
        </div>
        <div class="kpi-card plain">
          <div class="kpi-icon">${_ICONS.droplet || ''}</div>
          <div class="kpi-label">Kelembapan Realtime</div>
          <div class="kpi-value">${sensors.kelembapan ?? '--'}%</div>
        </div>
      </div>

      <div class="section-label">Riwayat Suhu (24 jam)<span class="hint">°C</span></div>
      <div class="card"><canvas class="line-chart" id="suhu-chart"></canvas></div>

      <div class="section-label">Kontrol</div>
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
            <input type="checkbox" id="sh-kipas-toggle" ${sc.kipasOn ? 'checked' : ''} ${isAuto ? 'disabled' : ''}>
            <span class="track"></span>
          </label>
        </div>
      </div>

      <div class="section-label">Batas Suhu</div>
      <div class="card">
        <div class="field">
          <label>Suhu Minimum</label>
          <input type="range" id="sh-min" min="10" max="40" value="${sc.minC}">
          <div class="range-row"><span>10°C</span><span id="sh-min-val">${sc.minC}°C</span><span>40°C</span></div>
        </div>
        <div class="field" style="margin-bottom:0">
          <label>Suhu Maksimum</label>
          <input type="range" id="sh-max" min="10" max="45" value="${sc.maxC}">
          <div class="range-row"><span>10°C</span><span id="sh-max-val">${sc.maxC}°C</span><span>45°C</span></div>
        </div>
      </div>
    `;

    Charts.drawLine(document.getElementById('suhu-chart'), sensors.suhuHistory.slice(-24), { color: '#2F6D4F', suffix: '°' });

    el.querySelectorAll('.segmented button').forEach((btn) => {
      btn.onclick = () => KandangSocket.sendCommand('set_suhu_config', { minC: sc.minC, maxC: sc.maxC, mode: btn.dataset.mode });
    });
    document.getElementById('sh-kipas-toggle').onchange = (e) => KandangSocket.sendCommand('set_kipas_manual', { on: e.target.checked });
    bindRange('sh-min', 'sh-min-val', '°C', (v) => KandangSocket.sendCommand('set_suhu_config', { minC: v, maxC: sc.maxC, mode: sc.mode }));
    bindRange('sh-max', 'sh-max-val', '°C', (v) => KandangSocket.sendCommand('set_suhu_config', { minC: sc.minC, maxC: v, mode: sc.mode }));
  }

  function bindRange(id, valId, suffix, onCommit) {
    const input = document.getElementById(id);
    input.oninput = (e) => { document.getElementById(valId).textContent = e.target.value + suffix; };
    input.onchange = (e) => onCommit(+e.target.value);
  }

  return { mount, render };
})();
