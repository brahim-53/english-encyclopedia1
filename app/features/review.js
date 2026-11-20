// Spaced repetition — an optional, enriching review scheduler.
// Rebuilt from the source project's SRS concept with these rules:
//   - "Reviewed" (marking a topic as reviewed from its page) advances the
//     schedule; one attempt never means final mastery — there is no
//     "mastered" state, only the next review date.
//   - Intervals are user-adjustable; the whole feature can be disabled.
//   - The queue stores only references (section/id keys), never content.
import { read, write } from './store.js';
import { allTopics } from '../navigation/registry.js';
import { setReviewed } from './progress.js';

const DAY = 86400000;

export function defaultIntervals() {
  return [1, 3, 7, 14, 30]; // days after each review
}

export function reviewSettings() {
  const prefs = read('prefs');
  return {
    enabled: prefs.reviewEnabled !== false,
    intervals: Array.isArray(prefs.intervals) && prefs.intervals.length ? prefs.intervals : defaultIntervals(),
  };
}

export function setReviewEnabled(on) {
  write('prefs', { ...read('prefs'), reviewEnabled: !!on });
}

export function setIntervals(intervals) {
  const clean = (intervals || []).filter((n) => Number.isFinite(n) && n > 0).map((n) => Math.round(n));
  write('prefs', { ...read('prefs'), intervals: clean.length ? clean : defaultIntervals() });
  return read('prefs').intervals;
}

const qkey = (sectionId, id) => `${sectionId}/${id}`;

export function inQueue(sectionId, id) {
  return !!read('reviewQueue').items?.[qkey(sectionId, id)];
}

export function addToQueue(sectionId, id) {
  const q = { ...read('reviewQueue') };
  const items = { ...q.items };
  const key = qkey(sectionId, id);
  if (!items[key]) {
    // first review is scheduled after the FIRST interval (default: tomorrow),
    // so a just-added topic is not instantly "due today".
    const { intervals } = reviewSettings();
    const first = intervals[0] > 0 ? intervals[0] : 1;
    items[key] = { next: Date.now() + first * DAY, stage: 0, added: Date.now() };
    q.items = items;
    write('reviewQueue', q);
  }
}

export function removeFromQueue(sectionId, id) {
  const q = { ...read('reviewQueue') };
  const items = { ...q.items };
  delete items[qkey(sectionId, id)];
  q.items = items;
  write('reviewQueue', q);
}

export function toggleQueue(sectionId, id) {
  if (inQueue(sectionId, id)) { removeFromQueue(sectionId, id); return false; }
  addToQueue(sectionId, id);
  return true;
}

// Marking a topic as reviewed advances its review schedule (if queued) and
// records it in progress. Returns the next review timestamp or null.
export function reviewNow(sectionId, id) {
  setReviewed(sectionId, id, true);
  const q = read('reviewQueue');
  const key = qkey(sectionId, id);
  if (!q.items?.[key]) return null;
  const { intervals } = reviewSettings();
  const item = q.items[key];
  const stage = Math.min((item.stage || 0) + 1, intervals.length - 1);
  const next = Date.now() + intervals[stage] * DAY;
  const items = { ...q.items, [key]: { ...item, stage, next } };
  const done = { ...(q.done || {}), [key]: Date.now() };
  write('reviewQueue', { items, done });
  return next;
}

export function dueList(now = Date.now()) {
  const { enabled } = reviewSettings();
  if (!enabled) return [];
  const byKey = new Map(allTopics().map((t) => [`${t.sectionId}/${t.id}`, t]));
  const q = read('reviewQueue');
  return Object.entries(q.items || {})
    .filter(([, item]) => item.next <= now)
    .map(([key, item]) => ({ topic: byKey.get(key), key, item }))
    .filter((x) => x.topic)
    .sort((a, b) => a.item.next - b.item.next);
}

export function scheduledList() {
  const byKey = new Map(allTopics().map((t) => [`${t.sectionId}/${t.id}`, t]));
  const q = read('reviewQueue');
  return Object.entries(q.items || {})
    .map(([key, item]) => ({ topic: byKey.get(key), key, item }))
    .filter((x) => x.topic)
    .sort((a, b) => a.item.next - b.item.next);
}

export function queueCount() {
  return Object.keys(read('reviewQueue').items || {}).length;
}

export function clearQueue() {
  write('reviewQueue', { items: {}, done: {} });
}
