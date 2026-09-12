const PagePakan = (() => {
  let el;
  function mount() { el = document.getElementById('page-pakan'); Store.subscribe((section) => { if (section === 'pakan' || section === 'connection') render(); }); }
  const _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));

  function render() {
    if (!el) return;
    const s = Store.get().pakan;
    const isAuto = s.mode === 'auto';

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Kontrol Pakan</div>
        <div class="page-subtitle">Atur pemberian pakan otomatis atau manual</div>
      </div>

      ${s.sisaPersen <= 15 ? `<div class="banner danger">${_ICONS.warning || ''}<div><b>Pakan hampir habis</b>Sisa pakan tinggal ${s.sisaPersen}%, segera isi ulang.</div></div>` : ''}

      <div class="card">
        <div class="card-row">
          <div class="li-title">Mode</div>
        </div>
        <div class="segmented mt-12">
          <button data-mode="auto" class="${isAuto ? 'active' : ''}">Otomatis</button>
          <button data-mode="manual" class="${!isAuto ? 'active' : ''}">Manual</button>
        </div>
      </div>

      <div class="card mt-12">
        <div class="gauge-wrap">
          ${gaugeSvg(s.currentGram, s.targetGram)}
          <div>
            <div class="li-title">Monitoring Berat Pakan</div>
            <div class="li-sub">Load Cell · target ${Fmt.num(s.targetGram)} g</div>
            <div class="pill neutral mt-8">${Fmt.num(s.currentGram)} g terisi</div>
          </div>
        </div>
      </div>

      <button class="btn btn-feed btn-sm mt-12" id="pk-feed-now">${_ICONS.feed || ''} Beri Pakan Sekarang</button>

      <div class="section-label">Konfigurasi</div>
      <div class="card">
        <div class="field">
          <label>Target Jumlah Pakan (gram)</label>
          <div class="stepper">
            <button id="pk-target-minus">−</button>
            <div class="stepper-value">${s.targetGram} g</div>
            <button id="pk-target-plus">+</button>
          </div>
        </div>
        <div class="field" style="margin-bottom:0">
          <label>Durasi Motor Pakan (detik)</label>
          <div class="stepper">
            <button id="pk-durasi-minus">−</button>
            <div class="stepper-value">${s.durasiMotorDetik} dtk</div>
            <button id="pk-durasi-plus">+</button>
          </div>
        </div>
      </div>

      <div class="section-label">Jadwal Pemberian Pakan<span class="hint" id="pk-see-jadwal" style="cursor:pointer">Kelola ${_ICONS.chevronRight || ''}</span></div>
      <div class="card">
        ${jadwalPreview()}
      </div>

      <div class="section-label">Riwayat Pemberian Pakan</div>
      <div class="card">
        ${s.riwayat.slice().reverse().map(row).join('') || empty()}
      </div>
    `;

    el.querySelectorAll('.segmented button').forEach((btn) => {
      btn.onclick = () => KandangSocket.sendCommand('set_pakan_mode', { mode: btn.dataset.mode });
    });
    document.getElementById('pk-feed-now').onclick = () => { KandangSocket.sendCommand('feed_now'); Toast.show('Perintah beri pakan terkirim', 'success'); };
    document.getElementById('pk-target-minus').onclick = () => stepTarget(-10);
    document.getElementById('pk-target-plus').onclick = () => stepTarget(10);
    document.getElementById('pk-durasi-minus').onclick = () => stepDurasi(-1);
    document.getElementById('pk-durasi-plus').onclick = () => stepDurasi(1);
    document.getElementById('pk-see-jadwal').onclick = () => App.navigate('jadwal');
  }

  function stepTarget(delta) {
    const s = Store.get().pakan;
    const val = Math.max(20, s.targetGram + delta);
    KandangSocket.sendCommand('set_pakan_config', { targetGram: val, durasiMotorDetik: s.durasiMotorDetik });
    s.targetGram = val; render();
  }
  function stepDurasi(delta) {
    const s = Store.get().pakan;
    const val = Math.max(1, s.durasiMotorDetik + delta);
    KandangSocket.sendCommand('set_pakan_config', { targetGram: s.targetGram, durasiMotorDetik: val });
    s.durasiMotorDetik = val; render();
  }

  function gaugeSvg(current, target) {
    const pct = Math.min(1, current / target);
    const r = 34, c = 2 * Math.PI * r;
    return `<div class="gauge-center" style="width:88px;height:88px">
      <svg class="gauge" width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="${r}" stroke="var(--surface-alt)" stroke-width="9" fill="none"/>
        <circle cx="44" cy="44" r="${r}" stroke="var(--feed)" stroke-width="9" fill="none"
          stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" stroke-linecap="round"/>
      </svg>
      <div class="gauge-value-abs"><div class="num">${Math.round(pct * 100)}%</div><div class="unit">terisi</div></div>
    </div>`;
  }

  function jadwalPreview() {
    const list = Store.get().jadwal.filter((j) => j.type === 'pakan');
    if (!list.length) return empty('Belum ada jadwal pakan');
      return list.map((j) => `<div class="list-item">
      <div class="li-icon" style="background:var(--feed-soft);color:var(--feed)">${_ICONS.clock || ''}</div>
      <div class="li-main"><div class="li-title">${j.label}</div><div class="li-sub">${j.time}</div></div>
      <span class="pill ${j.active ? 'up' : 'neutral'}">${j.active ? 'Aktif' : 'Nonaktif'}</span>
    </div>`).join('');
  }

  function row(r) {
    return `<div class="list-item">
      <div class="li-icon" style="background:var(--feed-soft);color:var(--feed)">${_ICONS.feed || ''}</div>
      <div class="li-main"><div class="li-title">${Fmt.num(r.jumlahGram)} gram</div><div class="li-sub">${r.sumber || 'Otomatis'}</div></div>
      <div class="li-time">${Fmt.time(r.t)}</div>
    </div>`;
  }
  function empty(msg = 'Belum ada riwayat pemberian pakan') {
    return `<div class="empty-state">${_ICONS.feed || ''}<div class="es-title">Kosong</div><div class="es-sub">${msg}</div></div>`;
  }

  return { mount, render };
})();
