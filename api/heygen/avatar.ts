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
import { createClient } from '@supabase/supabase-js'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Determine action based on query parameters (more robust than method alone)
  // If avatarId query param exists, it's a status check
  // Otherwise it's a create request
  const { avatarId } = req.query
  const action = avatarId ? 'status' : 'create'

  console.log('Avatar API called:', {
    method: req.method,
    action,
    hasAvatarId: !!avatarId,
    queryParams: req.query
  })

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
  // Accept any method - we've already determined this is a create action
  const { videoUrl, avatarName } = req.body

  if (!videoUrl || !avatarName) {
    return res.status(400).json({
      error: 'Missing required fields: videoUrl, avatarName'
    })
  }

  console.log('Creating HeyGen avatar:', { avatarName, videoUrl })

  // Extract storage path from URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/user-uploads/profiles/xxx/photos/xxx.jpg
  const urlParts = videoUrl.split('/storage/v1/object/public/')
  if (urlParts.length < 2) {
    return res.status(400).json({
      error: 'Invalid storage URL format',
      hint: 'URL should be from Supabase Storage'
    })
  }

  const storagePath = urlParts[1] // e.g., "user-uploads/profiles/xxx/photos/xxx.jpg"
  const pathParts = storagePath.split('/')
  const bucket = pathParts[0] // "user-uploads"
  const filePath = pathParts.slice(1).join('/') // "profiles/xxx/photos/xxx.jpg"

  console.log('Downloading media from Supabase Storage:', {
    bucket,
    filePath: filePath.substring(0, 100) + '...'
  })

  // Download using Supabase client with service role key (bypasses RLS)
  if (!supabase) {
    return res.status(500).json({
      error: 'Supabase not configured',
      hint: 'Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables'
    })
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(filePath)

  if (downloadError || !fileData) {
    console.error('❌ Failed to download from Supabase Storage:', downloadError)
    return res.status(400).json({
      error: 'Failed to download media from storage',
      details: downloadError?.message || 'Unknown error',
      hint: 'Check that the file exists in Supabase Storage and the service role key has access'
    })
  }

  console.log('Media downloaded successfully from Supabase:', {
    size: fileData.size,
    type: fileData.type
  })

  const contentType = fileData.type || 'image/jpeg'
  let mediaBuffer = Buffer.from(await fileData.arrayBuffer())
  console.log('Media downloaded successfully:', {
    size: mediaBuffer.length,
    sizeInMB: (mediaBuffer.length / (1024 * 1024)).toFixed(2),
    contentType
  })

  // Convert image to JPG if it's not already (HeyGen only accepts JPG/JPEG)
  let finalContentType = 'image/jpeg'
  let conversionAttempted = false
  let conversionSuccess = false

  if (contentType && !contentType.includes('jpeg') && !contentType.includes('jpg')) {
    console.log('⚠️ Non-JPEG format detected:', contentType)
    console.log('Converting image to JPEG format for HeyGen compatibility...')
    conversionAttempted = true

    try {
      // Use sharp library to convert to JPG
      const sharp = (await import('sharp')).default
      console.log('✓ Sharp library loaded successfully')

      const originalSize = mediaBuffer.length
      mediaBuffer = await sharp(mediaBuffer)
        .jpeg({ quality: 95 }) // High quality JPG
        .toBuffer()

      conversionSuccess = true
      console.log('✓ Image converted to JPEG successfully:', {
        originalFormat: contentType,
        originalSize: originalSize,
        newSize: mediaBuffer.length,
        originalSizeInMB: (originalSize / (1024 * 1024)).toFixed(2),
        newSizeInMB: (mediaBuffer.length / (1024 * 1024)).toFixed(2)
      })
    } catch (convertError: any) {
      console.error('❌ Image conversion failed:', {
        error: convertError.message,
        stack: convertError.stack,
        contentType: contentType
      })

      // Return error to user with helpful message
      return res.status(400).json({
        error: 'Image format conversion failed',
        details: `Failed to convert ${contentType} to JPEG: ${convertError.message}`,
        hint: 'Please upload a JPG/JPEG image directly, or try a different photo. HeyGen only accepts JPEG format.',
        technicalDetails: {
          originalFormat: contentType,
          convertError: convertError.message
        }
      })
    }
  } else {
    console.log('✓ Image is already in JPEG format:', contentType)
  }

  console.log('Final upload details:', {
    contentType: finalContentType,
    bufferSize: mediaBuffer.length,
    sizeInMB: (mediaBuffer.length / (1024 * 1024)).toFixed(2),
    conversionAttempted,
    conversionSuccess
  })

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

  console.log('HeyGen talking photo upload response (full):', JSON.stringify(data, null, 2))
  console.log('HeyGen talking photo uploaded:', {
    talking_photo_id: data.data?.talking_photo_id,
    photo_id: data.data?.photo_id,
    avatar_id: data.data?.avatar_id,
    id: data.data?.id,
    status: data.data?.status
  })

  const avatarId = data.data?.talking_photo_id || data.data?.photo_id || data.data?.avatar_id || data.data?.id

  if (!avatarId) {
    console.error('❌ No avatar ID found in HeyGen response!', data)
    return res.status(500).json({
      error: 'Avatar created but no ID returned',
      details: 'HeyGen API did not return an avatar ID',
      fullResponse: data
    })
  }

  console.log('✅ Avatar created successfully with ID:', avatarId)

  return res.status(200).json({
    success: true,
    avatarId,
    avatarName: data.data?.talking_photo_name || data.data?.photo_name || avatarName,
    status: data.data?.status || 'processing',
    message: 'Talking photo is being processed. This may take a few minutes.'
  })
}

// Get Avatar Status Handler (GET)
async function handleGetStatus(req: VercelRequest, res: VercelResponse) {
  // Accept any method - we've already determined this is a status check
  const { avatarId } = req.query

  if (!avatarId || typeof avatarId !== 'string') {
    return res.status(400).json({
      error: 'Missing required query parameter: avatarId'
    })
  }

  console.log('Checking HeyGen talking photo status:', { avatarId })

  // Use v2 API endpoint for getting talking photo status
  const apiUrl = `https://api.heygen.com/v2/talking_photo/${avatarId}`
  console.log('Status check URL:', apiUrl)

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      'Content-Type': 'application/json'
    }
  })

  console.log('Status check response:', {
    status: response.status,
    statusText: response.statusText
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen get status error:', {
      status: response.status,
      error
    })
    return res.status(response.status).json({
      error: 'Failed to get avatar status',
      details: error,
      hint: response.status === 404
        ? 'Avatar not found. It may have been deleted or the ID is incorrect.'
        : 'Check HeyGen API status and your API key'
    })
  }

  const data = await response.json()
  console.log('Status check data (full):', JSON.stringify(data, null, 2))

  return res.status(200).json({
    success: true,
    avatarId: data.data?.talking_photo_id || data.data?.photo_id || data.data?.avatar_id || avatarId,
    status: data.data?.status || 'unknown',
    thumbnailUrl: data.data?.thumbnail_url || data.data?.preview_image_url || data.data?.preview_url,
    videoUrl: data.data?.video_url
  })
}
