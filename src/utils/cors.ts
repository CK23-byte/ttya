/**
 * Secure CORS Configuration Utility
 * Use this instead of wildcard (*) CORS
 */

import { VercelRequest, VercelResponse } from '@vercel/node'

// Allowed origins for production
const ALLOWED_ORIGINS = [
  'https://talktoyouai.com',
  'https://www.talktoyouai.com',
  'https://talktoyouai.vercel.app',
  // Add your production domains here
]

// In development, allow localhost
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:3000')
}

/**
 * Sets secure CORS headers based on origin whitelist
 * @param req - Vercel request object
 * @param res - Vercel response object
 * @returns true if origin is allowed, false otherwise
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin

  // Check if origin is in whitelist
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  } else if (!origin) {
    // Same-origin requests (no Origin header)
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0])
  } else {
    // Origin not allowed
    return false
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  return true
}

/**
 * Handle preflight OPTIONS request
 * @param req - Vercel request object
 * @param res - Vercel response object
 * @returns true if preflight was handled
 */
export function handleCorsPrelight(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res)
    res.status(200).end()
    return true
  }
  return false
}

/**
 * Middleware to apply CORS and reject unauthorized origins
 * Usage:
 * ```typescript
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   if (!applyCorsMiddleware(req, res)) {
 *     return res.status(403).json({ error: 'Origin not allowed' })
 *   }
 *   // Your API logic here
 * }
 * ```
 */
export function applyCorsMiddleware(req: VercelRequest, res: VercelResponse): boolean {
  // Handle preflight
  if (handleCorsPrelight(req, res)) {
    return true
  }

  // Set CORS headers and check if origin is allowed
  return setCorsHeaders(req, res)
}
