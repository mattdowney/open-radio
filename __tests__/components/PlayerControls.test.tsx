import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerControls } from '@/app/components/player/PlayerControls'

describe('PlayerControls', () => {
  const defaultProps = {
    isPlaying: false,
    onPlayPause: jest.fn(),
    onSkip: jest.fn(),
    onPrevious: jest.fn(),
    hasPreviousTrack: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all control buttons', () => {
    render(<PlayerControls {...defaultProps} />)

    expect(screen.getByLabelText('Previous track (Left Arrow)')).toBeInTheDocument()
    expect(screen.getByLabelText('Play (Space)')).toBeInTheDocument()
    expect(screen.getByLabelText('Skip to next track (Right Arrow)')).toBeInTheDocument()
  })

  it('shows play button when not playing', () => {
    render(<PlayerControls {...defaultProps} isPlaying={false} />)

    const playButton = screen.getByLabelText('Play (Space)')
    expect(playButton).toBeInTheDocument()
    expect(playButton).toHaveAttribute('title', 'Play (Space)')
  })

  it('shows pause button when playing', () => {
    render(<PlayerControls {...defaultProps} isPlaying={true} />)

    const pauseButton = screen.getByLabelText('Pause (Space)')
    expect(pauseButton).toBeInTheDocument()
    expect(pauseButton).toHaveAttribute('title', 'Pause (Space)')
  })

  it('calls onPlayPause when play/pause button is clicked', () => {
    const onPlayPause = jest.fn()
    render(<PlayerControls {...defaultProps} onPlayPause={onPlayPause} />)

    const playButton = screen.getByLabelText('Play (Space)')
    fireEvent.click(playButton)

    expect(onPlayPause).toHaveBeenCalledTimes(1)
  })

  it('calls onSkip when skip button is clicked', () => {
    const onSkip = jest.fn()
    render(<PlayerControls {...defaultProps} onSkip={onSkip} />)

    const skipButton = screen.getByLabelText('Skip to next track (Right Arrow)')
    fireEvent.click(skipButton)

    expect(onSkip).toHaveBeenCalledTimes(1)
  })

  it('calls onPrevious when previous button is clicked', () => {
    const onPrevious = jest.fn()
    render(<PlayerControls {...defaultProps} onPrevious={onPrevious} />)

    const previousButton = screen.getByLabelText('Previous track (Left Arrow)')
    fireEvent.click(previousButton)

    expect(onPrevious).toHaveBeenCalledTimes(1)
  })

  it('disables previous button when hasPreviousTrack is false', () => {
    render(<PlayerControls {...defaultProps} hasPreviousTrack={false} />)

    const previousButton = screen.getByLabelText('Previous track (Left Arrow)')
    expect(previousButton).toBeDisabled()
    expect(previousButton).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('enables previous button when hasPreviousTrack is true', () => {
    render(<PlayerControls {...defaultProps} hasPreviousTrack={true} />)

    const previousButton = screen.getByLabelText('Previous track (Left Arrow)')
    expect(previousButton).toBeEnabled()
    expect(previousButton).not.toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-controls'
    render(<PlayerControls {...defaultProps} className={customClass} />)

    const controlsContainer = screen.getByLabelText('Previous track (Left Arrow)').closest('.playback-controls')
    expect(controlsContainer).toHaveClass('playback-controls', customClass)
  })

  it('has proper button styling classes', () => {
    render(<PlayerControls {...defaultProps} />)

    const previousButton = screen.getByLabelText('Previous track (Left Arrow)')
    const playButton = screen.getByLabelText('Play (Space)')
    const skipButton = screen.getByLabelText('Skip to next track (Right Arrow)')

    expect(previousButton).toHaveClass('control-button', 'text-black/80', 'hover:text-black/100')
    expect(playButton).toHaveClass('control-button', 'bg-white', 'text-black', 'hover:opacity-90')
    expect(skipButton).toHaveClass('control-button', 'text-black/80', 'hover:text-black/100')
  })

  it('contains correct SVG icons for each button', () => {
    render(<PlayerControls {...defaultProps} />)

    const previousButton = screen.getByLabelText('Previous track (Left Arrow)')
    const playButton = screen.getByLabelText('Play (Space)')
    const skipButton = screen.getByLabelText('Skip to next track (Right Arrow)')

    expect(previousButton.querySelector('.previous')).toBeInTheDocument()
    expect(playButton.querySelector('.play')).toBeInTheDocument()
    expect(skipButton.querySelector('.next')).toBeInTheDocument()
  })

  it('shows pause icon when playing', () => {
    render(<PlayerControls {...defaultProps} isPlaying={true} />)

    const pauseButton = screen.getByLabelText('Pause (Space)')
    expect(pauseButton.querySelector('.pause')).toBeInTheDocument()
    expect(pauseButton.querySelector('.play')).not.toBeInTheDocument()
  })

  it('shows play icon when not playing', () => {
    render(<PlayerControls {...defaultProps} isPlaying={false} />)

    const playButton = screen.getByLabelText('Play (Space)')
    expect(playButton.querySelector('.play')).toBeInTheDocument()
    expect(playButton.querySelector('.pause')).not.toBeInTheDocument()
  })
})