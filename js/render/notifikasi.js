const PageNotifikasi = (() => {
  let el;
  function mount() { el = document.getElementById('page-notifikasi'); Store.subscribe((section) => { if (section === 'notifikasi') render(); }); }

  function render() {
    if (!el) return;
    const list = Store.get().notifikasi.slice().reverse();
    const unread = Store.unreadNotifCount();

    el.innerHTML = `
      <div class="page-head">
        <div class="card-row">
          <div>
            <div class="page-title">Notifikasi</div>
            <div class="page-subtitle">${unread ? `${unread} belum dibaca` : 'Semua sudah dibaca'}</div>
          </div>
          ${unread ? `<button class="btn btn-outline btn-sm" id="nt-mark-all">Tandai semua dibaca</button>` : ''}
        </div>
      </div>

      <div class="card">
        ${list.length ? list.map(row).join('') : empty()}
      </div>
    `;

    const markAllBtn = document.getElementById('nt-mark-all');
    if (markAllBtn) markAllBtn.onclick = () => { Store.markAllNotifRead(); };
    el.querySelectorAll('[data-read]').forEach((item) => (item.onclick = () => {
      const id = item.dataset.read;
      KandangSocket.sendCommand('mark_notif_read', { id });
      const n = Store.get().notifikasi.find((x) => x.id === id);
      if (n) n.read = true;
      render();
    }));
  }

  function typeIcon(level) {
    if (level === 'danger') return { icon: ICONS.warning, bg: 'var(--danger-soft)', color: 'var(--danger)' };
    if (level === 'warn') return { icon: ICONS.warning, bg: 'var(--warning-soft)', color: 'var(--warning)' };
    return { icon: ICONS.bell, bg: 'var(--surface-alt)', color: 'var(--text-secondary)' };
  }

  function row(n) {
    const m = typeIcon(n.level);
    return `<div class="list-item" data-read="${n.id}" style="cursor:pointer;opacity:${n.read ? 0.6 : 1}">
      <div class="li-icon" style="background:${m.bg};color:${m.color}">${m.icon}</div>
      <div class="li-main">
        <div class="li-title">${n.title}${!n.read ? ' <span class=\"badge-dot\" style=\"position:static;display:inline-block;border:none\"></span>' : ''}</div>
        <div class="li-sub">${n.message}</div>
      </div>
      <div class="li-time">${Fmt.relative(n.t)}</div>
    </div>`;
  }
  function empty() { return `<div class="empty-state">${ICONS.bell}<div class="es-title">Tidak ada notifikasi</div><div class="es-sub">Kamu akan diberi tahu kalau ada masalah</div></div>`; }

  return { mount, render };
})();
