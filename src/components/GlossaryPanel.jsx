import { useState, useEffect } from 'react';
import { Search, Book, X, ChevronDown, ChevronUp } from 'lucide-react';

export function GlossaryPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [glossaryData, setGlossaryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGlossary();
  }, []);

  const loadGlossary = async () => {
    try {
      const response = await fetch('/glossary.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      const data = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        return {
          term: values[0] || '',
          reading: values[1] || '',
          category: values[2] || '',
          definition: values[3] || ''
        };
      });
      
      setGlossaryData(data);
      setLoading(false);
    } catch (err) {
      setError('用語集の読み込みに失敗しました');
      setLoading(false);
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const categories = ['all', ...new Set(glossaryData.map(item => item.category))];

  const filteredData = glossaryData.filter(item => {
    const matchesSearch = 
      item.term.includes(searchTerm) || 
      item.reading.includes(searchTerm) ||
      item.definition.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedData = [...filteredData].sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));

  const categoryLabels = {
    'all': 'すべて',
    '基本': '基本',
    '商品': '商品売買',
    '現金': '現金・預金',
    '預金': '預金',
    '手形': '手形',
    '債権': '債権',
    '債務': '債務',
    '固定資産': '固定資産',
    '決算': '決算',
    '帳簿': '帳簿・伝票',
    '税金': '税金',
    '給与': '給与',
    '純資産': '純資産',
    '電子記録': '電子記録',
    '仕訳': '仕訳',
    '計算': '計算',
    'その他': 'その他'
  };

  return (
    <>
      {/* フローティングボタン */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-40"
          title="用語集を開く"
        >
          <Book size={24} />
        </button>
      )}

      {/* パネル本体 */}
      {isOpen && (
        <div 
          className={`fixed right-6 bg-white rounded-xl shadow-2xl z-40 flex flex-col border overflow-hidden transition-all duration-200 ${
            isMinimized ? 'bottom-6' : 'bottom-6'
          }`}
          style={{ 
            width: '380px',
            height: isMinimized ? 'auto' : '500px'
          }}
        >
          {/* ヘッダー */}
          <div className="p-3 bg-indigo-600 text-white flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <Book size={20} />
              用語集
              <span className="text-indigo-200 text-sm">({sortedData.length}件)</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-indigo-700 rounded transition"
                title={isMinimized ? '展開' : '最小化'}
              >
                {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-indigo-700 rounded transition"
                title="閉じる"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* 検索 */}
              <div className="p-3 border-b bg-gray-50">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="用語を検索..."
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat] || cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 用語リスト */}
              <div className="flex-1 overflow-y-auto p-3">
                {loading ? (
                  <div className="text-center text-gray-500 py-4">読み込み中...</div>
                ) : error ? (
                  <div className="text-center text-red-500 py-4 text-sm">{error}</div>
                ) : sortedData.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 text-sm">該当する用語がありません</div>
                ) : (
                  <div className="space-y-2">
                    {sortedData.map((item, idx) => (
                      <details key={idx} className="bg-gray-50 rounded-lg overflow-hidden group">
                        <summary className="p-2 cursor-pointer hover:bg-gray-100 transition list-none">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-semibold text-sm text-gray-800 truncate">{item.term}</span>
                              <span className="text-gray-400 text-xs shrink-0">({item.reading})</span>
                            </div>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded ml-2 shrink-0">
                              {item.category}
                            </span>
                          </div>
                        </summary>
                        <div className="px-3 pb-3 pt-1 text-sm text-gray-600 border-t bg-white">
                          {item.definition}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
