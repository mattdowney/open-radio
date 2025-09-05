'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Track, ValidatedTrack } from '../types/track';

export interface QueueState {
  playlist: string[];
  currentTrackIndex: number;
  currentTrack: Track | null;
  upcomingTracks: Track[];
  playedTracks: string[];
  validatedTracks: ValidatedTrack[];
  isLoadingNext: boolean;
  isTransitioning: boolean;
}

export type QueueAction =
  | { type: 'SET_PLAYLIST'; payload: string[] }
  | { type: 'SET_CURRENT_TRACK_INDEX'; payload: number }
  | { type: 'SET_CURRENT_TRACK'; payload: Track | null }
  | { type: 'SET_UPCOMING_TRACKS'; payload: Track[] }
  | { type: 'ADD_PLAYED_TRACK'; payload: string }
  | { type: 'SET_PLAYED_TRACKS'; payload: string[] }
  | { type: 'ADD_VALIDATED_TRACKS'; payload: ValidatedTrack[] }
  | { type: 'SET_VALIDATED_TRACKS'; payload: ValidatedTrack[] }
  | { type: 'SET_LOADING_NEXT'; payload: boolean }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'REMOVE_TRACK_FROM_PLAYLIST'; payload: string }
  | { type: 'ADVANCE_TO_NEXT_TRACK' }
  | { type: 'GO_TO_PREVIOUS_TRACK' }
  | { type: 'RESET_QUEUE' };

const initialQueueState: QueueState = {
  playlist: [],
  currentTrackIndex: 0,
  currentTrack: null,
  upcomingTracks: [],
  playedTracks: [],
  validatedTracks: [],
  isLoadingNext: false,
  isTransitioning: false,
};

function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.payload };

    case 'SET_CURRENT_TRACK_INDEX':
      return { ...state, currentTrackIndex: action.payload };

    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };

    case 'SET_UPCOMING_TRACKS':
      return { ...state, upcomingTracks: action.payload };

    case 'ADD_PLAYED_TRACK':
      return {
        ...state,
        playedTracks: [...state.playedTracks, action.payload].slice(-10), // Keep last 10
      };

    case 'SET_PLAYED_TRACKS':
      return { ...state, playedTracks: action.payload };

    case 'ADD_VALIDATED_TRACKS':
      // Avoid duplicates when adding validated tracks
      const existingIds = new Set(state.validatedTracks.map((vt) => vt.id));
      const newValidatedTracks = action.payload.filter(
        (vt) => !existingIds.has(vt.id),
      );
      return {
        ...state,
        validatedTracks: [...state.validatedTracks, ...newValidatedTracks],
      };

    case 'SET_VALIDATED_TRACKS':
      return { ...state, validatedTracks: action.payload };

    case 'SET_LOADING_NEXT':
      return { ...state, isLoadingNext: action.payload };

    case 'SET_TRANSITIONING':
      return { ...state, isTransitioning: action.payload };

    case 'REMOVE_TRACK_FROM_PLAYLIST':
      const filteredPlaylist = state.playlist.filter(
        (id) => id !== action.payload,
      );
      // Adjust current index if needed
      const removedIndex = state.playlist.indexOf(action.payload);
      const newIndex =
        removedIndex < state.currentTrackIndex
          ? state.currentTrackIndex - 1
          : state.currentTrackIndex;

      return {
        ...state,
        playlist: filteredPlaylist,
        currentTrackIndex: Math.max(
          0,
          Math.min(newIndex, filteredPlaylist.length - 1),
        ),
        validatedTracks: state.validatedTracks.filter(
          (vt) => vt.id !== action.payload,
        ),
        upcomingTracks: state.upcomingTracks.filter(
          (track) => track.id !== action.payload,
        ),
      };

    case 'ADVANCE_TO_NEXT_TRACK':
      const nextIndex = (state.currentTrackIndex + 1) % state.playlist.length;
      return {
        ...state,
        currentTrackIndex: nextIndex,
        playedTracks: state.currentTrack
          ? [...state.playedTracks, state.currentTrack.id].slice(-10)
          : state.playedTracks,
      };

    case 'GO_TO_PREVIOUS_TRACK':
      const prevIndex =
        (state.currentTrackIndex - 1 + state.playlist.length) %
        state.playlist.length;
      return {
        ...state,
        currentTrackIndex: prevIndex,
      };

    case 'RESET_QUEUE':
      return { ...initialQueueState };

    default:
      return state;
  }
}

interface QueueContextType {
  state: QueueState;
  dispatch: React.Dispatch<QueueAction>;
  // Queue management methods
  setPlaylist: (playlist: string[]) => void;
  addValidatedTrack: (track: ValidatedTrack) => void;
  removeTrackFromPlaylist: (trackId: string) => void;
  advanceToNextTrack: () => void;
  goToPreviousTrack: () => void;
  selectTrack: (trackId: string) => void;
  updateUpcomingTracks: (tracks: Track[]) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialQueueState);

  const setPlaylist = (playlist: string[]) => {
    dispatch({ type: 'SET_PLAYLIST', payload: playlist });
    if (playlist.length > 0) {
      dispatch({ type: 'SET_CURRENT_TRACK_INDEX', payload: 0 });
    }
  };

  const addValidatedTrack = (track: ValidatedTrack) => {
    dispatch({ type: 'ADD_VALIDATED_TRACKS', payload: [track] });
  };

  const removeTrackFromPlaylist = (trackId: string) => {
    dispatch({ type: 'REMOVE_TRACK_FROM_PLAYLIST', payload: trackId });
  };

  const advanceToNextTrack = () => {
    dispatch({ type: 'ADVANCE_TO_NEXT_TRACK' });
  };

  const goToPreviousTrack = () => {
    dispatch({ type: 'GO_TO_PREVIOUS_TRACK' });
  };

  const selectTrack = (trackId: string) => {
    const trackIndex = state.playlist.indexOf(trackId);
    if (trackIndex !== -1) {
      dispatch({ type: 'SET_CURRENT_TRACK_INDEX', payload: trackIndex });
    }
  };

  const updateUpcomingTracks = (tracks: Track[]) => {
    dispatch({ type: 'SET_UPCOMING_TRACKS', payload: tracks });
  };

  const value: QueueContextType = {
    state,
    dispatch,
    setPlaylist,
    addValidatedTrack,
    removeTrackFromPlaylist,
    advanceToNextTrack,
    goToPreviousTrack,
    selectTrack,
    updateUpcomingTracks,
  };

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
