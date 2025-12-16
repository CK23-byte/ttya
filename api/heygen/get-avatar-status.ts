/**
 * Vercel Serverless Function: Get HeyGen Avatar Status
 *
 * Checks the processing status of a HeyGen avatar
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check required environment variables
  if (!HEYGEN_API_KEY) {
    console.error('HeyGen API key not configured')
    return res.status(500).json({
      error: 'HeyGen API key not configured'
    })
  }

  try {
    const { avatarId } = req.query

    if (!avatarId || typeof avatarId !== 'string') {
      return res.status(400).json({
        error: 'Missing required query parameter: avatarId'
      })
    }

    console.log('Checking avatar status:', avatarId)

    const response = await fetch(`https://api.heygen.com/v1/talking_photo/${avatarId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('HeyGen API error:', error)
      return res.status(response.status).json({
        error: 'Failed to get avatar status',
        details: error
      })
    }

    const data = await response.json()

    return res.status(200).json({
      success: true,
      avatarId: data.data?.talking_photo_id || avatarId,
      status: data.data?.status || 'unknown',
      thumbnailUrl: data.data?.thumbnail_url,
      videoUrl: data.data?.video_url
    })

  } catch (error) {
    console.error('Error getting avatar status:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
