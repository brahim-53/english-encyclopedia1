# ARCHITECTURE.md — بنية المنصة

## المبدأ العام

موقع ثابت (static SPA) بلا خطوة بناء: HTML واحد + وحدات ES (ES modules) + راوتر hash. المحتوى (data) منفصل تمامًا عن العرض (render) والمنطق (router/search/tools). إضافة موضوع جديد لا تتطلب تعديل أي ملف عرض.

## شجرة الملفات

```
english-reference/
├── index.html                 # نقطة الدخول الوحيدة
├── shared/styles/base.css    # نظام التصميم الكامل (tokens + RTL/LTR)
├── app/
│   ├── main.js               # الإقلاع والبحث الرئيسي
│   ├── features/             # طبقة الميزات الشخصية v4 — مستقلة عن المحتوى تمامًا
│   │   ├── store.js         # localStorage بمفاتيح erp.v1.* + تدقيق شكلي + كاش + تصدير/استيراد
│   │   ├── bookmarks.js / history.js / progress.js / review.js
│   │   ├── relations.js     # محرك العلاقات: نمط/كلمة ← مواضيع (روابط نصية فقط)
│   │   ├── dict.js          # تحميل القواميس المساندة عند الطلب (cefr-ar.js / endings.js)
│   │   ├── practice.js + practice-data.js   # مركز التمارين
│   │   ├── decode.js + decode-data.js       # أداة فك ترميز القراءة
│   │   ├── hub.js           # صفحة «مجلتي» (#/me)
│   │   └── ui.js            # عناصر مشتركة (toast)
│   ├── navigation/
│   │   ├── registry.js       # تسجيل القسمين (فهرس موحد)
│   │   └── router.js         # راوتر الـ hash + تركيب بحث القسم
│   ├── layout/
│   │   ├── shell.js         # الهيكل العام والهيدر
│   │   ├── home.js          # الصفحة الرئيسية
│   │   ├── section.js       # صفحة قسم القواعد + الشريط الجانبي
│   │   ├── learning-path.js # مسار النطق والقراءة + بحث القسم وتقدمه
│   │   └── tools.js         # مركز الأدوات + صفحة أداة
│   ├── search/search.js      # الفهرس والبحث العالمي وبحث القسم
│   └── shared/
│       ├── util.js         # esc() وغيرها
│       ├── blocks.js        # محرك عرض كتل المحتوى
│       └── topic-page.js   # صفحة الموضوع (روابط، مصادر، related)
├── sections/
│   ├── fundamentals/        # مستقل تمامًا
│   │   ├── index.js        # تسجيل القسم + التصنيفات + tools
│   │   ├── data/path.js    # دروس القراءة التطبيقية المرتبة
│   │   ├── data/notebook-index.js # فهرس مشتق من الدفتر عند البناء
│   │   ├── legacy.js       # تحويل المسارات السابقة، بدون دروس مكررة
│   │   └── tools/          # محلل الكلمات ومحوّل ARPAbet → IPA
│   └── grammar/            # مستقل تمامًا
│       ├── index.js        # 11 تصنيفًا + أداتان
│       ├── data/*.js       # 11 ملف بيانات (أساسيات، أقسام كلام، أزمنة…)
│       └── tools/*.js      # مقارنة القواعد، مقارنة الأزمنة
├── public/dict/*.json      # 27 ملف قاموس نطق (CMUdict) — تحميل عند الطلب
├── public/notebook/index.html # الدفتر المرفق بلا تعديل
├── data/dict/              # المصدر الخام (cmudict) + سكربت البناء build-dict.py
├── tests/validate.mjs      # اختبار بنيوي شامل
└── documentation/          # هذه الوثائق
```

## استقلالية القسمين (متطلب صريح)

- `sections/fundamentals/**` لا يستورد أي ملف من `sections/grammar/**` والعكس صحيح.
- التشابك الوحيد المسموح: **روابط related بصيغة `'sec/id'`** (نصوص، لا استيرادات) — يفكها `topic-page.js` عبر الفهرس الموحد.
- المشترك بين القسمين: `app/**` و`shared/**` فقط (الراوتر، البحث، الهيكل) — وهذا مسموح بالمواصفات.
- يفحص `tests/validate.mjs` هذا الاستقلال آليًا (فحص استيرادات فقط، لا نصوص).

## بنية الموضوع (topic shape)

```js
{
  id: 'past-simple',            // فريد داخل قسمه
  cat: 'tenses',                // يجب أن يطابق معرف تصنيف في index.js
  titleAr: '…', titleEn: '…',
  summaryAr: '…',
  kw: ['past simple', 'yesterday', …],   // كلمات البحث (عربي/إنجليزي)
  blocks: [ … ],                 // المحتوى — أنواع الكتل أدناه
  related: ['past-continuous', 'grammar/present-perfect', 'fundamentals/suffix-ed'],
  sources: [{ name: '…', url: '…' }],   // إن لم يتحقق من URL اتركه نصًا ورقيًا فقط
}
```

## كتل المحتوى المدعومة في `blocks.js`

| النوع | الاستعمال |
|---|---|
| `p` | فقرة عربية (تدعم `**bold**` و`{{/ipa/}}`) |
| `h` | عنوان فرعي |
| `list` / `ol` | قائمة نقطية / مرقمة |
| `table` | جدول `{ head: [], rows: [[]] }` |
| `examples` | أمثلة إنجليزية بارزة `{ items: [{en, ipa?, ar}] }` مع `*تمييز*` |
| `wr` | صحيح/خطأ: `{ pairs: [{wrong, right, why}] }` |
| `callout` | صندوق `{ kind: tip|warn|note, ar }` |
| `cmp` | مقارنة أعمدة `{ cols: [{title, items}] }` |
| `sounds` | (Fundamentals) أصوات التركيب مع أمثلة وIPA |
| `ipa-table` / `letters-grid` | جداول IPA وصفوف الحروف |

## طبقة الميزات الشخصية (v4)

قاعدة صارمة: **الملامح مستقلة عن المحتوى** — لا يستورد أي ملف في `sections/**` شيئًا من `app/features/**`؛ العكس مسموح (طبقة العرض تستورد الملامح).

- `store.js`: كل القراءات تمر عبر مدقق شكلي (SHAPES) وتُخزن في كاش الجلسة؛ كل الكتابات عبر `write()` واحد محمي (فشل الكتابة لا يعطل التنقل). المفاتيح مسبوقة بإصدار المخطط `erp.v1.` ليسهل الترحيل مستقبلًا.
- `relations.js` هو الجسر النصي الوحيد بين كلمة مكتوبة ومواضيع الموسوعة (لا يستورد محتوى؛ يفك المراجع عبر الفهرس الموحد).
- أدوات مشتركة جديدة في `app/layout/tools.js`: مركز التمارين وفك الترميز — تُدمج مع أدوات القسمين في صفحة الأدوات.
- الصفحات: `#/me` (renderHub) في `hub.js`؛ عمليات التثبيت (mount) تربط الأحداث بعد الإدراج.

## الأدوات

كل أداة كائن `{ id, titleAr, titleEn, render(params), mount(rootEl, params) }`:
- `render()` يعيد HTML (ثابت)، و`mount()` يربط الأحداث بعد الإدراج (يستدعيه `tools.js` عبر microtask).
- كل أداة تعرض بياناتها وحدود دقتها صراحة (متطلب «لا أزرار وهمية»).
- محلل الكلمات يجلب `public/dict/<letter>.json` عند الطلب فقط (lazy) — لا يخترع نطقًا؛ الكلمات غير الموجودة تعرض رسالة صريحة.
- أداة تحليل الجمل (Sentence Analyzer) **لم تُبنَ عمدًا**: لا يوجد محلل نحوي موثوق يعمل محليًا بلا خدمات خارجية، والمنصة لا تدّعي دقة زائفة (راجع TEST-REPORT.md).

## البحث

- فهرس موحد من `kw` + العناوين + الملخصات لكل القسمين، مع بحث عالمي (رئيسي) وبحث داخل قسم (شريط جانبي).
- يدعم العربية والإنجليزية ومصطلحات IPA ورموزها.

## القاموس الصوتي

- المصدر: CMU Pronouncing Dictionary (توثيق في SOURCES.md).
- `data/build-dict.py` يبني `public/dict/{a..z}.json` من `data/dict/cmu_original.dict`.
- `data/build-cefr.py` يبني القواميس المساندة: `public/dict/cefr-ar.js` (معانٍ عربية + مستويات CEFR) و`public/dict/endings.js` (كلمات أنماط النهايات بـ IPA محسوب من CMUdict) — سكربتات كلاسيكية تُحمّل عند الطلب لتعمل من `file://`.
- التحويل ARPAbet → IPA في `sections/fundamentals/tools/arpabet.js` مع منطق النبر (stress) والمقاطع الصوتية.
