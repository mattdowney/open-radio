'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Track } from '../../types/track';
import { appConfig } from '../../../config/app';
import { usePlayer } from '../../contexts/PlayerContext';
import { useUI } from '../../contexts/UIContext';
import { ListenerCount } from '../media/ListenerCount';
import { DynamicVisualizer } from '../visualization/DynamicVisualizer';
import { TrackRating } from '../media/TrackRating';
import BlurredAlbumBackground from '../ui/BlurredAlbumBackground';
import Loading from '../ui/Loading';
import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/20/solid';
import { cn } from '../../lib/utils';
import { MeshGradient } from '@paper-design/shaders-react';
import { extractColorsFromImage, generateShaderColors } from '../../utils/colorExtraction';

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

export function RadioLayout({
  isLoading,
  error,
  currentTrack,
  upcomingTracks,
  isPlaying,
  volume,
  isLoadingNext,
  isUIReady,
  isTransitioning,
  onPlayPause,
  onNext,
  onPrevious,
  onTrackSelect,
}: RadioLayoutProps) {
  const { setVolume, muteToggle } = usePlayer();
  useUI();

  const [shaderColors, setShaderColors] = useState<string[]>([
    '#000000',
    '#1a1a1a',
    '#333333',
    '#ffffff',
  ]);
  const [pendingColorExtraction, setPendingColorExtraction] = useState<string | null>(null);

  // Delayed color extraction - only after track is playing and not transitioning
  useEffect(() => {
    if (currentTrack?.albumCoverUrl && isPlaying && !isTransitioning) {
      // Mark this URL as pending extraction
      if (pendingColorExtraction !== currentTrack.albumCoverUrl) {
        setPendingColorExtraction(currentTrack.albumCoverUrl);

        // Add delay to ensure smooth initial transition
        const timeoutId = setTimeout(() => {
          extractColorsFromImage(currentTrack.albumCoverUrl!)
            .then((extractedColors) => {
              const dynamicColors = generateShaderColors(extractedColors);
              setShaderColors(dynamicColors);
              setPendingColorExtraction(null);
            })
            .catch((error) => {
              console.warn('Color extraction failed:', error);
              // Keep current colors instead of resetting to defaults
              setPendingColorExtraction(null);
            });
        }, 2000); // 2s delay to allow initial play transition to fully settle

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
  }, [currentTrack?.albumCoverUrl, isPlaying, isTransitioning, pendingColorExtraction]);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {isLoading && <Loading />}
      {!isLoading && (
        <>
          <div className="relative z-10 h-screen w-screen pointer-events-auto">
            {isUIReady && currentTrack && (
              <>
                <div className="absolute top-8 left-4 right-4 md:top-7 lg:top-9 xl:left-7 xl:right-7 z-30 flex justify-between items-start">
                  {appConfig.branding.enabled && (
                    <a href={appConfig.branding.linkUrl || '#'}>
                      <img
                        src={appConfig.branding.logoUrl}
                        alt={appConfig.name}
                        className="w-16 lg:w-[4.75rem] h-auto text-white"
                      />
                    </a>
                  )}
                  <ListenerCount />
                </div>

                <div className="relative h-full flex items-center justify-center p-4 md:p-8 md:pb-24 pb-40">
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

                {/* Mobile bottom controls */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-lg pb-8 pt-6 px-6">
                  <div className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-white text-md lg:text-lg font-regular lg:font-medium text-center px-2 truncate max-w-[80vw]">
                        {currentTrack.title}
                      </div>
                      {currentTrack.id && (
                        <TrackRating
                          trackId={currentTrack.id}
                          className="scale-125"
                          isLoading={isLoadingNext}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-6">
                      <button
                        onClick={onPrevious}
                        className={cn(
                          'text-white hover:text-white/75 transition-colors focus:outline-none p-2',
                          isLoadingNext && 'opacity-50 cursor-not-allowed'
                        )}
                        disabled={isLoadingNext}
                        aria-label="Previous track"
                      >
                        <BackwardIcon className="w-5 h-5" />
                      </button>

                      <button
                        onClick={onPlayPause}
                        className="text-white hover:text-white/75 transition-colors focus:outline-none p-2 bg-white/10 rounded-full"
                        disabled={isLoadingNext}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-6 h-6" />
                        ) : (
                          <PlayIcon className="w-6 h-6" />
                        )}
                      </button>

                      <button
                        onClick={onNext}
                        className="text-white hover:text-white/75 transition-colors focus:outline-none p-2"
                        disabled={isLoadingNext}
                        aria-label="Next track"
                      >
                        <ForwardIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 px-8">
                      <button
                        onClick={muteToggle}
                        className="text-white hover:text-white/75 transition-colors focus:outline-none p-1"
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
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop bottom bar (no upcoming tracks) */}
                <div
                  className="hidden md:block absolute bottom-0 left-0 right-0 z-20"
                  style={{ height: '60%' }}
                >
                  <div
                    className="absolute inset-0 bg-black/25 backdrop-blur-md"
                    style={{
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
                          <div className="truncate text-white text-base/80 max-w-[60vw] text-center">
                            {currentTrack.title}
                          </div>
                          {currentTrack.id && (
                            <TrackRating
                              trackId={currentTrack.id}
                              className="flex-shrink-0"
                              isLoading={isLoadingNext}
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-4 w-full mt-4">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={onPrevious}
                              className={cn(
                                'text-white hover:text-white/75 transition-colors focus:outline-none',
                                isLoadingNext && 'opacity-50 cursor-not-allowed'
                              )}
                              disabled={isLoadingNext}
                              aria-label="Previous track"
                            >
                              <BackwardIcon className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={onPlayPause}
                              className="text-white hover:text-white/75 transition-colors focus:outline-none"
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
                              className="text-white hover:text-white/75 transition-colors focus:outline-none"
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
                            className="text-white hover:text-white/75 transition-colors focus:outline-none"
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
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
                  <BlurredAlbumBackground
                    className="absolute inset-0 z-0"
                    albumCoverUrl={currentTrack?.albumCoverUrl}
                    blurAmount={60}
                    isTrackReady={isPlaying && !isTransitioning}
                    shouldFadeToBlack={isTransitioning}
                  />
                  <div className="absolute inset-0 z-10 mix-blend-overlay">
                    <MeshGradient className="w-full h-full" colors={shaderColors} speed={0.8} />
                  </div>

                  {/* Static dither grain overlay */}
                  {/*
                  <div 
                    className="absolute inset-0 z-20 pointer-events-none opacity-[0.15] mix-blend-overlay"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0),
                        radial-gradient(circle at 2px 3px, rgba(0,0,0,0.8) 1px, transparent 0)
                      `,
                      backgroundSize: '3px 3px, 5px 5px',
                      backgroundPosition: '0 0, 1px 2px'
                    }}
                  />
                  */}
                </div>
              </>
            )}

            {error && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 text-white bg-red-500/20 backdrop-blur-lg p-6 rounded-lg border border-red-500/20">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p>{error}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
