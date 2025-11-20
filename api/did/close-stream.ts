/**
 * D-ID Close Stream
 *
 * Close an active D-ID streaming session
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const DID_API_KEY = process.env.VITE_DID_API_KEY

  if (!DID_API_KEY) {
    return res.status(500).json({ error: 'D-ID API key not configured' })
  }

  const { sessionId } = req.body

  if (!sessionId) {
    console.error('D-ID stream close failed: No session ID provided')
    return res.status(400).json({ error: 'Session ID is required' })
  }

  try {
    console.log('Closing D-ID streaming session:', sessionId)

    // Delete/close the D-ID streaming session
    const response = await fetch(`https://api.d-id.com/talks/streams/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
      },
    })

    console.log('D-ID close stream response status:', response.status)

    if (!response.ok && response.status !== 404) {
      const error = await response.json()
      console.error('D-ID API error response:', {
        status: response.status,
        error: error
      })
      return res.status(response.status).json({
        error: error.message || 'Failed to close stream',
        details: error
      })
    }

    console.log('D-ID stream closed successfully')
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error closing D-ID stream:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
