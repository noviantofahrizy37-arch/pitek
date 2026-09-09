const Modal = (() => {
  let backdrop, sheet;
  function mount() {
    backdrop = document.getElementById('modal-backdrop');
    sheet = document.getElementById('modal-sheet');
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  }
  function open(html) {
    sheet.innerHTML = `<div class="modal-handle"></div>${html}`;
    backdrop.classList.add('open');
  }
  function close() { backdrop.classList.remove('open'); }
  return { mount, open, close };
})();
