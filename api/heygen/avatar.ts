/**
 * Vercel Serverless Function: HeyGen Avatar Management
 *
 * Consolidated endpoint for HeyGen avatar operations:
 * - create: Upload video and create custom avatar
 * - status: Check avatar processing status
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Get action from query or body
  const action = req.method === 'GET' ? 'status' : 'create'

  if (!HEYGEN_API_KEY) {
    return res.status(500).json({
      error: 'HeyGen API key not configured',
      hint: 'Set HEYGEN_API_KEY in Vercel environment variables'
    })
  }

  try {
    if (action === 'create') {
      return await handleCreateAvatar(req, res)
    } else if (action === 'status') {
      return await handleGetStatus(req, res)
    } else {
      return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('HeyGen avatar endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Create Avatar Handler (POST)
async function handleCreateAvatar(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { videoBase64, avatarName } = req.body

  if (!videoBase64 || !avatarName) {
    return res.status(400).json({
      error: 'Missing required fields: videoBase64, avatarName'
    })
  }

  console.log('Creating HeyGen avatar:', { avatarName })

  // Convert base64 to buffer
  const videoBuffer = Buffer.from(videoBase64, 'base64')

  // HeyGen expects multipart/form-data
  const FormData = (await import('form-data')).default
  const formData = new FormData()
  formData.append('file', videoBuffer, {
    filename: 'avatar.mp4',
    contentType: 'video/mp4'
  })
  formData.append('avatar_name', avatarName)

  // Upload to HeyGen
  const response = await fetch('https://api.heygen.com/v1/talking_photo', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      ...formData.getHeaders()
    },
    body: formData as any
  })

  if (!response.ok) {
    const error = await response.text()
    const errorMessage = error.substring(0, 200)
    console.error('HeyGen create avatar error:', errorMessage)
    return res.status(response.status).json({
      error: 'Failed to create avatar',
      details: `HeyGen API (${response.status}): ${errorMessage}`,
      hint: 'Check that your video meets HeyGen requirements (frontal face, good lighting, 2-10 seconds)'
    })
  }

  const data = await response.json()

  console.log('HeyGen avatar created:', {
    id: data.data?.talking_photo_id || data.data?.id,
    status: data.data?.status
  })

  return res.status(200).json({
    success: true,
    avatarId: data.data?.talking_photo_id || data.data?.id,
    avatarName: data.data?.talking_photo_name || avatarName,
    status: data.data?.status || 'processing',
    message: 'Avatar is being processed. This may take a few minutes.'
  })
}

// Get Avatar Status Handler (GET)
async function handleGetStatus(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { avatarId } = req.query

  if (!avatarId || typeof avatarId !== 'string') {
    return res.status(400).json({
      error: 'Missing required query parameter: avatarId'
    })
  }

  console.log('Checking HeyGen avatar status:', { avatarId })

  const response = await fetch(`https://api.heygen.com/v1/talking_photo/${avatarId}`, {
    method: 'GET',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen get status error:', error)
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
}
