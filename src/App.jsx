import { useState, useCallback } from 'react';
import { BookOpen, Plus, Home, FolderOpen } from 'lucide-react';
import { ProblemInput } from './components/ProblemInput';
import { ProblemList } from './components/ProblemList';
import { ReviewModalGiven } from './components/ReviewModal/ReviewModalGiven';
import { ReviewModalFree } from './components/ReviewModal/ReviewModalFree';
import { ConfirmDialog } from './components/ConfirmDialog';
import { GlossaryPanel } from './components/GlossaryPanel';
import { CalculatorWidget } from './components/CalculatorWidget';
import { QuestionSetManager } from './components/QuestionSetManager';
import { useStorage } from './hooks/useStorage';
import { DEFAULT_DRAFT, STORAGE_KEYS } from './data/constants';
import './App.css';

/**
 * メインアプリケーションコンポーネント
 */
function App() {
  // ストレージフック（マイグレーション対応）
  const [problems, setProblems] = useStorage(
    STORAGE_KEYS.PROBLEMS, 
    [], 
    { migrate: true }
  );
  const [questionSets, setQuestionSets] = useStorage(
    STORAGE_KEYS.QUESTION_SETS, 
    []
  );
  const [draftData, setDraftData] = useStorage(
    STORAGE_KEYS.DRAFT, 
    DEFAULT_DRAFT,
    { migrate: true }
  );

  // UI状態
  const [currentTab, setCurrentTab] = useState('input');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  /**
   * 問題を追加
   */
  const handleAddProblem = useCallback((problem) => {
    setProblems(prev => [...prev, problem]);
    setCurrentTab('list');
  }, [setProblems]);

  /**
   * 問題の削除リクエスト
   */
  const handleDeleteRequest = useCallback((id) => {
    setDeleteTargetId(id);
  }, []);

  /**
   * 削除を確定
   */
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTargetId) {
      setProblems(prev => prev.filter(p => p.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, setProblems]);

  /**
   * 削除をキャンセル
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  /**
   * 問題を表示
   */
  const handleViewProblem = useCallback((problem) => {
    setSelectedProblem(problem);
  }, []);

  /**
   * モーダルを閉じる
   */
  const handleCloseModal = useCallback(() => {
    setSelectedProblem(null);
  }, []);

  /**
   * 下書きを更新
   */
  const handleDraftChange = useCallback((newDraft) => {
    setDraftData(newDraft);
  }, [setDraftData]);

  /**
   * 問題集を保存
   */
  const handleSaveQuestionSet = useCallback((questionSet) => {
    setQuestionSets(prev => {
      const existingIndex = prev.findIndex(qs => qs.id === questionSet.id);
      if (existingIndex >= 0) {
        const newSets = [...prev];
        newSets[existingIndex] = questionSet;
        return newSets;
      }
      return [...prev, questionSet];
    });
  }, [setQuestionSets]);

  /**
   * 問題集を削除
   */
  const handleDeleteQuestionSet = useCallback((id) => {
    setQuestionSets(prev => prev.filter(qs => qs.id !== id));
  }, [setQuestionSets]);

  /**
   * タブを切り替え
   */
  const handleTabChange = useCallback((tab) => {
    setCurrentTab(tab);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen size={32} aria-hidden="true" />
            簿記3級 学習支援アプリ
          </h1>
          <p className="text-blue-100 mt-1">仕訳問題の練習・管理</p>
        </div>
      </header>

      {/* タブナビゲーション */}
      <nav className="bg-white border-b shadow-sm" aria-label="メインナビゲーション">
        <div className="max-w-4xl mx-auto px-4 flex gap-4">
          <TabButton
            isActive={currentTab === 'input'}
            onClick={() => handleTabChange('input')}
            icon={<Plus size={18} />}
            label="問題入力"
          />
          <TabButton
            isActive={currentTab === 'list'}
            onClick={() => handleTabChange('list')}
            icon={<Home size={18} />}
            label={`問題一覧 (${problems.length})`}
          />
          <TabButton
            isActive={currentTab === 'questionSets'}
            onClick={() => handleTabChange('questionSets')}
            icon={<FolderOpen size={18} />}
            label={`問題集 (${questionSets.length})`}
          />
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentTab === 'input' && (
          <ProblemInput 
            onSave={handleAddProblem} 
            draftData={draftData} 
            onDraftChange={handleDraftChange} 
          />
        )}
        
        {currentTab === 'list' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">登録済み問題</h2>
            <ProblemList 
              problems={problems} 
              onView={handleViewProblem} 
              onDelete={handleDeleteRequest} 
            />
          </section>
        )}
        
        {currentTab === 'questionSets' && (
          <QuestionSetManager
            questionSets={questionSets}
            onSave={handleSaveQuestionSet}
            onDelete={handleDeleteQuestionSet}
          />
        )}
      </main>

      {/* 用語集パネル */}
      <GlossaryPanel />

      {/* レビューモーダル */}
      {selectedProblem && (
        selectedProblem.type === 'given' ? (
          <ReviewModalGiven 
            problem={selectedProblem} 
            onClose={handleCloseModal} 
          />
        ) : (
          <ReviewModalFree 
            problem={selectedProblem} 
            onClose={handleCloseModal} 
          />
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

      {/* 電卓ウィジェット */}
      <CalculatorWidget />
    </div>
  );
}

/**
 * タブボタンコンポーネント
 */
function TabButton({ isActive, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-2 font-semibold border-b-2 transition flex items-center gap-1 ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      {label}
    </button>
  );
}

export default App;
