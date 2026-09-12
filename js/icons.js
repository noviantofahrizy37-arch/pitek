// icons.js — minimal safe placeholder map
// Defines `window.ICONS` with compact inline SVG strings that are safe
// to include in JS (no XML prolog, no DOCTYPE, no comments). A runtime
// loader (`js/icon-loader.js`) will attempt to fetch and sanitize
// `asset/image/<key>.svg` and overwrite these placeholders.

/* eslint-disable quotes */
window.ICONS = window.ICONS || {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17H9v-6a3 3 0 1 1 6 0v6z"/><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V19a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9"/></svg>',
  feed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18l-1.4 8.2a2 2 0 0 1-2 1.8H6.4a2 2 0 0 1-2-1.8L3 10z"/></svg>',
  lamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.45 1.1 1.15 1.1 1.95V16h5v-.25c0-.8.5-1.5 1.1-1.95A6 6 0 0 0 12 3z"/></svg>',
  thermo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v10"/><path d="M9 21h6"/></svg>',
  droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',
  egg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c4.4 0 7-3.3 7-8 0-5-3.5-10-7-10S5 8 5 13c0 4.7 2.6 8 7 8z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4.5H7.5"/><path d="M12 8v4.5l3 2"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1 1 0 0 0 .1-1.1l-1-1.7a1 1 0 0 0-.7-.4l-2.1-.3a6 6 0 0 0-1.2-1.2l-.3-2.1a1 1 0 0 0-.4-.7l-1.7-1a1 1 0 0 0-1.1.1l-1.3 1.3a1 1 0 0 0-.3.8l.2 2.1a6 6 0 0 0-1.2 1.2l-2.1.3a1 1 0 0 0-.7.4l-1 1.7a1 1 0 0 0 .1 1.1l1.3 1.3a1 1 0 0 0 .8.3l2.1-.2a6 6 0 0 0 1.2 1.2l.3 2.1a1 1 0 0 0 .4.7l1.7 1a1 1 0 0 0 1.1-.1l1.3-1.3a1 1 0 0 0 .3-.8l-.2-2.1a6 6 0 0 0 1.2-1.2l2.1.3a1 1 0 0 0 .7-.4l1-1.7z"/></svg>',
  fan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"/><path d="M12 10c-2-2-5-4-7-3-2 1-1 4 1 6"/><path d="M12 14c2 2 5 4 7 3 2-1 1-4-1-6"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8v-2h-2"/><path d="M4 16v2h2"/><path d="M21 12a9 9 0 1 0-3.1 6.9"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.5a15 15 0 0 1 19 0"/><path d="M5.8 13a10.4 10.4 0 0 1 12.4 0"/><path d="M9 16.5a5.7 5.7 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17.5 15 6.5l2.5 2.5L6.5 20H4v-2.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 4.3 2.9 17.5A1.5 1.5 0 0 0 4.2 20h15.6a1.5 1.5 0 0 0 1.3-2.5L13.7 4.3a1.5 1.5 0 0 0-3.4 0Z"/><path d="M12 10v3.5M12 16.5h.01"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M6.5 6.5a8 8 0 1 0 11 0"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 3-8.5 10.5H11L10.5 21l8.5-10.5H12L13 3Z"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10"/><path d="M4 7h6M14 7h6"/><path d="M4 7l-2 5a3 3 0 0 0 6 0L4 7ZM20 7l-2 5a3 3 0 0 0 6 0l-4-5Z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l3.5-4.5"/><circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none"/></svg>',
};

// Debug flag to confirm this script executed in the page context.
try { window.__ICONS_PLACEHOLDER = true; } catch (e) {}

// Keep file minimal and deterministic; loader will overwrite entries when
// it successfully fetches sanitized SVG files from asset/image/.
// Compact icon set — minimal inline SVG strings (single-quoted)
// Keeps `ICONS` defined and small so the UI can render while we
// Minimal compact ICONS map. These are safe placeholders and will be
// overwritten by `js/icon-loader.js` when the corresponding SVG files
// are available in `asset/image/`.
var ICONS = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17H9v-6a3 3 0 1 1 6 0v6z"/><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V19a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9"/></svg>',
  feed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18l-1.4 8.2a2 2 0 0 1-2 1.8H6.4a2 2 0 0 1-2-1.8L3 10z"/></svg>',
  lamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.45 1.1 1.15 1.1 1.95V16h5v-.25c0-.8.5-1.5 1.1-1.95A6 6 0 0 0 12 3z"/></svg>',
  thermo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v10"/><path d="M9 21h6"/></svg>',
  droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',
  egg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c4.4 0 7-3.3 7-8 0-5-3.5-10-7-10S5 8 5 13c0 4.7 2.6 8 7 8z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4.5H7.5"/><path d="M12 8v4.5l3 2"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1 1 0 0 0 .1-1.1l-1-1.7a1 1 0 0 0-.7-.4l-2.1-.3a6 6 0 0 0-1.2-1.2l-.3-2.1a1 1 0 0 0-.4-.7l-1.7-1a1 1 0 0 0-1.1.1l-1.3 1.3a1 1 0 0 0-.3.8l.2 2.1a6 6 0 0 0-1.2 1.2l-2.1.3a1 1 0 0 0-.7.4l-1 1.7a1 1 0 0 0 .1 1.1l1.3 1.3a1 1 0 0 0 .8.3l2.1-.2a6 6 0 0 0 1.2 1.2l.3 2.1a1 1 0 0 0 .4.7l1.7 1a1 1 0 0 0 1.1-.1l1.3-1.3a1 1 0 0 0 .3-.8l-.2-2.1a6 6 0 0 0 1.2-1.2l2.1.3a1 1 0 0 0 .7-.4l1-1.7z"/></svg>',
  fan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"/><path d="M12 10c-2-2-5-4-7-3-2 1-1 4 1 6"/><path d="M12 14c2 2 5 4 7 3 2-1 1-4-1-6"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8v-2h-2"/><path d="M4 16v2h2"/><path d="M21 12a9 9 0 1 0-3.1 6.9"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.5a15 15 0 0 1 19 0"/><path d="M5.8 13a10.4 10.4 0 0 1 12.4 0"/><path d="M9 16.5a5.7 5.7 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17.5 15 6.5l2.5 2.5L6.5 20H4v-2.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 4.3 2.9 17.5A1.5 1.5 0 0 0 4.2 20h15.6a1.5 1.5 0 0 0 1.3-2.5L13.7 4.3a1.5 1.5 0 0 0-3.4 0Z"/><path d="M12 10v3.5M12 16.5h.01"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M6.5 6.5a8 8 0 1 0 11 0"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 3-8.5 10.5H11L10.5 21l8.5-10.5H12L13 3Z"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10"/><path d="M4 7h6M14 7h6"/><path d="M4 7l-2 5a3 3 0 0 0 6 0L4 7ZM20 7l-2 5a3 3 0 0 0 6 0l-4-5Z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l3.5-4.5"/><circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none"/></svg>',
};

// no runtime sanitization here; loader will overwrite placeholders with
// sanitized external SVGs when available.

// No further runtime processing required for this compact set.
// Minimal hand-drawn line-icon set — no external icon font/CDN required.
// Usage: ICONS.home, ICONS.bell, etc. Each is a raw <svg> string using
// stroke="currentColor" so color is controlled via CSS `color`.

const ICONS = {
  home: `<?xml version="1.0" encoding="utf-8"?>

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Navigation / House_02">
<path id="Vector" d="M4 11.4522V16.8002C4 17.9203 4 18.4807 4.21799 18.9086C4.40973 19.2849 4.71547 19.5906 5.0918 19.7823C5.5192 20.0001 6.07899 20.0001 7.19691 20.0001H16.8031C17.921 20.0001 18.48 20.0001 18.9074 19.7823C19.2837 19.5906 19.5905 19.2849 19.7822 18.9086C20 18.4811 20 17.9216 20 16.8037V11.4522C20 10.9179 19.9995 10.6506 19.9346 10.4019C19.877 10.1816 19.7825 9.97307 19.6546 9.78464C19.5102 9.57201 19.3096 9.39569 18.9074 9.04383L14.1074 4.84383C13.3608 4.19054 12.9875 3.86406 12.5674 3.73982C12.1972 3.63035 11.8026 3.63035 11.4324 3.73982C11.0126 3.86397 10.6398 4.19014 9.89436 4.84244L5.09277 9.04383C4.69064 9.39569 4.49004 9.57201 4.3457 9.78464C4.21779 9.97307 4.12255 10.1816 4.06497 10.4019C4 10.6506 4 10.9179 4 11.4522Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`,
  feed: `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
   viewBox="0 0 65.555 65.555" xml:space="preserve">
<g>
 	<path style="fill:#1D1D1B;" d="M59.51,33.55c-3.509-6.595-11.311-7.927-15.481-13.781c-0.603-0.847-1.989-0.085-1.421,0.83
    c2.19,3.528,5.452,5.264,8.813,7.509c5.366,3.583,8.46,8.567,8.251,15.167C59.22,57.544,43.596,64.458,31.174,63.52
    c-13.1-0.988-31.1-9.107-23.651-25.362c5.028-10.973,17.414-12.46,25.929-19.48c3.21,1.222,7.07,1.471,10.257,0.479
    c0.414-0.129,0.519-0.634,0.344-0.951c0.072-0.233,0.03-0.502-0.191-0.694c0.26,0.014,0.533-0.102,0.648-0.408
    c0.46-1.22,0.187-2.183-0.505-2.932c0.818-0.455,0.974-1.448,0.641-2.387c-0.166-0.467-0.455-0.854-0.821-1.179
    c2.123-0.326,3.986-2.128,3.262-4.479c-0.335-1.088-1.29-1.854-2.439-1.867c-0.506-0.006-1.006,0.138-1.422,0.399
    c-0.005-0.048-0.007-0.1-0.014-0.145c-0.155-1.007-0.74-1.965-1.64-2.472c-1.548-0.871-3.404-0.075-4.198,1.339
    c-1.387-2.15-4.315-4.703-6.034-2.587c-2.022,2.488,0.717,6.552,2.356,8.474c-1.466,0.512-2.338,1.509-1.354,3.334
    c0.035,0.064,0.083,0.105,0.136,0.136c-0.823,0.377-1.499,0.93-1.588,1.754c-0.073,0.684,0.279,1.185,0.787,1.392
    c-0.259,0.332-0.345,0.758-0.123,1.313c0.014,0.037,0.038,0.061,0.058,0.091c-0.12,0.213-0.105,0.502,0.163,0.645
    c0.139,0.074,0.291,0.133,0.434,0.203c-10.81,6.456-25.572,9.632-28.044,24.084C1.653,56.901,16.28,63.672,28.445,65.246
    c12.586,1.629,27.818-3.104,32.202-16.32C62.298,43.947,61.99,38.21,59.51,33.55z M34.175,17.53
    c-0.135-0.221-0.413-0.361-0.673-0.194c-0.019,0.012-0.039,0.024-0.058,0.036c-0.325-0.076-0.656-0.163-0.988-0.25
    c0.003-0.053,0.001-0.109-0.017-0.171c-0.47-1.582,5.608-0.717,5.972-0.633c1.442,0.335,2.738,0.938,3.972,1.705
    C39.507,18.224,36.936,18.107,34.175,17.53z M32.44,2.798c0.251-2.767,3.909,1.984,4.667,2.613c0.43,0.356,1.138,0.033,0.979-0.567
    c0.243-1.237,1.906-2.227,2.964-1.295c0.416,0.366,0.626,0.937,0.623,1.483c-0.003,0.564-0.394,1.034-0.239,1.59
    c0.065,0.233,0.311,0.448,0.564,0.43c0.336-0.025,0.583-0.182,0.773-0.403c0.16,0.01,0.321-0.059,0.425-0.251
    c0.681-1.26,2.484-0.832,2.54,0.601c0.068,1.759-1.783,2.19-3.168,2.098c-0.337-0.022-0.566,0.188-0.673,0.457
    c-0.79-0.276-1.61-0.452-2.282-0.578c-1.015-0.191-3.25-0.317-5.052,0.061c0.023-0.107,0.017-0.222-0.041-0.333
    C33.648,7.04,32.263,4.752,32.44,2.798z M39.665,10.321c1.659,0.354,4.118,1.013,3.554,3.193c-2.228-1.472-6.306-1.793-8.06-1.509
    c-0.535,0.087-1.325,0.231-2.081,0.492c0.016-0.063,0.021-0.13-0.005-0.205C31.973,9.123,38.733,10.121,39.665,10.321z
   	M33.205,13.797c0.452-0.205,0.921-0.358,1.408-0.457c0.975-0.232,2.028-0.303,3.031-0.245c1.582,0.093,6.65,1.057,5.678,3.681
    c-0.05,0.134-0.04,0.248-0.009,0.351c-2.343-1.571-5.161-2.472-7.997-2.368c-0.69,0.025-1.928,0.137-2.823,0.535
    C32.177,14.4,32.407,13.896,33.205,13.797z"/>
  <path style="fill:#1D1D1B;" d="M38.53,38.244c-3.883-3.226-9.467-2.261-13.782-0.512c-0.481,0.195-0.632,0.666-0.531,1.05
    c-1.999,7.734,10.091,15.532,15.752,8.951C42.55,44.735,41.361,40.596,38.53,38.244z M38.375,46.712
    c-2.342,2.481-6.001,1.86-8.575,0.205c-2.879-1.85-4.208-4.431-4.685-7.593c0.025-0.005,0.045,0.001,0.071-0.005
    c3.134-0.832,6.5-2.003,9.742-0.97C38.235,39.403,41.321,43.591,38.375,46.712z"/>
  <path style="fill:#1D1D1B;" d="M38.703,44.451c-1.289-0.374-2.608-0.273-3.9-0.781c-1.275-0.501-2.648-1.368-3.587-2.377
    c-0.242-0.26-0.694,0.08-0.497,0.384c0.93,1.434,1.882,2.476,3.457,3.251c1.273,0.626,3.132,1.246,4.527,0.754
    C39.282,45.478,39.335,44.635,38.703,44.451z"/>
</g>
</svg>`,
  lamp: `<?xml version="1.0" encoding="utf-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
<path d="M13,5A5,5,0,0,0,8,0,5.74,5.74,0,0,0,6.92.11,5,5,0,0,0,4.6,8.64,3.5,3.5,0,0,1,5.7,10.8h0A.7.7,0,0,0,5.21,12a.7.7,0,0,0,0,1,.7.7,0,0,0,.49,1.2H6a2,2,0,0,0,4,0h.32a.7.7,0,0,0,.49-1.2.7.7,0,0,0,0-1,.7.7,0,0,0-.49-1.2h0a3.5,3.5,0,0,1,1.1-2.16A5,5,0,0,0,13,5ZM8.9,10.8H7.1A4.9,4.9,0,0,0,5.55,7.61a3.54,3.54,0,0,1-1.09-3.3A3.58,3.58,0,0,1,7.2,1.48,4.43,4.43,0,0,1,8,1.4,3.6,3.6,0,0,1,11.6,5a3.51,3.51,0,0,1-1.15,2.61A4.9,4.9,0,0,0,8.9,10.8ZM8,2.5v1A1.5,1.5,0,0,1,9.5,5h1A2.5,2.5,0,0,0,8,2.5Z"/>
</svg>`,
  thermo: `<?xml version="1.0" encoding="utf-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 15.9998C11.4477 15.9998 11 16.4475 11 16.9998C11 17.5521 11.4477 17.9998 12 17.9998C12.5523 17.9998 13 17.5521 13 16.9998C13 16.4475 12.5523 15.9998 12 15.9998ZM12 15.9998V6M12 16.9998L12.0071 17.0069M16 16.9998C16 19.209 14.2091 20.9998 12 20.9998C9.79086 20.9998 8 19.209 8 16.9998C8 15.9854 8.37764 15.0591 9 14.354L9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V14.354C15.6224 15.0591 16 15.9854 16 16.9998Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  droplet: `<?xml version="1.0" encoding="utf-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Environment / Water_Drop">
<path id="Vector" d="M16.0001 13.3848C16.0001 14.6088 15.526 15.7828 14.6821 16.6483C14.203 17.1397 13.6269 17.5091 13 17.7364M19 13.6923C19 7.11538 12 2 12 2C12 2 5 7.11538 5 13.6923C5 15.6304 5.7375 17.4893 7.05025 18.8598C8.36301 20.2302 10.1436 20.9994 12.0001 20.9994C13.8566 20.9994 15.637 20.2298 16.9497 18.8594C18.2625 17.4889 19 15.6304 19 13.6923Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`,
  egg: `<?xml version="1.0" encoding="utf-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g>
<path d="M12 21c4.4 0 7-3.3 7-8 0-5-3.5-10-7-10S5 8 5 13c0 4.7 2.6 8 7 8Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`,
  calendar: `<?xml version="1.0" encoding="utf-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19,4H17V3a1,1,0,0,0-2,0V4H9V3A1,1,0,0,0,7,3V4H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V7A3,3,0,0,0,19,4Zm1,15a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V12H20Zm0-9H4V7A1,1,0,0,1,5,6H7V7A1,1,0,0,0,9,7V6h6V7a1,1,0,0,0,2,0V6h2a1,1,0,0,1,1,1Z"/></svg>`,
  history: `<?xml version="1.0" encoding="utf-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 8V12L14.5 14.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.60423 5.60423L5.0739 5.0739V5.0739L5.60423 5.60423ZM4.33785 6.87061L3.58786 6.87438C3.58992 7.28564 3.92281 7.61853 4.33408 7.6206L4.33785 6.87061ZM6.87963 7.63339C7.29384 7.63547 7.63131 7.30138 7.63339 6.88717C7.63547 6.47296 7.30138 6.13549 6.88717 6.13341L6.87963 7.63339ZM5.07505 4.32129C5.07296 3.90708 4.7355 3.57298 4.32129 3.57506C3.90708 3.57715 3.57298 3.91462 3.57507 4.32882L5.07505 4.32129ZM3.75 12C3.75 11.5858 3.41421 11.25 3 11.25C2.58579 11.25 2.25 11.5858 2.25 12H3.75ZM16.8755 20.4452C17.2341 20.2378 17.3566 19.779 17.1492 19.4204C16.9418 19.0619 16.483 18.9393 16.1245 19.1468L16.8755 20.4452ZM19.1468 16.1245C18.9393 16.483 19.0619 16.9418 19.4204 17.1492C19.779 17.3566 20.2378 17.2341 20.4452 16.8755L19.1468 16.1245ZM5.14033 5.07126C4.84598 5.36269 4.84361 5.83756 5.13505 6.13191C5.42648 6.42626 5.90134 6.42862 6.19569 6.13719L5.14033 5.07126ZM18.8623 5.13786C15.0421 1.31766 8.86882 1.27898 5.0739 5.0739L6.13456 6.13456C9.33366 2.93545 14.5572 2.95404 17.8017 6.19852L18.8623 5.13786ZM5.0739 5.0739L3.80752 6.34028L4.86818 7.40094L6.13456 6.13456L5.0739 5.0739ZM4.33408 7.6206L6.87963 7.63339L6.88717 6.13341L4.34162 6.12062L4.33408 7.6206ZM5.08784 6.86684L5.07505 4.32129L3.57507 4.32882L3.58786 6.87438L5.08784 6.86684ZM12 3.75C16.5563 3.75 20.25 7.44365 20.25 12H21.75C21.75 6.61522 17.3848 2.25 12 2.25V3.75ZM12 20.25C7.44365 20.25 3.75 16.5563 3.75 12H2.25C2.25 17.3848 6.61522 21.75 12 21.75V20.25ZM16.1245 19.1468C14.9118 19.8483 13.5039 20.25 12 20.25V21.75C13.7747 21.75 15.4407 21.2752 16.8755 20.4452L16.1245 19.1468ZM20.25 12C20.25 13.5039 19.8483 14.9118 19.1468 16.1245L20.4452 16.8755C21.2752 15.4407 21.75 13.7747 21.75 12H20.25ZM6.19569 6.13719C7.68707 4.66059 9.73646 3.75 12 3.75V2.25C9.32542 2.25 6.90113 3.32791 5.14033 5.07126L6.19569 6.13719Z" fill="#1C274C"/>
</svg>`,
  bell: `<?xml version="1.0" encoding="utf-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0009 5C13.4331 5 14.8066 5.50571 15.8193 6.40589C16.832 7.30606 17.4009 8.52696 17.4009 9.8C17.4009 11.7691 17.846 13.2436 18.4232 14.3279C19.1606 15.7133 19.5293 16.406 19.5088 16.5642C19.4849 16.7489 19.4544 16.7997 19.3026 16.9075C19.1725 17 18.5254 17 17.2311 17H6.77066C5.47638 17 4.82925 17 4.69916 16.9075C4.54741 16.7997 4.51692 16.7489 4.493 16.5642C4.47249 16.406 4.8412 15.7133 5.57863 14.3279C6.1558 13.2436 6.60089 11.7691 6.60089 9.8C6.60089 8.52696 7.16982 7.30606 8.18251 6.40589C9.19521 5.50571 10.5687 5 12.0009 5ZM12.0009 5V3M9.35489 20C10.0611 20.6233 10.9888 21.0016 12.0049 21.0016C13.0209 21.0016 13.9486 20.6233 14.6549 20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  settings: `<?xml version="1.0" encoding="utf-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.9046 3.06005C12.6988 3 12.4659 3 12 3C11.5341 3 11.3012 3 11.0954 3.06005C10.7942 3.14794 10.5281 3.32808 10.3346 3.57511C10.2024 3.74388 10.1159 3.96016 9.94291 4.39272C9.69419 5.01452 9.00393 5.33471 8.36857 5.123L7.79779 4.93281C7.3929 4.79785 7.19045 4.73036 6.99196 4.7188C6.70039 4.70181 6.4102 4.77032 6.15701 4.9159C5.98465 5.01501 5.83376 5.16591 5.53197 5.4677C5.21122 5.78845 5.05084 5.94882 4.94896 6.13189C4.79927 6.40084 4.73595 6.70934 4.76759 7.01551C4.78912 7.2239 4.87335 7.43449 5.04182 7.85566C5.30565 8.51523 5.05184 9.26878 4.44272 9.63433L4.16521 9.80087C3.74031 10.0558 3.52786 10.1833 3.37354 10.3588C3.23698 10.5141 3.13401 10.696 3.07109 10.893C3 11.1156 3 11.3658 3 11.8663C3 12.4589 3 12.7551 3.09462 13.0088C3.17823 13.2329 3.31422 13.4337 3.49124 13.5946C3.69158 13.7766 3.96395 13.8856 4.50866 14.1035C5.06534 14.3261 5.35196 14.9441 5.16236 15.5129L4.94721 16.1584C4.79819 16.6054 4.72367 16.829 4.7169 17.0486C4.70875 17.3127 4.77049 17.5742 4.89587 17.8067C5.00015 18.0002 5.16678 18.1668 5.5 18.5C5.83323 18.8332 5.99985 18.9998 6.19325 19.1041C6.4258 19.2295 6.68733 19.2913 6.9514 19.2831C7.17102 19.2763 7.39456 19.2018 7.84164 19.0528L8.36862 18.8771C9.00393 18.6654 9.6942 18.9855 9.94291 19.6073C10.1159 20.0398 10.2024 20.2561 10.3346 20.4249C10.5281 20.6719 10.7942 20.8521 11.0954 20.94C11.3012 21 11.5341 21 12 21C12.4659 21 12.6988 21 12.9046 20.94C13.2058 20.8521 13.4719 20.6719 13.6654 20.4249C13.7976 20.2561 13.8841 20.0398 14.0571 19.6073C14.3058 18.9855 14.9961 18.6654 15.6313 18.8773L16.1579 19.0529C16.605 19.2019 16.8286 19.2764 17.0482 19.2832C17.3123 19.2913 17.5738 19.2296 17.8063 19.1042C17.9997 18.9999 18.1664 18.8333 18.4996 18.5001C18.8328 18.1669 18.9994 18.0002 19.1037 17.8068C19.2291 17.5743 19.2908 17.3127 19.2827 17.0487C19.2759 16.8291 19.2014 16.6055 19.0524 16.1584L18.8374 15.5134C18.6477 14.9444 18.9344 14.3262 19.4913 14.1035C20.036 13.8856 20.3084 13.7766 20.5088 13.5946C20.6858 13.4337 20.8218 13.2329 2 [truncated]
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.5a15 15 0 0 1 19 0"/><path d="M5.8 13a10.4 10.4 0 0 1 12.4 0"/><path d="M9 16.5a5.7 5.7 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17.5 15 6.5l2.5 2.5L6.5 20H4v-2.5Z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 4.3 2.9 17.5A1.5 1.5 0 0 0 4.2 20h15.6a1.5 1.5 0 0 0 1.3-2.5L13.7 4.3a1.5 1.5 0 0 0-3.4 0Z"/><path d="M12 10v3.5M12 16.5h.01"/></svg>`,
  power: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M6.5 6.5a8 8 0 1 0 11 0"/></svg>`,
  fan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.6"/><path d="M12 10.4c-1-1.7-3.7-4.2-6-3.3-2 .8-1.7 3.8.4 5.3M13.6 12c1.7 1 4.2 3.7 3.3 6-.8 2-3.8 1.7-5.3-.4M10.4 12c-1.7 1-4.2 3.7-3.3 6 .8 2 3.8 1.7 5.3-.4M13.6 12c1-1.7 3.7-4.2 6-3.3 2 .8 1.7 3.8-.4 5.3"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9L20 8"/><path d="M20.5 12A8.5 8.5 0 0 1 5.9 17.9L4 16"/><path d="M20 4v4h-4M4 20v-4h4"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 3-8.5 10.5H11L10.5 21l8.5-10.5H12L13 3Z"/></svg>`,
  scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10"/><path d="M4 7h6M14 7h6"/><path d="M4 7l-2 5a3 3 0 0 0 6 0L4 7ZM20 7l-2 5a3 3 0 0 0 6 0l-4-5Z"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  gauge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l3.5-4.5"/><circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none"/></svg>`,
};

// Remove any XML prolog / DOCTYPE lines from embedded SVG strings so they
// can be safely injected into HTML fragments. Some SVG files exported
// from editors include `<?xml ...?>` or `<!DOCTYPE ...>` which break when
// used inside innerHTML templates. Clean values in-place at load time.
Object.keys(ICONS).forEach((k) => {
  try {
    if (typeof ICONS[k] === 'string') {
      // 1) remove XML prolog and DOCTYPE
      let s = ICONS[k].replace(/<\?xml[\s\S]*?\?>\s*/gi, '').replace(/<!DOCTYPE[\s\S]*?>\s*/gi, '');
      // 2) remove HTML/XML comments (exporter metadata)
      s = s.replace(/<!--([\s\S]*?)-->/g, '');
      // 3) collapse repeated whitespace/newlines between tags to single spaces
      s = s.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
      ICONS[k] = s;
    }
  } catch (e) {
    // ignore
  }
});
