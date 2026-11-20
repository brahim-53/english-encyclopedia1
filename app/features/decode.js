// Read & Decode — an optional phonics application tool (Fundamentals).
// Step-by-step word decoding: graphemes → sounds → syllables → stress →
// blend → sentence. Rebuilt for this platform from the source project's
// trainer, with data verified against CMUdict (see decode-data.js header).
import { esc } from '../shared/util.js';
import { DECODE_LEVELS, DECODE_WORDS } from './decode-data.js';
import { english, t, textBi } from '../locale/index.js';
import { audioControls, audioPair, stopAudio } from './audio.js';

const positions = new Map();

export const decodeTool = {
  id: 'read-decode',
  titleAr: 'اقرأ وفك — Read & Decode',
  titleEn: 'Read & Decode',
  render() {
    return `
    <div class="tool-panel" id="tool-decode">
      <h2>اقرأ وفك — Read & Decode</h2>
      <p class="tool-desc">أداة تطبيق اختيارية لفك كلمات إنجليزية خطوة بخطوة: الجرافيمات (الحروف ومجموعاتها) ← الأصوات ← المقاطع ← النبر ← الدمج ← الجملة. تعتمد على بنك ثابت من 58 كلمة موزعة على 7 مستويات فونكس، ونطقها موثق من قاموس CMU.</p>
      <div class="filter-row" id="decode-levels">
        ${DECODE_LEVELS.map((l) => `<button class="filter-chip-btn" data-level="${l.id}" type="button">${esc(english() ? t(l.title).replace(/^Level \d+:\s*/i, '') : l.title.replace('المستوى ' + l.id + ': ', ''))}</button>`).join('')}
      </div>
      <p class="tool-note" id="decode-level-desc"></p>
      <div id="decode-card" class="decode-card"></div>
      <div class="tool-limits">
        <b>حدود الأداة:</b>
        <ul>
          <li>بنك الكلمات ثابت (58 كلمة مختارة لتغطية مستويات الفونكس) — إن أردت تحليل كلمات أخرى استخدم <a href="#/tools/word-analyzer">محلل الكلمات</a>.</li>
          <li>النطق المرجعي GA من CMUdict، وأي كلمة خارج القاموس لا تُخترع لها نطقة.</li>
          <li>${textBi('زر الاستماع يستخدم ملف النطق الأمريكي المرفق أولًا، ثم صوت الجهاز المحلي عند الحاجة. بعض الملفات مولّدة صوتيًا وليست تسجيلًا بشريًا.', 'Listen uses the bundled American English clip first, then an on-device voice if needed. Some clips are synthesized, not human recordings.')}</li>
        </ul>
      </div>
    </div>`;
  },
  mount(rootEl) {
    const panel = rootEl?.querySelector('#tool-decode');
    if (!panel) return;
    const card = panel.querySelector('#decode-card');
    const desc = panel.querySelector('#decode-level-desc');
    let level = 1;

    const render = () => {
      stopAudio();
      const l = DECODE_LEVELS.find((x) => x.id === level) || DECODE_LEVELS[0];
      const words = DECODE_WORDS.filter((w) => w.lv === level);
      let saved = positions.get(level);
      if (saved === undefined) {
        try { saved = Number(localStorage.getItem('erp.decode.' + level)); } catch { saved = 0; }
      }
      const idx = Math.min(Math.max(Number.isInteger(saved) ? saved : 0, 0), Math.max(words.length - 1, 0));
      const w = words[idx];
      desc.textContent = t(l.desc);
      panel.querySelectorAll('#decode-levels .filter-chip-btn').forEach((b) => {
        const active = Number(b.dataset.level) === level;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      if (!w) { card.innerHTML = '<div class="analyzer-note">لا كلمات في هذا المستوى.</div>'; return; }
      card.innerHTML = `
        <div class="analyzer-word">${audioPair(esc(w.w), w.w, w.ipa)} <span class="analyzer-ipa" dir="ltr">${esc(w.ipa)}</span></div>
        <div class="decode-meaning">${esc(w.ar)}</div>
        <div class="decode-steps">
          <div class="decode-step" data-step="1"><button class="decode-reveal" type="button">١ · اكشف: الجرافيمات والأصوات</button>
            <div class="decode-body hidden">
              <div class="g-row">${w.g.map((g) => `<span class="g-pair"><b>${esc(g[0])}</b><span class="ipa">${esc(g[1])}</span></span>`).join('<span class="g-plus">+</span>')}</div>
              <p class="muted">${esc(w.tip)}</p>
            </div></div>
          <div class="decode-step" data-step="2"><button class="decode-reveal" type="button">٢ · اكشف: المقاطع والنبر</button>
            <div class="decode-body hidden">
              <div class="syl-row">${w.syl.map((s, i) => `<span class="syl ${i === w.stress ? 'stressed' : ''}"><bdi class="en">${esc(s)}</bdi></span>`).join('')}</div>
              <p class="muted">${w.syl.length > 1 ? 'عدد المقاطع = عدد الحركات المنطوقة، والمقطع المميز يحمل النبر.' : 'كلمة من مقطع واحد؛ النبر عليها بالكامل.'}</p>
            </div></div>
          <div class="decode-step" data-step="3"><button class="decode-reveal" type="button">٣ · اكشف: الدمج والجملة</button>
            <div class="decode-body hidden">
              <div class="ex-en" lang="en" dir="ltr">${esc(w.s)}${audioControls(w.s)}</div>
              <div class="ex-ar">${esc(w.sAr)}</div>
            </div></div>
        </div>
        <div class="action-row">
          <button class="action-button" id="decodePrev" type="button" ${idx === 0 ? 'disabled' : ''}>← السابقة</button>
          <span class="muted" id="decodePos">${idx + 1} / ${words.length}</span>
          <button class="action-button primary" id="decodeNext" type="button">التالية →</button>
        </div>`;
      const store = (i) => {
        positions.set(level, i);
        try { localStorage.setItem('erp.decode.' + level, String(i)); } catch {}
      };
      card.querySelectorAll('.decode-reveal').forEach((btn) => {
        btn.addEventListener('click', () => {
          const body = btn.parentElement.querySelector('.decode-body');
          body.classList.toggle('hidden');
        });
      });
      card.querySelector('#decodePrev')?.addEventListener('click', () => { store(Math.max(idx - 1, 0)); render(); });
      card.querySelector('#decodeNext')?.addEventListener('click', () => { store((idx + 1) % words.length); render(); });
    };
    panel.querySelectorAll('#decode-levels .filter-chip-btn').forEach((b) => {
      b.addEventListener('click', () => { level = Number(b.dataset.level); render(); });
    });
    render();
  },
};
