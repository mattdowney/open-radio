# Configuration Guide

Open Radio supports two ways to configure your radio station: a user-friendly `config.json` file or traditional environment variables.

## Quick Setup (Recommended)

The easiest way to customize your radio is using the `config.json` file for branding/UI settings and `.env.local` for credentials:

1. Edit `config.json` with your branding settings:
   ```json
   {
     "app": {
       "name": "My Awesome Radio",
       "description": "The best indie rock station",
       "url": "https://myradio.com"
     },
     "branding": {
       "enabled": true,
       "logoUrl": "/assets/my-logo.svg",
       "linkUrl": "https://mywebsite.com"
     },
     "features": {
       "analytics": false,
       "firebase": true
     }
   }
   ```

2. Generate base environment variables from config:
   ```bash
   npm run config:generate-env >> .env.local
   ```

3. Add your API keys and credentials to `.env.local`:
   ```bash
   # Add these manually to .env.local
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
   NEXT_PUBLIC_PLAYLIST_ID=your_playlist_id
   
   # If using Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase credentials
   ```

4. Start your radio:
   ```bash
   npm run dev
   ```

## Configuration Options

### App Settings
- **name**: Your radio station name (appears in browser title and social shares)
- **description**: Brief description of your station
- **url**: Your website URL for SEO and social sharing

### Branding
- **enabled**: Show/hide the logo in the top-left corner
- **logoUrl**: Path to your logo image
- **linkUrl**: URL to redirect when logo is clicked

### Features
- **analytics**: Enable Vercel Analytics tracking
- **firebase**: Enable real-time listener count (requires Firebase setup)

### Social Media
- **ogImageUrl**: Image for Facebook/LinkedIn previews
- **twitterImageUrl**: Image for Twitter card previews

### API Keys & Credentials
All sensitive credentials should be added to `.env.local` only:

**YouTube Integration** (required):
- `NEXT_PUBLIC_YOUTUBE_API_KEY`: Your YouTube Data API key
- `NEXT_PUBLIC_PLAYLIST_ID`: Default playlist to stream from

**Firebase** (optional - only needed for real-time listener count):
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`: Firebase Realtime Database URL

## Advanced: Environment Variables Only

If you prefer to skip `config.json` and use only environment variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="My Radio Station"
NEXT_PUBLIC_APP_DESCRIPTION="The best music experience"
NEXT_PUBLIC_APP_URL="https://myradio.com"

# Features
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_FIREBASE_ENABLED=true

# Branding
NEXT_PUBLIC_BRANDING_ENABLED=true
NEXT_PUBLIC_BRANDING_LOGO_URL="/assets/logo.svg"
NEXT_PUBLIC_BRANDING_LINK_URL="https://mywebsite.com"

# Social Media
NEXT_PUBLIC_OG_IMAGE_URL="/assets/social-preview.jpg"
NEXT_PUBLIC_TWITTER_IMAGE_URL="/assets/twitter-card.jpg"

# API Keys (always required in .env.local)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_PLAYLIST_ID=your_playlist_id
```

> **Note**: Environment variables always take precedence over config.json settings.

## Examples

### Personal Radio Station
```json
{
  "app": {
    "name": "Jake's Indie Corner",
    "description": "Discover the best indie music",
    "url": "https://jakeradio.com"
  },
  "branding": {
    "enabled": true,
    "logoUrl": "/logo-jake.png",
    "linkUrl": "https://jakesmithmusic.com"
  },
  "features": {
    "analytics": true,
    "firebase": true
  }
}
```

### Company Radio
```json
{
  "app": {
    "name": "Acme Corp Radio",
    "description": "Background music for productivity",
    "url": "https://radio.acmecorp.com"
  },
  "branding": {
    "enabled": true,
    "logoUrl": "/assets/company-logo.svg",
    "linkUrl": "https://acmecorp.com"
  },
  "features": {
    "analytics": false,
    "firebase": false
  }
}
```

### Minimal Setup (No Firebase)
```json
{
  "app": {
    "name": "Simple Radio",
    "description": "Just good music",
    "url": "https://simpleradio.dev"
  },
  "branding": {
    "enabled": false
  },
  "features": {
    "analytics": false,
    "firebase": false
  }
}
```

## Troubleshooting

### Config Not Loading
- Make sure `config.json` is in the root directory (same level as `package.json`)
- Check that the JSON syntax is valid using a JSON validator
- Restart your development server after making changes

### Images Not Showing
- Ensure image paths are correct relative to the `public/` directory
- For custom images, place them in `public/assets/` and reference as `/assets/image.png`

### Firebase Not Working
- Verify all Firebase configuration values are correct
- Check Firebase console for proper database rules
- Ensure Firebase features are enabled in your project

## Migration from Environment Variables

If you're currently using `.env.local`, you can easily migrate:

1. Create `config.json` from your current environment variables
2. Test that everything works the same
3. Optionally remove environment variables (config.json will take over)
4. Environment variables will still work as overrides if needed