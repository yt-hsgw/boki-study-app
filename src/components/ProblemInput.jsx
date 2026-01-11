import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { ErrorDialog } from './ErrorDialog';
import { AccountCombobox } from './AccountCombobox';
import { DEFAULT_DRAFT } from '../data/constants';

export function ProblemInput({ onSave, draftData, onDraftChange }) {
  const [errorMessage, setErrorMessage] = useState('');

  // 下書きデータの互換性チェック（旧バージョンから新バージョンへの移行）
  const normalizedDraft = {
    ...DEFAULT_DRAFT,
    ...draftData,
    debits: draftData.debits || [{ account: draftData.debitAccount || '', amount: draftData.debitAmount || '' }],
    credits: draftData.credits || [{ account: draftData.creditAccount || '', amount: draftData.creditAmount || '' }]
  };

  const handleProblemTypeChange = (newType) => {
    onDraftChange({ ...normalizedDraft, problemType: newType });
  };

  const handleProblemTextChange = (text) => {
    onDraftChange({ ...normalizedDraft, problemText: text });
  };

  // 借方の操作
  const handleDebitChange = (index, field, value) => {
    const newDebits = [...normalizedDraft.debits];
    newDebits[index] = { ...newDebits[index], [field]: value };
    onDraftChange({ ...normalizedDraft, debits: newDebits });
  };

  const addDebitRow = () => {
    onDraftChange({ 
      ...normalizedDraft, 
      debits: [...normalizedDraft.debits, { account: '', amount: '' }] 
    });
  };

  const removeDebitRow = (index) => {
    if (normalizedDraft.debits.length > 1) {
      const newDebits = normalizedDraft.debits.filter((_, i) => i !== index);
      onDraftChange({ ...normalizedDraft, debits: newDebits });
    }
  };

  // 貸方の操作
  const handleCreditChange = (index, field, value) => {
    const newCredits = [...normalizedDraft.credits];
    newCredits[index] = { ...newCredits[index], [field]: value };
    onDraftChange({ ...normalizedDraft, credits: newCredits });
  };

  const addCreditRow = () => {
    onDraftChange({ 
      ...normalizedDraft, 
      credits: [...normalizedDraft.credits, { account: '', amount: '' }] 
    });
  };

  const removeCreditRow = (index) => {
    if (normalizedDraft.credits.length > 1) {
      const newCredits = normalizedDraft.credits.filter((_, i) => i !== index);
      onDraftChange({ ...normalizedDraft, credits: newCredits });
    }
  };

  const handleFreeAnswerChange = (answer) => {
    onDraftChange({ ...normalizedDraft, freeAnswer: answer });
  };

  // 合計計算
  const debitTotal = normalizedDraft.debits.reduce((sum, d) => sum + (parseInt(d.amount) || 0), 0);
  const creditTotal = normalizedDraft.credits.reduce((sum, c) => sum + (parseInt(c.amount) || 0), 0);
  const isBalanced = debitTotal === creditTotal && debitTotal > 0;

  const validateAndSave = () => {
    if (!normalizedDraft.problemText.trim()) {
      setErrorMessage('問題文を入力してください');
      return;
    }

    if (normalizedDraft.problemType === 'given') {
      // 借方チェック
      const validDebits = normalizedDraft.debits.filter(d => d.account && d.amount);
      if (validDebits.length === 0) {
        setErrorMessage('借方の勘定科目と金額を入力してください');
        return;
      }

      // 貸方チェック
      const validCredits = normalizedDraft.credits.filter(c => c.account && c.amount);
      if (validCredits.length === 0) {
        setErrorMessage('貸方の勘定科目と金額を入力してください');
        return;
      }

      // 貸借一致チェック
      if (!isBalanced) {
        setErrorMessage(`借方合計（${debitTotal.toLocaleString()}円）と貸方合計（${creditTotal.toLocaleString()}円）が一致していません`);
        return;
      }

      const problem = {
        id: Date.now(),
        type: 'given',
        text: normalizedDraft.problemText,
        debits: validDebits.map(d => ({ account: d.account, amount: parseInt(d.amount) })),
        credits: validCredits.map(c => ({ account: c.account, amount: parseInt(c.amount) })),
        createdAt: new Date().toISOString()
      };

      onSave(problem);
      resetDraft();
    } else {
      if (!normalizedDraft.freeAnswer.trim()) {
        setErrorMessage('回答を入力してください');
        return;
      }

      const problem = {
        id: Date.now(),
        type: 'free',
        text: normalizedDraft.problemText,
        answer: normalizedDraft.freeAnswer,
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
      debits: [{ account: '', amount: '' }],
      credits: [{ account: '', amount: '' }],
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
                checked={normalizedDraft.problemType === 'given'}
                onChange={(e) => handleProblemTypeChange(e.target.value)}
                className="mr-2 w-4 h-4"
              />
              <span className="text-gray-700">与えられた選択肢から選ぶ</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="free"
                checked={normalizedDraft.problemType === 'free'}
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
            value={normalizedDraft.problemText}
            onChange={(e) => handleProblemTextChange(e.target.value)}
            className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例）諏訪商店が山口商店から現金１万円を借りて..."
          />
        </div>

        {normalizedDraft.problemType === 'given' ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* 借方 */}
              <div className="border-l-4 border-red-500 pl-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-red-700">借方（左側）</h3>
                  <button
                    type="button"
                    onClick={addDebitRow}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} /> 行を追加
                  </button>
                </div>
                
                {normalizedDraft.debits.map((debit, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-end">
                    <div className="flex-1">
                      {index === 0 && <label className="block text-xs font-medium mb-1 text-gray-600">勘定科目</label>}
                      <AccountCombobox
                        value={debit.account}
                        onChange={(value) => handleDebitChange(index, 'account', value)}
                        placeholder="勘定科目を入力"
                        color="red"
                      />
                    </div>
                    <div className="w-28">
                      {index === 0 && <label className="block text-xs font-medium mb-1 text-gray-600">金額</label>}
                      <input
                        type="number"
                        value={debit.amount}
                        onChange={(e) => handleDebitChange(index, 'amount', e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="金額"
                      />
                    </div>
                    {normalizedDraft.debits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDebitRow(index)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="text-right text-sm font-semibold text-red-700 mt-2 border-t pt-2">
                  合計: {debitTotal.toLocaleString()} 円
                </div>
              </div>

              {/* 貸方 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-700">貸方（右側）</h3>
                  <button
                    type="button"
                    onClick={addCreditRow}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} /> 行を追加
                  </button>
                </div>
                
                {normalizedDraft.credits.map((credit, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-end">
                    <div className="flex-1">
                      {index === 0 && <label className="block text-xs font-medium mb-1 text-gray-600">勘定科目</label>}
                      <AccountCombobox
                        value={credit.account}
                        onChange={(value) => handleCreditChange(index, 'account', value)}
                        placeholder="勘定科目を入力"
                        color="blue"
                      />
                    </div>
                    <div className="w-28">
                      {index === 0 && <label className="block text-xs font-medium mb-1 text-gray-600">金額</label>}
                      <input
                        type="number"
                        value={credit.amount}
                        onChange={(e) => handleCreditChange(index, 'amount', e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="金額"
                      />
                    </div>
                    {normalizedDraft.credits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCreditRow(index)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="text-right text-sm font-semibold text-blue-700 mt-2 border-t pt-2">
                  合計: {creditTotal.toLocaleString()} 円
                </div>
              </div>
            </div>

            {/* 貸借バランス表示 */}
            <div className={`text-center py-2 px-4 rounded-lg mb-4 ${
              debitTotal === 0 && creditTotal === 0 
                ? 'bg-gray-100 text-gray-500' 
                : isBalanced 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
            }`}>
              {debitTotal === 0 && creditTotal === 0 
                ? '金額を入力してください' 
                : isBalanced 
                  ? '✓ 貸借一致' 
                  : `⚠ 差額: ${Math.abs(debitTotal - creditTotal).toLocaleString()} 円`
              }
            </div>
          </>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">回答</label>
            <textarea
              value={normalizedDraft.freeAnswer}
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
          <Save size={20} /> 問題を保存
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
