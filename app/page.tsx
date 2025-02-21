'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { shuffle } from 'lodash';
import Loading from './components/ui/Loading';
import LeftPanel from './components/layout/LeftPanel';
import { Track, PlayerState, ValidatedTrack } from './types/track';
import { cn } from './lib/utils';

declare namespace YT {
  class Player {
    constructor(elementId: string, options: PlayerOptions);
    destroy(): void;
    loadVideoById(videoId: string, startSeconds?: number): void;
    playVideo(): void;
    pauseVideo(): void;
    setVolume(volume: number): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getPlayerState(): number;
    getDuration(): number;
    getCurrentTime(): number;
  }

  interface PlayerOptions {
    height?: string | number;
    width?: string | number;
    videoId?: string;
    playerVars?: {
      autoplay?: 0 | 1;
      controls?: 0 | 1;
      disablekb?: 0 | 1;
      enablejsapi?: 0 | 1;
      fs?: 0 | 1;
      modestbranding?: 0 | 1;
      playsinline?: 0 | 1;
      rel?: 0 | 1;
      origin?: string;
      start?: number;
    };
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: { target: Player; data: number }) => void;
      onError?: (event: { target: Player; data: number }) => void;
    };
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayer extends YT.Player {
  loadVideoById(videoId: string, startSeconds?: number): void;
  playVideo(): void;
  pauseVideo(): void;
  setVolume(volume: number): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getPlayerState(): number;
  getDuration(): number;
  getCurrentTime(): number;
}

interface YouTubePlayerState {
  UNSTARTED: -1;
  ENDED: 0;
  PLAYING: 1;
  PAUSED: 2;
  BUFFERING: 3;
  CUED: 5;
}

interface YouTubeEvent {
  target: YouTubePlayer;
  data: number;
}

interface ProgressBarEvent extends React.MouseEvent<HTMLDivElement> {
  currentTarget: HTMLDivElement;
}

const Radio = () => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const playlistId = 'PLBtA_Wr4VtP-sZG5YoACVreBvhdLw1LKx';
  const playerRef = useRef<YouTubePlayer | null>(null);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isPlayerReady: false,
    isLoadingNext: false,
    currentTrackIndex: 0,
    playlist: [],
    videoDetails: { artist: '', title: '', localizedTitle: '' },
    albumCoverUrl: '',
    volume: 70,
    lastVolume: 70,
    isContentVisible: false,
    imageLoaded: false,
    isInitialLoad: true,
    isTrackLoaded: false,
    hasUserInteracted: false,
    isInitialPlay: true,
    playedSongs: [],
    isTransitioning: false,
    isUIReady: false,
    nextTrack: {
      videoId: null,
      details: null,
      imageLoaded: false,
    },
    upcomingTracks: [],
    validatedTracks: [],
    playbackQueue: {
      currentTrack: null,
      upcomingTracks: [],
      validatedTracks: [],
      playedTracks: [],
    },
  });

  const preloadImageRef = useRef(null);

  const handleImageLoaded = () => {
    if (!state.isTransitioning) {
      setState((prevState) => ({
        ...prevState,
        imageLoaded: true,
        isInitialLoad: false,
      }));
    }
  };

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return '--:--';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    console.log('Initial useEffect - Fetching playlist details');
    fetchPlaylistDetails();
  }, []);

  useEffect(() => {
    if (state.playlist.length > 0) {
      console.log('Playlist loaded, initializing YouTube player');

      const initPlayer = async () => {
        try {
          await loadYouTubeIframeAPI();
          // Small delay to ensure API is fully ready
          await new Promise((resolve) => setTimeout(resolve, 100));
          initializePlayer();
        } catch (error) {
          console.error('Error loading YouTube API:', error);
          setState((prevState) => ({
            ...prevState,
            error: 'Failed to load YouTube player',
            isInitialLoad: false,
          }));
        }
      };

      initPlayer();
    }
  }, [state.playlist]);

  useEffect(() => {
    if (state.isPlayerReady && playerRef.current) {
      playerRef.current.setVolume(state.volume);
    }
  }, [state.isPlayerReady, state.volume]);

  const handleVolumeChange = (event: { target: { value: string } }) => {
    const newVolume = Number(event.target.value);
    setState((prevState) => ({
      ...prevState,
      volume: newVolume,
      lastVolume: newVolume,
    }));
    if (playerRef.current && state.isPlayerReady) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleMuteToggle = () => {
    setState((prevState) => {
      const newVolume = prevState.volume === 0 ? prevState.lastVolume : 0;
      if (playerRef.current && state.isPlayerReady) {
        playerRef.current.setVolume(newVolume);
      }
      return {
        ...prevState,
        volume: newVolume,
      };
    });
  };

  const loadYouTubeIframeAPI = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.YT) {
        resolve();
        return;
      }

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

  const getErrorMessage = (errorCode: number): string => {
    switch (errorCode) {
      case 2:
        return 'Invalid video parameter';
      case 5:
        return 'Network error occurred';
      case 100:
        return 'Video not available';
      case 101:
      case 150:
        return 'Video playback not allowed';
      default:
        return 'Error loading video player';
    }
  };

  const initializePlayer = () => {
    console.log('Initializing YouTube player with playlist:', state.playlist);
    try {
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

      // Initialize new player with first track
      const firstVideoId = state.playlist[0];
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
          start: 0,
        },
        events: {
          onReady: (event) => {
            // Ensure the player instance has all required methods
            if (typeof event.target.loadVideoById !== 'function') {
              console.error('Player missing required methods');
              setState((prevState) => ({
                ...prevState,
                error: 'Failed to initialize video player properly',
                isInitialLoad: false,
              }));
              return;
            }

            // Store the player instance
            playerRef.current = event.target as YouTubePlayer;
            onPlayerReady(event);
          },
          onError: handlePlayerError,
          onStateChange: onPlayerStateChange,
        },
      });

      // Verify player was created
      if (!player) {
        throw new Error('Failed to create player instance');
      }
    } catch (error) {
      console.error('Error initializing player:', error);
      setState((prevState) => ({
        ...prevState,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initialize video player',
        isInitialLoad: false,
      }));
    }
  };

  const handlePlayerError = (event: { target: YT.Player; data: number }) => {
    console.error('YouTube player error:', event.data);
    const errorMessage = getErrorMessage(event.data);

    // If it's a video-specific error, try playing the next track
    if ([100, 101, 150].includes(event.data)) {
      console.log('Video-specific error, attempting to play next track');
      setState((prevState) => ({
        ...prevState,
        playlist: prevState.playlist.filter(
          (id) => id !== prevState.playlist[prevState.currentTrackIndex],
        ),
      }));
      playNext(true);
      return;
    }

    // For other errors, show the error message
    setState((prevState) => ({
      ...prevState,
      error: errorMessage,
      isInitialLoad: false,
    }));
  };

  const fetchPlaylistDetails = async () => {
    try {
      console.log('Starting playlist fetch');
      if (!apiKey) {
        console.error('YouTube API key is missing');
        setState((prevState) => ({
          ...prevState,
          error: 'YouTube API key is not configured.',
          isInitialLoad: false,
        }));
        return;
      }

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
      console.log(
        'Fetching playlist with URL:',
        url.replace(apiKey, 'REDACTED'),
      );

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('YouTube API Error:', errorData);
        setState((prevState) => ({
          ...prevState,
          error: `API Error: ${errorData.error?.message || 'Unknown error'}`,
          isInitialLoad: false,
        }));
        return;
      }

      const data = await response.json();
      console.log('Playlist API Response:', {
        ...data,
        items: data.items ? `${data.items.length} items` : 'no items',
      });

      if (!data || !data.items || !Array.isArray(data.items)) {
        console.error('Invalid API response structure:', data);
        setState((prevState) => ({
          ...prevState,
          error: 'Invalid playlist data received.',
          isInitialLoad: false,
        }));
        return;
      }

      const videoIds = data.items
        .filter(
          (
            item: any,
          ): item is { snippet: { resourceId: { videoId: string } } } =>
            item?.snippet?.resourceId?.videoId != null,
        )
        .map(
          (item: { snippet: { resourceId: { videoId: string } } }) =>
            item.snippet.resourceId.videoId,
        );

      console.log('Processed video IDs:', videoIds.length);

      if (videoIds.length === 0) {
        console.error('No valid video IDs found in playlist');
        setState((prevState) => ({
          ...prevState,
          error: 'No videos found in playlist.',
          isInitialLoad: false,
        }));
        return;
      }

      const shuffledVideoIds = shuffle(videoIds);
      console.log(
        'Setting playlist state with',
        shuffledVideoIds.length,
        'videos',
      );

      // Get initial tracks for validation (current + 3 upcoming)
      const currentTrackId = shuffledVideoIds[0];
      const initialUpcomingIds = shuffledVideoIds.slice(1, 4);
      const initialTracks = [currentTrackId, ...initialUpcomingIds];
      const initialValidatedTracks: ValidatedTrack[] = [];

      for (const trackId of initialTracks) {
        try {
          const validation = await validateTrack(trackId);
          if (validation) {
            initialValidatedTracks.push(validation);
          }
        } catch (error) {
          console.error(`Failed to validate initial track ${trackId}:`, error);
        }
      }

      // Create initial upcoming tracks list, ensuring current track is excluded
      const initialUpcomingTracks: Track[] = initialValidatedTracks
        .filter((vt) => vt.id !== currentTrackId)
        .map((vt) => ({
          id: vt.id,
          title: vt.details.title,
          albumCoverUrl: vt.details.albumCoverUrl || '',
        }))
        .slice(0, 3);

      setState((prevState) => ({
        ...prevState,
        playlist: shuffledVideoIds,
        playbackQueue: {
          currentTrack: currentTrackId,
          upcomingTracks: initialUpcomingIds,
          validatedTracks: initialValidatedTracks.filter(
            (vt) => vt.id !== currentTrackId,
          ),
          playedTracks: [],
        },
        upcomingTracks: initialUpcomingTracks,
        error: undefined,
        isInitialLoad: true,
      }));
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setState((prevState) => ({
        ...prevState,
        error: 'An error occurred while loading the playlist.',
        isInitialLoad: false,
      }));
    }
  };

  const fetchVideoDetails = async (videoId: string) => {
    try {
      if (!videoId) {
        throw new Error('Invalid video ID');
      }

      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
      const response = await fetch(detailsUrl);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Handle empty or invalid response
      if (!data?.items?.length) {
        console.error(`Video ${videoId} is no longer available`);
        // Remove the unavailable video from the playlist
        setState((prevState) => ({
          ...prevState,
          playlist: prevState.playlist.filter((id) => id !== videoId),
        }));
        throw new Error(`Video ${videoId} is no longer available`);
      }

      const item = data.items[0];
      const snippet = item.snippet;

      if (!snippet) {
        throw new Error('Invalid video data structure');
      }

      const fullTitle = snippet.title || '';
      const [artist, ...titleParts] = fullTitle.split(' - ');
      const title = titleParts.join(' - ') || fullTitle;

      // Use high quality thumbnail for album cover
      const albumCoverUrl =
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url;

      if (!albumCoverUrl) {
        throw new Error('No thumbnail available');
      }

      const localizedTitle = snippet.localized?.title || fullTitle;

      return {
        artist,
        title,
        albumCoverUrl,
        localizedTitle,
      };
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const onPlayerReady = (event: { target: YT.Player }) => {
    console.log('Player ready event fired');

    if (state.playlist[0]) {
      console.log('Fetching initial video details');
      fetchVideoDetails(state.playlist[0])
        .then((details) => {
          setState((prevState) => ({
            ...prevState,
            isPlayerReady: true,
            videoDetails: {
              artist: details.artist,
              title: details.title,
              localizedTitle: details.localizedTitle,
            },
            albumCoverUrl: details.albumCoverUrl,
            isContentVisible: true,
            imageLoaded: false,
            isInitialLoad: false,
            isUIReady: true,
            isPlaying: false,
          }));
        })
        .catch((error) => {
          console.error('Error fetching initial video details:', error);
          setState((prevState) => ({
            ...prevState,
            error: 'Error loading video details',
            isInitialLoad: false,
          }));
        });
    } else {
      console.error('No initial video in playlist');
      setState((prevState) => ({
        ...prevState,
        error: 'No videos available',
        isInitialLoad: false,
      }));
    }
  };

  const getPreviousTrackIndex = (
    currentIndex: number,
    playlistLength: number,
  ): number => {
    return (currentIndex - 1 + playlistLength) % playlistLength;
  };

  const playPrevious = async () => {
    if (!state.isPlayerReady || !playerRef.current) {
      return;
    }

    if (state.isTransitioning) {
      console.log('Track transition already in progress, skipping');
      return;
    }

    setState((prevState) => ({
      ...prevState,
      isLoadingNext: true,
      isTransitioning: true,
      imageLoaded: false,
    }));

    try {
      const playlistLength = state.playlist.length;
      const previousIndex = getPreviousTrackIndex(
        state.currentTrackIndex,
        playlistLength,
      );
      const previousTrackId = state.playlist[previousIndex];

      if (!previousTrackId) {
        throw new Error('Previous track not found');
      }

      // Get track details from validated tracks or validate now
      const validatedTrack = state.playbackQueue.validatedTracks.find(
        (vt) => vt.id === previousTrackId,
      );
      let details = validatedTrack?.details;

      if (!details) {
        const validation = await validateTrack(previousTrackId);
        if (!validation) {
          throw new Error('Track validation failed');
        }
        details = validation.details;
      }

      // Update state with previous track
      setState((prevState) => ({
        ...prevState,
        currentTrackIndex: previousIndex,
        videoDetails: {
          artist: details.artist,
          title: details.title,
          localizedTitle: details.localizedTitle,
        },
        albumCoverUrl: details.albumCoverUrl,
        playbackQueue: {
          ...prevState.playbackQueue,
          currentTrack: previousTrackId,
        },
        isContentVisible: true,
      }));

      // Load video
      if (playerRef.current) {
        (playerRef.current as YouTubePlayer).loadVideoById(previousTrackId);
      } else {
        await initializePlayer();
        if (!playerRef.current) {
          throw new Error('Failed to reinitialize player');
        }
        (playerRef.current as YouTubePlayer).loadVideoById(previousTrackId);
      }

      // Update the queue with the new current track
      await updatePlaybackQueue(previousTrackId, previousIndex);

      await new Promise((resolve) => requestAnimationFrame(resolve));

      setState((prevState) => ({
        ...prevState,
        isLoadingNext: false,
        isTransitioning: false,
        imageLoaded: true,
        isPlaying: true,
      }));
    } catch (error) {
      console.error('Error playing previous track:', error);
      setState((prevState) => ({
        ...prevState,
        isLoadingNext: false,
        isTransitioning: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to play previous track',
      }));
    }
  };

  const validateTrack = async (
    trackId: string,
  ): Promise<ValidatedTrack | null> => {
    try {
      const details = await fetchVideoDetails(trackId);
      return {
        id: trackId,
        details,
        isValid: true,
      };
    } catch (error) {
      console.error(`Track ${trackId} validation failed:`, error);
      return null;
    }
  };

  const updatePlaybackQueue = async (
    currentTrackId: string,
    startIndex: number,
  ) => {
    if (!state.playlist.length) return;

    const playlistLength = state.playlist.length;

    // Calculate the next tracks starting from the given index
    const remainingTracks = state.playlist
      .slice(startIndex + 1)
      .concat(state.playlist.slice(0, startIndex))
      .filter((id) => id !== currentTrackId);

    // Take exactly 3 tracks for the upcoming queue
    const nextThreeTracks = remainingTracks.slice(0, 3);

    // Filter out tracks that need validation
    const tracksToValidate = nextThreeTracks.filter(
      (trackId) =>
        !state.playbackQueue.validatedTracks.some((vt) => vt.id === trackId),
    );

    try {
      // Validate new tracks
      const newValidatedTracks: ValidatedTrack[] = [];
      for (const trackId of tracksToValidate) {
        try {
          const validation = await validateTrack(trackId);
          if (validation) {
            newValidatedTracks.push(validation);
          }
        } catch (error) {
          console.error(`Failed to validate track ${trackId}:`, error);
        }
      }

      // Update state with new tracks
      setState((prevState) => {
        // Get existing validated tracks that are still relevant
        const existingValidTracks =
          prevState.playbackQueue.validatedTracks.filter((vt) =>
            nextThreeTracks.includes(vt.id),
          );

        // Combine validated tracks, ensuring no duplicates
        const allValidatedTracks = [
          ...existingValidTracks,
          ...newValidatedTracks,
        ].filter(
          (vt, index, self) => index === self.findIndex((t) => t.id === vt.id),
        );

        // Create the upcoming tracks list for UI
        const upcomingTracks: Track[] = nextThreeTracks
          .map((id): Track | null => {
            const validTrack = allValidatedTracks.find((vt) => vt.id === id);
            if (!validTrack) return null;
            return {
              id: validTrack.id,
              title: validTrack.details.title,
              albumCoverUrl: validTrack.details.albumCoverUrl,
            };
          })
          .filter((track): track is Track => track !== null)
          .slice(0, 3);

        return {
          ...prevState,
          playbackQueue: {
            ...prevState.playbackQueue,
            currentTrack: currentTrackId,
            upcomingTracks: nextThreeTracks,
            validatedTracks: allValidatedTracks,
          },
          upcomingTracks,
        };
      });
    } catch (error) {
      console.error('Error updating playback queue:', error);
    }
  };

  const handleTrackTransition = async (
    nextTrackId: string,
    autoAdvance = false,
  ) => {
    if (state.isTransitioning) {
      console.log('Track transition already in progress, skipping');
      return;
    }

    // Verify the track is in the upcoming queue if not auto-advancing
    if (
      !autoAdvance &&
      !state.playbackQueue.upcomingTracks.includes(nextTrackId)
    ) {
      console.error('Attempted to play track not in queue:', nextTrackId);
      return;
    }

    setState((prevState) => ({
      ...prevState,
      hasUserInteracted: true,
      isLoadingNext: true,
      isTransitioning: true,
      imageLoaded: false,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Get track details from validated tracks or validate now
      const validatedTrack = state.playbackQueue.validatedTracks.find(
        (vt) => vt.id === nextTrackId,
      );
      let details = validatedTrack?.details;

      if (!details) {
        const validation = await validateTrack(nextTrackId);
        if (!validation) {
          throw new Error('Track validation failed');
        }
        details = validation.details;
      }

      // Find the new index in the playlist
      const newIndex = state.playlist.indexOf(nextTrackId);
      if (newIndex === -1) {
        throw new Error('Track not found in playlist');
      }

      // Update state with new track
      setState((prevState) => ({
        ...prevState,
        currentTrackIndex: newIndex,
        videoDetails: {
          artist: details.artist,
          title: details.title,
          localizedTitle: details.localizedTitle,
        },
        albumCoverUrl: details.albumCoverUrl,
        playbackQueue: {
          ...prevState.playbackQueue,
          currentTrack: nextTrackId,
          playedTracks: [
            ...prevState.playbackQueue.playedTracks,
            prevState.playlist[prevState.currentTrackIndex],
          ],
        },
        isContentVisible: true,
      }));

      // Load video
      if (playerRef.current) {
        (playerRef.current as YouTubePlayer).loadVideoById(nextTrackId);
      } else {
        await initializePlayer();
        if (!playerRef.current) {
          throw new Error('Failed to reinitialize player');
        }
        (playerRef.current as YouTubePlayer).loadVideoById(nextTrackId);
      }

      // Update the queue with the new current track
      await updatePlaybackQueue(nextTrackId, newIndex);

      await new Promise((resolve) => requestAnimationFrame(resolve));

      setState((prevState) => ({
        ...prevState,
        isLoadingNext: false,
        isTransitioning: false,
        imageLoaded: true,
        isPlaying: true,
      }));
    } catch (error) {
      console.error('Error during track transition:', error);
      if (autoAdvance && state.playlist.length > 1) {
        setState((prevState) => ({
          ...prevState,
          playlist: prevState.playlist.filter((id) => id !== nextTrackId),
          isLoadingNext: false,
          isTransitioning: false,
        }));
        return playNext(true);
      }
      setState((prevState) => ({
        ...prevState,
        isLoadingNext: false,
        isTransitioning: false,
        error: error instanceof Error ? error.message : 'Failed to load track',
      }));
    }
  };

  const playNext = async (autoAdvance = false) => {
    console.log(`Playing next track. Auto advance: ${autoAdvance}`);

    if (state.playlist.length === 0) {
      setState((prevState) => ({
        ...prevState,
        error: 'No more videos available in playlist',
        isInitialLoad: false,
      }));
      return;
    }

    try {
      const currentIndex = state.currentTrackIndex;
      const nextIndex = (currentIndex + 1) % state.playlist.length;
      const nextVideoId = state.playlist[nextIndex];

      if (!nextVideoId) {
        throw new Error('No next track available');
      }

      await handleTrackTransition(nextVideoId, autoAdvance);
    } catch (error) {
      console.error('Error playing next track:', error);
      // If we're auto-advancing and have more tracks, try the next one
      if (autoAdvance && state.playlist.length > 1) {
        console.log('Error with current track, trying next one');
        setState((prevState) => ({
          ...prevState,
          playlist: prevState.playlist.filter(
            (_, i) => i !== state.currentTrackIndex,
          ),
        }));
        return playNext(true);
      }

      setState((prevState) => ({
        ...prevState,
        error:
          error instanceof Error ? error.message : 'Failed to play next track',
        isLoadingNext: false,
      }));
    }
  };

  const onPlayerStateChange = (event: YouTubeEvent) => {
    console.log('Player state changed:', event.data);

    switch (event.data) {
      case window.YT.PlayerState.UNSTARTED: // -1
        console.log('Video unstarted - waiting for user interaction');
        setState((prevState) => ({
          ...prevState,
          isPlaying: false,
        }));
        break;

      case window.YT.PlayerState.ENDED: // 0
        console.log('Track ended, playing next');
        // Ensure we're not already transitioning
        if (!state.isTransitioning) {
          playNext(true).catch((error) => {
            console.error('Error auto-advancing to next track:', error);
            setState((prevState) => ({
              ...prevState,
              error: 'Failed to auto-advance to next track',
            }));
          });
        }
        break;

      case window.YT.PlayerState.PLAYING: // 1
        console.log('Video started playing');
        setState((prevState) => ({
          ...prevState,
          isPlaying: true,
          isLoadingNext: false,
          isInitialLoad: false,
        }));
        break;

      case window.YT.PlayerState.PAUSED: // 2
        console.log('Video paused');
        // Only update state if we're not transitioning
        if (!state.isTransitioning) {
          setState((prevState) => ({
            ...prevState,
            isPlaying: false,
          }));
        }
        break;

      case window.YT.PlayerState.BUFFERING: // 3
        console.log('Video buffering');
        break;

      case window.YT.PlayerState.CUED: // 5
        console.log('Video cued');
        // If we have a cued video and we're supposed to be playing, start it
        if (state.isPlaying && playerRef.current) {
          (playerRef.current as YouTubePlayer).playVideo();
        }
        break;

      default:
        break;
    }
  };

  const togglePlayback = () => {
    if (!state.isPlayerReady || !playerRef.current) {
      return;
    }

    if (state.isPlaying) {
      (playerRef.current as YouTubePlayer).pauseVideo();
      setState((prevState) => ({
        ...prevState,
        isPlaying: false,
      }));
    } else {
      (playerRef.current as YouTubePlayer).playVideo();
      setState((prevState) => ({
        ...prevState,
        isPlaying: true,
        isInitialPlay: false,
      }));
    }
  };

  useEffect(() => {
    const loadVideo = async () => {
      if (
        !state.isPlayerReady ||
        !state.playlist.length ||
        !playerRef.current
      ) {
        return;
      }

      try {
        const videoId = state.playlist[state.currentTrackIndex];
        if (!videoId) {
          throw new Error('Invalid video ID');
        }

        const details = await fetchVideoDetails(videoId);
        console.log('Fetched video details:', details);

        // Update state first
        setState((prevState) => ({
          ...prevState,
          videoDetails: {
            artist: details.artist,
            title: details.title,
            localizedTitle: details.localizedTitle,
          },
          albumCoverUrl: details.albumCoverUrl,
          isContentVisible: true,
          imageLoaded: true,
        }));

        // Ensure player is still available after state update
        if ((playerRef.current as YouTubePlayer).loadVideoById) {
          (playerRef.current as YouTubePlayer).loadVideoById(videoId);
        } else {
          throw new Error('Player not properly initialized');
        }
      } catch (error) {
        console.error('Error loading video:', error);
        setState((prevState) => ({
          ...prevState,
          error:
            error instanceof Error ? error.message : 'Failed to load video',
          isLoadingNext: false,
        }));
      }
    };

    loadVideo();
  }, [state.currentTrackIndex, state.isPlayerReady, state.playlist]);

  const handlePreviousTrack = () => {
    playPrevious();
  };

  const handleNextTrack = () => {
    playNext(false); // Pass false to indicate manual advancement
  };

  useEffect(() => {
    const marqueeContent = document.querySelector(
      '.marquee-content',
    ) as HTMLElement;
    const marquee = document.querySelector('.marquee') as HTMLElement;
    if (marqueeContent && marquee && state.videoDetails.title) {
      const contentWidth = marqueeContent.offsetWidth;
      const containerWidth = marquee.offsetWidth;
      const duration = (contentWidth / containerWidth) * 5;
      marqueeContent.style.animationDuration = `${duration}s`;
    }
  }, [state.videoDetails.title]);

  // Add this function to check the title length
  const isTitleShort = (title: string): boolean => {
    return (title || '').length <= 24;
  };

  const handleTrackSelect = async (trackId: string) => {
    await handleTrackTransition(trackId, false);
  };

  const handleStateChange = (event: YouTubeEvent) => {
    // ... existing code ...
  };

  const handleError = (event: YouTubeEvent) => {
    // ... existing code ...
  };

  const handleProgressBarClick = (event: ProgressBarEvent) => {
    if (!playerRef.current || typeof state.duration === 'undefined') return;
    const progressBar = event.currentTarget;
    const clickPosition =
      event.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.offsetWidth;
    const seekTime = (clickPosition / progressBarWidth) * state.duration;
    (playerRef.current as YouTubePlayer).seekTo(seekTime, true);
  };

  const handleTrackClick = (track: Track) => {
    // ... existing code ...
  };

  const handleTrackDoubleClick = (track: Track) => {
    // ... existing code ...
  };

  const validateTracks = async (tracks: Track[]): Promise<Track[]> => {
    const validatedTracks: Track[] = [];
    for (const track of tracks) {
      const validatedTrack = await validateTrack(track.id);
      if (validatedTrack) {
        validatedTracks.push({
          id: validatedTrack.id,
          title: validatedTrack.details.title,
          albumCoverUrl: validatedTrack.details.albumCoverUrl,
        });
      }
    }
    return validatedTracks;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Loading State */}
      {state.isInitialLoad && <Loading />}

      {/* Only show the rest of the UI when not in initial loading state */}
      {!state.isInitialLoad && (
        <>
          {/* Background Blur Container - Positioned absolutely */}
          {state.isUIReady && (
            <div className="fixed inset-0 w-screen h-screen overflow-hidden">
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
                        className="absolute inset-0 overflow-hidden"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'translateZ(0)',
                          willChange: 'transform, opacity',
                        }}
                      >
                        <div
                          className={cn(
                            'absolute inset-0 w-full h-full',
                            'transform scale-[2.5] origin-center',
                            state.imageLoaded &&
                              !state.isTransitioning &&
                              'animate-spin-only',
                          )}
                          style={{
                            filter: 'url(#gaussian-blur)',
                            opacity: state.isTransitioning ? 0 : 1,
                            transition: 'opacity 300ms ease-in-out',
                            willChange: 'transform, opacity',
                            backfaceVisibility: 'hidden',
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          <img
                            className="absolute inset-0 w-full h-full object-cover scale-[300%]"
                            style={{
                              opacity:
                                state.imageLoaded && !state.isTransitioning
                                  ? 1
                                  : 0,
                              transition: 'opacity 300ms ease-in-out',
                              willChange: 'transform, opacity',
                              backfaceVisibility: 'hidden',
                            }}
                            src={state.albumCoverUrl.replace(
                              'hqdefault',
                              'default',
                            )}
                            alt={state.videoDetails.title}
                            onLoad={handleImageLoaded}
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
            {state.isUIReady && (
              <div
                className="relative h-full bg-black/95 p-5 text-white"
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
                  <LeftPanel
                    currentTrack={{
                      id: state.playlist[state.currentTrackIndex] || '',
                      title: state.videoDetails.title,
                      albumCoverUrl: state.albumCoverUrl,
                    }}
                    isPlaying={state.isPlaying}
                    volume={state.volume}
                    upcomingTracks={state.upcomingTracks}
                    onPlayPause={togglePlayback}
                    onVolumeChange={handleVolumeChange}
                    onMuteToggle={handleMuteToggle}
                    onSkip={handleNextTrack}
                    onPrevious={playPrevious}
                    hasPreviousTrack={true}
                    onTrackSelect={handleTrackSelect}
                    isLoadingNext={state.isLoadingNext}
                  />
                </div>
              </div>
            )}

            {/* Error Display */}
            {state.error && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 text-white bg-red-500/20 backdrop-blur-lg p-6 rounded-lg border border-red-500/20">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p>{state.error}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Radio;
