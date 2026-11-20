// Extract translatable source units without altering Arabic data. esbuild plugs
// into the same parser for inline interface messages; authored data is looked
// up at render time instead of being translated at module initialization.
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { parse } from 'acorn';
import { fullAncestor } from 'acorn-walk';

const root = new URL('../', import.meta.url);
const AR = /[\p{Script=Arabic}]/u;
const human = (s) => /\p{Letter}/u.test(s) && AR.test(s);
const isHTML = (s) => /<\/?[a-z][a-z0-9-]*(?:\s|>|\/)/i.test(s);
const authored = (file) => /\/data\/|\/(index|legacy)\.js$/.test(file);
const noop = () => {};
const boundaries = /(\u0001\d+\u0002)/g;

function fragments(raw, add, translate) {
  const edit = (s, insideTag = false) => {
    if (insideTag) {
      return s.replace(/(\b(?:aria-label|title|placeholder|alt|value)=")([^"]*)(")/g,
        (_, a, b, c) => a + edit(b) + c);
    }
    return s.split(boundaries).map((piece) => {
      const trimmed = piece.trim();
      if (!human(trimmed)) return piece;
      add(trimmed);
      return piece.slice(0, piece.indexOf(trimmed)) + translate(trimmed) + piece.slice(piece.indexOf(trimmed) + trimmed.length);
    }).join('');
  };
  return raw.split(/(<\/?[a-z][^<>]*>|<!--[\s\S]*?-->)/gi)
    .map((s) => edit(s, s.startsWith('<'))).join('');
}

export function transformSource(code, file, collect = noop) {
  const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true });
  const edits = [];
  const data = authored(file);
  const skip = /\/(store|relations|arpabet|dict|legacy)\.js$|\/locale\/|\/features\/(?:audio|utterances|audio-core)\.js$/.test(file);
  if (skip) return code;
  fullAncestor(ast, (node, _, ancestors) => {
    const parent = ancestors.at(-2);
    if (ancestors.some((n) => n.type === 'CallExpression' && n.callee.name === 'textBi')) return;
    const dynamic = ancestors.some((n) => /^(?:ArrowFunctionExpression|FunctionExpression|FunctionDeclaration)$/.test(n.type));
    const compile = !data && dynamic && !/\/shared\/util\.js$/.test(file);
    if (node.type === 'Literal' && typeof node.value === 'string' && human(node.value)) {
      if (parent.type === 'Property' && parent.key === node && !parent.computed) return;
      const v = node.value;
      if (!isHTML(v)) {
        collect(v.trim());
        if (compile && !/^(?:المستوى |، )$/.test(v)) {
          edits.push([node.start, node.end, `__erpText(${JSON.stringify(v)})`]);
        }
      } else {
        const chunks = [];
        const spaced = fragments(v, collect, (key) => {
          chunks.push(key);
          return `\u0000${chunks.length - 1}\u0000`;
        });
        if (compile && chunks.length) {
          const parts = spaced.split('\u0000');
          edits.push([node.start, node.end, `(${parts.map((p, i) => i % 2 ? `__erpHTML(${JSON.stringify(chunks[+p])})` : JSON.stringify(p)).join('+')})`]);
        }
      }
    }
    if (node.type === 'TemplateLiteral' && node.quasis.some((q) => human(q.value.raw))) {
      const raw = node.quasis.map((q, j) => j ? `\u0001${j}\u0002${q.value.raw}` : q.value.raw).join('');
      const converted = fragments(raw, collect, (key) => '${__erpHTML(' + JSON.stringify(key) + ')}').split(boundaries);
      if (compile) for (const [j, q] of node.quasis.entries()) {
        if (converted[j * 2] !== q.value.raw) edits.push([q.start, q.end, converted[j * 2]]);
      }
    }
  });
  if (!edits.length) return code;
  edits.sort((a, b) => b[0] - a[0]);
  for (const [start, end, change] of edits) code = code.slice(0, start) + change + code.slice(end);
  const localePath = relative(resolve(root.pathname, file, '..'), resolve(root.pathname, 'app/locale/index.js'));
  return `import { t as __erpText, htmlText as __erpHTML } from ${JSON.stringify(localePath.startsWith('.') ? localePath : `./${localePath}`)};\n` + code;
}

export function notebookUnits(html, collect) {
  const prefix = html.split(/<script\b/i)[0];
  fragments(prefix, collect, (key) => key);
  for (const name of ['S', 'P', 'C']) {
    const match = html.match(new RegExp(`const ${name}=([\\s\\S]*?);\\r?\\n(?=const )`));
    const data = JSON.parse(match[1]);
    for (const [a, label, rows] of data) {
      if (name === 'C') { const [tip] = label.split(';'); if (human(tip)) collect(tip); continue; }
      if (human(label)) collect(label);
      for (const line of rows) {
        const parts = line.split(';');
        for (const value of parts.slice(0, name === 'S' ? 3 : 2)) if (human(value)) collect(value);
      }
    }
  }
}

export async function units() {
  const byUnit = new Map();
  const absorb = (file) => (s) => {
    if (!human(s)) return;
    if (!byUnit.has(s)) byUnit.set(s, []);
    if (!byUnit.get(s).includes(file)) byUnit.get(s).push(file);
  };
  for (const dir of ['app', 'sections']) {
    const files = (await readdir(new URL(`${dir}/`, root), { recursive: true })).sort();
    for (const f of files) {
      if (!f.endsWith('.js') || f.endsWith('notebook-index.js')) continue;
      const file = `${dir}/${f}`;
      transformSource(await readFile(new URL(file, root), 'utf8'), file, absorb(file));
    }
  }
  notebookUnits(await readFile(new URL('public/notebook/index.html', root), 'utf8'), absorb('public/notebook/index.html'));
  return [...byUnit].map(([ar, files]) => ({ ar, files }));
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  console.log(JSON.stringify(await units(), null, 2));
}
