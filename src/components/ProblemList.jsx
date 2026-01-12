import { useMemo } from 'react';
import { Eye, Trash2 } from 'lucide-react';

/**
 * 問題一覧コンポーネント
 * Nullチェックと旧形式との互換性を強化
 */
export function ProblemList({ problems = [], onView, onDelete }) {
  // 安全な問題リスト（null/undefined対策）
  const safeProblems = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    return problems.filter(p => p && typeof p === 'object');
  }, [problems]);

  if (safeProblems.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
        <p>問題がまだ登録されていません</p>
        <p className="text-sm text-gray-400 mt-2">
          「問題入力」タブから新しい問題を追加してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list">
      {safeProblems.map((problem, idx) => (
        <ProblemCard
          key={problem.id || idx}
          problem={problem}
          index={idx}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

/**
 * 問題カードコンポーネント
 */
function ProblemCard({ problem, index, onView, onDelete }) {
  // 旧形式・新形式両対応で借方・貸方を取得
  const debitDisplay = useMemo(() => {
    if (problem.debits && problem.debits.length > 0) {
      return problem.debits[0];
    }
    return problem.debit || null;
  }, [problem]);

  const creditDisplay = useMemo(() => {
    if (problem.credits && problem.credits.length > 0) {
      return problem.credits[0];
    }
    return problem.credit || null;
  }, [problem]);

  // 複合仕訳かどうか
  const isComplex = useMemo(() => {
    const debitCount = problem.debits?.length || (problem.debit ? 1 : 0);
    const creditCount = problem.credits?.length || (problem.credit ? 1 : 0);
    return debitCount > 1 || creditCount > 1;
  }, [problem]);

  // 金額のフォーマット
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '---';
    const num = parseInt(amount);
    return isNaN(num) ? '---' : `¥${num.toLocaleString()}`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
      role="listitem"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-gray-600">
              問題 {index + 1}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              problem.type === 'free' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {problem.type === 'free' ? '自由記入' : '選択肢'}
            </span>
            {isComplex && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                複合仕訳
              </span>
            )}
          </div>

          {/* 問題文 */}
          <p className="text-gray-800 text-sm line-clamp-2 mb-2">
            {problem.text || '(問題文なし)'}
          </p>

          {/* 回答プレビュー */}
          {problem.type === 'given' ? (
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              {debitDisplay && (
                <span className="flex items-center gap-1">
                  <span className="text-red-600 font-medium">借:</span>
                  {debitDisplay.account || '---'} / {formatAmount(debitDisplay.amount)}
                </span>
              )}
              {creditDisplay && (
                <span className="flex items-center gap-1">
                  <span className="text-blue-600 font-medium">貸:</span>
                  {creditDisplay.account || '---'} / {formatAmount(creditDisplay.amount)}
                </span>
              )}
              {isComplex && (
                <span className="text-gray-400">
                  (他 {(problem.debits?.length || 1) + (problem.credits?.length || 1) - 2}件)
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-600 line-clamp-1">
              回答: {problem.answer ? `${problem.answer.substring(0, 50)}...` : '(回答なし)'}
            </p>
          )}

          {/* 作成日 */}
          {problem.createdAt && (
            <p className="text-xs text-gray-400 mt-2">
              作成: {new Date(problem.createdAt).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onView?.(problem)}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            title="詳細を見る"
            aria-label={`問題${index + 1}の詳細を見る`}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onDelete?.(problem.id)}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
            title="削除"
            aria-label={`問題${index + 1}を削除`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProblemList;
