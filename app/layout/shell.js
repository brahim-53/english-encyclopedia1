// Layout shell: header with global search, footer, and page wrapper
import { esc } from '../shared/util.js';
import { english, language, languageNames, textBi } from '../locale/index.js';
import { audioPreferences } from '../features/audio.js';

export function shell(content, { active } = {}) {
  const app = document.getElementById('app');
  app.innerHTML = `
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#/" aria-label="الصفحة الرئيسية">
        <span class="brand-mark" aria-hidden="true">E</span>
        <span class="brand-text">
          <span class="en">English Reference Platform</span>
          ${english() ? '' : '<span class="ar">موسوعة اللغة الإنجليزية المرجعية</span>'}
        </span>
      </a>
      <div class="global-search">
        <span class="search-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </span>
        <input id="global-search-input" type="search" placeholder="${textBi('بحث', 'Search')}" aria-label="بحث عام في المنصة" autocomplete="off" />
        <div id="search-results" class="search-results" role="listbox" aria-label="نتائج البحث"></div>
      </div>
      <nav class="header-nav" aria-label="التنقل الرئيسي">
        <a href="#/fundamentals" class="${active === 'fundamentals' ? 'active' : ''}" aria-label="النطق والقراءة والتهجئة">النطق والقراءة</a>
        <a href="#/grammar" class="${active === 'grammar' ? 'active' : ''}">القواعد</a>
        <a href="#/tools" class="${active === 'tools' ? 'active' : ''}">الأدوات</a>
        <a href="#/me" class="${active === 'me' ? 'active' : ''}" title="المحفوظات والتقدم والمراجعة">مجلتي</a>
      </nav>
      <div class="header-preferences">
        <div class="language-switch" role="group" aria-label="${textBi('لغة الموسوعة', 'Encyclopedia language')}">
          <button type="button" lang="ar" data-site-language="ar" aria-pressed="${language() === 'ar'}">${languageNames.ar}</button>
          <button type="button" lang="en" data-site-language="en" aria-pressed="${language() === 'en'}">${languageNames.en}</button>
        </div>
        ${audioPreferences()}
      </div>
    </div>
  </header>
  <main class="page" id="main">${content}</main>
  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <strong>English Reference Platform</strong> — موسوعة تفاعلية للغة الإنجليزية: النطق والتهجئة والقواعد.
      </div>
      <div>
        مرجع النطق: General American (GA) — بيانات النطق من CMUdict (Carnegie Mellon University).
      </div>
    </div>
  </footer>`;
}
