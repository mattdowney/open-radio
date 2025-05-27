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
    <div className="h-full flex flex-col">
      {/* Top Section - Logo */}
      <div className="px-2 pt-3">
        <a href="https://mattdowney.com/">
          <svg
            className="w-16 lg:w-[4.75rem] h-auto"
            width="250"
            height="83"
            viewBox="0 0 250 83"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24.4749 11.4338C27.1323 4.5441 33.7555 0 41.1399 0C51.0046 0 59.0016 7.99696 59.0016 17.8617V64.2028C59.0016 67.4045 61.5971 70 64.7988 70C67.2219 70 69.3895 68.4929 70.2332 66.2213L90.521 11.6004C93.1111 4.62686 99.7654 0 107.204 0C117.034 0 125.002 7.96806 125.002 17.7972V64.2028C125.002 67.4045 127.597 70 130.799 70C133.222 70 135.389 68.4929 136.233 66.2213L155.746 13.6881C158.802 5.45952 166.654 0 175.431 0H213.098C238.435 0 255.844 25.478 246.637 49.0825L245.117 52.9781C238.176 70.7723 220.961 82.426 201.862 82.2599L171.949 81.9998C168.636 81.971 165.973 79.2614 166.002 75.9478C166.031 72.6342 168.74 69.9714 172.054 70.0002L201.966 70.2603C216.083 70.3831 228.807 61.7695 233.938 48.6173L235.457 44.7217C241.595 28.9853 229.989 12 213.098 12H175.431C171.67 12 168.304 14.3398 166.995 17.8663L147.482 70.3996C144.892 77.3731 138.238 82 130.799 82C120.97 82 113.002 74.0319 113.002 64.2028V17.7972C113.002 14.5955 110.406 12 107.204 12C104.781 12 102.614 13.5071 101.77 15.7787L81.4823 70.3996C78.8921 77.3731 72.2379 82 64.7988 82C54.9697 82 47.0016 74.0319 47.0016 64.2028V17.8617C47.0016 14.6244 44.3772 12 41.1399 12C38.7165 12 36.543 13.4912 35.6709 15.7523L11.5996 78.1592C10.4071 81.2509 6.93408 82.7905 3.84238 81.598C0.750688 80.4055 -0.788905 76.9325 0.403606 73.8408L24.4749 11.4338Z"
            />
          </svg>
        </a>
      </div>

      {/* Middle Section - Now Playing */}
      <div className="flex-1 flex items-center p-2">
        <div className="w-full">
          <h3 className="opacity-60 mb-4 tracking-widest font-medium uppercase text-sm">Now Playing</h3>
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
          <div className="mt-2 transition-opacity duration-200">
            <div
              className={cn(
                'flex items-center gap-4',
                isLoadingNext && 'opacity-50 pointer-events-none',
              )}
            >
              <div className="flex items-center gap-2">
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

              <div className="flex items-center gap-1 flex-1">
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

      {/* Bottom Section - Up Next */}
      <div className="flex-none p-0 pb-3">
        <h3 className="opacity-60 mb-4 tracking-widest pl-2 font-medium uppercase text-sm">Up Next</h3>
        <div className="space-y-2 max-h-[calc(100vh-36rem)] overflow-y-auto">
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
