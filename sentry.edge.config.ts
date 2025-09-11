import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring (reduced for edge)
  tracesSampleRate: 0.05,

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  // Minimal debug for edge runtime
  debug: false,
});
