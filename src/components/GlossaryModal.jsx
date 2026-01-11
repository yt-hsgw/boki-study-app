import { useState, useEffect } from 'react';
import { X, Search, Book } from 'lucide-react';

export function GlossaryModal({ onClose }) {
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
      const headers = lines[0].split(',');
      
      const data = lines.slice(1).map(line => {
        // CSVのカンマ区切りを正しく処理（定義内のカンマに対応）
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

  // CSVの1行をパースする関数
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

  // カテゴリ一覧を取得
  const categories = ['all', ...new Set(glossaryData.map(item => item.category))];

  // フィルタリング
  const filteredData = glossaryData.filter(item => {
    const matchesSearch = 
      item.term.includes(searchTerm) || 
      item.reading.includes(searchTerm) ||
      item.definition.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 五十音順でソート
  const sortedData = [...filteredData].sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));

  // 読み仮名の最初の文字でグループ化
  const groupedData = sortedData.reduce((acc, item) => {
    const firstChar = item.reading.charAt(0);
    const group = getKanaGroup(firstChar);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  function getKanaGroup(char) {
    const groups = {
      'あ': ['あ', 'い', 'う', 'え', 'お'],
      'か': ['か', 'き', 'く', 'け', 'こ', 'が', 'ぎ', 'ぐ', 'げ', 'ご'],
      'さ': ['さ', 'し', 'す', 'せ', 'そ', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
      'た': ['た', 'ち', 'つ', 'て', 'と', 'だ', 'ぢ', 'づ', 'で', 'ど'],
      'な': ['な', 'に', 'ぬ', 'ね', 'の'],
      'は': ['は', 'ひ', 'ふ', 'へ', 'ほ', 'ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
      'ま': ['ま', 'み', 'む', 'め', 'も'],
      'や': ['や', 'ゆ', 'よ'],
      'ら': ['ら', 'り', 'る', 'れ', 'ろ'],
      'わ': ['わ', 'を', 'ん']
    };
    for (const [group, chars] of Object.entries(groups)) {
      if (chars.includes(char)) return group;
    }
    return 'その他';
  }

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
    '電子記録': '電子記録債権',
    '仕訳': '仕訳',
    '計算': '計算',
    'その他': 'その他'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b flex items-center justify-between bg-indigo-600 text-white rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Book size={24} />
            簿記3級 用語集
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-indigo-700 rounded">
            <X size={24} />
          </button>
        </div>

        {/* 検索・フィルター */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="用語を検索..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* 用語リスト */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">読み込み中...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : sortedData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">該当する用語がありません</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedData).map(([group, items]) => (
                <div key={group}>
                  <h3 className="text-lg font-bold text-indigo-600 border-b-2 border-indigo-200 pb-1 mb-3">
                    {group}行
                  </h3>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-gray-800">{item.term}</span>
                            <span className="text-gray-500 text-sm ml-2">（{item.reading}）</span>
                          </div>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-3 border-t bg-gray-50 text-center text-sm text-gray-500 rounded-b-lg">
          {sortedData.length} 件の用語
        </div>
      </div>
    </div>
  );
}
