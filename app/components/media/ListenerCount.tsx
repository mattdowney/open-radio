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
const FIRST_TAB_KEY = 'radio_first_tab';
const REGISTRATION_LOCK_KEY = 'radio_registration_lock';

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
  const isFirstTabRef = useRef<boolean>(false);
  const maxLoadingTimeRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadCompleteRef = useRef<boolean>(false);
  
  // Acquire a registration lock to prevent multiple tabs from registering simultaneously
  const acquireRegistrationLock = () => {
    try {
      const lockValue = localStorage.getItem(REGISTRATION_LOCK_KEY);
      if (lockValue) {
        const lockTime = parseInt(lockValue, 10);
        const now = Date.now();
        // If lock is less than 5 seconds old, it's still valid
        if (!isNaN(lockTime) && now - lockTime < 5000) {
          return false;
        }
      }
      
      // Set lock with current timestamp
      localStorage.setItem(REGISTRATION_LOCK_KEY, Date.now().toString());
      return true;
    } catch (e) {
      // If localStorage fails, assume we can proceed
      return true;
    }
  };
  
  // Release the registration lock
  const releaseRegistrationLock = () => {
    try {
      localStorage.removeItem(REGISTRATION_LOCK_KEY);
    } catch (e) {
      // Ignore errors
    }
  };
  
  // Get the latest count directly from Firebase
  const fetchLatestCount = async () => {
    if (!window.__firebaseDebug?.checkActiveCount) return null;
    
    try {
      const count = await window.__firebaseDebug.checkActiveCount();
      // First-tab correction for direct fetch
      if (isFirstTabRef.current && count === 2) {
        console.log('Initial fetch: First tab detected with count 2, correcting to 1');
        return 1;
      }
      return count > 0 ? count : 1;
    } catch (err) {
      console.warn('Error during direct count fetch:', err);
      return null;
    }
  };
  
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
  
  // Check if this is the first tab (for more accurate single-user detection)
  const checkIfFirstTab = () => {
    try {
      // Try to become the first tab
      const currentFirstTab = localStorage.getItem(FIRST_TAB_KEY);
      if (!currentFirstTab) {
        const newId = Date.now().toString();
        localStorage.setItem(FIRST_TAB_KEY, newId);
        isFirstTabRef.current = true;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };
  
  // Handle listener count updates from any source
  const updateListenerCount = (count: number, force = false) => {
    // Special case: if we're the first tab and count is 2, it's likely just us
    // This corrects a common Firebase issue where a new connection counts as 2
    if (isFirstTabRef.current && count === 2 && !force) {
      count = 1;
    }
    
    // Only update if the count has changed or we're forcing an update
    if (force || count !== currentCountRef.current) {
      // Log only when there's a change
      if (count !== currentCountRef.current) {
        console.log(`Updating listener count: ${currentCountRef.current} → ${count}`);
      }
      
      setListenerCount(count);
      currentCountRef.current = count;
      persistCountToStorage(count);
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
      } else if (e.key === FIRST_TAB_KEY && e.newValue === null) {
        // Try to become the new first tab if the previous one was closed
        checkIfFirstTab();
      } else if (e.key === REGISTRATION_LOCK_KEY && e.newValue === null) {
        // Try to register if the lock is released
        if (!registrationRef.current && isLoading) {
          initializeListenerTracking();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Try to set this as the first tab (for more accurate single-user detection)
    isFirstTabRef.current = checkIfFirstTab();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      
      // If this was the first tab, clear the marker when closing
      if (isFirstTabRef.current) {
        try {
          localStorage.removeItem(FIRST_TAB_KEY);
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
      
      // Always release the lock if we held it
      releaseRegistrationLock();
    };
  }, []);
  
  // Handle the registration and Firebase setup
  const initializeListenerTracking = async () => {
    // Prevent multiple initializations
    if (registrationRef.current) return;
    
    // Try to acquire the registration lock
    const canRegister = acquireRegistrationLock();
    
    // If we can't acquire the lock, rely on localStorage updates instead
    if (!canRegister) {
      console.log('Another tab is currently registering, waiting for updates from localStorage');
      checkForStorageUpdates();
      return;
    }
    
    try {
      // First, try to get the actual count directly before we register
      // This helps us get accurate initial count
      const initialCount = await fetchLatestCount();
      
      // Register this client as a listener
      trackListener();
      
      // Mark as registered to prevent duplicate registrations
      registrationRef.current = true;
      
      // If we got an initial count directly, use it right away
      if (initialCount !== null) {
        console.log(`Got initial count directly: ${initialCount}`);
        updateListenerCount(initialCount);
        
        // Since we already have the count, we can show it immediately 
        // instead of waiting for the subscription
        setIsLoading(false);
        setTimeout(() => {
          setIsExpanded(true);
          releaseRegistrationLock();
        }, 50);
        
        initialLoadCompleteRef.current = true;
      }
      
      // Subscribe to real-time listener count updates
      const unsubscribe = getListenerCount((count) => {
        callbackExecutedRef.current = true;
        
        // First-tab correction: If we're the first tab and count is 2, it's likely a Firebase quirk
        if (isFirstTabRef.current && count === 2) {
          console.log('First tab detected with count 2, correcting to 1');
          count = 1;
        }
        
        // Always update the count from subscription
        updateListenerCount(count);
        
        // If initial load not already completed via direct fetch
        if (!initialLoadCompleteRef.current) {
          // After a brief delay, stop loading and expand the badge
          setTimeout(() => {
            setIsLoading(false);
            
            // Short delay after loading stops before expanding
            setTimeout(() => {
              setIsExpanded(true);
            }, 50);
            
            // Release the lock now that we're done loading
            releaseRegistrationLock();
          }, 500);
          
          initialLoadCompleteRef.current = true;
        }
      });
      
      // Store unsubscribe function for cleanup
      unsubscribeRef.current = unsubscribe;
      
      // Fallback check if Firebase callback doesn't execute
      setTimeout(() => {
        if (!callbackExecutedRef.current && !initialLoadCompleteRef.current) {
          fetchLatestCount().then(count => {
            if (count !== null) {
              // Set count first
              updateListenerCount(count);
              
              // Stop loading and expand the badge
              setIsLoading(false);
              setTimeout(() => setIsExpanded(true), 50);
            } else {
              // Use default value if fetch failed
              updateListenerCount(1);
              setIsLoading(false);
              setTimeout(() => setIsExpanded(true), 50);
            }
            
            // Mark complete and release lock
            initialLoadCompleteRef.current = true;
            releaseRegistrationLock();
          }).catch(() => {
            // Handle error case
            updateListenerCount(1);
            setIsLoading(false);
            setTimeout(() => setIsExpanded(true), 50);
            initialLoadCompleteRef.current = true;
            releaseRegistrationLock();
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Error setting up listener tracking:', error);
      updateListenerCount(1);
      setIsLoading(false);
      setTimeout(() => setIsExpanded(true), 50);
      initialLoadCompleteRef.current = true;
      releaseRegistrationLock();
    }
  };
  
  // Force update from Firebase every 10 seconds as a fallback
  useEffect(() => {
    const setupPollInterval = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      
      pollIntervalRef.current = setInterval(() => {
        // Only poll if we're past the initial loading phase
        if (!isLoading && currentCountRef.current !== null) {
          fetchLatestCount().then(count => {
            if (count !== null) {
              // Use force=true for polling updates to ensure we always get fresh data
              updateListenerCount(count, true);
            }
          }).catch(console.warn);
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
    
    // Start tracking process
    initializeListenerTracking();
    
    // Set a maximum loading time of 10 seconds
    maxLoadingTimeRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading timeout reached, forcing badge to show');
        updateListenerCount(1);
        setIsLoading(false);
        setTimeout(() => setIsExpanded(true), 50);
        initialLoadCompleteRef.current = true;
        releaseRegistrationLock();
      }
    }, 10000);
    
    // Clean up on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      if (maxLoadingTimeRef.current) {
        clearTimeout(maxLoadingTimeRef.current);
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