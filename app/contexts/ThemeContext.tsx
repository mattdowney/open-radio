'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';

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
      primary: '#F4C430',
      secondary: '#EC5F67',
      background: '#AB47A6',
      surface: '#C855B0',
      text: '#F4C430',
      textSecondary: '#F4C43080',
      accent: '#EC5F67',
      vinyl: '#8B3A8F',
      cd: '#F4C430',
      visualizerGlow: '#EC5F67',
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
      primary: '#00BCD4',
      secondary: '#2962FF',
      background: '#0D1B4C',
      surface: '#1A2A5C',
      text: '#00BCD4',
      textSecondary: '#00BCD480',
      accent: '#2962FF',
      vinyl: '#0A1539',
      cd: '#00BCD4',
      visualizerGlow: '#2962FF',
    },
    animations: {
      transitionDuration: '600ms',
      vinylSpeed: '3s',
      cdSpeed: '1.5s',
    },
  },
  vaporwave: {
    id: 'vaporwave',
    name: 'Vaporwave',
    colors: {
      primary: '#FF6EC7',
      secondary: '#4ECDC4',
      background: '#0D0D0D',
      surface: '#1A1A1A',
      text: '#FF6EC7',
      textSecondary: '#FF6EC780',
      accent: '#5A5FCC',
      vinyl: '#000000',
      cd: '#4ECDC4',
      visualizerGlow: '#5A5FCC',
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
  previewTheme: Theme | null;
  isTransitioning: boolean;
};

type ThemeAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_PREVIEW_THEME'; payload: Theme | null }
  | { type: 'SET_TRANSITIONING'; payload: boolean };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        currentTheme: action.payload,
        previewTheme: null, // Clear preview when theme is set
      };
    case 'SET_PREVIEW_THEME':
      return {
        ...state,
        previewTheme: action.payload,
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
  previewTheme: (theme: Theme | null) => void;
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
    previewTheme: null,
    isTransitioning: false,
  });
  const clearPreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    // Use preview theme if available, otherwise use current theme
    const theme = state.previewTheme || state.currentTheme;

    // Add transitioning class for smooth theme changes
    document.body.classList.add('theme-transitioning');

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
    document.body.classList.add(`theme-${theme.id}`, 'theme-transitioning');

    // Remove transitioning class after transition completes
    const transitionDuration = parseInt(theme.animations.transitionDuration) || 300;
    const timeoutId = setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, transitionDuration);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state.currentTheme, state.previewTheme]);

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

  const previewTheme = (theme: Theme | null) => {
    // Clear any existing timeout
    if (clearPreviewTimeoutRef.current) {
      clearTimeout(clearPreviewTimeoutRef.current);
      clearPreviewTimeoutRef.current = null;
    }

    if (theme) {
      // Immediately set preview theme
      dispatch({ type: 'SET_PREVIEW_THEME', payload: theme });
    } else {
      // Add small delay before clearing to prevent flashing
      clearPreviewTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SET_PREVIEW_THEME', payload: null });
        clearPreviewTimeoutRef.current = null;
      }, 100); // 100ms delay
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        state,
        switchTheme,
        previewTheme,
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
