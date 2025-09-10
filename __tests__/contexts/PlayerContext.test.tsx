import { render, screen, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { PlayerProvider, usePlayer } from '@/app/contexts/PlayerContext'

// Mock YouTube Player
const mockYouTubePlayer = {
  playVideo: jest.fn(),
  pauseVideo: jest.fn(),
  setVolume: jest.fn(),
  seekTo: jest.fn(),
  getCurrentTime: jest.fn(),
  getDuration: jest.fn(),
}

// Test component to interact with PlayerContext
const TestComponent = () => {
  const { 
    state, 
    dispatch, 
    play, 
    pause, 
    togglePlayback, 
    setVolume, 
    muteToggle, 
    seekTo,
    playerRef
  } = usePlayer()
  
  return (
    <div>
      <div data-testid="is-playing">{state.isPlaying.toString()}</div>
      <div data-testid="is-player-ready">{state.isPlayerReady.toString()}</div>
      <div data-testid="volume">{state.volume}</div>
      <div data-testid="last-volume">{state.lastVolume}</div>
      <div data-testid="current-video-id">{state.currentVideoId || 'null'}</div>
      <div data-testid="duration">{state.duration || 'null'}</div>
      <div data-testid="current-time">{state.currentTime}</div>
      <div data-testid="has-user-interacted">{state.hasUserInteracted.toString()}</div>
      <div data-testid="is-auto-advancing">{state.isAutoAdvancing.toString()}</div>
      
      <button data-testid="play-btn" onClick={play}>Play</button>
      <button data-testid="pause-btn" onClick={pause}>Pause</button>
      <button data-testid="toggle-btn" onClick={togglePlayback}>Toggle</button>
      <button data-testid="volume-btn" onClick={() => setVolume(50)}>Set Volume</button>
      <button data-testid="mute-btn" onClick={muteToggle}>Mute Toggle</button>
      <button data-testid="seek-btn" onClick={() => seekTo(30)}>Seek</button>
      
      <button 
        data-testid="set-player-ready" 
        onClick={() => {
          // Mock setting up player ref
          playerRef.current = mockYouTubePlayer as any
          dispatch({ type: 'SET_PLAYER_READY', payload: true })
        }}
      >
        Set Player Ready
      </button>
      <button 
        data-testid="set-duration" 
        onClick={() => dispatch({ type: 'SET_DURATION', payload: 180 })}
      >
        Set Duration
      </button>
      <button 
        data-testid="reset-player" 
        onClick={() => dispatch({ type: 'RESET_PLAYER' })}
      >
        Reset Player
      </button>
    </div>
  )
}

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <PlayerProvider>{children}</PlayerProvider>
)

describe('PlayerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides initial state correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('is-playing')).toHaveTextContent('false')
    expect(screen.getByTestId('is-player-ready')).toHaveTextContent('false')
    expect(screen.getByTestId('volume')).toHaveTextContent('70')
    expect(screen.getByTestId('last-volume')).toHaveTextContent('70')
    expect(screen.getByTestId('current-video-id')).toHaveTextContent('null')
    expect(screen.getByTestId('duration')).toHaveTextContent('null')
    expect(screen.getByTestId('current-time')).toHaveTextContent('0')
    expect(screen.getByTestId('has-user-interacted')).toHaveTextContent('false')
    expect(screen.getByTestId('is-auto-advancing')).toHaveTextContent('false')
  })

  it('handles play action when player is ready', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set player ready first
    act(() => {
      screen.getByTestId('set-player-ready').click()
    })

    expect(screen.getByTestId('is-player-ready')).toHaveTextContent('true')

    // Now test play
    act(() => {
      screen.getByTestId('play-btn').click()
    })

    expect(mockYouTubePlayer.playVideo).toHaveBeenCalled()
    expect(screen.getByTestId('is-playing')).toHaveTextContent('true')
    expect(screen.getByTestId('has-user-interacted')).toHaveTextContent('true')
  })

  it('handles pause action when player is ready', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set player ready
    act(() => {
      screen.getByTestId('set-player-ready').click()
    })

    // Play first
    act(() => {
      screen.getByTestId('play-btn').click()
    })

    expect(screen.getByTestId('is-playing')).toHaveTextContent('true')

    // Now pause
    act(() => {
      screen.getByTestId('pause-btn').click()
    })

    expect(mockYouTubePlayer.pauseVideo).toHaveBeenCalled()
    expect(screen.getByTestId('is-playing')).toHaveTextContent('false')
  })

  it('toggles playback correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set player ready
    act(() => {
      screen.getByTestId('set-player-ready').click()
    })

    // Toggle from stopped to playing
    act(() => {
      screen.getByTestId('toggle-btn').click()
    })

    expect(mockYouTubePlayer.playVideo).toHaveBeenCalled()
    expect(screen.getByTestId('is-playing')).toHaveTextContent('true')

    // Toggle from playing to paused
    act(() => {
      screen.getByTestId('toggle-btn').click()
    })

    expect(mockYouTubePlayer.pauseVideo).toHaveBeenCalled()
    expect(screen.getByTestId('is-playing')).toHaveTextContent('false')
  })

  it('handles volume changes correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set player ready
    act(() => {
      screen.getByTestId('set-player-ready').click()
    })

    // Set volume
    act(() => {
      screen.getByTestId('volume-btn').click()
    })

    expect(mockYouTubePlayer.setVolume).toHaveBeenCalledWith(50)
    expect(screen.getByTestId('volume')).toHaveTextContent('50')
    expect(screen.getByTestId('last-volume')).toHaveTextContent('50')
  })

  it('handles mute toggle correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set player ready
    act(() => {
      screen.getByTestId('set-player-ready').click()
    })

    expect(screen.getByTestId('volume')).toHaveTextContent('70')

    // Mute
    act(() => {
      screen.getByTestId('mute-btn').click()
    })

    expect(mockYouTubePlayer.setVolume).toHaveBeenCalledWith(0)
    expect(screen.getByTestId('volume')).toHaveTextContent('0')
    expect(screen.getByTestId('last-volume')).toHaveTextContent('70')

    // Unmute
    act(() => {
      screen.getByTestId('mute-btn').click()
    })

    expect(mockYouTubePlayer.setVolume).toHaveBeenCalledWith(70)
    expect(screen.getByTestId('volume')).toHaveTextContent('70')
  })

  it('handles seek correctly when duration is set', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set player ready and duration
    act(() => {
      screen.getByTestId('set-player-ready').click()
      screen.getByTestId('set-duration').click()
    })

    expect(screen.getByTestId('duration')).toHaveTextContent('180')

    // Seek
    act(() => {
      screen.getByTestId('seek-btn').click()
    })

    expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(30, true)
    expect(screen.getByTestId('current-time')).toHaveTextContent('30')
  })

  it('resets player state correctly while preserving user interaction', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Set player ready first
    act(() => {
      screen.getByTestId('set-player-ready').click()
    })

    // Then play and set duration
    act(() => {
      screen.getByTestId('play-btn').click() // This sets hasUserInteracted to true
      screen.getByTestId('set-duration').click()
    })

    expect(screen.getByTestId('is-playing')).toHaveTextContent('true')
    expect(screen.getByTestId('has-user-interacted')).toHaveTextContent('true')
    expect(screen.getByTestId('duration')).toHaveTextContent('180')

    // Reset player
    act(() => {
      screen.getByTestId('reset-player').click()
    })

    // Should return to initial state except hasUserInteracted
    expect(screen.getByTestId('is-playing')).toHaveTextContent('false')
    expect(screen.getByTestId('is-player-ready')).toHaveTextContent('false')
    expect(screen.getByTestId('volume')).toHaveTextContent('70')
    expect(screen.getByTestId('current-video-id')).toHaveTextContent('null')
    expect(screen.getByTestId('duration')).toHaveTextContent('null')
    expect(screen.getByTestId('current-time')).toHaveTextContent('0')
    expect(screen.getByTestId('has-user-interacted')).toHaveTextContent('true') // Preserved
    expect(screen.getByTestId('is-auto-advancing')).toHaveTextContent('false')
  })

  it('does not call player methods when player is not ready', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Try to play without setting player ready
    act(() => {
      screen.getByTestId('play-btn').click()
    })

    expect(mockYouTubePlayer.playVideo).not.toHaveBeenCalled()
    expect(screen.getByTestId('is-playing')).toHaveTextContent('false')

    // Try to set volume without setting player ready
    act(() => {
      screen.getByTestId('volume-btn').click()
    })

    expect(mockYouTubePlayer.setVolume).not.toHaveBeenCalled()
    expect(screen.getByTestId('volume')).toHaveTextContent('70') // Should remain unchanged
  })

  it('throws error when usePlayer is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('usePlayer must be used within a PlayerProvider')

    consoleSpy.mockRestore()
  })
})