// "My Shelf" page (#/me) — bookmarks, recently visited, progress, review queue,
// and user-data export/import. Purely local: no account, no server.
import { esc } from '../shared/util.js';
import { textBi } from '../locale/index.js';
import { listBookmarks } from './bookmarks.js';
import { listRecent, clearHistory } from './history.js';
import { progressStats, reviewedCount, resetProgress } from './progress.js';
import { dueList, scheduledList, reviewSettings, setReviewEnabled, setIntervals, clearQueue, defaultIntervals, toggleQueue, reviewNow, queueCount } from './review.js';
import { exportUserData, importUserData } from './store.js';
import { SECTIONS, allTopics } from '../navigation/registry.js';

const topicHref = (t) => `#/${t.sectionId}/t/${t.id}`;
const key = (t) => `${t.sectionId}/${t.id}`;

function topicChip(t, extra = '') {
  return `<a class="recent-chip" href="${topicHref(t)}">${esc(t.titleAr)} — <span class="ui-en">${esc(t.titleEn)}</span>${extra}</a>`;
}

function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString(textBi('ar', 'en-US')); } catch { return '—'; }
}

export function renderHub() {
  const stats = progressStats();
  const due = dueList();
  const scheduled = scheduledList();
  const bookmarks = listBookmarks();
  const recent = listRecent(8);
  const settings = reviewSettings();
  const secName = (sid) => SECTIONS[sid].titleAr;

  return `
  <div class="hub-page">
    <div class="section-landing-head">
      <h1>مجلتي</h1>
      <div class="sl-en">My Shelf</div>
      <p>محفوظاتك وسجل تصفحك وتقدمك وقائمة مراجعتك — كلها محفوظة محليًا على هذا الجهاز فقط، بلا حساب وبلا خادم. التقدم هنا تذكير شخصي ولا يقيد الوصول إلى أي محتوى.</p>
    </div>

    ${due.length ? `
    <section class="hub-section" id="hub-due">
      <h2>مراجعات مستحقة اليوم <span class="count">${due.length}</span></h2>
      <p class="muted">مواضيع حلّ موعد مراجعتها وفق جدول المراجعة المتباعدة الذي اخترته.</p>
      <div class="recent-list">
        ${due.map(({ topic }) => `
          <div class="hub-row">
            ${topicChip(topic)}
            <button class="action-button small" data-review-done="${esc(key(topic))}" type="button" title="علّم كمُراجَع وأجدولة المراجعة التالية">✓ راجعته الآن</button>
            <button class="action-button small" data-review-remove="${esc(key(topic))}" type="button">إزالة من المراجعة</button>
          </div>`).join('')}
      </div>
    </section>` : ''}

    <section class="hub-section">
      <h2>المراجعة المتباعدة <span class="count">${queueCount()} في القائمة</span></h2>
      <p class="muted">وظيفة إثرائية اختيارية: أضف موضوعًا لقائمة المراجعة من صفحته، وعند مراجعته يُجدول موعده التالي تلقائيًا. لا يوجد وصف «إتقان نهائي» — فقط مواعيد مراجعة قابلة للتعديل.</p>
      <div class="hub-controls">
        <label class="switch"><input type="checkbox" id="hubReviewEnabled" ${settings.enabled ? 'checked' : ''}><span>تفعيل جدولة المراجعة</span></label>
        <label class="intervals">الفواصل (أيام):
          <input type="text" id="hubIntervals" dir="ltr" value="${settings.intervals.join(textBi('، ', ', '))}" placeholder="${defaultIntervals().join(textBi('، ', ', '))}">
        </label>
        <button class="action-button small" id="hubSaveIntervals" type="button">حفظ الفواصل</button>
        <button class="action-button small" id="hubClearQueue" type="button">إفراغ قائمة المراجعة</button>
      </div>
      ${scheduled.length ? `
      <div class="table-wrap"><table dir="auto">
        <thead><tr><th>الموضوع</th><th>القسم</th><th>المراجعة القادمة</th><th>إزالة</th></tr></thead>
        <tbody>${scheduled.map(({ topic, item }) => `
          <tr>
            <td><a href="${topicHref(topic)}">${esc(topic.titleAr)}</a></td>
            <td>${esc(secName(topic.sectionId))}</td>
            <td>${item.next <= Date.now() ? '<b>مستحق الآن</b>' : fmtDate(item.next)}</td>
            <td><button class="action-button small" data-review-remove="${esc(key(topic))}" type="button">إزالة</button></td>
          </tr>`).join('')}</tbody>
      </table></div>` : '<p class="muted">القائمة فارغة. أضف موضوعًا من صفحته بزر «أضف للمراجعة».</p>'}
    </section>

    <section class="hub-section">
      <h2>المحفوظات <span class="count">${bookmarks.length}</span></h2>
      ${bookmarks.length ? `<div class="recent-list">${bookmarks.map((t) => topicChip(t)).join('')}</div>` : '<p class="muted">لم تحفظ موضوعًا بعد. افتح أي موضوع واضغط «☆ احفظ» في أعلى الصفحة.</p>'}
    </section>

    <section class="hub-section">
      <h2>آخر ما تصفحته</h2>
      ${recent.length ? `<div class="recent-list">${recent.map((t) => topicChip(t)).join('')}</div><button class="action-button small" id="hubClearHistory" type="button">مسح السجل</button>` : '<p class="muted">سجل التصفح فارغ — سيظهر هنا آخر الموضوعات التي تزورها.</p>'}
    </section>

    <section class="hub-section">
      <h2>تقدمي</h2>
      <div class="progress-summary">
        <div class="progress-total">
          <div class="progress-bar"><div class="fill" style="width:${stats.pct}%"></div></div>
          <p>${stats.done} موضوعًا مُعلَّمًا كمُراجَع من ${stats.total} — ${stats.pct}%</p>
        </div>
        ${Object.entries(stats.sections).map(([sid, s]) => `
          <div class="progress-cat">
            <div class="progress-label"><b>${esc(secName(sid))}</b><span>${s.done}/${s.total}</span></div>
            <div class="progress-bar"><div class="fill" style="width:${s.pct}%"></div></div>
          </div>`).join('')}
      </div>
      <p class="muted">علّم الموضوعات التي راجعتها من صفحتها (زر «✓ تمت مراجعته»). فتح الموضوع وحده لا يُحتسب تقدمًا، ولا يقيد التقدم وصولك إلى أي محتوى.</p>
      <button class="action-button small" id="hubResetProgress" type="button">تصفير التقدم</button>
    </section>

    <section class="hub-section">
      <h2>بياناتي</h2>
      <p class="muted">بياناتك (محفوظات، سجل، تقدم، مراجعات، نتائج تمارين) محفوظة في متصفحك فقط. يمكنك تصديرها نسخةً احتياطية أو لنقلها إلى جهاز آخر، ثم استيرادها.</p>
      <div class="action-row">
        <button class="action-button" id="hubExport" type="button">تصدير بياناتي (ملف JSON)</button>
        <label class="action-button" style="cursor:pointer">استيراد بيانات<input type="file" id="hubImport" accept="application/json,.json" style="display:none"></label>
      </div>
      <p class="muted" id="hubImportMsg"></p>
    </section>
  </div>`;
}

export function mountHub() {
  const root = document.getElementById('main');
  if (!root) return;

  const rerender = () => {
    const app = document.getElementById('app');
    const cur = document.getElementById('main');
    if (cur) {
      cur.innerHTML = renderHub();
      mountHub();
    }
  };

  // review actions (delegated; elements are looked up at event time)
  root.addEventListener('click', (e) => {
    const done = e.target.closest('[data-review-done]');
    if (done) {
      const [sid, id] = done.dataset.reviewDone.split('/');
      reviewNow(sid, id);
      rerender();
      return;
    }
    const remove = e.target.closest('[data-review-remove]');
    if (remove) {
      const [sid, id] = remove.dataset.reviewRemove.split('/');
      toggleQueue(sid, id);
      rerender();
      return;
    }
  });

  const enabled = root.querySelector('#hubReviewEnabled');
  enabled?.addEventListener('change', () => { setReviewEnabled(enabled.checked); rerender(); });

  root.querySelector('#hubSaveIntervals')?.addEventListener('click', () => {
    const raw = root.querySelector('#hubIntervals').value;
    const parsed = raw.split(/[,،\s]+/).map((x) => parseInt(x, 10)).filter((n) => Number.isFinite(n) && n > 0);
    setIntervals(parsed);
    const msg = document.createElement('p');
    msg.className = 'muted';
    msg.textContent = parsed.length ? `حُفظت الفواصل: ${parsed.join(textBi('، ', ', '))} يومًا.` : 'قيمة غير صالحة — أُعيدت الفواصل الافتراضية.';
    root.querySelector('#hubSaveIntervals').after(msg);
  });

  root.querySelector('#hubClearQueue')?.addEventListener('click', () => {
    if (confirm('سيُفرَغ جدول المراجعة (لن يُمس المحفوظات ولا التقدم). متابعة؟')) { clearQueue(); rerender(); }
  });
  root.querySelector('#hubClearHistory')?.addEventListener('click', () => { clearHistory(); rerender(); });
  root.querySelector('#hubResetProgress')?.addEventListener('click', () => {
    if (confirm('سيُصفَّر سجل الموضوعات المُراجَعة من هذا الجهاز. متابعة؟')) { resetProgress(); rerender(); }
  });

  root.querySelector('#hubExport')?.addEventListener('click', () => {
    const data = JSON.stringify(exportUserData(), null, 2);
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'english-reference-platform-data.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      const msg = root.querySelector('#hubImportMsg');
      if (msg) msg.textContent = 'تعذر التصدير في هذا المتصفح.';
    }
  });

  root.querySelector('#hubImport')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    const msg = root.querySelector('#hubImportMsg');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importUserData(String(reader.result));
      if (msg) msg.textContent = res.ok ? `تم الاستيراد: ${res.imported} مجموعة بيانات. المعرفات غير الموجودة في هذه النسخة تُهمل تلقائيًا.` : 'ملف غير صالح — تعذر الاستيراد.';
      if (res.ok) rerender();
    };
    reader.readAsText(file);
  });
}
