// Authored display strings are localized at the presentation boundary.
// Identity keys, URLs, user input and audio attributes can use escapeLiteral.
import { t, escapeLiteral, textBi } from '../locale/index.js';
export const esc = (s) => escapeLiteral(t(s));

export const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export const fmt = (tpl, ...args) => tpl.replace(/\{(\d+)\}/g, (_, i) => args[+i]);

// Arabic pluralize helper for counts
export const topicCount = (n) => `${n} ${textBi('موضوعًا', n === 1 ? 'topic' : 'topics')}`;

export const debounce = (fn, ms = 150) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};
