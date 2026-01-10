import { useState } from 'react';
import { BookOpen, Plus, Home } from 'lucide-react';
import { ProblemInput } from './components/ProblemInput';
import { ProblemList } from './components/ProblemList';
import { ReviewModalGiven } from './components/ReviewModal/ReviewModalGiven';
import { ReviewModalFree } from './components/ReviewModal/ReviewModalFree';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useStorage } from './hooks/useStorage';
import { DEFAULT_DRAFT, STORAGE_KEYS } from './data/constants';
import './App.css';

function App() {
  const [problems, setProblems] = useStorage(STORAGE_KEYS.PROBLEMS, []);
  const [currentTab, setCurrentTab] = useState('input');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [draftData, setDraftData] = useStorage(STORAGE_KEYS.DRAFT, DEFAULT_DRAFT);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleAddProblem = (problem) => {
    setProblems([...problems, problem]);
    setCurrentTab('list');
  };

  const handleDeleteRequest = (id) => {
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      setProblems(problems.filter(p => p.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTargetId(null);
  };

  const handleViewProblem = (problem) => {
    setSelectedProblem(problem);
  };

  const handleDraftChange = (newDraft) => {
    setDraftData(newDraft);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen size={32} />
            簿記3級 学習支援アプリ
          </h1>
          <p className="text-blue-100 mt-1">仕訳問題の練習・管理</p>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex gap-6">
          <button
            onClick={() => setCurrentTab('input')}
            className={`py-4 px-2 font-semibold border-b-2 transition ${
              currentTab === 'input'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus size={18} className="inline mr-2" /> 問題入力
          </button>
          <button
            onClick={() => setCurrentTab('list')}
            className={`py-4 px-2 font-semibold border-b-2 transition ${
              currentTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home size={18} className="inline mr-2" /> 問題一覧 ({problems.length})
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentTab === 'input' && (
          <ProblemInput onSave={handleAddProblem} draftData={draftData} onDraftChange={handleDraftChange} />
        )}
        {currentTab === 'list' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">登録済み問題</h2>
            <ProblemList problems={problems} onView={handleViewProblem} onDelete={handleDeleteRequest} />
          </div>
        )}
      </div>

      {/* レビューモーダル */}
      {selectedProblem && (
        selectedProblem.type === 'given' ? (
          <ReviewModalGiven problem={selectedProblem} onClose={() => setSelectedProblem(null)} />
        ) : (
          <ReviewModalFree problem={selectedProblem} onClose={() => setSelectedProblem(null)} />
        )
      )}

      {/* 削除確認ダイアログ */}
      {deleteTargetId && (
        <ConfirmDialog
          message="この問題を削除してもよろしいですか？"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

export default App;