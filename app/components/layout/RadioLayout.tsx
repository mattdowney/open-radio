'use client';

import { Track } from '../../types/track';
import { usePlayer } from '../../contexts/PlayerContext';
import { useUI } from '../../contexts/UIContext';
import { ListenerCount } from '../media/ListenerCount';
import { VinylRecord } from '../media/VinylRecord';
import { TrackRating } from '../media/TrackRating';
import { AlbumCover } from '../media/AlbumCover';
import BlurredAlbumBackground from '../ui/BlurredAlbumBackground';
import Loading from '../ui/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/20/solid';
import { cn } from '../../lib/utils';

interface RadioLayoutProps {
  isLoading: boolean;
  error: string | null;
  currentTrack: Track | null;
  upcomingTracks: Track[];
  isPlaying: boolean;
  volume: number;
  isLoadingNext: boolean;
  isUIReady: boolean;
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
  onPlayPause,
  onNext,
  onPrevious,
  onTrackSelect,
}: RadioLayoutProps) {
  const { setVolume, muteToggle } = usePlayer();
  const { handleImageLoad } = useUI();

  const handleVolumeChange = (event: { target: { value: string } }) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Loading State */}
      {isLoading && <Loading />}

      {/* Only show the rest of the UI when not in initial loading state */}
      {!isLoading && (
        <>
          {/* Content Layer - Positioned relative on top of background */}
          <div className="relative z-10 h-screen w-screen pointer-events-auto">
            {isUIReady && currentTrack && (
              <>
                {/* Top Bar - Logo and Listener Count */}
                <div className="absolute top-8 left-4 right-4 md:top-7 lg:top-9 xl:left-7 xl:right-7 z-30 flex justify-between items-start">
                  {/* Logo */}
                  <a href="https://mattdowney.com/">
                    <svg
                      className="w-16 lg:w-[4.75rem] h-auto text-white"
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
                  
                  {/* Listener Count */}
                  <ListenerCount />
                </div>

                {/* Centered Album Art */}
                <div className="relative h-full flex items-center justify-center p-4 md:p-8 md:pb-24 pb-40">
                  <div className="w-full max-w-sm md:max-w-md">
                    {/* Album Art - Vinyl Record */}
                    <VinylRecord
                      src={currentTrack.albumCoverUrl}
                      alt={currentTrack.title}
                      isPlaying={isPlaying}
                      isLoading={isLoadingNext}
                      className="w-full h-auto drop-shadow-2xl"
                    />
                    
                    {/* Mobile Track Info - Below album art */}
                    <div className="md:hidden mt-6">
                      <div className="flex flex-col items-center">
                        <div className="text-white text-base font-medium text-center px-4">
                          {currentTrack.title}
                        </div>
                        {currentTrack.id && (
                          <TrackRating
                            trackId={currentTrack.id}
                            className="mt-3 scale-125"
                            isLoading={isLoadingNext}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Controls - Fixed at bottom */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-lg pb-8 pt-6 px-6">
                  <div className="space-y-6">
                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-6">
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

                    {/* Volume Control */}
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
                        className="volume-slider flex-1 rounded-full focus:outline-none"
                        style={{
                          '--volume-percentage': `${volume}%`,
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Desktop Bottom UI Bar with truly seamless gradient fade */}
                <div className="hidden md:block absolute bottom-0 left-0 right-0 z-20" style={{ height: '60%' }}>
                  {/* Very gradual blur fade from top to bottom */}
                  <div 
                    className="absolute inset-0 bg-black/25 backdrop-blur-md"
                    style={{
                      maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.95) 90%, black 95%, black 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.95) 90%, black 95%, black 100%)',
                    }}
                  />
                  
                  {/* Controls positioned at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-28">
                    <div className="flex items-center justify-between h-full px-6">
                    {/* Current Track Info */}
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <div className="truncate text-white text-sm">
                        {currentTrack.title}
                      </div>
                      {currentTrack.id && (
                        <TrackRating
                          trackId={currentTrack.id}
                          className="flex-shrink-0 mt-2"
                          isLoading={isLoadingNext}
                        />
                      )}
                    </div>

                    {/* Playback Controls and Volume - Stacked */}
                    <div className="flex flex-col items-center gap-3">
                      {/* Playback Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={onPrevious}
                          className={cn(
                            'text-white hover:text-white/75 transition-colors focus:outline-none',
                            isLoadingNext && 'opacity-50 cursor-not-allowed'
                          )}
                          disabled={isLoadingNext}
                          aria-label="Previous track"
                        >
                          <BackwardIcon className="w-4 h-4" />
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
                          <ForwardIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Volume Controls */}
                      <div className="flex items-center gap-2">
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
                          className="volume-slider w-24 rounded-full focus:outline-none"
                          style={{
                            '--volume-percentage': `${volume}%`,
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>

                    {/* Upcoming Tracks */}
                    <div className="flex items-center justify-end flex-1 min-w-0">
                      <div className="flex items-center gap-6">
                        <div className="relative flex items-center gap-6 min-w-0">
                          {/* First upcoming track - fully visible */}
                          {upcomingTracks[0] && (
                            <div className="flex items-center gap-2 min-w-0">
                              <AlbumCover
                                src={upcomingTracks[0].albumCoverUrl}
                                alt={upcomingTracks[0].title}
                                size="sm"
                                className="w-10 h-10 flex-shrink-0"
                              />
                              <span className="text-white text-sm max-w-[150px] truncate">
                                {upcomingTracks[0].title}
                              </span>
                            </div>
                          )}
                          
                          {/* Second upcoming track - minimal tease with mask */}
                          {upcomingTracks[1] && (
                            <div className="relative w-32 overflow-hidden">
                              <div 
                                className="flex items-center gap-2 min-w-0"
                                style={{
                                  maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 85%)',
                                  WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 85%)',
                                }}
                              >
                                <AlbumCover
                                  src={upcomingTracks[1].albumCoverUrl}
                                  alt={upcomingTracks[1].title}
                                  size="sm"
                                  className="w-10 h-10 flex-shrink-0 opacity-60"
                                />
                                <span className="text-white/60 text-sm whitespace-nowrap">
                                  {upcomingTracks[1].title}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
                
                {/* Background - Full screen */}
                <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
                  {/* Blurred album art background */}
                  <BlurredAlbumBackground 
                    className="absolute inset-0" 
                    albumCoverUrl={currentTrack?.albumCoverUrl}
                    blurAmount={60}
                  />
                </div>
              </>
            )}

            {/* Error Display */}
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