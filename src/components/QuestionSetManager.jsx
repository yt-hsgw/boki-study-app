import { useState } from 'react';
import { Plus, BookOpen, Play, Edit2, Trash2, FileText } from 'lucide-react';
import { QuestionSetEditor } from './QuestionSetEditor';
import { QuestionSetPractice } from './QuestionSetPractice';
import { ConfirmDialog } from './ConfirmDialog';

export function QuestionSetManager({ questionSets, onSave, onDelete }) {
  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit' | 'practice'
  const [selectedSet, setSelectedSet] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleCreate = () => {
    setSelectedSet(null);
    setMode('create');
  };

  const handleEdit = (set) => {
    setSelectedSet(set);
    setMode('edit');
  };

  const handlePractice = (set) => {
    setSelectedSet(set);
    setMode('practice');
  };

  const handleSave = (questionSet) => {
    onSave(questionSet);
    setMode('list');
    setSelectedSet(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleBack = () => {
    setMode('list');
    setSelectedSet(null);
  };

  // 一覧表示
  if (mode === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">問題集</h2>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={20} /> 新規作成
          </button>
        </div>

        {questionSets.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">問題集がまだありません</p>
            <button
              onClick={handleCreate}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              最初の問題集を作成する
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {questionSets.map((set) => (
              <div
                key={set.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{set.name}</h3>
                    {set.description && (
                      <p className="text-gray-600 text-sm mt-1">{set.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {set.questions.length} 問
                      </span>
                      <span>
                        更新: {new Date(set.updatedAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePractice(set)}
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                      title="練習する"
                      disabled={set.questions.length === 0}
                    >
                      <Play size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(set)}
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                      title="編集"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(set.id)}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                      title="削除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteTargetId && (
          <ConfirmDialog
            message="この問題集を削除してもよろしいですか？"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTargetId(null)}
          />
        )}
      </div>
    );
  }

  // 作成・編集モード
  if (mode === 'create' || mode === 'edit') {
    return (
      <QuestionSetEditor
        questionSet={selectedSet}
        onSave={handleSave}
        onCancel={handleBack}
      />
    );
  }

  // 練習モード
  if (mode === 'practice') {
    return (
      <QuestionSetPractice
        questionSet={selectedSet}
        onBack={handleBack}
      />
    );
  }

  return null;
}
