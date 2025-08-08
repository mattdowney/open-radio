'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface UIState {
  isInitialLoad: boolean;
  isContentVisible: boolean;
  isUIReady: boolean;
  imageLoaded: boolean;
  isTrackLoaded: boolean;
  error: string | null;
  isInitialPlay: boolean;
}

export type UIAction =
  | { type: 'SET_INITIAL_LOAD'; payload: boolean }
  | { type: 'SET_CONTENT_VISIBLE'; payload: boolean }
  | { type: 'SET_UI_READY'; payload: boolean }
  | { type: 'SET_IMAGE_LOADED'; payload: boolean }
  | { type: 'SET_TRACK_LOADED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_INITIAL_PLAY'; payload: boolean }
  | { type: 'RESET_UI' };

const initialUIState: UIState = {
  isInitialLoad: true,
  isContentVisible: false,
  isUIReady: false,
  imageLoaded: false,
  isTrackLoaded: false,
  error: null,
  isInitialPlay: true,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_INITIAL_LOAD':
      return { ...state, isInitialLoad: action.payload };
    
    case 'SET_CONTENT_VISIBLE':
      return { ...state, isContentVisible: action.payload };
    
    case 'SET_UI_READY':
      return { ...state, isUIReady: action.payload };
    
    case 'SET_IMAGE_LOADED':
      return { ...state, imageLoaded: action.payload };
    
    case 'SET_TRACK_LOADED':
      return { ...state, isTrackLoaded: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_INITIAL_PLAY':
      return { ...state, isInitialPlay: action.payload };
    
    case 'RESET_UI':
      return { ...initialUIState };
    
    default:
      return state;
  }
}

interface UIContextType {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
  // UI helper methods
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setContentReady: () => void;
  handleImageLoad: () => void;
  handleTrackLoad: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
    if (error) {
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_ERROR' });
      }, 5000);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_INITIAL_LOAD', payload: loading });
  };

  const setContentReady = () => {
    dispatch({ type: 'SET_CONTENT_VISIBLE', payload: true });
    dispatch({ type: 'SET_UI_READY', payload: true });
    dispatch({ type: 'SET_INITIAL_LOAD', payload: false });
  };

  const handleImageLoad = () => {
    dispatch({ type: 'SET_IMAGE_LOADED', payload: true });
  };

  const handleTrackLoad = () => {
    dispatch({ type: 'SET_TRACK_LOADED', payload: true });
    dispatch({ type: 'SET_INITIAL_PLAY', payload: false });
  };

  const value: UIContextType = {
    state,
    dispatch,
    setError,
    clearError,
    setLoading,
    setContentReady,
    handleImageLoad,
    handleTrackLoad,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}