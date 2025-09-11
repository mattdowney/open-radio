'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { X } from 'lucide-react';
import { ThemePreview } from './ThemePreview';
import { useEffect, useCallback } from 'react';
import { appConfig } from '../../../config/app';

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemePanel({ isOpen, onClose }: ThemePanelProps) {
  const { state, availableThemes } = useTheme();

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - minimal opacity to maintain visibility */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-layer-modals bg-black/20"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              type: 'tween',
              duration: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="fixed right-0 top-0 h-full w-80 max-w-[90vw] shadow-2xl md:w-96 backdrop-blur-xl"
            style={{
              zIndex: 'calc(var(--layer-modals) + 1)',
              backgroundColor: appConfig.ui.themeDrawerBackground,
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <div>
                <h2
                  className="text-base font-regular tracking-normal font-geist"
                  style={{ color: 'white' }}
                >
                  Choose Theme
                </h2>
                <p
                  className="text-sm mt-1 font-geist"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Live preview as you hover
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  color: 'white',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'black';
                  const icon = e.currentTarget.querySelector('[data-lucide]') as HTMLElement;
                  if (icon) icon.style.color = 'black';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'white';
                  const icon = e.currentTarget.querySelector('[data-lucide]') as HTMLElement;
                  if (icon) icon.style.color = 'white';
                }}
                aria-label="Close theme panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Theme Options */}
            <div className="p-6 space-y-3 overflow-y-auto h-[calc(100vh-100px)]">
              {availableThemes.map((theme) => (
                <ThemePreview
                  key={theme.id}
                  theme={theme}
                  isSelected={state.currentTheme.id === theme.id}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
