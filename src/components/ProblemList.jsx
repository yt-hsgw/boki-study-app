import { Eye, Trash2 } from 'lucide-react';

export function ProblemList({ problems, onView, onDelete }) {
  if (problems.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
        問題がまだ登録されていません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {problems.map((problem, idx) => (
        <div key={problem.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-600 mb-1">
                問題 {idx + 1} {problem.type === 'free' ? '(自由記入)' : '(選択肢)'}
              </p>
              <p className="text-gray-800 text-sm line-clamp-2">{problem.text}</p>
              {problem.type === 'given' ? (
                <div className="flex gap-4 mt-2 text-xs text-gray-600">
                  <span>借: {problem.debit.account} / ¥{problem.debit.amount.toLocaleString()}</span>
                  <span>貸: {problem.credit.account} / ¥{problem.credit.amount.toLocaleString()}</span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-600">回答: {problem.answer.substring(0, 50)}...</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onView(problem)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                title="詳細を見る"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onDelete(problem.id)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                title="削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
