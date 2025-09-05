'use client';

import {
  createContext,
  useContext,
  useReducer,
  useRef,
  ReactNode,
} from 'react';
import { YouTubePlayer } from '../types/player';

export interface PlayerState {
  isPlaying: boolean;
  isPlayerReady: boolean;
  volume: number;
  lastVolume: number;
  currentVideoId: string | null;
  duration: number | null;
  currentTime: number;
  hasUserInteracted: boolean;
  isAutoAdvancing: boolean;
}

export type PlayerAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_PLAYER_READY'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_LAST_VOLUME'; payload: number }
  | { type: 'SET_CURRENT_VIDEO'; payload: string | null }
  | { type: 'SET_DURATION'; payload: number | null }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_USER_INTERACTED'; payload: boolean }
  | { type: 'SET_AUTO_ADVANCING'; payload: boolean }
  | { type: 'RESET_PLAYER' };

const initialPlayerState: PlayerState = {
  isPlaying: false,
  isPlayerReady: false,
  volume: 70,
  lastVolume: 70,
  currentVideoId: null,
  duration: null,
  currentTime: 0,
  hasUserInteracted: false,
  isAutoAdvancing: false,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_PLAYER_READY':
      return { ...state, isPlayerReady: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_LAST_VOLUME':
      return { ...state, lastVolume: action.payload };
    case 'SET_CURRENT_VIDEO':
      return { ...state, currentVideoId: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_USER_INTERACTED':
      return { ...state, hasUserInteracted: action.payload };
    case 'SET_AUTO_ADVANCING':
      return { ...state, isAutoAdvancing: action.payload };
    case 'RESET_PLAYER':
      return {
        ...initialPlayerState,
        hasUserInteracted: state.hasUserInteracted,
      };
    default:
      return state;
  }
}

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
  // Player control methods
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  muteToggle: () => void;
  seekTo: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const play = () => {
    if (playerRef.current && state.isPlayerReady) {
      try {
        playerRef.current.playVideo();
      } finally {
        dispatch({ type: 'SET_PLAYING', payload: true });
        dispatch({ type: 'SET_USER_INTERACTED', payload: true });
      }
    }
  };

  const pause = () => {
    if (playerRef.current && state.isPlayerReady) {
      playerRef.current.pauseVideo();
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  };

  const togglePlayback = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const setVolume = (volume: number) => {
    if (playerRef.current && state.isPlayerReady) {
      playerRef.current.setVolume(volume);
      dispatch({ type: 'SET_VOLUME', payload: volume });
      if (volume > 0) {
        dispatch({ type: 'SET_LAST_VOLUME', payload: volume });
      }
    }
  };

  const muteToggle = () => {
    const newVolume = state.volume === 0 ? state.lastVolume : 0;
    setVolume(newVolume);
  };

  const seekTo = (time: number) => {
    if (playerRef.current && state.isPlayerReady && state.duration) {
      playerRef.current.seekTo(time, true);
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    }
  };

  const value: PlayerContextType = {
    state,
    dispatch,
    playerRef,
    play,
    pause,
    togglePlayback,
    setVolume,
    muteToggle,
    seekTo,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
