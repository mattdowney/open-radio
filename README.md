# Open Radio

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.32-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

A modern radio application that brings the classic radio experience to the web with vinyl record visualizations, real-time listener counts, and seamless music streaming.

## Live Demo

**[Try Open Radio Live](https://radio.mattdowney.com)** - Experience the radio app in action.

Fork it, customize it, make it your own!

## Features

- **Seamless Music Streaming** - YouTube integration for unlimited music access
- **Multiple Visualizers** - Choose between vinyl records and CD visualizations  
- **Dynamic Theme System** - Switch between dark, light, and custom themes
- **Real-time Listener Count** - See how many people are tuning in live
- **Dynamic Album Backgrounds** - Blurred album art backgrounds with color extraction
- **Light Ray Effects** - Beautiful animated background effects
- **Fully Responsive** - Perfect experience on desktop, tablet, and mobile
- **Accessibility Features** - Built-in accessibility indicators and support
- **Highly Configurable** - Customize everything via config.json and environment variables
- **Firebase Integration** - Optional real-time features and analytics
- **Custom Branding** - Make it your own with custom logos and themes

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mattdowney/open-radio.git
cd open-radio

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your YouTube API key

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your radio in action!

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS
- **State Management**: React Context with useReducer
- **Music Source**: [YouTube API](https://developers.google.com/youtube/v3)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/products/realtime-database) (optional)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) (optional)
- **Animations**: CSS animations + transitions

## Prerequisites

- **Node.js** 22.0.0 or higher
- **npm** or **yarn**
- **YouTube API Key** (required)
- **Firebase Project** (optional, for real-time features)

## Installation & Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-username/open-radio.git
cd open-radio
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

### 3. Required API Keys

**YouTube API Key** (Required):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to `.env.local` as `NEXT_PUBLIC_YOUTUBE_API_KEY`

**Firebase Setup** (Optional):

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Add a web app to get configuration
3. Add Firebase config to `.env.local`
4. Set `NEXT_PUBLIC_FIREBASE_ENABLED=true`

### 4. Start Development

```bash
npm run dev
```

Your radio will be running at [http://localhost:3000](http://localhost:3000)!

## Configuration

You can customize the app through:

- **Environment variables** - Copy `.env.local.example` to `.env.local` and configure
- **config.json** - App name, branding, theme colors, and feature toggles

## Environment Variables

### Required
| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | Your YouTube Data API v3 key |

### Optional App Configuration  
| Variable | Description | Default |
| -------- | ----------- | ------- |
| `NEXT_PUBLIC_APP_NAME` | App title | "Open Radio" |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Meta description | "A beautiful radio experience" |
| `NEXT_PUBLIC_APP_URL` | Your domain | - |
| `NEXT_PUBLIC_PLAYLIST_ID` | Default YouTube playlist | Demo playlist |

### Optional Features
| Variable | Description | Default |
| -------- | ----------- | ------- |
| `NEXT_PUBLIC_FIREBASE_ENABLED` | Enable real-time listener count | `false` |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Enable Vercel Analytics | `false` |
| `NEXT_PUBLIC_BRANDING_ENABLED` | Show custom branding | `true` |

### Firebase (only if enabled)
| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime Database URL |

See [.env.local.example](./.env.local.example) for all available options.

## Contributing

Found a bug or want to add a feature? 

1. Fork the repository
2. Make your changes  
3. Submit a pull request

That's it! No complex rules or processes.

## Deployment

Deploy to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or any Node.js host. 

**Important:** Add your environment variables (YouTube API key, Firebase config, etc.) in your hosting platform's dashboard.

## License

MIT - Fork it, use it, modify it however you want. See [LICENSE](LICENSE) for details.
