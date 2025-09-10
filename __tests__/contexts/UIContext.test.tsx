import { render, screen, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { UIProvider, useUI } from '@/app/contexts/UIContext'

// Test component to interact with UIContext
const TestComponent = () => {
  const { state, dispatch } = useUI()
  
  return (
    <div>
      <div data-testid="initial-load">{state.isInitialLoad.toString()}</div>
      <div data-testid="content-visible">{state.isContentVisible.toString()}</div>
      <div data-testid="ui-ready">{state.isUIReady.toString()}</div>
      <div data-testid="image-loaded">{state.imageLoaded.toString()}</div>
      <div data-testid="track-loaded">{state.isTrackLoaded.toString()}</div>
      <div data-testid="error">{state.error || 'null'}</div>
      <div data-testid="initial-play">{state.isInitialPlay.toString()}</div>
      
      <button 
        data-testid="set-content-visible" 
        onClick={() => dispatch({ type: 'SET_CONTENT_VISIBLE', payload: true })}
      >
        Set Content Visible
      </button>
      <button 
        data-testid="set-error" 
        onClick={() => dispatch({ type: 'SET_ERROR', payload: 'Test error' })}
      >
        Set Error
      </button>
      <button 
        data-testid="clear-error" 
        onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
      >
        Clear Error
      </button>
      <button 
        data-testid="reset-ui" 
        onClick={() => dispatch({ type: 'RESET_UI' })}
      >
        Reset UI
      </button>
    </div>
  )
}

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <UIProvider>{children}</UIProvider>
)

describe('UIContext', () => {
  it('provides initial state correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('initial-load')).toHaveTextContent('true')
    expect(screen.getByTestId('content-visible')).toHaveTextContent('false')
    expect(screen.getByTestId('ui-ready')).toHaveTextContent('false')
    expect(screen.getByTestId('image-loaded')).toHaveTextContent('false')
    expect(screen.getByTestId('track-loaded')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
    expect(screen.getByTestId('initial-play')).toHaveTextContent('true')
  })

  it('updates state when dispatching SET_CONTENT_VISIBLE action', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const button = screen.getByTestId('set-content-visible')
    
    act(() => {
      button.click()
    })

    expect(screen.getByTestId('content-visible')).toHaveTextContent('true')
  })

  it('handles error state correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const setErrorButton = screen.getByTestId('set-error')
    const clearErrorButton = screen.getByTestId('clear-error')
    
    // Set error
    act(() => {
      setErrorButton.click()
    })
    expect(screen.getByTestId('error')).toHaveTextContent('Test error')

    // Clear error
    act(() => {
      clearErrorButton.click()
    })
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('resets state when dispatching RESET_UI action', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const setContentVisibleButton = screen.getByTestId('set-content-visible')
    const setErrorButton = screen.getByTestId('set-error')
    const resetButton = screen.getByTestId('reset-ui')
    
    // Change some state
    act(() => {
      setContentVisibleButton.click()
      setErrorButton.click()
    })

    expect(screen.getByTestId('content-visible')).toHaveTextContent('true')
    expect(screen.getByTestId('error')).toHaveTextContent('Test error')

    // Reset UI
    act(() => {
      resetButton.click()
    })

    // Should return to initial state
    expect(screen.getByTestId('initial-load')).toHaveTextContent('true')
    expect(screen.getByTestId('content-visible')).toHaveTextContent('false')
    expect(screen.getByTestId('ui-ready')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('throws error when useUI is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useUI must be used within a UIProvider')

    consoleSpy.mockRestore()
  })
})