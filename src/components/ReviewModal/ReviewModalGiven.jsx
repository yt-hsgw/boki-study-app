import { useState } from 'react';
import { getAllAccounts } from '../../data/accounts';

export function ReviewModalGiven({ problem, onClose }) {
  const [correctDebit, setCorrectDebit] = useState(problem.debit.account);
  const [correctDebitAmount, setCorrectDebitAmount] = useState(problem.debit.amount);
  const [correctCredit, setCorrectCredit] = useState(problem.credit.account);
  const [correctCreditAmount, setCorrectCreditAmount] = useState(problem.credit.amount);

  const accounts = getAllAccounts();
  const debitCorrect = correctDebit === problem.debit.account && correctDebitAmount === problem.debit.amount;
  const creditCorrect = correctCredit === problem.credit.account && correctCreditAmount === problem.credit.amount;
  const allCorrect = debitCorrect && creditCorrect;

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
            <div className={`border-l-4 p-4 rounded ${debitCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <h4 className="font-semibold mb-3 text-red-700">あなたの借方</h4>
              <p className="text-sm mb-3">{problem.debit.account} / ¥{problem.debit.amount.toLocaleString()}</p>
              <h4 className="font-semibold mb-2 text-green-700">正解</h4>
              <select value={correctDebit} onChange={(e) => setCorrectDebit(e.target.value)} className="w-full border rounded p-2 mb-2 text-sm">
                {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
              </select>
              <input type="number" value={correctDebitAmount} onChange={(e) => setCorrectDebitAmount(parseInt(e.target.value))} className="w-full border rounded p-2 text-sm" />
            </div>

            <div className={`border-l-4 p-4 rounded ${creditCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <h4 className="font-semibold mb-3 text-blue-700">あなたの貸方</h4>
              <p className="text-sm mb-3">{problem.credit.account} / ¥{problem.credit.amount.toLocaleString()}</p>
              <h4 className="font-semibold mb-2 text-green-700">正解</h4>
              <select value={correctCredit} onChange={(e) => setCorrectCredit(e.target.value)} className="w-full border rounded p-2 mb-2 text-sm">
                {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
              </select>
              <input type="number" value={correctCreditAmount} onChange={(e) => setCorrectCreditAmount(parseInt(e.target.value))} className="w-full border rounded p-2 text-sm" />
            </div>
          </div>

          <div className={`p-4 rounded-lg text-center font-semibold ${allCorrect ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {allCorrect ? '✓ 完全正解！' : '見直しが必要です'}
          </div>

          <button onClick={onClose} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
