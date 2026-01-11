export const DEFAULT_DRAFT = {
  problemType: 'given',
  problemText: '',
  debits: [{ account: '', amount: '' }],
  credits: [{ account: '', amount: '' }],
  freeAnswer: ''
};

export const STORAGE_KEYS = {
  PROBLEMS: 'bookkeeping_problems',
  DRAFT: 'draft_input_v2',
  QUESTION_SETS: 'question_sets'
};

export const DEFAULT_QUESTION = {
  id: null,
  questionType: 'text',
  questionText: '',
  questionImage: null,
  answerType: 'text',
  answerText: '',
  answerImage: null
};

export const DEFAULT_QUESTION_SET = {
  id: null,
  name: '',
  description: '',
  questions: [],
  createdAt: null,
  updatedAt: null
};