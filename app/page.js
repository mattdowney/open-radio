'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { shuffle } from 'lodash';

const Radio = () => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const playlistId = 'PLBtA_Wr4VtP8lPRqTDWvGK-pSLqTdWwep';

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
    videoDuration: 0,
    currentTime: 0,
    timerId: null,
    isInitialPlay: true,
    playedSongs: [],
    countdownValue: '00:00',
    isCountdownLoading: false,
    pausedTime: 0,
    isTransitioning: false,
  });

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
    let seconds = Math.floor(time);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    if (seconds < 0) {
      seconds = 0;
    }
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  };

  useEffect(() => {
    import('pace-js').then((Pace) => {
      Pace.start();
    });
  }, []);

  useEffect(() => {
    fetchPlaylistDetails();
  }, []);

  useEffect(() => {
    if (state.playlist.length > 0 && !playerRef.current) {
      loadYouTubeIframeAPI();
    }
  }, [state.playlist]);

  useEffect(() => {
    if (state.isPlayerReady) {
      playerRef.current.setVolume(state.volume);
    }
  }, [state.isPlayerReady, state.volume]);

  useEffect(() => {
    return () => clearInterval(state.timerId);
  }, [state.timerId]);

  const handleVolumeChange = (event) => {
    const newVolume = Number(event.target.value);
    setState((prevState) => ({ ...prevState, volume: newVolume }));
    if (playerRef.current && state.isPlayerReady) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const loadYouTubeIframeAPI = () => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      initializePlayer(state.playlist[state.currentTrackIndex]);
    };
  };

  const initializePlayer = () => {
    playerRef.current = new YT.Player('radio-player', {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0,
        playlist: state.playlist.join(','),
        loop: 1,
        enablejsapi: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const fetchPlaylistDetails = async () => {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const videoIds = data.items.map((item) => item.snippet.resourceId.videoId);
    const shuffledVideoIds = shuffle(videoIds);
    setState((prevState) => ({ ...prevState, playlist: shuffledVideoIds }));
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

  useEffect(() => {
    if (state.isPlaying && state.videoDuration > 0) {
      setState((prevState) => ({
        ...prevState,
        countdownValue: formatTime(state.videoDuration - state.currentTime),
      }));
    } else if (!state.isPlaying && state.videoDuration > 0) {
      setState((prevState) => ({
        ...prevState,
        countdownValue: formatTime(state.videoDuration - state.pausedTime),
      }));
    } else {
      setState((prevState) => ({ ...prevState, countdownValue: '00:00' }));
    }
  }, [
    state.isPlaying,
    state.videoDuration,
    state.currentTime,
    state.pausedTime,
  ]);

  const onPlayerReady = (event) => {
    setState((prevState) => ({ ...prevState, isPlayerReady: true }));
    const duration = playerRef.current.getDuration();
    setState((prevState) => ({ ...prevState, videoDuration: duration }));
    fetchVideoDetails(state.playlist[0]);
  };

  const playPrevious = () => {
    if (
      state.isPlayerReady &&
      playerRef.current &&
      state.playedSongs.length > 0
    ) {
      const previousSong = state.playedSongs.pop(); // Remove the last played song
      setState((prevState) => ({
        ...prevState,
        currentTrackIndex: state.playlist.indexOf(previousSong),
        playedSongs: [...prevState.playedSongs], // Update the playedSongs array
      }));
      playerRef.current.loadVideoById(previousSong);
      fetchVideoDetails(previousSong);
    }
  };

  const playNext = async (autoAdvance = false) => {
    console.log(`Playing next track. Auto advance: ${autoAdvance}`);

    setState((prevState) => ({
      ...prevState,
      hasUserInteracted: true,
      isLoadingNext: true,
      isTransitioning: true,
      isContentVisible: false,
      imageLoaded: false,
      isTrackLoaded: false,
      videoDuration: 0,
      currentTime: 0,
    }));

    let nextIndex;
    if (state.playedSongs.length === state.playlist.length - 1) {
      // All songs have been played, reset playedSongs
      setState((prevState) => ({ ...prevState, playedSongs: [] }));
      nextIndex = state.playlist.findIndex(
        (id) => !state.playedSongs.includes(id),
      );
    } else {
      // Find a song that hasn't been played yet
      do {
        nextIndex = Math.floor(Math.random() * state.playlist.length);
      } while (
        state.playedSongs.includes(state.playlist[nextIndex]) ||
        nextIndex === state.currentTrackIndex
      );
    }

    const videoId = state.playlist[nextIndex];

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

    // Wait for fade-out
    await new Promise((resolve) => setTimeout(resolve, 300));

    const details = await fetchVideoDetails(videoId);
    setState((prevState) => ({
      ...prevState,
      videoDetails: {
        artist: details.artist,
        title: details.title,
        localizedTitle: details.localizedTitle,
      },
      albumCoverUrl: details.thumbnailUrl,
      isContentVisible: true,
      imageLoaded: false,
      currentTrackIndex: nextIndex,
    }));
    playerRef.current.loadVideoById(videoId);

    // Wait for new image to load before fading in
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        isLoadingNext: false,
        isTransitioning: false,
        imageLoaded: true,
      }));
    }, 300);
  };

  const onPlayerStateChange = (event) => {
    console.log('Player state changed:', event.data);

    switch (event.data) {
      case YT.PlayerState.PLAYING:
        setState((prevState) => ({
          ...prevState,
          isPlaying: true,
          isLoadingNext: false,
        }));
        const duration = playerRef.current.getDuration();
        console.log('Video duration:', duration);
        console.log('Video current time:', playerRef.current.getCurrentTime());
        console.log(
          'Video loaded fraction:',
          playerRef.current.getVideoLoadedFraction(),
        );
        console.log('Player volume:', playerRef.current.getVolume());
        console.log('Is player muted:', playerRef.current.isMuted());
        setState((prevState) => ({ ...prevState, videoDuration: duration }));
        if (!state.timerId) {
          const timer = setInterval(() => {
            setState((prevState) => ({
              ...prevState,
              currentTime: playerRef.current.getCurrentTime(),
            }));
          }, 500);
          setState((prevState) => ({ ...prevState, timerId: timer }));
        }
        break;
      case YT.PlayerState.PAUSED:
        clearInterval(state.timerId);
        setState((prevState) => ({
          ...prevState,
          timerId: null,
          isPlaying: false,
          pausedTime: playerRef.current.getCurrentTime(),
        }));
        break;
      case YT.PlayerState.ENDED:
        console.log('Track ended, playing next');
        playNext(true); // Pass true to indicate automatic advancement
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
      clearInterval(state.timerId);
      setState((prevState) => ({
        ...prevState,
        timerId: null,
        isPlaying: false,
      }));
    } else {
      playerRef.current.playVideo();
      setState((prevState) => ({
        ...prevState,
        isPlaying: true,
        isInitialPlay: false,
      }));
      const newTimerId = setInterval(() => {
        setState((prevState) => ({
          ...prevState,
          currentTime: playerRef.current.getCurrentTime(),
        }));
      }, 500);
      setState((prevState) => ({ ...prevState, timerId: newTimerId }));
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

  useEffect(() => {
    if (state.isLoadingNext) {
      setState((prevState) => ({ ...prevState, isCountdownLoading: true }));
    } else if (state.isPlaying && state.videoDuration > 0) {
      setState((prevState) => ({
        ...prevState,
        countdownValue: formatTime(state.videoDuration - state.currentTime),
        isCountdownLoading: false,
      }));
    } else if (!state.isPlaying && state.videoDuration > 0) {
      setState((prevState) => ({
        ...prevState,
        countdownValue: formatTime(state.videoDuration - state.pausedTime),
        isCountdownLoading: false,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        countdownValue: '00:00',
        isCountdownLoading: false,
      }));
    }
  }, [
    state.isLoadingNext,
    state.isPlaying,
    state.videoDuration,
    state.currentTime,
    state.pausedTime,
  ]);

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
      {!state.error && (
        <>
          <div id="radio-player"></div>

          <div
            className={`ui-radio w-screen h-screen overflow-hidden ${
              state.isInitialLoad ? '' : ''
            }`}
          >
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
                <div className="ui-controls-wrapper bg-white/20 md:backdrop-blur-lg py-8 md:py-12 px-6 sm:px-8 md:px-16 rounded-[45px] text-center shadow-[0px_100px_100px_rgba(0,0,0,0.2)] border-none md:border-white/10 md:border-[1px] w-10/12 md:w-5/12 lg:w-1/2 xl:w-3/12">
                  <div
                    className={`recordPlayer relative w-36 h-36 xl:w-40 xl:h-40 overflow-hidden mb-5 rounded-full spin-animation mx-auto text-center ${
                      state.isPlaying ? 'playing' : ''
                    }`}
                  >
                    <img
                      className={`record-image absolute inset-0 object-cover z-10 w-full h-full opacity-100 scale-[125%]`}
                      src={state.albumCoverUrl}
                      alt={state.videoDetails.title}
                      onLoad={handleImageLoaded}
                    />
                    {/* Simulated record grooves */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="w-full h-full border-[1px] border-black/0 rounded-full"></div>
                      <div className="absolute inset-2 border-[1px] border-black/40 rounded-full"></div>
                      <div className="absolute inset-4 border-[1px] border-black/40 rounded-full"></div>
                      <div className="absolute inset-6 border-[1px] border-black/40 rounded-full"></div>
                      <div className="absolute inset-8 border-[1px] border-black/40 rounded-full"></div>
                      <div className="absolute inset-10 border-[1px] border-black/40 rounded-full"></div>
                      Culpa tempor amet culpa in eu eiusmod amet. Id sunt id
                      aute eiusmod deserunt. Ex proident esse ea irure officia
                      quis nisi reprehenderit nulla nulla fugiat.
                      <div className="absolute inset-12 border-[1px] border-black/40 rounded-full"></div>
                      <div className="absolute inset-14 border-[1px] border-black/40 rounded-full"></div>
                      <div className="absolute inset-16 border-[1px] border-black/40 rounded-full"></div>
                      <div className="absolute inset-18 border-[1px] border-black/40 rounded-full"></div>
                      <div className="absolute inset-20 border-[1px] border-black/40 rounded-full"></div>
                    </div>
                    {/* Center hole */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                      <div className="w-3 h-3 bg-black/100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="mb-4" key={state.videoDetails.localizedTitle}>
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
                    <div className="countdown mt-1 mb-1.5 text-black font-mono">
                      {state.isCountdownLoading ? (
                        <span className="loading-indicator">00:00</span>
                      ) : (
                        state.countdownValue
                      )}
                    </div>
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
                  className="opacity-20 hover:opacity-100 absolute top-[calc(env(safe-area-inset-bottom)+1.25rem)] right-[1.25rem] transition-all duration-200 ease-in-out z-30"
                  href="https://www.mattdowney.com"
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

          <Script src="https://openpanel.dev/op.js" defer async />
          <Script id="openpanel-init">
            {`
              window.op = window.op || function (...args) { 
                (window.op.q = window.op.q || []).push(args); 
              };
              try {
                window.op('ctor', {
                  clientId: '78d516cc-50c3-48f5-93a5-b5ac3a5c24ec',
                  trackScreenViews: true,
                  trackOutgoingLinks: true,
                  trackAttributes: true,
                });
              } catch (error) {
                console.error('Error initializing OpenPanel:', error);
              }
            `}
          </Script>
        </>
      )}
    </div>
  );
};

export default Radio;
