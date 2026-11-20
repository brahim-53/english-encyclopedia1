// Recently visited topics — deduplicated, capped, stored locally.
// Ported from the source project's concept (enref.recent) and rebuilt.
import { read, write } from './store.js';
import { allTopics } from '../navigation/registry.js';

const MAX = 12;

export function recordVisit(sectionId, id) {
  const key = `${sectionId}/${id}`;
  const list = read('recentTopics').filter((k) => k !== key);
  list.unshift(key);
  write('recentTopics', list.slice(0, MAX));
}

export function listRecent(limit = 8) {
  const byKey = new Map(allTopics().map((t) => [`${t.sectionId}/${t.id}`, t]));
  return read('recentTopics').map((k) => byKey.get(k)).filter(Boolean).slice(0, limit);
}

export function clearHistory() {
  write('recentTopics', []);
}
