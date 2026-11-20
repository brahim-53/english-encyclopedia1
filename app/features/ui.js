// Tiny toast helper — ported concept from the source project, rebuilt
// without global mutable timers and safe when the toast element is missing.
let toastTimer = null;

export function toast(message) {
  let el = document.querySelector('.erp-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'erp-toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
