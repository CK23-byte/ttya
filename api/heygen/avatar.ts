/**
 * Vercel Serverless Function: HeyGen Avatar Management
 *
 * Consolidated endpoint for HeyGen avatar operations:
 * - create: Upload video and create custom avatar (POST)
 * - status: Check avatar processing status (GET)
 *
 * Uses HeyGen Upload API: https://upload.heygen.com/v1/talking_photo
 * Documentation: https://docs.heygen.com/docs/photo-avatars-api
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

  // Upload to HeyGen - Using upload.heygen.com domain for talking photos
  // Documentation: https://docs.heygen.com/docs/photo-avatars-api
  console.log('Uploading to HeyGen upload.heygen.com/v1/talking_photo...')
  const response = await fetch('https://upload.heygen.com/v1/talking_photo', {
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
      hint = 'Access Forbidden: Your HeyGen account may not have access to Talking Photo uploads. Free plan has 3 photo avatars available. Please check: 1) Your HeyGen account has credits, 2) Visit https://app.heygen.com/billing to verify your plan.'
    } else if (response.status === 404) {
      hint = 'The HeyGen upload endpoint was not found. Please verify the API is accessible and your account has the Photo Avatar feature enabled.'
    } else if (response.status === 401) {
      hint = 'Unauthorized: Your HeyGen API key is invalid. Please verify your HEYGEN_API_KEY environment variable.'
    } else if (response.status === 413) {
      hint = 'File too large. HeyGen has a maximum file size limit (typically 50MB). Try compressing your video or using a shorter clip.'
    }

    return res.status(response.status).json({
      error: 'Failed to create avatar',
      details: `HeyGen API (${response.status}): ${parsedError}`,
      hint
    })
  }

  const data = await response.json()

  console.log('HeyGen talking photo uploaded:', {
    id: data.data?.talking_photo_id || data.data?.photo_id || data.data?.avatar_id || data.data?.id,
    status: data.data?.status,
    fullResponse: JSON.stringify(data)
  })

  return res.status(200).json({
    success: true,
    avatarId: data.data?.talking_photo_id || data.data?.photo_id || data.data?.avatar_id || data.data?.id,
    avatarName: data.data?.talking_photo_name || data.data?.photo_name || avatarName,
    status: data.data?.status || 'processing',
    message: 'Talking photo is being processed. This may take a few minutes.'
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

  console.log('Checking HeyGen talking photo status:', { avatarId })

  // Use v2 API endpoint for getting talking photo status
  const response = await fetch(`https://api.heygen.com/v2/talking_photo/${avatarId}`, {
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
    avatarId: data.data?.talking_photo_id || data.data?.photo_id || data.data?.avatar_id || avatarId,
    status: data.data?.status || 'unknown',
    thumbnailUrl: data.data?.thumbnail_url || data.data?.preview_image_url || data.data?.preview_url,
    videoUrl: data.data?.video_url
  })
}
