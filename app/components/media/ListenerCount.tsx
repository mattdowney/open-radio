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

// Storage and synchronization keys
const LISTENER_COUNT_STORAGE_KEY = 'radio_listener_count';
const LISTENER_COUNT_TIMESTAMP_KEY = 'radio_listener_count_timestamp';
const FIRST_TAB_KEY = 'radio_first_tab';
const REGISTRATION_LOCK_KEY = 'radio_registration_lock';
const COUNT_INITIALIZED_KEY = 'radio_count_initialized';

// Constants to control debouncing and count changes
const COUNT_DEBOUNCE_TIME = 800; // debounce count changes to prevent flicker
const TIMEOUT_MAX_WAIT = 8000; // maximum time to wait for Firebase data
const INITIAL_COUNT_STABILITY_TIME = 2000; // time to wait before trusting initial count

export function ListenerCount({ className }: ListenerCountProps) {
  const [listenerCount, setListenerCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const registrationRef = useRef<boolean>(false);
  const unsubscribeRef = useRef<() => void>(() => {});
  const callbackExecutedRef = useRef<boolean>(false);
  const currentCountRef = useRef<number | null>(null);
  const lastCountTimestampRef = useRef<number>(0);
  const pendingCountRef = useRef<number | null>(null);
  const pendingCountTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countStabilityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stableCountAchievedRef = useRef<boolean>(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstTabRef = useRef<boolean>(false);
  const maxLoadingTimeRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadCompleteRef = useRef<boolean>(false);
  
  // Get a direct count from Firebase without registering
  const fetchLatestCount = async () => {
    if (!window.__firebaseDebug?.checkActiveCount) return null;
    
    try {
      const count = await window.__firebaseDebug.checkActiveCount();
      // Log all direct count fetches for debugging
      console.log(`Direct count fetch: ${count}`);
      
      // Only count > 0 values for direct fetches
      return count > 0 ? count : null;
    } catch (err) {
      console.warn('Error during direct count fetch:', err);
      return null;
    }
  };
  
  // Check if this is the first tab in the browser
  const checkIfFirstTab = () => {
    try {
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
  
  // Handle sync between tabs
  const persistCountToStorage = (count: number) => {
    try {
      // Only persist counts that are > 0 and have passed the stability check
      if (count > 0 && stableCountAchievedRef.current) {
        localStorage.setItem(LISTENER_COUNT_STORAGE_KEY, count.toString());
        localStorage.setItem(LISTENER_COUNT_TIMESTAMP_KEY, Date.now().toString());
        localStorage.setItem(COUNT_INITIALIZED_KEY, 'true');
      }
    } catch (e) {
      console.warn('Unable to save listener count to localStorage:', e);
    }
  };
  
  // Debounced count update function to prevent flickering
  const scheduleCountUpdate = (newCount: number, immediate = false) => {
    // Clear any pending count updates
    if (pendingCountTimerRef.current) {
      clearTimeout(pendingCountTimerRef.current);
      pendingCountTimerRef.current = null;
    }
    
    // Store the new pending count
    pendingCountRef.current = newCount;
    const now = Date.now();
    
    // If immediate or if it's been a while since last update, apply right away
    if (immediate || (now - lastCountTimestampRef.current > COUNT_DEBOUNCE_TIME * 2)) {
      applyCountUpdate(newCount);
      return;
    }
    
    // Otherwise, schedule the update with debounce
    pendingCountTimerRef.current = setTimeout(() => {
      if (pendingCountRef.current !== null) {
        applyCountUpdate(pendingCountRef.current);
      }
    }, COUNT_DEBOUNCE_TIME);
  };
  
  // Actually apply the count update
  const applyCountUpdate = (newCount: number) => {
    // Only update if count has changed
    if (newCount !== currentCountRef.current) {
      console.log(`Applying count update: ${currentCountRef.current} → ${newCount}`);
      
      // Update the state and refs
      setListenerCount(newCount);
      currentCountRef.current = newCount;
      lastCountTimestampRef.current = Date.now();
      pendingCountRef.current = null;
      
      // Persist to localStorage for tab sync
      persistCountToStorage(newCount);
    }
  };
  
  // Check for updates from other tabs
  const checkForStorageUpdates = () => {
    try {
      const initialized = localStorage.getItem(COUNT_INITIALIZED_KEY) === 'true';
      const storedCount = localStorage.getItem(LISTENER_COUNT_STORAGE_KEY);
      const storedTimestamp = localStorage.getItem(LISTENER_COUNT_TIMESTAMP_KEY);
      
      // Only use stored count if it's initialized, valid, and recent
      if (initialized && storedCount && storedTimestamp) {
        const count = parseInt(storedCount, 10);
        const timestamp = parseInt(storedTimestamp, 10);
        const now = Date.now();
        
        if (!isNaN(count) && !isNaN(timestamp) && now - timestamp < 15000) {
          // For cross-tab sync, we don't debounce
          applyCountUpdate(count);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.warn('Error checking localStorage:', e);
      return false;
    }
  };
  
  // Acquire a registration lock
  const acquireRegistrationLock = () => {
    try {
      const lockValue = localStorage.getItem(REGISTRATION_LOCK_KEY);
      if (lockValue) {
        const lockTime = parseInt(lockValue, 10);
        const now = Date.now();
        if (!isNaN(lockTime) && now - lockTime < 5000) {
          return false;
        }
      }
      
      localStorage.setItem(REGISTRATION_LOCK_KEY, Date.now().toString());
      return true;
    } catch (e) {
      return true;
    }
  };
  
  // Release registration lock
  const releaseRegistrationLock = () => {
    try {
      localStorage.removeItem(REGISTRATION_LOCK_KEY);
    } catch (e) {
      // Ignore errors
    }
  };
  
  // Initialize Firebase connection and listener tracking
  const initializeListenerTracking = async () => {
    // Check if this client is already registered
    if (registrationRef.current) return;
    
    // Try to get initial data from localStorage first
    const hasStoredCount = checkForStorageUpdates();
    
    // Try to acquire the registration lock
    const canRegister = acquireRegistrationLock();
    
    if (!canRegister) {
      console.log('Another tab is registering, using localStorage updates');
      
      // If we couldn't get data from localStorage, try direct query
      if (!hasStoredCount) {
        const initialCount = await fetchLatestCount();
        if (initialCount !== null) {
          scheduleCountUpdate(initialCount);
        }
      }
      
      // Set up periodic polling for count changes
      setupPolling();
      return;
    }
    
    try {
      // Before registering, get the current count if possible
      let preRegisterCount = null;
      if (!hasStoredCount) {
        preRegisterCount = await fetchLatestCount();
        if (preRegisterCount !== null) {
          // Apply immediately but don't mark as stable yet
          scheduleCountUpdate(preRegisterCount);
        }
      }
      
      // Register this client as a listener
      trackListener();
      registrationRef.current = true;
      
      // Set up listener for count changes
      const unsubscribe = getListenerCount((count) => {
        callbackExecutedRef.current = true;
        
        // Log all counts from Firebase
        console.log(`Firebase count update: ${count}`);
        
        // Don't trust very low counts during initialization
        if (!stableCountAchievedRef.current && count === 1 && preRegisterCount && preRegisterCount > 1) {
          console.log('Ignoring suspicious initial count of 1');
          return;
        }
        
        // Schedule the update (debounced)
        scheduleCountUpdate(count);
        
        // If still loading, complete the loading phase
        if (isLoading && count > 0) {
          finishLoading();
        }
      });
      
      // Store for cleanup
      unsubscribeRef.current = unsubscribe;
      
      // Start the count stability timer
      startCountStabilityTimer();
      
      // Set up a fallback in case Firebase subscription doesn't fire
      setTimeout(async () => {
        if (isLoading || !callbackExecutedRef.current) {
          console.log('Firebase subscription timeout, using fallback');
          
          // Try once more to get count
          const fallbackCount = await fetchLatestCount();
          if (fallbackCount !== null) {
            scheduleCountUpdate(fallbackCount, true);
          } else if (preRegisterCount !== null) {
            scheduleCountUpdate(preRegisterCount, true);
          } else {
            scheduleCountUpdate(1, true);
          }
          
          // Ensure loading is complete
          finishLoading();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error in listener tracking:', error);
      
      // Use fallback count
      scheduleCountUpdate(1, true);
      finishLoading();
      
      // Release lock
      releaseRegistrationLock();
    }
  };
  
  // Finish loading and show the badge
  const finishLoading = () => {
    if (isLoading) {
      setIsLoading(false);
      
      // Add small delay before expanding
      setTimeout(() => {
        setIsExpanded(true);
        
        // Release the lock after expanded
        setTimeout(() => {
          releaseRegistrationLock();
        }, 100);
      }, 50);
      
      initialLoadCompleteRef.current = true;
    }
  };
  
  // Start a timer to establish count stability
  const startCountStabilityTimer = () => {
    if (countStabilityTimerRef.current) {
      clearTimeout(countStabilityTimerRef.current);
    }
    
    countStabilityTimerRef.current = setTimeout(() => {
      console.log('Count stability timeout reached, accepting current count as stable');
      stableCountAchievedRef.current = true;
      
      // Once stable, persist current count to localStorage
      if (currentCountRef.current !== null) {
        persistCountToStorage(currentCountRef.current);
      }
      
      // Set up polling for ongoing updates
      setupPolling();
    }, INITIAL_COUNT_STABILITY_TIME);
  };
  
  // Set up periodic polling for count updates
  const setupPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(async () => {
      if (!isLoading) {
        const count = await fetchLatestCount();
        if (count !== null) {
          // For polling, we don't use immediate=true to avoid flickering
          scheduleCountUpdate(count);
        }
      }
    }, 10000);
  };
  
  // Listen for localStorage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LISTENER_COUNT_STORAGE_KEY || e.key === COUNT_INITIALIZED_KEY) {
        checkForStorageUpdates();
      } else if (e.key === FIRST_TAB_KEY && e.newValue === null) {
        checkIfFirstTab();
      } else if (e.key === REGISTRATION_LOCK_KEY && e.newValue === null) {
        if (!registrationRef.current && isLoading) {
          initializeListenerTracking();
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    isFirstTabRef.current = checkIfFirstTab();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      
      if (isFirstTabRef.current) {
        try {
          localStorage.removeItem(FIRST_TAB_KEY);
        } catch (e) {}
      }
      
      releaseRegistrationLock();
    };
  }, []);
  
  // Initialize tracking and setup maximum wait timeout
  useEffect(() => {
    // Try to get existing count data
    checkForStorageUpdates();
    
    // Start tracking
    initializeListenerTracking();
    
    // Set maximum loading time
    maxLoadingTimeRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn('Maximum loading time reached, forcing badge to show');
        
        // Get any available count or use 1
        const count = currentCountRef.current ?? 1;
        scheduleCountUpdate(count, true);
        
        // Complete loading
        finishLoading();
      }
    }, TIMEOUT_MAX_WAIT);
    
    // Clean up on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      if (maxLoadingTimeRef.current) {
        clearTimeout(maxLoadingTimeRef.current);
      }
      
      if (countStabilityTimerRef.current) {
        clearTimeout(countStabilityTimerRef.current);
      }
      
      if (pendingCountTimerRef.current) {
        clearTimeout(pendingCountTimerRef.current);
      }
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);
  
  // Calculate display count
  const displayCount = typeof listenerCount === 'number' ? Math.max(1, listenerCount) : 1;
  
  // Calculate badge width
  const getTextWidth = () => {
    const baseWidth = 32; // Icon area
    const textContent = `${displayCount} listening now`;
    const countTextWidth = textContent.length * 6.2; // Approximate width per character
    return Math.ceil(baseWidth + countTextWidth);
  };
  
  // Badge width with transition
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