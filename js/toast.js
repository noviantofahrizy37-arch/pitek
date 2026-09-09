const Toast = (() => {
  let stack;
  function ensure() {
    if (!stack) stack = document.getElementById('toast-stack');
    return stack;
  }
  function show(message, kind = 'info') {
    const el = ensure();
    if (!el) return;
    const t = document.createElement('div');
    t.className = `toast ${kind === 'danger' ? 'danger' : kind === 'success' ? 'success' : ''}`.trim();
    t.textContent = message;
    el.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .25s'; }, 2600);
    setTimeout(() => t.remove(), 2900);
  }
  return { show };
})();
