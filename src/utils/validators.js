/**
 * バリデーションユーティリティ
 * テスト可能な純粋関数として実装
 */

/**
 * 問題データのバリデーション
 * @param {Object} problem - 問題データ
 * @returns {ValidationResult} バリデーション結果
 */
export function validateProblem(problem) {
  const errors = {};
  
  // 問題文チェック
  if (!problem.problemText?.trim()) {
    errors.problemText = '問題文を入力してください';
  }
  
  if (problem.problemType === 'given') {
    // 借方チェック
    const validDebits = problem.debits?.filter(d => d.account?.trim() && d.amount) || [];
    if (validDebits.length === 0) {
      errors.debits = '借方の勘定科目と金額を入力してください';
    }
    
    // 貸方チェック
    const validCredits = problem.credits?.filter(c => c.account?.trim() && c.amount) || [];
    if (validCredits.length === 0) {
      errors.credits = '貸方の勘定科目と金額を入力してください';
    }
    
    // 貸借一致チェック
    if (validDebits.length > 0 && validCredits.length > 0) {
      const debitTotal = validDebits.reduce((sum, d) => sum + (parseInt(d.amount) || 0), 0);
      const creditTotal = validCredits.reduce((sum, c) => sum + (parseInt(c.amount) || 0), 0);
      
      if (debitTotal !== creditTotal) {
        errors.balance = `借方合計（${debitTotal.toLocaleString()}円）と貸方合計（${creditTotal.toLocaleString()}円）が一致していません`;
      }
    }
  } else if (problem.problemType === 'free') {
    if (!problem.freeAnswer?.trim()) {
      errors.freeAnswer = '回答を入力してください';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 問題集データのバリデーション
 * @param {Object} questionSet - 問題集データ
 * @returns {ValidationResult} バリデーション結果
 */
export function validateQuestionSet(questionSet) {
  const errors = {};
  
  // 名前チェック
  if (!questionSet.name?.trim()) {
    errors.name = '問題集の名前を入力してください';
  }
  
  // 問題数チェック
  if (!questionSet.questions || questionSet.questions.length === 0) {
    errors.questions = '最低1つの問題を追加してください';
  } else {
    // 各問題のバリデーション
    questionSet.questions.forEach((q, i) => {
      if (q.questionType === 'text' && !q.questionText?.trim()) {
        errors[`question_${i}`] = '問題文を入力してください';
      }
      if (q.questionType === 'image' && !q.questionImage) {
        errors[`question_${i}`] = '問題の画像をアップロードしてください';
      }
      if (q.answerType === 'text' && !q.answerText?.trim()) {
        errors[`answer_${i}`] = '回答を入力してください';
      }
      if (q.answerType === 'image' && !q.answerImage) {
        errors[`answer_${i}`] = '回答の画像をアップロードしてください';
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * ファイルアップロードのバリデーション
 * @param {File} file - アップロードファイル
 * @param {Object} options - オプション
 * @returns {ValidationResult} バリデーション結果
 */
export function validateFileUpload(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;
  
  const errors = {};
  
  if (!file) {
    errors.file = 'ファイルを選択してください';
    return { isValid: false, errors };
  }
  
  // MIMEタイプチェック
  if (!allowedTypes.includes(file.type)) {
    errors.type = `許可されていないファイル形式です。許可形式: ${allowedTypes.join(', ')}`;
  }
  
  // ファイルサイズチェック
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    errors.size = `ファイルサイズは${maxSizeMB}MB以下にしてください`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 勘定科目のバリデーション
 * @param {string} account - 勘定科目名
 * @returns {ValidationResult} バリデーション結果
 */
export function validateAccount(account) {
  const errors = {};
  
  if (!account?.trim()) {
    errors.account = '勘定科目を入力してください';
  } else if (account.length > 50) {
    errors.account = '勘定科目は50文字以内で入力してください';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 金額のバリデーション
 * @param {string|number} amount - 金額
 * @returns {ValidationResult} バリデーション結果
 */
export function validateAmount(amount) {
  const errors = {};
  const numAmount = parseInt(amount);
  
  if (amount === '' || amount === null || amount === undefined) {
    errors.amount = '金額を入力してください';
  } else if (isNaN(numAmount)) {
    errors.amount = '有効な数値を入力してください';
  } else if (numAmount < 0) {
    errors.amount = '金額は0以上で入力してください';
  } else if (numAmount > 999999999999) {
    errors.amount = '金額が大きすぎます';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
