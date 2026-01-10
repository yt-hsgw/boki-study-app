import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ErrorDialog } from './ErrorDialog';
import { getAllAccounts } from '../data/accounts';
import { Save } from 'lucide-react';

export function ProblemInput({ onSave, draftData, onDraftChange }) {
  const [errorMessage, setErrorMessage] = useState('');
  const accounts = getAllAccounts();

  const handleProblemTypeChange = (newType) => {
    onDraftChange({ ...draftData, problemType: newType });
  };

  const handleProblemTextChange = (text) => {
    onDraftChange({ ...draftData, problemText: text });
  };

  const handleDebitAccountChange = (account) => {
    onDraftChange({ ...draftData, debitAccount: account });
  };

  const handleDebitAmountChange = (amount) => {
    onDraftChange({ ...draftData, debitAmount: amount });
  };

  const handleCreditAccountChange = (account) => {
    onDraftChange({ ...draftData, creditAccount: account });
  };

  const handleCreditAmountChange = (amount) => {
    onDraftChange({ ...draftData, creditAmount: amount });
  };

  const handleFreeAnswerChange = (answer) => {
    onDraftChange({ ...draftData, freeAnswer: answer });
  };

  const validateAndSave = () => {
    if (!draftData.problemText.trim()) {
      setErrorMessage('問題文を入力してください');
      return;
    }

    if (draftData.problemType === 'given') {
      if (!draftData.debitAccount || !draftData.creditAccount) {
        setErrorMessage('借方と貸方の勘定科目を選択してください');
        return;
      }

      if (!draftData.debitAmount || !draftData.creditAmount) {
        setErrorMessage('借方と貸方の金額を入力してください');
        return;
      }

      if (parseInt(draftData.debitAmount) !== parseInt(draftData.creditAmount)) {
        setErrorMessage('借方と貸方の金額が一致していません');
        return;
      }

      const problem = {
        id: Date.now(),
        type: 'given',
        text: draftData.problemText,
        debit: { account: draftData.debitAccount, amount: parseInt(draftData.debitAmount) },
        credit: { account: draftData.creditAccount, amount: parseInt(draftData.creditAmount) },
        createdAt: new Date().toISOString()
      };

      onSave(problem);
      resetDraft();
    } else {
      if (!draftData.freeAnswer.trim()) {
        setErrorMessage('回答を入力してください');
        return;
      }

      const problem = {
        id: Date.now(),
        type: 'free',
        text: draftData.problemText,
        answer: draftData.freeAnswer,
        createdAt: new Date().toISOString()
      };

      onSave(problem);
      resetDraft();
    }
  };

  const resetDraft = () => {
    onDraftChange({
      problemType: 'given',
      problemText: '',
      debitAccount: '',
      debitAmount: '10000',
      creditAccount: '',
      creditAmount: '10000',
      freeAnswer: ''
    });
    setErrorMessage('');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">問題を入力</h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">設問タイプ</label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="given"
                checked={draftData.problemType === 'given'}
                onChange={(e) => handleProblemTypeChange(e.target.value)}
                className="mr-2 w-4 h-4"
              />
              <span className="text-gray-700">与えられた選択肢から選ぶ</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="free"
                checked={draftData.problemType === 'free'}
                onChange={(e) => handleProblemTypeChange(e.target.value)}
                className="mr-2 w-4 h-4"
              />
              <span className="text-gray-700">自由記入</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">問題文</label>
          <textarea
            value={draftData.problemText}
            onChange={(e) => handleProblemTextChange(e.target.value)}
            className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例）諏訪商店が山口商店から現金１万円を借りて..."
          />
        </div>

        {draftData.problemType === 'given' ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-red-700 mb-3">借方（左側）</h3>
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">勘定科目</label>
                <select
                  value={draftData.debitAccount}
                  onChange={(e) => handleDebitAccountChange(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">金額</label>
                <input
                  type="number"
                  value={draftData.debitAmount}
                  onChange={(e) => handleDebitAmountChange(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                />
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-700 mb-3">貸方（右側）</h3>
              <div className="mb-3">
                <label className="block text-sm font-semibold mb-1">勘定科目</label>
                <select
                  value={draftData.creditAccount}
                  onChange={(e) => handleCreditAccountChange(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">金額</label>
                <input
                  type="number"
                  value={draftData.creditAmount}
                  onChange={(e) => handleCreditAmountChange(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">回答</label>
            <textarea
              value={draftData.freeAnswer}
              onChange={(e) => handleFreeAnswerChange(e.target.value)}
              className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="借方と貸方を自由に記入してください"
            />
          </div>
        )}

        <button
          onClick={validateAndSave}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} /> 回答を保存
        </button>
      </div>

      {errorMessage && (
        <ErrorDialog
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
    </>
  );
}
