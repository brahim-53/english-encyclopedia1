// Shared by corpus build and renderers. No browser APIs.
const LETTER = /^[a-z]+(?:[-'’][a-z]+)*$/i;
const NON_EXAMPLES = new Set(('cvc cvce ccvc cvcc vce vcc cc v cv vc ipa cmu cmudict esl efl ga arpabet donot noun verb adjective adverb pronoun determiner article past present future perfect simple continuous progressive infinitive gerund diphthong phoneme grapheme schwa onset nucleus coda syllable silent digraph trigraph ar en am'.split(' ')));
const GRAPHEMES = new Set('ai ay ea ee aw au oa oe ew ui eigh ei ie ph gh tch dge sh ch ck kn wr gn ng tion sion ough th ed'.split(' '));

export const audioText = (value) => String(value ?? '').replace(/[*[\]\u200e\u200f\u2066-\u2069]/g, '').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
export const ipaKey = (value = '') => String(value).trim().replace(/^[/[]|[/\]]$/g, '').replace(/ɹ/g, 'r').replace(/g/g, 'ɡ').replace(/[ː.]/g, '');
export const audioKey = (text, ipa = '') => `${audioText(text).toLowerCase()}${ipa ? `|${ipaKey(ipa)}` : ''}`;

export function examplesFrom(value, { teaching = false } = {}) {
  const str = audioText(value).replace(/^[✓✗×→↔~:;\s]+|[;:\s]+$/g, '');
  if (!str || str.length > 250 || !/[a-z]{2}/i.test(str)) return [];
  const segmentation = /^([a-z]{2,})\s*→\s*[a-z].*\|/i.exec(str);
  if (segmentation) return [segmentation[1]];
  // Split comparisons into separately playable utterances. Never pronounce
  // mathematical operators, spelling notation, or a list as one word.
  const groups = str.split(/\s+[\/↔→]\s+|\s*;\s*|\s+vs\.?\s+/i);
  if (groups.length > 1) return groups.flatMap((p) => examplesFrom(p, { teaching }));
  if (/[^\x20-\x7e“”–—…]/u.test(str) || /[=<>|{}_*]/.test(str)) return [];
  if (/^[a-z'-]{2,}(?:\/[a-z'-]{2,})+$/i.test(str)) {
    return str.split('/').flatMap((p) => examplesFrom(p, { teaching }));
  }
  const comma = str.split(/,\s+/);
  if (comma.length > 1 && comma.every((p) => LETTER.test(p))) {
    return comma.flatMap((p) => examplesFrom(p, { teaching }));
  }
  if (LETTER.test(str)) {
    if (str.length === 1 || NON_EXAMPLES.has(str.toLowerCase()) || (teaching && GRAPHEMES.has(str.toLowerCase())) || /^[A-Z]{2,}$/.test(str)) return [];
    if (/^[a-z]+(?:-[a-z]+)+$/i.test(str) && /[A-Z]{2,}/.test(str) && /[a-z]/.test(str)) {
      return [str.replaceAll('-', '').toLowerCase()];
    }
    return [str];
  }
  if (str.startsWith('-') || /\/|https?:|_{2,}|\+|\[[^\]]*\]/.test(str)) return [];
  if (/^(?:[A-Z]{2,}|[a-z])(?:\s*\+\s*|\s+)(?:[A-Z]{2,}|[a-z])$/i.test(str)) return [];
  if (!/^[a-z0-9“"(']/i.test(str) || !/[a-z]/i.test(str.at(-1)) && !/[.!?…'"”)]$/.test(str)) return [];
  return [str];
}

export function inlineExamples(value) {
  return [...String(value ?? '').matchAll(/\*\*([^*]+)\*\*|(?<!\*)\*([^*\n]+)\*(?!\*)/g)]
    .flatMap((m) => examplesFrom(m[1] || m[2], { teaching: true }));
}
