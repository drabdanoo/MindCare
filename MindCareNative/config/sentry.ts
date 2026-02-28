import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Initialize Sentry error tracking for React Native
 * REUSES WEB APP CONCEPT: Secure DSN from environment variables
 */
export const initSentry = () => {
  // Skip Sentry initialization on web (use @sentry/react for web if needed)
  if (Platform.OS === 'web') {
    console.log('Sentry: Skipping native initialization on web platform');
    return;
  }

  const sentryDsn = Constants.expoConfig?.extra?.sentryDsn || process.env.EXPO_PUBLIC_SENTRY_DSN;
  const environment = Constants.expoConfig?.extra?.environment || process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';

  if (!sentryDsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,

    // Enable performance monitoring (10% sample rate)
    enableTracing: true,
    tracesSampleRate: 0.1,

    // Capture 100% of errors
    sampleRate: 1.0,

    // Automatically track navigation
    enableAutoSessionTracking: true,

    // Capture native crashes
    enableNative: true,

    // Attach stack traces to errors
    attachStacktrace: true,

    // Filter out development errors
    beforeSend(event) {
      if (environment === 'development') {
        // Log to console in development
        console.log('Sentry Event:', event);
      }
      return event;
    },

    // Integration configuration
    integrations: [
      new Sentry.ReactNativeTracing({
        // Track app start time
        enableAppStartTracking: true,

        // Track slow/frozen frames
        enableStallTracking: true,

        // Track user interactions
        enableUserInteractionTracing: true,
      }),
    ],
  });
};

/**
 * Manually capture exception
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (Platform.OS === 'web') {
    console.error('Sentry (web):', error, context);
    return;
  }

  if (context) {
    Sentry.setContext('additionalContext', context);
  }
  Sentry.captureException(error);
};

/**
 * Capture custom message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (Platform.OS === 'web') {
    console.log(`Sentry (web) [${level}]:`, message);
    return;
  }

  Sentry.captureMessage(message, level);
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, email?: string, role?: string) => {
  if (Platform.OS === 'web') {
    console.log('Sentry: User context set (web):', { userId, email, role });
    return;
  }

  Sentry.setUser({
    email: email,
    username: role,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
  if (Platform.OS === 'web') {
    console.log('Sentry: User context cleared (web)');
    return;
  }

  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};
