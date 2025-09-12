'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { VisualizerType, Visualizer, VisualizerContextType } from '../types/visualizer';
import { VinylRecord } from '../components/visualization/VinylRecord';
import { CDVisualizer } from '../components/visualization/CDVisualizer';

const availableVisualizers: Visualizer[] = [
  {
    type: 'vinyl',
    name: 'Vinyl Record',
    description: 'Classic vinyl record with spinning grooves',
    component: VinylRecord,
  },
  {
    type: 'cd',
    name: 'Compact Disc',
    description: 'Reflective CD with album artwork',
    component: CDVisualizer,
  },
];

type VisualizerState = {
  currentVisualizer: VisualizerType;
  isTransitioning: boolean;
};

type VisualizerAction =
  | { type: 'SET_VISUALIZER'; payload: VisualizerType }
  | { type: 'SET_TRANSITIONING'; payload: boolean };

const visualizerReducer = (state: VisualizerState, action: VisualizerAction): VisualizerState => {
  switch (action.type) {
    case 'SET_VISUALIZER':
      return {
        ...state,
        currentVisualizer: action.payload,
      };
    case 'SET_TRANSITIONING':
      return {
        ...state,
        isTransitioning: action.payload,
      };
    default:
      return state;
  }
};

const VisualizerContext = createContext<VisualizerContextType | null>(null);

// Load visualizer preference from localStorage
const getInitialVisualizer = (): VisualizerType => {
  if (typeof window !== 'undefined') {
    const savedVisualizer = localStorage.getItem('radio-visualizer');
    if (savedVisualizer && availableVisualizers.some((v) => v.type === savedVisualizer)) {
      return savedVisualizer as VisualizerType;
    }
  }
  return 'vinyl'; // Default visualizer
};

export function VisualizerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(visualizerReducer, {
    currentVisualizer: getInitialVisualizer(),
    isTransitioning: false,
  });

  // Save to localStorage when visualizer changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('radio-visualizer', state.currentVisualizer);
    }
  }, [state.currentVisualizer]);

  const switchVisualizer = async (type: VisualizerType) => {
    if (!availableVisualizers.some((v) => v.type === type) || state.isTransitioning) {
      return;
    }

    if (state.currentVisualizer === type) {
      return; // Already using this visualizer
    }

    dispatch({ type: 'SET_TRANSITIONING', payload: true });

    // Short delay for smooth transitions
    setTimeout(() => {
      dispatch({ type: 'SET_VISUALIZER', payload: type });

      // End transition after visualizer is changed
      setTimeout(() => {
        dispatch({ type: 'SET_TRANSITIONING', payload: false });
      }, 100);
    }, 150);
  };

  return (
    <VisualizerContext.Provider
      value={{
        currentVisualizer: state.currentVisualizer,
        availableVisualizers,
        switchVisualizer,
        isTransitioning: state.isTransitioning,
      }}
    >
      {children}
    </VisualizerContext.Provider>
  );
}

export function useVisualizer() {
  const context = useContext(VisualizerContext);
  if (!context) {
    throw new Error('useVisualizer must be used within a VisualizerProvider');
  }
  return context;
}
