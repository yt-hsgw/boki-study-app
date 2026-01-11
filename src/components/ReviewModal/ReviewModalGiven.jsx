import { useState, useMemo } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { getAllAccounts } from '../../data/accounts';

export function ReviewModalGiven({ problem, onClose }) {
  const accounts = getAllAccounts();

  // 旧形式との互換性: debit/credit が単数の場合は配列に変換
  const problemDebits = useMemo(() => {
    if (problem.debits) return problem.debits;
    if (problem.debit) return [problem.debit];
    return [];
  }, [problem]);

  const problemCredits = useMemo(() => {
    if (problem.credits) return problem.credits;
    if (problem.credit) return [problem.credit];
    return [];
  }, [problem]);

  // ユーザーの回答（正解入力用）
  const [userDebits, setUserDebits] = useState(
    problemDebits.map(d => ({ account: '', amount: '' }))
  );
  const [userCredits, setUserCredits] = useState(
    problemCredits.map(c => ({ account: '', amount: '' }))
  );
  const [showAnswer, setShowAnswer] = useState(false);

  const handleUserDebitChange = (index, field, value) => {
    const newDebits = [...userDebits];
    newDebits[index] = { ...newDebits[index], [field]: value };
    setUserDebits(newDebits);
  };

  const handleUserCreditChange = (index, field, value) => {
    const newCredits = [...userCredits];
    newCredits[index] = { ...newCredits[index], [field]: value };
    setUserCredits(newCredits);
  };

  // 正誤判定
  const checkDebit = (index) => {
    const correct = problemDebits[index];
    const user = userDebits[index];
    return user.account === correct.account && parseInt(user.amount) === correct.amount;
  };

  const checkCredit = (index) => {
    const correct = problemCredits[index];
    const user = userCredits[index];
    return user.account === correct.account && parseInt(user.amount) === correct.amount;
  };

  const allDebitsCorrect = problemDebits.every((_, i) => checkDebit(i));
  const allCreditsCorrect = problemCredits.every((_, i) => checkCredit(i));
  const allCorrect = allDebitsCorrect && allCreditsCorrect;

  // 合計計算
  const debitTotal = problemDebits.reduce((sum, d) => sum + d.amount, 0);
  const creditTotal = problemCredits.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">答え合わせ</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>

          {/* 問題文 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold mb-2 text-gray-600">問題文</p>
            <p className="text-gray-800">{problem.text}</p>
          </div>

          {/* 回答入力エリア */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* 借方 */}
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-red-700 mb-3">借方（左側）</h4>
              {problemDebits.map((_, index) => (
                <div key={index} className={`mb-3 p-3 rounded-lg ${
                  showAnswer 
                    ? checkDebit(index) ? 'bg-green-50' : 'bg-red-50'
                    : 'bg-gray-50'
                }`}>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={userDebits[index]?.account || ''}
                      onChange={(e) => handleUserDebitChange(index, 'account', e.target.value)}
                      className="flex-1 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={showAnswer}
                    >
                      <option value="">勘定科目を選択</option>
                      {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                    <input
                      type="number"
                      value={userDebits[index]?.amount || ''}
                      onChange={(e) => handleUserDebitChange(index, 'amount', e.target.value)}
                      placeholder="金額"
                      className="w-24 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={showAnswer}
                    />
                  </div>
                  {showAnswer && (
                    <div className={`text-sm ${checkDebit(index) ? 'text-green-700' : 'text-red-700'}`}>
                      {checkDebit(index) ? (
                        <span className="flex items-center gap-1"><Check size={14} /> 正解</span>
                      ) : (
                        <span>
                          <span className="flex items-center gap-1"><AlertTriangle size={14} /> 正解: </span>
                          {problemDebits[index].account} / ¥{problemDebits[index].amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="text-right text-sm font-semibold text-red-700 border-t pt-2">
                合計: ¥{debitTotal.toLocaleString()}
              </div>
            </div>

            {/* 貸方 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-blue-700 mb-3">貸方（右側）</h4>
              {problemCredits.map((_, index) => (
                <div key={index} className={`mb-3 p-3 rounded-lg ${
                  showAnswer 
                    ? checkCredit(index) ? 'bg-green-50' : 'bg-red-50'
                    : 'bg-gray-50'
                }`}>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={userCredits[index]?.account || ''}
                      onChange={(e) => handleUserCreditChange(index, 'account', e.target.value)}
                      className="flex-1 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={showAnswer}
                    >
                      <option value="">勘定科目を選択</option>
                      {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                    <input
                      type="number"
                      value={userCredits[index]?.amount || ''}
                      onChange={(e) => handleUserCreditChange(index, 'amount', e.target.value)}
                      placeholder="金額"
                      className="w-24 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={showAnswer}
                    />
                  </div>
                  {showAnswer && (
                    <div className={`text-sm ${checkCredit(index) ? 'text-green-700' : 'text-red-700'}`}>
                      {checkCredit(index) ? (
                        <span className="flex items-center gap-1"><Check size={14} /> 正解</span>
                      ) : (
                        <span>
                          <span className="flex items-center gap-1"><AlertTriangle size={14} /> 正解: </span>
                          {problemCredits[index].account} / ¥{problemCredits[index].amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="text-right text-sm font-semibold text-blue-700 border-t pt-2">
                合計: ¥{creditTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 結果表示 */}
          {showAnswer && (
            <div className={`p-4 rounded-lg text-center font-semibold mb-4 ${
              allCorrect ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {allCorrect ? '🎉 完全正解！' : '見直してみましょう'}
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                答え合わせ
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAnswer(false);
                  setUserDebits(problemDebits.map(() => ({ account: '', amount: '' })));
                  setUserCredits(problemCredits.map(() => ({ account: '', amount: '' })));
                }}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                もう一度
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
