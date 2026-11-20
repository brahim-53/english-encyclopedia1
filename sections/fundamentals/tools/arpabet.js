// ARPAbet (CMUdict) → General American IPA conversion + syllabification.
// Used by the Word Analyzer tool. Dictionary: CMU Pronouncing Dictionary.

// ARPAbet → GA IPA (segmental)
export const A2I = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ',
  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', EH: 'ɛ', EY: 'eɪ', F: 'f',
  G: 'g', HH: 'h', IH: 'ɪ', IY: 'iː', JH: 'dʒ', K: 'k', L: 'l', M: 'm', N: 'n',
  NG: 'ŋ', OW: 'oʊ', OY: 'ɔɪ', P: 'p', R: 'r', S: 's', SH: 'ʃ', T: 't',
  TH: 'θ', UH: 'ʊ', UW: 'uː', V: 'v', W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ',
};

export function arpabetToIPA(phones) {
  // Emit each phone as IPA. When we encounter a vowel with a stress digit,
  // we back-insert the stress mark before the consonant cluster that opened
  // that syllable (i.e., since the previous vowel).
  const VOW = (p) => /^[AEIOU]/.test(p);
  const A2I2 = (base, st) => {
    if (base === 'AH') return st === '0' ? 'ə' : 'ʌ';
    if (base === 'ER') return st === '0' ? 'ɚ' : 'ɝ';
    if (base === 'IY') return st === '0' ? 'i' : 'iː';
    if (base === 'UW') return st === '0' ? 'u' : 'uː';
    return A2I[base] ?? null;
  };
  const out = [];
  let clusterStart = 0;
  for (const ph of phones) {
    const m = ph.match(/^([A-Z]+)([0-9])?$/);
    if (!m) continue;
    const base = m[1], st = m[2];
    const ipa = A2I2(base, st);
    if (!ipa) continue;
    const isV = VOW(ph);
    if (isV) {
      if (st === '1' || st === '2') {
        const mark = st === '1' ? 'ˈ' : 'ˌ';
        out.splice(clusterStart, 0, mark);
        clusterStart++;
      }
      out.push(ipa);
      clusterStart = out.length; // the next cluster starts right after this vowel
    } else {
      out.push(ipa);
    }
  }
  return out.join('');
}

const V = (p) => /^[AEIOU]/.test(p);

export function syllabify(phones) {
  const syl = [];
  let cur = [];
  for (const ph of phones) {
    if (V(ph)) {
      if (cur.some(V)) { syl.push(cur); cur = []; }
      cur.push(ph);
    } else cur.push(ph);
  }
  if (cur.length) syl.push(cur);
  return syl;
}

export function stressIndex(phones) {
  let vi = -1;
  for (const ph of phones) {
    if (V(ph)) vi++;
    if (/^[AEIOU][A-Z]*1$/.test(ph)) return vi;
  }
  return -1;
}

// Single-phone conversion (no stress mark) – used for phoneme chips and syllable labels.
export function phoneToIPA(ph) {
  const m = ph.match(/^([A-Z]+)([0-2])?$/);
  if (!m) return '?';
  const base = m[1], st = m[2];
  if (base === 'AH') return st === '0' ? 'ə' : 'ʌ';
  if (base === 'ER') return st === '0' ? 'ɚ' : 'ɝ';
  if (base === 'IY') return st === '0' ? 'i' : 'iː';
  if (base === 'UW') return st === '0' ? 'u' : 'uː';
  return A2I[base] ?? '?';
}
