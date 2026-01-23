import { useState, useRef } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Image, Type, ChevronUp, ChevronDown } from 'lucide-react';
import { DEFAULT_QUESTION, DEFAULT_QUESTION_SET, IMAGE_CONFIG } from '../data/constants';

export function QuestionSetEditor({ questionSet, onSave, onCancel }) {
  const [formData, setFormData] = useState(() => {
    if (questionSet) {
      return { ...questionSet };
    }
    return {
      ...DEFAULT_QUESTION_SET,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
  });
  const [errors, setErrors] = useState({});
  const fileInputRefs = useRef({});

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
    if (errors.name) setErrors({ ...errors, name: null });
  };

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
  };

  // 問題の追加
  const addQuestion = () => {
    const newQuestion = {
      ...DEFAULT_QUESTION,
      id: Date.now()
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  // 問題の削除
  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  // 問題の順番変更
  const moveQuestion = (index, direction) => {
    const newQuestions = [...formData.questions];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setFormData({ ...formData, questions: newQuestions });
  };

  // 問題の更新
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  // 画像アップロード処理
  const handleImageUpload = (index, field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // MIMEタイプの検証
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      alert('許可されていないファイル形式です');
      return;
    }

    // ファイルサイズチェック
    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      alert('画像サイズは5MB以下にしてください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateQuestion(index, field, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 画像削除
  const removeImage = (index, field) => {
    updateQuestion(index, field, null);
  };

  // 保存
  const handleSubmit = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '問題集の名前を入力してください';
    }

    if (formData.questions.length === 0) {
      newErrors.questions = '最低1つの問題を追加してください';
    } else {
      // 各問題の検証
      formData.questions.forEach((q, i) => {
        if (q.questionType === 'text' && !q.questionText.trim()) {
          newErrors[`question_${i}`] = '問題文を入力してください';
        }
        if (q.questionType === 'image' && !q.questionImage) {
          newErrors[`question_${i}`] = '問題の画像をアップロードしてください';
        }
        if (q.answerType === 'text' && !q.answerText.trim()) {
          newErrors[`answer_${i}`] = '回答を入力してください';
        }
        if (q.answerType === 'image' && !q.answerImage) {
          newErrors[`answer_${i}`] = '回答の画像をアップロードしてください';
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">
          {questionSet ? '問題集を編集' : '新しい問題集を作成'}
        </h2>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">基本情報</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            問題集の名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : ''
            }`}
            placeholder="例）簿記3級 仕訳問題集"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">説明（任意）</label>
          <textarea
            value={formData.description}
            onChange={handleDescriptionChange}
            className="w-full border rounded-lg p-3 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="問題集の説明を入力（任意）"
          />
        </div>
      </div>

      {/* 問題一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h3 className="font-bold text-lg">問題一覧 ({formData.questions.length}問)</h3>
        </div>

        {errors.questions && (
          <p className="text-red-500 text-sm mb-4">{errors.questions}</p>
        )}

        {formData.questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg mb-4">
            問題がまだありません
          </div>
        ) : (
          <div className="space-y-6 mb-4">
            {formData.questions.map((question, index) => (
              <div
                key={question.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                {/* 問題ヘッダー */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-blue-600">問題 {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveQuestion(index, -1)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="上に移動"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => moveQuestion(index, 1)}
                      disabled={index === formData.questions.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="下に移動"
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                      title="削除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 問題入力 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold">問題</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateQuestion(index, 'questionType', 'text')}
                          className={`p-1 rounded ${
                            question.questionType === 'text'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          title="テキスト"
                        >
                          <Type size={16} />
                        </button>
                        <button
                          onClick={() => updateQuestion(index, 'questionType', 'image')}
                          className={`p-1 rounded ${
                            question.questionType === 'image'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          title="画像"
                        >
                          <Image size={16} />
                        </button>
                      </div>
                    </div>

                    {question.questionType === 'text' ? (
                      <textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                        className={`w-full border rounded-lg p-2 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`question_${index}`] ? 'border-red-500' : ''
                        }`}
                        placeholder="問題文を入力..."
                      />
                    ) : (
                      <div className="border rounded-lg p-2 bg-white">
                        {question.questionImage ? (
                          <div className="relative">
                            <img
                              src={question.questionImage}
                              alt="問題画像"
                              className="max-h-32 mx-auto rounded"
                            />
                            <button
                              onClick={() => removeImage(index, 'questionImage')}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="block cursor-pointer text-center py-4">
                            <Image size={32} className="mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">クリックして画像をアップロード</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(index, 'questionImage', e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}
                    {errors[`question_${index}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`question_${index}`]}</p>
                    )}
                  </div>

                  {/* 回答入力 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold">回答</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateQuestion(index, 'answerType', 'text')}
                          className={`p-1 rounded ${
                            question.answerType === 'text'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          title="テキスト"
                        >
                          <Type size={16} />
                        </button>
                        <button
                          onClick={() => updateQuestion(index, 'answerType', 'image')}
                          className={`p-1 rounded ${
                            question.answerType === 'image'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          title="画像"
                        >
                          <Image size={16} />
                        </button>
                      </div>
                    </div>

                    {question.answerType === 'text' ? (
                      <textarea
                        value={question.answerText}
                        onChange={(e) => updateQuestion(index, 'answerText', e.target.value)}
                        className={`w-full border rounded-lg p-2 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors[`answer_${index}`] ? 'border-red-500' : ''
                        }`}
                        placeholder="回答を入力..."
                      />
                    ) : (
                      <div className="border rounded-lg p-2 bg-white">
                        {question.answerImage ? (
                          <div className="relative">
                            <img
                              src={question.answerImage}
                              alt="回答画像"
                              className="max-h-32 mx-auto rounded"
                            />
                            <button
                              onClick={() => removeImage(index, 'answerImage')}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="block cursor-pointer text-center py-4">
                            <Image size={32} className="mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">クリックして画像をアップロード</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(index, 'answerImage', e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}
                    {errors[`answer_${index}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`answer_${index}`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 問題追加ボタン（下部に配置） */}
        <button
          onClick={addQuestion}
          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={20} /> 問題を追加
        </button>
      </div>

      {/* 保存ボタン */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Save size={20} /> 保存
        </button>
        <button
          onClick={onCancel}
          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
