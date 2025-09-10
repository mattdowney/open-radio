import { render, screen, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { QueueProvider, useQueue } from '@/app/contexts/QueueContext'
import { Track, ValidatedTrack } from '@/app/types/track'

// Mock data
const mockTracks: Track[] = [
  {
    id: 'track1',
    title: 'Test Track 1',
    artist: 'Test Artist 1',
    duration: 180,
    thumbnail: 'thumb1.jpg'
  },
  {
    id: 'track2', 
    title: 'Test Track 2',
    artist: 'Test Artist 2',
    duration: 200,
    thumbnail: 'thumb2.jpg'
  },
  {
    id: 'track3',
    title: 'Test Track 3', 
    artist: 'Test Artist 3',
    duration: 220,
    thumbnail: 'thumb3.jpg'
  }
]

const mockValidatedTracks: ValidatedTrack[] = [
  {
    id: 'track1',
    title: 'Test Track 1',
    artist: 'Test Artist 1',
    duration: 180,
    thumbnail: 'thumb1.jpg',
    isValid: true,
    validationTimestamp: Date.now()
  },
  {
    id: 'track2',
    title: 'Test Track 2', 
    artist: 'Test Artist 2',
    duration: 200,
    thumbnail: 'thumb2.jpg',
    isValid: true,
    validationTimestamp: Date.now()
  }
]

// Test component to interact with QueueContext
const TestComponent = () => {
  const {
    state,
    dispatch,
    setPlaylist,
    addValidatedTrack,
    removeTrackFromPlaylist,
    advanceToNextTrack,
    goToPreviousTrack,
    selectTrack,
    updateUpcomingTracks
  } = useQueue()
  
  return (
    <div>
      <div data-testid="playlist-length">{state.playlist.length}</div>
      <div data-testid="current-track-index">{state.currentTrackIndex}</div>
      <div data-testid="current-track-id">{state.currentTrack?.id || 'null'}</div>
      <div data-testid="upcoming-tracks-length">{state.upcomingTracks.length}</div>
      <div data-testid="played-tracks-length">{state.playedTracks.length}</div>
      <div data-testid="validated-tracks-length">{state.validatedTracks.length}</div>
      <div data-testid="is-loading-next">{state.isLoadingNext.toString()}</div>
      <div data-testid="is-transitioning">{state.isTransitioning.toString()}</div>
      
      <button 
        data-testid="set-playlist" 
        onClick={() => setPlaylist(['track1', 'track2', 'track3'])}
      >
        Set Playlist
      </button>
      <button 
        data-testid="add-validated-track" 
        onClick={() => addValidatedTrack(mockValidatedTracks[0])}
      >
        Add Validated Track
      </button>
      <button 
        data-testid="remove-track" 
        onClick={() => removeTrackFromPlaylist('track2')}
      >
        Remove Track 2
      </button>
      <button 
        data-testid="advance-track" 
        onClick={advanceToNextTrack}
      >
        Advance Track
      </button>
      <button 
        data-testid="previous-track" 
        onClick={goToPreviousTrack}
      >
        Previous Track
      </button>
      <button 
        data-testid="select-track" 
        onClick={() => selectTrack('track3')}
      >
        Select Track 3
      </button>
      <button 
        data-testid="update-upcoming" 
        onClick={() => updateUpcomingTracks(mockTracks)}
      >
        Update Upcoming
      </button>
      <button 
        data-testid="set-current-track" 
        onClick={() => dispatch({ type: 'SET_CURRENT_TRACK', payload: mockTracks[0] })}
      >
        Set Current Track
      </button>
      <button 
        data-testid="set-loading" 
        onClick={() => dispatch({ type: 'SET_LOADING_NEXT', payload: true })}
      >
        Set Loading
      </button>
      <button 
        data-testid="reset-queue" 
        onClick={() => dispatch({ type: 'RESET_QUEUE' })}
      >
        Reset Queue
      </button>
    </div>
  )
}

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <QueueProvider>{children}</QueueProvider>
)

describe('QueueContext', () => {
  it('provides initial state correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('playlist-length')).toHaveTextContent('0')
    expect(screen.getByTestId('current-track-index')).toHaveTextContent('0')
    expect(screen.getByTestId('current-track-id')).toHaveTextContent('null')
    expect(screen.getByTestId('upcoming-tracks-length')).toHaveTextContent('0')
    expect(screen.getByTestId('played-tracks-length')).toHaveTextContent('0')
    expect(screen.getByTestId('validated-tracks-length')).toHaveTextContent('0')
    expect(screen.getByTestId('is-loading-next')).toHaveTextContent('false')
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false')
  })

  it('sets playlist and resets current track index to 0', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    act(() => {
      screen.getByTestId('set-playlist').click()
    })

    expect(screen.getByTestId('playlist-length')).toHaveTextContent('3')
    expect(screen.getByTestId('current-track-index')).toHaveTextContent('0')
  })

  it('adds validated tracks without duplicates', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Add first validated track
    act(() => {
      screen.getByTestId('add-validated-track').click()
    })

    expect(screen.getByTestId('validated-tracks-length')).toHaveTextContent('1')

    // Add same track again - should not duplicate
    act(() => {
      screen.getByTestId('add-validated-track').click()
    })

    expect(screen.getByTestId('validated-tracks-length')).toHaveTextContent('1')
  })

  it('removes track from playlist and adjusts index', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set up playlist first
    act(() => {
      screen.getByTestId('set-playlist').click()
    })

    // Manually select track3 by setting the index to 2
    act(() => {
      screen.getByTestId('select-track').click() // Select track3 (index 2)
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('2')
    expect(screen.getByTestId('playlist-length')).toHaveTextContent('3')

    // Remove track2 (index 1) - should adjust current index from 2 to 1
    act(() => {
      screen.getByTestId('remove-track').click()
    })

    expect(screen.getByTestId('playlist-length')).toHaveTextContent('2')
    expect(screen.getByTestId('current-track-index')).toHaveTextContent('1')
  })

  it('advances to next track and wraps around', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set up playlist and current track
    act(() => {
      screen.getByTestId('set-playlist').click()
      screen.getByTestId('set-current-track').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('0')
    expect(screen.getByTestId('played-tracks-length')).toHaveTextContent('0')

    // Advance to next track
    act(() => {
      screen.getByTestId('advance-track').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('1')
    expect(screen.getByTestId('played-tracks-length')).toHaveTextContent('1') // Previous track added to played

    // Advance to track 2
    act(() => {
      screen.getByTestId('advance-track').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('2')

    // Advance should wrap around to index 0
    act(() => {
      screen.getByTestId('advance-track').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('0')
  })

  it('goes to previous track and wraps around', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set up playlist
    act(() => {
      screen.getByTestId('set-playlist').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('0')

    // Go to previous track - should wrap to last track (index 2)
    act(() => {
      screen.getByTestId('previous-track').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('2')

    // Go to previous again
    act(() => {
      screen.getByTestId('previous-track').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('1')
  })

  it('selects track by ID', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set up playlist
    act(() => {
      screen.getByTestId('set-playlist').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('0')

    // Select track3 (should be index 2)
    act(() => {
      screen.getByTestId('select-track').click()
    })

    expect(screen.getByTestId('current-track-index')).toHaveTextContent('2')
  })

  it('updates upcoming tracks', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('upcoming-tracks-length')).toHaveTextContent('0')

    act(() => {
      screen.getByTestId('update-upcoming').click()
    })

    expect(screen.getByTestId('upcoming-tracks-length')).toHaveTextContent('3')
  })

  it('limits played tracks to last 10', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Add 12 played tracks to test the limit
    act(() => {
      for (let i = 0; i < 12; i++) {
        screen.getByTestId('set-playlist').click()
        screen.getByTestId('set-current-track').click()
        screen.getByTestId('advance-track').click()
      }
    })

    // Should only keep last 10
    expect(screen.getByTestId('played-tracks-length')).toHaveTextContent('10')
  })

  it('handles various state updates correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Test loading state
    act(() => {
      screen.getByTestId('set-loading').click()
    })

    expect(screen.getByTestId('is-loading-next')).toHaveTextContent('true')

    // Test current track
    act(() => {
      screen.getByTestId('set-current-track').click()
    })

    expect(screen.getByTestId('current-track-id')).toHaveTextContent('track1')
  })

  it('resets queue to initial state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set up some state
    act(() => {
      screen.getByTestId('set-playlist').click()
      screen.getByTestId('add-validated-track').click()
      screen.getByTestId('update-upcoming').click()
      screen.getByTestId('set-current-track').click()
      screen.getByTestId('set-loading').click()
    })

    // Verify state is set
    expect(screen.getByTestId('playlist-length')).toHaveTextContent('3')
    expect(screen.getByTestId('validated-tracks-length')).toHaveTextContent('1')
    expect(screen.getByTestId('upcoming-tracks-length')).toHaveTextContent('3')
    expect(screen.getByTestId('current-track-id')).toHaveTextContent('track1')
    expect(screen.getByTestId('is-loading-next')).toHaveTextContent('true')

    // Reset queue
    act(() => {
      screen.getByTestId('reset-queue').click()
    })

    // Should return to initial state
    expect(screen.getByTestId('playlist-length')).toHaveTextContent('0')
    expect(screen.getByTestId('current-track-index')).toHaveTextContent('0')
    expect(screen.getByTestId('current-track-id')).toHaveTextContent('null')
    expect(screen.getByTestId('upcoming-tracks-length')).toHaveTextContent('0')
    expect(screen.getByTestId('played-tracks-length')).toHaveTextContent('0')
    expect(screen.getByTestId('validated-tracks-length')).toHaveTextContent('0')
    expect(screen.getByTestId('is-loading-next')).toHaveTextContent('false')
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false')
  })

  it('throws error when useQueue is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useQueue must be used within a QueueProvider')

    consoleSpy.mockRestore()
  })
})