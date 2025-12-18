/**
 * Secure Logger Utility
 * TEMPORARY: All logs enabled for production debugging
 */

export const logger = {
  log: (...args: any[]) => {
    // TEMPORARY: Always log for debugging
    console.log('[LOG]', ...args)
  },

  error: (...args: any[]) => {
    // Always log errors (important for production debugging)
    console.error('[ERROR]', ...args)
  },

  warn: (...args: any[]) => {
    // TEMPORARY: Always log for debugging
    console.warn('[WARN]', ...args)
  },

  info: (...args: any[]) => {
    // TEMPORARY: Always log for debugging
    console.info('[INFO]', ...args)
  }
}
