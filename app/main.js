// Bootstrap
import { buildIndex } from './search/search.js';
import { navigate, rerenderLanguage } from './navigation/router.js';
import { installLanguageControl } from './locale/index.js';
import { installAudio } from './features/audio.js';

buildIndex();
installAudio();
installLanguageControl(rerenderLanguage);
window.addEventListener('hashchange', navigate);
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', navigate, { once: true });
else navigate();

// Sidebar collapse toggle (mobile)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-toggle-sb]');
  if (!btn) return;
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('collapsed');
});

// Home page: hero search + hint chips open the global search
document.addEventListener('input', (e) => {
  if (e.target.id === 'home-search') {
    const gs = document.getElementById('global-search-input');
    if (gs && gs.value !== e.target.value) { gs.value = e.target.value; gs.dispatchEvent(new Event('input')); }
  }
});
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.hint-chip');
  if (!chip) return;
  const gs = document.getElementById('global-search-input');
  if (!gs) return;
  gs.value = chip.dataset.q || '';
  gs.dispatchEvent(new Event('input'));
  gs.focus();
});
