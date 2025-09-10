import { render, screen } from '@testing-library/react'
import Loading from '@/app/components/ui/Loading'

describe('Loading Component', () => {
  it('renders loading container and progress bar', () => {
    render(<Loading />)
    
    const loadingContainer = screen.getByTestId('loading-container')
    const progressBar = screen.getByTestId('loading-progress-bar')
    
    expect(loadingContainer).toBeInTheDocument()
    expect(progressBar).toBeInTheDocument()
  })

  it('applies correct styling classes to container', () => {
    render(<Loading />)
    
    const container = screen.getByTestId('loading-container')
    expect(container).toHaveClass('fixed', 'inset-0', 'z-[9999]', 'flex', 'items-center', 'justify-center', 'bg-black')
  })

  it('initializes progress bar with width greater than 0', () => {
    render(<Loading />)
    
    const progressBar = screen.getByTestId('loading-progress-bar')
    expect(progressBar).toHaveStyle({ width: '5%' })
    expect(progressBar).toHaveClass('h-full', 'bg-white', 'transition-all', 'duration-150', 'ease-out', 'rounded-full')
  })
})