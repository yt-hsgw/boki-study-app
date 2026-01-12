import { useCallback, useMemo } from 'react';
import { useStorage } from './useStorage';
import { STORAGE_KEYS } from '../data/constants';
import { validateQuestionSet } from '../utils/validators';

/**
 * 問題集管理用カスタムフック
 */
export function useQuestionSets() {
  const [questionSets, setQuestionSets] = useStorage(
    STORAGE_KEYS.QUESTION_SETS,
    []
  );

  /**
   * 問題集を保存（新規作成または更新）
   */
  const saveQuestionSet = useCallback((questionSet) => {
    const { isValid, errors } = validateQuestionSet(questionSet);
    
    if (!isValid) {
      return { success: false, errors };
    }
    
    const now = new Date().toISOString();
    const updatedSet = {
      ...questionSet,
      updatedAt: now,
    };
    
    setQuestionSets(prev => {
      const existingIndex = prev.findIndex(qs => qs.id === questionSet.id);
      
      if (existingIndex >= 0) {
        // 更新
        const newSets = [...prev];
        newSets[existingIndex] = updatedSet;
        return newSets;
      } else {
        // 新規追加
        return [...prev, { ...updatedSet, createdAt: now }];
      }
    });
    
    return { success: true, questionSet: updatedSet };
  }, [setQuestionSets]);

  /**
   * 問題集を削除
   */
  const deleteQuestionSet = useCallback((id) => {
    setQuestionSets(prev => prev.filter(qs => qs.id !== id));
  }, [setQuestionSets]);

  /**
   * 問題集を取得
   */
  const getQuestionSet = useCallback((id) => {
    return questionSets.find(qs => qs.id === id) || null;
  }, [questionSets]);

  /**
   * 問題集を複製
   */
  const duplicateQuestionSet = useCallback((id) => {
    const original = questionSets.find(qs => qs.id === id);
    if (!original) return null;
    
    const now = new Date().toISOString();
    const duplicated = {
      ...original,
      id: Date.now(),
      name: `${original.name} (コピー)`,
      createdAt: now,
      updatedAt: now,
      questions: original.questions.map(q => ({
        ...q,
        id: Date.now() + Math.random(),
      })),
    };
    
    setQuestionSets(prev => [...prev, duplicated]);
    
    return duplicated;
  }, [questionSets, setQuestionSets]);

  /**
   * 統計情報
   */
  const stats = useMemo(() => {
    const total = questionSets.length;
    const totalQuestions = questionSets.reduce(
      (sum, qs) => sum + (qs.questions?.length || 0),
      0
    );
    
    return {
      totalSets: total,
      totalQuestions,
    };
  }, [questionSets]);

  return {
    questionSets,
    saveQuestionSet,
    deleteQuestionSet,
    getQuestionSet,
    duplicateQuestionSet,
    stats,
  };
}

export default useQuestionSets;
