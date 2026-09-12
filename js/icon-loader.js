// Loads SVG files from asset/image/ into window.ICONS, sanitizing them for safe
// innerHTML insertion. If a file is missing, keeps the existing ICONS[key].
(function(){
  if (typeof window === 'undefined') return;
  // start with any existing ICONS (declared as var/const) or empty object
  const existing = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));
  window.ICONS = window.ICONS || existing;

  const filesDir = 'asset/image/';

  function kebab(str){
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[_\s]+/g,'-').toLowerCase();
  }

  const special = {
    chevronRight: 'chevron-right',
    setting: 'setting',
    settings: 'setting',
  };

  async function fetchAndSanitize(path){
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('not ok');
      let s = await res.text();
      s = s.replace(/<\?xml[\s\S]*?\?>/gi, '');
      s = s.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
      s = s.replace(/<!--([\s\S]*?)-->/g, '');
      // remove width/height attributes like width="800px" or width='24'
      s = s.replace(/\swidth=\"[^\"]*\"/gi, '').replace(/\sheight=\"[^\"]*\"/gi, '').replace(/\swidth='[^']*'/gi,'').replace(/\sheight='[^']*'/gi,'');
      // replace hard-coded colors with currentColor for consistency
      s = s.replace(/fill=\"#([0-9a-fA-F]{3,6})\"/g, 'fill="currentColor"');
      s = s.replace(/stroke=\"#([0-9a-fA-F]{3,6})\"/g, 'stroke="currentColor"');
      // collapse whitespace between tags
      s = s.replace(/>\s+</g, '><').trim();
      return s;
    } catch (e) {
      return null;
    }
  }

  async function loadAll(){
    let keys = Object.keys(window.ICONS || {});
    // If ICONS placeholders are missing (some builds embed ICONS differently),
    // use a sensible fallback list matching asset/image/*.svg filenames.
    if (!keys || keys.length === 0) {
      keys = ['menu','close','bell','plus','home','feed','lamp','thermo','droplet','egg','calendar','history','settings','fan','refresh','check','wifi','chevronRight','edit','trash','warning','power','bolt','scale','eye','clock','gauge','plus','feed','lamp','fan'];
    }
    await Promise.all(keys.map(async (k) => {
      // try variants: exact, kebab, special map
      const variants = [];
      variants.push(k + '.svg');
      variants.push(kebab(k) + '.svg');
      if (special[k]) variants.push(special[k] + '.svg');
      for (const v of variants){
        const path = filesDir + v;
        const svg = await fetchAndSanitize(path);
        if (svg) { window.ICONS[k] = svg; return; }
      }
      // leave existing value if fetch failed
    }));
  }

  // Start loading but don't block page — renders will use what is available.
  function refreshInjectedIcons(){
    try{
      const __ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));
      const btnMenu = document.getElementById('btn-menu'); if (btnMenu) btnMenu.innerHTML = __ICONS.menu || '';
      const menuBottomIconWrap = document.getElementById('btn-menu-bottom')?.querySelector('.nav-icon-wrap'); if (menuBottomIconWrap) menuBottomIconWrap.innerHTML = __ICONS.menu || '';
      const btnNotif = document.getElementById('btn-notif'); if (btnNotif) btnNotif.innerHTML = (__ICONS.bell || '') + (btnNotif.innerHTML||'');
      const btnDrawerClose = document.getElementById('btn-drawer-close'); if (btnDrawerClose) btnDrawerClose.innerHTML = (__ICONS.close || '');
      const fab = document.getElementById('fab-add-jadwal'); if (fab) fab.innerHTML = (__ICONS.plus || '');
      const NAV_ICON = { overview: __ICONS.home || '', pakan: __ICONS.feed || '', lampu: __ICONS.lamp || '', kipas: __ICONS.fan || '', notifikasi: __ICONS.bell || '' };
      document.querySelectorAll('.nav-btn[data-page]').forEach((btn) => {
        const wrap = btn.querySelector('.nav-icon-wrap'); if (wrap) wrap.innerHTML = NAV_ICON[btn.dataset.page] || '';
      });
      const DRAWER_META = {
        overview: [__ICONS.home || '', 'Overview'], suhu: [__ICONS.thermo || '', 'Suhu & Kelembapan'], air: [__ICONS.droplet || '', 'Air / Pompa'], telur: [__ICONS.egg || '', 'Telur'],
        pakan: [__ICONS.feed || '', 'Pakan'], lampu: [__ICONS.lamp || '', 'Lampu'], kipas: [__ICONS.fan || '', 'Kipas'], jadwal: [__ICONS.calendar || '', 'Jadwal'],
        riwayat: [__ICONS.history || '', 'Riwayat'], notifikasi: [__ICONS.bell || '', 'Notifikasi'], pengaturan: [__ICONS.settings || '', 'Pengaturan'],
      };
      document.querySelectorAll('.drawer-item[data-page]').forEach((a) => {
        const meta = DRAWER_META[a.dataset.page] || ['',''];
        const [icon, label] = meta;
        a.innerHTML = icon + '<span>' + label + '</span>';
      });
    }catch(e){/* ignore */}
  }

  loadAll().then(()=>{ try{ refreshInjectedIcons(); }catch(e){} }).catch(()=>{});
  // Also refresh after the full page load to ensure any later scripts that
  // injected icons earlier are updated with sanitized external SVGs.
  try { window.addEventListener('load', refreshInjectedIcons); } catch (e) {}
})();
