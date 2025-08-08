'use client';

import { Track } from '../../types/track';
import { usePlayer } from '../../contexts/PlayerContext';
import { useUI } from '../../contexts/UIContext';
import LeftPanel from './LeftPanel';
import { ListenerCount } from '../media/ListenerCount';
import BlurredAlbumBackground from '../ui/BlurredAlbumBackground';
import Loading from '../ui/Loading';

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
          {/* Background Blur Container - Positioned absolutely */}
          {isUIReady && currentTrack && (
            <div className="fixed inset-0 lg:right-auto lg:w-[400px] w-screen h-screen overflow-hidden">
              <div className="absolute inset-0 bg-black/90" />
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="ui-radio w-full h-full">
                  <div className="ui-radio-container">
                    <div className="ui-radio-image flex items-center justify-center h-screen w-screen">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        className="hidden"
                      >
                        <defs>
                          <filter id="gaussian-blur">
                            <feGaussianBlur stdDeviation="120" result="blur1" />
                            <feColorMatrix
                              in="blur1"
                              type="matrix"
                              values="1 0 0 0 0
                                      0 1 0 0 0
                                      0 0 1 0 0
                                      0 0 0 0.9 0"
                              result="color1"
                            />
                            <feGaussianBlur
                              in="color1"
                              stdDeviation="60"
                              result="blur2"
                            />
                            <feComponentTransfer>
                              <feFuncR type="linear" slope="0.9" />
                              <feFuncG type="linear" slope="0.9" />
                              <feFuncB type="linear" slope="0.9" />
                            </feComponentTransfer>
                          </filter>
                        </defs>
                      </svg>

                      <div
                        className="absolute inset-0 overflow-hidden bg-white/10 transition-opacity duration-300 ease-in-out"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'translateZ(0)',
                          willChange: 'transform, opacity',
                        }}
                      >
                        <div
                          className="absolute inset-0 w-full h-full transform scale-[2.5] origin-center animate-spin-only"
                          style={{
                            filter: 'url(#gaussian-blur)',
                            transition: 'opacity 300ms ease-in-out',
                            willChange: 'transform, opacity',
                            backfaceVisibility: 'hidden',
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          <img
                            className="absolute inset-0 w-full h-full object-cover scale-[300%]"
                            style={{
                              transition: 'opacity 300ms ease-in-out',
                              willChange: 'transform, opacity',
                              backfaceVisibility: 'hidden',
                            }}
                            src={currentTrack?.albumCoverUrl?.replace('hqdefault', 'default') || ''}
                            alt={currentTrack?.title || ''}
                            onLoad={handleImageLoad}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Layer - Positioned relative on top of background */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] h-screen w-screen pointer-events-auto">
            {isUIReady && (
              <>
                <div
                  className="relative h-full bg-black p-5 text-white"
                  style={{
                    isolation: 'isolate',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    backdropFilter: 'none',
                    position: 'relative',
                    zIndex: 100,
                  }}
                >
                  <div
                    className="relative h-full"
                    style={{
                      position: 'relative',
                      zIndex: 100,
                      isolation: 'isolate',
                    }}
                  >
                    {currentTrack && (
                      <LeftPanel
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        volume={volume}
                        upcomingTracks={upcomingTracks}
                        onPlayPause={onPlayPause}
                        onVolumeChange={handleVolumeChange}
                        onMuteToggle={muteToggle}
                        onSkip={onNext}
                        onPrevious={onPrevious}
                        hasPreviousTrack={true}
                        onTrackSelect={onTrackSelect}
                        isLoadingNext={isLoadingNext}
                      />
                    )}
                  </div>
                </div>
                
                {/* Blurred Album Background - Right side panel */}
                <div className="relative h-full overflow-hidden bg-black">
                  {/* Blurred album cover background */}
                  <BlurredAlbumBackground 
                    className="absolute inset-0" 
                    albumCoverUrl={currentTrack?.albumCoverUrl}
                  />
                  
                  {/* Optional overlay for content on top of background */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {/* Listener Count Badge */}
                    <div className="absolute bottom-8 right-8 z-20 pointer-events-auto">
                      <ListenerCount />
                    </div>
                  </div>
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