// Personal progress — "reviewed" marks only, computed percentages, reset.
// Design decisions (from the integration spec):
//   - Opening a topic is NOT mastery; progress is only what the user marks.
//   - Progress never gates access to any topic.
//   - Percentages are computed from the live topic registry (always current).
import { read, write } from './store.js';
import { SECTIONS } from '../navigation/registry.js';

const tkey = (sectionId, id) => `${sectionId}/${id}`;

export function isReviewed(sectionId, id) {
  return !!read('progress').reviewed?.[tkey(sectionId, id)];
}

export function setReviewed(sectionId, id, on) {
  const p = { ...read('progress') };
  const reviewed = { ...(p.reviewed || {}) };
  const key = tkey(sectionId, id);
  if (on) reviewed[key] = Date.now();
  else delete reviewed[key];
  p.reviewed = reviewed;
  write('progress', p);
}

export function toggleReviewed(sectionId, id) {
  const next = !isReviewed(sectionId, id);
  setReviewed(sectionId, id, next);
  return next;
}

export function reviewedCount() {
  return progressStats().done;
}

// Percentages per section and per category. A topic is counted for its section
// and for its category; topics not in any category are excluded (none today).
export function progressStats() {
  const reviewed = read('progress').reviewed || {};
  const stats = { total: 0, done: 0, sections: {} };
  for (const [sid, sec] of Object.entries(SECTIONS)) {
    const s = { total: sec.topics.length, done: 0, categories: {} };
    for (const cat of sec.categories) {
      const c = { total: cat.topics.length, done: 0 };
      for (const t of cat.topics) {
        if (reviewed[tkey(sid, t.id)]) { c.done++; s.done++; }
      }
      c.pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
      s.categories[cat.id] = c;
    }
    s.pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
    stats.sections[sid] = s;
    stats.total += s.total;
    stats.done += s.done;
  }
  stats.pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  return stats;
}

export function resetProgress() {
  write('progress', { reviewed: {} });
}

export function reviewedTopicsOf(sectionId) {
  const reviewed = read('progress').reviewed || {};
  return (SECTIONS[sectionId]?.topics || []).filter((t) => reviewed[tkey(sectionId, t.id)]);
}
