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

// 画像関連の定数
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_BASE64_LENGTH: 5 * 1024 * 1024 * 1.37, // Base64は約37%増加
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

// ストレージ関連の定数
export const STORAGE_CONFIG = {
  QUOTA_LIMIT: 5 * 1024 * 1024, // 5MB
  WARNING_THRESHOLD: 0.8 // 80%で警告
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