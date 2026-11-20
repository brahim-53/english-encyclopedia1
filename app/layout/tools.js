// Tools hub + tool page renderer
import { esc } from '../shared/util.js';
import { SECTIONS } from '../navigation/registry.js';
import { practiceTool } from '../features/practice.js';
import { decodeTool } from '../features/decode.js';

// Shared cross-section tools (personal / practice features).
const SHARED_TOOLS = [
  practiceTool,
  decodeTool,
  { id: 'my-shelf', titleAr: 'مجلتي — المحفوظات والتقدم والمراجعة', titleEn: 'My Shelf', render() { return ''; }, mount() {}, isLink: true },
];

function allTools() {
  return [
    ...SECTIONS.fundamentals.tools.map((t) => ({ ...t, sec: 'fundamentals' })),
    ...SECTIONS.grammar.tools.map((t) => ({ ...t, sec: 'grammar' })),
    ...SHARED_TOOLS.map((t) => ({ ...t, sec: 'shared' })),
  ];
}

export function renderToolsHub() {
  return `
  <div>
    <div class="section-landing-head">
      <h1>الأدوات التفاعلية</h1>
      <div class="sl-en">Interactive Tools</div>
      <p>أدوات مرجعية عملية تعتمد على بيانات موثوقة، وكل أداة توضح وظيفتها وحدود دقتها وبياناتها بصراحة. التمارين والمراجعة اختيارية إثرائية، والموسوعة كاملة الفائدة بدونها.</p>
    </div>
    <div class="category-grid">
      ${allTools().map((t) => t.isLink
        ? `<a class="category-card" href="#/me"><div class="cc-title">${esc(t.titleAr)}</div><div class="cc-en">${esc(t.titleEn)}</div><div class="cc-count">مجلتي</div></a>`
        : `<a class="category-card" href="#/tools/${t.id}"><div class="cc-title">${esc(t.titleAr)}</div><div class="cc-en">${esc(t.titleEn)}</div><div class="cc-count">${t.sec === 'fundamentals' ? 'Fundamentals' : t.sec === 'grammar' ? 'Grammar' : 'مشتركة'}</div></a>`).join('')}
    </div>
  </div>`;
}

export function renderTool(toolId, params = new URLSearchParams()) {
  const tool = allTools().find((t) => t.id === toolId);
  if (!tool) return `<div class="notfound"><div class="code">404</div><h1>الأداة غير موجودة</h1><a href="#/tools">كل الأدوات</a></div>`;
  // render() returns HTML string; mount() wires interactivity after insertion
  queueMicrotask(() => tool.mount?.(document.getElementById('main'), params));
  return tool.render(params);
}
