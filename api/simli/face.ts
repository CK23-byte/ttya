/**
 * Vercel Serverless Function: Simli Face Management
 *
 * Endpoint for creating Simli face IDs from uploaded photos.
 * Uses Simli API: POST https://api.simli.ai/generateFaceID
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

  try {
    return await handleCreateFace(req, res)
  } catch (error) {
    console.error('Simli face endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
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
  console.log('Simli generateFaceID response:', JSON.stringify(data, null, 2))

  const faceId = data.faceId || data.face_id || data.id
  if (!faceId) {
    console.error('No face ID in Simli response:', data)
    return res.status(500).json({
      error: 'Face created but no ID returned',
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
