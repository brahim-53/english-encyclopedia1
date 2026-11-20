import { esc } from '../shared/util.js';
import { isReviewed, progressStats } from '../features/progress.js';
import { topicHref } from '../navigation/registry.js';
import { attachSectionSearch } from '../search/search.js';
import { renderTopicPage } from '../shared/topic-page.js';
import { english, textBi } from '../locale/index.js';

export function renderLearningPath(section, topic, anchor) {
  const pos = section.topics.findIndex((t) => t.id === topic.id);
  const { total, done } = progressStats().sections[section.id];
  return `
    <div class="learning-path section-fund">
      <aside class="path-rail" aria-label="مسار النطق والقراءة والتهجئة">
        <div class="path-identity">
          <a class="path-title" href="#/fundamentals">${esc(section.titleAr)}</a>
          ${english() ? '' : `<div class="ui-en" lang="en" dir="ltr">${esc(section.titleEn)}</div>`}
        </div>
        <div class="path-progress">
          <span id="path-progress-label">رُوجع <span data-path-done>${done}</span> من ${total} درسًا</span>
          <progress aria-labelledby="path-progress-label" value="${done}" max="${total}"></progress>
        </div>
        <div class="sidebar-search path-search">
          <input type="search" id="section-search-input" dir="auto" aria-label="بحث داخل القسم" placeholder="${textBi('ابحث في الدروس والأصوات', 'Search this section')}" autocomplete="off" aria-controls="section-search-results" />
          <div class="sidebar-search-results" id="section-search-results"></div>
        </div>
        <details class="path-index">
          <summary>فهرس الدروس <span>${pos + 1} من ${total}</span></summary>
          <nav aria-label="دروس المسار">
            ${section.categories.map((level, n) => `
              <div class="path-level">
                <div class="path-level-label"><span class="path-level-number">${n + 1}</span>${esc(level.titleAr)}</div>
                <ol>
                  ${level.topics.map((t) => `
                    <li><a class="path-item" href="${topicHref(section.id, t.id)}" data-path-item="${esc(t.id)}"
                      ${t.id === topic.id ? 'aria-current="step"' : ''}>
                      ${esc(t.titleAr)}
                      <span class="path-status" aria-hidden="true">${isReviewed(section.id, t.id) ? '✓' : ''}</span>
                    </a></li>`).join('')}
                </ol>
              </div>`).join('')}
          </nav>
          <div class="path-tools" aria-label="أدوات التطبيق">
            <a href="#/tools/word-analyzer">محلّل الكلمات</a>
            <a href="#/tools/read-decode">اقرأ وفك</a>
            <a href="#/tools/practice-center">مركز التمارين</a>
          </div>
        </details>
      </aside>
      <div class="path-content">${renderTopicPage(topic, section, { anchor })}</div>
    </div>`;
}

export function mountLearningPath(sectionId, topicId) {
  attachSectionSearch(sectionId);
  const index = document.querySelector('.path-index');
  if (index && window.matchMedia('(min-width: 900px)').matches) index.open = true;
  document.getElementById('taReviewed')?.addEventListener('click', () => {
    const { done } = progressStats().sections[sectionId];
    document.querySelector('.path-progress progress').value = done;
    document.querySelector('[data-path-done]').textContent = done;
    const status = [...index.querySelectorAll('[data-path-item]')]
      .find((item) => item.dataset.pathItem === topicId)?.querySelector('.path-status');
    if (status) status.textContent = isReviewed(sectionId, topicId) ? '✓' : '';
  });
}
