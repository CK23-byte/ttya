/**
 * Vercel Serverless Function: Start HeyGen Avatar Speaking
 *
 * Triggers the avatar to start speaking in the streaming session
 * https://docs.heygen.com/reference/start-avatar
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY

interface RequestBody {
  sessionId: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check required environment variables
  if (!HEYGEN_API_KEY) {
    console.error('HeyGen API key not configured')
    return res.status(500).json({
      error: 'HeyGen API key not configured',
      hint: 'Set HEYGEN_API_KEY in Vercel environment variables'
    })
  }

  try {
    const body = req.body as RequestBody
    const { sessionId } = body

    // Validate input
    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing required field: sessionId'
      })
    }

    console.log('Starting HeyGen avatar speaking:', sessionId)

    // Prepare request body for HeyGen API
    const heygenRequestBody = {
      session_id: sessionId
    }

    // Call HeyGen API to start avatar speaking
    const heygenResponse = await fetch('https://api.heygen.com/v1/streaming.start', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(heygenRequestBody)
    })

    console.log('HeyGen API response status:', heygenResponse.status)

    if (!heygenResponse.ok) {
      const error = await heygenResponse.text()
      console.error('HeyGen API error:', error)

      // Parse error if it's JSON
      let errorMessage = 'Failed to start avatar speaking'
      try {
        const errorJson = JSON.parse(error)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch (e) {
        errorMessage = error || errorMessage
      }

      return res.status(heygenResponse.status).json({
        error: 'Failed to start avatar speaking',
        details: errorMessage
      })
    }

    const heygenData = await heygenResponse.json()
    console.log('HeyGen avatar started speaking:', heygenData)

    return res.status(200).json({
      success: true,
      message: 'Avatar started speaking'
    })

  } catch (error) {
    console.error('Error starting HeyGen avatar speaking:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
