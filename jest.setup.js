import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'));

// Mock environment variables
process.env.NEXT_PUBLIC_YOUTUBE_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_FIREBASE_ENABLED = 'false';

// Mock YouTube player
jest.mock('youtube-player', () => {
  return jest.fn(() => ({
    loadVideoById: jest.fn(),
    playVideo: jest.fn(),
    pauseVideo: jest.fn(),
    setVolume: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
  }));
});

// Mock Firebase
jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  set: jest.fn(),
  get: jest.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  onValue: jest.fn(),
  onDisconnect: jest.fn(() => ({
    remove: jest.fn(),
  })),
  remove: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
