# Open Radio 🎵

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.32-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

A beautiful, modern radio application that brings the classic radio experience to the web with stunning vinyl record visualizations, real-time listener counts, and seamless music streaming.

> **🚀 Now Open Source!** Open Radio has been transformed from a personal project into a community-driven open source application. We welcome contributors of all skill levels!

## ✨ Features

- 🎵 **Seamless Music Streaming** - YouTube integration for unlimited music access
- 💿 **Beautiful Vinyl Visualization** - Realistic spinning vinyl records with album art
- 👥 **Real-time Listener Count** - See how many people are tuning in live
- 🎨 **Dynamic Album Backgrounds** - Blurred album art backgrounds with color extraction
- 📱 **Fully Responsive** - Perfect experience on desktop, tablet, and mobile
- ⚙️ **Highly Configurable** - Customize everything via environment variables
- 🔥 **Firebase Integration** - Optional real-time features and analytics
- 🎭 **Custom Branding** - Make it your own with custom logos and themes

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/open-radio.git
cd open-radio

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your radio in action!

## 📸 Screenshots

> **Note**: Screenshots coming soon! The app features beautiful vinyl record animations, dynamic backgrounds, and a clean, modern interface.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Music Source**: [YouTube API](https://developers.google.com/youtube/v3)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/products/realtime-database) (optional)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) (optional)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📋 Prerequisites

- **Node.js** 22.0.0 or higher
- **npm** or **yarn**
- **YouTube API Key** (required)
- **Firebase Project** (optional, for real-time features)

## 🔧 Installation & Setup

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

See [docs/SETUP.md](./docs/SETUP.md) for detailed setup instructions.

### 4. Start Development

```bash
npm run dev
```

Your radio will be running at [http://localhost:3000](http://localhost:3000)!

## ⚙️ Configuration

Open Radio is highly configurable through environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_NAME` | Your radio station name | "Open Radio" | No |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Station description | "A beautiful radio experience" | No |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | YouTube API key for music | - | **Yes** |
| `NEXT_PUBLIC_PLAYLIST_ID` | Default YouTube playlist | Demo playlist | No |
| `NEXT_PUBLIC_FIREBASE_ENABLED` | Enable Firebase features | `false` | No |
| `NEXT_PUBLIC_BRANDING_ENABLED` | Show custom branding | `true` | No |

See [.env.local.example](./.env.local.example) for all available options.

## 🏗️ Architecture

Open Radio follows a clean, modular architecture:

```
app/
├── components/
│   ├── player/          # Music player components
│   ├── visualization/   # Vinyl record & album art
│   ├── media/          # Track info & metadata
│   ├── layout/         # App layout components
│   └── ui/             # Reusable UI components
├── contexts/           # React context for state management
├── services/          # External API services
└── lib/              # Utility functions

config/               # Configuration management
docs/                # Documentation
```

For detailed architecture information, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns  
- Run `npm run lint` before committing
- Use conventional commit messages

## 📚 Documentation

- [**Setup Guide**](./docs/SETUP.md) - Detailed setup instructions
- [**Architecture**](./docs/ARCHITECTURE.md) - Technical architecture overview
- [**Contributing**](./CONTRIBUTING.md) - How to contribute to the project
- [**Troubleshooting**](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [**Firebase Setup**](./docs/FIREBASE_SETUP.md) - Firebase integration guide
- [**Deployment**](./docs/DEPLOYMENT.md) - Deployment instructions

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Whether you're fixing bugs, adding features, improving documentation, or sharing ideas, your contributions are valued.

**Quick Contribution Guide:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 🐛 Bug Reports & Feature Requests

- **Bug Reports**: [Create an issue](https://github.com/your-username/open-radio/issues/new?template=bug_report.md)
- **Feature Requests**: [Request a feature](https://github.com/your-username/open-radio/issues/new?template=feature_request.md)
- **Questions**: [Start a discussion](https://github.com/your-username/open-radio/discussions)

## 🚀 Deployment

Open Radio can be deployed on various platforms:

- **Vercel** (Recommended) - One-click deployment
- **Netlify** - Static site deployment
- **Docker** - Containerized deployment
- **Self-hosted** - On your own server

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for platform-specific instructions.

## 📈 Roadmap

- [ ] **v1.0**: Stable release with comprehensive documentation
- [ ] **v1.1**: Plugin system for custom music sources
- [ ] **v1.2**: Advanced theming and customization
- [ ] **v1.3**: Multi-room/multi-station support
- [ ] **v2.0**: Social features and user accounts

See [GitHub Projects](https://github.com/your-username/open-radio/projects) for detailed roadmap.

## 🙏 Acknowledgments

- **YouTube API** for music streaming capabilities
- **Firebase** for real-time features
- **Next.js team** for the amazing framework
- **All contributors** who help make Open Radio better

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Support

If you find Open Radio useful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or requesting features
- 🤝 Contributing code or documentation  
- 💬 Sharing with others who might find it useful

---