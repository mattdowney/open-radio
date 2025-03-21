# Setting Up Firebase for Real-Time Listener Count

The MD Radio application uses Firebase Realtime Database to track how many people are currently listening to the radio. This creates a fun, social experience where users can see others are enjoying the music with them.

## Setup Instructions

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup steps
   - Give your project a name (e.g., "md-radio")

2. **Enable Realtime Database**:
   - In your Firebase project, go to "Build" → "Realtime Database"
   - Click "Create Database"
   - Start in "test mode" for development (we'll secure it later)
   - Choose a location close to your target audience

3. **Get Your Firebase Config**:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Select the Web app icon (</>) 
   - Register your app with a nickname (e.g., "md-radio-web")
   - Copy the firebaseConfig object values

4. **Update Environment Variables**:
   - Create a `.env.local` file at the root of the project
   - Use the `.env.local.example` file as a template
   - Fill in all the Firebase configuration values from your Firebase console

## Security Rules

For production, update your Realtime Database security rules to:

```json
{
  "rules": {
    "listeners": {
      ".read": true,
      ".write": false,
      "$client_id": {
        ".write": "$client_id === auth.uid || !data.exists()",
        ".read": true
      }
    },
    "totalListeners": {
      ".read": true,
      ".write": true  // In production, restrict this more
    }
  }
}
```

## How It Works

1. When a user loads the radio app, they're assigned a unique client ID
2. Their presence is recorded in the `/listeners/{clientId}` path
3. Firebase's `onDisconnect` method automatically removes their record when they leave
4. The app subscribes to changes at the `/listeners` path to get real-time count updates
5. The counter badge updates in real-time as people join and leave

This creates a seamless, real-time experience with minimal server overhead. 