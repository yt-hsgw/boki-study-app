import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getAccountsByCategory, getAllAccounts } from '../data/accounts';

export function AccountCombobox({ value, onChange, placeholder = '勘定科目', className = '', color = 'blue', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  
  const categories = getAccountsByCategory();
  const allAccounts = getAllAccounts();

  // 外部からvalueが変更された場合に同期
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // 入力値でフィルタリング
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredAccounts([]);
    } else {
      const filtered = allAccounts.filter(acc => 
        acc.includes(inputValue)
      );
      setFilteredAccounts(filtered);
    }
  }, [inputValue]);

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

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (account) => {
    setInputValue(account);
    onChange(account);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (!disabled) setIsOpen(true);
  };

  const ringColor = color === 'red' ? 'focus:ring-red-500' : 'focus:ring-blue-500';
  const headerBg = color === 'red' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700';
  const hoverBg = color === 'red' ? 'hover:bg-red-50' : 'hover:bg-blue-50';

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border rounded-lg p-2 pr-8 text-sm focus:outline-none focus:ring-2 ${ringColor} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 ${disabled ? 'cursor-not-allowed' : 'hover:text-gray-600'}`}
          disabled={disabled}
        >
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* 入力中のフィルター結果 */}
          {inputValue.trim() !== '' && filteredAccounts.length > 0 && (
            <div className="border-b">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                検索結果
              </div>
              {filteredAccounts.slice(0, 10).map(acc => (
                <button
                  key={`filter-${acc}`}
                  type="button"
                  onClick={() => handleSelect(acc)}
                  className={`w-full text-left px-3 py-2 text-sm ${hoverBg} transition`}
                >
                  {acc}
                </button>
              ))}
            </div>
          )}

          {/* 入力値が候補にない場合、そのまま使用するオプション */}
          {inputValue.trim() !== '' && !allAccounts.includes(inputValue) && (
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
              <div className={`px-3 py-1.5 text-xs font-semibold ${headerBg} sticky top-0`}>
                {category.label}
              </div>
              {category.accounts.map(acc => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => handleSelect(acc)}
                  className={`w-full text-left px-3 py-2 text-sm ${hoverBg} transition ${
                    acc === value ? 'bg-gray-100 font-medium' : ''
                  }`}
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
