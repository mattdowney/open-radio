export interface YouTubePlayer {
  destroy: () => void;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getPlayerState: () => number;
  getDuration: () => number;
  getCurrentTime: () => number;
  getVideoLoadedFraction: () => number;
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
    onReady: (event: { target: YouTubePlayer }) => void;
    onError: (event: { target: YouTubePlayer; data: number }) => void;
    onStateChange: (event: { target: YouTubePlayer; data: number }) => void;
  };
}

export const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type PlayerStateType = (typeof PlayerState)[keyof typeof PlayerState];

export interface PlayerError {
  code: number;
  message: string;
}
