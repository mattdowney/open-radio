'use client';

import React, { useState } from 'react';
import { Track } from '../../types/track';
import Loading from '../ui/Loading';
import { ThemePanel } from '../ui/ThemePanel';
import { BackgroundLayer } from './BackgroundLayer';
import { EffectsLayer } from './EffectsLayer';
import { UILayer } from './UILayer';

interface RadioLayoutProps {
  isLoading: boolean;
  error: string | null;
  currentTrack: Track | null;
  upcomingTracks: Track[];
  isPlaying: boolean;
  volume: number;
  isLoadingNext: boolean;
  isUIReady: boolean;
  isTransitioning: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTrackSelect: (trackId: string) => void;
}

/**
 * RadioLayout - Clean Three-Layer Architecture
 *
 * This component orchestrates the three distinct visual layers:
 * 1. BackgroundLayer (z-layer-background: 0) - Album art, gradients, shaders
 * 2. EffectsLayer (z-layer-effects: 100) - Particles, scan lines, theme effects
 * 3. UILayer (z-layer-ui: 200) - Controls, navigation, interactive elements
 *
 * Each layer is completely independent and handles its own responsibilities,
 * making the codebase easier to maintain and extend with new themes.
 */
export function RadioLayout({
  isLoading,
  error,
  currentTrack,
  upcomingTracks: _upcomingTracks,
  isPlaying,
  volume,
  isLoadingNext,
  isUIReady,
  isTransitioning,
  onPlayPause,
  onNext,
  onPrevious,
  onTrackSelect: _onTrackSelect,
}: RadioLayoutProps) {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {isLoading && <Loading />}
      {!isLoading && (
        <>
          {/* Layer 1: Background - Album artwork, gradients, and shaders */}
          <BackgroundLayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            isTransitioning={isTransitioning}
          />

          {/* Layer 2: Effects - Theme-specific animations and particles */}
          <EffectsLayer />

          {/* Layer 3: UI - All interactive elements and controls */}
          <UILayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            volume={volume}
            isLoadingNext={isLoadingNext}
            isUIReady={isUIReady}
            error={error}
            onPlayPause={onPlayPause}
            onNext={onNext}
            onPrevious={onPrevious}
            onThemePanelOpen={() => setIsThemePanelOpen(true)}
          />

          {/* Theme Panel (z-layer-modals: 300) */}
          <ThemePanel isOpen={isThemePanelOpen} onClose={() => setIsThemePanelOpen(false)} />
        </>
      )}
    </div>
  );
}
