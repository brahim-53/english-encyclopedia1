// Hash router — renders pages from the section registries
import { SECTIONS, findTopic, resolveTopic } from './registry.js';
import { renderTopicPage, mountTopicActions } from '../shared/topic-page.js';
import { renderHome } from '../layout/home.js';
import { renderSectionPage } from '../layout/section.js';
import { renderToolsHub, renderTool } from '../layout/tools.js';
import { attachGlobalSearch } from '../search/search.js';
import { renderHub, mountHub } from '../features/hub.js';
import { recordVisit } from '../features/history.js';
import { categoryAliases } from '../../sections/fundamentals/legacy.js';
import { renderLearningPath, mountLearningPath } from '../layout/learning-path.js';
import { english, t } from '../locale/index.js';
import { stopAudio } from '../features/audio.js';

let restoreView = null;
let renderSequence = 0;

export function rerenderLanguage(locale) {
  const queries = Object.fromEntries(
    ['global-search-input', 'section-search-input', 'home-search'].map((id) => [id, document.getElementById(id)?.value || '']),
  );
  restoreView = { top: window.scrollY, queries, indexOpen: document.querySelector('.path-index')?.open, locale,
    notebookAnchor: document.querySelector('.path-notebook iframe')?.dataset.currentAnchor };
  navigate();
}

function parseHash() {
  const raw = location.hash;
  // in-page anchor after the route part: #/section/t/topic#sec-2
  let anchor = null;
  const secondHash = raw.indexOf('#', 1);
  let h = raw;
  if (secondHash > 0) {
    anchor = raw.slice(secondHash + 1);
    h = raw.slice(0, secondHash);
  }
  const route = h.replace(/^#\/?/, '');
  const [pathPart, queryPart] = route.split('?');
  const parts = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(queryPart || '');
  return { parts, params, anchor };
}

export function navigate() {
  const { parts, params, anchor } = parseHash();

  // Home
  if (parts.length === 0) {
    render(() => renderHome(), {});
    return;
  }

  // Personal hub (bookmarks / progress / review)
  if (parts[0] === 'me') {
    render(() => renderHub(), { active: 'me' }).then(() => mountHub());
    return;
  }

  // Tools
  if (parts[0] === 'tools') {
    if (parts[1] === 'ipa-explorer' || parts[1] === 'letter-explorer') {
      const section = SECTIONS.fundamentals;
      const id = parts[1] === 'ipa-explorer' ? 'ipa-overview' : 'spelling-units';
      showLearningPath(section, findTopic(section.id, id), '');
      return;
    }
    if (parts.length === 1) {
      render(() => renderToolsHub(), { active: 'tools' });
    } else {
      render(() => renderTool(parts[1], params), { active: 'tools' });
    }
    return;
  }

  // Sections
  const sectionId = parts[0];
  const section = SECTIONS[sectionId];
  if (!section) { render404(); return; }

  if (section.isLearningPath) {
    if (parts.length === 1) {
      const requested = params.get('cat');
      const cat = section.categories.find((c) => c.id === (categoryAliases.get(requested) || requested));
      showLearningPath(section, cat?.topics[0] || section.topics[0], anchor || '');
      return;
    }
    if (parts.length === 3 && parts[1] === 't') {
      const resolved = resolveTopic(sectionId, parts[2]);
      if (resolved) {
        showLearningPath(section, resolved.topic, anchor && !anchor.startsWith('sec-') ? anchor : resolved.anchor || anchor || '');
        return;
      }
    }
    render404();
    return;
  }

  if (parts.length === 1 || (parts.length === 2 && params.has('cat'))) {
    render(() => renderSectionPage(section, params.get('cat')), { active: sectionId })
      .then(() => import('../layout/section.js'))
      .then(({ mountSectionSearch }) => mountSectionSearch(sectionId));
    return;
  }

  if (parts[1] === 't' && parts[2]) {
    const topic = findTopic(sectionId, parts[2]);
    if (!topic) { render404(); return; }
    recordVisit(sectionId, topic.id);
    render(() => renderTopicPage(topic, section), { active: sectionId, topic })
      .then(() => mountTopicActions(sectionId, topic.id));
    return;
  }

  render404();
}

function showLearningPath(section, topic, anchor) {
  recordVisit(section.id, topic.id);
  const displayAnchor = restoreView?.notebookAnchor || anchor;
  render(() => renderLearningPath(section, topic, displayAnchor), { active: section.id, topic })
    .then(() => {
      mountTopicActions(section.id, topic.id);
      mountLearningPath(section.id, topic.id);
    });
}

function render(contentFn, { active, topic }) {
  const id = ++renderSequence;
  const restore = restoreView;
  restoreView = null;
  stopAudio();
  return import('../layout/shell.js').then(({ shell: build }) => {
    if (id !== renderSequence) return;
    build(contentFn(), { active });
    if (topic) document.title = `${english() ? t(topic.titleAr) : `${topic.titleAr} — ${topic.titleEn}`} | English Reference Platform`;
    else if (active === 'fundamentals') document.title = 'Fundamentals — النطق والقراءة والتهجئة';
    else if (active === 'grammar') document.title = 'Grammar — القواعد الشاملة';
    else if (active === 'tools') document.title = 'الأدوات التفاعلية';
    else if (active === 'me') document.title = 'مجلتي | English Reference Platform';
    else document.title = 'English Reference Platform — موسوعة اللغة الإنجليزية';
    attachGlobalSearch();
    if (restore && id === renderSequence) {
      requestAnimationFrame(() => {
        if (id !== renderSequence) return;
        for (const [key, value] of Object.entries(restore.queries)) {
          const input = document.getElementById(key);
          if (input && value) {
            input.value = value;
            if (key !== 'home-search') input.dispatchEvent(new Event('input'));
          }
        }
        if (restore.indexOpen !== undefined && document.querySelector('.path-index')) {
          document.querySelector('.path-index').open = restore.indexOpen;
        }
        window.scrollTo(0, restore.top);
        document.querySelector(`[data-site-language="${restore.locale}"]`)?.focus({ preventScroll: true });
      });
    } else if (topic) {
      // scroll to the in-page anchor if present, else to top
      const target = anchorOf(location.hash);
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  });
}

function anchorOf(hash) {
  const i = hash.indexOf('#', 1);
  if (i < 0) return null;
  const id = hash.slice(i + 1);
  if (!id.startsWith('sec-')) return null;
  return document.getElementById(id);
}

function render404() {
  render(() => `
    <div class="notfound">
      <div class="code">404</div>
      <h1>لم يتم العثور على الصفحة</h1>
      <p style="color:var(--color-text-muted);margin-bottom:var(--space-4)">قد يكون الرابط قديمًا أو غير صحيح.</p>
      <a href="#/">العودة إلى الصفحة الرئيسية</a>
    </div>`, {});
}
