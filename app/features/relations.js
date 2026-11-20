// Knowledge-relations engine — connects a written word (or a spelling pattern)
// to the encyclopedia topics that explain it. This is the textual bridge the
// Master Prompt allows between Fundamentals and Grammar: relations are path
// references resolved by the display engine, never code imports.
// Every topic id below is validated by tests/validate.mjs.

// Spelling endings -> Fundamentals suffix topics (matches public/dict/endings.js)
const refs = (id, patterns) => Object.fromEntries(patterns.split(' ').map((pat) => [pat, `fundamentals/${id}`]));
export const ENDING_TOPICS = {
  ...refs('suffix-tion', 'tion sion cian cial tial ture ous ious ive ize ise able ible al ion'),
  ...refs('stress-word-families', 'ity ic'),
  ...refs('word-parts', 'ment ness ly'),
  ...refs('suffix-ed', 'ed es s'),
};

// Letter combinations -> Fundamentals combo topics
export const DIGRAPHS = {
  ...refs('tch-dge', 'tch dge ck ng ch gh'),
  ...refs('silent-letters', 'wr kn mb gn'), ...refs('spelling-units', 'qu'),
  sh: 'fundamentals/ipa-overview#s-33', th: 'fundamentals/ipa-overview#cons',
  ph: 'fundamentals/ipa-overview#s-27', wh: 'fundamentals/ipa-overview#s-44',
};

// Vowel teams -> Fundamentals vowel-team topics
export const TEAMS = {
  ...refs('vowel-teams', 'ea oo ie ei eigh ui ew ough'),
  ...refs('ipa-overview#letters', 'ee oa ai ay ou ow oi oy'),
  ...refs('ipa-overview#s-6', 'au aw'), igh: 'fundamentals/ipa-overview#s-12',
};

// Common prefixes -> reading applications, with a contextual warning in the lesson.
export const PREFIXES = ['inter', 'under', 'over', 'anti', 'dis', 'mis', 'sub', 'pre', 'un', 're', 'non'];

const asTopic = (ref) => {
  const [sectionId, rest] = ref.split('/');
  const [id, anchor] = rest.split('#');
  return { sectionId, id, anchor };
};

function endingsIn(word) {
  const hits = [];
  for (const pat of Object.keys(ENDING_TOPICS)) {
    if (word.endsWith(pat) && word.length >= pat.length + 2) {
      hits.push({ kind: 'ending', pat, ...asTopic(ENDING_TOPICS[pat]) });
    }
  }
  return hits;
}

function containsIn(word, map, kind) {
  const hits = [];
  for (const key of Object.keys(map)) {
    if (word.includes(key)) hits.push({ kind, pat: key, ...asTopic(map[key]) });
  }
  return hits;
}

// All encyclopedia topics related to a word's written form.
// Explanatory only — the presence of a pattern is a hint, not a rule.
export function patternsInWord(rawWord) {
  const word = String(rawWord || '').toLowerCase().replace(/[^a-z']/g, '');
  if (!word || word.length < 3) return [];
  const hits = [...endingsIn(word), ...containsIn(word, DIGRAPHS, 'combo'), ...containsIn(word, TEAMS, 'team')];
  const prefix = PREFIXES.find((p) => word.startsWith(p) && word.length >= p.length + 3);
  if (prefix) hits.push({ kind: 'prefix', pat: prefix, sectionId: 'fundamentals', id: 'word-parts' });
  // de-duplicate by topic
  const seen = new Set();
  return hits.filter((h) => {
    const k = `${h.sectionId}/${h.id}#${h.anchor || ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Resolve a user-typed pattern like "-tion" or "tion" to its explaining topic(s).
export function patternTopic(pattern) {
  const pat = String(pattern || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!pat) return null;
  const ref = ENDING_TOPICS[pat] || null;
  if (ref) return asTopic(ref);
  if (DIGRAPHS[pat]) return asTopic(DIGRAPHS[pat]);
  if (TEAMS[pat]) return asTopic(TEAMS[pat]);
  return null;
}
