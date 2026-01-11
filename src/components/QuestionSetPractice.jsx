import { useState, useMemo } from 'react';
import { ArrowLeft, Eye, EyeOff, Check, X, RotateCcw, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

export function QuestionSetPractice({ questionSet, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState({}); // { questionId: 'correct' | 'incorrect' }
  const [mode, setMode] = useState('practice'); // 'practice' | 'retry' | 'complete'
  const [retryQuestions, setRetryQuestions] = useState([]);

  // 現在の問題リスト（通常モード or 再挑戦モード）
  const questions = useMemo(() => {
    if (mode === 'retry') {
      return retryQuestions;
    }
    return questionSet.questions;
  }, [mode, retryQuestions, questionSet.questions]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(results).length;

  // 正解/不正解をマーク
  const markAnswer = (isCorrect) => {
    setResults({
      ...results,
      [currentQuestion.id]: isCorrect ? 'correct' : 'incorrect'
    });
    
    // 次の問題へ自動遷移
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // 最後の問題の場合、結果を確認
        checkCompletion();
      }
    }, 300);
  };

  // 完了チェック
  const checkCompletion = () => {
    const incorrectQuestions = questions.filter(q => results[q.id] === 'incorrect');
    
    // 現在の問題の結果も含めて再計算
    const allResults = { ...results, [currentQuestion.id]: results[currentQuestion.id] };
    const finalIncorrect = questions.filter(q => allResults[q.id] === 'incorrect');
    
    if (finalIncorrect.length > 0 || (mode === 'practice' && Object.keys(allResults).length === totalQuestions)) {
      setMode('complete');
    }
  };

  // 次の問題
  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  // 前の問題
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  // 再挑戦モードを開始
  const startRetry = () => {
    const incorrectIds = Object.entries(results)
      .filter(([_, result]) => result === 'incorrect')
      .map(([id]) => parseInt(id));
    
    const incorrectQuestions = questionSet.questions.filter(q => incorrectIds.includes(q.id));
    
    // シャッフル
    const shuffled = [...incorrectQuestions].sort(() => Math.random() - 0.5);
    
    setRetryQuestions(shuffled);
    setResults({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setMode('retry');
  };

  // 最初からやり直し
  const restart = () => {
    setResults({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setRetryQuestions([]);
    setMode('practice');
  };

  // 完了画面
  if (mode === 'complete') {
    const correctCount = Object.values(results).filter(r => r === 'correct').length;
    const incorrectCount = Object.values(results).filter(r => r === 'incorrect').length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Trophy size={64} className={`mx-auto mb-4 ${score >= 80 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h2 className="text-2xl font-bold mb-2">
            {mode === 'retry' ? '再挑戦完了！' : '練習完了！'}
          </h2>
          <p className="text-gray-600 mb-6">{questionSet.name}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">{score}%</p>
              <p className="text-sm text-gray-600">正答率</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-gray-600">正解</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-600">{incorrectCount}</p>
              <p className="text-sm text-gray-600">不正解</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {incorrectCount > 0 && (
              <button
                onClick={startRetry}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} /> 間違えた問題を再挑戦 ({incorrectCount}問)
              </button>
            )}
            <button
              onClick={restart}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              最初からやり直す
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              問題集一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{questionSet.name}</h2>
          <p className="text-sm text-gray-500">
            {mode === 'retry' ? '再挑戦モード' : '練習モード'}
          </p>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            問題 {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-sm text-gray-600">
            回答済み: {answeredCount} / {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {/* 問題 */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-semibold text-blue-600 mb-3">問題</h3>
          {currentQuestion.questionType === 'text' ? (
            <p className="text-lg whitespace-pre-wrap">{currentQuestion.questionText}</p>
          ) : (
            <img
              src={currentQuestion.questionImage}
              alt="問題"
              className="max-w-full max-h-64 mx-auto rounded-lg"
            />
          )}
        </div>

        {/* 回答 */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-green-600">回答</h3>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
              {showAnswer ? '隠す' : '表示'}
            </button>
          </div>

          {showAnswer ? (
            <div className="animate-fadeIn">
              {currentQuestion.answerType === 'text' ? (
                <p className="text-lg whitespace-pre-wrap">{currentQuestion.answerText}</p>
              ) : (
                <img
                  src={currentQuestion.answerImage}
                  alt="回答"
                  className="max-w-full max-h-64 mx-auto rounded-lg"
                />
              )}

              {/* 正解/不正解ボタン */}
              {!results[currentQuestion.id] && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => markAnswer(true)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <Check size={20} /> 正解
                  </button>
                  <button
                    onClick={() => markAnswer(false)}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    <X size={20} /> 不正解
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              「表示」をクリックして回答を確認
            </div>
          )}

          {/* 結果表示 */}
          {results[currentQuestion.id] && (
            <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
              results[currentQuestion.id] === 'correct'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {results[currentQuestion.id] === 'correct' ? '✓ 正解' : '✗ 不正解'}
            </div>
          )}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} /> 前へ
        </button>

        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setShowAnswer(false);
              }}
              className={`w-8 h-8 rounded-full text-sm font-semibold transition ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white'
                  : results[questions[idx].id] === 'correct'
                    ? 'bg-green-500 text-white'
                    : results[questions[idx].id] === 'incorrect'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={nextQuestion}
          disabled={currentIndex === totalQuestions - 1}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次へ <ChevronRight size={20} />
        </button>
      </div>

      {/* 完了ボタン */}
      {answeredCount === totalQuestions && (
        <button
          onClick={() => setMode('complete')}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          結果を見る
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
