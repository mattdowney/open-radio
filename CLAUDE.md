# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture Overview

This is a Next.js 14+ online radio application using the App Router pattern. The app streams music via YouTube API and provides real-time social features through Firebase.

### Core Technologies
- **Next.js 14.1.3** with App Router
- **React 18** with TypeScript
- **YouTube API** for music streaming
- **Firebase Realtime Database** for live listener count
- **WebGL/Three.js** for visual effects
- **Tailwind CSS** for styling

### Key Architecture Patterns

**Context-Based State Management:**
- `PlayerContext` - Manages YouTube player state, volume, playback controls
- `QueueContext` - Handles playlist, track queue, and track validation
- `UIContext` - Controls loading states, errors, and UI feedback
- All contexts use `useReducer` for predictable state updates

**Component Organization:**
- `app/components/layout/` - Layout components (RadioLayout)
- `app/components/media/` - Media player components (PlayerControls, VolumeControl, AlbumCover)  
- `app/components/ui/` - Reusable UI components (Badge, BlurredAlbumBackground, ErrorBoundary)
- `app/components/player/` - YouTube player management (YouTubePlayerManager)

**Service Layer:**
- `YouTubeService` - Centralized YouTube API client with proper error handling
- Singleton pattern for API service instances
- Comprehensive error types and validation

**Error Handling:**
- React Error Boundaries for graceful failure handling
- Custom error types for different failure scenarios
- Automatic error recovery and user feedback

**Styling Approach:**
- Tailwind CSS with custom configuration
- Custom color palette and typography (Geist and Polymath fonts)
- CSS-based blur effects for album backgrounds

### Important Implementation Details

**State Management Architecture:**
- Three separate contexts prevent state coupling and race conditions
- `useReducer` ensures predictable state transitions
- Context providers wrap the entire app for global state access

**YouTube Integration:**
- `YouTubeService` class handles all API interactions
- Proper error types distinguish between network, API, and validation errors
- Track validation occurs in batches to optimize API usage
- Memory management prevents cache from growing indefinitely

**Component Lifecycle:**
- `YouTubePlayerManager` handles all player initialization and cleanup
- Error boundaries prevent cascading failures
- Proper cleanup of event listeners and player instances

**TypeScript Safety:**
- Strict typing throughout - no `any` types
- Proper API response typing with YouTube API interfaces
- Type guards for external data validation

**Performance Optimizations:**
- Removed CPU-intensive WebGL shader (replaced with CSS blur)
- Batch API calls to minimize rate limiting
- Lazy loading of track details
- Memoized components prevent unnecessary re-renders

### Environment Variables Required

```
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Testing

Currently, there is no test framework configured. To add testing:
1. Install a test runner (Jest, Vitest, etc.)
2. Configure test scripts in package.json
3. Add test files following the framework's conventions