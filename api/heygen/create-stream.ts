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
      console.error('❌ HeyGen API error response:', {
        status: heygenResponse.status,
        statusText: heygenResponse.statusText,
        body: error
      })

      // Parse error if it's JSON
      let errorMessage = 'Failed to create streaming session'
      let errorDetail = error
      try {
        const errorJson = JSON.parse(error)
        console.error('❌ Parsed HeyGen error:', errorJson)
        errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage
        errorDetail = JSON.stringify(errorJson, null, 2)
      } catch (e) {
        errorMessage = error || errorMessage
        errorDetail = error
      }

      return res.status(heygenResponse.status).json({
        error: 'Failed to create streaming session',
        details: `HeyGen API (${heygenResponse.status}): ${errorMessage}`,
        rawError: errorDetail,
        hint: 'Check that your HeyGen API key has streaming permissions and avatar ID is valid'
      })
    }

    const heygenData = await heygenResponse.json()
    console.log('HeyGen full response:', JSON.stringify(heygenData, null, 2))
    console.log('HeyGen streaming session created:', {
      session_id: heygenData.data?.session_id,
      hasOffer: !!heygenData.data?.sdp?.sdp,
      hasSdpDirect: !!heygenData.data?.sdp,
      sdpKeys: heygenData.data?.sdp ? Object.keys(heygenData.data.sdp) : []
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
    // Note: HeyGen returns SDP in various formats depending on API version
    const sdpOffer = sessionData.sdp?.sdp || sessionData.sdp || ''

    console.log('Preparing SDP offer:', {
      hasSdp: !!sdpOffer,
      sdpType: typeof sdpOffer,
      sdpLength: typeof sdpOffer === 'string' ? sdpOffer.length : 0,
      sdpPreview: typeof sdpOffer === 'string' ? sdpOffer.substring(0, 100) : 'NOT A STRING',
      rawSdpObject: typeof sdpOffer !== 'string' ? JSON.stringify(sdpOffer) : null
    })

    // Validate SDP
    if (!sdpOffer || (typeof sdpOffer === 'string' && sdpOffer.length === 0)) {
      console.error('Empty SDP received from HeyGen!')
      return res.status(500).json({
        error: 'Invalid response from HeyGen',
        details: 'SDP is empty - session created but no media description received',
        hint: 'Check HeyGen API key permissions and avatar availability',
        heygenResponse: {
          session_id: sessionData.session_id,
          sdp: sessionData.sdp,
          sdp_sdp: sessionData.sdp?.sdp,
          allKeys: Object.keys(sessionData),
          ice_servers: sessionData.ice_servers,
          ice_servers2: sessionData.ice_servers2
        }
      })
    }

    return res.status(200).json({
      success: true,
      id: sessionData.session_id,
      session_id: sessionData.session_id,
      offer: {
        type: 'offer' as RTCSdpType,
        sdp: sdpOffer
      },
      ice_servers: sessionData.ice_servers2 || sessionData.ice_servers || []
    })

  } catch (error) {
    console.error('Error creating HeyGen streaming session:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
