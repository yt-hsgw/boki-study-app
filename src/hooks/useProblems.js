import { useCallback, useMemo } from 'react';
import { useStorage } from './useStorage';
import { STORAGE_KEYS } from '../data/constants';
import { validateProblem } from '../utils/validators';

/**
 * 問題管理用カスタムフック
 * ビジネスロジックをUIから分離
 */
export function useProblems() {
  const [problems, setProblems] = useStorage(
    STORAGE_KEYS.PROBLEMS,
    [],
    { migrate: true }
  );

  /**
   * 問題を追加
   */
  const addProblem = useCallback((problemData) => {
    const { isValid, errors } = validateProblem(problemData);
    
    if (!isValid) {
      return { success: false, errors };
    }
    
    const newProblem = {
      id: Date.now(),
      type: problemData.problemType,
      text: problemData.problemText,
      createdAt: new Date().toISOString(),
      _version: 2,
    };
    
    if (problemData.problemType === 'given') {
      const validDebits = problemData.debits.filter(d => d.account && d.amount);
      const validCredits = problemData.credits.filter(c => c.account && c.amount);
      
      newProblem.debits = validDebits.map(d => ({
        account: d.account,
        amount: parseInt(d.amount)
      }));
      newProblem.credits = validCredits.map(c => ({
        account: c.account,
        amount: parseInt(c.amount)
      }));
    } else {
      newProblem.answer = problemData.freeAnswer;
    }
    
    setProblems(prev => [...prev, newProblem]);
    
    return { success: true, problem: newProblem };
  }, [setProblems]);

  /**
   * 問題を削除
   */
  const deleteProblem = useCallback((id) => {
    setProblems(prev => prev.filter(p => p.id !== id));
  }, [setProblems]);

  /**
   * 問題を更新
   */
  const updateProblem = useCallback((id, updates) => {
    setProblems(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, [setProblems]);

  /**
   * 問題を取得
   */
  const getProblem = useCallback((id) => {
    return problems.find(p => p.id === id) || null;
  }, [problems]);

  /**
   * 統計情報
   */
  const stats = useMemo(() => {
    const total = problems.length;
    const givenCount = problems.filter(p => p.type === 'given').length;
    const freeCount = problems.filter(p => p.type === 'free').length;
    
    return {
      total,
      givenCount,
      freeCount,
    };
  }, [problems]);

  return {
    problems,
    addProblem,
    deleteProblem,
    updateProblem,
    getProblem,
    stats,
  };
}

export default useProblems;
