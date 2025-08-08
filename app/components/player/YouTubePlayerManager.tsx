'use client';

import { useEffect, useRef } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useQueue } from '../../contexts/QueueContext';
import { useUI } from '../../contexts/UIContext';
import { PlayerState, YouTubePlayer } from '../../types/player';

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
          console.log('YouTube IFrame API Ready');
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
      console.log('Initializing YouTube player');
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
        const player = new window.YT.Player('radio-player', {
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

  const handlePlayerReady = (event: { target: YouTubePlayer }) => {
    console.log('Player ready event fired');
    
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
      console.log('Video error, attempting to skip to next track');
      onTrackEnd();
      return;
    }

    // For other errors, show the error message
    onError(message);
  };

  const handlePlayerStateChange = (event: { target: YouTubePlayer; data: number }) => {
    const playerState = event.data;
    console.log('Player state changed to:', playerState);

    switch (playerState) {
      case PlayerState.ENDED:
        console.log('Track ended');
        onTrackEnd();
        break;

      case PlayerState.PLAYING:
        console.log('Track started playing');
        playerDispatch({ type: 'SET_PLAYING', payload: true });
        break;

      case PlayerState.PAUSED:
        console.log('Track paused');
        playerDispatch({ type: 'SET_PLAYING', payload: false });
        break;

      case PlayerState.BUFFERING:
        console.log('Track buffering');
        break;

      case PlayerState.UNSTARTED:
        console.log('Player unstarted');
        break;

      default:
        console.log('Unhandled player state:', playerState);
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
        console.log('Loading video:', currentVideoId);
        playerRef.current?.loadVideoById(currentVideoId);
        playerDispatch({ type: 'SET_CURRENT_VIDEO', payload: currentVideoId });
      }
    };

    loadVideo();
  }, [
    queueState.currentTrackIndex,
    queueState.playlist,
    queueState.currentTrack,
    playerState.isPlayerReady,
    playerState.currentVideoId,
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