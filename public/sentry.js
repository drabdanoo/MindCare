import * as Sentry from '@sentry/browser';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Must be called BEFORE any other application code
 */
Sentry.init({
  // DSN from Sentry project settings
  dsn: import.meta.env.VITE_SENTRY_DSN,
  
  // Environment configuration
  environment: import.meta.env.VITE_APP_ENV || 'development',
  
  // Performance Monitoring - sample 10% of transactions
  tracesSampleRate: 0.1,
  
  // Release tracking (optional - use package.json version)
  release: 'mindcare@1.0.0',
  
  // Additional configuration
  beforeSend(event) {
    // Log events in development for debugging
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.log('Sentry event captured:', event);
      // Still send to Sentry even in dev for testing
    }
    return event;
  },
  
  // Ignore common browser errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});

export default Sentry;
