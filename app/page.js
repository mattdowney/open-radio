'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { shuffle } from 'lodash';
import Loading from './loading';

const Radio = () => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const playlistId = 'PLryv8MFPqMc6DdySjZxrP3-QjL7HRR8Up';

  const playerRef = useRef(null);
  const [state, setState] = useState({
    isPlaying: false,
    isPlayerReady: false,
    isLoadingNext: false,
    currentTrackIndex: 0,
    playlist: [],
    videoDetails: { artist: '', title: '', localizedTitle: '' },
    albumCoverUrl: '',
    volume: 70,
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

  const formatTime = (time) => {
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
    if (state.isPlayerReady) {
      playerRef.current.setVolume(state.volume);
    }
  }, [state.isPlayerReady, state.volume]);

  const handleVolumeChange = (event) => {
    const newVolume = Number(event.target.value);
    setState((prevState) => ({ ...prevState, volume: newVolume }));
    if (playerRef.current && state.isPlayerReady) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const loadYouTubeIframeAPI = () => {
    return new Promise((resolve, reject) => {
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
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
  };

  const getErrorMessage = (errorCode) => {
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

      playerRef.current = new window.YT.Player('radio-player', {
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
          onReady: onPlayerReady,
          onError: handlePlayerError,
          onStateChange: onPlayerStateChange,
        },
      });
    } catch (error) {
      console.error('Error initializing player:', error);
      setState((prevState) => ({
        ...prevState,
        error: `Failed to initialize video player: ${error.message}`,
        isInitialLoad: false,
      }));
    }
  };

  const handlePlayerError = (event) => {
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
        .filter((item) => item?.snippet?.resourceId?.videoId)
        .map((item) => item.snippet.resourceId.videoId);

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
      setState((prevState) => ({
        ...prevState,
        playlist: shuffledVideoIds,
        error: null,
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

  const fetchVideoDetails = async (videoId) => {
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
    const response = await fetch(detailsUrl);
    const data = await response.json();
    console.log('Raw API response:', data);

    if (data.items.length === 0) {
      throw new Error('Video details not found');
    }

    const item = data.items[0];
    const snippet = item.snippet;

    const fullTitle = snippet?.title || '';
    const [artist, ...titleParts] = fullTitle.split(' - ');
    const title = titleParts.join(' - ') || fullTitle;
    const thumbnailUrl =
      snippet?.thumbnails?.maxres?.url || snippet?.thumbnails?.high?.url;
    const localizedTitle = snippet?.localized?.title || fullTitle;

    console.log('Localized title:', localizedTitle);

    // ... rest of the console.log statements ...

    return { artist, title, thumbnailUrl, localizedTitle };
  };

  const onPlayerReady = (event) => {
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
            albumCoverUrl: details.thumbnailUrl,
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

  const playPrevious = () => {
    if (
      state.isPlayerReady &&
      playerRef.current &&
      state.playedSongs.length > 0
    ) {
      const previousSong = state.playedSongs[state.playedSongs.length - 1]; // Get last played song
      setState((prevState) => ({
        ...prevState,
        isLoadingNext: true,
        isTransitioning: true,
        isContentVisible: false,
        imageLoaded: false,
      }));

      // Remove the last song from playedSongs
      setState((prevState) => ({
        ...prevState,
        playedSongs: prevState.playedSongs.slice(0, -1),
        currentTrackIndex: state.playlist.indexOf(previousSong),
      }));

      // Load and play previous song
      fetchVideoDetails(previousSong).then((details) => {
        setState((prevState) => ({
          ...prevState,
          videoDetails: {
            artist: details.artist,
            title: details.title,
            localizedTitle: details.localizedTitle,
          },
          albumCoverUrl: details.thumbnailUrl,
          isContentVisible: true,
        }));

        playerRef.current.loadVideoById(previousSong);

        setTimeout(() => {
          setState((prevState) => ({
            ...prevState,
            isLoadingNext: false,
            isTransitioning: false,
            imageLoaded: true,
            isPlaying: true,
          }));
        }, 150);
      });
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

    setState((prevState) => ({
      ...prevState,
      hasUserInteracted: true,
      isLoadingNext: true,
      isTransitioning: true,
      isContentVisible: false,
      imageLoaded: false,
    }));

    try {
      let nextIndex;
      if (state.playedSongs.length === state.playlist.length - 1) {
        setState((prevState) => ({ ...prevState, playedSongs: [] }));
        nextIndex = state.playlist.findIndex(
          (id) => !state.playedSongs.includes(id),
        );
      } else {
        do {
          nextIndex = Math.floor(Math.random() * state.playlist.length);
        } while (
          state.playedSongs.includes(state.playlist[nextIndex]) ||
          nextIndex === state.currentTrackIndex
        );
      }

      const nextVideoId = state.playlist[nextIndex];

      // Add current song to playedSongs before moving to next
      if (state.playlist[state.currentTrackIndex]) {
        setState((prevState) => ({
          ...prevState,
          playedSongs: [
            ...prevState.playedSongs,
            state.playlist[state.currentTrackIndex],
          ],
        }));
      }

      // Fetch details for the next track
      const details = await fetchVideoDetails(nextVideoId);

      // Short fade out
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Update state with new track details
      setState((prevState) => ({
        ...prevState,
        videoDetails: {
          artist: details.artist,
          title: details.title,
          localizedTitle: details.localizedTitle,
        },
        albumCoverUrl: details.thumbnailUrl,
        currentTrackIndex: nextIndex,
        isContentVisible: true,
      }));

      // Load and play the video
      if (playerRef.current) {
        playerRef.current.loadVideoById(nextVideoId);
      } else {
        console.error('Player reference lost, reinitializing...');
        initializePlayer();
      }

      // Quick fade in
      setTimeout(() => {
        setState((prevState) => ({
          ...prevState,
          isLoadingNext: false,
          isTransitioning: false,
          imageLoaded: true,
          isPlaying: true,
        }));
      }, 150);
    } catch (error) {
      console.error('Error loading next track:', error);
      setState((prevState) => ({
        ...prevState,
        playlist: prevState.playlist.filter((id) => id !== nextVideoId),
      }));
      playNext(true);
    }
  };

  const onPlayerStateChange = (event) => {
    console.log('Player state changed:', event.data);

    switch (event.data) {
      case YT.PlayerState.UNSTARTED: // -1
        console.log('Video unstarted - waiting for user interaction');
        setState((prevState) => ({
          ...prevState,
        }));
        break;

      case YT.PlayerState.ENDED: // 0
        console.log('Track ended, playing next');
        playNext(true);
        break;

      case YT.PlayerState.PLAYING: // 1
        console.log('Video started playing');
        setState((prevState) => ({
          ...prevState,
          isPlaying: true,
          isLoadingNext: false,
          isInitialLoad: false,
        }));
        break;

      case YT.PlayerState.PAUSED: // 2
        console.log('Video paused');
        setState((prevState) => ({
          ...prevState,
          isPlaying: false,
        }));
        break;

      case YT.PlayerState.BUFFERING: // 3
        console.log('Video buffering');
        setState((prevState) => ({
          ...prevState,
        }));
        break;

      case YT.PlayerState.CUED: // 5
        console.log('Video cued');
        setState((prevState) => ({
          ...prevState,
        }));
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
      playerRef.current.pauseVideo();
      setState((prevState) => ({
        ...prevState,
        isPlaying: false,
      }));
    } else {
      playerRef.current.playVideo();
      setState((prevState) => ({
        ...prevState,
        isPlaying: true,
        isInitialPlay: false,
      }));
    }
  };

  useEffect(() => {
    if (state.isPlayerReady && state.playlist.length > 0) {
      const videoId = state.playlist[state.currentTrackIndex];
      fetchVideoDetails(videoId).then((details) => {
        console.log('Fetched video details:', details);
        setState((prevState) => {
          const newState = {
            ...prevState,
            videoDetails: {
              artist: details.artist,
              title: details.title,
              localizedTitle: details.localizedTitle,
            },
            albumCoverUrl: details.thumbnailUrl,
            isContentVisible: true,
            imageLoaded: true,
          };
          console.log('Updated state:', newState);
          return newState;
        });
        playerRef.current.loadVideoById(videoId);
      });
    }
  }, [state.currentTrackIndex, state.isPlayerReady, state.playlist]);

  const handlePreviousTrack = () => {
    playPrevious();
  };

  const handleNextTrack = () => {
    playNext(false); // Pass false to indicate manual advancement
  };

  useEffect(() => {
    const marqueeContent = document.querySelector('.marquee-content');
    const marquee = document.querySelector('.marquee');
    if (marqueeContent && marquee && state.videoDetails.title) {
      const contentWidth = marqueeContent.offsetWidth;
      const containerWidth = marquee.offsetWidth;
      const duration = (contentWidth / containerWidth) * 5; // Adjust the multiplier to change speed
      marqueeContent.style.animationDuration = `${duration}s`;
    }
  }, [state.videoDetails.title]);

  // Add this function to check the title length
  const isTitleShort = (title) => {
    return (title || '').length <= 24;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black">
      {state.error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 text-white bg-red-500/20 backdrop-blur-lg p-6 rounded-lg border border-red-500/20">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{state.error}</p>
        </div>
      )}

      {!state.error &&
        (state.isInitialLoad ? (
          <Loading />
        ) : (
          state.isUIReady && (
            <div className="ui-radio w-screen h-screen overflow-hidden animate-fade-in-dramatic">
              <div
                className={`ui-radio-container ${state.imageLoaded ? '' : ''}`}
              >
                <div className="ui-radio-image flex items-center justify-center h-screen w-screen bg-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    className="hidden"
                  >
                    <defs>
                      <filter id="gaussian-blur">
                        <feGaussianBlur
                          in="SourceGraphic"
                          stdDeviation="50"
                          result="blur1"
                        />
                        <feColorMatrix
                          type="matrix"
                          values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1"
                        />
                      </filter>
                    </defs>
                  </svg>

                  <div
                    className={`cover-image-container relative w-[200%] h-[200%] overflow-hidden transition-all duration-300 ease-in-out ${
                      state.imageLoaded && !state.isTransitioning
                        ? 'animate-spin-pulse'
                        : 'animate-spin-pulse'
                    }`}
                    style={{
                      filter:
                        state.imageLoaded && !state.isTransitioning
                          ? 'url(#gaussian-blur)'
                          : 'url(#gaussian-blur)',
                    }}
                  >
                    <img
                      className="cover-image object-cover w-full h-full opacity-100"
                      src={state.albumCoverUrl}
                      alt={state.videoDetails.title}
                      onLoad={handleImageLoaded}
                    />
                  </div>
                </div>

                <div
                  className={`ui-controls flex flex-col items-center justify-center fixed inset-0 z-10 transition-opacity duration-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 sm:p-6 md:p-7 w-full max-w-full max-h-full ${
                    state.isInitialLoad ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div className="ui-controls-wrapper bg-white/20 md:backdrop-blur-lg py-8 md:py-12 px-6 sm:px-8 md:px-16 rounded-[0.75rem] text-center shadow-[0px_100px_100px_rgba(0,0,0,0.2)] border-none md:border-white/10 md:border-[1px] w-10/12 md:w-5/12 lg:w-1/2 xl:w-3/12">
                    <div
                      className={`recordPlayer relative w-36 h-36 xl:w-40 xl:h-40 overflow-hidden mb-5 rounded-full spin-animation mx-auto text-center ${
                        state.isPlaying ? 'playing' : ''
                      }`}
                    >
                      <img
                        className={`record-image absolute inset-0 object-cover z-10 w-full h-full opacity-100 scale-[175%]`}
                        src={state.albumCoverUrl}
                        alt={state.videoDetails.title}
                        onLoad={handleImageLoaded}
                      />
                      {/* Simulated record grooves */}
                      <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="w-full h-full border-[1.5px] border-black/0 rounded-full"></div>
                        <div className="absolute inset-1 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-2 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-3 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-4 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-5 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-6 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-7 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-8 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-9 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-10 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-11 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-12 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-13 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-14 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-15 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-16 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-17 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-18 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-19 border-[1.5px] border-black/40 rounded-full"></div>
                        <div className="absolute inset-20 border-[1.5px] border-black/40 rounded-full"></div>
                      </div>
                      {/* Center hole */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 bg-black/100 rounded-full"></div>
                      </div>
                    </div>
                    <div
                      className="mb-4"
                      key={state.videoDetails.localizedTitle}
                    >
                      <h1
                        className={`text-black font-marfa mb-1.5 normal-case ${
                          isTitleShort(state.videoDetails.localizedTitle)
                            ? 'no-marquee'
                            : 'marquee marquee-gradient'
                        }`}
                      >
                        {isTitleShort(state.videoDetails.localizedTitle) ? (
                          <div className="no-marquee-content">
                            {state.videoDetails.localizedTitle || 'Loading...'}
                          </div>
                        ) : (
                          <div
                            className="marquee-content"
                            data-text={
                              state.videoDetails.localizedTitle || 'Loading...'
                            }
                            key={state.videoDetails.localizedTitle}
                            style={{
                              animationPlayState: state.isPlaying
                                ? 'running'
                                : 'paused',
                            }}
                          >
                            {state.videoDetails.localizedTitle || 'Loading...'}
                          </div>
                        )}
                      </h1>
                    </div>

                    <div className="ui-buttons inline-flex items-center justify-center bg-white/30 py-2 px-4 rounded-full">
                      <button
                        onClick={handlePreviousTrack}
                        className={`transition-all duration-200 ${
                          state.playedSongs.length === 0
                            ? 'text-black/20 cursor-not-allowed'
                            : 'text-black/100 hover:text-black/80'
                        }`}
                        disabled={state.playedSongs.length === 0}
                      >
                        <svg
                          className="previous fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M232,71.84V184.16a15.92,15.92,0,0,1-24.48,13.34L128,146.86v37.3a15.92,15.92,0,0,1-24.48,13.34L15.33,141.34a15.8,15.8,0,0,1,0-26.68L103.52,58.5A15.91,15.91,0,0,1,128,71.84v37.3L207.52,58.5A15.91,15.91,0,0,1,232,71.84Z"></path>
                        </svg>
                      </button>

                      <button
                        onClick={togglePlayback}
                        className="transition-all duration-200 mx-3"
                      >
                        {state.isPlaying ? (
                          <svg
                            className="pause fill-current text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                          >
                            <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"></path>
                          </svg>
                        ) : (
                          <svg
                            className="play fill-current text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                          >
                            <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path>
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={handleNextTrack}
                        className="transition-all duration-200 hover:opacity-100"
                      >
                        <svg
                          className="next fill-current text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M240.67,141.33l-88.19,56a15.93,15.93,0,0,1-24.48-13.35v-37.3L39.52,197.5A15.91,15.91,0,0,1,15,184.16V71.84A15.92,15.92,0,0,1,39.52,58.5L128,109.14V71.84a15.92,15.92,0,0,1,24.48-13.34l88.19,56a15.8,15.8,0,0,1,0,26.83Z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="close">
                  <a
                    className="opacity-60 hover:opacity-100 absolute top-[calc(env(safe-area-inset-bottom)+1.25rem)] right-[1.25rem] transition-all duration-200 ease-in-out z-30"
                    href="https://mattdowney.com"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      fill="#fbfbfb"
                      viewBox="0 0 256 256"
                    >
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )
        ))}
    </div>
  );
};

export default Radio;
