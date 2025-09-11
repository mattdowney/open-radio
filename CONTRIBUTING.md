# Contributing to Open Radio 🎵

We're thrilled that you're interested in contributing to Open Radio! This document provides guidelines and information to help you contribute effectively to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Community Resources](#community-resources)

## 📜 Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you're expected to uphold these standards. Please report unacceptable behavior to the project maintainers.

## 🚀 Getting Started

### Ways to Contribute

- **🐛 Report bugs** - Help us identify and fix issues
- **✨ Request features** - Suggest new features or improvements
- **💻 Write code** - Fix bugs, implement features, or improve performance
- **📚 Improve documentation** - Help others understand and use Open Radio
- **🎨 Design improvements** - Enhance UI/UX and visual design
- **🧪 Write tests** - Improve code coverage and reliability
- **💬 Help others** - Answer questions and help users in discussions

### First Time Contributors

New to open source? We welcome you! Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - We'd love your help on these
- `documentation` - Great way to start contributing

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 22.0.0 or higher
- **npm** (comes with Node.js)
- **Git** for version control
- A **YouTube API Key** for testing

### Quick Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/open-radio.git
   cd open-radio
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp .env.local.example .env.local
   
   # Edit .env.local and add your API keys
   # At minimum, you need NEXT_PUBLIC_YOUTUBE_API_KEY
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Setup**
   - Open [http://localhost:3000](http://localhost:3000)
   - You should see the radio interface
   - Music should play when you click play

### Getting API Keys

**YouTube API Key** (Required for development):
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Add key to `.env.local` as `NEXT_PUBLIC_YOUTUBE_API_KEY`

For detailed setup instructions, see [docs/SETUP.md](./docs/SETUP.md).

## 🤝 How to Contribute

### 1. Choose What to Work On

- Browse [open issues](https://github.com/your-username/open-radio/issues)
- Check the [project roadmap](https://github.com/your-username/open-radio/projects)
- Look for `good first issue` or `help wanted` labels
- Have your own idea? [Create an issue](https://github.com/your-username/open-radio/issues/new) to discuss it first

### 2. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Make Your Changes

- Write clean, readable code
- Follow our [code style guidelines](#code-style-guidelines)
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run linting
npm run lint

# Build the project to check for errors
npm run build

# Test manually in the browser
npm run dev
```

### 5. Commit Your Changes

Use [conventional commit messages](https://www.conventionalcommits.org/):

```bash
# Examples of good commit messages
git commit -m "feat: add volume control keyboard shortcuts"
git commit -m "fix: resolve album art loading issue"
git commit -m "docs: update installation instructions"
git commit -m "style: improve mobile responsive layout"
```

### 6. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm run lint`, `npm run build`)
- [ ] Documentation updated (if applicable)
- [ ] Self-review completed
- [ ] Screenshots included (for UI changes)
- [ ] Issue linked (if applicable)

### PR Template

Our pull request template will guide you through providing:
- **Description** of changes made
- **Type of change** (bug fix, feature, etc.)
- **Testing** information
- **Checklist** to ensure completeness

### Review Process

1. **Automated Checks** - CI/CD pipeline runs automatically
2. **Maintainer Review** - Core maintainers review code and design
3. **Community Feedback** - Other contributors may provide input
4. **Revisions** - Address feedback and make requested changes
5. **Merge** - Once approved, your PR will be merged

## 🎨 Code Style Guidelines

### TypeScript

- **Always use TypeScript** for new files
- **Strict typing** - avoid `any` types
- **Interface definitions** for component props and API responses
- **Type guards** for external data validation

### React Components

- **Functional components** with hooks
- **PascalCase** for component names
- **camelCase** for props and variables
- **Meaningful component names** that describe purpose

### File Structure

```
app/components/
├── player/          # Player-related components
├── visualization/   # Visual components (vinyl, album art)
├── media/          # Media information display
├── layout/         # Layout and structure
└── ui/             # Reusable UI components
```

### Naming Conventions

- **Components**: `PascalCase` (e.g., `VinylRecord.tsx`)
- **Hooks**: `camelCase` starting with `use` (e.g., `usePlayerState`)
- **Utilities**: `camelCase` (e.g., `formatDuration`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_VOLUME`)

### Code Organization

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports
import { motion } from 'framer-motion';

// 3. Local imports
import { usePlayerContext } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/Button';

// 4. Types
interface ComponentProps {
  title: string;
  onPlay: () => void;
}

// 5. Component
export function Component({ title, onPlay }: ComponentProps) {
  // Component implementation
}
```

## 🧪 Testing Guidelines

### Current Testing Status

- ⚠️ **Testing framework not yet set up**
- We welcome contributions to establish testing infrastructure
- Manual testing is currently required

### Manual Testing Checklist

For any changes, please test:

- [ ] **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- [ ] **Mobile responsiveness** (various screen sizes)
- [ ] **Core functionality** (play, pause, volume, track changes)
- [ ] **Error scenarios** (network issues, invalid API keys)
- [ ] **Performance** (smooth animations, no memory leaks)

### Future Testing Goals

- **Unit tests** for utility functions
- **Component tests** for React components
- **Integration tests** for API services
- **E2E tests** for critical user flows

Want to help set up testing? [Create an issue](https://github.com/your-username/open-radio/issues/new) and we'll guide you!

## 📝 Issue Guidelines

### Reporting Bugs

Use our [Bug Report Template](https://github.com/your-username/open-radio/issues/new?template=bug_report.md) and include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (browser, OS, Node version)
- **Screenshots** (if applicable)
- **Console errors** (if any)

### Requesting Features

Use our [Feature Request Template](https://github.com/your-username/open-radio/issues/new?template=feature_request.md) and include:

- **Problem description** - What problem does this solve?
- **Proposed solution** - How should it work?
- **Alternative solutions** - Other ways to solve this
- **Use cases** - How would you use this feature?

### Issue Labels

- `bug` - Something isn't working
- `feature` - New feature or enhancement
- `documentation` - Documentation improvements
- `good first issue` - Perfect for newcomers
- `help wanted` - We'd love community help
- `question` - Further information requested

## 🌟 Community Resources

### Communication

- **GitHub Discussions** - [Community Q&A and ideas](https://github.com/your-username/open-radio/discussions)
- **Issues** - [Bug reports and feature requests](https://github.com/your-username/open-radio/issues)
- **Pull Requests** - [Code contributions](https://github.com/your-username/open-radio/pulls)

### Documentation

- [**Setup Guide**](./docs/SETUP.md) - Detailed development setup
- [**Architecture**](./docs/ARCHITECTURE.md) - Technical architecture overview
- [**Troubleshooting**](./docs/TROUBLESHOOTING.md) - Common issues and solutions

### Getting Help

- **New to the project?** Start with [docs/SETUP.md](./docs/SETUP.md)
- **Stuck on something?** [Ask in Discussions](https://github.com/your-username/open-radio/discussions)
- **Found a bug?** [Report it](https://github.com/your-username/open-radio/issues/new?template=bug_report.md)
- **Have an idea?** [Share it](https://github.com/your-username/open-radio/issues/new?template=feature_request.md)

## 🎯 Contribution Recognition

We value all contributions! Contributors are recognized through:

- **Contributors list** in README.md
- **GitHub contributor graph**
- **Release notes** mentioning significant contributions
- **Maintainer status** for ongoing contributors

## 📞 Questions?

Don't hesitate to reach out if you have questions:

- **General questions**: [GitHub Discussions](https://github.com/your-username/open-radio/discussions)
- **Bug reports**: [Issues](https://github.com/your-username/open-radio/issues)
- **Feature ideas**: [Feature Requests](https://github.com/your-username/open-radio/issues/new?template=feature_request.md)

---

**Thank you for contributing to Open Radio! 🎵**

Your contributions help make the web more musical, one radio station at a time.