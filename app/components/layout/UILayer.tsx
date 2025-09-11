'use client';

import React from 'react';
import { Track } from '../../types/track';
import { appConfig } from '../../../config/app';
import { usePlayer } from '../../contexts/PlayerContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ListenerCount } from '../media/ListenerCount';
import { DynamicVisualizer } from '../visualization/DynamicVisualizer';
import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/20/solid';
import { Palette } from 'lucide-react';
import { cn } from '../../lib/utils';

interface UILayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isLoadingNext: boolean;
  isUIReady: boolean;
  error: string | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onThemePanelOpen: () => void;
}

/**
 * UILayer - Layer 3 of 3
 *
 * Handles all interactive UI elements at z-layer-ui (200):
 * - Navigation and logo
 * - Vinyl record player
 * - Media controls
 * - Volume controls
 * - Error messages
 *
 * This is the top layer that users interact with.
 */
export function UILayer({
  currentTrack,
  isPlaying,
  volume,
  isLoadingNext,
  isUIReady,
  error,
  onPlayPause,
  onNext,
  onPrevious,
  onThemePanelOpen,
}: UILayerProps) {
  const { setVolume, muteToggle } = usePlayer();
  const { state: themeState } = useTheme();

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
  };

  // Get neutral text color for player controls (light themes use dark text, dark themes use light text)
  const getControlTextColor = () => {
    const currentTheme = themeState.previewTheme || themeState.currentTheme;

    // For light theme, use dark text
    if (currentTheme.id === 'light') {
      return '#000000';
    }

    // For all other themes (dark, sunset, ocean, vaporwave), use light text
    return '#FFFFFF';
  };

  // Get volume slider track color (darker for light theme, lighter for dark themes)
  const getVolumeSliderTrackColor = () => {
    const currentTheme = themeState.previewTheme || themeState.currentTheme;

    // For light theme, use darker track
    if (currentTheme.id === 'light') {
      return 'rgba(0, 0, 0, 0.15)';
    }

    // For all other themes, use light track
    return 'rgba(255, 255, 255, 0.1)';
  };

  const controlTextColor = getControlTextColor();
  const volumeSliderTrackColor = getVolumeSliderTrackColor();

  // No loading animation needed - theme button is always ready

  return (
    <div className="absolute inset-0 z-layer-ui pointer-events-none">
      {isUIReady && currentTrack && (
        <>
          {/* Top navigation */}
          <div className="absolute top-8 left-4 right-4 md:top-7 lg:top-9 xl:left-7 xl:right-7 flex justify-between items-start pointer-events-auto">
            {appConfig.branding.enabled && (
              <a href={appConfig.branding.linkUrl || '#'}>
                <img
                  src={appConfig.branding.logoUrl}
                  alt={appConfig.name}
                  className="w-16 lg:w-[4.75rem] h-auto text-white"
                />
              </a>
            )}
            <div className="flex items-center gap-2">
              <ListenerCount />
              <div className="relative h-8 transition-all duration-500 ease-out">
                {/* Theme button container */}
                <button
                  onClick={onThemePanelOpen}
                  className={cn(
                    'flex items-center h-full',
                    'rounded-full bg-black/40 backdrop-blur-md',
                    'border-none text-white/90 text-sm font-regular',
                    'transition-all duration-300 ease-out hover:opacity-80',
                    'cursor-pointer justify-start px-3'
                  )}
                  aria-label="Open theme panel"
                >
                  {/* Icon container */}
                  <div
                    className={cn(
                      'relative flex items-center justify-center mr-1.5',
                      'transition-all duration-300 ease-out'
                    )}
                  >
                    {/* Palette icon */}
                    <Palette
                      size={12}
                      strokeWidth={2.5}
                      className="text-white/90 transition-all duration-300"
                    />
                  </div>

                  {/* Themes text */}
                  <div className="overflow-hidden whitespace-nowrap flex items-center">
                    <span>Theme</span>
                  </div>
                </button>

                {/* Defining the animation */}
                <style jsx global>{`
                  @keyframes spin {
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>

          {/* Mobile bottom controls */}
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-lg pb-8 pt-6 px-6 pointer-events-auto"
            style={{
              backgroundColor:
                themeState.currentTheme.id === 'sunset'
                  ? themeState.currentTheme.colors.accent
                  : 'var(--theme-background)',
              opacity: 0.9,
            }}
          >
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="text-md lg:text-lg font-regular lg:font-medium text-center px-2 truncate max-w-[80vw]"
                  style={{ color: controlTextColor }}
                >
                  {currentTrack.title}
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-6">
                <button
                  onClick={onPrevious}
                  className={cn(
                    'transition-colors focus:outline-none p-2',
                    isLoadingNext && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{ color: controlTextColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.75';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  disabled={isLoadingNext}
                  aria-label="Previous track"
                >
                  <BackwardIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={onPlayPause}
                  className="transition-colors focus:outline-none p-2 rounded-full"
                  style={{
                    color: controlTextColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.75';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  disabled={isLoadingNext}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </button>

                <button
                  onClick={onNext}
                  className="transition-colors focus:outline-none p-2"
                  style={{ color: controlTextColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.75';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  disabled={isLoadingNext}
                  aria-label="Next track"
                >
                  <ForwardIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 px-8">
                <button
                  onClick={muteToggle}
                  className="transition-colors focus:outline-none p-1"
                  style={{ color: controlTextColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.75';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                >
                  {volume === 0 ? (
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider w-40 rounded-full focus:outline-none"
                  style={
                    {
                      '--volume-percentage': `${volume}%`,
                      '--volume-slider-color': controlTextColor,
                      '--volume-slider-track-color': volumeSliderTrackColor,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          </div>

          {/* Desktop bottom bar */}
          <div
            className="hidden md:block absolute bottom-0 left-0 right-0 pointer-events-auto"
            style={{ height: '60%' }}
          >
            <div
              className="absolute inset-0 backdrop-blur-md"
              style={{
                backgroundColor: 'var(--theme-background)',
                opacity: 0.8,
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.95) 90%, black 95%, black 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.95) 90%, black 95%, black 100%)',
              }}
            />

            <div className="absolute bottom-0 left-0 right-0 h-40">
              <div className="flex items-center justify-center h-full px-6">
                <div className="flex flex-col items-center gap-3 w-full max-w-3xl">
                  <div className="flex flex-col items-center gap-2.5">
                    <div
                      className="truncate text-base/80 max-w-[60vw] text-center"
                      style={{ color: controlTextColor }}
                    >
                      {currentTrack.title}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 w-full mt-4">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={onPrevious}
                        className={cn(
                          'transition-colors focus:outline-none',
                          isLoadingNext && 'opacity-50 cursor-not-allowed'
                        )}
                        style={{ color: controlTextColor }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.75';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        disabled={isLoadingNext}
                        aria-label="Previous track"
                      >
                        <BackwardIcon className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={onPlayPause}
                        className="transition-colors focus:outline-none"
                        style={{ color: controlTextColor }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.75';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        disabled={isLoadingNext}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-5 h-5" />
                        ) : (
                          <PlayIcon className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={onNext}
                        className="transition-colors focus:outline-none"
                        style={{ color: controlTextColor }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.75';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        disabled={isLoadingNext}
                        aria-label="Next track"
                      >
                        <ForwardIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Volume slider below controls */}
                  <div className="flex items-center justify-center gap-2.5 mb-8 mt-1">
                    <button
                      onClick={muteToggle}
                      className="transition-colors focus:outline-none"
                      style={{ color: controlTextColor }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.75';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                    >
                      {volume === 0 ? (
                        <SpeakerXMarkIcon className="w-4 h-4" />
                      ) : (
                        <SpeakerWaveIcon className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="volume-slider w-48 rounded-full focus:outline-none"
                      style={
                        {
                          '--volume-percentage': `${volume}%`,
                          '--volume-slider-color': controlTextColor,
                          '--volume-slider-track-color': volumeSliderTrackColor,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center vinyl record player - rendered last to appear above desktop controls */}
          <div className="relative h-full flex items-center justify-center p-4 md:p-8 md:pb-24 pb-40 pointer-events-none">
            <div className="w-full max-w-sm md:max-w-md">
              <DynamicVisualizer
                src={currentTrack.albumCoverUrl}
                alt={currentTrack.title}
                isPlaying={isPlaying}
                isLoading={isLoadingNext}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </>
      )}

      {/* Error messages */}
      {error && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-layer-modals backdrop-blur-lg p-6 rounded-lg border"
          style={{
            color: 'var(--theme-text)',
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-accent)',
          }}
        >
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
