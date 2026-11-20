// Content block renderer — turns structured topic data into HTML.
// Content lives in data files; this renderer is presentation-only.
import { esc } from './util.js';
import { audioAlong, audioControls } from '../features/audio.js';
import { audioKey, examplesFrom, inlineExamples } from '../features/utterances.js';
import { english, language, textBi } from '../locale/index.js';

const enSpan = (s) => `<span class="en-inline">${esc(s)}</span>`;

// Latin-run charset: letters/digits plus punctuation/symbols that glue an English phrase together.
const LATIN_RUN = /((?:[A-Za-z0-9%°][A-Za-z0-9%° \u00A0.,'"’\-–—:;/()=+?!\u201C\u201D\u2190-\u21FF]*[A-Za-z0-9%°)\u201D’!?]|[A-Za-z0-9%°]))/g;
// A token is "latin-ish" if it contains no Arabic characters (safe to merge into one LTR span).
const hasArabic = (s) => /[\u0600-\u06FF]/.test(s);

export function renderInline(text, { audio = false } = {}) {
  // Allows **English** for inline English, and {{ipa}} for IPA inline.
  // Bidi strategy: tokenize **…** and {{…}}, then merge consecutive Latin-ish tokens
  // (marked or plain) into a single <span dir="ltr"> so English phrases keep their
  // natural order inside RTL Arabic text — "I **didn't go** / **didn't see**" must not
  // have its slash-punctuation reorder the spans.
  const authored = new Set(audio ? inlineExamples(text).map((v) => audioKey(v)) : []);
  const play = (encoded) => {
    if (!authored.size) return encoded;
    const source = encoded.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    const englishParts = examplesFrom(source, { teaching: true });
    return englishParts.length && englishParts.every((x) => authored.has(audioKey(x)))
      ? audioAlong(encoded, source, '', { teaching: true }) : encoded;
  };
  const parts = esc(text)
    .replace(/\*\*(.+?)\*\*/gs, (_, s) => `\u0001${play(s)}\u0002`)
    .replace(/\{\{(.+?)\}\}/gs, (_, s) => `\u0003${s}\u0004`)
    .replace(/(^|[^*])\*(?!\*)([^*\n]+?)\*(?!\*)/g, (_, pre, s) => `${pre}\u0005${play(s)}\u0006`)
    .split(/(\u0001[\s\S]*?\u0002|\u0003[\s\S]*?\u0004|\u0005[\s\S]*?\u0006)/g);

  const out = [];
  let buf = null; // accumulating latin-ish content for one merged span
  const flush = () => {
    if (buf !== null) {
      out.push(`<span class="en-inline" dir="ltr">${buf}</span>`);
      buf = null;
    }
  };
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('\u0001')) {
      const c = part.slice(1, -1);
      if (!hasArabic(c) && c.trim()) { buf = buf === null ? c : buf + c; continue; }
      flush();
      out.push(`<span class="en-inline" dir="ltr">${c}</span>`);
      continue;
    }
    if (part.startsWith('\u0003')) {
      flush();
      out.push(`<span class="ipa" dir="ltr">${part.slice(1, -1)}</span>`);
      continue;
    }
    if (part.startsWith('\u0005')) {
      flush();
      out.push(`<span class="wf" dir="ltr">${part.slice(1, -1)}</span>`);
      continue;
    }
    // Plain segment: walk through its latin runs and non-latin gaps.
    const pieces = part.split(LATIN_RUN);
    for (const piece of pieces) {
      if (!piece) continue;
      if (!hasArabic(piece)) {
        // Latin run, separator (spaces, slash, punctuation) or both — mergeable.
        buf = buf === null ? piece : buf + piece;
        continue;
      }
      // Arabic text: isolate any embedded latin runs, keep the Arabic as-is.
      const sub = piece.split(LATIN_RUN);
      for (let j = 0; j < sub.length; j++) {
        const s = sub[j];
        if (!s) continue;
        if (!hasArabic(s)) { buf = buf === null ? s : buf + s; continue; }
        flush();
        out.push(s);
      }
    }
  }
  flush();
  const bare = audio && !authored.size && !hasArabic(text) && !/\{\{/.test(text) ? audioControls(text, '', { teaching: true }) : '';
  return out.join('') + bare;
}

export function renderBlocks(blocks, { anchor = '' } = {}) {
  if (!blocks) return '';
  let hIdx = 0;
  const study = (text) => renderInline(text, { audio: true });
  return blocks.map((b) => {
    switch (b.type) {
      case 'notebook': {
        const valid = /^(home|vowels|dipht|rcol|cons|letters|cmp|refs|s-(?:[1-9]|[1-3][0-9]|4[0-4]))$/.test(anchor);
        const anchorPart = valid ? `#${anchor}` : '';
        const url = `${b.path}?lang=${language()}${anchorPart}`;
        return `<section class="path-notebook" aria-label="دفتر IPA التفاعلي">
          <iframe src="${esc(url)}" title="دفتر أصوات الإنجليزية الأمريكية" sandbox="allow-scripts"></iframe>
          <a class="path-resource" href="${esc(url)}" target="_blank" rel="noopener">افتح الدفتر في تبويب مستقل</a>
        </section>`;
      }
      case 'try':
        return `<section class="path-practice"><p><strong>جرّب بنفسك</strong> ${study(b.prompt)}</p>
          <details><summary>أظهر الإجابة</summary><p>${study(b.answer)}</p></details></section>`;
      case 'links':
        return `<nav class="path-resources" aria-label="روابط للتطبيق والمراجعة">
          ${b.items.map(([label, href]) => `<a class="path-resource" href="${esc(href)}">${renderInline(label)}</a>`).join('')}</nav>`;
      case 'h': {
        const id = `sec-${hIdx++}`;
        return `<h3 id="${id}">${renderInline(b.ar)}</h3>`;
      }

      case 'p': return `<p>${study(b.ar)}</p>`;

      case 'list': return `<ul>${b.items.map((i) => `<li>${study(i)}</li>`).join('')}</ul>`;

      case 'ol': return `<ol>${b.items.map((i) => `<li>${study(i)}</li>`).join('')}</ol>`;

      case 'table': {
        const rows = b.rows.map((r) =>
          `<tr>${r.map((c) => `<td>${study(c)}</td>`).join('')}</tr>`).join('');
        const head = `<tr>${b.head.map((c) => `<th>${renderInline(c)}</th>`).join('')}</tr>`;
        return `<div class="tbl-wrap"><table${english() ? ' dir="ltr"' : ' dir="auto"'}>${head}${rows}</table></div>`;
      }

      case 'examples':
        return `<div class="example-list">${b.items.map((x) => `
          <div class="example-card">
            <div class="ex-en" lang="en" dir="ltr">${audioAlong(esc(x.en).replace(/\*(.+?)\*/g, '<span class="hl">$1</span>'), x.en, x.ipa)}</div>
            ${x.ipa ? `<div class="ex-ipa" dir="ltr">${esc(x.ipa)}</div>` : ''}
            ${x.ar ? `<div class="ex-ar">${renderInline(x.ar)}</div>` : ''}
          </div>`).join('')}</div>`;

      case 'wr': // wrong/right pairs
        return `<div>${b.pairs.map((p) => `
          <div class="wr-pair">
            <div class="wr-box wr-wrong">
              <span class="wr-label">✗ خطأ</span>
              <div class="wr-en">${esc(p.wrong)}</div>
            </div>
            <div class="wr-box wr-right">
              <span class="wr-label">✓ صواب</span>
              <div class="wr-en" lang="en" dir="ltr">${esc(p.right)}${audioControls(p.right)}</div>
            </div>
            <div class="wr-why">${study(p.why)}</div>
          </div>`).join('')}</div>`;

      case 'callout':
        return `<div class="callout ${b.kind}"><span class="co-label">${
          b.kind === 'warn' ? 'تنبيه' : b.kind === 'tip' ? 'ملاحظة مفيدة' : 'ملاحظة'
        }</span>${study(b.ar)}</div>`;

      case 'cmp': // side-by-side comparison
        return `<div class="cmp">
          ${b.cols.map((c) => `
            <div class="cmp-col">
              <div class="cmp-head">${renderInline(c.title)}</div>
              <ul>${c.items.map((i) => `<li>${study(i)}</li>`).join('')}</ul>
            </div>`).join('')}
        </div>`;

      case 'sounds': // structured sound cards (letters / combos pages)
        return `<div>${b.sounds.map((s) => `
          <div class="sound-card">
            <div class="sc-head">
              <span class="sc-sound">${esc(s.ipa)}</span>
              <span style="font-size:var(--text-sm);font-weight:600">${renderInline(s.label)}</span>
            </div>
            <div class="sc-desc">${renderInline(s.desc)}</div>
            <div class="sc-examples">
              ${s.examples.map((w) => `<span class="sc-word">${esc(w.w)} <span class="ipa">${esc(w.ipa ?? '')}</span></span>`).join('')}
            </div>
          </div>`).join('')}</div>`;

      case 'ipa-table': // grid of IPA symbols linking to sounds
        return `<div class="ipa-grid">${b.sounds.map((s) => `
          <a class="ipa-cell" href="#/fundamentals/t/${esc(s.id)}">
            <div class="ic-symbol">${esc(s.symbol)}</div>
            <div class="ic-name">${esc(s.nameAr)}</div>
            <div class="ic-ex">${esc(s.example)}</div>
          </a>`).join('')}</div>`;

      case 'letters-grid':
        return `<div class="letter-grid">${b.letters.map((l) =>
          `<a class="letter-tile" href="#/fundamentals/t/letter-${l.toLowerCase()}">${l}</a>`).join('')}</div>`;

      default:
        return '';
    }
  }).join('');
}
