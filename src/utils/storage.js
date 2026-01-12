/**
 * 安全なストレージユーティリティ
 * エラーハンドリングとサニタイズを含む
 */

/**
 * localStorageが利用可能かチェック
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 安全にJSONをパース
 * @param {string} str - JSON文字列
 * @param {*} defaultValue - パース失敗時のデフォルト値
 * @returns {*}
 */
export function safeJsonParse(str, defaultValue = null) {
  if (!str || typeof str !== 'string') {
    return defaultValue;
  }
  
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('JSON parse error:', e);
    return defaultValue;
  }
}

/**
 * 安全にJSONを文字列化
 * @param {*} value - 値
 * @returns {string|null}
 */
export function safeJsonStringify(value) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    console.error('JSON stringify error:', e);
    return null;
  }
}

/**
 * ストレージから値を取得
 * @param {string} key - キー
 * @param {*} defaultValue - デフォルト値
 * @returns {*}
 */
export function getStorageItem(key, defaultValue = null) {
  if (!isStorageAvailable()) {
    return defaultValue;
  }
  
  try {
    const item = window.localStorage.getItem(key);
    return safeJsonParse(item, defaultValue);
  } catch (e) {
    console.warn(`Failed to read from localStorage (${key}):`, e);
    return defaultValue;
  }
}

/**
 * ストレージに値を保存
 * @param {string} key - キー
 * @param {*} value - 値
 * @returns {boolean} 成功したかどうか
 */
export function setStorageItem(key, value) {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    const stringified = safeJsonStringify(value);
    if (stringified === null) {
      return false;
    }
    window.localStorage.setItem(key, stringified);
    return true;
  } catch (e) {
    // QuotaExceededError の可能性
    console.error(`Failed to write to localStorage (${key}):`, e);
    return false;
  }
}

/**
 * ストレージから値を削除
 * @param {string} key - キー
 * @returns {boolean} 成功したかどうか
 */
export function removeStorageItem(key) {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Failed to remove from localStorage (${key}):`, e);
    return false;
  }
}

/**
 * ストレージの使用量を取得（概算）
 * @returns {Object} { used: number, quota: number, percentage: number }
 */
export function getStorageUsage() {
  if (!isStorageAvailable()) {
    return { used: 0, quota: 0, percentage: 0 };
  }
  
  let used = 0;
  try {
    for (let key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        used += (window.localStorage[key].length + key.length) * 2; // UTF-16
      }
    }
  } catch (e) {
    console.warn('Failed to calculate storage usage:', e);
  }
  
  // 一般的なlocalStorageの上限は5MB
  const quota = 5 * 1024 * 1024;
  
  return {
    used,
    quota,
    percentage: Math.round((used / quota) * 100)
  };
}

/**
 * Base64画像データのサニタイズ
 * @param {string} base64 - Base64文字列
 * @returns {string|null} サニタイズ済みのBase64、または無効な場合はnull
 */
export function sanitizeBase64Image(base64) {
  if (!base64 || typeof base64 !== 'string') {
    return null;
  }
  
  // data:image/xxx;base64, 形式かチェック
  const regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+/]+=*$/;
  
  // 完全一致は難しいので、プレフィックスのみチェック
  const prefixRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  
  if (!prefixRegex.test(base64)) {
    console.warn('Invalid image data format');
    return null;
  }
  
  // サイズチェック（5MB相当のBase64）
  const maxBase64Length = 5 * 1024 * 1024 * 1.37; // Base64は約37%増加
  if (base64.length > maxBase64Length) {
    console.warn('Image data too large');
    return null;
  }
  
  return base64;
}
