import { createContext, useContext, useReducer, useCallback } from 'react';

/**
 * アプリケーション状態のContext
 */
const AppContext = createContext(null);

/**
 * 初期状態
 */
const initialState = {
  currentTab: 'input',
  selectedProblem: null,
  deleteTargetId: null,
  isLoading: false,
  error: null,
};

/**
 * アクションタイプ
 */
export const ActionTypes = {
  SET_TAB: 'SET_TAB',
  SET_SELECTED_PROBLEM: 'SET_SELECTED_PROBLEM',
  SET_DELETE_TARGET: 'SET_DELETE_TARGET',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

/**
 * Reducer
 */
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_TAB:
      return { ...state, currentTab: action.payload };
      
    case ActionTypes.SET_SELECTED_PROBLEM:
      return { ...state, selectedProblem: action.payload };
      
    case ActionTypes.SET_DELETE_TARGET:
      return { ...state, deleteTargetId: action.payload };
      
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
      
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
      
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

/**
 * AppProvider
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // アクションクリエイター
  const actions = {
    setTab: useCallback((tab) => {
      dispatch({ type: ActionTypes.SET_TAB, payload: tab });
    }, []),
    
    setSelectedProblem: useCallback((problem) => {
      dispatch({ type: ActionTypes.SET_SELECTED_PROBLEM, payload: problem });
    }, []),
    
    setDeleteTarget: useCallback((id) => {
      dispatch({ type: ActionTypes.SET_DELETE_TARGET, payload: id });
    }, []),
    
    clearDeleteTarget: useCallback(() => {
      dispatch({ type: ActionTypes.SET_DELETE_TARGET, payload: null });
    }, []),
    
    setLoading: useCallback((isLoading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
    }, []),
    
    setError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }, []),
    
    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }, []),
  };
  
  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * useAppContext hook
 */
export function useAppContext() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}

/**
 * 個別のセレクタフック
 */
export function useCurrentTab() {
  const { state, actions } = useAppContext();
  return [state.currentTab, actions.setTab];
}

export function useSelectedProblem() {
  const { state, actions } = useAppContext();
  return [state.selectedProblem, actions.setSelectedProblem];
}

export function useDeleteTarget() {
  const { state, actions } = useAppContext();
  return {
    deleteTargetId: state.deleteTargetId,
    setDeleteTarget: actions.setDeleteTarget,
    clearDeleteTarget: actions.clearDeleteTarget,
  };
}

export default AppContext;
