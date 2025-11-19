/**
 * D-ID Create Streaming Session
 *
 * Serverless function to create a real-time streaming session with D-ID
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

  const { sourceUrl } = req.body

  if (!sourceUrl) {
    return res.status(400).json({ error: 'Source URL is required' })
  }

  try {
    // Create streaming session with D-ID
    const response = await fetch('https://api.d-id.com/talks/streams', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: sourceUrl,
        driver_url: 'bank://lively', // Default driver for natural movements
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('D-ID API error:', error)
      return res.status(response.status).json({ error: error.message || 'Failed to create stream' })
    }

    const data = await response.json()

    return res.status(200).json({
      id: data.id,
      session_id: data.session_id,
      offer: data.offer, // WebRTC offer
    })
  } catch (error) {
    console.error('Error creating D-ID stream:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
