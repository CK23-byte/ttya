/**
 * Secure Logger Utility
 * Only logs in development mode to prevent data leakage in production
 */

const isDevelopment = import.meta.env.MODE === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      logger.log(...args)
    }
  },

  error: (...args: any[]) => {
    // Always log errors (important for production debugging)
    logger.error(...args)
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      logger.warn(...args)
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      logger.info(...args)
    }
  }
}
