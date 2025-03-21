# Deploying Firebase to Production

Follow these steps to transition your Firebase Realtime Database from test mode to production with secure rules.

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

## Step 3: Initialize Firebase in your project

```bash
firebase init
```

Select the following options:
- Select "Realtime Database" when prompted for features
- Choose your existing project (md-radio-558c8)
- Accept the default file for database rules (database.rules.json)

## Step 4: Update Security Rules

Copy the contents of `firebase-rules.json` into `database.rules.json` that was created by the initialization process.

These rules ensure:
- Anyone can read the listener count
- New listeners can be added
- Only the client that created a listener entry can modify it
- Validates timestamp values to prevent abuse
- Prevents abuse by limiting writes

## Step 5: Deploy Rules to Firebase

```bash
firebase deploy --only database
```

## Step 6: Update Database Rules in Firebase Console (Alternative Method)

If you prefer using the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Realtime Database" in the left menu
4. Click on the "Rules" tab
5. Replace the rules with the contents of `firebase-rules.json`
6. Click "Publish"

## Step 7: Verify Production Mode

1. In Firebase Console, go to Realtime Database
2. Check the top banner - it should no longer say "Database has insecure rules"
3. Test your application to confirm the listener count works correctly
4. Open multiple tabs/browsers to verify the count increases appropriately
5. Close tabs to verify the count decreases correctly

## How the Improved Listener Count Works

The listener count implementation has been enhanced to solve common problems with tracking real-time user presence:

1. **Stale Entry Prevention**:
   - Each listener entry includes a timestamp that's updated periodically
   - The system automatically cleans up stale entries on app initialization
   - Only active entries with recent timestamps are counted
   - A 15-minute timeout removes entries that didn't disconnect properly

2. **Duplicate Prevention**:
   - Module-level variable tracks registration status across re-renders
   - Component-level ref prevents duplicate registrations during React lifecycle
   - Locking mechanism prevents concurrent registration attempts

3. **Heartbeat System**:
   - A periodic "heartbeat" updates each client's timestamp
   - This ensures clients are truly active even if they don't properly disconnect
   - Clean disconnection handling with onDisconnect removes entries properly

4. **Error Handling**:
   - Comprehensive error handling for Firebase operations
   - Fallback to simulated values if Firebase isn't available
   - Logging for tracking and debugging registration issues

## Security Considerations

- The current rules allow anyone to read the listener count, which is appropriate for a public radio app
- Client identification is based on unique IDs generated per session
- Write permissions are restricted to prevent abuse
- Timestamp validation ensures entries are valid and recent
- Stale entry cleanup prevents database from growing unnecessarily

## Monitoring

Monitor your Firebase usage through the Firebase Console to:
- Track the number of connections
- Monitor database usage
- Set up alerts for any unusual activity

You can also set up Firebase Analytics for more detailed insights on user behavior.

## Troubleshooting

If you notice discrepancies between the displayed count and what's in Firebase:

1. Check the Realtime Database in Firebase Console to verify the data structure
2. Look for any stale entries (entries with old timestamps)
3. Verify that onDisconnect handlers are working by closing browser tabs
4. Check the browser console for any errors or warnings related to Firebase
5. Ensure your security rules allow proper reading and writing of listener data 