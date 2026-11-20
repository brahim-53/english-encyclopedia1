// Home page
import { esc } from '../shared/util.js';
import { SECTIONS, allTopics } from '../navigation/registry.js';
import { listRecent } from '../features/history.js';
import { listBookmarks } from '../features/bookmarks.js';
import { dueList, reviewSettings } from '../features/review.js';
import { textBi } from '../locale/index.js';

// Most recently authored topics (append new topics at the end of their data
// files and list their ids here to feature them).
const RECENT_IDS = [
  'ipa-overview', 'spelling-units', 'decoding', 'stress-word-families', 'context-pronunciation',
];
const RECENT = allTopics().filter((t) => RECENT_IDS.includes(t.id));

export function renderHome() {
  const f = SECTIONS.fundamentals, g = SECTIONS.grammar;
  const catCard = (secId, cat) => `
    <a class="category-card" href="#/${secId}?cat=${cat.id}">
      <div class="cc-title">${esc(cat.titleAr)}</div>
      <div class="cc-en">${esc(cat.titleEn)}</div>
      <div class="cc-count">${cat.topics.length} موضوعًا</div>
    </a>`;

  // personal strip: continue reading / bookmarks / due reviews (only if used)
  const recent = listRecent(6);
  const bookmarks = listBookmarks().slice(0, 6);
  const settings = reviewSettings();
  const due = settings.enabled ? dueList() : [];
  const chip = (t) => `<a class="recent-chip" href="#/${t.sectionId}/t/${t.id}">${esc(t.titleAr)} — <span class="ui-en">${esc(t.titleEn)}</span></a>`;

  return `
  <div class="hero">
    <h1>موسوعة تفاعلية شاملة للغة الإنجليزية</h1>
    <p class="hero-sub">ابدأ بمسار النطق والقراءة، أو ابحث مباشرةً عن صوت أو نمط تهجئة أو موضوع نحوي في الموسوعة.</p>
    <div class="hero-search">
      <input type="search" id="home-search" placeholder="${textBi('ابحث عن صوت أو كلمة أو درس', 'Find a sound, word, or lesson')}" aria-label="بحث في الموسوعة" />
    </div>
    <div class="hero-hints">
      ${['Present Perfect', 'النبر والمقاطع', 'Silent E', 'Phrasal Verbs', 'TH sounds', 'أدوات التعريف', '/ʃ/', '-tion', 'education'].map((h) =>
        `<button type="button" class="hint-chip" dir="${/^[/-]/.test(h) ? 'ltr' : 'auto'}" data-q="${esc(h)}">${esc(h)}</button>`).join('')}
    </div>
  </div>

  ${recent.length || bookmarks.length || due.length ? `
  <div class="personal-strip">
    ${recent.length ? `<div class="ps-block"><div class="ps-title">متابعة القراءة <a class="ps-more" href="#/me">مجلتي ←</a></div><div class="recent-list">${recent.map(chip).join('')}</div></div>` : ''}
    ${due.length ? `<div class="ps-block"><div class="ps-title">مراجعات مستحقة <span class="ps-badge">${due.length}</span></div><div class="recent-list">${due.slice(0, 4).map(({ topic }) => chip(topic)).join('')}</div></div>` : ''}
    ${bookmarks.length ? `<div class="ps-block"><div class="ps-title">محفوظاتك <a class="ps-more" href="#/me">الكل ←</a></div><div class="recent-list">${bookmarks.map(chip).join('')}</div></div>` : ''}
  </div>` : ''}

  <div class="section-cards">
    <a class="section-card fund" href="#/fundamentals">
      <div class="sc-en">Fundamentals</div>
      <h2>النطق والقراءة والتهجئة</h2>
      <p>ابدأ بدفتر أصوات الإنجليزية الأمريكية، ثم تدرّج من أنماط التهجئة إلى قراءة الكلمات الطويلة وفهم نهاياتها.</p>
      <div class="sc-meta"><span>${f.categories.length} محاور</span><span>${f.topics.length} درسًا</span></div>
    </a>
    <a class="section-card gram" href="#/grammar">
      <div class="sc-en">Grammar</div>
      <h2>القواعد الشاملة</h2>
      <p>مرجع قواعد اللغة الإنجليزية من الأساسيات إلى المتقدم: أقسام الكلام، الأزمنة الاثنا عشر، نظام الأفعال، بناء الجمل، الأسئلة والنفي، الأدوات، حروف الجر، والقواعد المتقدمة.</p>
      <div class="sc-meta"><span>${g.categories.length} تصنيفات</span><span>${g.topics.length} موضوعًا</span><span>${g.tools.length} أدوات</span></div>
    </a>
  </div>

  <h2 class="home-grid-title">محاور النطق والقراءة والتهجئة</h2>
  <div class="category-grid">${f.categories.map((c) => catCard('fundamentals', c)).join('')}</div>

  <h2 class="home-grid-title">تصنيفات القواعد — Grammar</h2>
  <div class="category-grid">${g.categories.map((c) => catCard('grammar', c)).join('')}</div>

  <h2 class="home-grid-title">الأدوات التفاعلية</h2>
  <div class="category-grid">
    ${[...f.tools.map((t) => ({ ...t, sec: 'fundamentals' })), ...g.tools.map((t) => ({ ...t, sec: 'grammar' }))].map((t) => `
      <a class="category-card" href="#/tools/${t.id}">
        <div class="cc-title">${esc(t.titleAr)}</div>
        <div class="cc-en">${esc(t.titleEn)}</div>
      </a>`).join('')}
    <a class="category-card" href="#/tools/practice-center"><div class="cc-title">مركز التمارين</div><div class="cc-en">Practice Center</div></a>
    <a class="category-card" href="#/tools/read-decode"><div class="cc-title">اقرأ وفك</div><div class="cc-en">Read &amp; Decode</div></a>
    <a class="category-card" href="#/me"><div class="cc-title">مجلتي — المحفوظات والتقدم والمراجعة</div><div class="cc-en">My Shelf</div></a>
  </div>

  <h2 class="home-grid-title">أحدث الإضافات</h2>
  <div class="recent-list">
    ${RECENT.map((t) => `
      <a class="recent-chip" href="#/${t.sectionId}/t/${t.id}">${esc(t.titleAr)} — <span class="ui-en">${esc(t.titleEn)}</span></a>`).join('')}
  </div>`;
}
