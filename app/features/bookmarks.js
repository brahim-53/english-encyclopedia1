// Bookmarks — save any topic for later, remove it, list them.
// Ported from the source project's concept (enref.saved) and rebuilt on the
// versioned store: deduplicated keys, no copies of content (only references).
import { read, write } from './store.js';
import { allTopics } from '../navigation/registry.js';

const KEY = (sectionId, id) => `${sectionId}/${id}`;

export function isBookmarked(sectionId, id) {
  return read('bookmarks').includes(KEY(sectionId, id));
}

export function toggleBookmark(sectionId, id) {
  const key = KEY(sectionId, id);
  const list = read('bookmarks');
  const has = list.includes(key);
  const next = has ? list.filter((k) => k !== key) : [...list, key];
  write('bookmarks', next);
  return !has; // new state: true = saved
}

export function removeBookmark(sectionId, id) {
  write('bookmarks', read('bookmarks').filter((k) => k !== KEY(sectionId, id)));
}

// Resolved bookmarks for display; dropped ids are skipped silently.
export function listBookmarks() {
  const byKey = new Map(allTopics().map((t) => [`${t.sectionId}/${t.id}`, t]));
  return read('bookmarks').map((k) => byKey.get(k)).filter(Boolean);
}
