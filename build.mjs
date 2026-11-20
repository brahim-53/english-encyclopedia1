// Bundles ES modules into one classic script (dist/app.js) so index.html works by double-click (file://).
// Usage: npm install && npm run build   (needs esbuild; only for developers who edit the source)
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { buildNotebookIndex } from './data/build-notebook.mjs';
import { transformSource } from './data/locale-source.mjs';
await buildNotebookIndex();
const localePlugin = {
  name: 'bilingual-interface',
  setup(builder) {
    builder.onLoad({ filter: /\/(?:app|sections)\/.*\.js$/ }, async ({ path }) => ({
      contents: transformSource(await readFile(path, 'utf8'), relative(process.cwd(), path)),
      loader: 'js',
    }));
  },
};
const options = { bundle: true, format: 'iife', target: ['es2019'], logLevel: 'info' };
const notebook = 'public/notebook/index.html';
// An opaque sandboxed frame on file:// cannot import a sibling script. Inline
// the same compiled add-on into the existing document without loosening sandbox.
async function compileNotebookAddons() {
  const built = await build({ ...options, entryPoints: ['app/locale/notebook.js'], write: false, minify: true,
    define: { ERP_NOTEBOOK_BUILD: 'true' } });
  const code = built.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const html = await readFile(notebook, 'utf8');
  const pattern = /<script data-notebook-addons>[\s\S]*?<\/script>/;
  if (!pattern.test(html)) throw new Error('Notebook add-on marker is missing');
  await writeFile(notebook, html.replace(pattern, () => `<script data-notebook-addons>${code}</script>`));
}
await Promise.all([
  build({ ...options, entryPoints: ['app/main.js'], outfile: 'dist/app.js', plugins: [localePlugin] }),
  compileNotebookAddons(),
]);
