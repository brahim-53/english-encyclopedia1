// Exercise bank — optional practice tied to real encyclopedia topics.
// Engine types: mcq (choice) | fill (type the answer) | sort (classify) | pair (match).
// Each exercise carries `topic` = id of an existing topic in this platform
// (validated by tests/validate.mjs) and a `why` explaining the correct answer.
// Content is authored for this platform; several items were adapted from the
// reviewed source project's bank and re-mapped to real topic ids.
// Reference accent: General American (GA).
export const EXERCISES = [
  // ===== Fundamentals: تطبيقات بعد دفتر IPA =====
  { t: 'mcq', topic: 'spelling-units', q: 'أي حرف في six يمثّل صوتين؟', opts: ['s', 'i', 'x'], a: 2, why: 'يمثل x هنا /ks/، لذلك لا يكفي عدّ الحروف لحساب الأصوات.' },
  { t: 'mcq', topic: 'soft-c-g', q: 'أي كلمة تحتفظ بنطق g الصلبة قبل i أو e؟', opts: ['germ', 'gift', 'gentle'], a: 1, why: 'تبدأ gift بـ /ɡ/ رغم وجود i. قراءة g قبل e وi وy ليست حتمية.' },
  { t: 'mcq', topic: 'silent-letters', q: 'في أي كلمة تُنطق b؟', opts: ['climbing', 'number', 'climb'], a: 1, why: 'الصمت في آخر أساس climb يبقى مع -ing. أما number فتُسمع فيها b.' },
  { t: 'mcq', topic: 'consonant-blends', q: 'أي تقسيم يحافظ على وحدات crash؟', opts: ['c | r | a | s | h', 'c | r | a | sh', 'c | ra | s | h'], a: 1, why: 'تندمج c وr مع بقاء صوت كل واحد، لكن sh تُقرأ كوحدة واحدة.' },
  { t: 'fill', topic: 'tch-dge', q: 'أكمل كلمة ra__e بمعنى «نطاق». اكتب الكلمة كاملة.', accept: ['range'], show: 'range', why: 'range فيها n قبل الصوت الأخير؛ ليست بعد حركة قصيرة مكتوبة بحرف واحد مباشرة.' },
  { t: 'mcq', topic: 'vowel-teams', q: 'أي زوج يتقافى في النطق الأمريكي العام؟', opts: ['blood / food', 'through / though', 'great / eight'], a: 2, why: 'great وeight تشتركان في /eɪt/ رغم اختلاف الكتابة.' },
  { t: 'mcq', topic: 'silent-e', q: 'أي كلمة تنتهي بـ e صامتة تبقي c لينة دون أن تجعل i مثل اسمها؟', opts: ['stripe', 'prince', 'give'], a: 1, why: 'في prince تُقرأ c /s/، وi تبقى /ɪ/ رغم الـe النهائية.' },
  { t: 'mcq', topic: 'word-parts', q: 'أي تقسيم يكشف الأجزاء ذات المعنى في unhelpful؟', opts: ['un | help | ful', 'unhe | lp | ful', 'unh | elpful'], a: 0, why: 'un- سابقة، help أساس، و-ful لاحقة. قراءة الأساس أولًا تساعدك على وصل الأجزاء.' },
  { t: 'mcq', topic: 'suffix-ed', q: 'أين تضيف اللاحقة مقطعًا كاملًا؟', opts: ['jogged', 'fixed', 'needed'], a: 2, why: 'needed تأتي بعد /d/، فتضيف مقطعًا. أما fixed وjogged فلا يزداد عدد المقاطع.' },
  { t: 'mcq', topic: 'consonant-doubling', q: 'أي جذع استُعيد من hoping؟', opts: ['hop', 'hope', 'hopp'], a: 1, why: 'hope تفقد e النهائية قبل -ing، بينما hop تصبح hopping.' },
  { t: 'mcq', topic: 'suffix-tion', q: 'ما الزوج الذي يشترك في نهاية تشبه /ʃəl/ رغم اختلاف الكتابة؟', opts: ['official / partial', 'official / picture', 'decision / official'], a: 0, why: 'تتفق -cial و-tial في هاتين الكلمتين صوتيًا؛ لا يمكنك استرجاع الكتابة من الصوت وحده.' },
  { t: 'mcq', topic: 'decoding', q: 'ما التقسيم الذي يحافظ على مجموعتي العلة في raincoat؟', opts: ['r | a | in | coat', 'rainc | oat', 'rain | coat'], a: 2, why: 'قسّم عند حدّ الكلمتين المكوّنتين لها، وأبقِ ai وoa معًا.' },
  { t: 'mcq', topic: 'stress-word-families', q: 'في أي زوج ينتقل النبر من الثاني إلى الثالث؟', opts: ['happy / happiness', 'electric / electricity', 'photograph / photography'], a: 1, why: 'e-LEC-tric تصبح e-lec-TRIC-i-ty. تشابه الكتابة لا يحفظ موضع النبر بالضرورة.' },
  { t: 'mcq', topic: 'context-pronunciation', q: 'أي جملة يُنطق فيها read مثل red؟', opts: ['I read it yesterday.', 'I read every morning.', 'Can you read this?'], a: 0, why: 'تحدد yesterday زمن الماضي، فتُقرأ read هنا /rɛd/.' },

  // ===== Grammar: الأزمنة =====
  { t: 'mcq', topic: 'present-simple', q: 'أي جملة صحيحة؟', opts: ['She work every day.', 'She works every day.', 'She does works every day.'], a: 1, why: 'في المضارع البسيط المثبت نضيف s للفعل مع he / she / it: She works.' },
  { t: 'fill', topic: 'present-simple', q: 'أكمل: He ___ (play) football on Fridays.', accept: ['plays'], show: 'plays', why: 'مع he نضيف s إلى الفعل في المضارع البسيط المثبت: plays.' },
  { t: 'mcq', topic: 'present-continuous', q: 'أي جملة صحيحة؟', opts: ['Look! It rains.', 'Look! It is raining.', 'Look! It raining.'], a: 1, why: 'حدث يجري الآن أمام المتكلم → مضارع مستمر: is + V-ing. كلمة Look هنا مؤشر زمني.' },
  { t: 'mcq', topic: 'present-perfect', q: 'أي جملة صحيحة؟', opts: ['I have seen that movie last week.', 'I saw that movie last week.', 'I have see that movie last week.'], a: 1, why: 'last week زمن منتهٍ محدد، والزمن المنتهي يستدعي Past Simple (saw). المضارع التام لا يُستخدم مع ظرف زمن منتهٍ محدد.' },
  { t: 'mcq', topic: 'present-perfect', q: 'ما معنى I have lost my keys؟', opts: ['فقدتها في الماضي والوضع قائم الآن (لا أملكها)', 'فقدتها ثم وجدتها', 'أفقدها كل يوم'], a: 0, why: 'المضارع التام يربط حدث الماضي بنتيجته الحالية: فقدت المفاتيح وما زالت مفقودة — النتيجة الحاضرة هي جوهره.' },
  { t: 'mcq', topic: 'past-simple', q: 'أي سؤال صحيح؟', opts: ['Did you went?', 'Did you go?', 'Did you gone?'], a: 1, why: 'بعد did نستخدم الفعل الأساسي (go) لأن did تحمل علامة الماضي: Did you go?' },
  { t: 'fill', topic: 'past-simple', q: 'اكتب الماضي البسيط: go →', accept: ['went'], show: 'went', why: 'go فعل شاذ؛ ماضيه went ويجب حفظه (قائمة الأفعال الشاذة).' },
  { t: 'mcq', topic: 'past-continuous', q: 'أي جملة صحيحة؟', opts: ['I was do my homework when he called.', 'I was doing my homework when he called.', 'I did my homework when he was call.'], a: 1, why: 'الحدث الطويل المقطوع يأتي مضارعًا مستمرًا (was doing) والحدث القاطع ماضيًا بسيطًا (called).' },
  { t: 'mcq', topic: 'future-simple', q: 'أي جملة تعبر عن قرار فوري؟', opts: ['I will help you — قررت الآن', 'I am helping you — خطة مجدولة', 'I help you — عادة'], a: 0, why: 'will للقرار الفوري والتنبؤ؛ be going to للخطة السابقة؛ المضارع البسيط للعادات. القرار اللحظي عند الكلام = will.' },
  { t: 'mcq', topic: 'present-perfect-continuous', q: 'ماذا تعني: I have been studying for three hours؟', opts: ['درست وانتظرت ثلاث ساعات', 'أنا أدرس منذ ثلاث ساعات والدراسة مستمرة أو انتهت للتو', 'سأدرس ثلاث ساعات'], a: 1, why: 'المضارع التام المستمر يربط مدة (for three hours) باستمرار نشاط بدأ في الماضي ويمتد إلى الحاضر.' },

  // ===== Grammar: أدوات التعريف والمحددات =====
  { t: 'mcq', topic: 'articles-a-an', q: 'أي صيغة صحيحة؟', opts: ['a university', 'an university', 'a universities'], a: 0, why: 'القاعدة صوتية لا إملائية: university تبدأ بصوت /j/ (ساكن) فنستخدم a. قارن: an hour لأن h صامتة والصوت علّة.' },
  { t: 'mcq', topic: 'articles-a-an', q: 'أي صيغة صحيحة؟', opts: ['a hour', 'an hour', 'a honest man'], a: 1, why: 'hour تبدأ بصوت علّة لأن h صامتة → an hour. الاختيار يعتمد على أول صوت لا على أول حرف.' },
  { t: 'mcq', topic: 'articles-the', q: 'لماذا نقول the sun؟', opts: ['لأن الشمس فريدة في سياقنا', 'لأن sun اسم علم', 'القاعدة إلزامية لكل الأسماء'], a: 0, why: 'the للأسماء الفريدة أو المعروفة من السياق: the sun, the moon, the internet — لا يوجد إلا واحد مفهوم منها في السياق.' },
  { t: 'mcq', topic: 'some-any', q: 'أي جملة صحيحة؟', opts: ["I don't have some money.", "I don't have any money.", 'I have any money.'], a: 1, why: 'any هي الأصل في النفي والأسئلة، وsome في الإثبات: I have some money / Do you have any money? — وبعض الاستثناءات مثل offers: Would you like some tea?' },
  { t: 'mcq', topic: 'much-many', q: 'أي جملة صحيحة؟', opts: ['How many money do you need?', 'How much money do you need?', 'How moneys do you need?'], a: 1, why: 'money غير معدودة → much. many للعد: many books, many friends.' },
  { t: 'mcq', topic: 'quantifiers', q: 'Coffee or tea? — Just ___ water, please.', opts: ['a little', 'a few', 'many'], a: 0, why: 'water غير معدود → a little. أما a few فللمعدود: a few cups.' },

  // ===== Grammar: الأسئلة والنفي =====
  { t: 'mcq', topic: 'questions-wh', q: 'أي سؤال صحيح؟', opts: ['Where you live?', 'Where do you live?', 'Where live you?'], a: 1, why: 'ترتيب سؤال wh: كلمة الاستفهام + فعل مساعد + فاعل + فعل: Where do you live? — لا يكفي تقديم كلمة الاستفهام وحدها.' },
  { t: 'mcq', topic: 'questions-tags', q: 'ما السؤال الذيلي الصحيح: You are coming, ___?', opts: ["aren't you?", "isn't it?", "don't you?"], a: 0, why: 'السؤال الذيلي يعكس الجملة: are → aren'+"'"+'t، ويكرر الفعل المساعد نفسه لا فعلًا آخر.' },
  { t: 'mcq', topic: 'questions-tags', q: 'ما السؤال الذيلي الصحيح: She never smiles, ___?', opts: ["does she?", "doesn't she?", "is she?"], a: 0, why: 'الجملة منفية بمعناها (never) فيأتي الذيل مثبتًا: does she? — القاعدة: النفي والإثبات يتبادلان.' },
  { t: 'mcq', topic: 'negation', q: 'أي نفي صحيح؟', opts: ['I no have money.', "I don't have money.", "I have not money."], a: 1, why: 'النفي في الحاضر يحتاج do/does: I don\'t have. الاستثناء: be والأفعال الناقصة تنفي بنفسها (I am not, I can\'t).' },

  // ===== Grammar: حروف الجر والروابط =====
  { t: 'mcq', topic: 'prepositions-time', q: 'أي حرف جر يناسب: ___ Monday؟', opts: ['in', 'on', 'at'], a: 1, why: 'on مع أيام الأسبوع والتواريخ: on Monday, on May 5th. أما at للساعات (at 6) وin للشهور والسنوات (in 2020).' },
  { t: 'mcq', topic: 'prepositions-time', q: 'أي حرف جر يناسب: ___ night؟', opts: ['in', 'on', 'at'], a: 2, why: 'at night استثناء معروف في علاقة الحروف بالوقت — تُحفظ لا تُستنتج: at night, at the weekend (بريطاني).' },
  { t: 'mcq', topic: 'prepositions-place', q: 'أي حرف جر يناسب: The keys are ___ the table؟', opts: ['on (على السطح)', 'in (داخل)', 'at (نقطة)'], a: 0, why: 'on للسطح الملامس: on the table. أما in داخل الحيز (in the box) وat للنقطة (at the door).' },

  // ===== Grammar: متقدم =====
  { t: 'mcq', topic: 'passive-voice', q: 'حول للمبني للمجهول: The window was broken… من فعل ماذا؟', opts: ['Someone broke the window.', 'The window broke something.', 'The window was breaking.'], a: 0, why: 'المجهول يبدأ بالمفعول الأصلي: Someone broke the window → The window was broken (by someone). المفعول يصبح فاعلًا والفعل يصبح be + التصريف الثالث.' },
  { t: 'mcq', topic: 'conditionals-second', q: 'أي جملة صحيحة؟', opts: ['If I had time, I would go.', 'If I would have time, I went.', 'If I have time, I would went.'], a: 0, why: 'الشرط الثاني (خيال حالي): if + ماضي بسيط → would + مصدر. لا يجتمع would مع if في هذه البنية.' },
  { t: 'mcq', topic: 'relative-clauses', q: 'أي جملة صحيحة؟', opts: ['The man who lives next door is a doctor.', 'The man which lives next door is a doctor.', 'The man lives who next door is a doctor.'], a: 0, why: 'who للإشارة إلى الأشخاص في الجملة الوصفية، which للأشياء، وترتيب الجملة الوصفية يلي الاسم مباشرة.' },
  { t: 'mcq', topic: 'reported-speech', q: 'حوّل: He said, "I am tired." →', opts: ['He said he is tired.', 'He said he was tired.', 'He said he has been tired.'], a: 1, why: 'الكلام المنقول بعد قال في الماضي يرجع بالزمن خطوة (backshift): am → was، ما لم يبق المعنى صادقًا في الحاضر.' },
  { t: 'mcq', topic: 'gerund-infinitive', q: 'أي جملة صحيحة؟', opts: ['I enjoy to swim.', 'I enjoy swimming.', 'I enjoy swim.'], a: 1, why: 'enjoy يتبعه gerund دائمًا: enjoy swimming. الأفعال التي تتبعها صيغة -ing تُحفظ فئةً (enjoy, finish, avoid, mind…).' },
  { t: 'mcq', topic: 'gerund-infinitive', q: 'ما الفرق في المعنى: I stopped smoking / I stopped to smoke؟', opts: ['لا فرق', 'أقلعت عن التدخين / توقفت لكي أدخن', 'كلاهما يعني التوقف النهائي'], a: 1, why: 'stop + gerund = الإقلاع عن الفعل؛ stop + to + مصدر = التوقف من أجل غرض. أفعال stop وremember وforget تغير معناها بهذا التبديل.' },

  // ===== Grammar: أقسام الكلام والترقيم =====
  { t: 'mcq', topic: 'adjectives-comparative', q: 'أي صيغة صحيحة؟', opts: ['more better', 'better', 'most best'], a: 1, why: 'better بالفعل صيغة مقارنة شاذة لـ good؛ لا تُضاعف الصيغة (لا نقول more better) لأن الصفة شاذة لا تقبل more.' },
  { t: 'mcq', topic: 'plural-nouns', q: 'ما جمع child؟', opts: ['childs', 'children', 'childrens'], a: 1, why: 'جمع شاذ يُحفظ: child → children. مثله: man → men، tooth → teeth. إضافة s للجمع الشاذ خطأ شائع.' },
  { t: 'sort', topic: 'plural-nouns', q: 'صنّف الجمع: نظامي أم شاذ؟', buckets: [{ id: 'reg', label: 'نظامي (+s/es)' }, { id: 'irr', label: 'شاذ' }], items: [{ txt: 'cats', b: 'reg' }, { txt: 'children', b: 'irr' }, { txt: 'boxes', b: 'reg' }, { txt: 'feet', b: 'irr' }, { txt: 'buses', b: 'reg' }, { txt: 'mice', b: 'irr' }], why: 'الجمع النظامي يتبع قواعد s/es بعد الأصوات المهموسة/الصاجية، والجمع الشاذ يُحفظ في قائمة مستقلة.' },
  { t: 'mcq', topic: 'nouns-countable', q: 'أي جملة صحيحة؟', opts: ['She gave me a good advice.', 'She gave me some good advice.', 'She gave me advices.'], a: 1, why: 'advice غير معدودة: لا تُجمع ولا تأخذ a — نستخدم some أو a piece of advice.' },
  { t: 'mcq', topic: 'punctuation-comma', q: 'أي جملة مرقمة ترقيمًا صحيحًا؟', opts: ['I bought apples, bananas and, oranges.', 'I bought apples, bananas, and oranges.', 'I bought, apples bananas and oranges.'], a: 1, why: 'الفاصلة تفصل عناصر القائمة، والفاصلة قبل and الأخيرة (Oxford comma) اختيارية شائعة — لا توضع بعد أول عنصر.' },
  { t: 'mcq', topic: 'word-formation-suffixes', q: 'ماذا تعني اللاحقة -er في teacher؟', opts: ['صفة مقارنة', 'اسم فاعل المهنة (من يُعلم)', 'جمع'], a: 1, why: 'اللاحقة -er تحول الفعل إلى اسم فاعل المهنة: teach → teacher، work → worker. قد تكون أيضًا مقارنة (bigger) — السياق يحدد.' },
];

export const exercisesByTopic = (topicId) => EXERCISES.filter((e) => e.topic === topicId);
export const topicsWithExercises = () => [...new Set(EXERCISES.map((e) => e.topic))];
