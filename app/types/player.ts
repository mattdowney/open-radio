export interface YouTubePlayer {
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoLoadedFraction: () => number;
}

export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export interface PlayerError {
  code: number;
  message: string;
}

export interface PlayerConfig {
  height: string | number;
  width: string | number;
  videoId: string;
  playerVars: {
    autoplay: number;
    controls: number;
    disablekb: number;
    enablejsapi: number;
    fs: number;
    modestbranding: number;
    origin: string;
    playsinline: number;
    rel: number;
    mute: number;
    start: number;
  };
  events: {
    onReady: (event: any) => void;
    onError: (event: any) => void;
    onStateChange: (event: any) => void;
  };
}
