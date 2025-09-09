# Phase 4: Extensibility & Architecture 🔧

## Objective
Transform the application from a hardcoded radio player into a flexible, extensible platform that supports multiple music providers, themes, and customization options. This phase creates the foundation for a plugin ecosystem and community contributions.

**Timeline:** 3-4 days  
**Priority:** MEDIUM (enhances adoption but not required for initial release)  
**Dependencies:** Phase 1-3 (clean, tested, documented codebase)

## Tasks

### 1. Abstract Music Provider System
**Time Estimate:** 6-8 hours

#### Current State:
- Hardcoded YouTube API integration
- Direct YouTube service calls throughout components

#### Target Architecture:
```typescript
// Provider interface
interface MusicProvider {
  name: string
  fetchPlaylist(id: string): Promise<Track[]>
  validateTracks(tracks: string[]): Promise<ValidatedTrack[]>
  searchTracks(query: string): Promise<Track[]>
  getTrackDetails(id: string): Promise<TrackDetails>
}

// Provider registry
class ProviderRegistry {
  private providers: Map<string, MusicProvider> = new Map()
  
  register(provider: MusicProvider): void
  get(name: string): MusicProvider | undefined
  list(): MusicProvider[]
}
```

#### Implementation Tasks:
- [ ] Create `MusicProvider` interface
- [ ] Implement `YouTubeProvider` using existing service
- [ ] Create `ProviderRegistry` for managing providers
- [ ] Update contexts to use provider abstraction
- [ ] Create provider configuration system

#### File Structure:
```
app/providers/
├── index.ts              # Provider registry and types
├── MusicProvider.ts      # Base interface
├── YouTubeProvider.ts    # YouTube implementation
├── SpotifyProvider.ts    # Future Spotify provider
└── LocalProvider.ts      # Future local file provider
```

#### Provider Interface:
```typescript
export interface MusicProvider {
  readonly name: string
  readonly displayName: string
  readonly requiresAuth: boolean
  readonly supportedFeatures: ProviderFeatures
  
  // Core functionality
  initialize(config: ProviderConfig): Promise<void>
  fetchPlaylist(playlistId: string): Promise<Track[]>
  validateTracks(trackIds: string[]): Promise<ValidatedTrack[]>
  getTrackDetails(trackId: string): Promise<TrackDetails>
  searchTracks(query: string, limit?: number): Promise<Track[]>
  
  // Optional features
  createPlaylist?(name: string): Promise<string>
  getUserPlaylists?(): Promise<Playlist[]>
  getRecommendations?(seedTrack: Track): Promise<Track[]>
}

export interface ProviderFeatures {
  search: boolean
  playlists: boolean
  recommendations: boolean
  userContent: boolean
}
```

### 2. Configuration System
**Time Estimate:** 4-5 hours

#### App Configuration Structure:
```typescript
interface AppConfig {
  // App identity
  branding: {
    name: string
    description: string
    logoUrl?: string
    primaryColor?: string
    customCss?: string
  }
  
  // Music provider settings
  providers: {
    default: string
    enabled: string[]
    configs: Record<string, ProviderConfig>
  }
  
  // UI preferences  
  ui: {
    theme: 'auto' | 'light' | 'dark'
    visualization: 'vinyl' | 'cd' | 'abstract'
    showListenerCount: boolean
    enableAnimations: boolean
  }
  
  // Features
  features: {
    ratings: boolean
    sharing: boolean
    analytics: boolean
    offline: boolean
  }
}
```

#### Implementation:
- [ ] Create `config/` directory with type definitions
- [ ] Implement configuration loader with environment variable support
- [ ] Create configuration validation schema
- [ ] Add runtime configuration updates
- [ ] Create admin interface for configuration (optional)

#### Config Files:
```
config/
├── index.ts              # Configuration loader
├── types.ts              # Configuration types
├── schema.ts             # Validation schemas
├── defaults.ts           # Default configuration
└── validators.ts         # Custom validators
```

### 3. Theme System Architecture
**Time Estimate:** 5-6 hours

#### Theme Structure:
```typescript
interface Theme {
  name: string
  displayName: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    accent: string
    error: string
    success: string
  }
  
  typography: {
    fontFamily: string
    headingFont?: string
    sizes: Record<string, string>
  }
  
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  animations: {
    duration: Record<string, string>
    easing: Record<string, string>
  }
}
```

#### Implementation Tasks:
- [ ] Create theme type definitions
- [ ] Implement ThemeProvider using React Context
- [ ] Convert hardcoded styles to theme variables
- [ ] Create built-in themes (light, dark, retro, neon)
- [ ] Add CSS custom property support
- [ ] Implement theme switching with persistence

#### Built-in Themes:
```typescript
// themes/presets.ts
export const themes: Record<string, Theme> = {
  default: { /* current design */ },
  dark: { /* dark mode variant */ },
  retro: { /* 80s/90s aesthetic */ },
  neon: { /* cyberpunk style */ },
  minimal: { /* clean, minimal design */ }
}
```

### 4. Component Plugin System
**Time Estimate:** 4-5 hours

#### Plugin Architecture:
```typescript
interface ComponentPlugin {
  name: string
  version: string
  component: React.ComponentType<any>
  props?: Record<string, any>
  position: 'header' | 'footer' | 'sidebar' | 'player'
  priority: number
}

interface VisualizationPlugin {
  name: string
  displayName: string
  component: React.ComponentType<VisualizationProps>
  preview?: string // Preview image URL
  settings?: PluginSettings[]
}
```

#### Plugin Registry:
- [ ] Create plugin registration system
- [ ] Implement plugin lifecycle management
- [ ] Add plugin discovery mechanism
- [ ] Create plugin validation and sandboxing
- [ ] Add plugin settings interface

#### Plugin Examples:
```typescript
// plugins/visualizations/SpectrumAnalyzer.tsx
export const SpectrumAnalyzer: VisualizationPlugin = {
  name: 'spectrum-analyzer',
  displayName: 'Spectrum Analyzer',
  component: SpectrumVisualization,
  settings: [
    {
      key: 'sensitivity',
      type: 'range',
      min: 0,
      max: 100,
      default: 50
    }
  ]
}
```

### 5. Advanced Playlist Management
**Time Estimate:** 3-4 hours

#### Playlist System:
```typescript
interface PlaylistManager {
  // Playlist operations
  createPlaylist(name: string, tracks?: Track[]): Promise<Playlist>
  getPlaylist(id: string): Promise<Playlist>
  updatePlaylist(id: string, updates: Partial<Playlist>): Promise<void>
  deletePlaylist(id: string): Promise<void>
  
  // Track operations
  addToPlaylist(playlistId: string, tracks: Track[]): Promise<void>
  removeFromPlaylist(playlistId: string, trackIds: string[]): Promise<void>
  reorderPlaylist(playlistId: string, from: number, to: number): Promise<void>
  
  // Smart features
  generateSmartPlaylist(criteria: PlaylistCriteria): Promise<Playlist>
  getRecommendations(playlistId: string): Promise<Track[]>
}

interface Playlist {
  id: string
  name: string
  description?: string
  tracks: Track[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    duration: number
    trackCount: number
    genre?: string[]
  }
  settings: {
    shuffle: boolean
    repeat: 'none' | 'one' | 'all'
    crossfade: number
  }
}
```

#### Implementation:
- [ ] Create playlist management service
- [ ] Add playlist persistence (localStorage/IndexedDB)
- [ ] Implement drag-and-drop reordering
- [ ] Add import/export functionality
- [ ] Create smart playlist generation

### 6. API and Webhook System
**Time Estimate:** 3-4 hours

#### External API:
```typescript
// API routes for external integrations
// /api/player/status - Current player state
// /api/player/control - Control playback
// /api/playlists - Playlist management
// /api/tracks/current - Current track info
// /api/events - Webhook endpoints
```

#### Webhook Support:
- [ ] Track change notifications
- [ ] Playback state changes
- [ ] User interaction events
- [ ] Custom event broadcasting

#### Implementation:
```typescript
// lib/api/external.ts
export class ExternalAPI {
  // Player control
  async getStatus(): Promise<PlayerStatus>
  async play(): Promise<void>
  async pause(): Promise<void>
  async skipToNext(): Promise<void>
  async skipToPrevious(): Promise<void>
  
  // Event system
  subscribe(event: string, callback: Function): void
  unsubscribe(event: string, callback: Function): void
  emit(event: string, data: any): void
}
```

### 7. Advanced Features Framework
**Time Estimate:** 2-3 hours

#### Feature Modules:
```typescript
interface FeatureModule {
  name: string
  enabled: boolean
  dependencies: string[]
  initialize(): Promise<void>
  cleanup(): Promise<void>
  getComponent?(): React.ComponentType
  getSettings?(): FeatureSetting[]
}
```

#### Feature Examples:
- [ ] **Analytics Module**: Track usage, popular songs, listening patterns
- [ ] **Social Module**: Share tracks, collaborative playlists
- [ ] **Offline Module**: Cache tracks for offline listening
- [ ] **Voice Control**: Voice commands for playback control
- [ ] **Keyboard Shortcuts**: Customizable hotkeys
- [ ] **Last.fm Integration**: Scrobbling and recommendations

### 8. Developer Experience Improvements
**Time Estimate:** 2-3 hours

#### Development Tools:
- [ ] Plugin development CLI
- [ ] Theme development toolkit
- [ ] Component playground/storybook
- [ ] Configuration validator
- [ ] Performance profiler

#### Plugin Development:
```bash
# CLI for plugin development
npx open-radio create-plugin my-visualization
npx open-radio create-theme my-theme
npx open-radio validate-config
npx open-radio test-plugin ./my-plugin
```

#### Developer Documentation:
- [ ] Plugin development guide
- [ ] Theme creation tutorial
- [ ] API reference documentation
- [ ] Extension examples
- [ ] Architecture deep-dive

## Architecture Patterns

### Dependency Injection:
```typescript
// Core service container
class ServiceContainer {
  private services: Map<string, any> = new Map()
  
  register<T>(name: string, service: T): void
  get<T>(name: string): T
  resolve<T>(constructor: new (...args: any[]) => T): T
}
```

### Event System:
```typescript
// Central event bus for component communication
class EventBus {
  private listeners: Map<string, Function[]> = new Map()
  
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}
```

### Plugin Lifecycle:
```typescript
enum PluginState {
  Unloaded = 'unloaded',
  Loading = 'loading',
  Active = 'active',
  Error = 'error',
  Disabled = 'disabled'
}

class PluginManager {
  async loadPlugin(plugin: ComponentPlugin): Promise<void>
  async unloadPlugin(name: string): Promise<void>
  getPluginState(name: string): PluginState
  listPlugins(): ComponentPlugin[]
}
```

## Testing Strategy

### Architecture Testing:
- [ ] Provider interface compliance tests
- [ ] Plugin loading and lifecycle tests
- [ ] Configuration validation tests
- [ ] Theme switching tests
- [ ] API endpoint tests

### Integration Testing:
- [ ] Multi-provider playlist creation
- [ ] Theme changes with different visualizations
- [ ] Plugin interaction with core components
- [ ] Configuration hot-reloading

## Migration Strategy

### Backward Compatibility:
- [ ] Maintain existing API while adding new features
- [ ] Provide migration scripts for configurations
- [ ] Support legacy theme format during transition
- [ ] Graceful degradation for missing plugins

### Phased Rollout:
1. **Phase 4a**: Provider abstraction with YouTube
2. **Phase 4b**: Theme system and basic customization
3. **Phase 4c**: Plugin system foundation
4. **Phase 4d**: Advanced features and API

## Success Criteria
- [ ] Multiple music providers supported (YouTube + 1 other)
- [ ] Theme system with 3+ built-in themes
- [ ] Plugin system with 2+ example plugins
- [ ] Configuration system with validation
- [ ] Playlist management with import/export
- [ ] External API with documentation
- [ ] Developer toolkit for extensions
- [ ] Comprehensive architecture documentation

## Dependencies
- **Phase 1-3**: Stable, tested foundation required
- **Community Feedback**: User requirements for customization options

## Notes
- Focus on interfaces and abstractions first
- Implement one complete example of each system (provider, theme, plugin)
- Document architecture decisions thoroughly
- Consider performance impact of plugin system
- Plan for plugin security and sandboxing
- Design for both power users and simple deployments