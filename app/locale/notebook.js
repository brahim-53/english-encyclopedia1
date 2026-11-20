import { applyLanguage, english, t, textBi } from './index.js';
import { audioButton, errorMessage, updateButton, PronunciationPlayer } from '../features/audio-core.js';

applyLanguage();
const isEmbedded = window.parent !== window;
const live = document.createElement('div');
live.className = 'nb-audio-status';
live.setAttribute('role', 'status');
document.body.append(live);
const buttons = new Map();
const paint = (button, state) => {
  updateButton(button, state);
  live.textContent = state === 'error' ? errorMessage() : '';
};
const standalone = isEmbedded ? null : new PronunciationPlayer(new URL('../audio/', document.baseURI), paint);
if (isEmbedded) {
  const jump = (anchor) => {
    const section = document.getElementById(anchor);
    if (!section) return false;
    section.scrollIntoView({ block: 'start' });
    window.parent.postMessage({ type: 'erp:notebook-section', anchor }, '*');
    return true;
  };
  // Some browsers bar even same-document target navigation from a sandboxed
  // local file. Resolve trusted internal anchors within the document instead.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link && jump(link.getAttribute('href').slice(1))) e.preventDefault();
  });
  if (location.hash) addEventListener('load', () => jump(location.hash.slice(1)), { once: true });
}
let token = 0;
document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-pronounce]');
  if (!button) return;
  const { pronounce: text, pronounceIpa: ipa = '' } = button.dataset;
  if (standalone) standalone.play(text, ipa, button);
  else {
    for (const old of buttons.values()) updateButton(old, 'idle');
    buttons.clear();
    buttons.set(++token, button);
    updateButton(button, 'loading');
    window.parent.postMessage({ type: 'erp:pronounce', token, text, ipa }, '*');
  }
});
window.addEventListener('message', (e) => {
  const d = e.data;
  if (e.source === window.parent && d?.type === 'erp:audio-state' && buttons.has(d.token)) {
    paint(buttons.get(d.token), d.state);
  }
});
window.addEventListener('pagehide', () => standalone?.stop());

function translateStatic() {
  if (!english()) return;
  document.title = textBi('دفتر أصوات الإنجليزية الأمريكية', 'General American Sounds');
  const parts = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (parts.nextNode()) {
    const node = parts.currentNode;
    if (!node.parentElement.closest('script, style')) node.nodeValue = t(node.nodeValue);
  }
  for (const node of document.querySelectorAll('[placeholder],[aria-label],[title]')) {
    for (const attr of ['placeholder', 'aria-label', 'title']) {
      if (node.hasAttribute(attr)) node.setAttribute(attr, t(node.getAttribute(attr)));
    }
  }
}
translateStatic();
window.NotebookAddons = { t, audioButton, english };
