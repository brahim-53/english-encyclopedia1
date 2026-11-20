import { readFile } from 'node:fs/promises';
import * as fundamentals from '../sections/fundamentals/index.js';
import * as grammar from '../sections/grammar/index.js';
import { EXERCISES } from '../app/features/practice-data.js';
import { DECODE_WORDS } from '../app/features/decode-data.js';
import { audioKey, examplesFrom, inlineExamples } from '../app/features/utterances.js';
import { grammarComparisonNotes, grammarComparisonSamples } from '../sections/grammar/tools/grammar-compare.js';
import { tenseComparisonSamples } from '../sections/grammar/tools/tense-compare.js';
import { arpabetToIPA } from '../sections/fundamentals/tools/arpabet.js';

const items = new Map();
function add(text, ipa = '', priority = 2) {
  if (!text || !/[a-z]{2}/i.test(text)) return;
  const key = audioKey(text, ipa);
  if (!items.has(key) || items.get(key).priority > priority) items.set(key, { key, text, ipa, priority });
}
function rich(value, priority) {
  for (const x of inlineExamples(value)) add(x, '', priority);
  if (!/\p{Script=Arabic}/u.test(String(value)) && !/\{\{/.test(String(value))) {
    for (const x of examplesFrom(value, { teaching: true })) add(x, '', priority);
  }
}
const html = await readFile(new URL('../public/notebook/index.html', import.meta.url), 'utf8');
for (const name of ['S', 'P', 'C']) {
  const data = JSON.parse(html.match(new RegExp(`const ${name}=([\\s\\S]*?);\\r?\\n(?=const )`))[1]);
  const rows = data.flatMap((rec) => name === 'C' ? [rec[1]] : rec[2]);
  for (const row of rows) {
    for (const cell of row.split(';').filter((s) => s.includes('~'))) {
      const [word, ipa] = cell.split('~');
      const w = word.replace(/[[\]]/g, '');
      add(w, ipa, 0);
      add(w, '', 0);
    }
  }
}

for (const [topics, priority] of [[fundamentals.topics, 1], [grammar.topics, 3]]) {
  for (const lesson of topics) {
    for (const b of lesson.blocks) {
      if (b.type === 'examples') for (const { en, ipa } of b.items) {
        const parts = examplesFrom(en);
        for (const p of parts) add(p, parts.length === 1 && /^[a-z'-]+$/i.test(p) ? ipa : '', priority);
      }
      if (b.type === 'wr') for (const pair of b.pairs) {
        for (const p of examplesFrom(pair.right)) add(p, '', priority);
        rich(pair.why, priority);
      }
      if (b.type === 'table') for (const row of b.rows) for (const cell of row) rich(cell, priority);
      if (b.type === 'list' || b.type === 'ol') for (const row of b.items) rich(row, priority);
      if (b.type === 'p' || b.type === 'callout') rich(b.ar, priority);
      if (b.type === 'try') { rich(b.prompt, priority); rich(b.answer, priority); }
      if (b.type === 'cmp') for (const col of b.cols) for (const item of col.items) rich(item, priority);
    }
  }
}
for (const word of DECODE_WORDS) {
  add(word.w, word.ipa, 1); add(word.w, '', 1); add(word.s, '', 1);
}
for (const e of EXERCISES) {
  for (const value of [...(e.opts || []), ...(e.items || []).map((v) => v.txt), ...(e.pairs || []).map((v) => v[0]), e.show || '', e.q, e.why]) rich(value, 2);
}
for (const example of [...grammarComparisonSamples, ...tenseComparisonSamples]) {
  for (const value of examplesFrom(example)) add(value, '', 3);
}
for (const note of grammarComparisonNotes) rich(note, 3);
for (const word of ['ship', 'sheep', 'think', 'phone']) add(word, '', 0);
add('The ship is big.', '', 0);
const cmu = await readFile(new URL('./dict/cmu_original.dict', import.meta.url), 'utf8');
for (const [, word, phones] of cmu.matchAll(/^(nation|water|read|wind|record|lead|close|live|ship|sheep|think|phone)(?:\(\d+\))? +([A-Z0-9 ]+)$/gm)) {
  add(word, arpabetToIPA(phones.trim().split(' ')), 1);
}
console.log(JSON.stringify([...items.values()].sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key)), null, 2));
