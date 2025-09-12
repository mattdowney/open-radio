'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useQueue } from '../../contexts/QueueContext';
import { useUI } from '../../contexts/UIContext';
import { getYouTubeService, YouTubeAPIError } from '../../services/youtubeService';
import { YouTubePlayerManager } from './YouTubePlayerManager';
import { RadioLayout } from '../layout/RadioLayout';
import { Track } from '../../types/track';

const PLAYLIST_ID = process.env.NEXT_PUBLIC_PLAYLIST_ID || 'PLBtA_Wr4VtP-sZG5YoACVreBvhdLw1LKx';

export function RadioPlayer() {
  const initializingRef = useRef(false);
  const { state: playerState, togglePlayback } = usePlayer();
  const {
    state: queueState,
    dispatch: queueDispatch,
    setPlaylist,
    advanceToNextTrack,
    goToPreviousTrack,
    selectTrack,
    updateUpcomingTracks,
  } = useQueue();
  const { state: uiState, setError, setContentReady, setLoading } = useUI();

  const youtubeService = getYouTubeService();

  // Initialize playlist on mount
  useEffect(() => {
    const initializePlaylist = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        setLoading(true);

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Loading timeout - please refresh')), 15000)
        );

        const loadingPromise = (async () => {
          const videoIds = await youtubeService.fetchPlaylistItems(PLAYLIST_ID);
          setPlaylist(videoIds);

          // Validate initial tracks
          const initialTracks = videoIds.slice(0, 4);
          const validatedTracks = await youtubeService.validateTracks(initialTracks);

          if (validatedTracks.length > 0) {
            queueDispatch({
              type: 'SET_VALIDATED_TRACKS',
              payload: validatedTracks,
            });

            // Set current track
            const currentTrack = validatedTracks[0];
            queueDispatch({
              type: 'SET_CURRENT_TRACK',
              payload: {
                id: currentTrack.id,
                title: currentTrack.details.title,
                albumCoverUrl: currentTrack.details.albumCoverUrl,
              },
            });

            // Set upcoming tracks
            const upcoming: Track[] = validatedTracks.slice(1, 4).map((vt) => ({
              id: vt.id,
              title: vt.details.title,
              albumCoverUrl: vt.details.albumCoverUrl,
            }));
            updateUpcomingTracks(upcoming);

            setContentReady();
          } else {
            throw new Error('No valid tracks found in playlist');
          }
        })();

        // Race between loading and timeout
        await Promise.race([loadingPromise, timeoutPromise]);
      } catch (error) {
        console.error('Error initializing playlist:', error);
        setLoading(false);
        initializingRef.current = false;
        if (error instanceof YouTubeAPIError) {
          setError(error.message);
        } else {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load playlist. Please refresh the page.'
          );
        }
      }
    };

    if (queueState.playlist.length === 0) {
      initializePlaylist();
    }
  }, [
    queueState.playlist.length,
    setContentReady,
    setError,
    setLoading,
    setPlaylist,
    updateUpcomingTracks,
    youtubeService,
    queueDispatch,
  ]);

  // Update upcoming tracks when queue changes
  const updateQueue = useCallback(
    async (currentIndex: number) => {
      if (queueState.playlist.length === 0) return;

      try {
        // Get next 3 tracks (circular)
        const nextTrackIds: string[] = [];
        for (let i = 1; i <= 3; i++) {
          const nextIndex = (currentIndex + i) % queueState.playlist.length;
          nextTrackIds.push(queueState.playlist[nextIndex]);
        }

        // Validate tracks that aren't already validated (do this ONCE and reuse results)
        const unvalidatedIds = nextTrackIds.filter(
          (id) => !queueState.validatedTracks.some((vt) => vt.id === id)
        );

        let newlyValidatedTracks: typeof queueState.validatedTracks = [];
        if (unvalidatedIds.length > 0) {
          newlyValidatedTracks = await youtubeService.validateTracks(unvalidatedIds);
          if (newlyValidatedTracks.length > 0) {
            queueDispatch({
              type: 'ADD_VALIDATED_TRACKS',
              payload: newlyValidatedTracks,
            });
          }
        }

        // Get all validated tracks (existing + newly validated)
        const allValidatedTracks = [...queueState.validatedTracks, ...newlyValidatedTracks];

        // Update upcoming tracks
        const upcomingTracks: Track[] = nextTrackIds
          .map((id) => {
            const validated = allValidatedTracks.find((vt) => vt.id === id);
            if (validated) {
              return {
                id: validated.id,
                title: validated.details.title,
                albumCoverUrl: validated.details.albumCoverUrl,
              } as Track;
            }
            return null;
          })
          .filter((track): track is Track => track !== null);

        updateUpcomingTracks(upcomingTracks);
      } catch (error) {
        console.error('Error updating queue:', error);
      }
    },
    [queueState.playlist, queueState.validatedTracks, youtubeService]
  );

  // Handle track transition
  const handleTrackTransition = useCallback(
    async (trackId: string, retryCount: number = 0) => {
      try {
        queueDispatch({ type: 'SET_TRANSITIONING', payload: true });

        const trackIndex = queueState.playlist.indexOf(trackId);
        if (trackIndex === -1) {
          throw new Error('Track not found in playlist');
        }

        // Get or validate track details
        let validatedTrack = queueState.validatedTracks.find((vt) => vt.id === trackId);
        if (!validatedTrack) {
          const result = await youtubeService.validateTrack(trackId);
          if (!result) {
            // Try next track if current is invalid
            const nextIndex = (trackIndex + 1) % queueState.playlist.length;
            const nextId = queueState.playlist[nextIndex];
            if (retryCount < 3 && nextId && nextId !== trackId) {
              await handleTrackTransition(nextId, retryCount + 1);
              return;
            }
            throw new Error('Track validation failed');
          }
          validatedTrack = result;
          queueDispatch({
            type: 'ADD_VALIDATED_TRACKS',
            payload: [validatedTrack],
          });
        }

        // Update current track
        queueDispatch({ type: 'SET_CURRENT_TRACK_INDEX', payload: trackIndex });
        queueDispatch({
          type: 'SET_CURRENT_TRACK',
          payload: {
            id: validatedTrack.id,
            title: validatedTrack.details.title,
            albumCoverUrl: validatedTrack.details.albumCoverUrl,
          },
        });

        // Clear transitioning immediately so subsequent ENDED events aren't ignored
        queueDispatch({ type: 'SET_TRANSITIONING', payload: false });

        // Update upcoming tracks asynchronously (don't block transitions)
        void (async () => {
          try {
            await updateQueue(trackIndex);
          } catch (e) {
            console.error('Deferred queue update failed:', e);
          }
        })();
      } catch (error) {
        console.error('Error during track transition:', error);
        queueDispatch({ type: 'SET_TRANSITIONING', payload: false });

        if (error instanceof YouTubeAPIError) {
          setError(error.message);
        } else {
          setError('Failed to load track');
        }
      }
    },
    [queueState.playlist, queueState.validatedTracks, youtubeService, queueDispatch, updateQueue]
  );

  // Handle track end (auto-advance)
  const handleTrackEnd = useCallback(async () => {
    // Do not block ENDED if transitioning flag lingers; try advance anyway
    try {
      const nextIndex = (queueState.currentTrackIndex + 1) % queueState.playlist.length;
      const nextTrackId = queueState.playlist[nextIndex];
      if (nextTrackId) {
        await handleTrackTransition(nextTrackId);
      }
    } catch (error) {
      console.error('Error advancing to next track:', error);
      setError('Failed to advance to next track');
    }
  }, [queueState.currentTrackIndex, queueState.playlist, handleTrackTransition, setError]);

  // Player control handlers
  const handleNext = useCallback(() => {
    if (queueState.playlist.length > 0) {
      const nextIndex = (queueState.currentTrackIndex + 1) % queueState.playlist.length;
      const nextTrackId = queueState.playlist[nextIndex];
      if (nextTrackId) {
        handleTrackTransition(nextTrackId);
      }
    }
  }, [queueState.playlist, queueState.currentTrackIndex, handleTrackTransition]);

  const handlePrevious = useCallback(() => {
    if (queueState.playlist.length > 0) {
      const prevIndex =
        (queueState.currentTrackIndex - 1 + queueState.playlist.length) %
        queueState.playlist.length;
      const prevTrackId = queueState.playlist[prevIndex];
      if (prevTrackId) {
        handleTrackTransition(prevTrackId);
      }
    }
  }, [queueState.playlist, queueState.currentTrackIndex, handleTrackTransition]);

  const handleTrackSelect = useCallback(
    (trackId: string) => {
      handleTrackTransition(trackId);
    },
    [handleTrackTransition]
  );

  const handleError = useCallback((error: string) => {
    setError(error);
  }, []);

  return (
    <>
      <YouTubePlayerManager onTrackEnd={handleTrackEnd} onError={handleError} />
      <RadioLayout
        isLoading={uiState.isInitialLoad}
        error={uiState.error}
        currentTrack={queueState.currentTrack}
        upcomingTracks={queueState.upcomingTracks}
        isPlaying={playerState.isPlaying}
        volume={playerState.volume}
        isLoadingNext={queueState.isLoadingNext}
        isUIReady={uiState.isUIReady}
        isTransitioning={queueState.isTransitioning}
        onPlayPause={togglePlayback}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onTrackSelect={handleTrackSelect}
      />
    </>
  );
}
