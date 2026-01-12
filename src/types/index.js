/**
 * 型定義（JSDoc形式）
 * 将来のTypeScript移行に備えた型定義
 */

/**
 * @typedef {Object} DebitCredit
 * @property {string} account - 勘定科目
 * @property {number|string} amount - 金額
 */

/**
 * @typedef {Object} Problem
 * @property {number} id - 問題ID
 * @property {'given'|'free'} type - 問題タイプ
 * @property {string} text - 問題文
 * @property {DebitCredit[]} [debits] - 借方（複数）
 * @property {DebitCredit[]} [credits] - 貸方（複数）
 * @property {DebitCredit} [debit] - 借方（旧形式・単数）
 * @property {DebitCredit} [credit] - 貸方（旧形式・単数）
 * @property {string} [answer] - 自由記入回答
 * @property {string} createdAt - 作成日時
 * @property {number} [_version] - データバージョン
 */

/**
 * @typedef {Object} Question
 * @property {number} id - 問題ID
 * @property {'text'|'image'} questionType - 問題タイプ
 * @property {string} questionText - 問題文
 * @property {string|null} questionImage - 問題画像（Base64）
 * @property {'text'|'image'} answerType - 回答タイプ
 * @property {string} answerText - 回答文
 * @property {string|null} answerImage - 回答画像（Base64）
 */

/**
 * @typedef {Object} QuestionSet
 * @property {number} id - 問題集ID
 * @property {string} name - 問題集名
 * @property {string} description - 説明
 * @property {Question[]} questions - 問題リスト
 * @property {string} createdAt - 作成日時
 * @property {string} updatedAt - 更新日時
 */

/**
 * @typedef {Object} DraftData
 * @property {'given'|'free'} problemType - 問題タイプ
 * @property {string} problemText - 問題文
 * @property {DebitCredit[]} debits - 借方リスト
 * @property {DebitCredit[]} credits - 貸方リスト
 * @property {string} freeAnswer - 自由記入回答
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - 有効かどうか
 * @property {Object.<string, string>} errors - エラーメッセージ
 */

export const Types = {};
