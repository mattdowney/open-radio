# Troubleshooting the Listener Count Feature

If you're experiencing issues with the real-time listener count, this guide will help you identify and resolve common problems.

## Listener Count Shows "Connecting..." Forever

If the listener count badge is stuck in the "Connecting..." state:

1. Check your browser console for any errors related to Firebase
2. Verify that your Firebase configuration in `.env.local` is correct
3. Make sure your Firebase Realtime Database is properly set up
4. Refresh the page - a safety timeout should show the count after 3 seconds

## Firebase Shows More Listeners Than Expected

In development mode, you should only see 1 listener (yourself). If you see more:

### Quick Fix: Clear All Listeners

Open your browser console and run:

```javascript
window.__firebaseDebug.clearAllListeners()
```

This will:
1. Delete all listener entries from Firebase
2. Re-register your current session
3. Reset the counter to 1

### View Current Listeners

To see details about all current listeners in the database:

```javascript
window.__firebaseDebug.logListeners()
```

This shows a table with:
- Each listener's ID
- When it was last active
- How long ago it was last updated
- Which environment it's from (development/production)

## Stale Entries Not Cleaning Up

The system should automatically clean up stale entries, but if it's not working:

1. Make sure your Firebase database rules allow writes/deletes (see firebase-rules.json)
2. If you're testing disconnections, close the browser completely (not just refresh)
3. Give the onDisconnect handlers time to execute
4. In development, entries older than 2 minutes should be automatically removed

## Manual Database Cleanup

You can manually clean up the database from the Firebase Console:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Realtime Database"
4. Navigate to the `listeners` node
5. Click the three dots menu and select "Delete"

After manual cleanup, refresh your app to register a new listener entry.

## Production vs Development

Different rules apply to development and production environments:

- **Development**: 
  - Aggressive cleanup (2 minute force cleanup)
  - Debug utilities available in console
  - Warning when more than 1 listener is detected
  - Client IDs prefixed with "dev-"

- **Production**:
  - Standard cleanup (15 minute timeout)
  - No debug utilities
  - Client IDs without environment prefix

## Firebase Security Rules

If you're having permission issues, check your Firebase security rules:

1. Go to Firebase Console > Realtime Database > Rules
2. Make sure they match the ones in `firebase-rules.json`
3. Especially verify that your rules allow:
   - Reading the `/listeners` node
   - Creating new listeners
   - Updating your own listener record
   - Deleting your own listener record 