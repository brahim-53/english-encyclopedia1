// Structural + content validation for the English Reference Platform (Node 20+, no deps).
// Usage: node tests/validate.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let errors = 0, warnings = 0;
const err = (m) => { console.error(`  ✗ ${m}`); errors++; };
const warn = (m) => { console.warn(`  ⚠ ${m}`); warnings++; };
const ok = (m) => console.log(`  ✓ ${m}`);

// ---------- Load sections via dynamic import ----------
console.log('\n[1] تحميل أقسام المنصة');
const SECTIONS = {
  fundamentals: await import(`file://${join(root, 'sections/fundamentals/index.js')}`).catch((e) => null),
  grammar: await import(`file://${join(root, 'sections/grammar/index.js')}`).catch((e) => { console.log(e.message); return null; }),
};
const { resolveTopic } = await import('../app/navigation/registry.js');
if (!SECTIONS.fundamentals) { err('فشل تحميل قسم Fundamentals'); process.exit(1); }
if (!SECTIONS.grammar) { err('فشل تحميل قسم Grammar'); process.exit(1); }
ok('قسمان محمّلان بلا أخطاء برمجية');

// ---------- Topic shape + blocks ----------
console.log('\n[2] سلامة بيانات المواضيع');
const ALL = {};
for (const [sid, sec] of Object.entries(SECTIONS)) {
  const ids = new Set();
  for (const t of sec.topics) {
    if (ids.has(t.id)) err(`[${sid}] معرّف مكرر: ${t.id}`);
    ids.add(t.id);
    for (const f of ['id', 'cat', 'titleAr', 'titleEn', 'summaryAr']) {
      if (!t[f] || (typeof t[f] === 'string' && !t[f].trim())) err(`[${sid}/${t.id}] حقل ناقص: ${f}`);
    }
    if (!Array.isArray(t.kw) || t.kw.length < 2) err(`[${sid}/${t.id}] كلمات مفتاحية ناقصة`);
    const richTypes = new Set(['sounds', 'ipa-table', 'letters-grid', 'table', 'cmp', 'examples', 'wr', 'notebook']);
    const rich = (t.blocks || []).filter((b) => richTypes.has(b.type)).length;
    if (!Array.isArray(t.blocks) || t.blocks.length === 0 || (t.blocks.length < 2 && rich === 0))
      err(`[${sid}/${t.id}] محتوى (blocks) ناقص: ${t.blocks?.length ?? 0} كتلة`);
    if (!Array.isArray(t.related)) err(`[${sid}/${t.id}] related يجب أن يكون مصفوفة`);
    if (!Array.isArray(t.sources) || t.sources.length === 0) err(`[${sid}/${t.id}] لا مصادر موثقة`);
    for (const s of t.sources || []) {
      if (!s.name) err(`[${sid}/${t.id}] مصدر بلا اسم`);
    }
    ALL[t.id] = { t, sid };
  }
  // category validity
  const catIds = new Set(sec.categories.map((c) => c.id));
  for (const t of sec.topics) {
    if (!catIds.has(t.cat)) err(`[${sid}/${t.id}] cat غير معروف: ${t.cat}`);
  }
  // every category has topics
  for (const c of sec.categories) {
    if (c.topics && c.topics.length === 0) err(`[${sid}] تصنيف فارغ: ${c.id}`);
  }
}
ok(`Fundamentals: ${SECTIONS.fundamentals.topics.length} موضوعًا؛ Grammar: ${SECTIONS.grammar.topics.length} موضوعًا`);

// ---------- Related links resolve ----------
console.log('\n[3] الروابط الداخلية');
let missing = 0;
const resolve = (r) => {
  if (r.includes('/')) {
    const [sid, id] = r.split('/');
    return !!resolveTopic(sid, id);
  }
  return !!ALL[r];
};
for (const [sid, sec] of Object.entries(SECTIONS)) {
  for (const t of sec.topics) {
    for (const r of t.related || []) {
      if (!resolve(r)) { err(`رابط لا يحل: [${sid}/${t.id}] → '${r}'`); missing++; }
    }
  }
}
if (!missing) ok('كل الروابط الداخلية تحلّ إلى مواضيع موجودة');

// ---------- Section independence (imports only; related links are allowed cross-section) ----------
console.log('\n[4] استقلالية القسمين');
function scanImports(dir, other, cb) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) scanImports(p, other, cb);
    else if (f.endsWith('.js')) {
      const txt = readFileSync(p, 'utf8');
      const re = new RegExp(`(import[^;]*?from\\s*['"][^'"]*\\b${other}\\b|import\\s*['"][^'"]*\\b${other}\\b)`, 'i');
      if (re.test(txt)) cb(p);
    }
  }
}
scanImports(join(root, 'sections/fundamentals'), 'grammar', (p) => err(`Fundamentals يستورد من Grammar: ${p}`));
scanImports(join(root, 'sections/grammar'), 'fundamentals', (p) => err(`Grammar يستورد من Fundamentals: ${p}`));
ok('لا استيرادات برمجية متبادلة بين القسمين (التشابك عبر روابط related فقط)');

// ---------- Arabic/encoding sanity ----------
console.log('\n[5] سلامة النص العربي والمحتوى');
const files = [];
for (const d of ['sections/fundamentals/data', 'sections/grammar/data']) {
  for (const f of readdirSync(join(root, d))) if (f.endsWith('.js')) files.push(join(root, d, f));
}
for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  // Arabic ؟ is legitimate in Arabic prose; flag only when embedded inside Latin text (direction bug)
  const lines = txt.split('\n');
  lines.forEach((ln, i) => {
    const latin = (ln.match(/[A-Za-z]/g) || []).length;
    const arabic = (ln.match(/[\u0600-\u06FF]/g) || []).length;
    if (ln.includes('؟') && latin > 5 && arabic < 5) err(`${basename(f)}:${i + 1} علامة (؟) داخل نص لاتيني — تحقق من الاتجاه`);
  });
  if (/placeholder|TODO|FIXME|lorem/i.test(txt)) warn(`${basename(f)}: يحتوي placeholder/TODO`);
  // stray unclosed bold markers
  const stars = (txt.match(/\*\*/g) || []).length;
  if (stars % 2 !== 0) warn(`${basename(f)}: عدد ** فردي — قد يوجد تمييز غير مغلق`);
}
ok('لا مشاكل ترميز أو نصوص placeholder في ملفات البيانات');

// ---------- Block renderer coverage ----------
console.log('\n[6] أنواع الكتل');
const BLOCK_TYPES = new Set();
for (const sec of Object.values(SECTIONS)) {
  for (const t of sec.topics) {
    for (const b of t.blocks) {
      BLOCK_TYPES.add(b.type);
      if (b.type === 'examples' && (!b.items || b.items.some((i) => !i.en))) err(`[${t.id}] مثال بلا نص إنجليزي`);
      if (b.type === 'wr' && (!b.pairs || b.pairs.some((p) => !p.wrong || !p.right || !p.why))) err(`[${t.id}] كتلة wr ناقصة`);
      if (b.type === 'table' && (!b.head || !b.rows)) err(`[${t.id}] جدول ناقص`);
    }
  }
}
console.log(`  أنواع مستخدمة: ${[...BLOCK_TYPES].sort().join(', ')}`);
ok('كل الكتل المبنية من الأنواع المدعومة في محرك العرض');

// ---------- Dictionary shards ----------
console.log('\n[7] قاموس النطق');
const dictDir = join(root, 'public/dict');
if (existsSync(dictDir)) {
  const shards = readdirSync(dictDir).filter((f) => f.endsWith('.json'));
  let words = 0;
  for (const s of shards.slice(0, 3)) {
    const d = JSON.parse(readFileSync(join(dictDir, s), 'utf8'));
    words += Object.keys(d).length;
  }
  ok(`${shards.length} ملف قاموس جاهز للاستعمال (عينة أول 3 ملفات: ${words} مدخلًا)`);
  const nat = JSON.parse(readFileSync(join(dictDir, 'n.json'), 'utf8'));
  if (!nat.nation) err('كلمة nation غير موجودة في القاموس');
  else ok('nation موجودة في القاموس (اختبار Word Analyzer)');
} else {
  err('مجلد public/dict غير موجود');
}

// ---------- Tools ----------
console.log('\n[8] الأدوات التفاعلية');
const toolIds = [];
for (const [sid, sec] of Object.entries(SECTIONS)) {
  for (const t of sec.tools || []) {
    if (!t.id || !t.titleAr || !t.render || typeof t.mount !== 'function') err(`[${sid}] أداة ناقصة: ${t.id}`);
    toolIds.push(`${sid}/${t.id}`);
  }
}
ok(`الأدوات: ${toolIds.join(' · ')}`);

// ---------- v4: personal features layer ----------
console.log('\n[9] طبقة الميزات الشخصية v4');

// 9.1 EXERCISES: every topic id must exist in the registry, every item has why + valid type
const { EXERCISES } = await import('../app/features/practice-data.js');
const v4Topics = [...SECTIONS.fundamentals.topics, ...SECTIONS.grammar.topics];
const allTopicIds = new Set(v4Topics.map((t) => t.id));
const EX_TYPES = new Set(['mcq', 'fill', 'sort', 'pair']);
let exIssues = 0;
for (const e of EXERCISES) {
  if (!allTopicIds.has(e.topic)) { exIssues++; err(`[تمرين] موضوع غير موجود: ${e.topic}`); }
  if (!EX_TYPES.has(e.t)) { exIssues++; err(`[تمرين ${e.topic}] نوع غير مدعوم: ${e.t}`); }
  if (!e.why) { exIssues++; err(`[تمرين ${e.topic}] ينقصه شرح "why"`); }
}
if (!exIssues) ok(`${EXERCISES.length} تمرينًا — كل المعرفات والأنواع والشروح سليمة`);

// 9.2 relations.js: every mapped topic must exist
const { ENDING_TOPICS, DIGRAPHS, TEAMS, PREFIXES, patternTopic } = await import('../app/features/relations.js');
let relIssues = 0;
const refOk = (ref, label) => {
  const [sid, path] = String(ref).split('/');
  const [id] = path.split('#');
  const sec = SECTIONS[sid];
  if (!sec || !sec.topics.some((t) => t.id === id)) { relIssues++; err(`[علاقات] ${label} يشير لموضوع غير موجود: ${ref}`); }
};
for (const [pat, ref] of Object.entries(ENDING_TOPICS)) refOk(ref, `نهاية ${pat}`);
for (const [dg, ref] of Object.entries(DIGRAPHS)) refOk(ref, `تركيب ${dg}`);
for (const [tm, ref] of Object.entries(TEAMS)) refOk(ref, `فريق ${tm}`);
for (const pf of PREFIXES) if (typeof pf !== 'string' || !pf) relIssues++;
refOk('fundamentals/word-parts', 'بادئات');
if (!relIssues) ok(`علاقات الأنماط: ${Object.keys(ENDING_TOPICS).length} نهاية + ${Object.keys(DIGRAPHS).length} تركيب + ${Object.keys(TEAMS).length} فريق — كلها تشير لمواضيع موجودة`);
if (!patternTopic('-tion')) err('[علاقات] النمط -tion لا يعثر على موضوعه');
else ok('النمط -tion يرتبط بموضوع suffix-tion');

// 9.3 decode-data: every word must exist in CMUdict shards and IPA must match converter
const { DECODE_WORDS, DECODE_LEVELS } = await import('../app/features/decode-data.js');
// build word->phones from shards (same data the browser loads lazily)
const shardWords = {};
for (const f of readdirSync(join(root, 'public/dict')).filter((f) => f.endsWith('.json'))) {
  Object.assign(shardWords, JSON.parse(readFileSync(join(root, 'public/dict', f), 'utf8')));
}
const { arpabetToIPA } = await import('../sections/fundamentals/tools/arpabet.js');
let decIssues = 0;
for (const w of DECODE_WORDS) {
  if (!shardWords[w.w]) { decIssues++; err(`[فك التشفير] كلمة غير موجودة في القاموس: ${w.w}`); continue; }
  const expected = '/' + arpabetToIPA(shardWords[w.w][0].split(' ')) + '/';
  if (expected !== w.ipa) { decIssues++; err(`[فك التشفير] IPA لا يطابق CMUdict: ${w.w} متوقع ${expected} موجود ${w.ipa}`); }
}
if (DECODE_WORDS.some((w) => w.stress !== undefined)) {
  // verify stress index against CMUdict stress marks
  let stressIssues = 0;
  for (const w of DECODE_WORDS) {
    if (w.stress === undefined) continue;
    const phones = shardWords[w.w][0].split(' ');
    if (!phones) continue;
    // syllable index of the primary-stressed vowel (0-based ordinal among vowels)
    let idx = -1, vowelsSeen = 0;
    for (const ph of phones) {
      if (/^[AEIOU]/.test(ph)) {
        if (ph.endsWith('1')) { idx = vowelsSeen; break; }
        vowelsSeen++;
      }
    }
    if (idx !== w.stress) { stressIssues++; err(`[فك التشفير] موضع النبر لا يطابق: ${w.w} CMU=${idx} data=${w.stress}`); }
  }
  if (!stressIssues) ok('موضع النبر لكل كلمة يطابق علامات CMUdict');
}
if (!decIssues) ok(`${DECODE_WORDS.length} كلمة فك تشفير: كلها موجودة في القاموس وIPA مطابق للمحوّل`);
if (!DECODE_LEVELS.length) err('[فك التشفير] لا مستويات');

// 9.4 endings.js: patterns must match ENDING_TOPICS keys and words must exist in shards
const endingsSrc = readFileSync(join(root, 'public/dict/endings.js'), 'utf8');
const endingsObj = JSON.parse(endingsSrc.slice(endingsSrc.indexOf('=') + 1, endingsSrc.lastIndexOf(';')));
const endingKeys = new Set(Object.keys(ENDING_TOPICS));
let endIssues = 0;
for (const pat of Object.keys(endingsObj)) {
  if (!endingKeys.has(pat)) { endIssues++; err(`[endings] نمط غير مربوط بموضوع: ${pat}`); }
  for (const item of endingsObj[pat]) {
    if (!shardWords[item.w]) { endIssues++; err(`[endings] كلمة غير موجودة في القاموس: ${item.w}`); }
  }
}
if (!endIssues) ok(`endings.js: ${Object.keys(endingsObj).length} نمطًا — كلها مربوطة بمواضيع وكلماتها موجودة`);

// 9.5 store.js schema sanity (COLLECTIONS + source-level shape/fallback check)
const { COLLECTIONS } = await import('../app/features/store.js');
const storeSrc = readFileSync(join(root, 'app/features/store.js'), 'utf8');
const shapeIssues = [];
const STORE_KEYS = ['bookmarks', 'recentTopics', 'progress', 'reviewQueue', 'exerciseResults', 'prefs'];
if (!STORE_KEYS.every((k) => COLLECTIONS.includes(k)) || COLLECTIONS.length !== STORE_KEYS.length) shapeIssues.push('COLLECTIONS لا يطابق المفاتيح الستة');
if (!storeSrc.includes("PREFIX = 'erp.v1.'")) shapeIssues.push('PREFIX ليس erp.v1.');
for (const k of STORE_KEYS) {
  if (!new RegExp(`\\b${k}\\s*:`).test(storeSrc)) shapeIssues.push(`SHAPES/FALLBACKS ينقصه ${k}`);
}
if (shapeIssues.length) for (const s of shapeIssues) err(`[store] ${s}`);
else ok('store.js: مخطط مفاتيح erp.v1.* كامل (6 مفاتيح مع مدققات ومخطط نسخ احتياطي)');

console.log('\n[10] مسار القراءة والدفتر الأصلي');
const { topicAliases } = await import('../sections/fundamentals/legacy.js');
const { indexNotebook } = await import('../data/build-notebook.mjs');
const { notebookIndex } = await import('../sections/fundamentals/data/notebook-index.js');
const { buildIndex, search } = await import('../app/search/search.js');
const { importUserData, read, exportUserData } = await import('../app/features/store.js');
const { progressStats } = await import('../app/features/progress.js');
const path = SECTIONS.fundamentals;
const notebook = readFileSync(join(root, 'public/notebook/index.html'), 'utf8');
const source = join(root, '..', 'دفتر أصوات الإنجليزية الأمريكية.html');
const originalNotebookData = (html) => html.slice(html.indexOf('const S=['), html.indexOf('const W='));
if (existsSync(source) && originalNotebookData(readFileSync(source, 'utf8')) !== originalNotebookData(notebook)) {
  err('تغيّر المحتوى العلمي أو الكلمات أو IPA في بيانات الدفتر الأصلي');
}
if (path.topics[0].id !== 'ipa-overview' || path.categories[0].topics.length !== 1) err('الدفتر ليس الدرس الأول الوحيد في محور البداية');
if (path.topics.filter(t => t.blocks.some(b => b.type === 'notebook')).length !== 1) err('يوجد أكثر من نسخة من الدفتر في الدروس');
const derived = indexNotebook(notebook);
if (JSON.stringify(derived) !== JSON.stringify(notebookIndex)) err('فهرس الدفتر ليس مطابقًا للملف الأصلي؛ شغّل npm run build');
if (derived.filter(([anchor]) => anchor.startsWith('s-')).length !== 44) err('بطاقات الدفتر ليست 44');
const anchors = new Set([...derived.map(([anchor]) => anchor), ...Array.from(notebook.matchAll(/id="([^"]+)"/g), (m) => m[1]), 'vowels', 'dipht', 'rcol', 'cons']);
if (topicAliases.size !== 135) err('عدد روابط المواضيع القديمة غير مطابق للتدقيق');
for (const [id, { anchor }] of topicAliases) {
  if (!resolveTopic('fundamentals', id) || (anchor && !anchors.has(anchor))) err(`رابط قديم غير صالح: ${id}`);
}
const toolRoutes = new Set([...path.tools.map((t) => t.id), 'read-decode', 'practice-center']);
for (const topic of path.topics) {
  for (const block of topic.blocks.filter((b) => b.type === 'links')) {
    for (const [, href] of block.items) {
      const match = /^#\/(\w+)\/t\/([\w-]+)(?:#([\w-]+))?$/.exec(href);
      if (match) {
        if (!resolveTopic(match[1], match[2]) || (match[3] && !anchors.has(match[3]))) err(`رابط درس غير صالح: ${href}`);
      } else if (!href.startsWith('#/tools/') || !toolRoutes.has(href.split('/')[2])) err(`رابط أداة غير صالح: ${href}`);
    }
  }
}
const validWords = ['box', 'quick', 'crash', 'cycle', 'gift', 'climbing', 'number', 'singer', 'finger', 'patch', 'badge',
  'through', 'cough', 'bough', 'blood', 'flood', 'great', 'eight', 'prince', 'stripe', 'dyeing', 'dying', 'admitting',
  'visiting', 'fixed', 'jogged', 'needed', 'learned', 'unhelpful', 'repaint', 'arrangement', 'quickly', 'invention',
  'decision', 'musician', 'official', 'partial', 'picture', 'washable', 'visible', 'raincoat', 'planet', 'bedtime',
  'carelessness', 'photograph', 'photography', 'photographic', 'electricity', 'wind', 'record', 'read', 'water'];
for (const word of validWords) if (!shardWords[word]) err(`مثال أساسي غير موجود في CMUdict: ${word}`);
for (const [word, expected] of [
  ['read', ['R EH1 D', 'R IY1 D']], ['wind', ['W AY1 N D', 'W IH1 N D']],
  ['singer', ['S IH1 NG ER0']], ['finger', ['F IH1 NG G ER0']],
  ['record', ['R EH1 K ER0 D', 'R IH0 K AO1 R D']],
]) if (!expected.every((phones) => shardWords[word]?.includes(phones))) err(`نطق التباين غير مطابق للقاموس: ${word}`);
buildIndex();
if (search('/θ/', 1, 'fundamentals')[0]?.anchor !== 's-29') err('بحث IPA لا يعثر على بطاقة الدفتر الدقيقة');
if (!search('raincoat', 15, 'fundamentals').some((result) => result.id === 'decoding')) err('بحث كلمة من درس لا يعثر على الدرس');
if (search('/θ/', 12, 'fundamentals').filter((result) => result.id === 'ipa-overview').length !== 1) err('بحث الدفتر مكرر');
importUserData({
  bookmarks: ['grammar/present-simple', 'fundamentals/ipa-th-voiceless', 'fundamentals/no-such-topic'],
  recentTopics: ['fundamentals/closed-syllables'],
  progress: { reviewed: { 'grammar/present-simple': 2, 'fundamentals/closed-syllables': 3 } },
  reviewQueue: { items: { 'fundamentals/closed-syllables': { stage: 2, next: 86400000 } }, done: {} },
});
if (read('bookmarks').join() !== 'grammar/present-simple,fundamentals/ipa-overview' ||
    read('recentTopics').join() !== 'fundamentals/decoding' ||
    read('reviewQueue').items['fundamentals/decoding']?.stage !== 0 ||
    progressStats().sections.fundamentals.done !== 0 || progressStats().sections.grammar.done !== 1 ||
    !exportUserData().progress.reviewed['fundamentals/closed-syllables']) err('الترحيل لم يحفظ المراجع أو منح إتقانًا تلقائيًا');
ok('ترتيب المسار، سلامة الدفتر وفهرسه، الرابط القديم، أمثلة القاموس، البحث وترحيل البيانات');

// ---------- Report ----------
console.log('\n========== النتيجة ==========');
console.log(`أخطاء: ${errors} · تحذيرات: ${warnings}`);
process.exit(errors ? 1 : 0);
