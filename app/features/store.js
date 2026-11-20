// Versioned local-storage layer for personal data.
// Design rules (Master Prompt v3 §6/§10 + feature-integration spec):
//   - Personal data is simple and local: bookmarks, history, progress,
//     review queue, exercise results, preferences. Never large datasets.
//   - Every read is validated; corrupted data falls back to safe defaults
//     instead of crashing the app (tolerant data structure).
//   - Keys are namespaced with a schema version so future migrations can
//     read old shapes: erp.v1.<collection>
//   - All writes go through one guarded function so storage failures
//     (private mode, quota) never break navigation.
import { allTopics, resolveTopic } from '../navigation/registry.js';

const PREFIX = 'erp.v1.';
const CACHE = new Map();

const TOPIC_KEYS = new Set(allTopics().map((t) => `${t.sectionId}/${t.id}`));

function isKey(k) {
  return typeof k === 'string' && TOPIC_KEYS.has(k);
}
function currentKey(k) {
  if (isKey(k)) return k;
  const [section, id, extra] = k.split('/');
  const resolved = !extra && resolveTopic(section, id);
  return resolved ? `${section}/${resolved.topic.id}` : null;
}
function isTs(v) {
  return typeof v === 'number' && v > 0;
}

// collection -> shape validator. Anything that fails keeps the fallback.
const SHAPES = {
  bookmarks: (v) => Array.isArray(v) && v.every((k) => typeof k === 'string'),
  recentTopics: (v) => Array.isArray(v) && v.every((k) => typeof k === 'string'),
  progress: (v) => v && typeof v === 'object' && (!v.reviewed || (v.reviewed && typeof v.reviewed === 'object' && Object.values(v.reviewed).every(isTs))),
  reviewQueue: (v) => v && typeof v === 'object'
    && (!v.items || (typeof v.items === 'object' && Object.values(v.items).every((x) => x && isTs(x.next) && Number.isInteger(x.stage))))
    && (!v.done || (typeof v.done === 'object' && Object.values(v.done).every(isTs))),
  exerciseResults: (v) => !v || (typeof v === 'object' && Object.values(v).every((x) => x && Number.isInteger(x.correct) && Number.isInteger(x.total) && isTs(x.last))),
  prefs: (v) => !v || (typeof v === 'object'
    && (v.reviewEnabled === undefined || typeof v.reviewEnabled === 'boolean')
    && (v.intervals === undefined || (Array.isArray(v.intervals) && v.intervals.length > 0 && v.intervals.every((n) => n > 0)))),
};

const FALLBACKS = {
  bookmarks: [],
  recentTopics: [],
  progress: { reviewed: {} },
  reviewQueue: { items: {}, done: {} },
  exerciseResults: {},
  prefs: { reviewEnabled: true, intervals: [1, 3, 7, 14, 30] },
};

export function read(name) {
  if (CACHE.has(name)) return CACHE.get(name);
  const fallback = structuredCloneSafe(FALLBACKS[name]);
  let value = fallback;
  try {
    const raw = localStorage.getItem(PREFIX + name);
    if (raw != null && raw !== '') {
      const parsed = JSON.parse(raw);
      const validate = SHAPES[name];
      // tolerate legacy shape {version:1, data:...}
      const candidate = parsed && typeof parsed === 'object' && parsed.data !== undefined && parsed.v === 1 ? parsed.data : parsed;
      if (validate(candidate)) value = normalizeTopicLists(name, candidate);
    }
  } catch {
    // storage unavailable or corrupted JSON — session continues with defaults
  }
  CACHE.set(name, value);
  return value;
}

export function write(name, value) {
  CACHE.set(name, value);
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value));
    return true;
  } catch {
    // quota exceeded / storage disabled: keep the value in memory for this session
    return false;
  }
}

function structuredCloneSafe(v) {
  return v === null || typeof v !== 'object' ? v : JSON.parse(JSON.stringify(v));
}

// ---- export / import (user data portability) ----
export function exportUserData() {
  const out = { app: 'English Reference Platform', schema: 1, exported: new Date().toISOString() };
  for (const name of Object.keys(FALLBACKS)) out[name] = read(name);
  return out;
}

export function importUserData(json) {
  let parsed;
  try { parsed = typeof json === 'string' ? JSON.parse(json) : json; } catch { return { ok: false, error: 'invalid-json' }; }
  if (!parsed || typeof parsed !== 'object') return { ok: false, error: 'invalid-shape' };
  let imported = 0;
  for (const name of Object.keys(FALLBACKS)) {
    const candidate = parsed[name] !== undefined ? parsed[name] : parsed.data?.[name];
    if (candidate !== undefined && SHAPES[name](candidate)) {
      const cleaned = normalizeTopicLists(name, candidate);
      write(name, cleaned);
      imported++;
    }
  }
  return { ok: true, imported };
}

function normalizeTopicLists(name, value) {
  if (name === 'bookmarks' || name === 'recentTopics') return [...new Set(value.map(currentKey).filter(Boolean))];
  if (name === 'reviewQueue') {
    const entries = Object.entries(value.items || {});
    const items = Object.fromEntries(entries.filter(([key]) => isKey(key)));
    for (const [old, item] of entries) {
      const key = currentKey(old);
      if (key && key !== old && !Object.prototype.hasOwnProperty.call(items, key)) items[key] = { ...item, stage: 0 };
    }
    return { ...value, items };
  }
  // Preserve earlier progress and exercise history in exports, without
  // awarding progress on merged lessons; the UI counts only current topics.
  return value;
}

export const COLLECTIONS = Object.keys(FALLBACKS);
