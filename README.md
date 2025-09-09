# Open Radio 🎵

> **Note**: This project is currently transitioning to open source.
> Comprehensive documentation and setup guides are coming soon!

A beautiful radio application built with Next.js, React, and TypeScript.

## Current Status
- ✅ Core functionality complete
- 🚧 Open source preparation in progress
- 📚 Documentation being enhanced
- 🎯 Community features planned

## Features

- 🎵 Seamless music streaming using YouTube as a source
- 🎨 Beautiful blurred album art backgrounds with dynamic color extraction
- 👥 Real-time listener count showing how many people are tuned in
- 💿 Gorgeous vinyl record visualization with realistic animations
- 📱 Responsive design that works on all devices
- ⚡ Fast, modern Next.js 14 architecture with TypeScript

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd open-radio

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

## Configuration

The app is highly configurable through environment variables:

```bash
# App Identity
NEXT_PUBLIC_APP_NAME=Open Radio
NEXT_PUBLIC_APP_DESCRIPTION=A beautiful radio experience

# YouTube Integration
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key
NEXT_PUBLIC_DEFAULT_PLAYLIST_ID=your_playlist_id

# Optional Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_FIREBASE=true

# Custom Branding
NEXT_PUBLIC_LOGO_URL=/assets/logo.svg
NEXT_PUBLIC_BRANDING_LINK_URL=https://your-site.com
```

See `.env.local.example` for all available options.

## Firebase Setup for Real-Time Features

The real-time listener count requires Firebase Realtime Database.

For complete setup instructions, see [Firebase Setup Guide](./docs/FIREBASE_SETUP.md).

## Tech Stack

- **Next.js 14.1.3** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **YouTube API** for music streaming
- **Firebase Realtime Database** for live features
- **Framer Motion** for smooth animations
- **WebGL Shaders** for visual effects

## License

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
