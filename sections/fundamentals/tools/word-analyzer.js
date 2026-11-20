// Word Analyzer — real dictionary lookup (CMU Pronouncing Dictionary, GA).
// Honest tool: no invented pronunciations. If the word is not in the
// dictionary, it says so. Spelling pattern detection is explanatory only.
// Enhanced in the integration: shared dictionary layer (CMUdict + CEFR
// Arabic meanings), pattern links into the encyclopedia, and a deep-link
// ?w= parameter used by smart search.
import { esc } from '../../../app/shared/util.js';
import { arpabetToIPA, syllabify, stressIndex, phoneToIPA } from './arpabet.js';
import { lookupPhones, lookupArabicMeaning } from '../../../app/features/dict.js';
import { patternsInWord } from '../../../app/features/relations.js';
import { findTopicAnywhere, topicHref } from '../../../app/navigation/registry.js';
import { audioPair, audioButton } from '../../../app/features/audio.js';
import { english, escapeLiteral, textBi } from '../../../app/locale/index.js';

const SPELLING_HINTS = [
  { re: /([^aeiou])\1(ing|ed|er|est|y)?$/i, ar: 'حرف صامت مكتوب مرتين؛ قد يكون تضعيفًا إملائيًا عند إضافة لاحقة.' },
  { re: /(tion|sion)$/i, ar: 'نهاية من عائلة -ion؛ تحقّق من النطق والنبر في المدخل أعلاه.' },
  { re: /(ea|ee|ie|oa|oe|ai|ay|au|aw|ei|ou|ow|oi|oy|oo|ue|ui)/i, ar: 'تجاور حرفا علّة؛ قد يعملان كمجموعة كتابية. القراءة لا تُحسم من وجودهما وحده.' },
  { re: /(ck|ch|sh|th|ph|gh|wh|ng|qu|wr|kn|mb$)/i, ar: 'تحتوي على تركيبة حرفية معروفة — راجع قسم التركيبات' },
  { re: /[aeiou][^aeiou]e$/i, ar: 'نهاية توافق نمط VCe في الكتابة؛ قد تكون للـe وظيفة أخرى.' },
  { re: /[^aeiou][aeiou][^aeiou]$/i, ar: 'النمط CVC — يُرجّح علّة قصيرة (مقطع مغلق)' },
  { re: /(c[aou]|g[aou])/i, ar: 'حرف **C/G** صلب غالبًا قبل a/o/u' },
  { re: /(c[ei]|g[ei]|g[y])/i, ar: 'حرف **C/G** لين غالبًا قبل e/i/y (كقاعدة اتجاهية فقط)' },
  { re: /(a|o|u|e|i)r[^aeiou]/i, ar: 'موضع محتمل لعلة متحكَّم بها R-controlled' },
];

function spellingHints(word) {
  const hits = SPELLING_HINTS.filter((h) => h.re.test(word)).map((h) => h.ar);
  return hits;
}

// Encyclopedia pattern links found inside the word's written form.
function patternLinks(word) {
  return patternsInWord(word)
    .map((p) => {
      const t = findTopicAnywhere(p.id);
      return t ? { titleAr: t.titleAr, sectionId: p.sectionId, id: p.id, anchor: p.anchor } : null;
    })
    .filter(Boolean);
}

export const wordAnalyzerTool = {
  id: 'word-analyzer',
  titleAr: 'محلل الكلمات',
  titleEn: 'Word Analyzer',
  render() {
    return `
    <div class="tool-panel" id="tool-word-analyzer">
      <h2>محلل الكلمات — Word Analyzer</h2>
      <p class="tool-desc">أداة تحليل الكلمة الواحدة: النطق (IPA)، المقاطع، النبر، الفونيمات، المعنى العربي للكلمات الشائعة، والأنماط المرتبطة بتهجئتها — وفق النطق الأمريكي العام (GA). تعتمد الأداة على قاموس نطق مرجعي (CMU Pronouncing Dictionary، نحو 125 ألف كلمة)، ولا تخترع نطقًا للكلمات غير الموجودة فيه.</p>
      <form class="tool-form" data-wa-form>
        <input type="text" data-wa-input placeholder="اكتب كلمة إنجليزية… مثال: nation, water, read" autocomplete="off" />
        <button type="submit">حلّل</button>
      </form>
      <div data-wa-result class="analyzer-result"></div>
      <div class="tool-limits">
        <b>حدود الدقة:</b>
        <ul>
          <li>المصدر: CMU Pronouncing Dictionary — نطق أمريكي عام مرجعي، مع توثيق نُطق بديلة حيث توجد.</li>
          <li>المعنى العربي يظهر فقط للكلمات الشائعة ضمن قائمة CEFR المعربة (نحو 9.9 ألف كلمة) — غيابه لا يعني أن الكلمة نادرة الاستعمال.</li>
          <li>تحليل التهجئة هنا <b>تلميحات اتجاهية</b> من أشهر الأنماط، وليس قاعدة مطلقة — الإنجليزية لا يمكن استنتاج نطقها من التهجئة وحدها؛ لذلك لا تُعرض نبرة أو نطق لأي كلمة خارج القاموس.</li>
          <li>قد تختلف النبرة أو بعض الأصوات في لهجات أخرى (بريطانية، إقليمية أمريكية)؛ التثبيت هنا على GA كمرجع أساسي.</li>
        </ul>
      </div>
    </div>`;
  },
  mount(rootEl, params) {
    const panel = rootEl?.querySelector('[data-wa-form]')?.closest('.tool-panel');
    if (!panel) return;
    const input = panel.querySelector('[data-wa-input]');
    const out = panel.querySelector('[data-wa-result]');
    const form = panel.querySelector('[data-wa-form]');

    const analyze = async (word) => {
      const prons = await lookupPhones(word);
      const meaning = await lookupArabicMeaning(word);
      if (!prons) {
        out.innerHTML = `
          <div class="analyzer-word">${escapeLiteral(word)}</div>
          <div class="analyzer-note" style="font-size:var(--text-sm)">
            لا توجد بيانات نطق موثوقة لهذه الكلمة في القاموس المرجعي المستخدم.
            لا تخترع الأداة نطقًا من التهجئة وحدها — استخدم قاموسًا مسموعًا (مثل Merriam-Webster أو Cambridge) للتحقق منها.
          </div>`;
        return;
      }
      const first = prons[0];
      const syls = syllabify(first);
      const sIdx = stressIndex(first);
      const ipa = arpabetToIPA(first);
      const hints = spellingHints(word.toLowerCase());
      const links = patternLinks(word.toLowerCase());
      out.innerHTML = `
        <div class="analyzer-word">${audioPair(escapeLiteral(word), word, ipa, prons.length > 1)}${meaning && !english() ? `<span class="analyzer-ar"> — ${escapeLiteral(meaning.ar)}${meaning.level ? ` <span class="lv-chip">${esc(meaning.level)}</span>` : ''}</span>` : ''}</div>
        ${meaning && english() ? `<details class="analyzer-gloss"><summary>${textBi('المعنى العربي', 'Arabic gloss (optional)')}${meaning.level ? ` · CEFR ${esc(meaning.level)}` : ''}</summary><span lang="ar" dir="rtl">${escapeLiteral(meaning.ar)}</span></details>` : ''}
        <div class="analyzer-ipa">/${esc(ipa)}/</div>
        <div class="analyzer-sylls">
          ${syls.map((s, i) => `<span class="analyzer-syll ${i === sIdx ? 'stressed' : ''}">${esc(s.map(phoneToIPA).join(''))}</span>`).join('')}
        </div>
        <div class="analyzer-grid">
          <div class="analyzer-box"><h4>الفونيمات</h4><div class="phonemes">${first.map((p) => `<span>${esc(p.replace(/[0-9]/g, ''))} → ${esc(phoneToIPA(p))}</span>`).join('')}</div></div>
          <div class="analyzer-box"><h4>النبرة والمقاطع</h4>
            <p style="font-size:var(--text-sm);line-height:1.9">عدد المقاطع الصوتية: <b>${syls.length}</b> — النبرة الرئيسية على المقطع رقم <b>${sIdx + 1}</b>${sIdx === 0 ? ' (نبرة أولى — من النبرات الشائعة في الكلمات ثنائية المقاطع الجرمانية)' : ''}. العلل المخفضة (reduced vowels) تظهر أحيانًا كـ schwa /ə/ في المقاطع غير المنبورة.</p>
          </div>
          <div class="analyzer-box"><h4>تلميحات تهجئة (اتجاهية)</h4>
            <div class="chips">${hints.length ? hints.map((h) => `<span class="chip">${esc(h).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</span>`).join('') : 'لا تلميحات نمطية بارزة'}</div>
          </div>
          ${links.length ? `<div class="analyzer-box"><h4>أنماط موسوعية في هذه الكلمة</h4>
            <div class="chips">${links.map((l) => `<a class="chip chip-link" href="${esc(topicHref(l.sectionId, l.id, l.anchor))}">${esc(l.titleAr)} ←</a>`).join('')}</div>
          </div>` : ''}
          ${prons.length > 1 ? `<div class="analyzer-box"><h4>نُطق بديلة موثقة</h4>
            <div class="chips">${prons.slice(1).map((p) => `<span class="chip ipa-chip" dir="ltr">/${esc(arpabetToIPA(p))}/${audioButton(word, arpabetToIPA(p), true)}</span>`).join('')}</div></div>` : ''}
        </div>
        ${prons.length > 1 ? `<div class="analyzer-note">النطق الأول هو الأكثر شيوعًا في القاموس؛ البدائل موثقة أيضًا (مثل read الماضية والحاضرة).</div>` : ''}
        <div class="analyzer-note">التحليل مبني على النطق الأمريكي العام كما ورد في CMUdict. بعض الأنماط التهجئية تُعرض كتلميحات فقط لأن الإنجليزية لا تُستنتج من التهجئة وحدها.</div>`;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const word = input.value.trim();
      if (!word) { out.innerHTML = ''; return; }
      await analyze(word);
    });

    // deep link: #/tools/word-analyzer?w=education (used by smart search)
    const preset = params?.get('w');
    if (preset) {
      input.value = preset;
      analyze(preset);
    }
  },
};
