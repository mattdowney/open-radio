# Phase 3: Code Quality & Testing ⚡

## Objective
Establish code quality standards, testing infrastructure, and automated workflows to ensure the project maintains high standards and is ready for community contributions. This phase builds the foundation for reliable, maintainable code.

**Timeline:** 2-3 days  
**Priority:** HIGH (essential for community contributions)  
**Dependencies:** Phase 1 (clean codebase), Phase 2 (documentation structure)

## Tasks

### 1. Set Up Linting & Formatting
**Time Estimate:** 1 hour

#### ESLint Configuration:
- [ ] Install and configure ESLint with Next.js best practices
- [ ] Add TypeScript-specific rules
- [ ] Configure React and React Hooks rules
- [ ] Add accessibility linting (eslint-plugin-jsx-a11y)

#### Prettier Configuration:
- [ ] Install Prettier for consistent code formatting
- [ ] Create `.prettierrc` with project standards
- [ ] Add `.prettierignore` for generated files
- [ ] Configure ESLint to work with Prettier

#### Package Installation:
```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-next \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier
```

#### Configuration Files:

**.eslintrc.json:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "prefer-const": "error"
  }
}
```

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### Package.json Scripts:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

### 2. Add Testing Infrastructure
**Time Estimate:** 2-3 hours

#### Test Framework Setup:
- [ ] Install Jest and React Testing Library
- [ ] Configure Jest for Next.js
- [ ] Set up test utilities and custom matchers
- [ ] Create test setup files

#### Package Installation:
```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest
```

#### Configuration Files:

**jest.config.js:**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**jest.setup.js:**
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'))

// Mock environment variables
process.env.NEXT_PUBLIC_YOUTUBE_API_KEY = 'test-key'
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key'
```

#### Test Scripts:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### 3. Create Core Test Suite
**Time Estimate:** 4-5 hours

#### Priority Test Coverage:
- [ ] **Context Providers** (PlayerContext, QueueContext, UIContext)
- [ ] **Core Components** (RadioPlayer, PlayerControls, VolumeControl)
- [ ] **Utility Functions** (YouTube service, color extraction)
- [ ] **Error Boundaries**
- [ ] **Key Hooks**

#### Test Structure:
```
__tests__/
├── components/
│   ├── player/
│   │   ├── RadioPlayer.test.tsx
│   │   ├── PlayerControls.test.tsx
│   │   └── VolumeControl.test.tsx
│   ├── visualization/
│   │   ├── VinylRecord.test.tsx
│   │   └── AlbumCover.test.tsx
│   └── ui/
│       ├── ErrorBoundary.test.tsx
│       └── Loading.test.tsx
├── contexts/
│   ├── PlayerContext.test.tsx
│   ├── QueueContext.test.tsx
│   └── UIContext.test.tsx
├── services/
│   └── youtubeService.test.ts
├── utils/
│   └── colorExtraction.test.ts
└── __mocks__/
    ├── youtube-player.js
    └── firebase.js
```

#### Sample Test Examples:

**PlayerControls.test.tsx:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerControls } from '@/app/components/player/PlayerControls'

// Mock the contexts
const mockPlayerContext = {
  state: { isPlaying: false, volume: 50 },
  togglePlayback: jest.fn(),
}

describe('PlayerControls', () => {
  it('renders play button when not playing', () => {
    render(<PlayerControls />, { wrapper: TestProviders })
    expect(screen.getByLabelText(/play/i)).toBeInTheDocument()
  })

  it('calls togglePlayback when play button clicked', () => {
    render(<PlayerControls />, { wrapper: TestProviders })
    fireEvent.click(screen.getByLabelText(/play/i))
    expect(mockPlayerContext.togglePlayback).toHaveBeenCalled()
  })
})
```

### 4. Set Up GitHub Actions CI/CD
**Time Estimate:** 1.5 hours

#### Workflow Files (.github/workflows/):

**ci.yml:**
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Build application
      run: npm run build
```

**codeql.yml:**
```yaml
name: "CodeQL"

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: javascript
    
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

### 5. Error Monitoring Setup
**Time Estimate:** 1 hour

#### Sentry Integration (Optional):
- [ ] Create Sentry configuration
- [ ] Add error boundaries with Sentry reporting
- [ ] Set up performance monitoring
- [ ] Create privacy-compliant error reporting

#### Package Installation:
```bash
npm install @sentry/nextjs
```

#### Configuration (sentry.client.config.js):
```javascript
import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    integrations: [
      new Sentry.BrowserTracing(),
    ],
  })
}
```

### 6. Performance Monitoring
**Time Estimate:** 45 minutes

#### Lighthouse CI:
- [ ] Set up Lighthouse CI for performance monitoring
- [ ] Configure performance budgets
- [ ] Add Core Web Vitals tracking
- [ ] Set up automated performance regression detection

**.lighthouserc.js:**
```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm start',
      url: ['http://localhost:3000'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.9}],
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### 7. Dependency Security
**Time Estimate:** 30 minutes

#### Security Automation:
- [ ] Enable Dependabot for dependency updates
- [ ] Set up npm audit in CI pipeline
- [ ] Configure security policy
- [ ] Add SECURITY.md file

**dependabot.yml:**
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

**SECURITY.md:**
```markdown
# Security Policy

## Reporting Security Vulnerabilities

Please report security vulnerabilities to [security@openradio.dev]
We will respond within 48 hours and provide updates every 72 hours.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |
```

## Testing Strategy

### Test Categories:
1. **Unit Tests**: Individual components and functions
2. **Integration Tests**: Component interactions and context usage
3. **E2E Tests**: Critical user workflows (optional for Phase 3)
4. **Visual Regression Tests**: UI consistency (future consideration)

### Coverage Goals:
- **Contexts**: 90%+ coverage (critical for app state)
- **Services**: 85%+ coverage (external API interactions)
- **Components**: 75%+ coverage (UI logic)
- **Utils**: 90%+ coverage (pure functions)

## Quality Gates

### Pre-commit Hooks:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:ci"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### CI Requirements:
- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes  
- [ ] Build succeeds
- [ ] Coverage thresholds met
- [ ] Security scan passes

## Success Criteria
- [ ] ESLint and Prettier configured and working
- [ ] Jest and React Testing Library set up
- [ ] Core functionality has test coverage (70%+)
- [ ] GitHub Actions CI/CD pipeline working
- [ ] Error monitoring configured
- [ ] Security scanning enabled
- [ ] Performance monitoring in place
- [ ] All quality gates pass

## Dependencies
- **Phase 1**: Clean codebase structure required
- **Phase 2**: Documentation structure for test documentation

## Notes
- Start with the most critical components (contexts, services)
- Mock external dependencies (YouTube API, Firebase) properly
- Focus on testing behavior, not implementation details
- Use data-testid attributes sparingly, prefer semantic queries
- Consider visual regression testing for future phases