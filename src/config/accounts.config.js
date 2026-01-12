/**
 * 勘定科目の設定
 * 将来的にはAPIからの取得や動的な追加に対応可能
 */

export const accountsConfig = {
  // カスタム勘定科目を許可するか
  allowCustomAccounts: true,
  
  // カスタム勘定科目の最大数
  maxCustomAccounts: 50,
  
  // 勘定科目名の最大文字数
  maxAccountNameLength: 50,
  
  // カスタム勘定科目のストレージキー
  customAccountsStorageKey: 'custom_accounts',
};

/**
 * カスタム勘定科目を取得
 */
export function getCustomAccounts() {
  if (!accountsConfig.allowCustomAccounts) {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(accountsConfig.customAccountsStorageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('Failed to load custom accounts:', e);
    return [];
  }
}

/**
 * カスタム勘定科目を追加
 */
export function addCustomAccount(account) {
  if (!accountsConfig.allowCustomAccounts) {
    return { success: false, error: 'カスタム勘定科目は無効です' };
  }
  
  if (!account || account.length > accountsConfig.maxAccountNameLength) {
    return { success: false, error: '勘定科目名が無効です' };
  }
  
  const current = getCustomAccounts();
  
  if (current.length >= accountsConfig.maxCustomAccounts) {
    return { success: false, error: 'カスタム勘定科目の上限に達しました' };
  }
  
  if (current.includes(account)) {
    return { success: false, error: '既に登録されています' };
  }
  
  try {
    const updated = [...current, account];
    localStorage.setItem(
      accountsConfig.customAccountsStorageKey, 
      JSON.stringify(updated)
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: '保存に失敗しました' };
  }
}

/**
 * カスタム勘定科目を削除
 */
export function removeCustomAccount(account) {
  const current = getCustomAccounts();
  const updated = current.filter(a => a !== account);
  
  try {
    localStorage.setItem(
      accountsConfig.customAccountsStorageKey, 
      JSON.stringify(updated)
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: '保存に失敗しました' };
  }
}

export default accountsConfig;
