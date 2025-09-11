# API Documentation

This document provides detailed information about the components, services, hooks, and TypeScript interfaces used in the radio application.

## Table of Contents

- [Context APIs](#context-apis)
- [Services](#services)
- [TypeScript Interfaces](#typescript-interfaces)
- [Component APIs](#component-apis)
- [Utility Functions](#utility-functions)

## Context APIs

### PlayerContext

**Location**: `app/contexts/PlayerContext.tsx`

The PlayerContext manages YouTube player state and controls.

#### State Interface

```typescript
interface PlayerState {
  isPlaying: boolean;           // Whether the player is currently playing
  isPlayerReady: boolean;       // Whether the YouTube player is ready
  volume: number;               // Current volume (0-100)
  lastVolume: number;           // Previous volume before muting
  currentVideoId: string | null; // Currently loaded video ID
  duration: number | null;      // Duration of current video in seconds
  currentTime: number;          // Current playback time in seconds
  hasUserInteracted: boolean;   // Whether user has interacted with player
  isAutoAdvancing: boolean;     // Whether auto-advance is in progress
}
```

#### Actions

```typescript
type PlayerAction =
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
```

#### Context Value

```typescript
interface PlayerContextType {
  state: PlayerState;
  dispatch: Dispatch<PlayerAction>;
  playerRef: MutableRefObject<YouTubePlayer | null>;
}
```

#### Usage

```typescript
import { usePlayerContext } from '@/contexts/PlayerContext';

const { state, dispatch, playerRef } = usePlayerContext();

// Play/pause
dispatch({ type: 'SET_PLAYING', payload: true });

// Set volume
dispatch({ type: 'SET_VOLUME', payload: 80 });
```

### QueueContext

**Location**: `app/contexts/QueueContext.tsx`

Manages the track queue and playlist functionality.

#### State Interface

```typescript
interface QueueState {
  tracks: ValidatedTrack[];     // Array of validated tracks
  currentIndex: number;         // Index of currently playing track
  isValidating: boolean;        // Whether track validation is in progress
}
```

### UIContext

**Location**: `app/contexts/UIContext.tsx`

Manages UI state, loading states, and error handling.

#### State Interface

```typescript
interface UIState {
  isLoading: boolean;           // Global loading state
  error: string | null;         // Current error message
  notification: string | null;  // Current notification message
}
```

### ThemeContext

**Location**: `app/contexts/ThemeContext.tsx`

Manages theme and visual styling state.

### VisualizerContext

**Location**: `app/contexts/VisualizerContext.tsx`

Manages visualizer selection and configuration.

## Services

### YouTubeService

**Location**: `app/services/youtubeService.ts`

Centralized service for YouTube API interactions.

#### Class Definition

```typescript
class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string);
}
```

#### Methods

##### `fetchPlaylistItems(playlistId: string): Promise<string[]>`

Fetches playlist items and returns shuffled video IDs.

**Parameters:**
- `playlistId: string` - YouTube playlist ID

**Returns:** `Promise<string[]>` - Array of video IDs

**Throws:** `YouTubeAPIError` on API failures

##### `validateTracks(videoIds: string[]): Promise<ValidatedTrack[]>`

Validates tracks and returns track details.

**Parameters:**
- `videoIds: string[]` - Array of YouTube video IDs

**Returns:** `Promise<ValidatedTrack[]>` - Array of validated tracks with metadata

#### Error Handling

```typescript
class YouTubeAPIError extends Error {
  constructor(message: string, public statusCode?: number);
}
```

## TypeScript Interfaces

### Player Types

**Location**: `app/types/player.ts`

#### YouTubePlayer Interface

```typescript
interface YouTubePlayer {
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
```

#### PlayerConfig Interface

```typescript
interface PlayerConfig {
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
```

#### Player States

```typescript
const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;
```

### Track Types

**Location**: `app/types/track.ts`

#### TrackDetails Interface

```typescript
interface TrackDetails {
  id: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  duration?: string;
}
```

#### ValidatedTrack Interface

```typescript
interface ValidatedTrack extends TrackDetails {
  isValid: boolean;
  validationError?: string;
}
```

### YouTube API Types

**Location**: `app/types/youtube.ts`

#### YouTubeVideoItem Interface

```typescript
interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  contentDetails: {
    duration: string;
  };
}
```

## Component APIs

### Major Components

#### RadioPlayer

**Location**: `app/components/player/RadioPlayer.tsx`

Main player component that orchestrates playback.

**Props:** None (uses context)

#### YouTubePlayerManager

**Location**: `app/components/player/YouTubePlayerManager.tsx`

Manages YouTube player initialization and lifecycle.

**Props:**
```typescript
interface Props {
  onPlayerReady?: () => void;
  onError?: (error: PlayerError) => void;
}
```

#### VolumeControl

**Location**: `app/components/ui/VolumeControl.tsx`

Volume control slider component.

**Props:**
```typescript
interface Props {
  className?: string;
}
```

#### TrackInfo

**Location**: `app/components/media/TrackInfo.tsx`

Displays current track information.

**Props:**
```typescript
interface Props {
  track: ValidatedTrack;
  className?: string;
}
```

## Utility Functions

### Color Extraction

**Location**: `app/utils/colorExtraction.ts`

#### `extractColors(imageUrl: string): Promise<ColorPalette>`

Extracts dominant colors from album artwork.

**Parameters:**
- `imageUrl: string` - URL of the image to analyze

**Returns:** `Promise<ColorPalette>` - Dominant colors

### Error Handling

The application uses React Error Boundaries and custom error types for graceful error handling:

- `YouTubeAPIError` - API-related errors
- `ValidationError` - Track validation errors
- `PlayerError` - YouTube player errors

### Best Practices

1. **Context Usage**: Always use context hooks rather than direct context consumption
2. **Error Handling**: Wrap API calls in try-catch blocks and use appropriate error types
3. **Type Safety**: Use TypeScript interfaces for all API responses and component props
4. **State Management**: Use the reducer pattern for complex state updates
5. **Performance**: Implement proper cleanup in useEffect hooks and component unmounting