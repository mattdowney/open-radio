import { render, screen, fireEvent } from '@testing-library/react'
import { VolumeControl } from '@/app/components/player/VolumeControl'

describe('VolumeControl', () => {
  const defaultProps = {
    volume: 50,
    onVolumeChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders volume slider and mute button', () => {
    render(<VolumeControl {...defaultProps} />)

    expect(screen.getByLabelText('Volume (Up/Down Arrow)')).toBeInTheDocument()
    expect(screen.getByLabelText('Mute')).toBeInTheDocument()
  })

  it('displays correct volume value on slider', () => {
    render(<VolumeControl {...defaultProps} volume={75} />)

    const slider = screen.getByLabelText('Volume (Up/Down Arrow)')
    expect(slider).toHaveValue('75')
  })

  it('calls onVolumeChange when slider value changes', () => {
    const onVolumeChange = jest.fn()
    render(<VolumeControl {...defaultProps} onVolumeChange={onVolumeChange} />)

    const slider = screen.getByLabelText('Volume (Up/Down Arrow)')
    fireEvent.change(slider, { target: { value: '25' } })

    expect(onVolumeChange).toHaveBeenCalledWith(25)
  })

  it('shows mute button when volume > 0', () => {
    render(<VolumeControl {...defaultProps} volume={50} />)

    const muteButton = screen.getByLabelText('Mute')
    expect(muteButton).toBeInTheDocument()
    expect(muteButton).toHaveAttribute('title', 'Mute')
  })

  it('shows unmute button when volume is 0', () => {
    render(<VolumeControl {...defaultProps} volume={0} />)

    const unmuteButton = screen.getByLabelText('Unmute')
    expect(unmuteButton).toBeInTheDocument()
    expect(unmuteButton).toHaveAttribute('title', 'Unmute')
  })

  it('calls onVolumeChange with 0 when mute button is clicked', () => {
    const onVolumeChange = jest.fn()
    render(<VolumeControl {...defaultProps} volume={50} onVolumeChange={onVolumeChange} />)

    const muteButton = screen.getByLabelText('Mute')
    fireEvent.click(muteButton)

    expect(onVolumeChange).toHaveBeenCalledWith(0)
  })

  it('calls onVolumeChange with 70 when unmute button is clicked', () => {
    const onVolumeChange = jest.fn()
    render(<VolumeControl {...defaultProps} volume={0} onVolumeChange={onVolumeChange} />)

    const unmuteButton = screen.getByLabelText('Unmute')
    fireEvent.click(unmuteButton)

    expect(onVolumeChange).toHaveBeenCalledWith(70)
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-volume'
    render(<VolumeControl {...defaultProps} className={customClass} />)

    const container = screen.getByLabelText('Volume (Up/Down Arrow)').closest('div')
    expect(container).toHaveClass('flex', 'items-center', 'space-x-3', 'px-1', customClass)
  })

  it('has correct slider attributes', () => {
    render(<VolumeControl {...defaultProps} />)

    const slider = screen.getByLabelText('Volume (Up/Down Arrow)')
    expect(slider).toHaveAttribute('type', 'range')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '100')
    expect(slider).toHaveAttribute('title', 'Adjust volume (Up/Down Arrow)')
    expect(slider).toHaveClass('volume-slider')
  })

  it('has proper button styling classes', () => {
    render(<VolumeControl {...defaultProps} />)

    const muteButton = screen.getByLabelText('Mute')
    expect(muteButton).toHaveClass('text-white/60', 'hover:text-white/80', 'transition-colors')
  })

  it('handles edge case volume values correctly', () => {
    const onVolumeChange = jest.fn()
    
    // Test with volume 0
    const { rerender } = render(<VolumeControl volume={0} onVolumeChange={onVolumeChange} />)
    let slider = screen.getByLabelText('Volume (Up/Down Arrow)')
    expect(slider).toHaveValue('0')

    // Test with volume 100
    rerender(<VolumeControl volume={100} onVolumeChange={onVolumeChange} />)
    slider = screen.getByLabelText('Volume (Up/Down Arrow)')
    expect(slider).toHaveValue('100')
  })

  it('slider change triggers with correct numeric values', () => {
    const onVolumeChange = jest.fn()
    render(<VolumeControl {...defaultProps} onVolumeChange={onVolumeChange} />)

    const slider = screen.getByLabelText('Volume (Up/Down Arrow)')
    
    // Test with string value from input element
    fireEvent.change(slider, { target: { value: '85' } })
    expect(onVolumeChange).toHaveBeenCalledWith(85)
    
    // Test with another value
    fireEvent.change(slider, { target: { value: '15' } })
    expect(onVolumeChange).toHaveBeenCalledWith(15)
  })
})