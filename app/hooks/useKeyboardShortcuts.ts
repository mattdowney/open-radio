import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onPlayPause: () => void;
  onSkip: () => void;
  onVolumeChange: (volume: number) => void;
  currentVolume: number;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onSkip,
  onVolumeChange,
  currentVolume,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts if not typing in an input
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSkip();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onVolumeChange(Math.min(100, currentVolume + 5));
          break;
        case 'ArrowDown':
          e.preventDefault();
          onVolumeChange(Math.max(0, currentVolume - 5));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPlayPause, onSkip, onVolumeChange, currentVolume]);
}
