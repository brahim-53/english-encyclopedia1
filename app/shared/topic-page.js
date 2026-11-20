// Full topic page renderer (uses registry from app/navigation/registry.js)
// Enhanced: personal actions (bookmark / reviewed / review queue), internal
// table of contents, previous/next navigation inside the topic's category,
// and an optional practice link. The block engine itself is untouched —
// these are additions around the rendered content.
import { esc } from './util.js';
import { english, textBi } from '../locale/index.js';
import { renderBlocks, renderInline } from './blocks.js';
import { resolveTopic, topicHref } from '../navigation/registry.js';
import { isBookmarked, toggleBookmark } from '../features/bookmarks.js';
import { isReviewed, toggleReviewed } from '../features/progress.js';
import { inQueue, toggleQueue, reviewNow } from '../features/review.js';
import { EXERCISES } from '../features/practice-data.js';
import { toast } from '../features/ui.js';

const SECTION_NAMES = {
  fundamentals: { ar: 'Fundamentals — النطق والقراءة والتهجئة', route: 'fundamentals' },
  grammar: { ar: 'Grammar — القواعد الشاملة', route: 'grammar' },
};

export function renderTopicPage(topic, section, { anchor = '' } = {}) {
  const sec = SECTION_NAMES[section.id];
  const cat = section.categories.find((c) => c.id === topic.cat);

  const related = (topic.related || [])
    .map((r) => {
      const [secId, id] = r.includes('/') ? r.split('/') : [section.id, r];
      const resolved = resolveTopic(secId, id);
      return resolved ? { ...resolved.topic, secId, anchor: resolved.anchor } : null;
    })
    .filter(Boolean);

  // Learning paths continue across levels; reference sections retain their category order.
  const catTopics = section.isLearningPath ? section.topics : cat ? cat.topics : section.topics;
  const pos = catTopics.findIndex((t) => t.id === topic.id);
  const prev = pos > 0 ? catTopics[pos - 1] : null;
  const next = pos >= 0 && pos < catTopics.length - 1 ? catTopics[pos + 1] : null;

  // internal TOC from h blocks (ids assigned by renderBlocks)
  const renumbered = (topic.blocks || [])
    .filter((b) => b.type === 'h')
    .map((b, i) => ({ id: `sec-${i}`, text: b.ar }));

  const exCount = EXERCISES.filter((e) => e.topic === topic.id).length;
  const saved = isBookmarked(section.id, topic.id);
  const reviewed = isReviewed(section.id, topic.id);
  const queued = inQueue(section.id, topic.id);
  const isNotebook = section.isLearningPath && topic.id === 'ipa-overview';
  const actions = `
    <div class="topic-actions">
      <button class="action-button ${saved ? 'primary' : ''}" id="taBookmark" type="button">${saved ? '★ محفوظ' : '☆ احفظ'}</button>
      <button class="action-button ${reviewed ? 'primary' : ''}" id="taReviewed" type="button">${reviewed ? '✓ تمت مراجعته' : '✓ علّم كمُراجَع'}</button>
      <button class="action-button ${queued ? 'primary' : ''}" id="taQueue" type="button">${queued ? 'في قائمة المراجعة' : 'أضف للمراجعة'}</button>
      ${exCount ? `<a class="action-button" href="#/tools/practice-center?topic=${esc(topic.id)}">${textBi(`تمارين الموضوع (${exCount}) ←`, `Practice (${exCount}) →`)}</a>` : ''}
    </div>`;

  return `
  <article class="topic-page${isNotebook ? ' path-notebook-topic' : ''}">
    <div class="topic-header">
      <nav class="topic-breadcrumb" aria-label="مسار التنقل">
        <a href="#/">الرئيسية</a><span>/</span>
        <a href="#/${sec.route}">${esc(sec.ar)}</a>
        ${cat ? `<span>/</span><a href="#/${sec.route}?cat=${cat.id}">${esc(cat.titleAr)}</a>` : ''}
      </nav>
      ${section.isLearningPath ? `<div class="path-position">الدرس ${pos + 1} من ${catTopics.length}</div>` : ''}
      <h1>${esc(topic.titleAr)}</h1>
      ${english() ? '' : `<div class="topic-en"${section.isLearningPath ? ' lang="en" dir="ltr"' : ''}>${esc(topic.titleEn)}</div>`}
      <p class="topic-summary">${renderInline(topic.summaryAr)}</p>
      ${isNotebook ? '' : actions}
    </div>
    ${renumbered.length > 1 ? `
    <nav class="topic-toc" aria-label="فهرس الموضوع">
      <div class="toc-title">في هذا الموضوع</div>
      <ol class="toc-list">
        ${renumbered.map((h) => `<li><a href="#sec-anchor" data-anchor="${h.id}">${renderInline(h.text)}</a></li>`).join('')}
      </ol>
    </nav>` : ''}
    <div class="topic-body">${renderBlocks(topic.blocks, { anchor })}</div>
    ${isNotebook ? actions : ''}
    <div class="topic-pn">
      ${prev ? `<a class="pn-link" href="#/${sec.route}/t/${prev.id}"><small>السابق</small><b>${esc(prev.titleAr)}</b></a>` : '<span></span>'}
      ${next ? `<a class="pn-link next" href="#/${sec.route}/t/${next.id}"><small>التالي</small><b>${esc(next.titleAr)}</b></a>` : '<span></span>'}
    </div>
    ${related.length ? `
    <div class="related-box">
      <h4>مواضيع ذات صلة</h4>
      <div class="related-links">
        ${related.map((t) => `<a class="related-link" href="${esc(topicHref(t.secId, t.id, t.anchor))}">${esc(t.titleAr)} — <span class="en">${esc(t.titleEn)}</span></a>`).join('')}
      </div>
    </div>` : ''}
    ${topic.sources?.length ? `
    <div class="sources-box">
      <h4>المراجع والمصادر</h4>
      <ul>${topic.sources.map((s) => `<li>${esc(s.name)}${s.url ? ` — <a class="src-link" dir="ltr" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>` : ''}</li>`).join('')}</ul>
    </div>` : ''}
  </article>`;
}

// Wire the topic-page interactions. Called once after the page renders.
// Elements are looked up at event time; no references are held across renders.
export function mountTopicActions(sectionId, topicId) {
  const page = document.querySelector('.topic-page');
  if (!page) return;

  const bm = page.querySelector('#taBookmark');
  bm?.addEventListener('click', () => {
    const saved = toggleBookmark(sectionId, topicId);
    bm.classList.toggle('primary', saved);
    bm.textContent = saved ? '★ محفوظ' : '☆ احفظ';
    toast(saved ? 'أُضيف إلى المحفوظات' : 'أُزيل من المحفوظات');
  });

  const rv = page.querySelector('#taReviewed');
  rv?.addEventListener('click', () => {
    const on = toggleReviewed(sectionId, topicId);
    rv.classList.toggle('primary', on);
    rv.textContent = on ? '✓ تمت مراجعته' : '✓ علّم كمُراجَع';
    toast(on ? 'سُجّل في الموضوعات المُراجَعة' : 'أُلغي تعليم الموضوع');
  });

  const q = page.querySelector('#taQueue');
  q?.addEventListener('click', () => {
    const on = toggleQueue(sectionId, topicId);
    q.classList.toggle('primary', on);
    q.textContent = on ? 'في قائمة المراجعة' : 'أضف للمراجعة';
    toast(on ? 'أُضيف إلى قائمة المراجعة — ستظهر في «مجلتي»' : 'أُزيل من قائمة المراجعة');
  });

  // TOC anchors: scroll inside the page instead of changing the route hash.
  page.querySelectorAll('.toc-list a[data-anchor]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = page.querySelector(`h3[id="${a.dataset.anchor}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Mark a topic as reviewed right now (used by the review flow from the hub).
export { reviewNow };
