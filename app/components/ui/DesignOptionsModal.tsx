'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { useVisualizer } from '../../contexts/VisualizerContext';
import { X, Palette, Disc, Disc3 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';

interface DesignOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisualizerIcons = {
  vinyl: Disc,
  cd: Disc3,
};

export function DesignOptionsModal({ isOpen, onClose }: DesignOptionsModalProps) {
  const { state: themeState, switchTheme, availableThemes } = useTheme();
  const { currentVisualizer, switchVisualizer, availableVisualizers, isTransitioning } =
    useVisualizer();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-layer-modals bg-black/80" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-layer-modals w-[90vw] max-w-2xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl focus:outline-none overflow-hidden"
          style={{
            backgroundColor: 'var(--theme-surface)',
            border: '1px solid var(--theme-textSecondary)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: 'var(--theme-textSecondary)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.1 }}
              >
                <Palette size={20} style={{ color: 'var(--theme-accent)' }} />
              </div>
              <div>
                <Dialog.Title
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Design Options
                </Dialog.Title>
                <Dialog.Description
                  className="text-sm mt-1"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  Customize your radio experience
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  color: 'var(--theme-textSecondary)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-textSecondary)';
                  e.currentTarget.style.opacity = '0.1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(85vh-120px)]">
            {/* Color Themes Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
                  Color Themes
                </h3>
                <div
                  className="h-px flex-1 opacity-20"
                  style={{ backgroundColor: 'var(--theme-textSecondary)' }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableThemes.map((theme) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => switchTheme(theme.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 ${
                      themeState.currentTheme.id === theme.id
                        ? 'ring-2 ring-offset-2'
                        : 'hover:border-opacity-60'
                    }`}
                    style={{
                      backgroundColor:
                        themeState.currentTheme.id === theme.id
                          ? theme.colors.accent + '20'
                          : 'var(--theme-background)',
                      borderColor:
                        themeState.currentTheme.id === theme.id
                          ? theme.colors.accent
                          : 'var(--theme-textSecondary)',
                    }}
                  >
                    {/* Theme Preview */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div
                          className="w-8 h-8 rounded-full border-2 shadow-sm"
                          style={{
                            backgroundColor: theme.colors.primary,
                            borderColor: theme.colors.accent,
                          }}
                        />
                        <div
                          className="absolute inset-1 rounded-full opacity-40"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                      </div>
                      <div className="text-left flex-1">
                        <div
                          className="font-semibold text-sm"
                          style={{ color: 'var(--theme-text)' }}
                        >
                          {theme.name}
                        </div>
                        <div
                          className="text-xs opacity-70"
                          style={{ color: 'var(--theme-textSecondary)' }}
                        >
                          Theme
                        </div>
                      </div>
                    </div>

                    {/* Color Palette Preview */}
                    <div className="flex gap-2">
                      <div
                        className="h-3 flex-1 rounded-full"
                        style={{ backgroundColor: theme.colors.background }}
                      />
                      <div
                        className="h-3 flex-1 rounded-full"
                        style={{ backgroundColor: theme.colors.surface }}
                      />
                      <div
                        className="h-3 flex-1 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>

                    {/* Active Indicator */}
                    {themeState.currentTheme.id === theme.id && (
                      <div className="absolute top-3 right-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Media Visualizer Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
                  Media Visualizer
                </h3>
                <div
                  className="h-px flex-1 opacity-20"
                  style={{ backgroundColor: 'var(--theme-textSecondary)' }}
                />
              </div>

              <div className="space-y-3">
                {availableVisualizers.map((visualizer) => {
                  const IconComponent = VisualizerIcons[visualizer.type] || Disc;
                  return (
                    <motion.button
                      key={visualizer.type}
                      onClick={() => switchVisualizer(visualizer.type)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`group relative w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                        currentVisualizer === visualizer.type
                          ? 'ring-2 ring-offset-2'
                          : 'hover:border-opacity-60'
                      }`}
                      style={{
                        backgroundColor:
                          currentVisualizer === visualizer.type
                            ? 'var(--theme-accent)' + '20'
                            : 'var(--theme-background)',
                        borderColor:
                          currentVisualizer === visualizer.type
                            ? 'var(--theme-accent)'
                            : 'var(--theme-textSecondary)',
                      }}
                      disabled={isTransitioning}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="p-3 rounded-xl"
                          style={{
                            backgroundColor: 'var(--theme-accent)',
                            opacity: 0.15,
                          }}
                        >
                          <IconComponent size={24} style={{ color: 'var(--theme-accent)' }} />
                        </div>
                        <div className="flex-1">
                          <div
                            className="font-semibold text-base mb-1"
                            style={{ color: 'var(--theme-text)' }}
                          >
                            {visualizer.name}
                          </div>
                          <div
                            className="text-sm opacity-70 leading-relaxed"
                            style={{ color: 'var(--theme-textSecondary)' }}
                          >
                            {visualizer.description}
                          </div>
                        </div>
                        {currentVisualizer === visualizer.type && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: 'var(--theme-accent)' }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--theme-accent)' }}
                            >
                              Active
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Loading Overlay */}
                      {isTransitioning && currentVisualizer === visualizer.type && (
                        <div
                          className="absolute inset-0 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: 'var(--theme-surface)', opacity: 0.9 }}
                        >
                          <div
                            className="text-sm font-medium"
                            style={{ color: 'var(--theme-text)' }}
                          >
                            Switching...
                          </div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
