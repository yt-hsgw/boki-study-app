import { useState } from 'react';

export function ReviewModalFree({ problem, onClose }) {
  const [correctAnswer, setCorrectAnswer] = useState(problem.answer);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">答え合わせ</h3>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold mb-2">問題文</p>
            <p className="text-gray-700">{problem.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <h4 className="font-semibold mb-3 text-red-700">あなたの回答</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{problem.answer}</p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h4 className="font-semibold mb-3 text-green-700">正解（編集可）</h4>
              <textarea
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full border rounded p-2 text-sm h-24"
              />
            </div>
          </div>

          <button onClick={onClose} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
