import content from './catalog.json' with { type: 'json' };
import overrides from './overrides.json' with { type: 'json' };

const EN = { ...content, ...overrides };
const KEY = 'erp.v1.language';
const storageRead = () => {
  if (typeof ERP_NOTEBOOK_BUILD === 'undefined' || !ERP_NOTEBOOK_BUILD) {
    try { return globalThis.localStorage?.getItem(KEY); } catch {}
  }
  return null;
};
const urlLanguage = () => {
  try { return new URLSearchParams(globalThis.location?.search).get('lang'); } catch { return null; }
};
const valid = (value) => value === 'en' || value === 'ar';
let active = valid(urlLanguage()) ? urlLanguage() : storageRead() === 'en' ? 'en' : 'ar';

export const language = () => active;
export const english = () => active === 'en';
export const textBi = (ar, en) => english() ? en : ar;
export const languageNames = { ar: 'العربية', en: 'English' };
export const fromEnglishCatalog = (value) => typeof value === 'string'
  ? value.replace(/^\s*([\s\S]*?)\s*$/u, (all, core) => Object.hasOwn(EN, core) ? all.replace(core, () => EN[core]) : all)
  : value;
export const t = (value) => english() ? fromEnglishCatalog(value) : value;

export const escapeLiteral = (s) => String(s ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const htmlText = (value) => english() ? escapeLiteral(t(value)) : value;

export function applyLanguage() {
  const html = document.documentElement;
  html.lang = active;
  html.dir = english() ? 'ltr' : 'rtl';
}

export function setLanguage(value) {
  if (!valid(value) || value === active) return false;
  active = value;
  let stored = false;
  if (typeof ERP_NOTEBOOK_BUILD === 'undefined' || !ERP_NOTEBOOK_BUILD) {
    try { localStorage.setItem(KEY, value); stored = true; } catch {}
  }
  // Do not change the route. A query already used to override language must
  // reflect the user's new selection, without adding a history entry.
  try {
    if (urlLanguage() || !stored) {
      const url = new URL(location.href);
      url.searchParams.set('lang', value);
      history.replaceState(null, '', url);
    }
  } catch {}
  applyLanguage();
  return true;
}

export function installLanguageControl(onChange) {
  applyLanguage();
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-site-language]');
    if (button && setLanguage(button.dataset.siteLanguage)) onChange(button.dataset.siteLanguage);
  });
}
