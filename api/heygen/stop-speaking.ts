/**
 * Vercel Serverless Function: Stop HeyGen Avatar Speaking
 *
 * Stops the avatar from speaking in the streaming session
 * https://docs.heygen.com/reference/interrupt-avatar
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

    console.log('Stopping HeyGen avatar speaking:', sessionId)

    // Prepare request body for HeyGen API
    const heygenRequestBody = {
      session_id: sessionId
    }

    // Call HeyGen API to interrupt/stop avatar speaking
    const heygenResponse = await fetch('https://api.heygen.com/v1/streaming.interrupt', {
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
      let errorMessage = 'Failed to stop avatar speaking'
      try {
        const errorJson = JSON.parse(error)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch (e) {
        errorMessage = error || errorMessage
      }

      // Don't fail hard on stop errors
      console.warn('HeyGen stop speaking warning:', errorMessage)
    }

    const heygenData = heygenResponse.ok ? await heygenResponse.json() : {}
    console.log('HeyGen avatar stopped speaking:', heygenData)

    return res.status(200).json({
      success: true,
      message: 'Avatar stopped speaking'
    })

  } catch (error) {
    console.error('Error stopping HeyGen avatar speaking:', error)

    // Don't fail hard on stop errors
    return res.status(200).json({
      success: true,
      message: 'Avatar stop attempted',
      warning: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
