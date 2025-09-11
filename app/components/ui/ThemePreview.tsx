'use client';

import { motion } from 'framer-motion';
import { Theme, useTheme } from '../../contexts/ThemeContext';
import { Check } from 'lucide-react';

interface ThemePreviewProps {
  theme: Theme;
  isSelected: boolean;
}

export function ThemePreview({ theme, isSelected }: ThemePreviewProps) {
  const { previewTheme, switchTheme } = useTheme();

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isSelected) {
      previewTheme(theme);
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isSelected) {
      previewTheme(null);
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
  };

  const handleClick = () => {
    if (!isSelected) {
      switchTheme(theme.id);
    }
  };

  return (
    <motion.button
      className="w-full p-4 rounded-xl border-2 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 text-left"
      style={{
        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        borderColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        opacity: isSelected ? 1 : 0.8,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      disabled={isSelected}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'white',
              }}
            >
              <Check
                size={12}
                style={{
                  color: 'black',
                }}
              />
            </motion.div>
          )}

          <div>
            <div className="font-medium text-sm font-geist">{theme.name}</div>
            <div
              className="text-xs mt-0.5 font-geist"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 0.8,
              }}
            >
              {getThemeDescription(theme.id)}
            </div>
          </div>
        </div>

        {/* Color palette preview */}
        <div className="flex gap-1.5">
          {theme.id === 'dark' && (
            <>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0E0E0E' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#262626' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3E3E3E' }} />
            </>
          )}
          {theme.id === 'light' && (
            <>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E5E5E5' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C5C5C5' }} />
            </>
          )}
          {theme.id === 'sunset' && (
            <>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F4C430' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EC5F67' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#AB47A6' }} />
            </>
          )}
          {theme.id === 'ocean' && (
            <>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00BCD4' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2962FF' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0D1B4C' }} />
            </>
          )}
          {theme.id === 'vaporwave' && (
            <>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4ECDC4' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6EC7' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5A5FCC' }} />
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function getThemeDescription(themeId: string): string {
  const descriptions = {
    dark: 'High contrast, modern',
    light: 'Clean, minimal',
    sunset: 'Warm golden hour',
    ocean: 'Cool, calming',
    vaporwave: 'Retro synthwave vibes',
  };
  return descriptions[themeId as keyof typeof descriptions] || 'Custom theme';
}
