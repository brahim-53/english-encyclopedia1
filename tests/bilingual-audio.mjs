import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { units } from '../data/locale-source.mjs';
import { audioKey, examplesFrom } from '../app/features/utterances.js';
import { fromEnglishCatalog } from '../app/locale/index.js';
import { EXERCISES } from '../app/features/practice-data.js';
import clips from '../app/features/audio-index.json' with { type: 'json' };

const source = await units();
const ipa = (line) => [...line.matchAll(/\{\{(.+?)\}\}/gs)].map((m) => m[1]);
const deliberateMarkup = new Set(['بطاقة /ʃ/ في الدفتر', 'بطاقة /ʒ/ في الدفتر']);
for (const { ar } of source) {
  const en = fromEnglishCatalog(ar);
  assert.notEqual(ar, en, `Missing English: ${ar}`);
  assert(!/\p{Script=Arabic}/u.test(en), `Arabic in English catalog: ${en}`);
  if (!deliberateMarkup.has(ar)) assert.deepEqual(ipa(en), ipa(ar), `IPA changed in ${ar}`);
  assert(!/<\/?(script|iframe|img)\b/i.test(en), `Unexpected markup: ${en}`);
}
for (const exercise of EXERCISES) {
  for (const value of [exercise.q, exercise.why, ...(exercise.opts || []),
    ...(exercise.items || []).map((item) => item.txt), ...(exercise.buckets || []).map((bucket) => bucket.label)]) {
    assert(!/\p{Script=Arabic}/u.test(fromEnglishCatalog(value)), `Untranslated compiled exercise text: ${value}`);
  }
}
assert.deepEqual(examplesFrom('ship / sheep'), ['ship', 'sheep']);
assert.deepEqual(examplesFrom('take ↔ took'), ['take', 'took']);
assert.deepEqual(examplesFrom('ship/sheep'), ['ship', 'sheep']);
assert.deepEqual(examplesFrom('The *ship* is big.'), ['The ship is big.']);
assert.deepEqual(examplesFrom('crash → c | r | a | sh', { teaching: true }), ['crash']);
assert.deepEqual(examplesFrom('will have + V3', { teaching: true }), []);
assert.notEqual(audioKey('read', '/rid/'), audioKey('read', '/rɛd/'));
console.log(`English catalog: ${source.length} extracted messages; inline IPA sequences preserved.`);

const inventory = JSON.parse(execFileSync(process.execPath, [
  fileURLToPath(new URL('../data/audio-inventory.mjs', import.meta.url)),
], { encoding: 'utf8' }));
const missing = inventory.filter((x) => !Object.hasOwn(clips, x.key)).map((x) => x.key);
assert.deepEqual(missing, [], 'Static teaching utterance has no bundled audio');
const files = new Set();
for (const [word, [file, begin, end, kind]] of Object.entries(clips)) {
  assert(/^(?:[a-z]+\.ogg|us-\d{3}\.mp3)$/.test(file), `Unexpected audio path for ${word}`);
  assert((begin === 0 && end === 0 && kind === 'recording') ||
    (Number.isFinite(begin) && Number.isFinite(end) && begin >= 0 && begin < end && kind === 'generated'));
  files.add(file);
}
for (const file of files) assert((await stat(new URL(`../public/audio/${file}`, import.meta.url))).size > 1000);
assert.equal(clips.fish[3], 'recording');
assert.notDeepEqual(clips[audioKey('ship', 'ʃɪp')], clips[audioKey('sheep', 'ʃip')]);
console.log(`Audio: ${inventory.length} static keys, ${files.size} bundled files.`);
