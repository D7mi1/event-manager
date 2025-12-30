/**
 * Sentry Configuration for Error Tracking
 * تكوين Sentry لتتبع الأخطاء
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const initializeSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
  });
};

/**
 * Capture an error and send it to Sentry
 */
export const captureError = (
  error: Error | string,
  context?: Record<string, any>
) => {
  if (!SENTRY_DSN) {
    console.error(error);
    return;
  }

  if (typeof error === 'string') {
    Sentry.captureException(new Error(error), { extra: context });
  } else {
    Sentry.captureException(error, { extra: context });
  }
};

/**
 * Capture a message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  if (!SENTRY_DSN) {
    console.log(message);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Set user context for error tracking
 */
export const setSentryUser = (userId: string, email?: string) => {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: userId,
    email: email,
  });
};

/**
 * Clear user context
 */
export const clearSentryUser = () => {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
};

export default {
  initializeSentry,
  captureError,
  captureMessage,
  setSentryUser,
  clearSentryUser,
};
