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

  // Download image/video from URL
  console.log('Downloading media from URL...', { url: videoUrl.substring(0, 100) + '...' })
  const mediaResponse = await fetch(videoUrl)
  console.log('Media download response:', {
    status: mediaResponse.status,
    statusText: mediaResponse.statusText,
    contentType: mediaResponse.headers.get('content-type')
  })

  if (!mediaResponse.ok) {
    return res.status(400).json({
      error: 'Failed to download media from URL',
      details: `HTTP ${mediaResponse.status}: ${mediaResponse.statusText}`,
      hint: 'Make sure the file exists and the URL is accessible'
    })
  }

  let mediaBuffer = Buffer.from(await mediaResponse.arrayBuffer())
  const contentType = mediaResponse.headers.get('content-type') || 'image/jpeg'
  console.log('Media downloaded successfully:', {
    size: mediaBuffer.length,
    sizeInMB: (mediaBuffer.length / (1024 * 1024)).toFixed(2),
    contentType
  })

  // Convert image to JPG if it's not already (HeyGen only accepts JPG/JPEG)
  let finalContentType = 'image/jpeg'
  if (contentType && !contentType.includes('jpeg') && !contentType.includes('jpg')) {
    console.log('Converting image to JPEG format for HeyGen compatibility...')
    try {
      // Use sharp library to convert to JPG
      const sharp = (await import('sharp')).default
      mediaBuffer = await sharp(mediaBuffer)
        .jpeg({ quality: 95 }) // High quality JPG
        .toBuffer()
      console.log('Image converted to JPEG:', {
        originalFormat: contentType,
        newSize: mediaBuffer.length,
        newSizeInMB: (mediaBuffer.length / (1024 * 1024)).toFixed(2)
      })
    } catch (convertError) {
      console.warn('Image conversion failed, using original:', convertError)
      // If conversion fails, try with original format
      finalContentType = contentType.startsWith('image/') ? contentType : 'image/jpeg'
    }
  }

  // HeyGen expects binary data with image content-type
  // Documentation: https://docs.heygen.com/reference/upload-talking-photo
  console.log('Uploading to HeyGen upload.heygen.com/v1/talking_photo...')
  const response = await fetch('https://upload.heygen.com/v1/talking_photo', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      'Content-Type': finalContentType,
      'Accept': 'application/json'
    },
    body: mediaBuffer
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
    let hint = 'Check that your photo meets HeyGen requirements (frontal face, good lighting, clear image)'
    if (response.status === 400) {
      hint = 'Bad Request: The photo data format is incorrect. Make sure you are uploading a valid image file (JPG, PNG). HeyGen requires a photo showing a clear frontal face.'
    } else if (response.status === 403) {
      hint = 'Access Forbidden: Your HeyGen account may not have access to Talking Photo uploads. Free plan has 3 photo avatars available. Please check: 1) Your HeyGen account has credits, 2) Visit https://app.heygen.com/billing to verify your plan.'
    } else if (response.status === 404) {
      hint = 'The HeyGen upload endpoint was not found. Please verify the API is accessible and your account has the Photo Avatar feature enabled.'
    } else if (response.status === 401) {
      hint = 'Unauthorized: Your HeyGen API key is invalid. Please verify your HEYGEN_API_KEY environment variable.'
    } else if (response.status === 413) {
      hint = 'File too large. HeyGen has a maximum file size limit. Try using a smaller or compressed image.'
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
