const PageRiwayat = (() => {
  let el, filter = 'semua';
  function mount() { el = document.getElementById('page-riwayat'); Store.subscribe((section) => { if (section === 'riwayat') render(); }); }

  function render() {
    if (!el) return;
    const all = Store.get().riwayat.slice().reverse();
    const list = filter === 'semua' ? all : all.filter((r) => r.category === filter);
    const grouped = groupByDay(list);

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Riwayat Aktivitas</div>
        <div class="page-subtitle">Log seluruh aktivitas sistem</div>
      </div>

      <div class="chip-row">
        ${chip('semua', 'Semua')}${chip('pakan', 'Pakan')}${chip('lampu', 'Lampu')}${chip('pompa', 'Pompa')}${chip('telur', 'Telur')}${chip('sistem', 'Sistem')}
      </div>

      ${grouped.length ? grouped.map((g) => `
        <div class="section-label">${g.label}</div>
        <div class="card">${g.items.map(row).join('')}</div>
      `).join('') : `<div class="card">${empty()}</div>`}
    `;

    el.querySelectorAll('.chip').forEach((c) => (c.onclick = () => { filter = c.dataset.f; render(); }));
  }

  function chip(f, label) { return `<div class="chip ${filter === f ? 'active' : ''}" data-f="${f}">${label}</div>`; }

  function groupByDay(list) {
    const groups = [];
    let lastKey = null;
    list.forEach((item) => {
      const key = new Date(item.t).toDateString();
      const isToday = key === new Date().toDateString();
      const label = isToday ? 'Hari ini' : Fmt.dateShort(item.t);
      if (key !== lastKey) { groups.push({ label, items: [] }); lastKey = key; }
      groups[groups.length - 1].items.push(item);
    });
    return groups;
  }

  function row(r) {
    const m = PageOverview.catMeta(r.category);
    return `<div class="list-item">
      <div class="li-icon" style="background:${m.bg};color:${m.color}">${m.icon || ''}</div>
      <div class="li-main"><div class="li-title">${r.text}</div></div>
      <div class="li-time">${Fmt.time(r.t)}</div>
    </div>`;
  }
  function empty() { const _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {})); return `<div class="empty-state">${_ICONS.history || ''}<div class="es-title">Belum ada aktivitas</div><div class="es-sub">Coba ubah filter kategori</div></div>`; }

  return { mount, render };
})();
