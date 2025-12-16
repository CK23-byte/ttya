/**
 * Vercel Serverless Function: Create HeyGen Avatar
 *
 * Uploads a video to HeyGen and creates a custom avatar
 * https://docs.heygen.com/reference/upload-talking-photo
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY

interface RequestBody {
  videoBase64: string
  avatarName: string
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
    const { videoBase64, avatarName } = body

    if (!videoBase64 || !avatarName) {
      return res.status(400).json({
        error: 'Missing required fields: videoBase64, avatarName'
      })
    }

    console.log('Creating HeyGen avatar:', { avatarName })

    // Convert base64 to buffer
    const videoBuffer = Buffer.from(videoBase64, 'base64')

    // HeyGen expects multipart/form-data for avatar upload
    // We'll use the talking photo API which accepts video
    const formData = new FormData()
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' })
    formData.append('file', videoBlob, 'avatar.mp4')
    formData.append('avatar_name', avatarName)

    const response = await fetch('https://api.heygen.com/v1/talking_photo', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('HeyGen API error:', {
        status: response.status,
        statusText: response.statusText,
        body: error
      })

      let errorMessage = 'Failed to create avatar'
      try {
        const errorJson = JSON.parse(error)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch (e) {
        errorMessage = error || errorMessage
      }

      return res.status(response.status).json({
        error: 'Failed to create avatar',
        details: `HeyGen API (${response.status}): ${errorMessage}`,
        hint: 'Check that your video meets HeyGen requirements (frontal face, good lighting, 2-10 seconds)'
      })
    }

    const data = await response.json()
    console.log('Avatar creation response:', data)

    return res.status(200).json({
      success: true,
      avatarId: data.data?.talking_photo_id || data.data?.id,
      avatarName: data.data?.talking_photo_name || avatarName,
      status: data.data?.status || 'processing',
      message: 'Avatar is being processed. This may take a few minutes.'
    })

  } catch (error) {
    console.error('Error creating HeyGen avatar:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
