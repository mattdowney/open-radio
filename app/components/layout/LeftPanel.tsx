'use client';

import { AlbumCover } from '@/app/components/media/AlbumCover';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cn } from '@/app/lib/utils';
import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';
import { MarqueeTitle } from '../media/MarqueeTitle';
import { TrackRating } from '../media/TrackRating';

interface Track {
  title: string;
  albumCoverUrl?: string;
  id: string;
}

interface LeftPanelProps {
  currentTrack: Track;
  isPlaying: boolean;
  volume: number;
  upcomingTracks: Track[];
  onPlayPause: () => void;
  onVolumeChange: (event: { target: { value: string } }) => void;
  onMuteToggle: () => void;
  onSkip: () => void;
  onPrevious: () => void;
  hasPreviousTrack: boolean;
  onTrackSelect: (trackId: string) => void;
  isLoadingNext?: boolean;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const LeftPanel = ({
  currentTrack,
  isPlaying,
  volume,
  upcomingTracks,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onSkip,
  onPrevious,
  hasPreviousTrack,
  onTrackSelect,
  isLoadingNext = false,
}: LeftPanelProps) => {
  const [imageLoading, setImageLoading] = useState(true);

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
        case 'ArrowLeft':
          e.preventDefault();
          if (hasPreviousTrack) {
            onPrevious();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          onVolumeChange({
            target: { value: Math.min(100, volume + 5).toString() },
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          onVolumeChange({
            target: { value: Math.max(0, volume - 5).toString() },
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    onPlayPause,
    onSkip,
    onPrevious,
    hasPreviousTrack,
    onVolumeChange,
    volume,
  ]);

  return (
    <div className="h-full flex flex-col justify-center">
      {/* Now Playing Section */}
      <div className="mb-8">
        <div className="w-full">
          <h3 className="opacity-60 mb-4 tracking-widest font-medium uppercase text-sm text-center">Now Playing</h3>
          <div className="space-y-4">
            <AlbumCover
              src={currentTrack.albumCoverUrl}
              alt={currentTrack.title}
              size="lg"
              priority
              isLoading={isLoadingNext}
            />
            <div className="flex items-center">
              <div className="w-2/3">
                {isLoadingNext ? (
                  <Skeleton className="h-5 w-full" />
                ) : (
                  <MarqueeTitle title={currentTrack.title} className="h-5" />
                )}
              </div>
              {currentTrack.id && (
                <div className="ml-2 w-1/3 flex justify-end">
                  <TrackRating
                    trackId={currentTrack.id}
                    className="flex-shrink-0"
                    isLoading={isLoadingNext}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Playback Controls with stable layout */}
          <div className="mt-6 transition-opacity duration-200">
            <div
              className={cn(
                'flex flex-col items-center gap-4',
                isLoadingNext && 'opacity-50 pointer-events-none',
              )}
            >
              <div className="flex items-center gap-4 justify-center">
                <button
                  onClick={onPrevious}
                  className={cn(
                    'pr-2 text-white hover:text-white/75 transition-colors focus:outline-none',
                    !hasPreviousTrack && 'opacity-50 cursor-not-allowed',
                  )}
                  disabled={!hasPreviousTrack || isLoadingNext}
                  aria-label="Previous track (Left Arrow)"
                  title="Previous track (Left Arrow)"
                >
                  <BackwardIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={onPlayPause}
                  className={cn(
                    'relative p-0 text-white hover:text-white/75 transition-colors focus:outline-none',
                  )}
                  style={{
                    willChange: 'transform, opacity',
                    isolation: 'isolate',
                  }}
                  aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  disabled={isLoadingNext}
                >
                  {isPlaying ? (
                    <PauseIcon className="w-4 h-4" />
                  ) : (
                    <PlayIcon className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={onSkip}
                  className="p-2 text-white hover:text-white/75 transition-colors focus:outline-none"
                  aria-label="Skip to next track (Right Arrow)"
                  title="Skip to next track (Right Arrow)"
                  disabled={isLoadingNext}
                >
                  <ForwardIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full">
                <button
                  className="p-2 text-white hover:text-white/75 transition-colors focus:outline-none"
                  onClick={onMuteToggle}
                  aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                  title={volume === 0 ? 'Unmute' : 'Mute'}
                  disabled={isLoadingNext}
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
                  onChange={onVolumeChange}
                  className="volume-slider flex-1 rounded-full focus:outline-none"
                  style={
                    {
                      '--volume-percentage': `${volume}%`,
                    } as React.CSSProperties
                  }
                  aria-label="Volume (Up/Down Arrow)"
                  title="Adjust volume (Up/Down Arrow)"
                  disabled={isLoadingNext}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Up Next Section */}
      <div className="mt-8">
        <h3 className="opacity-60 mb-4 tracking-widest font-medium uppercase text-sm text-center">Up Next</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {upcomingTracks.map((track, index) => (
            <button
              key={track.id}
              onClick={() => onTrackSelect(track.id)}
              className={cn(
                'relative w-full text-left flex items-center space-x-3 p-2 rounded-md transition-[background-color,opacity] duration-200 hover:bg-dark focus:outline-none group',
                'transform-gpu',
                isLoadingNext && 'opacity-50 pointer-events-none',
              )}
              style={{
                willChange: 'transform, opacity',
                isolation: 'isolate',
              }}
              aria-label={`Play ${track.title}`}
              tabIndex={0}
              role="button"
              disabled={isLoadingNext}
            >
              <AlbumCover
                src={track.albumCoverUrl}
                alt={track.title}
                size="sm"
                className="flex-shrink-0 w-10 h-10"
                isLoading={isLoadingNext}
              />
              <div className="overflow-hidden flex-1">
                {isLoadingNext ? (
                  <Skeleton className="h-5 w-32" />
                ) : (
                  <MarqueeTitle
                    title={track.title}
                    className="h-5"
                    bgColor="transparent"
                    data-group-hover-bg-color="#2E2F35"
                    animateOnHover
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
