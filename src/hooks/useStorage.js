import { useState, useCallback, useRef, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { migrateData, migrateProblems, needsMigration } from '../services/migration';

/**
 * 改善されたlocalStorageフック
 * - エラーハンドリング強化
 * - データマイグレーション対応
 * - 競合状態の回避
 * - スキーマ検証対応
 * 
 * @param {string} key - ストレージキー
 * @param {*} initialValue - 初期値
 * @param {Object} options - オプション
 * @param {boolean} options.migrate - マイグレーションを有効にするか
 * @param {Function} options.validator - カスタムバリデーター
 * @param {Function} options.onError - エラーハンドラー
 * @returns {[*, Function, Object]} [value, setValue, { error, isLoading }]
 */
export const useStorage = (key, initialValue, options = {}) => {
  const {
    migrate = false,
    validator = null,
    onError = null,
  } = options;
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const writeQueueRef = useRef(Promise.resolve());
  const isMountedRef = useRef(true);
  
  // 初期値の読み込み
  const [value, setValue] = useState(() => {
    try {
      let storedValue = getStorageItem(key, null);
      
      // 値が存在しない場合は初期値を使用
      if (storedValue === null) {
        return initialValue;
      }
      
      // マイグレーション
      if (migrate) {
        if (Array.isArray(storedValue)) {
          if (needsMigration(storedValue)) {
            storedValue = migrateProblems(storedValue);
            // マイグレーション結果を保存
            setStorageItem(key, storedValue);
          }
        } else if (typeof storedValue === 'object') {
          if (needsMigration(storedValue)) {
            storedValue = migrateData(storedValue);
            setStorageItem(key, storedValue);
          }
        }
      }
      
      // バリデーション
      if (validator && !validator(storedValue)) {
        console.warn(`Invalid data in localStorage key "${key}"`);
        return initialValue;
      }
      
      return storedValue;
    } catch (e) {
      console.error(`Failed to initialize storage for key "${key}":`, e);
      setError(e);
      onError?.(e);
      return initialValue;
    }
  });
  
  // マウント状態の管理
  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(false);
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // 値の更新（競合状態を回避）
  const updateValue = useCallback((newValue) => {
    // 関数型更新をサポート
    setValue(prevValue => {
      const nextValue = typeof newValue === 'function' ? newValue(prevValue) : newValue;
      
      // 非同期で保存（キューを使用して競合を回避）
      writeQueueRef.current = writeQueueRef.current.then(() => {
        return new Promise(resolve => {
          if (!isMountedRef.current) {
            resolve();
            return;
          }
          
          try {
            const success = setStorageItem(key, nextValue);
            if (!success) {
              console.warn(`Failed to save to localStorage key "${key}"`);
            }
            setError(null);
          } catch (e) {
            console.error(`Failed to write to localStorage key "${key}":`, e);
            if (isMountedRef.current) {
              setError(e);
              onError?.(e);
            }
          }
          resolve();
        });
      });
      
      return nextValue;
    });
  }, [key, onError]);
  
  // ストレージからの強制再読み込み
  const reload = useCallback(() => {
    try {
      const storedValue = getStorageItem(key, initialValue);
      setValue(storedValue);
      setError(null);
    } catch (e) {
      setError(e);
      onError?.(e);
    }
  }, [key, initialValue, onError]);
  
  // ストレージのクリア
  const clear = useCallback(() => {
    setValue(initialValue);
    try {
      localStorage.removeItem(key);
      setError(null);
    } catch (e) {
      setError(e);
      onError?.(e);
    }
  }, [key, initialValue, onError]);
  
  return [
    value,
    updateValue,
    {
      error,
      isLoading,
      reload,
      clear,
    }
  ];
};

/**
 * シンプルなuseStorageフック（後方互換性のため）
 */
export const useStorageSimple = (key, initialValue) => {
  const [value, setValue] = useStorage(key, initialValue);
  return [value, setValue];
};

export default useStorage;
