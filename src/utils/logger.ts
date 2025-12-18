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

  error: (...args: any[]) => {
    // Always log errors (important for production debugging)
    console.error(...args)
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
