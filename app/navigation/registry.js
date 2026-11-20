// Central registry of sections. Sections are fully independent:
// each imports only its own data files. Shared UI imports both.
import * as fundamentals from '../../sections/fundamentals/index.js';
import * as grammar from '../../sections/grammar/index.js';
import { topicAliases } from '../../sections/fundamentals/legacy.js';

export const SECTIONS = { fundamentals, grammar };

export const allTopics = () => [
  ...fundamentals.topics.map((t) => ({ ...t, sectionId: 'fundamentals' })),
  ...grammar.topics.map((t) => ({ ...t, sectionId: 'grammar' })),
];

export function resolveTopic(sectionId, id) {
  const alias = sectionId === 'fundamentals' ? topicAliases.get(id) : null;
  const topic = SECTIONS[sectionId]?.topics.find((t) => t.id === (alias?.id || id));
  return topic ? { topic, anchor: alias?.anchor || '' } : null;
}

export const topicHref = (sectionId, id, anchor = '') =>
  `#/${sectionId}/t/${id}${anchor ? `#${anchor}` : ''}`;

export const findTopic = (sectionId, id) => resolveTopic(sectionId, id)?.topic || null;

export const findTopicAnywhere = (id) => {
  for (const [sid, sec] of Object.entries(SECTIONS)) {
    const t = sec.topics.find((x) => x.id === id);
    if (t) return { ...t, sectionId: sid };
  }
  const legacy = resolveTopic('fundamentals', id);
  if (legacy) return { ...legacy.topic, sectionId: 'fundamentals' };
  return null;
};
