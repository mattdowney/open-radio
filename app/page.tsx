'use client';

import { shuffle } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import LeftPanel from './components/layout/LeftPanel';
import { ListenerCount } from './components/media/ListenerCount';
import Loading from './components/ui/Loading';
import ShaderBackground from './components/ui/ShaderBackground';
import { cn } from './lib/utils';
import {
    PlayerConfig,
    PlayerState,
    PlayerStateType,
    YouTubePlayer,
} from './types/player';
import { Track, TrackDetails, ValidatedTrack } from './types/track';

declare global {
  interface Window {
    YT: {
      Player: {
        new (elementId: string, config: PlayerConfig): YouTubePlayer;
      };
      PlayerState: typeof PlayerState;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeEvent {
  target: YouTubePlayer;
  data: PlayerStateType;
}

interface ProgressBarEvent extends React.MouseEvent<HTMLDivElement> {
  currentTarget: HTMLDivElement;
}

interface AppState {
  isPlaying: boolean;
  isPlayerReady: boolean;
  isLoadingNext: boolean;
  currentTrackIndex: number;
  playlist: string[];
  videoDetails: {
    artist: string;
    title: string;
    localizedTitle: string;
  };
  albumCoverUrl: string;
  volume: number;
  lastVolume: number;
  isContentVisible: boolean;
  imageLoaded: boolean;
  isInitialLoad: boolean;
  isTrackLoaded: boolean;
  hasUserInteracted: boolean;
  isInitialPlay: boolean;
  playedSongs: string[];
  isTransitioning: boolean;
  isUIReady: boolean;
  error?: string;
  duration?: number;
  nextTrack: {
    videoId: string | null;
    details: TrackDetails | null;
    imageLoaded: boolean;
  };
  upcomingTracks: Track[];
  validatedTracks: ValidatedTrack[];
  playbackQueue: {
    currentTrack: string | null;
    upcomingTracks: string[];
    validatedTracks: ValidatedTrack[];
    playedTracks: string[];
  };
}

const Radio = () => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const playlistId = 'PLBtA_Wr4VtP-sZG5YoACVreBvhdLw1LKx';
  const playerRef = useRef<YouTubePlayer | null>(null);
  const currentIndexRef = useRef<number>(0);

  const [state, setState] = useState<AppState>({
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
      // Use requestAnimationFrame to ensure smooth state updates
      requestAnimationFrame(() => {
        setState((prevState) => ({
          ...prevState,
          imageLoaded: true,
          isInitialLoad: false,
        }));
      });
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
          mute: 0,
          start: 0,
        },
        events: {
          onReady: (event) => {
            if (typeof event.target.loadVideoById !== 'function') {
              console.error('Player missing required methods');
              setState((prevState) => ({
                ...prevState,
                error: 'Failed to initialize video player properly',
                isInitialLoad: false,
              }));
              return;
            }
            playerRef.current = event.target as YouTubePlayer;
            onPlayerReady(event as { target: YouTubePlayer });
          },
          onError: handlePlayerError,
          onStateChange: handlePlayerStateChange,
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

  const handlePlayerError = (event: { data: number }) => {
    const errorMessages = {
      2: 'Invalid video parameter',
      5: 'Network error occurred',
      100: 'Video not available',
      101: 'Video playback not allowed',
      150: 'Video playback not allowed',
    };

    const message =
      errorMessages[event.data as keyof typeof errorMessages] ||
      'Error loading video player';

    // If it's a video-specific error, try playing the next track
    if ([100, 101, 150].includes(event.data)) {
      setState((prevState: AppState) => ({
        ...prevState,
        playlist: prevState.playlist.filter(
          (id) => id !== prevState.playlist[prevState.currentTrackIndex],
        ),
      }));
      playNext(true);
      return;
    }

    // For other errors, show the error message
    setState((prevState: AppState) => ({
      ...prevState,
      error: message,
      isInitialLoad: false,
    }));
  };

  const fetchPlaylistDetails = async () => {
    try {
      console.log('Starting playlist fetch');
      if (!apiKey) {
        console.error('YouTube API key is missing');
        setState((prevState: AppState) => ({
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
        setState((prevState: AppState) => ({
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

      // Use highest quality thumbnail possible for album cover
      // Ensuring we prioritize maxres first, then high, etc.
      const albumCoverUrl =
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url;

      if (!albumCoverUrl) {
        throw new Error('No thumbnail available');
      }

      // For YouTube thumbnails, ensure we're getting highest quality
      const enhancedAlbumCoverUrl = albumCoverUrl.includes('ytimg.com')
        ? albumCoverUrl.replace(/\/[^\/]*default\.jpg/, '/maxresdefault.jpg')
        : albumCoverUrl;

      // Debug thumbnails
      if (process.env.NODE_ENV !== 'production') {
        console.log('DEBUG URL Thumbnails available:', {
          video: videoId,
          maxres: snippet.thumbnails?.maxres?.url ? 'available' : 'missing',
          high: snippet.thumbnails?.high?.url ? 'available' : 'missing',
          medium: snippet.thumbnails?.medium?.url ? 'available' : 'missing',
          default: snippet.thumbnails?.default?.url ? 'available' : 'missing',
          originalUrl: albumCoverUrl,
          enhancedUrl: enhancedAlbumCoverUrl
        });
        
        // Check if maxresdefault URL is actually accessible
        fetch(enhancedAlbumCoverUrl, { method: 'HEAD' })
          .then(response => {
            console.log(`Thumbnail URL ${enhancedAlbumCoverUrl} accessibility:`, 
              response.ok ? 'accessible' : 'not accessible',
              response.status
            );
          })
          .catch(error => {
            console.error('Error checking thumbnail URL:', error);
          });
      }

      const localizedTitle = snippet.localized?.title || fullTitle;

      return {
        artist,
        title,
        albumCoverUrl: enhancedAlbumCoverUrl,
        localizedTitle,
      };
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
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
    console.log('📋 Updating playback queue', {
      currentTrackId,
      startIndex,
      currentState: {
        playlistLength: state.playlist.length,
        currentQueue: state.playbackQueue,
      },
    });

    if (!state.playlist.length) return;

    // Get recently played tracks to avoid repeats
    const recentlyPlayed = new Set([
      currentTrackId,
      ...state.playbackQueue.playedTracks.slice(-5),
    ]);
    console.log('🎵 Recently played tracks:', Array.from(recentlyPlayed));

    // Create a pool of available tracks
    const availableTracks = state.playlist.filter(
      (trackId) => !recentlyPlayed.has(trackId),
    );
    console.log('📝 Available tracks pool:', availableTracks.length, 'tracks');

    if (availableTracks.length < 3) {
      console.log(
        '⚠️ Running low on available tracks, resetting played history',
      );
      recentlyPlayed.clear();
      recentlyPlayed.add(currentTrackId);
    }

    // Select next tracks
    const uniqueNextTracks: string[] = [];
    let position = 0;

    console.log('🔄 Starting track selection from index:', startIndex);
    while (uniqueNextTracks.length < 3 && position < state.playlist.length) {
      const nextPos = (startIndex + 1 + position) % state.playlist.length;
      const trackId = state.playlist[nextPos];
      console.log(`Checking track at position ${nextPos}:`, trackId);

      if (!recentlyPlayed.has(trackId)) {
        console.log('✅ Adding track to upcoming:', trackId);
        uniqueNextTracks.push(trackId);
        recentlyPlayed.add(trackId);
      } else {
        console.log('❌ Skipping recently played track:', trackId);
      }
      position++;
    }

    if (uniqueNextTracks.length < 3) {
      console.log('⚠️ Wrapping around playlist to fill upcoming tracks');
      position = 0;
      while (uniqueNextTracks.length < 3 && position < state.playlist.length) {
        const trackId = state.playlist[position];
        console.log(`Checking wrapped track at position ${position}:`, trackId);

        if (!recentlyPlayed.has(trackId)) {
          console.log('✅ Adding wrapped track to upcoming:', trackId);
          uniqueNextTracks.push(trackId);
          recentlyPlayed.add(trackId);
        } else {
          console.log('❌ Skipping recently played wrapped track:', trackId);
        }
        position++;
      }
    }

    console.log('📋 Final upcoming tracks:', {
      tracks: uniqueNextTracks,
      recentlyPlayed: Array.from(recentlyPlayed),
    });

    try {
      // Validate new tracks
      const validationPromises = uniqueNextTracks.map(async (trackId) => {
        if (
          state.playbackQueue.validatedTracks.some((vt) => vt.id === trackId)
        ) {
          return null; // Skip already validated tracks
        }
        return validateTrack(trackId);
      });

      const newValidatedTracks = (await Promise.all(validationPromises)).filter(
        (track): track is ValidatedTrack => track !== null,
      );

      // Update state with new tracks
      setState((prevState) => {
        // Get existing validated tracks that are still relevant
        const existingValidTracks =
          prevState.playbackQueue.validatedTracks.filter((vt) =>
            uniqueNextTracks.includes(vt.id),
          );

        // Combine validated tracks, ensuring no duplicates
        const allValidatedTracks = [
          ...existingValidTracks,
          ...newValidatedTracks,
        ].filter(
          (vt, index, self) => index === self.findIndex((t) => t.id === vt.id),
        );

        // Create the upcoming tracks list for UI
        const upcomingTracks: Track[] = uniqueNextTracks
          .map((id): Track | null => {
            const validTrack = allValidatedTracks.find((vt) => vt.id === id);
            if (!validTrack) return null;
            return {
              id: validTrack.id,
              title: validTrack.details.title,
              albumCoverUrl: validTrack.details.albumCoverUrl,
            };
          })
          .filter((track): track is Track => track !== null);

        console.log('Updating state with new upcoming tracks:', upcomingTracks);

        return {
          ...prevState,
          playbackQueue: {
            ...prevState.playbackQueue,
            currentTrack: currentTrackId,
            upcomingTracks: uniqueNextTracks,
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
    console.log('🎯 Starting track transition', {
      nextTrackId,
      autoAdvance,
      currentState: {
        isTransitioning: state.isTransitioning,
        currentTrackIndex: currentIndexRef.current,
        currentTrack: state.playbackQueue.currentTrack,
        upcomingTracks: state.playbackQueue.upcomingTracks,
        playedTracks: state.playbackQueue.playedTracks,
      },
    });

    if (state.isTransitioning) {
      console.log('⚠️ Track transition already in progress, skipping');
      return;
    }

    try {
      // Find the new index in the playlist
      const newIndex = state.playlist.indexOf(nextTrackId);
      console.log(
        '📌 New track index:',
        newIndex,
        'in playlist of length:',
        state.playlist.length,
      );

      if (newIndex === -1) {
        throw new Error('Track not found in playlist');
      }

      // Update the ref immediately
      currentIndexRef.current = newIndex;

      // Get track details from validated tracks or validate now
      const validatedTrack = state.playbackQueue.validatedTracks.find(
        (vt) => vt.id === nextTrackId,
      );
      console.log('🔍 Found validated track:', validatedTrack);

      let details = validatedTrack?.details;
      if (!details) {
        console.log('⏳ Validating new track:', nextTrackId);
        const validation = await validateTrack(nextTrackId);
        if (!validation) {
          throw new Error('Track validation failed');
        }
        details = validation.details;
      }

      // Update state with new track info BEFORE loading video
      await new Promise<void>((resolve) => {
        setState((prevState) => {
          const currentTrackId =
            prevState.playlist[prevState.currentTrackIndex];
          console.log('🔄 Updating state with new track', {
            currentTrackId,
            nextTrackId,
            prevQueueState: prevState.playbackQueue,
            newIndex,
            currentIndexRef: currentIndexRef.current,
          });

          // Add current track to played tracks if it exists
          const updatedPlayedTracks = currentTrackId
            ? [...prevState.playbackQueue.playedTracks, currentTrackId]
            : prevState.playbackQueue.playedTracks;

          // Remove the next track from upcoming tracks
          const remainingUpcomingTracks =
            prevState.playbackQueue.upcomingTracks.filter(
              (id) => id !== nextTrackId,
            );

          return {
            ...prevState,
            currentTrackIndex: currentIndexRef.current,
            videoDetails: {
              artist: details.artist,
              title: details.title,
              localizedTitle: details.localizedTitle,
            },
            albumCoverUrl: details.albumCoverUrl,
            playbackQueue: {
              ...prevState.playbackQueue,
              currentTrack: nextTrackId,
              upcomingTracks: remainingUpcomingTracks,
              playedTracks: updatedPlayedTracks,
            },
            isContentVisible: true,
          };
        });
        // Wait for state to be updated
        setTimeout(resolve, 0);
      });

      // Load video after state update
      if (playerRef.current) {
        console.log('▶️ Loading video:', nextTrackId);
        (playerRef.current as YouTubePlayer).loadVideoById(nextTrackId);
      } else {
        console.log('⚠️ Player not found, reinitializing...');
        await initializePlayer();
        if (!playerRef.current) {
          throw new Error('Failed to reinitialize player');
        }
        (playerRef.current as YouTubePlayer).loadVideoById(nextTrackId);
      }

      // Update the queue with the new current track
      console.log('📋 Updating playback queue for new track');
      const queueUpdatePromise = updatePlaybackQueue(
        nextTrackId,
        currentIndexRef.current,
      );

      // Wait for queue update to complete
      await queueUpdatePromise;

      // Final state update to complete transition
      setState((prevState) => ({
        ...prevState,
        isLoadingNext: false,
        isTransitioning: false,
        imageLoaded: true,
        isPlaying: true,
      }));

      console.log('✅ Track transition completed successfully');
    } catch (error) {
      console.error('❌ Error during track transition:', error);
      // Reset transition state and currentIndex on error
      currentIndexRef.current = state.currentTrackIndex;
      setState((prevState) => ({
        ...prevState,
        isLoadingNext: false,
        isTransitioning: false,
      }));

      if (autoAdvance && state.playlist.length > 1) {
        console.log('🔄 Auto-advance failed, removing track and trying next');
        setState((prevState) => ({
          ...prevState,
          playlist: prevState.playlist.filter((id) => id !== nextTrackId),
        }));
        await new Promise((resolve) => setTimeout(resolve, 100));
        return playNext(true);
      }

      setState((prevState) => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'Failed to load track',
      }));
    }
  };

  const playNext = async (autoAdvance = false) => {
    console.log(`Playing next track. Auto advance: ${autoAdvance}`, {
      currentState: {
        currentTrackIndex: currentIndexRef.current,
        playlistLength: state.playlist.length,
        currentTrack: state.playbackQueue.currentTrack,
      },
    });

    if (state.playlist.length === 0) {
      setState((prevState) => ({
        ...prevState,
        error: 'No more videos available in playlist',
        isInitialLoad: false,
      }));
      return;
    }

    try {
      const currentIndex = currentIndexRef.current;
      const nextIndex = (currentIndex + 1) % state.playlist.length;
      const nextVideoId = state.playlist[nextIndex];

      console.log('Advancing to next track:', {
        currentIndex,
        nextIndex,
        nextVideoId,
        currentIndexRef: currentIndexRef.current,
      });

      if (!nextVideoId) {
        throw new Error('No next track available');
      }

      await handleTrackTransition(nextVideoId, autoAdvance);
    } catch (error) {
      console.error('Error playing next track:', error);
      if (autoAdvance && state.playlist.length > 1) {
        console.log('Error with current track, trying next one');
        setState((prevState) => ({
          ...prevState,
          playlist: prevState.playlist.filter(
            (_, i) => i !== currentIndexRef.current,
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

  const handlePlayerStateChange = async (event: {
    target: YouTubePlayer;
    data: number;
  }) => {
    const playerState = event.data;
    console.log('🎵 Player state changed to:', playerState, {
      UNSTARTED: PlayerState.UNSTARTED,
      ENDED: PlayerState.ENDED,
      PLAYING: PlayerState.PLAYING,
      PAUSED: PlayerState.PAUSED,
      BUFFERING: PlayerState.BUFFERING,
    });

    switch (playerState) {
      case PlayerState.ENDED:
        console.log('📍 Track ended, current state:', {
          currentTrackIndex: state.currentTrackIndex,
          currentTrack: state.playbackQueue.currentTrack,
          upcomingTracks: state.playbackQueue.upcomingTracks,
          playedTracks: state.playbackQueue.playedTracks,
          isTransitioning: state.isTransitioning,
        });

        if (state.isTransitioning) {
          console.log(
            '⚠️ Skipping auto-advance - transition already in progress',
          );
          return;
        }

        // Instead of relying on the queue, use the playlist-based auto-advance
        await playNext(true);
        break;

      case PlayerState.PLAYING:
        console.log('Track started playing');
        setState((prevState) => ({
          ...prevState,
          isPlaying: true,
          error: undefined,
        }));
        break;

      case PlayerState.PAUSED:
        console.log('Track paused');
        setState((prevState) => ({
          ...prevState,
          isPlaying: false,
        }));
        break;

      case PlayerState.BUFFERING:
        // Don't update state during buffering to avoid flickering
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
                        className={cn(
                          'absolute inset-0 overflow-hidden bg-white/10',
                          'transition-opacity duration-300 ease-in-out',
                        )}
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
                            src={state.albumCoverUrl}
                            alt={state.videoDetails.title}
                            onLoad={handleImageLoaded}
                          />
                        </div>
                      </div>
                      {/* Move the listener count badge to the right panel's shader overlay */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Layer - Positioned relative on top of background */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] h-screen w-screen pointer-events-auto">
            {state.isUIReady && (
              <>
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
                
                {/* Shader Background - Right side panel */}
                <div className="relative h-full overflow-hidden bg-black">
                  {/* Only the shader exists here, no album image background */}
                  <ShaderBackground 
                    className="absolute inset-0" 
                    albumCoverUrl={state.albumCoverUrl}
                  />
                  
                  {/* Optional overlay for content on top of shader */}
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
