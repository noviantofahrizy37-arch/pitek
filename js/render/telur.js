const PageTelur = (() => {
  let el;
  let _ICONS;
  function mount() { el = document.getElementById('page-telur'); Store.subscribe((section) => { if (section === 'telur') render(); }); }

  function render() {
    if (!el) return;
    const t = Store.get().telur;
    const max = Math.max(1, ...t.perHari.map((d) => d.val));
    _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Monitoring Telur</div>
        <div class="page-subtitle">Deteksi otomatis via sensor</div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card primary" style="grid-column:1/-1">
          <div class="kpi-icon">${_ICONS.egg || ''}</div>
          <div class="kpi-label">Jumlah Telur Hari Ini</div>
          <div class="kpi-value">${t.hariIni} butir</div>
        </div>
      </div>

      <div class="section-label">Telur per Hari (7 hari)</div>
      <div class="card">
        <div class="mini-chart">
          ${t.perHari.map((d) => `
            <div class="bar-wrap">
              <div class="bar" style="height:${(d.val / max) * 100}%;background:var(--egg)"></div>
              <div class="bar-label">${d.label}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="section-label">Deteksi Terbaru</div>
      <div class="card">
        ${t.riwayatDeteksi.slice().reverse().map(row).join('') || empty()}
      </div>
    `;
  }

  function row(d) {
    return `<div class="list-item">
      <div class="li-icon" style="background:var(--egg-soft);color:var(--egg)">${_ICONS.egg || ''}</div>
      <div class="li-main"><div class="li-title">${d.jumlah} telur baru terdeteksi</div></div>
      <div class="li-time">${Fmt.time(d.t)}</div>
    </div>`;
  }
  function empty() { return `<div class="empty-state">${_ICONS.egg || ''}<div class="es-title">Kosong</div><div class="es-sub">Belum ada deteksi telur</div></div>`; }

  return { mount, render };
})();
