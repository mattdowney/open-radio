import { useEffect, useRef, useState } from 'react';
import { PlayerState, YouTubePlayer, PlayerConfig } from '../types/player';
import { fetchVideoDetails, fetchPlaylistItems } from '../lib/api/youtube';

interface UseYouTubePlayerProps {
  playlistId: string;
  onError?: (error: string) => void;
}

export function useYouTubePlayer({
  playlistId,
  onError,
}: UseYouTubePlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    artist: '',
    title: '',
    albumCoverUrl: '',
    id: '',
  });

  useEffect(() => {
    const initializePlaylist = async () => {
      try {
        const videoIds = await fetchPlaylistItems(playlistId);
        setPlaylist(videoIds);
      } catch (error) {
        onError?.(
          error instanceof Error ? error.message : 'Failed to load playlist',
        );
      }
    };

    initializePlaylist();
  }, [playlistId, onError]);

  useEffect(() => {
    if (playlist.length > 0) {
      const initPlayer = async () => {
        try {
          await loadYouTubeIframeAPI();
          await new Promise((resolve) => setTimeout(resolve, 100));
          initializePlayer();
        } catch (error) {
          onError?.(
            error instanceof Error
              ? error.message
              : 'Failed to initialize player',
          );
        }
      };

      initPlayer();
    }
  }, [playlist]);

  const loadYouTubeIframeAPI = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.YT) {
        resolve();
        return;
      }

      const container = document.createElement('div');
      container.id = 'radio-player';
      container.className = 'hidden';
      document.body.appendChild(container);

      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = reject;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    });
  };

  const initializePlayer = () => {
    const container = document.getElementById('radio-player');
    if (!container) {
      throw new Error('Player container not found');
    }

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const firstVideoId = playlist[0];
    if (!firstVideoId) {
      throw new Error('No video ID available');
    }

    const config: PlayerConfig = {
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
    };

    playerRef.current = new window.YT.Player('radio-player', config);
  };

  const handlePlayerReady = async () => {
    if (playlist[0]) {
      try {
        const details = await fetchVideoDetails(playlist[0]);
        setCurrentTrack({
          id: playlist[0],
          artist: details.artist,
          title: details.title,
          albumCoverUrl: details.thumbnailUrl,
        });
        setIsPlayerReady(true);
        playerRef.current?.setVolume(volume);
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : 'Failed to load track details',
        );
      }
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
    onError?.(message);

    if ([100, 101, 150].includes(event.data)) {
      setPlaylist((prev) =>
        prev.filter((id) => id !== playlist[currentTrackIndex]),
      );
      playNext(true);
    }
  };

  const handlePlayerStateChange = (event: { data: number }) => {
    switch (event.data) {
      case PlayerState.ENDED:
        playNext(true);
        break;
      case PlayerState.PLAYING:
        setIsPlaying(true);
        setIsLoadingNext(false);
        break;
      case PlayerState.PAUSED:
        setIsPlaying(false);
        break;
    }
  };

  const togglePlayback = () => {
    if (!isPlayerReady || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const playNext = async (autoAdvance = false) => {
    if (playlist.length === 0) {
      onError?.('No more videos available in playlist');
      return;
    }

    setIsLoadingNext(true);
    let nextIndex = currentTrackIndex;

    try {
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentTrackIndex);

      const nextVideoId = playlist[nextIndex];
      const details = await fetchVideoDetails(nextVideoId);

      setCurrentTrackIndex(nextIndex);
      setCurrentTrack({
        id: nextVideoId,
        artist: details.artist,
        title: details.title,
        albumCoverUrl: details.thumbnailUrl,
      });

      if (playerRef.current) {
        playerRef.current.loadVideoById(nextVideoId);
      } else {
        initializePlayer();
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : 'Failed to load next track',
      );
      setPlaylist((prev) => prev.filter((_, i) => i !== nextIndex));
      playNext(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current && isPlayerReady) {
      playerRef.current.setVolume(newVolume);
    }
  };

  return {
    isPlaying,
    isPlayerReady,
    volume,
    currentTrack,
    isLoadingNext,
    togglePlayback,
    handleVolumeChange,
    playNext,
  };
}
