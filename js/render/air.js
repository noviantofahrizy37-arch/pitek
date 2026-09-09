const PageAir = (() => {
  let el;
  function mount() { el = document.getElementById('page-air'); Store.subscribe((section) => { if (section === 'pompa' || section === 'sensors') render(); }); }

  function render() {
    if (!el) return;
    const p = Store.get().pompa;
    const level = Store.get().sensors.waterLevel ?? 0;
    const isAuto = p.mode === 'auto';
    const low = level < p.minLevel;

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Air &amp; Pompa</div>
        <div class="page-subtitle">Sensor level air (HC-SR04)</div>
      </div>

      ${low ? `<div class="banner danger">${ICONS.warning}<div><b>Level air rendah</b>Level air ${level}%, di bawah batas minimum ${p.minLevel}%.</div></div>` : ''}

      <div class="card">
        <div class="gauge-wrap">
          <div class="tank"><div class="tank-fill" style="height:${level}%;background:${low ? 'var(--danger)' : 'var(--water)'}"></div><div class="tank-label">${level}%</div></div>
          <div>
            <div class="li-title">Level Air Realtime</div>
            <div class="li-sub">Batas: ${p.minLevel}% – ${p.maxLevel}%</div>
            <div class="pill ${p.isOn ? 'up' : 'neutral'} mt-8">Pompa ${p.isOn ? 'ON' : 'OFF'}</div>
          </div>
        </div>
      </div>

      <div class="card mt-12">
        <div class="card-row"><div class="li-title">Mode</div></div>
        <div class="segmented mt-12">
          <button data-mode="auto" class="${isAuto ? 'active' : ''}">Otomatis</button>
          <button data-mode="manual" class="${!isAuto ? 'active' : ''}">Manual</button>
        </div>
        <div class="card-row mt-12" style="padding-top:14px;border-top:1px solid var(--border)">
          <div class="flex items-center gap-12">
            <div class="li-icon" style="background:var(--water-soft);color:var(--water)">${ICONS.droplet}</div>
            <div><div class="li-title">Pompa Air</div><div class="li-sub">${isAuto ? 'Otomatis mengikuti batas level' : 'Kontrol manual'}</div></div>
          </div>
          <label class="switch">
            <input type="checkbox" id="ar-pompa-toggle" ${p.isOn ? 'checked' : ''} ${isAuto ? 'disabled' : ''}>
            <span class="track"></span>
          </label>
        </div>
      </div>

      <div class="section-label">Batas Level Air</div>
      <div class="card">
        <div class="field">
          <label>Batas Minimum (pompa menyala di bawah ini)</label>
          <input type="range" id="ar-min" min="0" max="100" value="${p.minLevel}">
          <div class="range-row"><span>0%</span><span id="ar-min-val">${p.minLevel}%</span><span>100%</span></div>
        </div>
        <div class="field" style="margin-bottom:0">
          <label>Batas Maksimum (pompa berhenti di atas ini)</label>
          <input type="range" id="ar-max" min="0" max="100" value="${p.maxLevel}">
          <div class="range-row"><span>0%</span><span id="ar-max-val">${p.maxLevel}%</span><span>100%</span></div>
        </div>
      </div>

      <div class="section-label">Riwayat Pompa</div>
      <div class="card">${p.riwayat.slice().reverse().map(row).join('') || empty()}</div>
    `;

    el.querySelectorAll('.segmented button').forEach((btn) => {
      btn.onclick = () => KandangSocket.sendCommand('set_pompa_mode', { mode: btn.dataset.mode });
    });
    document.getElementById('ar-pompa-toggle').onchange = (e) => KandangSocket.sendCommand('set_pompa_manual', { on: e.target.checked });
    bindRange('ar-min', 'ar-min-val', '%', (v) => KandangSocket.sendCommand('set_pompa_threshold', { minLevel: v, maxLevel: p.maxLevel }));
    bindRange('ar-max', 'ar-max-val', '%', (v) => KandangSocket.sendCommand('set_pompa_threshold', { minLevel: p.minLevel, maxLevel: v }));
  }

  function bindRange(id, valId, suffix, onCommit) {
    const input = document.getElementById(id);
    input.oninput = (e) => { document.getElementById(valId).textContent = e.target.value + suffix; };
    input.onchange = (e) => onCommit(+e.target.value);
  }
  function row(r) {
    return `<div class="list-item">
      <div class="li-icon" style="background:var(--water-soft);color:var(--water)">${ICONS.droplet}</div>
      <div class="li-main"><div class="li-title">${r.aksi}</div></div>
      <div class="li-time">${Fmt.time(r.t)}</div>
    </div>`;
  }
  function empty() { return `<div class="empty-state">${ICONS.droplet}<div class="es-title">Kosong</div><div class="es-sub">Belum ada riwayat pompa</div></div>`; }

  return { mount, render };
})();
