// Global search — indexes every topic in both sections.
// Matches: Arabic/English titles, summaries, keywords, example words,
// example sentences, IPA symbols, and category names.
// Smart-search layer (from the source project's idea, rebuilt here):
//   - "-tion"-style queries show a pattern card: the topic explaining the
//     pattern + common dictionary words that end with it.
//   - English-word queries show a word-analysis card: CMUdict IPA,
//     syllables/stress, Arabic meaning (CEFR list), and pattern links.
//     Clicking it opens the Word Analyzer with the word prefilled.
import { allTopics } from '../navigation/registry.js';
import { SECTIONS, findTopicAnywhere, topicHref } from '../navigation/registry.js';
import { notebookIndex } from '../../sections/fundamentals/data/notebook-index.js';
import { esc } from '../shared/util.js';
import { lookupPhones, lookupArabicMeaning, lookupPatternWords } from '../features/dict.js';
import { patternTopic, patternsInWord } from '../features/relations.js';
import { arpabetToIPA, syllabify, stressIndex } from '../../sections/fundamentals/tools/arpabet.js';
import { english, escapeLiteral, fromEnglishCatalog, textBi } from '../locale/index.js';
import { audioButton } from '../features/audio.js';

let INDEX = [];
let globalListenersBound = false;

function extractSearchableText(topic, localize = (s) => s) {
  const parts = [];
  const walk = (blocks) => {
    for (const b of blocks || []) {
      if (b.ar) parts.push(b.ar);
      if (b.en) parts.push(b.en);
      if (b.prompt) parts.push(b.prompt, b.answer);
      if (b.items) b.items.forEach((i) => typeof i === 'string' ? parts.push(i) : parts.push(i.en || '', i.ar || ''));
      if (b.pairs) b.pairs.forEach((p) => parts.push(p.wrong, p.right, p.why));
      if (b.rows) b.rows.forEach((r) => parts.push(...r));
      if (b.sounds) b.sounds.forEach((s) => parts.push(s.label, s.ipa || ''));
      if (b.cols) b.cols.forEach((c) => parts.push(c.title, ...(c.items || [])));
    }
  };
  walk(topic.blocks);
  return parts.map(localize).join(' \n ');
}

export function buildIndex() {
  INDEX = allTopics().map((t) => {
    const cat = SECTIONS[t.sectionId].categories.find((c) => c.id === t.cat);
    return {
      id: t.id,
      sectionId: t.sectionId,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      summary: t.summaryAr || '',
      cat: cat ? cat.titleAr : '',
      keywords: (t.kw || []).join(' '),
      text: extractSearchableText(t),
      textEn: extractSearchableText(t, fromEnglishCatalog),
      summaryEn: fromEnglishCatalog(t.summaryAr || ''),
      catEn: cat?.titleEn || '',
    };
  });
  const notebook = INDEX.find((t) => t.sectionId === 'fundamentals' && t.id === 'ipa-overview');
  INDEX.push(...notebookIndex.map(([anchor, indexTitle, keywords, contents, keywordsEn, textEn, indexTitleEn]) =>
    ({ ...notebook, anchor, indexTitle, indexTitleEn, keywords: keywords + ' ' + keywordsEn, text: contents, textEn, summary: '', summaryEn: '' })));
}

function normalizeAr(s) {
  return s
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .toLowerCase();
}

function highlight(text, q) {
  // strip inline markup markers ({{ipa}}, **) so snippets read naturally
  text = text.replace(/\{\{(.+?)\}\}/gs, '$1').replace(/\*\*/g, '');
  if (!q) return esc(text);
  const nq = normalizeAr(q);
  const nt = normalizeAr(text);
  if (!nt.includes(nq)) return esc(text);
  const idx = nt.indexOf(nq);
  const start = Math.max(0, idx - 40);
  const clip = text.slice(start, idx + nq.length + 60);
  const i2 = normalizeAr(clip).indexOf(nq);
  const before = clip.slice(0, i2);
  const match = clip.slice(i2, i2 + nq.length);
  const after = clip.slice(i2 + nq.length);
  return esc((start > 0 ? '…' : '') + before) + '<mark>' + esc(match) + '</mark>' + esc(after + '…');
}

export function search(query, limit = 12, sectionFilter = null) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const nq = normalizeAr(q);
  const results = [];
  for (const t of INDEX) {
    if (sectionFilter && t.sectionId !== sectionFilter) continue;
    let score = 0;
    const tAr = normalizeAr(t.anchor ? '' : t.titleAr), tEn = (t.indexTitleEn || t.titleEn).toLowerCase();
    if (tEn === q) score += 100;
    else if (tEn.startsWith(q)) score += 60;
    else if (tEn.includes(q)) score += 30;
    if (tAr.includes(nq)) score += 50;
    if (!t.anchor && (normalizeAr(t.cat).includes(nq) || t.catEn.toLowerCase().includes(q))) score += 20;
    if (t.keywords.toLowerCase().includes(q) || normalizeAr(t.keywords).includes(nq)) score += 40;
    if ((t.summary && normalizeAr(t.summary).includes(nq)) || t.summaryEn.toLowerCase().includes(q)) score += 12;
    if (t.text.toLowerCase().includes(q) || normalizeAr(t.text).includes(nq) || t.textEn.toLowerCase().includes(q)) score += 8;
    // IPA symbol exact match
    if (q.startsWith('/') || /^[a-zɑæʃɪʊðθʒːˈəɔɛɝɛɹaɪeɪɔɪaʊoʊʌɪ]/.test(q)) {
      if (t.text.includes(q)) score += 15;
    }
    if (score > 0) {
      const snippetSource = english() ? t.summaryEn || (t.indexTitleEn + ' · ' + t.textEn) : t.summary || t.text;
      results.push({ ...t, score, snippet: highlight(snippetSource, q) });
    }
  }
  const seen = new Set();
  return results.sort((a, b) => b.score - a.score).filter((t) => {
    const key = `${t.sectionId}/${t.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

export function attachGlobalSearch() {
  const input = document.getElementById('global-search-input');
  const box = document.getElementById('search-results');
  if (!input || !box) return;

  const run = () => {
    const q = input.value.trim();
    if (!q) { box.classList.remove('open'); box.innerHTML = ''; return; }
    const results = search(q, 12);
    if (!results.length) {
      box.innerHTML = '<div class="search-empty">لا توجد نتائج مطابقة. جرّب مصطلحًا بالإنجليزية أو العربية أو رمز IPA.</div>';
    } else {
      box.innerHTML = results.map((r) => `
        <a class="search-result-item" role="option" href="${esc(topicHref(r.sectionId, r.id, r.anchor))}">
          <div class="sr-title">
            <span class="sr-badge ${r.sectionId === 'fundamentals' ? 'fund' : 'gram'}">${r.sectionId === 'fundamentals' ? 'الأساسيات' : 'القواعد'}</span>
            ${esc(r.titleAr)} <span class="sr-en">${esc(english() ? r.indexTitleEn || '' : r.indexTitle || r.titleEn)}</span>
          </div>
          <div class="sr-desc">${r.snippet}</div>
        </a>`).join('');
    }
    box.classList.add('open');
    enhanceSmartCards(q, box);
  };

  input.addEventListener('input', run);
  input.addEventListener('focus', () => { if (input.value.trim()) run(); });
  // close results when navigating to a result
  box.addEventListener('click', (e) => { if (e.target.closest('a')) box.classList.remove('open'); });
  if (!globalListenersBound) {
    globalListenersBound = true;
    // bound once; elements are looked up at event time (the shell is re-rendered on every route)
    document.addEventListener('click', (e) => {
      const b = document.getElementById('search-results');
      if (b && !e.target.closest('.global-search')) b.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      const inp = document.getElementById('global-search-input');
      const b = document.getElementById('search-results');
      if (!inp) return;
      if (e.key === '/' && document.activeElement !== inp && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault(); inp.focus();
      }
      if (e.key === 'Escape') { if (b) b.classList.remove('open'); inp.blur(); }
    });
  }
}

// ---------- Smart cards (pattern search + word analysis) ----------
// Async layer prepended to the results. All data comes from the platform's
// own sources (CMUdict shards, CEFR meanings file, endings file) — nothing
// is invented; if a lookup fails the card simply does not appear.
let smartCardSeq = 0;

export async function enhanceSmartCards(query, box) {
  if (!box) return;
  const seq = ++smartCardSeq;
  const q = query.trim();
  let card = null;

  // 1) pattern search: -tion, -ed, -ly …
  const patMatch = q.match(/^-([a-z]{2,6})$/i);
  if (patMatch) {
    const pat = patMatch[1].toLowerCase();
    const topic = patternTopic(pat);
    const words = await lookupPatternWords(pat);
    if (topic || (words && words.length)) {
      const t = topic ? findTopicAnywhere(topic.id) : null;
      card = `
      <div class="smart-card" data-seq="${seq}">
        <div class="sc-head">بحث نمط التهجئة: <bdi class="en">-${esc(pat)}</bdi></div>
        ${t ? `<a class="sc-topic" href="${esc(topicHref(topic.sectionId, topic.id, topic.anchor))}">${esc(t.titleAr)} — <span class="en">${esc(t.titleEn)}</span></a>` : ''}
        ${words && words.length ? `
        <div class="sc-words">
          <span class="sc-label">كلمات شائعة تنتهي بالنمط (نطقها من CMUdict):</span>
          ${words.slice(0, 8).map((w) => `<span class="sc-word-group"><a class="sc-word" href="#/tools/word-analyzer?w=${encodeURIComponent(w.w)}"${english() ? '' : ` title="${escapeLiteral(w.ar)}"`}><bdi class="en">${esc(w.w)}</bdi> <span class="ipa">${esc(w.ipa)}</span></a>${audioButton(w.w, w.ipa)}</span>`).join('')}
        </div>` : ''}
        <div class="sc-note">النطق موثق من CMUdict، والمعاني من قائمة CEFR المعربة — انقر كلمة لتحليلها الكامل في محلل الكلمات.</div>
      </div>`;
    }
  } else if (/^[a-z][a-z'-]{1,24}$/i.test(q) && !/[\u0600-\u06FF]/.test(q)) {
    // 2) word analysis card (single English word)
    const prons = await lookupPhones(q);
    if (prons) {
      const first = prons[0];
      const syls = syllabify(first);
      const sIdx = stressIndex(first);
      const ipa = arpabetToIPA(first);
      const meaning = await lookupArabicMeaning(q);
      const links = patternsInWord(q).slice(0, 6)
        .map((p) => ({ p, t: findTopicAnywhere(p.id) }))
        .filter((x) => x.t);
      card = `
      <div class="smart-card" data-seq="${seq}">
        <div class="sc-head">تحليل الكلمة: <bdi class="en">${esc(q.toLowerCase())}</bdi> ${audioButton(q, ipa)} <span class="ipa">/${esc(ipa)}/</span></div>
        <div class="sc-word-facts">
          <span>${syls.length} مقاطع${sIdx >= 0 ? ` · النبر على المقطع ${sIdx + 1}` : ''}${prons.length > 1 ? ` · ${prons.length} نُطق موثقة` : ''}</span>
          ${meaning ? english()
            ? `<span>${meaning.level ? `CEFR ${esc(meaning.level)} · ` : ''}${textBi('الشرح العربي في المحلل', 'Arabic gloss available in the analyzer')}</span>`
            : `<span>المعنى: ${escapeLiteral(meaning.ar)}${meaning.level ? ` (${esc(meaning.level)})` : ''}</span>` : ''}
        </div>
        ${links.length ? `<div class="sc-words"><span class="sc-label">أنماط موسوعية في الكلمة:</span>
          ${links.map(({ p, t }) => `<a class="sc-word" href="${esc(topicHref(p.sectionId, p.id, p.anchor))}">${esc(t.titleAr)} ←</a>`).join('')}</div>` : ''}
        <a class="sc-analyze" href="#/tools/word-analyzer?w=${encodeURIComponent(q.toLowerCase())}">فتح التحليل الكامل في محلل الكلمات ←</a>
      </div>`;
    }
  }

  // only apply if the user hasn't searched for something newer
  if (card && seq === smartCardSeq && box.classList.contains('open')) {
    box.insertAdjacentHTML('afterbegin', card);
  }
}

// Section-specific search, mounted in a section's sidebar.
export function attachSectionSearch(sectionId, accentClass) {
  const input = document.getElementById('section-search-input');
  const out = document.getElementById('section-search-results');
  if (!input || !out) return;
  const run = () => {
    const q = input.value.trim();
    if (!q) { out.innerHTML = ''; out.classList.remove('has'); return; }
    const results = search(q, 12, sectionId);
    if (!results.length) {
      out.innerHTML = '<div style="font-size:var(--text-xs);color:var(--color-text-muted);padding:var(--space-2) var(--space-3)">لا توجد نتائج مطابقة في هذا القسم.</div>';
    } else {
      out.innerHTML = results.map((r) => `
        <a href="${esc(topicHref(r.sectionId, r.id, r.anchor))}">${esc(r.titleAr)} <span class="count" dir="ltr">${esc(english() ? r.indexTitleEn || '' : r.indexTitle || r.titleEn)}</span></a>`).join('');
    }
    out.classList.add('has');
  };
  input.addEventListener('input', run);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { input.value = ''; run(); }
    if (event.key === 'ArrowDown') { const result = out.querySelector('a'); if (result) { event.preventDefault(); result.focus(); } }
  });
}
