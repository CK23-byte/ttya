/**
 * Vercel Serverless Function: Create HeyGen Streaming Session
 *
 * Creates a new HeyGen Interactive Avatar streaming session for real-time video calls
 * https://docs.heygen.com/reference/new-session-copy
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY

interface RequestBody {
  avatarId: string
  quality?: 'low' | 'medium' | 'high'
  voice?: {
    voiceId?: string
    rate?: number
    emotion?: string
  }
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
    const { avatarId, quality = 'medium', voice } = body

    // Validate input
    if (!avatarId) {
      return res.status(400).json({
        error: 'Missing required field: avatarId',
        hint: 'Provide a HeyGen avatar ID'
      })
    }

    console.log('Creating HeyGen streaming session:', {
      avatarId,
      quality,
      voice
    })

    // Map quality to HeyGen resolution
    const qualityMap = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high'
    }

    // Prepare request body for HeyGen API
    const heygenRequestBody: any = {
      quality: qualityMap[quality],
      avatar_name: avatarId,
      version: 'v2' // Use v2 for Interactive Avatar API
    }

    // Add voice configuration if provided
    if (voice) {
      heygenRequestBody.voice = voice
    }

    console.log('HeyGen API request:', heygenRequestBody)

    // Call HeyGen API to create streaming session
    const heygenResponse = await fetch('https://api.heygen.com/v1/streaming.new', {
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
      let errorMessage = 'Failed to create streaming session'
      try {
        const errorJson = JSON.parse(error)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch (e) {
        errorMessage = error || errorMessage
      }

      return res.status(heygenResponse.status).json({
        error: 'Failed to create streaming session',
        details: errorMessage,
        hint: 'Check that your HeyGen API key has streaming permissions and avatar ID is valid'
      })
    }

    const heygenData = await heygenResponse.json()
    console.log('HeyGen streaming session created:', {
      session_id: heygenData.data?.session_id,
      hasOffer: !!heygenData.data?.sdp?.sdp
    })

    // Extract session data
    const sessionData = heygenData.data

    if (!sessionData || !sessionData.session_id) {
      console.error('Invalid HeyGen response:', heygenData)
      return res.status(500).json({
        error: 'Invalid response from HeyGen',
        details: 'Missing session_id in response'
      })
    }

    // Return session info compatible with frontend interface
    return res.status(200).json({
      success: true,
      id: sessionData.session_id,
      session_id: sessionData.session_id,
      offer: {
        type: 'offer',
        sdp: sessionData.sdp?.sdp
      },
      ice_servers: sessionData.ice_servers2 || []
    })

  } catch (error) {
    console.error('Error creating HeyGen streaming session:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
