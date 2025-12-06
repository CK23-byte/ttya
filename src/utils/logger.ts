/**
 * Secure Logger Utility
 * Only logs in development mode to prevent data leakage in production
 */

const isDevelopment = import.meta.env.MODE === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error)
    }
    // In production, you would send to error tracking service
    // Example: Sentry.captureException(error)
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  }
}
