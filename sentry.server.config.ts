import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 0.1,
  
  // Error filtering and enhancement
  beforeSend(event) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'ChunkLoadError') {
          return null; // Ignore chunk loading errors
        }
        if (error?.value?.includes('YouTube API') && error?.value?.includes('quota')) {
          return null; // Don't spam with API quota errors
        }
      }
    }
    
    return event;
  },
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
  
  // Privacy settings
  beforeBreadcrumb(breadcrumb) {
    // Filter sensitive data from breadcrumbs
    if (breadcrumb.category === 'http') {
      // Remove API keys from HTTP requests
      if (breadcrumb.data?.url?.includes('googleapis.com')) {
        breadcrumb.data.url = breadcrumb.data.url.replace(/[?&]key=[^&]+/, '&key=***');
      }
    }
    return breadcrumb;
  },
});