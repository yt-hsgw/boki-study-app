import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, Check, X, RotateCcw, Trophy, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

/**
 * 問題集練習コンポーネント
 * 関数型更新を使用して競合状態を回避
 */
export function QuestionSetPractice({ questionSet, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState({});
  const [mode, setMode] = useState('practice'); // 'practice' | 'retry' | 'complete'
  const [retryQuestions, setRetryQuestions] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  // タイマーIDを保持（クリーンアップ用）
  const timerRef = useRef(null);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // 現在の問題リスト（メモ化）
  const questions = useMemo(() => {
    if (mode === 'retry') {
      return retryQuestions;
    }
    return questionSet.questions;
  }, [mode, retryQuestions, questionSet.questions]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(results).length;

  /**
   * 正解/不正解をマーク（関数型更新で競合回避）
   */
  const markAnswer = useCallback((isCorrect) => {
    if (!currentQuestion) return;
    
    const questionId = currentQuestion.id;
    
    // 関数型更新で最新の状態を保証
    setResults(prevResults => ({
      ...prevResults,
      [questionId]: isCorrect ? 'correct' : 'incorrect'
    }));
    
    // 前のタイマーをクリア
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // 次の問題へ自動遷移
    timerRef.current = setTimeout(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex < totalQuestions - 1) {
          setShowAnswer(false);
          return prevIndex + 1;
        }
        // 最後の問題の場合
        setMode('complete');
        return prevIndex;
      });
    }, 300);
  }, [currentQuestion, totalQuestions]);

  /**
   * 次の問題へ
   */
  const nextQuestion = useCallback(() => {
    setCurrentIndex(prevIndex => {
      if (prevIndex < totalQuestions - 1) {
        setShowAnswer(false);
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [totalQuestions]);

  /**
   * 前の問題へ
   */
  const prevQuestion = useCallback(() => {
    setCurrentIndex(prevIndex => {
      if (prevIndex > 0) {
        setShowAnswer(false);
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  /**
   * 特定の問題へジャンプ
   */
  const goToQuestion = useCallback((index) => {
    setCurrentIndex(index);
    setShowAnswer(false);
  }, []);

  /**
   * 再挑戦モードを開始
   */
  const startRetry = useCallback(() => {
    const incorrectIds = Object.entries(results)
      .filter(([_, result]) => result === 'incorrect')
      .map(([id]) => parseInt(id));
    
    const incorrectQuestions = questionSet.questions.filter(q => 
      incorrectIds.includes(q.id)
    );
    
    // Fisher-Yatesシャッフル（より公平なランダム化）
    const shuffled = [...incorrectQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setRetryQuestions(shuffled);
    setResults({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setMode('retry');
  }, [results, questionSet.questions]);

  /**
   * 最初からやり直し
   */
  const restart = useCallback(() => {
    setResults({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setRetryQuestions([]);
    setMode('practice');
  }, []);

  /**
   * 画像の拡大表示
   */
  const openZoom = useCallback((imageSrc) => {
    setZoomedImage(imageSrc);
  }, []);

  const closeZoom = useCallback(() => {
    setZoomedImage(null);
  }, []);

  // 結果の計算（メモ化）
  const resultStats = useMemo(() => {
    const correctCount = Object.values(results).filter(r => r === 'correct').length;
    const incorrectCount = Object.values(results).filter(r => r === 'incorrect').length;
    const score = totalQuestions > 0 
      ? Math.round((correctCount / totalQuestions) * 100) 
      : 0;
    
    return { correctCount, incorrectCount, score };
  }, [results, totalQuestions]);

  // 完了画面
  if (mode === 'complete') {
    const { correctCount, incorrectCount, score } = resultStats;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Trophy 
            size={64} 
            className={`mx-auto mb-4 ${score >= 80 ? 'text-yellow-500' : 'text-gray-400'}`} 
            aria-hidden="true"
          />
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

  // 問題がない場合のフォールバック
  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-gray-500">問題が見つかりません</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          戻る
        </button>
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
          aria-label="戻る"
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
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
            <div className="relative inline-block">
              <img
                src={currentQuestion.questionImage}
                alt="問題"
                className="max-w-full max-h-64 mx-auto rounded-lg cursor-pointer hover:opacity-90 transition"
                onClick={() => openZoom(currentQuestion.questionImage)}
              />
              <button
                onClick={() => openZoom(currentQuestion.questionImage)}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition shadow-md"
                title="拡大表示"
                aria-label="画像を拡大"
              >
                <ZoomIn size={18} />
              </button>
            </div>
          )}
        </div>

        {/* 回答 */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-green-600">回答</h3>
            <button
              onClick={() => setShowAnswer(prev => !prev)}
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
                <div className="relative inline-block">
                  <img
                    src={currentQuestion.answerImage}
                    alt="回答"
                    className="max-w-full max-h-64 mx-auto rounded-lg cursor-pointer hover:opacity-90 transition"
                    onClick={() => openZoom(currentQuestion.answerImage)}
                  />
                  <button
                    onClick={() => openZoom(currentQuestion.answerImage)}
                    className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition shadow-md"
                    title="拡大表示"
                    aria-label="画像を拡大"
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>
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

        <div className="flex gap-2 flex-wrap justify-center">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={`w-8 h-8 rounded-full text-sm font-semibold transition ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white'
                  : results[q.id] === 'correct'
                    ? 'bg-green-500 text-white'
                    : results[q.id] === 'incorrect'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={`問題${idx + 1}へ`}
              aria-current={idx === currentIndex ? 'true' : undefined}
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

      {/* 画像拡大モーダル */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={closeZoom}
          role="dialog"
          aria-label="画像拡大表示"
        >
          <div
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage}
              alt="拡大表示"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
            <button
              onClick={closeZoom}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition shadow-lg"
              title="閉じる"
              aria-label="閉じる"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionSetPractice;