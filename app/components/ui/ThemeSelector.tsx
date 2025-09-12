'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { Palette } from 'lucide-react';

export function ThemeSelector() {
  const { state, switchTheme, availableThemes } = useTheme();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
        style={{
          backgroundColor: 'var(--theme-surface)',
          color: 'var(--theme-text)',
        }}
        title="Switch Theme"
      >
        <Palette size={16} />
        <span className="hidden sm:inline text-sm font-medium">{state.currentTheme.name}</span>
      </button>

      <div
        className="absolute top-full right-0 mt-2 py-2 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
        style={{
          backgroundColor: 'var(--theme-surface)',
          border: '1px solid var(--theme-textSecondary)',
        }}
      >
        {availableThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => switchTheme(theme.id)}
            className={`block w-full text-left px-4 py-2 text-sm hover:scale-105 transition-all duration-200 ${
              state.currentTheme.id === theme.id ? 'font-medium' : 'font-normal'
            }`}
            style={{
              color:
                state.currentTheme.id === theme.id ? 'var(--theme-accent)' : 'var(--theme-text)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full border"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.accent,
                }}
              />
              {theme.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
