# Architecture Overview

This document provides a detailed technical overview of Open Radio's architecture, component structure, and design patterns.

## High-Level Architecture

Open Radio is built as a modern React application using Next.js 14 with the App Router pattern. The architecture follows a context-based state management approach with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│                    Next.js App Router                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   UI Components │ │  State Contexts │ │   Service Layer ││
│  │                 │ │                 │ │                 ││
│  │ • PlayerControls│ │ • PlayerContext │ │ • YouTubeService││
│  │ • VinylRecord   │ │ • QueueContext  │ │ • FirebaseDB    ││
│  │ • AlbumCover    │ │ • UIContext     │ │                 ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   External APIs                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   YouTube API   │ │  Firebase RTDB  │ │  Vercel Analytics│
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Core Technologies

- **Framework**: Next.js 14.2.32 with App Router
- **Language**: TypeScript 5.7.3
- **UI**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS with custom configuration
- **State Management**: React Context + useReducer
- **Build Tool**: Next.js built-in webpack configuration
- **Package Manager**: npm

## Component Architecture

### Component Organization

```
app/components/
├── layout/              # Layout and structure components
│   └── RadioLayout.tsx  # Main application layout
├── player/              # Player-related components  
│   ├── YouTubePlayerManager.tsx  # YouTube player integration
│   └── PlayerControls.tsx        # Play/pause/volume controls
├── visualization/       # Visual components
│   ├── VinylRecord.tsx           # Spinning vinyl animation
│   └── AlbumCover.tsx            # Album artwork display
├── media/              # Media information components
│   ├── TrackInfo.tsx             # Current track details
│   ├── ListenerCount.tsx         # Real-time listener count
│   └── Queue.tsx                 # Track queue display
└── ui/                 # Reusable UI components
    ├── Badge.tsx                 # Status badges
    ├── Button.tsx                # Interactive buttons
    ├── ErrorBoundary.tsx         # Error handling
    └── BlurredAlbumBackground.tsx # Dynamic backgrounds
```

### Component Design Patterns

**Functional Components with Hooks**
```typescript
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
}
```

**Context Consumer Pattern**
```typescript
export function PlayerComponent() {
  const { state, dispatch } = usePlayerContext();
  const { isPlaying, currentTrack } = state;
  
  const handlePlay = () => {
    dispatch({ type: 'PLAY_TRACK', payload: currentTrack });
  };
  
  return <button onClick={handlePlay}>Play</button>;
}
```

## State Management

Open Radio uses a **context-based state management** system with three main contexts to prevent coupling and race conditions.

### Context Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     App Component                           │
├─────────────────────────────────────────────────────────────┤
│                   Context Providers                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ PlayerContext   │ │  QueueContext   │ │   UIContext     ││
│  │                 │ │                 │ │                 ││
│  │ • isPlaying     │ │ • currentTrack  │ │ • isLoading     ││
│  │ • volume        │ │ • queue         │ │ • error         ││
│  │ • playerRef     │ │ • playlistId    │ │ • notifications ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### PlayerContext

Manages YouTube player state and controls:

```typescript
interface PlayerState {
  isPlaying: boolean;
  volume: number;
  playerRef: React.RefObject<any>;
  currentTime: number;
  duration: number;
}

type PlayerAction = 
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'UPDATE_TIME'; payload: { current: number; duration: number } };
```

### QueueContext

Handles playlist and track management:

```typescript
interface QueueState {
  currentTrack: Track | null;
  queue: Track[];
  playlistId: string;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'one' | 'all';
}

type QueueAction =
  | { type: 'LOAD_PLAYLIST'; payload: string }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'SHUFFLE_TOGGLE' };
```

### UIContext

Controls loading states and user feedback:

```typescript
interface UIState {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark';
}

type UIAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification };
```

## Service Layer

### YouTubeService

Centralized service for YouTube API interactions:

```typescript
class YouTubeService {
  private apiKey: string;
  private cache: Map<string, any>;
  
  async getPlaylist(playlistId: string): Promise<Playlist> {
    // API call with caching and error handling
  }
  
  async getVideoDetails(videoId: string): Promise<VideoDetails> {
    // Video metadata retrieval
  }
  
  async validateTracks(trackIds: string[]): Promise<Track[]> {
    // Batch validation for availability
  }
}
```

**Key Features:**
- **Singleton Pattern**: Single instance across the app
- **Caching**: Reduces API calls and improves performance
- **Error Handling**: Comprehensive error types and recovery
- **Rate Limiting**: Respects YouTube API quotas

### Firebase Integration

Optional real-time features through Firebase Realtime Database:

```typescript
interface FirebaseService {
  updateListenerCount(): Promise<void>;
  subscribeToListenerCount(callback: (count: number) => void): () => void;
  trackUserSession(): Promise<void>;
}
```

## Data Flow

### Track Loading Flow

```
User Action (Play Button)
    ↓
QueueContext.dispatch(PLAY_TRACK)
    ↓
YouTubeService.getVideoDetails()
    ↓
PlayerContext.dispatch(LOAD_TRACK)
    ↓
YouTubePlayerManager.loadVideo()
    ↓
UI Update (Playing State)
```

### Error Handling Flow

```
API Error (YouTube/Firebase)
    ↓
Service Layer Error Handling
    ↓
UIContext.dispatch(SET_ERROR)
    ↓
ErrorBoundary Component
    ↓
User Notification + Recovery Options
```

## Performance Optimizations

### Component Level

- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Expensive calculations and stable references
- **Lazy Loading**: Dynamic imports for large components

### API Level

- **Caching**: YouTube API responses cached for 1 hour
- **Batch Requests**: Multiple video details in single API call
- **Request Debouncing**: Prevent rapid successive API calls

### UI Level

- **CSS Transforms**: Hardware-accelerated animations
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Route-based code splitting via App Router

## Security Considerations

### API Security

- **Client-side API Keys**: YouTube API key exposed (read-only operations)
- **Domain Restrictions**: Recommended for production API keys
- **Rate Limiting**: Built-in YouTube API quota management

### Data Privacy

- **No User Authentication**: No personal data collected
- **Optional Analytics**: Vercel Analytics can be disabled
- **Firebase Security Rules**: Configure appropriate read/write permissions

## Browser Compatibility

### Supported Browsers

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Progressive Enhancement

- **Core Functionality**: Works without JavaScript (static HTML)
- **Enhanced Features**: Full interactivity with JavaScript enabled
- **Responsive Design**: Mobile-first Tailwind CSS approach

## Development Guidelines

### Code Organization

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports
import { motion } from 'framer-motion';

// 3. Local imports
import { usePlayerContext } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/Button';

// 4. Types
interface ComponentProps {
  title: string;
}

// 5. Component implementation
export function Component({ title }: ComponentProps) {
  // Component logic
}
```

### State Management Best Practices

- **Single Responsibility**: Each context manages one domain
- **Immutable Updates**: Always return new state objects
- **Type Safety**: Strict TypeScript types for all state and actions
- **Error Boundaries**: Wrap context providers in error boundaries

### Testing Strategy

Currently manual testing is required. Future testing infrastructure should include:

- **Unit Tests**: Utility functions and services
- **Component Tests**: React Testing Library
- **Integration Tests**: Context interactions
- **E2E Tests**: Critical user flows

## Deployment Architecture

### Static Generation

- **Build Time**: Static pages generated during build
- **Runtime**: Client-side hydration for interactivity
- **CDN**: Static assets served from CDN (Vercel/Netlify)

### Environment Configuration

- **Development**: Local environment with hot reloading
- **Staging**: Production build with test data
- **Production**: Optimized build with production APIs

For deployment details, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Future Architecture Considerations

### Scalability

- **Plugin System**: Extensible music source integrations
- **Multi-tenancy**: Support for multiple radio stations
- **Microservices**: Separate API services for complex features

### Performance

- **Service Workers**: Offline caching and background sync
- **WebAssembly**: Performance-critical audio processing
- **Streaming**: Real-time audio streaming capabilities

### Features

- **User Authentication**: Optional user accounts and preferences
- **Social Features**: Comments, sharing, and social integration
- **Advanced Analytics**: Detailed listening statistics and insights