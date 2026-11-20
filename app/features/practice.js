// Practice Center — optional exercises tied to real encyclopedia topics.
// Ported from the source project's exercise engine and rebuilt for this
// platform: 4 types (choice / classify / type / match), immediate correction
// with the reason, results stored locally. Practice never gates any content.
import { esc } from '../shared/util.js';
import { EXERCISES } from './practice-data.js';
import { findTopicAnywhere } from '../navigation/registry.js';
import { read, write } from './store.js';
import { audioControls } from './audio.js';
import { textBi } from '../locale/index.js';

const sectionOf = (id) => {
  const t = findTopicAnywhere(id);
  return t ? t.sectionId : 'fundamentals';
};

function topicLabel(id) {
  const t = findTopicAnywhere(id);
  return t ? { ar: t.titleAr, en: t.titleEn } : { ar: id, en: '' };
}

function recordResult(topicId, correct, total) {
  const all = read('exerciseResults');
  const prev = all[topicId] || { correct: 0, total: 0, last: 0 };
  all[topicId] = {
    correct: prev.correct + correct,
    total: prev.total + total,
    last: Date.now(),
  };
  write('exerciseResults', all);
}

export const practiceTool = {
  id: 'practice-center',
  titleAr: 'مركز التمارين',
  titleEn: 'Practice Center',
  render() {
    return `
    <div class="tool-panel" id="tool-practice">
      <h2>مركز التمارين — Practice Center</h2>
      <p class="tool-desc">تمارين اختيارية مصححة فورًا مع شرح سبب الإجابة الصحيحة، مرتبطة بمواضيع فعلية داخل الموسوعة. النتيجة تُسجل محليًا على جهازك، والموسوعة كاملة الفائدة بدونها — التمارين إثرائية لا شرط للاستفادة من المحتوى.</p>
      <div id="practice-hub-body"></div>
      <div class="tool-limits">
        <b>حدود الأداة:</b>
        <ul>
          <li>التمارين مرتبطة بمواضيع موجودة، وكل نتيجة تُحفظ محليًا فقط (لا حساب ولا خادم).</li>
          <li>لا يوجد «إتقان نهائي»: نتيجة جيدة اليوم تُقيد بمزيد من المراجعة لا بشارة إتقان دائمة.</li>
          <li>لمعرفة كيفية إضافة تمارين: راجع documentation/HOW-TO-ADD-TOPICS.md.</li>
        </ul>
      </div>
    </div>`;
  },
  mount(rootEl, params) {
    const panel = rootEl?.querySelector('#tool-practice');
    if (!panel) return;
    const body = panel.querySelector('#practice-hub-body');
    let state = null;

    const renderHub = () => {
      const topics = [...new Set(EXERCISES.map((e) => e.topic))];
      const results = read('exerciseResults');
      const groups = { fundamentals: [], grammar: [] };
      for (const t of topics) groups[sectionOf(t)].push(t);
      const topicCard = (id) => {
        const n = EXERCISES.filter((e) => e.topic === id).length;
        const label = topicLabel(id);
        const r = results[id];
        return `<button class="practice-card" type="button" data-practice-topic="${esc(id)}">
          <div><b>${esc(label.ar)}</b><small>${esc(label.en)} · ${n} تمرينًا${r ? ` · آخر نتيجة ${r.correct}/${r.total}` : ''}</small></div>
          <span class="st-label">ابدأ ←</span>
        </button>`;
      };
      body.innerHTML = `
        ${groups.fundamentals.length ? `<h3 class="practice-group">النطق والقراءة والتهجئة</h3><div class="practice-grid">${groups.fundamentals.map(topicCard).join('')}</div>` : ''}
        ${groups.grammar.length ? `<h3 class="practice-group">القواعد — Grammar</h3><div class="practice-grid">${groups.grammar.map(topicCard).join('')}</div>` : ''}`;
      body.querySelectorAll('[data-practice-topic]').forEach((b) => {
        b.addEventListener('click', () => startPractice(b.dataset.practiceTopic));
      });
    };

    const startPractice = (topicId) => {
      state = { topicId, exs: EXERCISES.filter((e) => e.topic === topicId), idx: 0, answers: [], answered: false };
      paint();
    };

    const paint = () => {
      const { topicId, exs, idx } = state;
      const e = exs[idx];
      const label = topicLabel(topicId);
      const optionHtml = (o, i) => `<div class="practice-playable"><button class="quiz-option" type="button" data-answer="${i}">${esc(o)}</button>${audioControls(o, '', { teaching: true })}</div>`;
      let exerciseBody = '';
      if (e.t === 'mcq') {
        exerciseBody = `<div class="quiz-options">${e.opts.map(optionHtml).join('')}</div>`;
      } else if (e.t === 'fill') {
        exerciseBody = `<div class="search-line"><input class="field" id="fillInput" type="text" dir="ltr" autocomplete="off" placeholder="اكتب الإجابة بالإنجليزية"><button class="action-button" id="fillCheck" type="button">تحقق</button></div>`;
      } else if (e.t === 'sort') {
        exerciseBody = `<p>${textBi('اختر كلمة ثم اختر المجموعة التي تنتمي إليها.', 'Select a word, then choose its group.')}</p><div class="sort-layout">${e.buckets.map((b) => `<div class="sort-bucket" data-bucket="${esc(b.id)}"><button type="button" class="action-button" data-classify="${esc(b.id)}">${esc(b.label)}</button><div class="sort-items"></div></div>`).join('')}</div><div class="sort-pool" id="sortPool">${e.items.map((it, i) => `<span class="practice-playable"><button class="sort-item" type="button" data-i="${i}" aria-pressed="false"><bdi class="en">${esc(it.txt)}</bdi></button>${audioControls(it.txt)}</span>`).join('')}</div>`;
      } else if (e.t === 'pair') {
        const rights = e.pairs.map((p, i) => ({ txt: p[1], i })).sort(() => Math.random() - 0.5);
        exerciseBody = `<p>${textBi('اختر عنصرًا من القائمة الأولى ثم اختر نظيره.', 'Select an item in the first list, then choose its match.')}</p><div class="pair-grid"><div class="pair-col">${e.pairs.map((p, i) => `<div class="pair-row"><div class="pair-item"><button class="pair-option" type="button" data-match="${i}" aria-pressed="false"><bdi class="en">${esc(p[0])}</bdi></button>${audioControls(p[0], '', { teaching: true })}</div><div class="pair-slot" data-slot="${i}">${textBi('؟', '?')}</div></div>`).join('')}</div><div class="pair-col">${rights.map((r) => `<button class="pair-option" type="button" data-pair="${r.i}">${esc(r.txt)}</button>`).join('')}</div></div>`;
      }
      body.innerHTML = `
        <div class="practice-head">
          <span class="pill">${esc(label.ar)}</span><span>التمرين ${idx + 1} من ${exs.length}</span>
        </div>
        <div class="practice-card big">
          <h3 id="practiceQ">${esc(e.q)}</h3>
          <div id="practiceBody">${exerciseBody}</div>
          <div class="quiz-feedback" id="practiceFeedback"></div>
          <div class="action-row">
            <button class="action-button" id="practiceBack" type="button">↩ عودة للمركز</button>
            <span class="muted" id="practiceScore"></span>
            <button class="action-button primary" id="practiceNext" type="button" disabled>التالي ←</button>
          </div>
        </div>`;
      const done = (ok) => {
        state.answered = true;
        state.answers.push(ok);
        body.querySelector('#practiceNext').disabled = false;
        body.querySelector('#practiceScore').textContent = `النتيجة حتى الآن: ${state.answers.filter(Boolean).length}/${state.answers.length}`;
      };
      body.querySelector('#practiceBack').addEventListener('click', renderHub);
      body.querySelector('#practiceNext').addEventListener('click', () => {
        state.idx++;
        state.answered = false;
        if (state.idx >= state.exs.length) finish();
        else paint();
      });
      const feedback = (ok, text) => {
        done(ok);
        body.querySelector('#practiceFeedback').innerHTML =
          (ok ? '<b>إجابة صحيحة.</b> ' : '<b>ليست الإجابة الصحيحة.</b> ') + text;
      };
      if (e.t === 'mcq') {
        body.querySelectorAll('#practiceBody .quiz-option').forEach((b) => {
          b.addEventListener('click', () => {
            if (state.answered) return;
            const pick = Number(b.dataset.answer);
            body.querySelectorAll('#practiceBody .quiz-option').forEach((x, i) => {
              x.disabled = true;
              if (i === e.a) x.classList.add('correct');
              if (i === pick && pick !== e.a) x.classList.add('incorrect');
            });
            feedback(pick === e.a, `الصواب: <b>${esc(e.opts[e.a])}</b>. ${esc(e.why)}`);
          });
        });
      } else if (e.t === 'fill') {
        const check = () => {
          if (state.answered) return;
          const v = (body.querySelector('#fillInput').value || '').trim().toLowerCase();
          const ok = e.accept.some((x) => x.toLowerCase() === v);
          feedback(ok, `الصواب: <b>${esc(e.show || e.accept[0])}</b>. ${esc(e.why)}`);
        };
        body.querySelector('#fillCheck').addEventListener('click', check);
        body.querySelector('#fillInput').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') check(); });
      } else if (e.t === 'sort') {
        let placed = 0, selected = null, allCorrect = true;
        const hint = body.querySelector('#practiceFeedback');
        body.querySelectorAll('#sortPool .sort-item').forEach((button) => button.addEventListener('click', () => {
          selected?.setAttribute('aria-pressed', 'false');
          selected = button;
          selected.setAttribute('aria-pressed', 'true');
        }));
        body.querySelectorAll('[data-classify]').forEach((button) => button.addEventListener('click', () => {
          if (!selected || state.answered) return;
          const item = e.items[Number(selected.dataset.i)];
          if (button.dataset.classify !== item.b) {
            allCorrect = false;
            hint.textContent = textBi('هذه ليست مجموعة الكلمة. جرّب الأخرى.', 'That is not the word’s group. Try another.');
            return;
          }
          button.nextElementSibling.insertAdjacentHTML('beforeend', `<span class="sort-placed"><bdi class="en">${esc(item.txt)}</bdi></span>`);
          selected.classList.add('used');
          selected.disabled = true;
          selected.setAttribute('aria-pressed', 'false');
          selected = null;
          hint.textContent = '';
          if (++placed === e.items.length) {
            done(allCorrect);
            hint.innerHTML = '<b>أكملت التصنيف.</b> ' + esc(e.why);
          }
        }));
      } else if (e.t === 'pair') {
        let selected = null, matched = 0, allCorrect = true;
        const hint = body.querySelector('#practiceFeedback');
        body.querySelectorAll('[data-match]').forEach((button) => button.addEventListener('click', () => {
          selected?.setAttribute('aria-pressed', 'false');
          selected = button;
          selected.setAttribute('aria-pressed', 'true');
        }));
        body.querySelectorAll('[data-pair]').forEach((b) => {
          b.addEventListener('click', () => {
            if (!selected || state.answered || b.disabled) return;
            if (selected.dataset.match !== b.dataset.pair) {
              allCorrect = false;
              hint.textContent = textBi('ليست مطابقة. جرّب عنصرًا آخر.', 'Those do not match. Try another item.');
              return;
            }
            const slot = body.querySelector(`#practiceBody .pair-slot[data-slot="${b.dataset.pair}"]`);
            if (!slot || slot.classList.contains('filled')) return;
            slot.textContent = b.textContent;
            slot.classList.add('filled');
            selected.setAttribute('aria-pressed', 'false');
            selected.classList.add('used');
            selected.disabled = true;
            b.classList.add('used');
            b.disabled = true;
            selected = null;
            hint.textContent = '';
            if (++matched === e.pairs.length) {
              done(allCorrect);
              hint.innerHTML = '<b>أكملت المطابقة.</b> ' + esc(e.why);
            }
          });
        });
      }
    };

    const finish = () => {
      const { topicId, answers } = state;
      const correct = answers.filter(Boolean).length;
      const pct = Math.round((correct / answers.length) * 100);
      recordResult(topicId, correct, answers.length);
      const label = topicLabel(topicId);
      const t = findTopicAnywhere(topicId);
      body.innerHTML = `
        <div class="practice-head"><span class="pill">${esc(label.ar)}</span><span>النتيجة</span></div>
        <div class="practice-card big result">
          <div class="score-ring"><b>${pct}%</b><span>${correct} صحيحة من ${answers.length}</span></div>
          <p>${pct >= 80 ? 'أداء قوي — أعد المراجعة بعد أيام لتثبيت المعلومة (لا إتقانًا نهائيًا من محاولة واحدة).' : pct >= 60 ? 'أداء مقبول — راجع شرح الموضوع ثم أعد التمارين.' : 'يحتاج الموضوع إلى إعادة قراءة الشرح ثم إعادة التمارين.'}</p>
          <div class="action-row">
            <a class="action-button" href="#/${t ? t.sectionId : ''}/t/${esc(topicId)}">↩ إعادة قراءة الشرح</a>
            <button class="action-button primary" id="practiceRetry" type="button">إعادة التمارين</button>
            <button class="action-button" id="practiceHub" type="button">مركز التمارين</button>
          </div>
        </div>`;
      body.querySelector('#practiceRetry').addEventListener('click', () => startPractice(topicId));
      body.querySelector('#practiceHub').addEventListener('click', renderHub);
    };

    renderHub();
    // deep link: #/tools/practice-center?topic=<id> opens that topic's exercises
    const topicParam = params?.get('topic');
    const currentTopic = topicParam && findTopicAnywhere(topicParam)?.id;
    if (currentTopic && EXERCISES.some((e) => e.topic === currentTopic)) startPractice(currentTopic);
    else if (topicParam) {
      // topic exists in the encyclopedia but has no linked exercises yet — honest note, no fake content
      body.insertAdjacentHTML(
        'afterbegin',
        `<div class="callout note" style="margin:0 0 var(--space-4)"><b>لا توجد تمارين مرتبطة بهذا الموضوع حاليًا.</b> اختر من القائمة أدناه موضوعًا آخر، أو ارجع إلى صفحة الموضوع لقراءة الشرح.</div>`
      );
    }
  },
};
