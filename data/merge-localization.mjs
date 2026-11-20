// Mechanical merge of translation batches exported as arrays of [Arabic, English].
// Review overrides.json for editorial corrections. No runtime connection needed.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const dir = process.argv[2];
if (!dir) throw new Error('Usage: node data/merge-localization.mjs <directory-of-reviewed-batches>');
const pairs = new Map();
for (const file of (await readdir(dir)).filter((f) => f.endsWith('.json')).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))) {
  for (const [ar, en] of JSON.parse(await readFile(join(dir, file), 'utf8'))) {
    if (!ar || typeof en !== 'string' || !en.trim()) throw new Error(`Empty translation in ${file}: ${ar}`);
    pairs.set(ar, en.replace(/^\[[a-z0-9_.-]+\.(?:js|html)\]\s*/i, ''));
  }
}
await writeFile(new URL('../app/locale/catalog.json', import.meta.url), JSON.stringify(Object.fromEntries(pairs), null, 2) + '\n');
console.log(`Merged ${pairs.size} locale units`);
