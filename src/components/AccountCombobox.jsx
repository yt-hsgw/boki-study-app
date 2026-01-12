import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { getAccountsByCategory, getAllAccounts } from '../data/accounts';

/**
 * 勘定科目用コンボボックス
 * 選択 + 自由入力のハイブリッドUI（カテゴリ別グループ化対応）
 */
export function AccountCombobox({
  value = '',
  onChange,
  placeholder = '勘定科目',
  className = '',
  color = 'blue',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  
  // メモ化してパフォーマンス向上
  const categories = useMemo(() => getAccountsByCategory(), []);
  const allAccounts = useMemo(() => getAllAccounts(), []);

  // 入力値でフィルタリング（メモ化）
  const filteredAccounts = useMemo(() => {
    if (!inputValue.trim()) return [];
    const searchTerm = inputValue.toLowerCase();
    return allAccounts.filter(acc => 
      acc.toLowerCase().includes(searchTerm)
    );
  }, [inputValue, allAccounts]);

  // 外部からvalueが変更された場合に同期
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    if (!isOpen) setIsOpen(true);
  }, [isOpen, onChange]);

  const handleSelect = useCallback((account) => {
    setInputValue(account);
    onChange?.(account);
    setIsOpen(false);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    if (!disabled) setIsOpen(true);
  }, [disabled]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && inputValue.trim()) {
      setIsOpen(false);
    }
  }, [inputValue]);

  // カラーテーマ
  const colorTheme = useMemo(() => ({
    blue: {
      ring: 'focus:ring-blue-500',
      header: 'bg-blue-50 text-blue-700',
      hover: 'hover:bg-blue-50',
    },
    red: {
      ring: 'focus:ring-red-500',
      header: 'bg-red-50 text-red-700',
      hover: 'hover:bg-red-50',
    },
    green: {
      ring: 'focus:ring-green-500',
      header: 'bg-green-50 text-green-700',
      hover: 'hover:bg-green-50',
    },
  }[color] || {
    ring: 'focus:ring-blue-500',
    header: 'bg-blue-50 text-blue-700',
    hover: 'hover:bg-blue-50',
  }), [color]);

  // 値が選択肢に存在するかチェック
  const valueExists = useMemo(() => 
    allAccounts.includes(inputValue),
    [allAccounts, inputValue]
  );

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="勘定科目"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`w-full border rounded-lg p-2 pr-8 text-sm focus:outline-none focus:ring-2 ${colorTheme.ring} ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${className}`}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 ${
            disabled ? 'cursor-not-allowed' : 'hover:text-gray-600'
          }`}
          disabled={disabled}
          tabIndex={-1}
          aria-label="選択肢を開く"
        >
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {isOpen && !disabled && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto"
          role="listbox"
        >
          {/* 入力中のフィルター結果 */}
          {inputValue.trim() !== '' && filteredAccounts.length > 0 && (
            <div className="border-b">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                検索結果 ({filteredAccounts.length}件)
              </div>
              {filteredAccounts.slice(0, 10).map(acc => (
                <button
                  key={`filter-${acc}`}
                  type="button"
                  onClick={() => handleSelect(acc)}
                  className={`w-full text-left px-3 py-2 text-sm ${colorTheme.hover} transition ${
                    acc === value ? 'bg-gray-100 font-medium' : ''
                  }`}
                  role="option"
                  aria-selected={acc === value}
                >
                  {acc}
                </button>
              ))}
              {filteredAccounts.length > 10 && (
                <div className="px-3 py-1 text-xs text-gray-400 text-center">
                  他 {filteredAccounts.length - 10} 件...
                </div>
              )}
            </div>
          )}

          {/* 入力値が候補にない場合、そのまま使用するオプション */}
          {inputValue.trim() !== '' && !valueExists && (
            <button
              type="button"
              onClick={() => handleSelect(inputValue)}
              className="w-full text-left px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 transition border-b"
            >
              <span className="text-yellow-700">「{inputValue}」をそのまま使用</span>
            </button>
          )}

          {/* カテゴリ別リスト */}
          {Object.entries(categories).map(([key, category]) => (
            <div key={key}>
              <div className={`px-3 py-1.5 text-xs font-semibold ${colorTheme.header} sticky top-0`}>
                {category.label}
              </div>
              {category.accounts.map(acc => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => handleSelect(acc)}
                  className={`w-full text-left px-3 py-2 text-sm ${colorTheme.hover} transition ${
                    acc === value ? 'bg-gray-100 font-medium' : ''
                  }`}
                  role="option"
                  aria-selected={acc === value}
                >
                  {acc}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountCombobox;
