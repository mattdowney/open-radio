import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
    child,
    Database,
    DatabaseReference,
    get,
    getDatabase,
    onValue,
    ref,
    remove,
    set,
    update
} from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

/**
 * Check if Firebase is properly configured with all required values
 * @returns true if Firebase is configured, false otherwise
 */
function isFirebaseConfigured(): boolean {
  // Don't expose API keys and other config values in client logs
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'databaseURL'
  ];
  
  const hasAllRequiredKeys = requiredKeys.every(key => 
    firebaseConfig && typeof firebaseConfig[key as keyof typeof firebaseConfig] === 'string' && 
    firebaseConfig[key as keyof typeof firebaseConfig] !== ''
  );
  
  return hasAllRequiredKeys;
}

// Initialize Firebase if configured
let app: FirebaseApp | undefined;
let database: Database | undefined;
let listenersRef: DatabaseReference | undefined;
let _firebaseInitialized = false;

// Keep track of client registration to prevent double registration
let registeredClientId: string | null = null;

// Global constants for listener tracking
const MAX_LISTENER_AGE = 90000; // 90 seconds (was 60 seconds)
const HEARTBEAT_INTERVAL = 15000; // 15 seconds (was 30 seconds)
const CLEANUP_INTERVAL = 30000; // 30 seconds

// Flag to track if we've already cleaned up stale entries
let cleanupPerformed = false;

// Flag to track if firebase permissions are denied
let permissionsDenied = false;

// Flag to track if we've already registered event listeners
let eventsRegistered = false;

// Flag to track if tracking is already in progress
let isTrackingInProgress = false;

if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  try {
    // Initialize only if not already initialized
    if (!getApps().length) {
      console.log('🔥 Initializing Firebase for the first time');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('🔄 Using existing Firebase app');
      app = getApps()[0];
    }
    
    console.log('📊 Getting Firebase Database reference');
    database = getDatabase(app);
    listenersRef = ref(database, 'listeners');
    _firebaseInitialized = true;
    console.log('✅ Firebase successfully initialized');
    
    // Force cleanup of stale entries on page load in development mode
    if (process.env.NODE_ENV === 'development' && !cleanupPerformed) {
      forceCleanupAllStaleEntries();
    } else {
      // Just clean up normally in production
      cleanupStaleListeners();
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    _firebaseInitialized = false;
  }
}

// Add debugging utility to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-ignore - We're adding debug utilities to the window object
  window.__firebaseDebug = {
    clearAllListeners: async () => {
      if (!database || !listenersRef) {
        console.log('Firebase not initialized');
        return;
      }
      try {
        const snapshot = await get(listenersRef);
        const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        
        // Clear all listeners
        await set(listenersRef, null);
        console.log(`🧹 Deleted ${count} listener entries from Firebase`);
        
        // Re-register ourselves
        registeredClientId = null;
        permissionsDenied = false; // Reset permission denied flag
        const newId = trackListener();
        console.log(`✅ Re-registered current tab with ID: ${newId}`);
        console.log(`👥 Listener count should now be 1`);
      } catch (error: any) {
        console.error('Error clearing listeners:', error);
        if (error.toString().includes('permission_denied')) {
          console.error('⛔️ PERMISSION DENIED: Your Firebase rules are preventing write access');
          console.error('Please update your Firebase Realtime Database rules to allow read/write access');
          permissionsDenied = true;
        }
      }
    },
    logListeners: async () => {
      if (!database || !listenersRef) return;
      try {
        const snapshot = await get(listenersRef);
        if (!snapshot.exists()) {
          console.log('No listeners found');
          return;
        }
        const data = snapshot.val();
        console.group('Current Listeners');
        Object.entries<any>(data).forEach(([id, record]) => {
          const age = Date.now() - record.timestamp;
          const status = age < MAX_LISTENER_AGE ? '✅ ACTIVE' : '❌ STALE';
          console.log(`${status} - ${id}: last ping ${Math.floor(age/1000)}s ago (${new Date(record.timestamp).toISOString()})`);
        });
        console.groupEnd();
      } catch (error: any) {
        console.error('Error logging listeners:', error);
        if (error.toString().includes('permission_denied')) {
          console.error('⛔️ PERMISSION DENIED: Your Firebase rules are preventing read access');
          console.error('Please update your Firebase Realtime Database rules to allow read access');
          permissionsDenied = true;
        }
      }
    },
    forceHeartbeat: async () => {
      if (!database || !registeredClientId) {
        console.log('❌ Cannot update heartbeat: Firebase not initialized or client not registered');
        return;
      }
      
      try {
        const clientRef = ref(database, `listeners/${registeredClientId}`);
        
        // Force an update of our timestamp
        await set(clientRef, { 
          timestamp: Date.now(),
          active: true,
          environment: process.env.NODE_ENV || 'unknown'
        });
        
        console.log(`💓 Forced heartbeat update for client: ${registeredClientId}`);
        console.log('📊 Current listeners will be logged in 500ms...');
        
        // Log listeners after a short delay to see the update
        setTimeout(() => {
          window.__firebaseDebug?.logListeners();
        }, 500);
      } catch (error: any) {
        console.error('Error during forced heartbeat:', error);
        if (error.toString().includes('permission_denied')) {
          permissionsDenied = true;
          console.error('⛔️ PERMISSION DENIED: Your Firebase rules are preventing write access');
        }
      }
    },
    checkActiveCount: async (): Promise<number> => {
      try {
        if (!database || !listenersRef) {
          console.error('Firebase not initialized');
          return 0;
        }
        
        const snapshot = await get(listenersRef);
        if (!snapshot.exists()) {
          return 0;
        }
        
        const data = snapshot.val();
        const now = Date.now();
        
        const activeEntries = Object.entries<any>(data).filter(([_, record]) => {
          return record.timestamp && (now - record.timestamp < MAX_LISTENER_AGE);
        });
        
        return activeEntries.length;
      } catch (error) {
        console.error('Error checking active count:', error);
        return 0;
      }
    },
    testListenerEvent: async () => {
      if (!database || !listenersRef) {
        console.log('⛔️ Cannot test: Firebase not initialized');
        return;
      }
      
      console.log('🧪 Starting test of Firebase real-time events...');
      
      try {
        // Create a test listener just to trigger an update
        const testId = `test-event-${Date.now()}`;
        const testRef = ref(database, `listeners/${testId}`);
        
        console.log('1️⃣ Adding test listener to database...');
        await set(testRef, {
          timestamp: Date.now(),
          active: true,
          environment: 'test-event',
          isTest: true
        });
        
        console.log('2️⃣ Test listener added. This should trigger onValue callbacks.');
        console.log('3️⃣ Waiting 1 second before cleanup...');
        
        // Allow time for events to propagate
        setTimeout(async () => {
          console.log('4️⃣ Removing test listener...');
          await remove(testRef);
          console.log('5️⃣ Test complete. Check console for onValue callback logs.');
        }, 1000);
      } catch (error: any) {
        console.error('❌ Error during test:', error);
      }
    },
    fixPermissionIssue: () => {
      console.log('🔧 Firebase Permission Issue Detected!');
      console.log('To fix this, update your Firebase Realtime Database rules to:');
      console.log(`
{
  "rules": {
    ".read": true,
    ".write": true,
    "listeners": {
      ".read": true,
      ".write": true
    }
  }
}
      `);
      console.log('WARNING: These rules allow anyone to read/write your database.');
      console.log('For production, you should restrict access appropriately.');
    },
    getRegisteredClientId: () => registeredClientId,
    isPermissionDenied: () => permissionsDenied,
    checkFirebaseStatus: () => {
      console.log('🔍 Checking Firebase initialization status:');
      console.log(`  App initialized: ${app ? '✅' : '❌'}`);
      console.log(`  Database initialized: ${database ? '✅' : '❌'}`);
      console.log(`  Listeners reference: ${listenersRef ? '✅' : '❌'}`);
      console.log(`  _firebaseInitialized flag: ${_firebaseInitialized ? '✅' : '❌'}`);
      console.log(`  Firebase config valid: ${isFirebaseConfigured() ? '✅' : '❌'}`);
      console.log(`  Permission denied: ${permissionsDenied ? '✅' : '❌'}`);
      console.log(`  Client registered: ${registeredClientId ? '✅' : '❌'}`);
      
      if (registeredClientId) {
        console.log(`  Client ID: ${registeredClientId}`);
      }
      
      // Check if we can access the database
      if (database && listenersRef) {
        console.log('🧪 Testing database access...');
        get(listenersRef).then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const count = Object.keys(data).length;
            console.log(`  Database access: ✅ (Found ${count} listeners)`);
            Object.entries(data).forEach(([id, val]: [string, any]) => {
              console.log(`    - ${id}: timestamp=${val.timestamp}, age=${Math.floor((Date.now() - val.timestamp) / 1000)}s`);
            });
          } else {
            console.log('  Database access: ✅ (No data found)');
          }
        }).catch(error => {
          console.log(`  Database access: ❌ (${error.message})`);
          if (error.toString().includes('permission_denied')) {
            console.error('⛔️ PERMISSION DENIED: Please update your Firebase rules');
          }
        });
      }
      
      return {
        app: !!app,
        database: !!database,
        listenersRef: !!listenersRef,
        initialized: _firebaseInitialized,
        configValid: isFirebaseConfigured(),
        permissionDenied: permissionsDenied,
        clientRegistered: !!registeredClientId,
        clientId: registeredClientId
      };
    }
  };
  
  console.log(
    '🔧 Firebase debug utils available in console:\n' +
    '- window.__firebaseDebug.clearAllListeners() - Resets all listeners and registers just this tab\n' +
    '- window.__firebaseDebug.logListeners() - Shows details of all current listeners\n' +
    '- window.__firebaseDebug.forceHeartbeat() - Forces a timestamp update for this tab\n' +
    '- window.__firebaseDebug.checkActiveCount() - Directly checks how many active listeners exist\n' + 
    '- window.__firebaseDebug.testListenerEvent() - Tests if Firebase events are working\n' +
    '- window.__firebaseDebug.checkFirebaseStatus() - Checks Firebase initialization status\n' +
    '- window.__firebaseDebug.fixPermissionIssue() - Shows how to fix permission errors'
  );
}

// In development mode, force cleanup ALL entries older than 2 minutes
async function forceCleanupAllStaleEntries() {
  if (!database || !listenersRef) return;
  
  cleanupPerformed = true;
  console.log('🧹 Development mode: Force cleaning ALL stale listener entries...');
  
  try {
    const snapshot = await get(listenersRef);
    if (!snapshot.exists()) return;
    
    const data = snapshot.val();
    const now = Date.now();
    const TWO_MINUTES = 2 * 60 * 1000;
    let removedCount = 0;
    
    // Check each listener record
    for (const [clientId, record] of Object.entries<any>(data)) {
      // More aggressive cleanup in development - remove entries older than 2 minutes
      if (!record.timestamp || (now - record.timestamp > TWO_MINUTES)) {
        const staleRef = ref(database, `listeners/${clientId}`);
        await remove(staleRef);
        removedCount++;
      }
    }
    
    console.log(`🧹 Development cleanup complete: Removed ${removedCount} entries`);
  } catch (error: any) {
    console.error('Error during forced cleanup:', error);
    if (error.toString().includes('permission_denied')) {
      console.error('⛔️ PERMISSION DENIED: Your Firebase rules are preventing delete access');
      console.error('Please update your Firebase Realtime Database rules to allow write access');
      permissionsDenied = true;
    }
  }
}

// Clean up stale listeners that didn't properly disconnect
async function cleanupStaleListeners(): Promise<void> {
  if (!database || !listenersRef) {
    console.error('Firebase not initialized');
    return;
  }

  console.log('🧹 Cleaning up stale listeners');
  try {
    const snapshot = await get(listenersRef);
    if (!snapshot.exists()) {
      console.log('No listeners to clean up');
      return;
    }

    const data = snapshot.val();
    const now = Date.now();
    let cleanupCount = 0;
    const updates: Record<string, null> = {};

    // Check each listener
    Object.entries<any>(data).forEach(([id, record]) => {
      const age = now - record.timestamp;
      if (age > MAX_LISTENER_AGE) {
        console.log(`🗑️ Removing stale listener ${id.substring(0, 8)}... (${Math.floor(age/1000)}s old)`);
        updates[id] = null;
        cleanupCount++;
      }
    });

    // Perform batch update if there are stale listeners
    if (cleanupCount > 0) {
      await update(listenersRef, updates);
      console.log(`🧹 Cleaned up ${cleanupCount} stale listeners`);
    } else {
      console.log('No stale listeners found');
    }
  } catch (error) {
    console.error('Error cleaning up stale listeners:', error);
  }
}

// Generate a unique ID for this client - include development tag for clarity
const generateClientId = () => {
  const envTag = process.env.NODE_ENV === 'development' ? 'dev-' : '';
  return `${envTag}client-${Math.random().toString(36).substring(2, 8)}-${Date.now()}`;
};

// Track this client as an active listener
export async function trackListener(): Promise<string | null> {
  if (!database || !listenersRef) {
    console.error('Firebase not initialized');
    return null;
  }

  // Prevent multiple tracking calls
  if (isTrackingInProgress) {
    console.log('Listener tracking already in progress');
    return registeredClientId;
  }
  
  isTrackingInProgress = true;
  
  try {
    // Generate client ID if needed
    if (!registeredClientId) {
      registeredClientId = generateClientId();
      console.log(`📱 New client ID: ${registeredClientId}`);
    }
    
    // Reference to this client's entry
    const clientRef = child(listenersRef, registeredClientId);
    
    // Initial registration
    const timestamp = Date.now();
    await set(clientRef, {
      timestamp,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      registered: timestamp
    });
    
    console.log(`👋 Registered as active listener: ${registeredClientId}`);
    
    // Clean up stale listeners on first registration
    await cleanupStaleListeners();
    
    // Set up heartbeat to keep our entry fresh
    let heartbeatCount = 0;
    let heartbeatInterval: NodeJS.Timeout | null = setInterval(async () => {
      try {
        // Skip heartbeat if permissions are denied
        if (permissionsDenied) {
          console.warn('⚠️ Heartbeat skipped due to permission issues');
          return;
        }
        
        heartbeatCount++;
        const timestamp = Date.now();
        await update(clientRef, { timestamp });
        console.log(`💓 Heartbeat sent (${heartbeatCount}): ${new Date(timestamp).toISOString()}`);
        
        // Every other heartbeat, check and clean up stale listeners
        if (heartbeatCount % 2 === 0) {
          await cleanupStaleListeners();
        }
      } catch (error: any) {
        console.error('Error sending heartbeat:', error);
        
        // Check if this is a permission issue
        if (error.toString().includes('permission_denied')) {
          permissionsDenied = true;
          console.error('⛔️ PERMISSION DENIED: Your Firebase rules are preventing write access');
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
        }
      }
    }, HEARTBEAT_INTERVAL);
    
    // Register window events to ensure clean disconnection
    if (typeof window !== 'undefined' && !eventsRegistered) {
      window.addEventListener('beforeunload', () => {
        try {
          // Sync removal of our client entry
          if (registeredClientId && database && listenersRef) {
            const clientRef = child(listenersRef, registeredClientId);
            set(clientRef, null);
            console.log('👋 Unregistered listener on page unload');
          }
        } catch (e) {
          // Ignore errors during unload
        }
      });
      
      eventsRegistered = true;
    }
    
    return registeredClientId;
  } catch (error) {
    console.error('Error tracking listener:', error);
    isTrackingInProgress = false;
    return null;
  }
}

/**
 * Get the current listener count and subscribe to updates
 * @param callback Function to call with the updated count
 * @returns Unsubscribe function
 */
export function getListenerCount(callback: (count: number) => void): () => void {
  if (!database || !listenersRef) {
    console.error('Firebase not initialized');
    callback(0);
    return () => {};
  }

  console.log('🎧 Setting up listener count subscription');
  
  // Subscribe to real-time updates
  const unsubscribe = onValue(listenersRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.log('No listeners found in database');
      callback(0);
      return;
    }

    const data = snapshot.val();
    console.log(`📊 Raw listener data:`, data);
    
    const now = Date.now();
    console.log(`⏰ Current timestamp: ${now}`);
    
    // First, log all entries we found
    const totalEntries = Object.keys(data).length;
    console.log(`📋 Total listener entries found: ${totalEntries}`);
    
    // Then, filter for active (non-stale) entries
    const activeEntries = Object.entries<any>(data).filter(([id, record]) => {
      const age = now - record.timestamp;
      const isActive = record.timestamp && (age < MAX_LISTENER_AGE);
      console.log(`🔍 Listener ${id.substring(0, 8)}... timestamp: ${record.timestamp}, age: ${Math.floor(age/1000)}s, active: ${isActive}`);
      return isActive;
    });
    
    // Count active listeners
    const activeListeners = activeEntries.length;
    console.log(`👥 Active listeners after filtering: ${activeListeners}`);
    
    // Skip any changes if we've detected permission issues
    if (permissionsDenied) {
      console.warn('⚠️ Permission issues detected - listener count may be inaccurate');
      callback(0);
      return;
    }
    
    // If we have our client ID and it's not in the list, we'll count as 1
    let finalCount = activeListeners;
    if (registeredClientId && activeListeners > 0) {
      const hasOurClient = activeEntries.some(([id]) => id === registeredClientId);
      if (!hasOurClient) {
        console.log('🔄 Adding ourselves to listener count since our entry is missing');
        finalCount = activeListeners + 1;
      }
    }
    
    // Pass the actual count to the callback
    callback(finalCount);
    
    // Trigger cleanup of stale entries if we find any
    if (totalEntries > activeListeners) {
      console.log(`Found ${totalEntries - activeListeners} stale entries, scheduling cleanup`);
      // Use setTimeout to avoid blocking the callback
      setTimeout(() => {
        cleanupStaleListeners().catch(err => {
          console.error('Error during automatic cleanup:', err);
        });
      }, 100);
    }
  }, (error) => {
    console.error('Error getting listener count:', error);
    if (error.toString().includes('permission_denied')) {
      console.error('⛔️ PERMISSION DENIED: Your Firebase rules are preventing read access to listeners');
      console.error('Please update your Firebase Realtime Database rules to allow read access');
      permissionsDenied = true;
    }
    callback(0);
  });

  // Return unsubscribe function
  return unsubscribe;
}

export default app; 