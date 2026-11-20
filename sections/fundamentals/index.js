import { spelling, patterns, wordBuilding, applied } from './data/path.js';
import { wordAnalyzerTool } from './tools/word-analyzer.js';

export const id = 'fundamentals';
export const titleAr = 'النطق والقراءة والتهجئة';
export const titleEn = 'Pronunciation, Reading & Spelling';
export const descAr = 'ابدأ بأصوات الإنجليزية الأمريكية، ثم تعلّم كيف تقرأ الكلمات من تهجئتها وتتحقّق من النطق حين لا تكفي الكتابة.';
export const isLearningPath = true;
export const NOTEBOOK_ID = 'ipa-overview';
export const NOTEBOOK_PATH = './public/notebook/index.html';

const notebook = {
  id: NOTEBOOK_ID,
  titleAr: 'دفتر أصوات الإنجليزية الأمريكية',
  titleEn: 'General American Sounds · IPA',
  summaryAr: 'ابدأ هنا: تعرّف على الأصوات، وقارن الأمثلة، واستكشف التهجئات في الدفتر قبل الانتقال إلى تطبيقات القراءة.',
  kw: ['دفتر', 'IPA', 'الأصوات', 'General American', 'أنماط الحروف', 'رموز صوتية'],
  blocks: [{ type: 'notebook', path: NOTEBOOK_PATH }],
  related: ['spelling-units'],
  // The original footer and references are in the embedded source.
  sources: [{ name: 'المراجع الأصلية محفوظة في الدفتر', url: `${NOTEBOOK_PATH}#refs` }],
};

const level = (id, titleAr, titleEn, topics) =>
  ({ id, titleAr, titleEn, topics: topics.map((t) => ({ ...t, cat: id })) });

export const categories = [
  level('start', 'ابدأ بالأصوات', 'Start with Sounds', [notebook]),
  level('spelling', 'من الحرف إلى الكلمة', 'Letters to Words', spelling),
  level('patterns', 'التركيبات وأنماط التهجئة', 'Spelling Patterns', patterns),
  level('word-building', 'بناء الكلمات والنهايات', 'Word Building', wordBuilding),
  level('applied', 'القراءة العملية والمتقدمة', 'Applied Reading', applied),
];

export const topics = categories.flatMap((c) => c.topics);
export const tools = [wordAnalyzerTool];
