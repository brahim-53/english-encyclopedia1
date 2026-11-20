// Grammar section registry — independent of Fundamentals.
import { foundations } from './data/foundations.js';
import { pos } from './data/parts-of-speech.js';
import { tenses } from './data/tenses.js';
import { verbs } from './data/verb-system.js';
import { sentences } from './data/sentences.js';
import { questions } from './data/questions.js';
import { determiners } from './data/determiners.js';
import { prepositions } from './data/prepositions.js';
import { advanced } from './data/advanced.js';
import { wordformation } from './data/word-formation.js';
import { punctuation } from './data/punctuation.js';

import { grammarCompareTool } from './tools/grammar-compare.js';
import { tenseCompareTool } from './tools/tense-compare.js';

export const id = 'grammar';
export const titleAr = 'القواعد الشاملة';
export const titleEn = 'Grammar — Complete English Grammar Reference';
export const descAr = 'مرجع قواعد اللغة الإنجليزية من الأساسيات إلى المتقدم: أقسام الكلام، الأزمنة الاثنا عشر، نظام الأفعال، بناء الجمل، الأسئلة والنفي، الأدوات والتعريف، حروف الجر والروابط، والقواعد المتقدمة (المبني للمجهول، الشرطية، الجمل الوصفية، الكلام المنقول، البنية التوكيدية، والصرف).';

export const categories = [
  { id: 'foundations', titleAr: 'الأساسيات', titleEn: 'Foundations', topics: foundations },
  { id: 'pos', titleAr: 'أقسام الكلام', titleEn: 'Parts of Speech', topics: pos },
  { id: 'tenses', titleAr: 'الأزمنة', titleEn: 'Tenses (12)', topics: tenses },
  { id: 'verbs', titleAr: 'نظام الأفعال', titleEn: 'Verb System', topics: verbs },
  { id: 'sentences', titleAr: 'بناء الجمل', titleEn: 'Sentence Structure', topics: sentences },
  { id: 'questions', titleAr: 'الأسئلة والنفي', titleEn: 'Questions & Negation', topics: questions },
  { id: 'determiners', titleAr: 'الأدوات وأدوات التعريف', titleEn: 'Articles & Determiners', topics: determiners },
  { id: 'prepositions', titleAr: 'حروف الجر والروابط', titleEn: 'Prepositions & Conjunctions', topics: prepositions },
  { id: 'advanced', titleAr: 'القواعد المتقدمة', titleEn: 'Advanced Grammar', topics: advanced },
  { id: 'wordformation', titleAr: 'تكوين الكلمات', titleEn: 'Word Formation', topics: wordformation },
  { id: 'punctuation', titleAr: 'علامات الترقيم والكتابة', titleEn: 'Punctuation & Capitalization', topics: punctuation },
];

export const topics = [
  ...foundations, ...pos, ...tenses, ...verbs, ...sentences,
  ...questions, ...determiners, ...prepositions, ...advanced,
  ...wordformation, ...punctuation,
];

export const tools = [grammarCompareTool, tenseCompareTool];
