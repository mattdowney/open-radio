'use client';

import { useEffect, useRef } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useQueue } from '../../contexts/QueueContext';
import { useUI } from '../../contexts/UIContext';
import { PlayerState, YouTubePlayer } from '../../types/player';

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, config: any) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubePlayerManagerProps {
  onTrackEnd: () => void;
  onError: (error: string) => void;
}

export function YouTubePlayerManager({ onTrackEnd, onError }: YouTubePlayerManagerProps) {
  const { state: playerState, dispatch: playerDispatch, playerRef } = usePlayer();
  const { state: queueState } = useQueue();
  const { setError } = useUI();
  const initializingRef = useRef(false);

  // Load YouTube IFrame API
  useEffect(() => {
    const loadYouTubeAPI = async () => {
      if (window.YT) return;

      return new Promise<void>((resolve, reject) => {
        // Create container first
        const container = document.createElement('div');
        container.id = 'radio-player';
        container.className = 'hidden';
        document.body.appendChild(container);

        // Define callback before loading script
        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };

        // Load the IFrame Player API code
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.onerror = reject;
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
      });
    };

    loadYouTubeAPI().catch((error) => {
      console.error('Error loading YouTube API:', error);
      setError('Failed to load YouTube player');
    });
  }, [setError]);

  // Initialize player when we have a playlist
  useEffect(() => {
    if (!queueState.playlist.length || !window.YT || initializingRef.current) {
      return;
    }

    const initializePlayer = () => {
      try {
        initializingRef.current = true;

        // Verify container exists
        const container = document.getElementById('radio-player');
        if (!container) {
          throw new Error('Player container not found');
        }

        // Clear any existing player
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }

        const firstVideoId = queueState.playlist[0];
        if (!firstVideoId) {
          throw new Error('No video ID available');
        }

        // Create player instance
        const YTGlobal = window.YT as NonNullable<typeof window.YT>;
        const player = new YTGlobal.Player('radio-player', {
          height: '0',
          width: '0',
          videoId: firstVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
            mute: 0,
            start: 0,
          },
          events: {
            onReady: handlePlayerReady,
            onError: handlePlayerError,
            onStateChange: handlePlayerStateChange,
          },
        });

        if (!player) {
          throw new Error('Failed to create player instance');
        }
      } catch (error) {
        console.error('Error initializing player:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize video player');
      } finally {
        initializingRef.current = false;
      }
    };

    // Small delay to ensure API is ready
    setTimeout(initializePlayer, 100);
  }, [queueState.playlist.length, playerRef, setError]);

  // Update volume when player is ready
  useEffect(() => {
    if (playerState.isPlayerReady && playerRef.current) {
      playerRef.current.setVolume(playerState.volume);
    }
  }, [playerState.isPlayerReady, playerState.volume, playerRef]);

  // Handle visibility changes to prevent DevTools from pausing playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If tab becomes visible and we should be playing, resume
      if (!document.hidden && playerState.isPlaying && playerRef.current) {
        const playerStateCheck = playerRef.current.getPlayerState();
        // If player is paused but should be playing, resume
        if (playerStateCheck === PlayerState.PAUSED) {
          playerRef.current.playVideo();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus events which can be triggered by DevTools
    const handleFocus = () => {
      if (playerState.isPlaying && playerRef.current) {
        const playerStateCheck = playerRef.current.getPlayerState();
        if (playerStateCheck === PlayerState.PAUSED) {
          playerRef.current.playVideo();
        }
      }
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [playerState.isPlaying, playerRef]);

  const handlePlayerReady = (event: { target: YouTubePlayer }) => {
    if (typeof event.target.loadVideoById !== 'function') {
      console.error('Player missing required methods');
      setError('Failed to initialize video player properly');
      return;
    }
    
    playerRef.current = event.target;
    playerDispatch({ type: 'SET_PLAYER_READY', payload: true });
    playerDispatch({ type: 'SET_VOLUME', payload: playerState.volume });
  };

  const handlePlayerError = (event: { data: number }) => {
    const errorMessages = {
      2: 'Invalid video parameter',
      5: 'Network error occurred',
      100: 'Video not available',
      101: 'Video playback not allowed',
      150: 'Video playback not allowed',
    } as const;

    const message = errorMessages[event.data as keyof typeof errorMessages] || 'Error loading video player';

    // If it's a video-specific error, try playing the next track
    if ([100, 101, 150].includes(event.data)) {
      // Ensure auto-advance logic knows to continue playing
      playerDispatch({ type: 'SET_AUTO_ADVANCING', payload: true });
      onTrackEnd();
      return;
    }

    // For other errors, show the error message
    onError(message);
  };

  const handlePlayerStateChange = (event: { target: YouTubePlayer; data: number }) => {
    const playerStateValue = event.data;

    switch (playerStateValue) {
      case PlayerState.ENDED:
        // Set auto-advancing flag before calling onTrackEnd
        playerDispatch({ type: 'SET_AUTO_ADVANCING', payload: true });
        onTrackEnd();
        break;

      case PlayerState.PLAYING:
        playerDispatch({ type: 'SET_PLAYING', payload: true });
        // Clear auto-advancing flag once playing starts
        playerDispatch({ type: 'SET_AUTO_ADVANCING', payload: false });
        break;

      case PlayerState.PAUSED:
        // If we should be playing (user interacted OR auto-advancing) and tab visible, resume
        if ((playerState.hasUserInteracted || playerState.isAutoAdvancing) && !document.hidden) {
          setTimeout(() => {
            if (playerRef.current) {
              try {
                playerRef.current.playVideo();
              } catch {}
            }
          }, 100);
        } else {
          playerDispatch({ type: 'SET_PLAYING', payload: false });
        }
        break;

      case PlayerState.BUFFERING:
        break;

      case PlayerState.CUED:
        // When a video is cued and we should continue playing, kick playback
        if (playerRef.current && (playerState.isPlaying || playerState.hasUserInteracted || playerState.isAutoAdvancing)) {
          setTimeout(() => {
            try {
              playerRef.current?.playVideo();
            } catch {}
          }, 100);
        }
        break;

      case PlayerState.UNSTARTED:
        // Occasionally gets stuck; if we intend to play, nudge it
        if (playerRef.current && (playerState.isPlaying || playerState.hasUserInteracted || playerState.isAutoAdvancing)) {
          setTimeout(() => {
            try {
              playerRef.current?.playVideo();
            } catch {}
          }, 100);
        }
        break;

      default:
        break;
    }
  };

  // Load video when current track changes
  useEffect(() => {
    if (!playerState.isPlayerReady || !playerRef.current || !queueState.currentTrack) {
      return;
    }

    const loadVideo = () => {
      const currentVideoId = queueState.playlist[queueState.currentTrackIndex];
      if (currentVideoId && currentVideoId !== playerState.currentVideoId) {
        // Check if we should auto-play
        // Auto-play if: currently playing, user has interacted, or we're auto-advancing
        const shouldAutoPlay = playerState.isPlaying || playerState.hasUserInteracted || playerState.isAutoAdvancing;
        
        playerRef.current?.loadVideoById(currentVideoId);
        playerDispatch({ type: 'SET_CURRENT_VIDEO', payload: currentVideoId });
        
        // Auto-play if we should continue playing
        if (shouldAutoPlay) {
          // Try immediate play, with a short retry if needed
          const tryPlay = (attempt: number) => {
            if (!playerRef.current) return;
            try {
              playerRef.current.playVideo();
              if (attempt < 2) {
                setTimeout(() => {
                  // If still not playing, try again once
                  tryPlay(attempt + 1);
                }, 250);
              }
            } catch {
              if (attempt < 2) {
                setTimeout(() => tryPlay(attempt + 1), 250);
              }
            }
          };
          tryPlay(0);

          // Watchdog: verify playback started shortly after load
          setTimeout(() => {
            try {
              const state = playerRef.current?.getPlayerState();
              if (state !== PlayerState.PLAYING && (playerState.isAutoAdvancing || playerState.hasUserInteracted || playerState.isPlaying)) {
                playerRef.current?.playVideo();
              }
            } catch {}
          }, 800);
        }
      }
    };

    loadVideo();
  }, [
    queueState.currentTrackIndex,
    queueState.playlist,
    queueState.currentTrack,
    playerState.isPlayerReady,
    playerState.currentVideoId,
    playerState.isPlaying,
    playerState.hasUserInteracted,
    playerState.isAutoAdvancing,
    playerRef,
    playerDispatch
  ]);



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, [playerRef]);

  return null; // This component doesn't render anything
}