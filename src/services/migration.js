/**
 * データマイグレーションサービス
 * 旧形式のデータを新形式に変換
 */

export const CURRENT_DATA_VERSION = 2;

/**
 * マイグレーション関数の定義
 * キーはマイグレーション元のバージョン
 */
const migrations = {
  /**
   * v1 → v2: debit/credit を debits/credits 配列に変換
   */
  1: (data) => {
    // 問題データの場合
    if (data.type === 'given' || data.type === 'free') {
      const migrated = { ...data, _version: 2 };
      
      // 単数形式から複数形式へ変換
      if (data.debit && !data.debits) {
        migrated.debits = [{
          account: data.debit.account,
          amount: data.debit.amount
        }];
        delete migrated.debit;
      }
      
      if (data.credit && !data.credits) {
        migrated.credits = [{
          account: data.credit.account,
          amount: data.credit.amount
        }];
        delete migrated.credit;
      }
      
      return migrated;
    }
    
    // 下書きデータの場合
    if (data.problemType) {
      const migrated = { ...data, _version: 2 };
      
      if (data.debitAccount !== undefined && !data.debits) {
        migrated.debits = [{
          account: data.debitAccount || '',
          amount: data.debitAmount || ''
        }];
        delete migrated.debitAccount;
        delete migrated.debitAmount;
      }
      
      if (data.creditAccount !== undefined && !data.credits) {
        migrated.credits = [{
          account: data.creditAccount || '',
          amount: data.creditAmount || ''
        }];
        delete migrated.creditAccount;
        delete migrated.creditAmount;
      }
      
      return migrated;
    }
    
    return { ...data, _version: 2 };
  },
  
  // 将来のマイグレーション用プレースホルダー
  // 2: (data) => { ... },
};

/**
 * 単一データのマイグレーション
 * @param {Object} data - マイグレーション対象データ
 * @returns {Object} マイグレーション後のデータ
 */
export function migrateData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  let currentData = { ...data };
  let version = data._version || 1;
  
  // 順次マイグレーションを適用
  while (version < CURRENT_DATA_VERSION) {
    const migrationFn = migrations[version];
    if (migrationFn) {
      try {
        currentData = migrationFn(currentData);
      } catch (error) {
        console.error(`Migration from v${version} failed:`, error);
        break;
      }
    }
    version++;
  }
  
  return currentData;
}

/**
 * 問題リストのマイグレーション
 * @param {Array} problems - 問題リスト
 * @returns {Array} マイグレーション後の問題リスト
 */
export function migrateProblems(problems) {
  if (!Array.isArray(problems)) {
    return problems;
  }
  return problems.map(migrateData);
}

/**
 * データが最新バージョンかチェック
 * @param {Object} data - チェック対象データ
 * @returns {boolean} 最新バージョンかどうか
 */
export function isLatestVersion(data) {
  return data?._version === CURRENT_DATA_VERSION;
}

/**
 * マイグレーションが必要かチェック
 * @param {Object|Array} data - チェック対象データ
 * @returns {boolean} マイグレーションが必要かどうか
 */
export function needsMigration(data) {
  if (Array.isArray(data)) {
    return data.some(item => !isLatestVersion(item));
  }
  return !isLatestVersion(data);
}
