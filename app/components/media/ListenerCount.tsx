'use client';

// Temporarily use both import paths to avoid build errors
// import { Badge } from '@/app/components/ui/badge';
import { getListenerCount, trackListener } from '@/app/lib/firebase';
import { cn } from '@/app/lib/utils';
import { Headphones } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Maintain the debug interface for potential future debugging
declare global {
  interface Window {
    __firebaseDebug?: {
      logListeners: () => Promise<void>;
      clearAllListeners: () => Promise<void>;
      fixPermissionIssue: () => void;
      getRegisteredClientId: () => string | null;
      isPermissionDenied: () => boolean;
      forceHeartbeat: () => Promise<void>;
      simulateMultipleListeners: () => Promise<void>;
      checkActiveCount: () => Promise<number>;
      testListenerEvent: () => Promise<void>;
      checkFirebaseStatus: () => {
        app: boolean;
        database: boolean;
        listenersRef: boolean;
        initialized: boolean;
        configValid: boolean;
        permissionDenied: boolean;
        clientRegistered: boolean;
        clientId: string | null;
      };
    };
  }
}

interface ListenerCountProps {
  className?: string;
}

// Small spinning loader component
function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-3 w-3" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="3"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Create a shared storage key for saving listener counts to localStorage
const LISTENER_COUNT_STORAGE_KEY = 'radio_listener_count';
const LISTENER_COUNT_TIMESTAMP_KEY = 'radio_listener_count_timestamp';
// Add a flag to track if this is a newly loaded page or not
const IS_FIRST_PAGE_LOAD = typeof window !== 'undefined' && !window.sessionStorage.getItem('radio_session_active');

export function ListenerCount({ className }: ListenerCountProps) {
  const [listenerCount, setListenerCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const registrationRef = useRef<boolean>(false);
  const unsubscribeRef = useRef<() => void>(() => {});
  const callbackExecutedRef = useRef<boolean>(false);
  const currentCountRef = useRef<number | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialCleanupRef = useRef<boolean>(false);
  
  // Mark this as an active session to track page refreshes vs. new sessions
  useEffect(() => {
    if (typeof window !== 'undefined' && IS_FIRST_PAGE_LOAD) {
      window.sessionStorage.setItem('radio_session_active', 'true');
      console.log('📝 New session detected - cleaning up stale listeners');
      
      // On first ever page load, clean up stale listeners
      if (window.__firebaseDebug?.clearAllListeners && !initialCleanupRef.current) {
        window.__firebaseDebug.clearAllListeners()
          .then(() => {
            initialCleanupRef.current = true;
            console.log('🧹 Completed initial cleanup');
          })
          .catch(err => {
            console.error('Error during initial cleanup:', err);
          });
      }
    }
  }, []);
  
  // Save the count to localStorage when it changes
  const persistCountToStorage = (count: number) => {
    try {
      localStorage.setItem(LISTENER_COUNT_STORAGE_KEY, count.toString());
      localStorage.setItem(LISTENER_COUNT_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      // Silently fail if localStorage isn't available
      console.warn('Unable to save listener count to localStorage:', e);
    }
  };
  
  // Handle listener count updates from any source
  const updateListenerCount = (count: number, forceUpdate = false) => {
    // Only update if the count has changed or forced
    if (forceUpdate || count !== currentCountRef.current) {
      console.log(`Updating listener count: ${currentCountRef.current ?? '(none)'} → ${count}`);
      
      // Validate count - only accept counts of 1+ if we're registered
      if (registrationRef.current) {
        // If registered, ensure count is at least 1 (ourselves)
        // For first-time loads, force it to 1 to avoid counting stale entries
        const finalCount = IS_FIRST_PAGE_LOAD ? 1 : Math.max(1, count);
        setListenerCount(finalCount);
        currentCountRef.current = finalCount;
      } else {
        // If not registered, accept any count
        setListenerCount(count);
        currentCountRef.current = count;
      }
      
      persistCountToStorage(currentCountRef.current);
    }
  };
  
  // Check for updates from other tabs
  const checkForStorageUpdates = () => {
    try {
      const storedCount = localStorage.getItem(LISTENER_COUNT_STORAGE_KEY);
      const storedTimestamp = localStorage.getItem(LISTENER_COUNT_TIMESTAMP_KEY);
      
      if (storedCount && storedTimestamp) {
        const count = parseInt(storedCount, 10);
        const timestamp = parseInt(storedTimestamp, 10);
        const now = Date.now();
        
        // Only use the stored count if it's newer than what we have and less than 30 seconds old
        if (!isNaN(count) && !isNaN(timestamp) && now - timestamp < 30000) {
          updateListenerCount(count);
        }
      }
    } catch (e) {
      // Silently fail if localStorage isn't available
      console.warn('Unable to retrieve listener count from localStorage:', e);
    }
  };
  
  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LISTENER_COUNT_STORAGE_KEY) {
        checkForStorageUpdates();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Force update from Firebase every 10 seconds as a fallback
  useEffect(() => {
    const setupPollInterval = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      
      pollIntervalRef.current = setInterval(() => {
        // Only poll if we're past the initial loading phase
        if (!isLoading && currentCountRef.current !== null) {
          if (window.__firebaseDebug?.checkActiveCount) {
            window.__firebaseDebug.checkActiveCount()
              .then(count => {
                // For first load, only count ourselves (1)
                const actualCount = IS_FIRST_PAGE_LOAD && count > 1 ? 1 : count;
                // Always update with the polled value for greater accuracy
                updateListenerCount(actualCount, true);
              })
              .catch(err => {
                console.warn('Error during polling update:', err);
              });
          }
        }
      }, 10000);
    };
    
    setupPollInterval();
    
    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isLoading]);
  
  // Set up listener tracking and count subscription
  useEffect(() => {
    // Try to get initial count from localStorage while loading
    checkForStorageUpdates();
    
    // Register this client and subscribe to listener count updates
    const setupListener = async () => {
      if (registrationRef.current) return; // Already registered
      
      try {
        // Register this client as a listener
        trackListener();
        
        // Mark as registered to prevent duplicate registrations
        registrationRef.current = true;
        
        // Subscribe to real-time listener count updates
        const unsubscribe = getListenerCount((count) => {
          callbackExecutedRef.current = true;
          
          // For initial load, force count to 1 (ourselves) to avoid counting stale entries
          const actualCount = IS_FIRST_PAGE_LOAD && count > 1 ? 1 : count;
          
          // If this is the first time we're getting data
          if (currentCountRef.current === null) {
            // Set count and persist to storage
            updateListenerCount(actualCount);
            
            // After a brief delay, stop loading and expand the badge
            setTimeout(() => {
              setIsLoading(false);
              
              // Short delay after loading stops before expanding
              setTimeout(() => {
                setIsExpanded(true);
              }, 50);
            }, 500);
          } else if (actualCount !== currentCountRef.current) {
            // Just update the count - badge width will adjust automatically
            updateListenerCount(actualCount);
          }
          
          // Keep the Firebase debug test for edge cases where count is 0
          if (count === 0 && window.__firebaseDebug?.testListenerEvent) {
            window.__firebaseDebug.testListenerEvent();
          }
        });
        
        // Store unsubscribe function for cleanup
        unsubscribeRef.current = unsubscribe;
        
        // Fallback check if Firebase callback doesn't execute
        setTimeout(() => {
          if (!callbackExecutedRef.current) {
            console.log('Firebase callback not executed after timeout, using fallback');
            if (window.__firebaseDebug?.checkActiveCount) {
              window.__firebaseDebug.checkActiveCount()
                .then(count => {
                  // Always start with 1 (ourselves) to avoid counting stale entries on first load
                  const safeCount = IS_FIRST_PAGE_LOAD && count > 1 ? 1 : Math.max(1, count);
                  
                  // Set count first
                  updateListenerCount(safeCount);
                  
                  // Stop loading and expand the badge
                  setIsLoading(false);
                  setTimeout(() => setIsExpanded(true), 50);
                })
                .catch(() => {
                  // Handle error case - still show 1 as a fallback
                  updateListenerCount(1);
                  setIsLoading(false);
                  setTimeout(() => setIsExpanded(true), 50);
                });
            } else {
              // If debug tools not available, just use default value of 1
              updateListenerCount(1);
              setIsLoading(false);
              setTimeout(() => setIsExpanded(true), 50);
            }
          }
        }, 2000);
      } catch (error) {
        console.error('Error setting up listener tracking:', error);
        // Still show the badge with a default count of 1
        updateListenerCount(1);
        setIsLoading(false);
        setTimeout(() => setIsExpanded(true), 50);
      }
    };
    
    // Start the registration process
    setupListener();
    
    // Clean up on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);
  
  // Calculate display count - minimum of 1 for the UI
  const displayCount = typeof listenerCount === 'number' ? Math.max(1, listenerCount) : 1;
  
  // Calculate appropriate width based on the number of digits
  const getTextWidth = () => {
    const baseWidth = 32; // Icon area
    const textContent = `${displayCount} listening now`;
    const countTextWidth = textContent.length * 6.2; // Approximate width per character
    return Math.ceil(baseWidth + countTextWidth);
  };
  
  // Calculate badge width with elegant transition
  const badgeWidth = isExpanded ? getTextWidth() : 32;
  
  return (
    <div 
      className={cn(
        'relative h-8 transition-all duration-500 ease-out overflow-visible',
        className
      )}
      style={{
        width: `${badgeWidth}px`,
        transform: 'translateZ(0)', // Enable GPU acceleration
        willChange: 'width',
        transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Main container */}
      <div 
        className={cn(
          'absolute top-0 left-0 flex items-center h-full',
          'rounded-full bg-black/40 backdrop-blur-md',
          'border-none text-white/90 text-sm font-regular',
          'transition-all duration-300 ease-out',
          isLoading ? 'justify-center' : 'justify-start',
          isExpanded ? 'pl-3 pr-3' : 'w-8 p-0',
        )}
      >
        {/* The loading icon and spinner container */}
        <div 
          className={cn(
            'relative flex items-center justify-center',
            'transition-all duration-300 ease-out',
            isExpanded && !isLoading ? 'mr-1.5' : 'w-full h-full',
          )}
        >
          {/* The rotating spinner around the icon (only when loading) */}
          {isLoading && (
            <div 
              className="absolute rounded-full"
              style={{
                width: '20px',
                height: '20px',
                border: '1.5px solid rgba(255, 255, 255, 0.12)',
                borderTopColor: 'rgba(255, 255, 255, 0.8)',
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
          
          {/* Headphones icon */}
          <Headphones 
            size={12} 
            strokeWidth={2.5}
            className={cn(
              'text-white/90 z-10 transition-all duration-300',
              isLoading ? 'scale-105' : 'scale-105',
            )}
          />
        </div>
        
        {/* Listener count text that slides in */}
        {!isLoading && (
          <div 
            className={cn(
              'overflow-hidden whitespace-nowrap',
              'transition-all ease-out duration-300',
            )}
            style={{
              maxWidth: isExpanded ? '100%' : '0',
              opacity: isExpanded ? '1' : '0',
              transform: isExpanded ? 'translateX(0)' : 'translateX(15px)',
            }}
          >
            <span ref={textRef}>
              {displayCount} listening now
            </span>
          </div>
        )}
      </div>
      
      {/* Defining the animation */}
      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
} 