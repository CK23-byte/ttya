/**
 * Vercel Serverless Function: Simli Face Management
 *
 * Endpoints:
 * - POST /api/simli/face - Create a Simli face ID from uploaded photo
 * - POST /api/simli/face?action=status - Check status of pending face creation
 *
 * Uses Simli API:
 * - POST https://api.simli.ai/generateFaceID
 * - POST https://api.simli.ai/getRequestStatus
 *
 * Note: Face generation is an asynchronous process that can take several hours.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SIMLI_API_KEY = process.env.SIMLI_API_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SIMLI_API_KEY) {
    return res.status(500).json({
      error: 'Simli API key not configured',
      hint: 'Set SIMLI_API_KEY in Vercel environment variables'
    })
  }

  const action = req.query.action as string

  try {
    if (action === 'status') {
      return await handleCheckStatus(req, res)
    }
    return await handleCreateFace(req, res)
  } catch (error) {
    console.error('Simli face endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Check the status of a pending face creation request
 */
async function handleCheckStatus(req: VercelRequest, res: VercelResponse) {
  const { faceId } = req.body

  if (!faceId) {
    return res.status(400).json({
      error: 'Missing required field: faceId'
    })
  }

  console.log('Checking Simli face status for:', faceId)

  const response = await fetch(`https://api.simli.ai/getRequestStatus?face_id=${encodeURIComponent(faceId)}`, {
    method: 'POST',
    headers: {
      'api-key': SIMLI_API_KEY!,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Simli getRequestStatus error:', { status: response.status, error: errorText })
    return res.status(response.status).json({
      error: 'Failed to check face status',
      details: errorText
    })
  }

  const data = await response.json()
  console.log('Simli getRequestStatus response:', JSON.stringify(data, null, 2))

  // Determine if the face is ready
  const isReady = data.status === 'completed' || data.status === 'ready' || data.state === 'completed'
  const isProcessing = data.status === 'processing' || data.status === 'pending' || data.state === 'processing'
  const isFailed = data.status === 'failed' || data.status === 'error' || data.state === 'failed'

  return res.status(200).json({
    success: true,
    faceId,
    status: data.status || data.state || 'unknown',
    isReady,
    isProcessing,
    isFailed,
    message: isReady
      ? 'Face is ready for use'
      : isProcessing
        ? 'Face is still being processed. This can take several hours.'
        : isFailed
          ? 'Face creation failed'
          : 'Unknown status',
    fullResponse: data
  })
}

async function handleCreateFace(req: VercelRequest, res: VercelResponse) {
  const { photoUrl, faceName } = req.body

  if (!photoUrl || !faceName) {
    return res.status(400).json({
      error: 'Missing required fields: photoUrl, faceName'
    })
  }

  console.log('Creating Simli face:', { faceName, photoUrl: photoUrl.substring(0, 80) })

  // Download photo from Supabase Storage
  const urlParts = photoUrl.split('/storage/v1/object/public/')
  if (urlParts.length < 2) {
    return res.status(400).json({
      error: 'Invalid storage URL format',
      hint: 'URL should be from Supabase Storage'
    })
  }

  if (!supabase) {
    return res.status(500).json({
      error: 'Supabase not configured',
      hint: 'Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables'
    })
  }

  const storagePath = urlParts[1]
  const pathParts = storagePath.split('/')
  const bucket = pathParts[0]
  const filePath = pathParts.slice(1).join('/')

  console.log('Downloading photo from Supabase Storage:', { bucket, filePath: filePath.substring(0, 80) })

  const { data: fileData, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(filePath)

  if (downloadError || !fileData) {
    console.error('Failed to download from Supabase Storage:', downloadError)
    return res.status(400).json({
      error: 'Failed to download photo from storage',
      details: downloadError?.message || 'Unknown error'
    })
  }

  console.log('Photo downloaded:', { size: fileData.size, type: fileData.type })

  // Convert to buffer
  const buffer = Buffer.from(await fileData.arrayBuffer() as ArrayBuffer)

  // Upload to Simli generateFaceID as multipart form data
  const FormData = (await import('form-data')).default
  const formData = new FormData()
  formData.append('image', buffer, {
    filename: `${faceName}.jpg`,
    contentType: fileData.type || 'image/jpeg'
  })

  console.log('Uploading to Simli generateFaceID...')
  const response = await fetch(`https://api.simli.ai/generateFaceID?face_name=${encodeURIComponent(faceName)}`, {
    method: 'POST',
    headers: {
      'api-key': SIMLI_API_KEY!,
      ...formData.getHeaders()
    },
    body: formData.getBuffer()
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Simli generateFaceID error:', { status: response.status, error: errorText })

    let hint = 'Check that your photo meets requirements: clear frontal face, good lighting, neutral expression'
    if (response.status === 401 || response.status === 403) {
      hint = 'Invalid or unauthorized Simli API key. Check SIMLI_API_KEY environment variable.'
    } else if (response.status === 422) {
      hint = 'Photo validation failed. Ensure: clear frontal face visible, good lighting, no obstructions, high resolution image.'
    }

    return res.status(response.status).json({
      error: 'Failed to create face',
      details: errorText,
      hint
    })
  }

  const data = await response.json()
  console.log('Simli generateFaceID raw response:', JSON.stringify(data, null, 2))

  // Try various field names that Simli might use for the face ID
  const faceId = data.faceId || data.face_id || data.id || data.faceID || data.request_id

  // Check if the response indicates the request is being processed asynchronously
  const isProcessing = data.status === 'processing' || data.status === 'pending' || data.state === 'processing'

  if (!faceId && !isProcessing) {
    console.error('No face ID in Simli response. Available fields:', Object.keys(data))
    return res.status(500).json({
      error: 'Face created but no ID returned',
      hint: 'The Simli API response did not contain a face ID in expected fields (faceId, face_id, id, faceID, request_id)',
      availableFields: Object.keys(data),
      fullResponse: data
    })
  }

  // If still processing, return appropriate status
  if (isProcessing && !faceId) {
    console.log('Face creation is processing asynchronously')
    return res.status(202).json({
      success: true,
      processing: true,
      status: data.status || data.state || 'processing',
      message: 'Face creation has been submitted and is being processed. This can take several hours.',
      requestId: data.request_id || data.id,
      fullResponse: data
    })
  }

  console.log('Face created successfully with ID:', faceId)

  return res.status(200).json({
    success: true,
    faceId,
    faceName: data.face_name || faceName
  })
}
