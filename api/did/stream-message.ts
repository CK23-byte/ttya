/**
 * D-ID Stream Message
 *
 * Send a message to an active D-ID streaming session
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

  const { sessionId, message } = req.body

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'Session ID and message are required' })
  }

  try {
    // Send message to D-ID streaming session
    const response = await fetch(`https://api.d-id.com/talks/streams/${sessionId}/sdp`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer: {
          type: 'answer',
          sdp: message, // WebRTC SDP answer
        },
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('D-ID API error:', error)
      return res.status(response.status).json({ error: error.message || 'Failed to send message' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error sending D-ID message:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
