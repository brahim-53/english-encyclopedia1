// Shared dictionary access — used by the Word Analyzer tool and smart search.
// Data sources (both lazy-loaded as classic <script> tags so file:// works):
//   - CMUdict shards: public/dict/<letter>.js  — GA pronunciation (authoritative).
//   - CEFR Arabic meanings: public/dict/cefr-ar.js — meanings/levels only,
//     never pronunciation.
//   - Ending-pattern words: public/dict/endings.js — precomputed by
//     data/build-cefr.py (common words per pattern, IPA from CMUdict).
const shardCache = {};
let cefrLoaded = null;

function loadScript(src) {
  return new Promise((resolve) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = el.onerror = () => resolve(!!window.__CMU || !!window.__ERP_CEFR || !!window.__ERP_ENDINGS);
    document.head.appendChild(el);
  });
}

// CMUdict lookup: returns array of ARPAbet phone-lists (all documented
// pronunciations) or null when the word is not in the dictionary.
export async function lookupPhones(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z']/g, '');
  if (!w) return null;
  const key = /^[a-z]/.test(w) ? w[0] : '_';
  if (!shardCache[key]) {
    window.__CMU = window.__CMU || {};
    if (!window.__CMU[key]) {
      await loadScript(`public/dict/${key}.js`);
    }
    shardCache[key] = window.__CMU[key] || null;
  }
  const raw = shardCache[key]?.[w];
  if (!raw) return null;
  return raw.map((line) => line.split(' '));
}

// CEFR Arabic meaning + level for common words. null if unknown.
export async function lookupArabicMeaning(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z' ]/g, '').trim();
  if (!w) return null;
  window.__ERP_CEFR = window.__ERP_CEFR || null;
  if (!window.__ERP_CEFR && !cefrLoaded) {
    cefrLoaded = loadScript('public/dict/cefr-ar.js');
    await cefrLoaded;
  }
  const entry = window.__ERP_CEFR?.[w];
  return entry ? { ar: entry[0], level: entry[1] } : null;
}

// Precomputed common words per spelling pattern (from data/build-cefr.py).
// Returns null if the pattern file is unavailable.
export async function lookupPatternWords(pattern) {
  if (!window.__ERP_ENDINGS) {
    await loadScript('public/dict/endings.js');
  }
  return window.__ERP_ENDINGS?.[pattern] || null;
}

export function cefrReady() {
  return !!window.__ERP_CEFR;
}
