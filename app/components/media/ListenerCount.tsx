'use client';

// Temporarily use both import paths to avoid build errors
import { Badge } from '@/app/components/ui/Badge';
// import { Badge } from '@/app/components/ui/badge';
import { getListenerCount, trackListener } from '@/app/lib/firebase';
import { Headphones } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Add type declaration for the debug interface
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

export function ListenerCount({ className }: ListenerCountProps) {
  // Instead of null, initialize with 0 to avoid the "..." state
  const [listenerCount, setListenerCount] = useState<number>(1); // Start with 1 to avoid "0 listening now"
  const registrationRef = useRef<boolean>(false);
  const unsubscribeRef = useRef<() => void>(() => {});
  
  // Debug-specific state for tracking callback execution
  const [callbackExecuted, setCallbackExecuted] = useState<boolean>(false);
  const [firebaseInitChecked, setFirebaseInitChecked] = useState<boolean>(false);
  
  // Immediately check Firebase status after mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__firebaseDebug?.checkFirebaseStatus) {
      console.log('🧪 Running immediate Firebase status check...');
      const status = window.__firebaseDebug.checkFirebaseStatus();
      setFirebaseInitChecked(true);
      console.log('📋 Firebase status:', status);
    }
  }, []);

  // Log whenever the count is updated
  
  
  // Set up listener tracking and count subscription
  useEffect(() => {
    console.log('🔊 ListenerCount component mounted');
    
    // Only register once per mount
    if (!registrationRef.current) {
      try {
        // Register this client as a listener
        const clientId = trackListener();
        console.log(`✅ Registered with Firebase as client: ${clientId}`);
        
        // Mark as registered to prevent duplicate registrations
        registrationRef.current = true;
        
        // Subscribe to real-time listener count updates
        console.log('📡 Setting up subscription to listener count updates');
        const unsubscribe = getListenerCount((count) => {
          console.log(`🔢 Listener count update received: ${count}`);
          setCallbackExecuted(true);
          setListenerCount(count);
          
          // Log to console for debugging
          console.table({
            count,
            time: new Date().toISOString(),
            callbackExecuted: true
          });
          
          // Force Firebase debug test if this is the first update and count is still 0
          if (count === 0 && window.__firebaseDebug?.testListenerEvent) {
            console.log('🧪 Testing Firebase events due to 0 count...');
            window.__firebaseDebug.testListenerEvent();
          }
        });
        
        // Store unsubscribe function for cleanup
        unsubscribeRef.current = unsubscribe;
        
        // Check that Firebase is working after 2 seconds
        setTimeout(() => {
          if (!callbackExecuted && window.__firebaseDebug?.checkActiveCount) {
            console.error('⚠️ WARNING: Firebase callback has not executed after 2 seconds');
            window.__firebaseDebug.checkActiveCount()
              .then(count => {
                console.log(`📊 Direct count check: ${count} active listeners`);
                // If we have listeners but callback didn't fire, manually set count
                if (count > 0) {
                  console.log('🚨 Forcing count update due to callback failure');
                  setListenerCount(count);
                } else if (window.__firebaseDebug?.checkFirebaseStatus) {
                  // Try to diagnose Firebase issues
                  window.__firebaseDebug.checkFirebaseStatus();
                }
              });
          }
        }, 2000);
      } catch (error) {
        console.error('❌ Error setting up listener tracking:', error);
      }
    }
    
    // Clean up on unmount
    return () => {
      console.log('🔇 ListenerCount component unmounting');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);
  
  // Calculate display count - minimum of 1 for the UI
  const displayCount = Math.max(1, listenerCount);
  
  console.log(`🎵 Rendering listener count: ${displayCount} (raw: ${listenerCount})`);
  
  // Display listener badge, with minimum of 1 listener
  return (
    <>
      <Badge 
        variant="secondary" 
        className={`flex items-center gap-1.5 py-1 px-2.5 text-white/90 text-xs font-medium transition-opacity duration-300 bg-black/60 backdrop-blur-md border-none ${className}`}
      >
        <Headphones 
          size={12} 
          strokeWidth={3} 
        />
        <span className="">
          {displayCount} listening now
        </span>
      </Badge>
    </>
  );
} 