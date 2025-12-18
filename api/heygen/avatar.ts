/**
 * Vercel Serverless Function: HeyGen Avatar Management
 *
 * Consolidated endpoint for HeyGen avatar operations:
 * - create: Upload video and create custom avatar (POST)
 * - status: Check avatar processing status (GET)
 *
 * Uses HeyGen v1 API: https://api.heygen.com/v1/photo_avatar
 * Note: This endpoint creates a "talking photo" avatar from uploaded video
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

  const { videoUrl, avatarName } = req.body

  if (!videoUrl || !avatarName) {
    return res.status(400).json({
      error: 'Missing required fields: videoUrl, avatarName'
    })
  }

  console.log('Creating HeyGen avatar:', { avatarName, videoUrl })

  // Download video from URL
  console.log('Downloading video from URL...', { url: videoUrl.substring(0, 100) + '...' })
  const videoResponse = await fetch(videoUrl)
  console.log('Video download response:', {
    status: videoResponse.status,
    statusText: videoResponse.statusText,
    contentType: videoResponse.headers.get('content-type')
  })

  if (!videoResponse.ok) {
    return res.status(400).json({
      error: 'Failed to download video from URL',
      details: `HTTP ${videoResponse.status}: ${videoResponse.statusText}`,
      hint: 'Make sure the video file exists and the URL is accessible'
    })
  }

  const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())
  console.log('Video downloaded successfully:', {
    size: videoBuffer.length,
    sizeInMB: (videoBuffer.length / (1024 * 1024)).toFixed(2)
  })

  // HeyGen expects multipart/form-data
  const FormData = (await import('form-data')).default
  const formData = new FormData()
  formData.append('file', videoBuffer, {
    filename: 'avatar.mp4',
    contentType: 'video/mp4'
  })
  formData.append('avatar_name', avatarName)

  // Upload to HeyGen - Using v1 photo_avatar endpoint (talking_photo endpoint)
  // The v1/photo_avatar endpoint is for creating custom avatars from video
  console.log('Uploading to HeyGen v1/photo_avatar...')
  const response = await fetch('https://api.heygen.com/v1/photo_avatar', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      ...formData.getHeaders()
    },
    body: formData as any
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen create avatar error:', {
      status: response.status,
      statusText: response.statusText,
      rawError: error
    })

    // Try to parse JSON error and stringify properly
    let parsedError = error
    try {
      const errorJson = JSON.parse(error)
      // Properly stringify the error object
      parsedError = errorJson.message || errorJson.error || JSON.stringify(errorJson, null, 2)
      console.error('Parsed HeyGen error:', errorJson)
    } catch (e) {
      // Not JSON, use raw error
      console.error('Error is not JSON:', error)
    }

    // Provide specific guidance based on status code
    let hint = 'Check that your video meets HeyGen requirements (frontal face, good lighting, 2-10 seconds, max 50MB)'
    if (response.status === 403) {
      hint = 'Access Forbidden: Your HeyGen API key may not have access to the Photo Avatar (Talking Photo) API. This is a premium feature. Please check: 1) Your HeyGen account has credits/active plan, 2) Your API key has the correct permissions, 3) Visit https://app.heygen.com/billing to verify your account status.'
    } else if (response.status === 404) {
      hint = 'The HeyGen API endpoint was not found. The v1/photo_avatar endpoint may not be available with your API key or plan level.'
    } else if (response.status === 401) {
      hint = 'Unauthorized: Your HeyGen API key is invalid. Please verify your HEYGEN_API_KEY environment variable.'
    }

    return res.status(response.status).json({
      error: 'Failed to create avatar',
      details: `HeyGen API (${response.status}): ${parsedError}`,
      hint
    })
  }

  const data = await response.json()

  console.log('HeyGen avatar created:', {
    id: data.data?.photo_id || data.data?.talking_photo_id || data.data?.avatar_id || data.data?.id,
    status: data.data?.status,
    fullResponse: JSON.stringify(data)
  })

  return res.status(200).json({
    success: true,
    avatarId: data.data?.photo_id || data.data?.talking_photo_id || data.data?.avatar_id || data.data?.id,
    avatarName: data.data?.photo_name || data.data?.talking_photo_name || avatarName,
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

  // Use v1 API endpoint for getting photo avatar status
  const response = await fetch(`https://api.heygen.com/v1/photo_avatar/${avatarId}`, {
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
    avatarId: data.data?.photo_id || data.data?.talking_photo_id || data.data?.avatar_id || avatarId,
    status: data.data?.status || 'unknown',
    thumbnailUrl: data.data?.thumbnail_url || data.data?.preview_image_url || data.data?.preview_url,
    videoUrl: data.data?.video_url
  })
}
