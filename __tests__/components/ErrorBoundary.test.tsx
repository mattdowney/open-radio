import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary, { PlayerErrorBoundary, QueueErrorBoundary } from '@/app/components/ui/ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Note: We test UI behavior but not actual window.location.reload calls
// due to JSDOM limitations with Location object mocking

afterEach(() => {
  jest.clearAllMocks()
})

// Mock console.error to avoid noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('The radio player encountered an unexpected error. Please try refreshing the page.')).toBeInTheDocument()
  })

  it('shows Try Again and Refresh Page buttons on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('shows Refresh Page button that can be clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const refreshButton = screen.getByText('Refresh Page')
    expect(refreshButton).toBeInTheDocument()
    
    // Test that the button can be clicked without throwing an error
    expect(() => fireEvent.click(refreshButton)).not.toThrow()
  })

  it('shows Try Again button that can be clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error should be showing
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click Try Again
    const tryAgainButton = screen.getByText('Try Again')
    expect(tryAgainButton).toBeInTheDocument()
    
    // Test that the button can be clicked without throwing an error
    expect(() => fireEvent.click(tryAgainButton)).not.toThrow()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('calls onError callback when provided', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('shows error details in development environment', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument()

    process.env.NODE_ENV = originalNodeEnv
  })

  it('does not show error details in production environment', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument()

    process.env.NODE_ENV = originalNodeEnv
  })
})

describe('PlayerErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <PlayerErrorBoundary>
        <div>Player content</div>
      </PlayerErrorBoundary>
    )

    expect(screen.getByText('Player content')).toBeInTheDocument()
  })

  it('renders player-specific error UI when child throws error', () => {
    render(
      <PlayerErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PlayerErrorBoundary>
    )

    expect(screen.getByText('Player Error')).toBeInTheDocument()
    expect(screen.getByText('Unable to load the music player. Please refresh the page.')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('shows Refresh button that can be clicked', () => {
    render(
      <PlayerErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PlayerErrorBoundary>
    )

    const refreshButton = screen.getByText('Refresh')
    expect(refreshButton).toBeInTheDocument()
    
    // Test that the button can be clicked without throwing an error
    expect(() => fireEvent.click(refreshButton)).not.toThrow()
  })

  it('logs player errors to console', () => {
    render(
      <PlayerErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PlayerErrorBoundary>
    )

    expect(console.error).toHaveBeenCalledWith(
      'Player error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })
})

describe('QueueErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <QueueErrorBoundary>
        <div>Queue content</div>
      </QueueErrorBoundary>
    )

    expect(screen.getByText('Queue content')).toBeInTheDocument()
  })

  it('renders queue-specific error UI when child throws error', () => {
    render(
      <QueueErrorBoundary>
        <ThrowError shouldThrow={true} />
      </QueueErrorBoundary>
    )

    expect(screen.getByText('Queue Error')).toBeInTheDocument()
    expect(screen.getByText('Unable to load playlist')).toBeInTheDocument()
  })

  it('logs queue errors to console', () => {
    render(
      <QueueErrorBoundary>
        <ThrowError shouldThrow={true} />
      </QueueErrorBoundary>
    )

    expect(console.error).toHaveBeenCalledWith(
      'Queue error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('has proper styling classes for queue error fallback', () => {
    render(
      <QueueErrorBoundary>
        <ThrowError shouldThrow={true} />
      </QueueErrorBoundary>
    )

    const errorContainer = screen.getByText('Queue Error').closest('div')
    expect(errorContainer).toHaveClass('text-center', 'space-y-2')
  })
})