'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    vinyl: string;
    cd: string;
    visualizerGlow: string;
  };
  animations: {
    transitionDuration: string;
    vinylSpeed: string;
    cdSpeed: string;
  };
}

export const themes: Record<string, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#FBFBFB',
      secondary: '#FF65D2',
      background: '#00020B',
      surface: '#2E2F35',
      text: '#FBFBFB',
      textSecondary: '#FBFBFB80',
      accent: '#FF5101',
      vinyl: '#1A1A1A',
      cd: '#C0C0C0',
      visualizerGlow: '#FF65D2',
    },
    animations: {
      transitionDuration: '300ms',
      vinylSpeed: '2s',
      cdSpeed: '1s',
    },
  },
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#00020B',
      secondary: '#FF65D2',
      background: '#FBFBFB',
      surface: '#F0F0F0',
      text: '#00020B',
      textSecondary: '#00020B80',
      accent: '#FF5101',
      vinyl: '#2A2A2A',
      cd: '#E8E8E8',
      visualizerGlow: '#002EFF',
    },
    animations: {
      transitionDuration: '300ms',
      vinylSpeed: '2s',
      cdSpeed: '1s',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#FFF200',
      secondary: '#FF5101',
      background: '#2E1065',
      surface: '#4A1A69',
      text: '#FFF200',
      textSecondary: '#FFF20080',
      accent: '#FF65D2',
      vinyl: '#1A0E2E',
      cd: '#FFB347',
      visualizerGlow: '#FF5101',
    },
    animations: {
      transitionDuration: '450ms',
      vinylSpeed: '2.5s',
      cdSpeed: '1.2s',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#5EEDA1',
      secondary: '#002EFF',
      background: '#0A192F',
      surface: '#172A45',
      text: '#5EEDA1',
      textSecondary: '#5EEDA180',
      accent: '#64FFDA',
      vinyl: '#0F2027',
      cd: '#4A90E2',
      visualizerGlow: '#64FFDA',
    },
    animations: {
      transitionDuration: '600ms',
      vinylSpeed: '3s',
      cdSpeed: '1.5s',
    },
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    colors: {
      primary: '#FF65D2',
      secondary: '#FFF200',
      background: '#0D0D0D',
      surface: '#1A1A1A',
      text: '#FF65D2',
      textSecondary: '#FF65D280',
      accent: '#00FFFF',
      vinyl: '#000000',
      cd: '#FF1493',
      visualizerGlow: '#00FFFF',
    },
    animations: {
      transitionDuration: '200ms',
      vinylSpeed: '1.5s',
      cdSpeed: '0.8s',
    },
  },
};

type ThemeState = {
  currentTheme: Theme;
  isTransitioning: boolean;
};

type ThemeAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_TRANSITIONING'; payload: boolean };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        currentTheme: action.payload,
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

const ThemeContext = createContext<{
  state: ThemeState;
  switchTheme: (themeId: string) => void;
  availableThemes: Theme[];
} | null>(null);

// Load theme preference from localStorage
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedThemeId = localStorage.getItem('radio-theme');
    if (savedThemeId && themes[savedThemeId]) {
      return themes[savedThemeId];
    }
  }
  return themes.dark; // Default theme
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, {
    currentTheme: getInitialTheme(),
    isTransitioning: false,
  });

  // Apply CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const theme = state.currentTheme;

    // Set color CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Set animation CSS variables
    Object.entries(theme.animations).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);
  }, [state.currentTheme]);

  const switchTheme = async (themeId: string) => {
    if (!themes[themeId] || state.isTransitioning) return;

    dispatch({ type: 'SET_TRANSITIONING', payload: true });

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('radio-theme', themeId);
    }

    // Short delay for smooth transitions
    setTimeout(() => {
      dispatch({ type: 'SET_THEME', payload: themes[themeId] });

      // End transition after CSS variables are applied
      setTimeout(() => {
        dispatch({ type: 'SET_TRANSITIONING', payload: false });
      }, 100);
    }, 50);
  };

  return (
    <ThemeContext.Provider
      value={{
        state,
        switchTheme,
        availableThemes: Object.values(themes),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
