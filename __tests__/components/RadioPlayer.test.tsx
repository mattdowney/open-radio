import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { RadioPlayer } from '@/app/components/player/RadioPlayer'
import { PlayerProvider } from '@/app/contexts/PlayerContext'
import { QueueProvider } from '@/app/contexts/QueueContext'
import { UIProvider } from '@/app/contexts/UIContext'

// Create mock functions that can be reset between tests
const mockFetchPlaylistItems = jest.fn()
const mockValidateTracks = jest.fn()
const mockValidateTrack = jest.fn()

// Mock the services and components
jest.mock('@/app/services/youtubeService', () => ({
  getYouTubeService: () => ({
    fetchPlaylistItems: mockFetchPlaylistItems,
    validateTracks: mockValidateTracks,
    validateTrack: mockValidateTrack,
  }),
  YouTubeAPIError: class YouTubeAPIError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'YouTubeAPIError'
    }
  },
}))

jest.mock('@/app/components/player/YouTubePlayerManager', () => ({
  YouTubePlayerManager: ({ onTrackEnd, onError }: any) => (
    <div data-testid="youtube-player-manager">
      <button data-testid="trigger-track-end" onClick={onTrackEnd}>
        Trigger Track End
      </button>
      <button data-testid="trigger-error" onClick={() => onError('Player error')}>
        Trigger Error
      </button>
    </div>
  ),
}))

jest.mock('@/app/components/layout/RadioLayout', () => ({
  RadioLayout: ({
    isLoading,
    error,
    currentTrack,
    upcomingTracks,
    isPlaying,
    volume,
    isLoadingNext,
    isUIReady,
    isTransitioning,
    onPlayPause,
    onNext,
    onPrevious,
    onTrackSelect,
  }: any) => (
    <div data-testid="radio-layout">
      <div data-testid="is-loading">{isLoading?.toString() || 'false'}</div>
      <div data-testid="error">{error || 'no error'}</div>
      <div data-testid="current-track">{currentTrack?.title || 'no track'}</div>
      <div data-testid="upcoming-tracks-count">{upcomingTracks?.length || 0}</div>
      <div data-testid="is-playing">{isPlaying?.toString() || 'false'}</div>
      <div data-testid="volume">{volume || 0}</div>
      <div data-testid="is-loading-next">{isLoadingNext?.toString() || 'false'}</div>
      <div data-testid="is-ui-ready">{isUIReady?.toString() || 'false'}</div>
      <div data-testid="is-transitioning">{isTransitioning?.toString() || 'false'}</div>
      <button data-testid="play-pause" onClick={onPlayPause}>Play/Pause</button>
      <button data-testid="next" onClick={onNext}>Next</button>
      <button data-testid="previous" onClick={onPrevious}>Previous</button>
      <button data-testid="select-track" onClick={() => onTrackSelect('track2')}>Select Track</button>
    </div>
  ),
}))

// Mock environment variable
const originalEnv = process.env.NEXT_PUBLIC_PLAYLIST_ID
beforeAll(() => {
  process.env.NEXT_PUBLIC_PLAYLIST_ID = 'test-playlist-id'
})

afterAll(() => {
  process.env.NEXT_PUBLIC_PLAYLIST_ID = originalEnv
})

// Test wrapper with all required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <UIProvider>
    <PlayerProvider>
      <QueueProvider>
        {children}
      </QueueProvider>
    </PlayerProvider>
  </UIProvider>
)

describe('RadioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up default mock implementations
    mockFetchPlaylistItems.mockResolvedValue(['track1', 'track2', 'track3'])
    mockValidateTracks.mockResolvedValue([
      {
        id: 'track1',
        isValid: true,
        validationTimestamp: Date.now(),
        details: {
          title: 'Test Track 1',
          albumCoverUrl: 'https://example.com/thumb1.jpg',
        },
      },
      {
        id: 'track2',
        isValid: true,
        validationTimestamp: Date.now(),
        details: {
          title: 'Test Track 2',
          albumCoverUrl: 'https://example.com/thumb2.jpg',
        },
      },
    ])
    mockValidateTrack.mockResolvedValue({
      id: 'track1',
      isValid: true,
      validationTimestamp: Date.now(),
      details: {
        title: 'Test Track 1',
        albumCoverUrl: 'https://example.com/thumb1.jpg',
      },
    })
  })

  it('renders YouTubePlayerManager and RadioLayout', () => {
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    expect(screen.getByTestId('youtube-player-manager')).toBeInTheDocument()
    expect(screen.getByTestId('radio-layout')).toBeInTheDocument()
  })

  it('initializes playlist on mount', async () => {
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    // Should start loading
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true')

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Track 1')
    })

    // Should no longer be loading
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    expect(screen.getByTestId('is-ui-ready')).toHaveTextContent('true')
  })

  it('sets up current track and upcoming tracks after initialization', async () => {
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Track 1')
    })

    // Should have upcoming tracks
    expect(screen.getByTestId('upcoming-tracks-count')).toHaveTextContent('1')
  })

  it('handles errors during playlist initialization', async () => {
    // Override the mock to throw an error for this test
    mockFetchPlaylistItems.mockRejectedValueOnce(new Error('Network error'))

    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load playlist. Please refresh the page.')
    }, { timeout: 3000 })

    expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
  })

  it('passes correct props to RadioLayout', async () => {
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Track 1')
    })

    // Check that all props are passed correctly
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('no error')
    expect(screen.getByTestId('is-playing')).toHaveTextContent('false')
    expect(screen.getByTestId('volume')).toHaveTextContent('70') // Default volume from PlayerContext
    expect(screen.getByTestId('is-loading-next')).toHaveTextContent('false')
    expect(screen.getByTestId('is-ui-ready')).toHaveTextContent('true')
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false')
  })

  it('provides working control handlers to RadioLayout', async () => {
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Track 1')
    })

    // Test that control buttons are present and clickable
    expect(screen.getByTestId('play-pause')).toBeInTheDocument()
    expect(screen.getByTestId('next')).toBeInTheDocument()
    expect(screen.getByTestId('previous')).toBeInTheDocument()
    expect(screen.getByTestId('select-track')).toBeInTheDocument()
  })

  it('handles YouTube player errors', async () => {
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Track 1')
    })

    // Trigger an error from the YouTube player
    const errorButton = screen.getByTestId('trigger-error')
    errorButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Player error')
    })
  })

  it('handles track end events for auto-advance', async () => {
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-track')).toHaveTextContent('Test Track 1')
    })

    // Trigger track end
    const trackEndButton = screen.getByTestId('trigger-track-end')
    fireEvent.click(trackEndButton)

    // Should call validateTrack for next track
    await waitFor(() => {
      expect(mockValidateTrack).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('uses default playlist ID when environment variable is not set', async () => {
    const originalPlaylistId = process.env.NEXT_PUBLIC_PLAYLIST_ID
    delete process.env.NEXT_PUBLIC_PLAYLIST_ID
    
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(mockFetchPlaylistItems).toHaveBeenCalledWith('PLBtA_Wr4VtP-sZG5YoACVreBvhdLw1LKx')
    }, { timeout: 3000 })

    process.env.NEXT_PUBLIC_PLAYLIST_ID = originalPlaylistId
  })

  it('renders with proper structure and components', () => {
    render(
      <TestWrapper>
        <RadioPlayer />
      </TestWrapper>
    )

    // Should have main structure elements
    expect(screen.getByTestId('youtube-player-manager')).toBeInTheDocument()
    expect(screen.getByTestId('radio-layout')).toBeInTheDocument()
    expect(screen.getByTestId('play-pause')).toBeInTheDocument()
    expect(screen.getByTestId('next')).toBeInTheDocument()
    expect(screen.getByTestId('previous')).toBeInTheDocument()
  })
})