export interface Track {
  id: string;
  title: string;
  albumCoverUrl?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  volume: number;
  currentTime?: number;
  duration?: number;
  buffered?: number;
}

export interface PlayerState extends PlaybackState {
  isPlayerReady: boolean;
  isLoadingNext: boolean;
  currentTrackIndex: number;
  playlist: string[];
  videoDetails: {
    title: string;
  };
  albumCoverUrl: string;
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
  nextTrack: {
    videoId: string | null;
    details: any | null;
    imageLoaded: boolean;
  };
  upcomingTracks: Track[];
}
