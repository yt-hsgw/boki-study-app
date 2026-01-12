import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * 汎用Comboboxコンポーネント
 * 選択 + 自由入力のハイブリッドUI
 * 
 * @param {Object} props
 * @param {string} props.value - 現在の値
 * @param {Function} props.onChange - 値変更時のコールバック
 * @param {Array} props.options - 選択肢 [{ label, value, group? }]
 * @param {string} props.placeholder - プレースホルダー
 * @param {string} props.className - 追加のクラス名
 * @param {boolean} props.disabled - 無効状態
 * @param {boolean} props.allowCustom - カスタム値を許可
 * @param {string} props.customLabel - カスタム値のラベル
 * @param {string} props.color - テーマカラー ('blue' | 'red' | 'green')
 * @param {boolean} props.groupBy - グループ化するかどうか
 * @param {Function} props.filterFn - カスタムフィルター関数
 * @param {Function} props.renderOption - オプションのカスタムレンダリング
 */
export function Combobox({
  value = '',
  onChange,
  options = [],
  placeholder = '選択してください',
  className = '',
  disabled = false,
  allowCustom = true,
  customLabel = 'をそのまま使用',
  color = 'blue',
  groupBy = false,
  filterFn = null,
  renderOption = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

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

  // フィルタリング
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return [];
    
    if (filterFn) {
      return options.filter(opt => filterFn(opt, inputValue));
    }
    
    return options.filter(opt => {
      const label = typeof opt === 'string' ? opt : opt.label;
      return label.toLowerCase().includes(inputValue.toLowerCase());
    });
  }, [inputValue, options, filterFn]);

  // グループ化
  const groupedOptions = useMemo(() => {
    if (!groupBy) return null;
    
    return options.reduce((acc, opt) => {
      const group = opt.group || 'その他';
      if (!acc[group]) {
        acc[group] = { label: group, options: [] };
      }
      acc[group].options.push(opt);
      return acc;
    }, {});
  }, [options, groupBy]);

  // 値が選択肢に存在するかチェック
  const valueExists = useMemo(() => {
    return options.some(opt => {
      const optValue = typeof opt === 'string' ? opt : opt.value;
      return optValue === inputValue;
    });
  }, [options, inputValue]);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    if (!isOpen) setIsOpen(true);
  }, [isOpen, onChange]);

  const handleSelect = useCallback((opt) => {
    const selectedValue = typeof opt === 'string' ? opt : opt.value;
    setInputValue(selectedValue);
    onChange?.(selectedValue);
    setIsOpen(false);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    if (!disabled) setIsOpen(true);
  }, [disabled]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && inputValue.trim()) {
      setIsOpen(false);
    }
  }, [inputValue]);

  const renderOptionItem = (opt, index) => {
    const label = typeof opt === 'string' ? opt : opt.label;
    const optValue = typeof opt === 'string' ? opt : opt.value;
    
    if (renderOption) {
      return renderOption(opt, index, { isSelected: optValue === value });
    }
    
    return (
      <button
        key={optValue || index}
        type="button"
        onClick={() => handleSelect(opt)}
        className={`w-full text-left px-3 py-2 text-sm ${colorTheme.hover} transition ${
          optValue === value ? 'bg-gray-100 font-medium' : ''
        }`}
      >
        {label}
      </button>
    );
  };

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
        >
          <ChevronDown 
            size={16} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* 検索結果 */}
          {inputValue.trim() !== '' && filteredOptions.length > 0 && (
            <div className="border-b">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                検索結果
              </div>
              {filteredOptions.slice(0, 10).map((opt, i) => renderOptionItem(opt, i))}
            </div>
          )}

          {/* カスタム値オプション */}
          {allowCustom && inputValue.trim() !== '' && !valueExists && (
            <button
              type="button"
              onClick={() => handleSelect(inputValue)}
              className="w-full text-left px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 transition border-b"
            >
              <span className="text-yellow-700">「{inputValue}」{customLabel}</span>
            </button>
          )}

          {/* グループ化表示 */}
          {groupBy && groupedOptions && Object.entries(groupedOptions).map(([groupKey, group]) => (
            <div key={groupKey}>
              <div className={`px-3 py-1.5 text-xs font-semibold ${colorTheme.header} sticky top-0`}>
                {group.label}
              </div>
              {group.options.map((opt, i) => renderOptionItem(opt, i))}
            </div>
          ))}

          {/* フラット表示 */}
          {!groupBy && inputValue.trim() === '' && options.map((opt, i) => renderOptionItem(opt, i))}

          {/* 結果なし */}
          {inputValue.trim() !== '' && filteredOptions.length === 0 && !allowCustom && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              該当する項目がありません
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Combobox;
