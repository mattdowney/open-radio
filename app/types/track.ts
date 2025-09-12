export interface Track {
  id: string;
  title: string;
  albumCoverUrl?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  volume: number;
  lastVolume: number;
  currentTime?: number;
  duration?: number;
  buffered?: number;
}

export interface TrackDetails {
  artist: string;
  title: string;
  localizedTitle: string;
  albumCoverUrl: string;
}

export interface PlayerState extends PlaybackState {
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

export interface ValidatedTrack {
  id: string;
  details: TrackDetails;
  isValid: boolean;
}
