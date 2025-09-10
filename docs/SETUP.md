# Setup Guide

This guide will walk you through setting up Open Radio for development and production.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 22.0.0 or higher
- **npm** (comes with Node.js)
- **Git** for version control

## Development Setup

### 1. Clone the Repository

```bash
# Fork the repository on GitHub first, then clone your fork
git clone https://github.com/YOUR_USERNAME/open-radio.git
cd open-radio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure the following variables:

#### Required Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API v3 key | See [YouTube API Setup](#youtube-api-setup) below |

#### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_APP_NAME` | "Open Radio" | Your radio station name |
| `NEXT_PUBLIC_APP_DESCRIPTION` | "A beautiful radio experience" | Station description |
| `NEXT_PUBLIC_PLAYLIST_ID` | Demo playlist | Default YouTube playlist ID |
| `NEXT_PUBLIC_BRANDING_ENABLED` | `true` | Show/hide custom branding |
| `NEXT_PUBLIC_FIREBASE_ENABLED` | `false` | Enable Firebase features |

For Firebase configuration (optional), see [Firebase Setup](#firebase-setup) below.

### 4. Start Development Server

```bash
npm run dev
```

Your radio will be available at [http://localhost:3000](http://localhost:3000).

## API Key Setup

### YouTube API Setup

The YouTube API key is required for music streaming functionality.

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Note your project ID

2. **Enable YouTube Data API v3**
   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Configure API Key (Optional but Recommended)**
   - Click on your API key to configure it
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Under "Application restrictions", you can restrict by HTTP referrers for production

5. **Add to Environment**
   ```bash
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
   ```

### Firebase Setup (Optional)

Firebase provides real-time listener count and analytics features.

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Add Web App**
   - In your Firebase project, click "Add app" > "Web"
   - Register your app with a nickname
   - Copy the Firebase configuration object

3. **Enable Realtime Database**
   - In Firebase Console, go to "Build" > "Realtime Database"
   - Click "Create Database"
   - Choose your security rules (start in test mode for development)

4. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_FIREBASE_ENABLED=true
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

For detailed Firebase setup, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## Production Deployment

### Environment Variables for Production

When deploying to production, ensure all environment variables are properly set:

```bash
# Required
NEXT_PUBLIC_YOUTUBE_API_KEY=your_production_key

# Optional but recommended
NEXT_PUBLIC_APP_NAME="Your Radio Name"
NEXT_PUBLIC_APP_DESCRIPTION="Your radio description"
NEXT_PUBLIC_PLAYLIST_ID=your_playlist_id

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_ENABLED=true
# ... other Firebase variables
```

### Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

For platform-specific deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Common Issues

### YouTube API Issues

**"API key not valid"**
- Ensure your API key is correctly set in `.env.local`
- Verify the YouTube Data API v3 is enabled in Google Cloud Console
- Check if your API key has proper restrictions configured

**"Quota exceeded"**
- YouTube API has daily quotas
- Check your usage in Google Cloud Console
- Consider implementing caching or request throttling

**"Video unavailable"**
- Some videos may be restricted in certain regions
- Private or deleted videos won't play
- Use playlist validation to filter out unavailable tracks

### Firebase Issues

**"Permission denied"**
- Check your Firebase Realtime Database security rules
- Ensure your domain is whitelisted if using domain restrictions

**"Firebase not connecting"**
- Verify all Firebase environment variables are set correctly
- Check that `NEXT_PUBLIC_FIREBASE_ENABLED=true`
- Ensure your Firebase project is active

### Build Issues

**"Module not found"**
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `package-lock.json`, then run `npm install`

**"TypeScript errors"**
- Run `npm run lint` to check for linting issues
- Ensure you're using Node.js 22+ as required in `package.json`

### Performance Issues

**Slow loading**
- Ensure you're using the latest YouTube API responses
- Consider implementing track preloading
- Check network connectivity for API calls

For more troubleshooting help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Next Steps

Once you have Open Radio running:

1. **Customize your station** - Update app name, description, and default playlist
2. **Add your content** - Create YouTube playlists for your radio content
3. **Enable Firebase** - Add real-time features and listener analytics
4. **Deploy to production** - See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment options

## Getting Help

- **Documentation**: Check other files in the `docs/` directory
- **Issues**: [Report bugs or request features](https://github.com/your-username/open-radio/issues)
- **Discussions**: [Community Q&A and ideas](https://github.com/your-username/open-radio/discussions)
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md) to get involved