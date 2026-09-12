const App = (() => {
  const PAGES = ['overview', 'pakan', 'lampu', 'suhu', 'kipas', 'air', 'telur', 'jadwal', 'riwayat', 'notifikasi', 'pengaturan'];
  let current = 'overview';

  function navigate(page) {
    if (!PAGES.includes(page)) return;
    current = page;
    PAGES.forEach((p) => document.getElementById('page-' + p).classList.toggle('active', p === page));
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
    document.querySelectorAll('.drawer-item').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
    document.getElementById('fab-add-jadwal').style.display = page === 'jadwal' ? 'flex' : 'none';
    document.getElementById('app-main').scrollTop = 0;
    closeDrawer();
  }

  function openDrawer() { document.getElementById('drawer').classList.add('open'); document.getElementById('drawer-backdrop').classList.add('open'); }
  function closeDrawer() { document.getElementById('drawer').classList.remove('open'); document.getElementById('drawer-backdrop').classList.remove('open'); }

  function renderHeader() {
    const s = Store.get();
    document.getElementById('hdr-name').textContent = s.coop.name;
    const dot = document.getElementById('hdr-dot');
    const label = document.getElementById('hdr-status-label');
    const conn = s.connection;
    dot.className = 'dot ' + (conn.status === 'online' ? 'online' : conn.status === 'demo' ? 'warn' : 'offline');
    label.textContent = conn.status === 'online' ? 'ESP32 Online' : conn.status === 'demo' ? 'Mode Demo' : conn.status === 'connecting' ? 'Menghubungkan…' : 'ESP32 Offline';

    const unread = Store.unreadNotifCount();
    document.getElementById('hdr-notif-badge').style.display = unread ? 'block' : 'none';

    document.getElementById('conn-banner').classList.toggle('show', conn.status !== 'online');
    document.getElementById('conn-banner-text').textContent =
      conn.status === 'demo' ? 'Mode demo — belum terhubung ke ESP32 asli' :
      conn.status === 'connecting' ? 'Menghubungkan ke ESP32…' : 'Tidak terhubung ke ESP32';
  }

  function bindChrome() {
    document.getElementById('btn-menu').onclick = openDrawer;
    document.getElementById('drawer-backdrop').onclick = closeDrawer;
    document.getElementById('btn-drawer-close').onclick = closeDrawer;
    document.getElementById('btn-notif').onclick = () => navigate('notifikasi');
    document.querySelectorAll('[data-page]').forEach((btn) => (btn.onclick = () => navigate(btn.dataset.page)));
    document.getElementById('fab-add-jadwal').onclick = () => PageJadwal.openForm(null);
  }

  function init() {
    Modal.mount();
    MockData.seed();

    [PageOverview, PagePakan, PageLampu, PageSuhu, PageKipas, PageAir, PageTelur, PageJadwal, PageRiwayat, PageNotifikasi, PagePengaturan]
      .forEach((p) => p.mount());

    Store.subscribe(renderHeader);
    renderHeader();
    // Trigger first paint for every page (subscriptions above only fire on future changes)
    [PageOverview, PagePakan, PageLampu, PageSuhu, PageKipas, PageAir, PageTelur, PageJadwal, PageRiwayat, PageNotifikasi, PagePengaturan]
      .forEach((p) => p.render());

    bindChrome();
    navigate('overview');
    KandangSocket.connect();
  }

  return { navigate, init };
})();

document.addEventListener('DOMContentLoaded', App.init);
