// Shared helpers for Grammar data files (Grammar-only; no imports from Fundamentals).
export const SRC = {
  cambridge: { name: 'English Grammar Today — Cambridge Dictionary (Carter, McCarthy, Mark, O’Keeffe; Cambridge University Press, 2016) — اطّلعت المنصة على الصفحة الرئيسية بتاريخ 2026-11-11', url: 'https://dictionary.cambridge.org/grammar/british-grammar/' },
  british: { name: 'British Council LearnEnglish — Grammar (اطّلعت المنصة على الصفحة بتاريخ 2026-11-11)', url: 'https://learnenglish.britishcouncil.org/grammar' },
  owl: { name: 'Purdue OWL — Punctuation (اطّلعت المنصة على الصفحة بتاريخ 2026-11-11)', url: 'https://owl.purdue.edu/owl/general_writing/punctuation/index.html' },
  cgel: { name: 'Huddleston, R. & Pullum, G. K. (2002). The Cambridge Grammar of the English Language. Cambridge University Press. (مرجع ورقي — لم يُتحقق من نص محدد منه عبر الإنترنت)' },
  quirk: { name: 'Quirk, R., Greenbaum, S., Leech, G., Svartvik, J. (1985). A Comprehensive Grammar of the English Language. Longman. (مرجع ورقي — لم يُتحقق من نص محدد منه عبر الإنترنت)' },
  biber: { name: 'Biber, D., Johansson, S., Leech, G., Conrad, S., Finegan, E. (1999). Longman Grammar of Spoken and Written English. Longman. (مرجع ورقي — لم يُتحقق من نص محدد منه عبر الإنترنت)' },
  swan: { name: 'Swan, M. (Practical English Usage, Oxford University Press). (مرجع ورقي — لم يُتحقق من نص محدد منه عبر الإنترنت)' },
};

// Topic factory
export const G = (id, cat, titleAr, titleEn, summaryAr, kw, blocks, related = [], sources = [SRC.cambridge, SRC.cgel]) => ({
  id, cat, titleAr, titleEn, summaryAr, kw, blocks, related, sources,
});

// Block shortcuts
export const p = (ar) => ({ type: 'p', ar });
export const h = (ar) => ({ type: 'h', ar });
export const list = (...items) => ({ type: 'list', items });
export const ol = (...items) => ({ type: 'ol', items });
export const table = (head, rows) => ({ type: 'table', head, rows });
export const ex = (...items) => ({ type: 'examples', items: items.map((i) => (typeof i === 'string' ? { en: i } : i)) });
export const wr = (...pairs) => ({ type: 'wr', pairs: pairs.map(([wrong, right, why]) => ({ wrong, right, why })) });
export const tip = (ar) => ({ type: 'callout', kind: 'tip', ar });
export const warn = (ar) => ({ type: 'callout', kind: 'warn', ar });
export const note = (ar) => ({ type: 'callout', kind: 'note', ar });
export const cmp = (...cols) => ({ type: 'cmp', cols: cols.map(([title, ...items]) => ({ title, items })) });
