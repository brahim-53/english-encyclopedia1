// Legacy topic links are routing aliases, not additional catalogue entries.
// A notebook anchor identifies the precise location in the original document.
const groups = [
  ['ipa-overview', 's-10', 'schwa ipa-schwa reduced-vowels'],
  ['ipa-overview', 'dipht', 'diphthongs'],
  ['ipa-overview', 'rcol', 'r-controlled letter-r'],
  ['ipa-overview', 'letters', 'letter-a letter-e letter-i letter-o letter-u ow-team ai-ay-team oi-oy-team'],
  ['ipa-overview', 's-1', 'ee-team'],
  ['ipa-overview', 's-6', 'au-aw-team'],
  ['ipa-overview', 's-12', 'igh-team'],
  ['ipa-overview', 's-27', 'ph-sound'],
  ['ipa-overview', 's-29', 'th-sounds'],
  ['ipa-overview', 's-33', 'sh-sound'],
  ['ipa-overview', 's-37', 'letter-j'],
  ['ipa-overview', 's-28', 'letter-v'],
  ['ipa-overview', 's-44', 'letter-w wh-sound'],
  ['spelling-units', '', 'letters-overview letter-x letter-y letter-q qu-sound phonemic-awareness'],
  ['soft-c-g', '', 'letter-c letter-g'],
  ['silent-letters', '', 'letter-b letter-h letter-k letter-l letter-m letter-p kn-sound wr-sound mb-sound'],
  ['consonant-blends', '', 'blending segmenting'],
  ['tch-dge', '', 'letter-n ch-sound gh-sound ck-sound ng-sound'],
  ['vowel-teams', '', 'ea-team oo-team oa-team ou-team ie-team'],
  ['word-parts', '', 'suffix-ment suffix-ness suffix-ly'],
  ['suffix-ed', '', 'suffix-es suffix-s'],
  ['suffix-tion', '', 'suffix-sion suffix-cian suffix-cial-tial suffix-ture suffix-ous suffix-ive suffix-ize suffix-able suffix-al suffix-ion-related letter-s letter-z'],
  ['decoding', '', 'syllable-structure syllable-division open-syllables closed-syllables cvc-patterns spelling-generalizations word-analyzer-tool'],
  ['stress-word-families', '', 'primary-stress secondary-stress stress-placement stress-shift suffix-ity suffix-ic'],
  ['context-pronunciation', '', 'ipa-aur letter-d letter-t letter-f connected-speech linking reduction assimilation elision flapping'],
];

const ipaIds = [
  'ipa-i-long ipa-i-short ipa-e ipa-ae ipa-a ipa-o-open ipa-u-short ipa-u-long ipa-uh ipa-schwa',
  'ipa-eir-diph ipa-ai ipa-oi ipa-au ipa-ou-diph',
  'ipa-ur ipa-ar ipa-ir ipa-eir _',
  'ipa-p ipa-b ipa-t ipa-d ipa-k ipa-g ipa-f ipa-v ipa-th-voiceless ipa-th-voiced ipa-s ipa-z ipa-sh ipa-zh ipa-h ipa-ch ipa-j ipa-m ipa-n ipa-ng ipa-r ipa-l ipa-y ipa-w',
].join(' ').split(' ');

export const topicAliases = new Map(groups.flatMap(([id, anchor, old]) =>
  old.split(' ').map((key) => [key, { id, anchor }])));
ipaIds.forEach((id, i) => {
  if (id !== '_') topicAliases.set(id, { id: 'ipa-overview', anchor: `s-${i + 1}` });
});

export const categoryAliases = new Map([
  ['letters', 'spelling'], ['combos', 'patterns'], ['endings', 'word-building'],
  ['syllables', 'applied'], ['ipa', 'start'], ['reading', 'applied'], ['tools', 'applied'],
]);
