// Tense Comparison Tool — side-by-side comparison of any two of the 12 tenses.
import { esc } from '../../../app/shared/util.js';
import { audioControls } from '../../../app/features/audio.js';
import { english } from '../../../app/locale/index.js';
import { tenses } from '../data/tenses.js';

// Form + usage + signals per tense (concentrated, matching the section's content).
const T = {
  'tenses-overview': null,
  'present-simple': {
    form: 'الفعل المجرد + s للمفرد الغائب (works)؛ النفي والسؤال بـ do/does',
    use: 'عادات وتكرار، حقائق عامة، حالات دائمة، جداول ثابتة، تعليمات',
    signals: 'always, usually, often, sometimes, never, every day, on Sundays',
    ex: 'He works at a bank. / Water boils at 100 °C.',
    notUse: 'لا يُستعمل للحدث الجاري الآن ولا مع أفعال الحالة في المستمر',
  },
  'present-continuous': {
    form: 'am/is/are + V-ing',
    use: 'حدث جارٍ الآن، وضع مؤقت، تطورات، ترتيبات مستقبلية مؤكدة',
    signals: 'now, at the moment, today, this week, Look!, Listen!',
    ex: 'Listen! Someone is singing. / We are meeting the client tomorrow.',
    notUse: 'لا يُستعمل مع أفعال الحالة (know, love, own…)',
  },
  'present-perfect': {
    form: 'have/has + V3',
    use: 'تجربة حتى الآن، نتيجة حاضرة لحدث ماضٍ، مدة مستمرة، أخبار طازجة',
    signals: 'ever, never, just, already, yet, since, for, so far, recently',
    ex: 'I have lost my keys (فلا أجدها الآن). / We have known her since 2015.',
    notUse: 'لا يُستعمل مع زمن ماضٍ محدد (yesterday, in 2019)',
  },
  'present-perfect-continuous': {
    form: 'have/has been + V-ing',
    use: 'مدة نشاط بدأ في الماضي وما زال جاريًا أو انتهى للتو',
    signals: 'for, since, all day, all morning, How long…?',
    ex: 'It has been raining since morning. / How long have you been waiting?',
    notUse: 'لا يُستعمل مع أفعال الحالة ولا للإنجاز المعدود الكامل',
  },
  'past-simple': {
    form: 'V-ed أو الصيغة الشاذة الثانية (went)؛ النفي والسؤال بـ did',
    use: 'حدث أو حالة منتهية في زمن ماضٍ محدد، وسرد الأحداث المتتابعة',
    signals: 'yesterday, ago, last week, in 1998, when…, then',
    ex: 'I graduated in 2014 and moved to Doha.',
    notUse: 'لا يُستعمل إذا كانت للحدث نتيجة حاضرة أو مدة ممتدة حتى الآن',
  },
  'past-continuous': {
    form: 'was/were + V-ing',
    use: 'حدث جارٍ في لحظة ماضية، خلفية لحدث مفاجئ، حدثان متزامنان',
    signals: 'while, when, at 8 pm yesterday, all evening',
    ex: 'I was reading when the lights went out.',
    notUse: 'لا يُستعمل مع أفعال الحالة ولا للأحداث المتتابعة السريعة',
  },
  'past-perfect': {
    form: 'had + V3',
    use: 'حدث سابق على حدث ماضٍ آخر («ماضي الماضي»)، الشرط الثالث',
    signals: 'before, after, already, by the time…',
    ex: 'When we arrived, the train had already left.',
    notUse: 'لا يُستعمل مع حدث ماضٍ واحد فقط بلا مرجع لاحق',
  },
  'past-perfect-continuous': {
    form: 'had been + V-ing',
    use: 'مدة نشاط سابقة على حدث ماضٍ لاحق',
    signals: 'for, since, before, when…',
    ex: 'She had been working there for ten years when the company closed.',
    notUse: 'لا يُستعمل مع أفعال الحالة',
  },
  'future-simple': {
    form: 'will + مصدر',
    use: 'قرار لحظي، وعد، توقع، عرض مساعدة',
    signals: 'tomorrow, soon, I think…, probably',
    ex: 'It’s cold — I’ll close the window.',
    notUse: 'لا يُستعمل للنية المخططة مسبقًا (استعمل going to) ولا *will can*',
  },
  'future-continuous': {
    form: 'will be + V-ing',
    use: 'حدث جارٍ في لحظة مستقبلية، حدث متوقع عادي',
    signals: 'this time tomorrow, at 9 pm, all evening',
    ex: 'At 9 tomorrow, I will be flying to London.',
    notUse: 'لا يُستعمل مع أفعال الحالة',
  },
  'future-perfect': {
    form: 'will have + V3',
    use: 'إنجاز سيكتمل قبل لحظة مستقبلية',
    signals: 'by 2030, by the time…, before…',
    ex: 'By 2030, they will have built the new airport.',
    notUse: 'لا يُستعمل بلا مرجع زمني مستقبلي',
  },
  'future-perfect-continuous': {
    form: 'will have been + V-ing',
    use: 'مدة نشاط حتى نقطة مستقبلية',
    signals: 'by March, by then, for five years',
    ex: 'By June, I will have been teaching here for five years.',
    notUse: 'نادر الاستعمال؛ لا يُستعمل مع أفعال الحالة',
  },
  'future-forms': null,
  'used-to': null,
};

const LIST = tenses.filter((t) => T[t.id]).map((t) => ({ id: t.id, ar: t.titleAr, en: t.titleEn }));
export const tenseComparisonSamples = Object.values(T).filter(Boolean).map((t) => t.ex);

export const tenseCompareTool = {
  id: 'tense-compare',
  titleAr: 'أداة مقارنة الأزمنة',
  titleEn: 'Tense Comparison Tool',
  render() {
    const opts = (sel) => LIST.map((t) => `<option value="${t.id}">${english() ? esc(t.en) : `${esc(t.ar)} — ${esc(t.en)}`}</option>`).join('');
    return `
    <div class="tool-panel tool-accent-gram">
      <h2>أداة مقارنة الأزمنة — Tense Comparison Tool</h2>
      <p class="tool-desc">اختر زمنين من الأزمنة الاثني عشر لتقارنهما جنبًا إلى جنب: الصيغة، والاستعمال، وكلمات الإشارة، ومثال واقعي، ومتى لا يُستعمل الزمن. تُبنى المقارنة على محتوى قسم الأزمنة نفسه.</p>
      <div class="tool-form">
        <div class="tf-field">
          <label for="tc-a">الزمن الأول</label>
          <select id="tc-a" class="analyzer-input">${opts()}</select>
        </div>
        <div class="tf-field">
          <label for="tc-b">الزمن الثاني</label>
          <select id="tc-b" class="analyzer-input">${opts()}</select>
        </div>
        <button id="tc-run" class="tool-btn">قارن</button>
      </div>
      <div id="tc-out" class="tool-result" aria-live="polite"></div>
      <p class="tool-limits"><b>البيانات:</b> مبنية على صفحات الأزمنة في قسم القواعد (مرجع Cambridge English Grammar Today ومراجع نحوية أكاديمية — انظر صفحة المصادر). <b>حدود الدقة:</b> الأداة تعرض التلخيص المرجعي لا كل الاستثناءات؛ راجع صفحة الزمن للتفصيل الكامل.</p>
    </div>`;
  },
  mount(root) {
    const a = document.getElementById('tc-a');
    const b = document.getElementById('tc-b');
    const out = document.getElementById('tc-out');
    if (!a || !b || !out) return;
    // default: present perfect vs past simple (the classic confusion)
    a.value = 'present-perfect';
    b.value = 'past-simple';
    const run = () => {
      const ta = T[a.value], tb = T[b.value];
      if (!ta || !tb) return;
      const name = (id) => {
        const t = LIST.find((x) => x.id === id);
        return english() ? esc(t.en) : `${esc(t.ar)} — <span class="en">${esc(t.en)}</span>`;
      };
      const row = (label, x, y) => `
        <tr><td><b>${label}</b></td><td>${x}</td><td>${y}</td></tr>`;
      out.innerHTML = `
      <table class="cmp-table">
        <thead><tr><th></th><th>${name(a.value)}</th><th>${name(b.value)}</th></tr></thead>
        <tbody>
          ${row('الصيغة', esc(ta.form), esc(tb.form))}
          ${row('متى يُستعمل', esc(ta.use), esc(tb.use))}
          ${row('كلمات الإشارة', esc(ta.signals), esc(tb.signals))}
          ${row('مثال', `<span class="en">${esc(ta.ex)}</span>${audioControls(ta.ex)}`, `<span class="en">${esc(tb.ex)}</span>${audioControls(tb.ex)}`)}
          ${row('متى لا يُستعمل', esc(ta.notUse), esc(tb.notUse))}
        </tbody>
      </table>
      <p class="tool-note">راجع الصفحة الكاملة: <a href="#/grammar/t/${a.value}">${esc(LIST.find((x) => x.id === a.value).ar)}</a> · <a href="#/grammar/t/${b.value}">${esc(LIST.find((x) => x.id === b.value).ar)}</a></p>`;
    };
    document.getElementById('tc-run').addEventListener('click', run);
    a.addEventListener('change', run);
    b.addEventListener('change', run);
    run();
  },
};
