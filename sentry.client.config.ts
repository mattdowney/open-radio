import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 0.1,
  
  // Error filtering and enhancement
  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        return null; // Ignore chunk loading errors
      }
      if (error?.value?.includes('YouTube API') && error?.value?.includes('quota')) {
        return null; // Don't spam with API quota errors
      }
    }
    
    return event;
  },
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Enable capture of unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Additional options
  debug: process.env.NODE_ENV === 'development',
  
  // Privacy settings
  beforeBreadcrumb(breadcrumb) {
    // Filter sensitive data from breadcrumbs
    if (breadcrumb.category === 'fetch' && breadcrumb.data?.url?.includes('googleapis.com')) {
      // Remove API key from YouTube API calls
      breadcrumb.data.url = breadcrumb.data.url.replace(/[?&]key=[^&]+/, '&key=***');
    }
    return breadcrumb;
  },
});