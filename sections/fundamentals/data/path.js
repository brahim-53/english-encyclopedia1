const CMU = { name: 'Carnegie Mellon University · CMU Pronouncing Dictionary', url: 'https://github.com/cmusphinx/cmudict' };
const UF = { name: 'University of Florida Literacy Institute · Phonics Scope & Sequence', url: 'https://ufli.education.ufl.edu/wp-content/uploads/2022/01/UFLI-Scope-and-Sequence-5-21-1.pdf' };
const ROCKETS = { name: 'Reading Rockets · Phonics in Practice', url: 'https://www.readingrockets.org/reading-101/reading-101-learning-modules/course-modules/phonics/practice' };
const IES = { name: 'Institute of Education Sciences · Multisyllabic Word-Reading Skills', url: 'https://ies.ed.gov/ncee/rel/reading-intervention-grades-6-8/pro-learning-module1' };
const WWC = { name: 'What Works Clearinghouse · Foundational Skills', url: 'https://ies.ed.gov/ncee/wwc/Docs/practiceGuide/wwc_foundationalreading_040717.pdf' };
const cam = (word) => ({name:`Cambridge Dictionary · ${word} (US)`,url:`https://dictionary.cambridge.org/dictionary/english/${word}`});
const h = (ar) => ({type:'h',ar});
const p = (ar) => ({type:'p',ar});
const table = (head, rows) => ({type:'table',head,rows});
const steps = (...items) => ({type:'ol',items});
const tryIt = (prompt, answer) => ({type:'try',prompt,answer});
const links = (...items) => ({type:'links',items});
const audioRef = (label, anchor) => [label, `#/fundamentals/t/ipa-overview#${anchor}`];
const decodeTool = ['طبّق في أداة «اقرأ وفك»', '#/tools/read-decode'];
const analyzer = ['تحقّق في محلّل الكلمات', '#/tools/word-analyzer'];
const lesson = (id, titleAr, titleEn, summaryAr, kw, blocks, related, sources) =>
  ({ id, titleAr, titleEn, summaryAr, kw: kw.split('|'), blocks, related, sources: [...sources, CMU] });

export const spelling = [
  lesson('spelling-units', 'اسم الحرف ووحدات التهجئة', 'Letter Names & Spelling Units',
    'قبل قراءة كلمة، قرّر أين تعمل الحروف معًا؛ اسم الحرف يفيد في تهجئتها شفهيًا، وليس وصفة لنطقها.',
    'alphabet|grapheme|اسم الحرف|صوت الحرف|letter x|letter y',
    [
      h('تهجَّ الكلمة ثم اقرأها'),
      table(['من الكتابة', 'ماذا تفعل؟'], [
        ['**B** في **box**', 'عند إملاء الحرف تقول {{/bi/}}، وعند قراءة الكلمة تبدأ بـ{{/b/}} لا باسم الحرف.'],
        ['**sh** في **ship**', 'اقرأ الحرفين كوحدة واحدة. تهجئة الكلمة حرفًا حرفًا شيء آخر.'],
        ['**x** في **box** و**six**', 'حرف واحد يمثّل عادةً صوتين هنا {{/ks/}}. لا تتوقّع أن يساوي عدد الحروف عدد الأصوات.'],
        ['**qu** في **quick**', 'حرفان يُعالجان معًا أثناء القراءة، وغالبًا يمثلان صوتين {{/kw/}}. قارنها بـ **sh** التي تمثل صوتًا واحدًا هنا.'],
        ['**y** في **gym** و**puppy**', 'تعمل كحرف علّة في الكلمتين، ولكن القراءتين مختلفتان: {{/ɪ/}} و{{/i/}}.'],
      ]),
      tryIt('في **six** و**crash**، ابحث عن حرف يمثل صوتين في الأولى وحرفين يمثلان صوتًا واحدًا في الثانية.', 'في **six** الحرف **x** يمثّل {{/ks/}}؛ وفي **crash** الوحدة **sh** تمثّل {{/ʃ/}}.'),
      links(audioRef('بطاقة /ʃ/ في دفتر IPA','s-33')),
    ], ['consonant-blends','soft-c-g'], [WWC, UF]),
  lesson('soft-c-g', 'قراءة الحرفين C و G حسب الجوار', 'Soft & Hard C and G',
    'انظر إلى الحرف الذي يلي C أو G قبل أن تقرأهما، لكن لا تعامل الحرفين كأنهما يتبعان قاعدة واحدة بلا استثناءات.',
    'soft c|soft g|hard c|hard g|الجوار|cent|gift',
    [
      h('جرّب قرينة الحرف التالي'),
      table(['القرينة', 'تطبيق للقراءة'], [
        ['**c + e, i, y**', 'غالبًا {{/s/}}، مثل **cent** (سنت) والحرف الأول في **cycle** (دورة). الحرف الثاني في **cycle** يتبعه **l** ويُقرأ {{/k/}}.'],
        ['**c** في مواضع أخرى', 'غالبًا {{/k/}}: **coat** (معطف)، **clap** (يصفق). عالج **ch** كوحدة قبل تطبيق هذه القرينة.'],
        ['**g + e, i, y**', 'قد تكون {{/dʒ/}}، مثل **germ** (جرثومة) و**gym**. لا تعتمد على ذلك وحده: **gift** (هدية) تحتفظ بـ{{/ɡ/}}.'],
        ['**g + a** أو **g + o**', 'غالبًا {{/ɡ/}} كما في **gaze** (يحدّق). وفي **page** تجعل **e** النهائية قراءة **g** لينة.'],
      ]),
      tryIt('اقرأ الحرف الأول في **cent** و**cold** و**gift** و**germ**.', 'بالترتيب: {{/s/}}، {{/k/}}، {{/ɡ/}}، {{/dʒ/}}.'),
      links(audioRef('الصوامت في الدفتر','cons')),
    ], ['silent-e','tch-dge'], [UF, WWC]),
  lesson('silent-letters', 'الحروف الصامتة وحدود النمط', 'Silent Letters',
    'موقع المجموعة يساعدك على معرفة ما لا يُنطق؛ لا تشطب الحرف نفسه أينما رأيته.',
    'silent letters|silent b|silent t|kn|wr|mb|gn|حروف صامتة',
    [
      h('انظر إلى موضعها'),
      table(['المجموعة', 'تطبيق جديد'], [
        ['**kn- / wr- / gn-** في البداية', 'جرّب **knot** (عقدة) و**gnome** (قزم خيالي). لا تعمّم صمت **g** على كلمات لا يبدأ جذرها بـ **gn**.'],
        ['**-mb** في آخر الأساس', 'لا تُنطق **b** في **comb** و**climb**، وتظل صامتة في **climbing**. قارن **number**: تسمع {{/b/}}؛ ليست **-mb** النهائية في أساس الكلمة.'],
        ['**-sten / -ften** في كلمات معروفة', 'لا تُنطق **t** في **listen** و**soften**. احفظ الكلمة مع نمطها بدل تعميمه على كل **st** أو **ft**.'],
        ['**h** و**b** في كلمات محددة', 'احفظ **hour / honest** بلا {{/h/}} و**debt / doubt** بلا {{/b/}}.'],
      ]),
      tryIt('أين تسمع {{/b/}}: **climb**، **climbing** أم **number**؟', 'في **number** فقط من هذه الأمثلة. وجود لاحقة بعد **climb** لا يعيد الصوت المحذوف.'),
      links(audioRef('مثال kn في بطاقة /n/','s-39'),audioRef('مثال wr في بطاقة /ɹ/','s-41')),
    ], ['silent-e','word-parts'], [UF, ROCKETS]),
];

export const patterns = [
  lesson('consonant-blends', 'تجمّعات الصوامت: اقرأ دون حركة زائدة', 'Consonant Blends & Chunking',
    'حين يعمل الحرفان كوحدة أو حين تتجاور أصوات مستقلة، تختلف طريقة التجميع أثناء القراءة.',
    'blends|digraphs|blending|segmenting|CCVC|CVCC|دمج|تفكيك|تجمعات',
    [
      h('جَمّع الحروف قبل أن تنطقها'),
      table(['الكلمة', 'محاولة القراءة'], [
        ['**crash → c | r | a | sh**', 'أبقِ **sh** وحدةً واحدة، ومرّ من {{/k/}} إلى {{/ɹ/}} بلا حركة بينهما.'],
        ['**flag → f | l | a | g**', 'ابدأ بـ**fl** متصلة، لا تضف **i** أو حركةً قبل **f** أو بعده.'],
        ['**sprint → s | p | r | i | n | t**', 'ابدأ بثلاثة صوامت في مقطع واحد. جرّب الكلمة ببطء ثم أعدها بتدفق واحد.'],
        ['**desk → d | e | s | k**', 'في النهاية **sk** صوتان. لا تحذف **k** ولا تلحق بها حركة.'],
      ]),
      tryIt('قسّم **crab** و**clap** و**stamp** إلى وحدات، ثم اقرأها بلا حركة إضافية.', '**c | r | a | b**؛ **c | l | a | p**؛ **s | t | a | m | p**. تُدمج أصوات كل كلمة في مقطع واحد.'),
      links(audioRef('الأصوات المنفردة في دفتر IPA','cons'),decodeTool),
    ], ['spelling-units','tch-dge','decoding'], [UF, WWC]),
  lesson('tch-dge', 'قرائن الصوامت الثنائية والثلاثية', 'Consonant Spelling Patterns',
    'بطاقات الدفتر تبيّن الصوت؛ هنا تستخدم موضع الحركة والصامت لاختيار قراءة أو تهجئة أقرب.',
    'trigraph|digraph|tch|dge|ck|ng|ch|gh|نهايات حرفية',
    [
      h('قرائن في نهاية المقطع'),
      table(['القرينة', 'قارن'], [
        ['بعد حركة قصيرة مكتوبة بحرف واحد، مباشرةً', '**pack / patch / badge**: النهايات **ck / tch / dge** تميل للظهور هنا.'],
        ['بعد مجموعة علّة أو صامت آخر', '**coach** (مدرّب)، **range** (نطاق)، **milk** (حليب): لا تنتظر المجموعة الثلاثية أو **ck** تلقائيًا.'],
        ['كلمة تُراجع', '**much** تُكتب بـ **ch** بعد حركة قصيرة، خلافًا للتوقع السابق.'],
      ]),
      h('الموضع أو الأصل لا يضمنان القراءة'),
      p('لا تُضف {{/ɡ/}} بعد **ng** في **singer**، لكنك تسمعه في **finger**. وفي **chop / school / chef** تأخذ **ch** قراءات مختلفة؛ احفظ النمط مع الكلمة لا مع أصل تتخيله. وقارن **though / enough / ghost**: لا قراءة واحدة لـ **gh**.'),
      tryIt('أي كتابة ترجح لمعنى «حلوى الفَدْج»، **fuge** أم **fudge**؟ ولماذا لا تكتب **range** بـ **dge**؟', '**fudge**: قبل النهاية حركة قصيرة واحدة مباشرة. في **range** يظهر صامت **n** قبل الصوت الأخير، فلا تنطبق قرينة **dge**.'),
      links(audioRef('بطاقة /tʃ/ في الدفتر','s-36'),audioRef('بطاقة /dʒ/ في الدفتر','s-37')),
    ], ['consonant-blends','silent-letters','vowel-teams'], [UF, ROCKETS]),
  lesson('vowel-teams', 'مجموعات العلة: قراءات إضافية واستثناءات', 'Vowel Teams Beyond the Notebook',
    'لا تحاول حفظ جدول جديد للأصوات. احتفظ بقراءة احتياطية حين لا تتعرّف على الكلمة بالأنماط التي قرأتها في الدفتر.',
    'vowel teams|ea|eigh|ei|ie|ui|ew|oo|ough|مجموعات العلة',
    [
      h('أضف فرعًا جديدًا إلى النمط'),
      table(['القرينة', 'كلمات مفتاحية'], [
        ['**ea** يمكن أن تكون {{/eɪ/}}', '**great / steak**: تعلّم هاتين بعد قراءتي **ea** في الدفتر.'],
        ['**oo** قد تأتي {{/ʌ/}}', '**blood / flood**: كلمتان تحفظهما، لا قاعدة مستنبطة من **book** أو **food**.'],
        ['**ie** ليست قراءة واحدة', '**pie** {{/paɪ/}} (فطيرة) و**piece** {{/pis/}} (قطعة). وفي **vein / eight** تظهر كتابتان إضافيتان لـ{{/eɪ/}}.'],
        ['**ui / ew** وقراءة غير متوقعة', '**fruit / chew** فيهما {{/u/}}، لكن **sew** (يخيط) {{/soʊ/}}.'],
        ['**ough**: تحقّق من الكلمة', '**though / through / cough / bough** لا تتقافى. لا تفترض أن **gh** صامتة عندما ترى هذه المجموعة.'],
      ]),
      tryIt('هل تتقافى **blood** و**food**؟ وهل تتقافى **great** و**eight**؟', 'الأولى لا؛ التهجئة المشتركة لا تحسم الصوت. الثانية نعم في النطق الأمريكي العام.'),
      links(audioRef('أنماط مجموعات العلة التي سبق تعلمها','letters')),
    ], ['tch-dge','silent-e','context-pronunciation'], [UF, ROCKETS]),
  lesson('silent-e', 'الـ E النهائية لا تطيل الحركة دائمًا', 'Final E: Other Jobs & Exceptions',
    'الدفتر يشرح النمط الأساسي؛ ركّز هنا على سبب بقاء E في الكتابة حتى عندما لا تجعل الحركة مثل اسم حرفها.',
    'silent e|magic e|VCe|final e|صامتة|give|prince',
    [
      h('اسأل: ماذا تغيّر؟'),
      table(['الوظيفة المحتملة', 'قارن'], [
        ['جزء من نمط إطالة معروف', 'اختبر **strip / stripe** (شريط / خط طولي)، ثم قارن بالأنماط الأصلية في الدفتر.'],
        ['تُبقي **c** لينة دون إطالة', 'في **prince** (أمير) تُقرأ **c** {{/s/}}، وتبقى **i** {{/ɪ/}}. وجود **n** يعني أنها ليست على نمط **stripe**.'],
        ['في نهايات مكتوبة بـ **-ve**', '**give / have / glove** ليست حركاتها كأسماء الحروف. قارن **save**: وجود **-ve** لا يمنع تحقق نمط الإطالة أيضًا.'],
        ['ضمن نهاية **-le**', 'في **bubble** تساعدك النهاية **-ble** على توقّع وحدة نهائية منفصلة، لا قراءة **e** بصوت مستقل.'],
      ]),
      tryIt('في **stripe** و**prince** و**give**: أين تقرأ i مثل اسم الحرف؟', 'في **stripe** فقط. لا تجعل أي **e** نهائية سببًا آليًا للإطالة.'),
      links(audioRef('أمثلة Silent E الأساسية في الدفتر','letters')),
    ], ['soft-c-g','consonant-doubling','decoding'], [UF, ROCKETS]),
];

export const wordBuilding = [
  lesson('word-parts', 'الجذع والسوابق واللواحق', 'Bases, Prefixes & Suffixes',
    'اقرأ الجزء الذي تعرفه أولًا، ثم أعد تركيب الكلمة. لا كل بداية تشبه سابقة تُفصل على أنها سابقة.',
    'prefixes|suffixes|morphology|word formation|بناء الكلمات|سوابق|لواحق|جذع',
    [
      h('قسّم على أساس المعنى قبل الحروف'),
      table(['التقسيم المفيد', 'كيف يساعدك؟'], [
        ['**pre + view → preview**', 'تعرف **view**؛ **pre-** تضيف معنى «قبل».'],
        ['**mis + print → misprint**', 'اقرأ **print** ثم أضف **mis-** للدلالة على الخطأ.'],
        ['**kind + ness → kindness**', 'ابدأ بـ**kind**؛ تضيف **-ness** معنى الصفة كمفهوم أو حالة.'],
        ['**help + ful / hope + less**', '**helpful** مفيد؛ **hopeless** بلا أمل. انظر إلى الجزء الذي يبقى قابلًا للتعرّف.'],
        ['**arrange + ment / quick + ly**', '**arrangement** ترتيب و**quickly** بسرعة. **-ment** و**-ly** وحدتان تُقرآن مع الكلمة، لا حرفًا حرفًا.'],
      ]),
      p('لا تحذف **re** من **record** على أنها **re-** بمعنى «من جديد». إذا لم يساعدك معنى الجذع وحده على فهم الكلمة، جرّب تقسيمًا كتابيًا أو ارجع للقاموس.'),
      tryIt('ضع حدودًا في **unhelpful** و**repaint** قبل القراءة.', '**un | help | ful** (غير مفيد)، **re | paint** (يطلي مرة أخرى).'),
      links(['في قسم القواعد: معنى البادئات ووظيفتها', '#/grammar/t/word-formation-prefixes']),
    ], ['suffix-ed','consonant-doubling','decoding'], [UF, IES, WWC]),
  lesson('suffix-ed', 'نطق -ed و-s و-es: استمع إلى آخر صوت', 'Pronouncing -ed and -s/-es',
    'لا تحكم من آخر حرف مرئي. قُل الأساس أولًا؛ الصوت الأخير هو الذي يحدّد قراءة اللاحقة المنتظمة.',
    '-ed|-s|-es|past ending|plural ending|allomorphs|الماضي|نطق الجمع',
    [
      h('قرّر من آخر صوت في الأساس'),
      table(['النهاية', 'آخر صوت في الأساس', 'النتيجة'], [
        ['**-ed**','{{/t/}} أو {{/d/}}','مقطع إضافي {{/ɪd/}} أو {{/əd/}}: **wanted / ended**.'],
        ['**-ed**','صوت مهموس آخر مثل {{/k/}}','{{/t/}} بلا مقطع إضافي: **picked**.'],
        ['**-ed**','حركة أو صوت مجهور آخر مثل {{/l/}}','{{/d/}} بلا مقطع إضافي: **filled**.'],
        ['**-s / -es**','صوت صفيري: {{/s z ʃ ʒ tʃ dʒ/}}','مقطع إضافي {{/ɪz/}} أو {{/əz/}}: **dishes / matches**.'],
        ['**-s / -es**','مهموس غير صفيري، أو حركة/مجهور غير صفيري','{{/s/}} في **books**، و{{/z/}} في **pens**.'],
      ]),
      p('هذه للّواحق المنتظمة، لا لكل كلمة تنتهي بالحروف نفسها. في **learned**: الفعل الماضي غالبًا {{/lɝnd/}}، أما الصفة بمعنى «واسع العلم» فلها نطق بمقطع إضافي {{/ˈlɝnɪd/}}.'),
      tryIt('قرّر قراءة النهايات في **fixed / jogged / needed / hands**. أين أضفت مقطعًا؟', 'بالترتيب {{/t/}} و{{/d/}} و{{/ɪd/}} (أو {{/əd/}}) و{{/z/}}. زاد مقطع في **needed** وحدها.'),
      links(audioRef('راجع الأصوات المجهورة والمهموسة في الدفتر','cons')),
    ], ['word-parts','consonant-doubling','suffix-tion'], [UF, cam('learned')]),
  lesson('consonant-doubling', 'كيف تتغير الكتابة عند إضافة لاحقة؟', 'Suffix Spelling Changes',
    'عند القراءة بالعكس، استعد صورة الجذع حتى عندما تتغير كتابته: تضعيف، أو حذف e، أو تحويل y إلى i.',
    'doubling|drop e|y to i|-ing|-ed|تضعيف|حذف|قلب|إضافة اللواحق',
    [
      h('استعد الجذع خطوة بخطوة'),
      table(['العملية', 'مثال وشرط'], [
        ['تضعيف الحرف الأخير', '**skip → skipping / skipped**: آخر مقطع منبور ينتهي عادةً بحرف علّة واحد ثم حرف صامت واحد، واللاحقة تبدأ بحرف علّة. قارن **admit → admitting** و**visit → visiting**: نبر **visit** ليس على الأخير.'],
        ['حذف **e** النهائية', '**hope → hoping** و**save → saving** قبل **-ing**. احفظ **dye → dyeing** كي لا تختلط بـ**die → dying**.'],
        ['**y → i**', '**carry → carried** و**happy → happiness**: قبل **y** حرف صامت. لكن **carrying** تبقي **y** قبل **-ing**، و**enjoyed** تبقيها لأن قبلها حرف علّة.'],
      ]),
      p('التضعيف في **skipping** كتابة، لا يعني نطق {{/p/}} مرتين. ولا تُضعَّف **x** عادةً في **fixed**.'),
      tryIt('ما الجذع في **skipping** و**hoping** و**carried**، وما الذي تغيّر؟', '**skip** تضعيف؛ **hope** حذف **e**؛ **carry** قلب **y** إلى **i**.'),
      links(analyzer),
    ], ['word-parts','silent-e','suffix-ed'], [UF, IES]),
  lesson('suffix-tion', 'قراءة النهايات المتشابهة', 'Advanced Ending Patterns',
    'إذا وصلت إلى نهاية مثل -tion أو -sion، اقرأها كجزء كامل ولا تستنتج التهجئة من الصوت وحده.',
    '-tion|-sion|-ssion|-cian|-cial|-tial|-ture|-ous|-ive|-al|-ize|-able|-ible|نهايات',
    [
      h('عندما يتشابه الصوت وتختلف الكتابة'),
      table(['النهاية المكتوبة', 'ما الذي يفيدك في القراءة؟'], [
        ['**-tion / -sion / -cian**', '**invention / mission / musician** تنتهي عادةً بـ{{/ʃən/}}؛ **decision** بـ{{/ʒən/}}. **question** استثناء شائع فيه {{/tʃ/}} أو {{/ʃ/}} بحسب النطق.'],
        ['**-cial / -tial** و**-ture**', '**official / partial** فيهما {{/ʃəl/}}؛ **picture** تنتهي بـ{{/tʃɚ/}}. لا تستعمل الصوت وحده لتختار بين **-cial** و**-tial**.'],
        ['**-able / -ible**', '**washable / visible** تنتهيان بما يقارب {{/əbəl/}}. **wash** أساس واضح في الأولى؛ لا تفرض هذا الاختبار على كل كلمة.'],
        ['**-ous / -ive / -al**', 'في **famous / active / final** تعامل مع النهاية كوحدة. في **active** لا تجعل وجود **e** سببًا لقراءة **i** مثل اسمها.'],
        ['**-ize** في مقابل **-ise** المكتوبة', 'في هذا المسار الأمريكي نستخدم **memorize**. لا تعامل كل **-ise** كلاحقة: **promise** لا تتقافى مع **memorize**.'],
      ]),
      tryIt('أي نهاية تسمعها في **decision**؟ وهل يكفي نطق آخر **official** لتعرف أهي **-cial** أم **-tial**؟', 'تسمع {{/ʒən/}} في **decision**. لا؛ **official** و**partial** لهما نهاية صوتية متشابهة. تعلّم الكتابة مع الكلمة.'),
      links(audioRef('بطاقة /ʃ/ في الدفتر','s-33'),audioRef('بطاقة /ʒ/ في الدفتر','s-34')),
    ], ['word-parts','stress-word-families','decoding'], [UF, IES, ROCKETS]),
];

export const applied = [
  lesson('decoding', 'فك الكلمات الطويلة خطوة بخطوة', 'Decoding Multisyllabic Words',
    'لا تبدأ من أول حرف وتخمّن بقية الكلمة. حدّد الأجزاء المعروفة ثم اقرأ ما بقي على دفعات قصيرة.',
    'decoding|syllable division|consonant le|open syllable|closed syllable|المقاطع|فك التشفير|كلمات طويلة',
    [
      h('روتين من أربع خطوات'),
      steps('ضع حدًا بين جزأي الكلمة المركّبة: **sun | light**. وإن وجدت سابقة أو لاحقة حقيقية، افصلها: **un | help | ful**.',
        'ضع علامة تحت مجموعات العلة واترك المجموعة معًا: **rain | coat**، لا تفصل **ai** أو **oa**.',
        'حاول التقسيم عند حدود قابلة للقراءة: **nap | kin**؛ وفي **bubble** اقرأ **bub | ble** (صامت + **le**). جرّب **ro | bot** إذا بدا الجزء الأول مفتوحًا؛ في **plan | et** القسم الأول مغلق. هذه قرائن لا تقطيع صوتي قطعي.',
        'ادمج الأجزاء. إن لم تتعرّف على الكلمة، جرّب تقسيمًا آخر أو راجع النطق الأمريكي في القاموس، ثم أعد قراءة الجملة كاملة.'),
      p('لا تعدّ حروف العلة لتعرف عدد المقاطع: **raincoat** ليست أربعة مقاطع. كما أن **hotel** لا تحمل النبر بالضرورة حيث تتوقع من شكل أول مقطع؛ تحقّق من موضعه في القاموس.'),
      tryIt('جرّب **bedtime** ثم **carelessness**. أيهما مركّبة؟ وأين الأجزاء ذات المعنى؟', '**bed | time** مركّبة. **care | less | ness** أساس ولاحقتان؛ بعد تحديدها اقرأ الكلمة كاملة، ولا تحوّل كل جزء إلى كلمة مستقلة عند النطق.'),
      links(decodeTool,analyzer,audioRef('الشوا في دفتر IPA','s-10')),
    ], ['consonant-blends','word-parts','stress-word-families'], [IES, ROCKETS, WWC]),
  lesson('stress-word-families', 'تغيّر النبر داخل عائلة الكلمة', 'Stress in Word Families',
    'التشابه في الكتابة أو المعنى لا يعني أن النبر ثابت. تعلّم الكلمات المرتبطة في أزواج، وتحقّق من المقطع الأقوى عند إضافة اللاحقة.',
    'stress shift|secondary stress|word families|photography|electricity|-ity|-ic|العائلات|النبر',
    [
      h('اقرأ العائلة وقارن موضع القوة'),
      table(['عائلة واحدة', 'ما الذي تسمعه؟'], [
        ['**PHO-to-graph → pho-TOG-ra-phy → pho-to-GRAPH-ic**','النبر الرئيسي ينتقل من الأول إلى الثاني ثم الثالث. لا تقرأ **photography** كأنها **photograph** فقط مضافًا إليها حرف.'],
        ['**e-LEC-tric → e-lec-TRIC-i-ty**','مع **-ity** انتقل النبر، وتغيّر نطق **c** قبل **i**.'],
        ['**e-CON-o-my → ec-o-NOM-ic**','مع **-ic** تُسمع قوة المقطع السابق في هذا المثال. لا تفترض أن كل كلمة مكتوبة بـ **-ic** تأتي من عائلة تستطيع استنتاج نطقها.'],
        ['**HAP-py → HAP-pi-ness**','تغيرت الكتابة وبقي موضع النبر. ليست كل لاحقة سببًا لتغييره.'],
      ]),
      p('في القاموس تدل {{ˈ}} على النبر الرئيسي قبل المقطع، وتدل {{ˌ}} على نبر ثانوي. الحروف الكبيرة هنا دليل قراءة، وليست تعديلًا لتهجئة الكلمة.'),
      tryIt('أين النبر الرئيسي في **photography** و**electricity** مقارنةً بـ **photograph** و**electric**؟', 'ينتقل من الأول إلى الثاني في عائلة **photograph**، ومن الثاني إلى الثالث في عائلة **electric**.'),
      links(audioRef('عينات المقاطع غير المنبورة في الدفتر','s-10'),analyzer),
    ], ['word-parts','suffix-tion','context-pronunciation'], [IES, cam('photography'), cam('electricity')]),
  lesson('context-pronunciation', 'متى تحتاج إلى السياق أو القاموس؟', 'Context & Dictionary Checks',
    'إذا قبلت الكتابة أكثر من قراءة، حدّد معنى الكلمة ووظيفتها في الجملة ثم قارِن المدخل الأمريكي في القاموس.',
    'heteronyms|read|record|wind|flapping|context|سياق|النطق الأمريكي|القاموس',
    [
      h('الكتابة ثابتة، والقراءة تتغيّر'),
      table(['قارن داخل الجملة', 'ما الذي حسم القراءة؟'], [
        ['**I read every day. / I read it yesterday.**', 'العادة في الأولى {{/rid/}}، والماضي في الثانية {{/rɛd/}}.'],
        ['**The wind is strong. / Wind the clock.**', 'الرياح {{/wɪnd/}}، ولفّ آلية الساعة {{/waɪnd/}}.'],
        ['**Keep a record. / Record the call.**', 'الاسم بنبر أول {{/ˈrɛkɚd/}}، والفعل بنبر ثانٍ {{/rɪˈkɔrd/}}.'],
      ]),
      p('قد تسمع **t** في **water** بنقرة أمريكية خفيفة {{[ɾ]}}. هذا لا يغيّر الكتابة ولا يعني أن القاموس أخطأ عندما عرض {{/t/}} في النسخ الصوتي العام.'),
      tryIt('كيف تقرأ **read** في **I read it last night**؟ وكيف تتحقق لو كنت تجهل الكلمة؟', 'الزمن ماضٍ؛ {{/rɛd/}}. في القاموس الأمريكي اختر مدخل الماضي، واستمع إلى المثال، ثم اقرأ الجملة مجددًا.'),
      links(analyzer),
    ], ['decoding','stress-word-families','vowel-teams'], [cam('read'),cam('wind'),cam('record'),cam('water')]),
];
