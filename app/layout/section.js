// Section landing page with sidebar navigation
import { esc } from '../shared/util.js';
import { topicCount } from '../shared/util.js';

export function renderSectionPage(section, activeCat) {
  const accent = section.id === 'fundamentals' ? 'fund' : 'gram';
  const cats = activeCat ? section.categories.filter((c) => c.id === activeCat) : section.categories;
  if (activeCat && !cats.length) activeCat = null; // unknown ?cat= → show all categories

  const sidebar = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-search">
      <input type="search" id="section-search-input" placeholder="بحث داخل ${esc(section.titleEn)}…" aria-label="بحث داخل القسم" />
      <div class="sidebar-search-results" id="section-search-results"></div>
    </div>
    <button class="sidebar-toggle" data-toggle-sb aria-expanded="false">
      <span>تصفح ${esc(section.titleAr)}</span><span aria-hidden="true">▾</span>
    </button>
    <div class="sidebar-groups">
      ${section.categories.map((c) => `
        <div class="sidebar-group">
          <div class="sidebar-heading">${esc(c.titleAr)} — <span class="ui-en">${esc(c.titleEn)}</span></div>
          ${c.topics.map((t) => `
            <a class="sidebar-link" href="#/${section.id}/t/${t.id}">${esc(t.titleAr)} <span class="count">${esc(t.titleEn)}</span></a>`).join('')}
        </div>`).join('')}
    </div>
    <div class="sidebar-tools">
      <div class="sidebar-heading">أدوات القسم</div>
      ${section.tools.map((t) => `<a class="sidebar-link" href="#/tools/${t.id}">${esc(t.titleAr)} <span class="count">${esc(t.titleEn)}</span></a>`).join('')}
    </div>
  </aside>`;

  const main = `
    <div class="main-content section-${accent}">
      <div class="section-landing-head">
        <h1>${esc(section.titleAr)}</h1>
        <div class="sl-en">${esc(section.titleEn)}</div>
        <p>${esc(section.descAr)}</p>
      </div>
      ${activeCat ? `
        <div class="topic-count-label">التصنيف: ${esc(cats[0].titleAr)} — ${topicCount(cats[0].topics.length)} · <a href="#/${section.id}" style="text-decoration:underline">كل التصنيفات</a></div>
        <div class="category-grid">${cats[0].topics.map((t) => topicCard(section, t)).join('')}</div>
      ` : section.categories.map((c) => `
        <h3 style="font-family:var(--font-ar-display);font-size:var(--text-lg);margin:var(--space-10) 0 var(--space-4)">${esc(c.titleAr)} — <span class="ui-en" style="color:var(--color-text-muted);font-size:var(--text-sm)">${esc(c.titleEn)}</span></h3>
        <div class="category-grid">${c.topics.map((t) => topicCard(section, t)).join('')}</div>`).join('')}
    </div>`;

  return `<div class="section-layout">${sidebar}${main}</div>`;
}

export function mountSectionSearch(sectionId) {
  import('../search/search.js').then(({ attachSectionSearch }) => attachSectionSearch(sectionId));
}

function topicCard(section, t) {
  return `
    <a class="category-card" href="#/${section.id}/t/${t.id}">
      <div class="cc-title">${esc(t.titleAr)}</div>
      <div class="cc-en">${esc(t.titleEn)}</div>
    </a>`;
}
