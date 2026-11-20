// Grammar Comparison Tool — data-driven comparison of confusable grammar points.
import { esc } from '../../../app/shared/util.js';
import { audioControls } from '../../../app/features/audio.js';
import { renderInline } from '../../../app/shared/blocks.js';
import { english } from '../../../app/locale/index.js';

// Each pair: two columns + shared context + key test + examples.
const PAIRS = [
  {
    id: 'a-an-the',
    titleAr: 'a / an مقابل the',
    titleEn: 'a, an vs the',
    kw: ['a', 'an', 'the', 'articles', 'أدوات التعريف'],
    context: 'الأداة غير المعرفة تُدخل اسمًا مجهولًا لأول مرة أو تصنّفه؛ والأداة المعرفة تحدد مرجعًا معروفًا مشتركًا بين المتكلم والسامع.',
    cols: [
      { title: 'a / an (نكرة)', items: [
        'أول ذكر للكلمة: I saw **a** dog.',
        'تصنيف ومهنة: She is **a** doctor.',
        'a قبل صوت ساكن، an قبل صوت متحرك (بحسب النطق): **an** hour, **a** university',
        'لا تستعمل مع الجمع ولا غير المعدود: *a books, an information* خطأ',
      ] },
      { title: 'the (معرفة)', items: [
        'ما ذُكر سابقًا أو معروف بالسياق: **The** dog was barking.',
        'الفريد: the sun, the internet',
        'التفضيل والترتيب: the best, the first',
        'مع جمع محدد أو غير معدود محدد: the students of this class',
      ] },
    ],
    test: 'اسأل: هل يعرف السامع أيّ قصد بالضبط؟ إن كان الجواب نعم → the؛ إن كان الذكر الأول أو التصنيف → a/an.',
    examples: ['I bought a car. The car is red.', 'I need a pen. Can you lend me the pen on your desk?'],
    links: ['articles-a-an', 'articles-the'],
  },
  {
    id: 'some-any',
    titleAr: 'some مقابل any',
    titleEn: 'some vs any',
    kw: ['some', 'any', 'quantifiers', 'some/any'],
    context: 'some في الإثبات والعروض، وany في النفي والسؤال والشرط، وany بمعنى «أي كان» في الإثبات.',
    cols: [
      { title: 'some', items: [
        'إثبات: I bought **some** apples.',
        'عرض/طلب نتوقع نعمه: Would you like **some** tea?',
        'جزء غير محدد: **Some** people disagree.',
      ] },
      { title: 'any', items: [
        'نفي: I don’t have **any** money.',
        'سؤال عام: Do you have **any** questions?',
        'شرط: If you need **any** help, call.',
        '«أي كان» في الإثبات: Take **any** book.',
      ] },
    ],
    test: 'في الإثبات الجازم استعمل some؛ وفي النفي والسؤال المحايد والشرط استعمل any.',
    examples: ['We have some milk.', 'Do we have any milk? — No, we don’t have any.'],
    links: ['some-any'],
  },
  {
    id: 'much-many',
    titleAr: 'much مقابل many',
    titleEn: 'much vs many',
    kw: ['much', 'many', 'a lot of'],
    context: 'التمييز بين المعدود وغير المعدود هو المفتاح، مع تفضيل a lot of في الإثبات غير الرسمي.',
    cols: [
      { title: 'much + غير معدود', items: [
        'How **much** time do you need?',
        'I don’t have **much** money.',
        'في الإثبات الرسمي أو بعد too/so/as: too **much** noise',
      ] },
      { title: 'many + معدود جمع', items: [
        'How **many** books?',
        'I don’t have **many** friends here.',
        'a **lot of** / **lots of** بديل شائع في الإثبات للنوعين',
      ] },
    ],
    test: 'هل يمكن عدّ الاسم؟ (one book, two books) نعم → many. هل هو كتلة أو مفهوم؟ (water, money) → much.',
    examples: ['There isn’t much traffic today.', 'There aren’t many cars today.'],
    links: ['much-many', 'nouns-countable'],
  },
  {
    id: 'few-little',
    titleAr: 'few / a few مقابل little / a little',
    titleEn: 'few, a few vs little, a little',
    kw: ['few', 'a few', 'little', 'a little'],
    context: 'الـ a تجعل القلة كافية (إيجابية)، وغيابها يجعلها ناقصة (سلبية قريبة من النفي).',
    cols: [
      { title: 'a few / few (معدود)', items: [
        '**a few** friends = بعض الأصدقاء (كافٍ)',
        '**few** friends = لا أكاد أجد أصدقاء',
        'quite **a few** = عدد لا بأس به',
      ] },
      { title: 'a little / little (غير معدود)', items: [
        '**a little** time = بعض الوقت',
        '**little** time = لا وقت تقريبًا',
        'less / least للمقارنة (غير المعدود)',
      ] },
    ],
    test: 'معدود → (a) few؛ غير معدود → (a) little. والفرق بين وجود a وغيابها هو نبرة الكفاية أو النقص.',
    examples: ['I have a few ideas, so let’s talk.', 'I have little patience left, so hurry.'],
    links: ['few-little', 'much-many'],
  },
  {
    id: 'each-every',
    titleAr: 'each مقابل every',
    titleEn: 'each vs every',
    kw: ['each', 'every', 'each other'],
    context: 'كلتاهما تاخذ الاسم مفردًا والفعل مفردًا؛ والفرق في زاوية النظر: الفرد مقابل المجموع.',
    cols: [
      { title: 'each', items: [
        'الأفراد واحدًا واحدًا',
        'تعمل مع اثنين فأكثر',
        '**each of** the two winners',
        'تستعمل وحدها كضمير: Each **was** tested.',
      ] },
      { title: 'every', items: [
        'المجموعة كاملة',
        'ثلاثة فأكثر، وتعميم',
        'every day / every one of them',
        'لا تستعمل وحدها (نستعمل everyone/everybody)',
      ] },
    ],
    test: 'هل تنظر إلى أفراد محددين كل على حدة (each) أم إلى المجموع بعمومية (every)؟',
    examples: ['Each student received a certificate.', 'Every student in the school must wear a uniform.'],
    links: ['each-every'],
  },
  {
    id: 'used-to-pair',
    titleAr: 'used to مقابل be used to',
    titleEn: 'used to vs be/get used to',
    kw: ['used to', 'be used to', 'get used to'],
    context: 'ثلاث بنى متشابهة الشكل بعيدة المعنى: عادة ماضية، واعتياد حالي، وعملية اعتياد.',
    cols: [
      { title: 'used to + مصدر', items: [
        'عادة **ماضية** انتهت',
        'I **used to play** football.',
        'السؤال: Did you **use to**…?',
      ] },
      { title: 'be used to + V-ing', items: [
        '**معتاد** على (حالة حاضرة)',
        'I **am used to getting up** early.',
        'to حرف جر هنا ← يليه V-ing',
      ] },
    ],
    test: 'بعد used to مباشرة يأتي المصدر؛ وبعد be used to يأتي V-ing. الأول عن الماضي، والثاني عن الاعتياد الحاضر.',
    examples: ['I used to live in Cairo, but now I live here and I am used to the heat.'],
    links: ['used-to', 'gerund-infinitive'],
  },
  {
    id: 'gerund-infinitive-pair',
    titleAr: 'أفعال تتغير معناها: stop / remember / try…',
    titleEn: 'Verbs changing meaning: stop, remember, try',
    kw: ['stop', 'remember', 'forget', 'try', 'regret', 'gerund', 'infinitive'],
    context: 'بعض الأفعال تقبل V-ing وto + المصدر لكن المعنى يختلف جذريًا: V-ing ينظر إلى الواقع/الماضي، والمصدر إلى المستقبل.',
    cols: [
      { title: '+ V-ing (واقع/ماضٍ)', items: [
        'He **stopped smoking**. (أقلع)',
        'I **remember locking** the door. (أتذكر الفعل)',
        'Try **restarting** it. (جرّب حلًّا)',
        'I **regret saying** that. (أسف على ماضٍ)',
      ] },
      { title: '+ to مصدر (مستقبل/مقصد)', items: [
        'He **stopped to smoke**. (توقف لكي يدخن)',
        'Remember **to lock** it. (لا تنسَ)',
        'I **tried to open** it. (حاولت)',
        'I **regret to inform** you… (أسف أن أبلغك)',
      ] },
    ],
    test: 'اسأل: هل الحدث الثاني وقع بالفعل (V-ing) أم مقصود ومتوقع (to + مصدر)؟',
    examples: ['I forgot to call her yesterday, and now I’ll never forget missing her birthday.'],
    links: ['verb-patterns', 'gerund-infinitive'],
  },
  {
    id: 'say-tell',
    titleAr: 'say مقابل tell',
    titleEn: 'say vs tell',
    kw: ['say', 'tell', 'said', 'told', 'reported speech'],
    context: 'tell تأخذ مفعولًا مباشرًا (الشخص المخاطب)، وsay لا تأخذه إلا بحرف جر to.',
    cols: [
      { title: 'say', items: [
        'say **something**',
        'say (something) **to** somebody',
        'She **said** she was tired.',
        'لا *say me*',
      ] },
      { title: 'tell', items: [
        'tell **somebody** something',
        'She **told me** the truth.',
        'تراكيب ثابتة: tell the truth, tell a lie, tell a story',
        'لا *told to me* بهذا المعنى',
      ] },
    ],
    test: 'إن ذُكر المخاطَب بلا حرف جر فاستعمل tell؛ وإلا فـ say…to.',
    examples: ['He said goodbye to everyone.', 'He told everyone goodbye.'],
    links: ['reported-speech'],
  },
  {
    id: 'make-do',
    titleAr: 'make مقابل do',
    titleEn: 'make vs do',
    kw: ['make', 'do', 'collocation'],
    context: 'الفروق هنا اصطلاحية (collocations) تُحفظ لا تُقاس: make للإنتاج والتوليد، وdo للأنشطة والواجبات.',
    cols: [
      { title: 'make (يُنتج/يُحدث)', items: [
        'make coffee, make dinner, make a cake',
        'make a mistake, make noise, make progress',
        'make money, make a profit',
        'make a decision, make an effort, make friends',
        'make a phone call, make an appointment',
      ] },
      { title: 'do (ينجز/يمارس)', items: [
        'do homework, do the dishes, do the laundry',
        'do a job, do work',
        'do exercise, do business',
        'do someone a favor, do your best',
        'do harm, do damage',
      ] },
    ],
    test: 'قاعدة اتجاهية: make عندما تُنتج شيئًا جديدًا أو تُحدث نتيجة، وdo عندما تؤدي مهمة أو نشاطًا. الاستثناءات تُحفظ تراكيب.',
    examples: ['I’ll make breakfast if you do the dishes.', 'She did her best and made a real difference.'],
    links: ['phrasal-verbs'],
  },
  {
    id: 'borrow-lend',
    titleAr: 'borrow مقابل lend',
    titleEn: 'borrow vs lend',
    kw: ['borrow', 'lend', 'loan'],
    context: 'borrow يأخذ من شخص، وlend يعطي لشخص — الاتجاهان متعاكسان.',
    cols: [
      { title: 'borrow (يستعير)', items: [
        'borrow something **from** somebody',
        'Can I **borrow** your pen?',
        'I **borrowed** money **from** the bank.',
      ] },
      { title: 'lend (يُعير)', items: [
        'lend somebody something / lend something **to** somebody',
        'Can you **lend** me your pen?',
        'She **lent** me her car. (ماضيها الشاذع lent)',
      ] },
    ],
    test: 'من يحصل على الشيء؟ أنا → borrow منك؛ أنت → lend لي.',
    examples: ['He borrowed a book from the library and lent it to me.'],
    links: ['irregular-verbs'],
  },
];
export const grammarComparisonSamples = PAIRS.flatMap((p) => p.examples);
const spokenNote = (text) => !/\sخطأ$/u.test(text);
export const grammarComparisonNotes = PAIRS.flatMap((p) => p.cols.flatMap((col) => col.items)).filter(spokenNote);

function colHtml(col) {
  return `<div class="analyzer-box"><h4>${esc(col.title)}</h4><ul class="cmp-list">${col.items
    .map((i) => `<li>${renderInline(i, { audio: spokenNote(i) })}</li>`).join('')}</ul></div>`;
}

export const grammarCompareTool = {
  id: 'grammar-compare',
  titleAr: 'أداة مقارنة القواعد',
  titleEn: 'Grammar Comparison Tool',
  render() {
    const options = PAIRS.map((p, i) => `<option value="${i}">${english() ? esc(p.titleEn) : `${esc(p.titleAr)} — ${esc(p.titleEn)}`}</option>`).join('');
    return `
    <div class="tool-panel tool-accent-gram">
      <h2>أداة مقارنة القواعد — Grammar Comparison Tool</h2>
      <p class="tool-desc">اختر زوجًا من القواعد كثيرة الالتباس لتقارن جانبيه جنبًا إلى جنب: المعنى، والقواعد، واختبار عملي للتمييز، وأمثلة واقعية، ووصول مباشر إلى الصفحات التفصيلية.</p>
      <div class="tool-form">
        <select id="gc-pick" class="analyzer-input analyzer-select">${options}</select>
        <button id="gc-run" class="tool-btn">قارن</button>
      </div>
      <div id="gc-out" class="tool-result" aria-live="polite"></div>
      <p class="tool-limits"><b>البيانات:</b> أزواج الالتباس الشائعة مبنية على محتوى قسم القواعد (Cambridge English Grammar Today ومراجع أكاديمية — انظر صفحة المصادر). <b>حدود الدقة:</b> الأداة تعرض الخلاصة المرجعية؛ وللاستثناءات الكاملة راجع صفحة كل موضوع.</p>
    </div>`;
  },
  mount(root) {
    const pick = document.getElementById('gc-pick');
    const out = document.getElementById('gc-out');
    if (!pick || !out) return;
    const run = () => {
      const p = PAIRS[Number(pick.value)];
      if (!p) return;
      out.innerHTML = `
      <div class="analyzer-result">
        <h3 class="gc-title">${english() ? esc(p.titleEn) : `${esc(p.titleAr)} <span class="en">— ${esc(p.titleEn)}</span>`}</h3>
        <p class="gc-context">${esc(p.context)}</p>
        <div class="analyzer-grid">
          ${colHtml(p.cols[0])}
          ${colHtml(p.cols[1])}
        </div>
        <div class="analyzer-box gc-test"><h4>اختبار التمييز</h4><p>${esc(p.test)}</p></div>
        <div class="analyzer-box"><h4>أمثلة</h4>${p.examples.map((e) => `<p class="en gc-ex" lang="en" dir="ltr">${esc(e)}${audioControls(e)}</p>`).join('')}</div>
        <p class="analyzer-note">الصفحات التفصيلية: ${p.links.map((l) => `<a href="#/grammar/t/${l}">${l}</a>`).join(' · ')}</p>
      </div>`;
      const note = out.querySelector('.analyzer-note');
      note.innerHTML = 'الصفحات التفصيلية: ' + p.links.map((l) => `<a href="#/grammar/t/${l}">${esc(l)}</a>`).join(' · ');
    };
    document.getElementById('gc-run').addEventListener('click', run);
    pick.addEventListener('change', run);
    run();
  },
};
