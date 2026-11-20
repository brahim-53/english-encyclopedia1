import { PronunciationPlayer, errorMessage, updateButton, variantError } from './audio-core.js';
import { escapeLiteral, textBi } from '../locale/index.js';
export { audioAlong, audioButton, audioControls, audioPair } from './audio-core.js';

const frame = () => document.querySelector('.path-notebook iframe');
let player;
export const stopAudio = () => player?.stop();

function report(target, state, kind) {
  if (target.button) updateButton(target.button, state);
  if (target.frame) target.frame.postMessage({ type: 'erp:audio-state', token: target.token, state, kind }, '*');
  const stop = document.querySelector('[data-stop-audio]');
  if (stop) stop.disabled = !(state === 'playing' || state === 'loading');
  const notice = document.querySelector('[data-audio-status]');
  if (!notice) return;
  if (state === 'error') {
    notice.textContent = kind === 'variant' ? variantError() : errorMessage();
    notice.classList.add('is-error');
    clearTimeout(report.timeout);
    report.timeout = setTimeout(() => { notice.textContent = ''; notice.classList.remove('is-error'); }, 8000);
  } else {
    notice.classList.remove('is-error');
    notice.textContent = state === 'playing'
      ? textBi('جارٍ التشغيل', 'Playing') + ': ' + target.text
      : state === 'loading' ? textBi('جارٍ تحميل الصوت', 'Loading audio') : '';
  }
}

export function audioPreferences() {
  const volume = player?.volume ?? 0.85;
  return `<details class="audio-settings">
    <summary aria-label="${textBi('إعدادات الصوت', 'Audio settings')}" title="${textBi('إعدادات الصوت', 'Audio settings')}">
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zM15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/></svg>
    </summary>
    <div class="audio-options">
      <label>${textBi('مستوى الصوت', 'Volume')} <input type="range" min="0" max="1" step=".05" value="${escapeLiteral(volume)}" data-audio-volume></label>
      <button type="button" class="action-button small" data-stop-audio disabled>${textBi('إيقاف الصوت', 'Stop audio')}</button>
      <small>${textBi('اضغط الزر بجوار المثال. اضغطه مرة أخرى للإعادة.', 'Use the button by an example. Press it again to replay.')}</small>
    </div>
  </details><div class="audio-status" role="status" data-audio-status></div>`;
}

export function installAudio() {
  player = new PronunciationPlayer(new URL('./public/audio/', document.baseURI), report);
  document.addEventListener('click', (event) => {
    const b = event.target.closest('[data-pronounce]');
    if (b) {
      const text = b.dataset.pronounce;
      player.play(text, b.dataset.pronounceIpa || '', { button: b, text }, b.hasAttribute('data-audio-exact'));
    }
    if (event.target.closest('[data-stop-audio]')) player.stop();
    const settings = document.querySelector('.audio-settings');
    if (settings?.open && !settings.contains(event.target)) settings.open = false;
  });
  document.addEventListener('input', (e) => { if (e.target.hasAttribute('data-audio-volume')) player.setVolume(e.target.value); });
  addEventListener('pagehide', () => player.stop());
  addEventListener('message', (event) => {
    const notebookFrame = frame();
    const source = notebookFrame?.contentWindow;
    const d = event.data;
    if (!source || event.source !== source) return;
    if (d?.type === 'erp:notebook-section' && typeof d.anchor === 'string' &&
      /^(?:home|vowels|dipht|rcol|cons|letters|cmp|refs|s-(?:[1-9]|[1-3][0-9]|4[0-4]))$/.test(d.anchor)) {
      notebookFrame.dataset.currentAnchor = d.anchor;
      return;
    }
    if (d?.type !== 'erp:pronounce' || !Number.isSafeInteger(d.token)
      || typeof d.text !== 'string' || typeof d.ipa !== 'string' || d.ipa.length > 75) return;
    player.play(d.text, d.ipa, { frame: source, text: d.text, token: d.token });
  });
}
