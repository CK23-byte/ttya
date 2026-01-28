/**
 * Vercel Serverless Function: Simli API
 *
 * Consolidated endpoint for all Simli operations:
 * - face: Create face ID from photo (POST with action=face)
 * - start: Start audio-to-video session (POST with action=start)
 * - ice: Get ICE servers (POST with action=ice)
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

  const { action } = req.query

  try {
    switch (action) {
      case 'face':
        return await handleCreateFace(req, res)
      case 'start':
        return await handleStartSession(req, res)
      case 'ice':
        return await handleGetIceServers(res)
      default:
        return res.status(400).json({ error: 'Invalid action. Use: face, start, ice' })
    }
  } catch (error) {
    console.error('Simli endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// --- Face Creation ---

async function handleCreateFace(req: VercelRequest, res: VercelResponse) {
  const { photoUrl, faceName } = req.body

  if (!photoUrl || !faceName) {
    return res.status(400).json({
      error: 'Missing required fields: photoUrl, faceName'
    })
  }

  console.log('Creating Simli face:', { faceName, photoUrl: photoUrl.substring(0, 80) })

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

  const arrayBuffer = await fileData.arrayBuffer()

  // Build multipart form data manually to avoid type issues with form-data + fetch
  const boundary = '----SimliFormBoundary' + Date.now()
  const filename = `${faceName}.jpg`
  const contentType = fileData.type || 'image/jpeg'

  const header = `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`
  const footer = `\r\n--${boundary}--\r\n`

  const headerBytes = new TextEncoder().encode(header)
  const footerBytes = new TextEncoder().encode(footer)
  const fileBytes = new Uint8Array(arrayBuffer)

  // Combine into single Uint8Array
  const body = new Uint8Array(headerBytes.length + fileBytes.length + footerBytes.length)
  body.set(headerBytes, 0)
  body.set(fileBytes, headerBytes.length)
  body.set(footerBytes, headerBytes.length + fileBytes.length)

  console.log('Uploading to Simli generateFaceID...')
  const response = await fetch(`https://api.simli.ai/generateFaceID?face_name=${encodeURIComponent(faceName)}`, {
    method: 'POST',
    headers: {
      'api-key': SIMLI_API_KEY!,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: body
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

// --- Session Management ---

async function handleStartSession(req: VercelRequest, res: VercelResponse) {
  const { faceId } = req.body

  if (!faceId) {
    return res.status(400).json({ error: 'Missing required field: faceId' })
  }

  console.log('Creating Simli audio-to-video session:', { faceId })

  const response = await fetch('https://api.simli.ai/startAudioToVideoSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      faceId,
      apiKey: SIMLI_API_KEY!,
      handleSilence: true,
      maxSessionLength: 3600,
      maxIdleTime: 300,
      syncAudio: true,
      audioInputFormat: 'pcm16'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Simli startAudioToVideoSession error:', { status: response.status, error: errorText })
    return res.status(response.status).json({
      error: 'Failed to create streaming session',
      details: errorText,
      hint: 'Check that faceId is valid and Simli API key has permissions'
    })
  }

  const data = await response.json()
  console.log('Simli session created:', data)

  return res.status(200).json({
    success: true,
    sessionToken: data.session_token || data.sessionToken,
    ...data
  })
}

async function handleGetIceServers(res: VercelResponse) {
  console.log('Getting Simli ICE servers...')

  const response = await fetch('https://api.simli.ai/getIceServers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: SIMLI_API_KEY! })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Simli getIceServers error:', { status: response.status, error: errorText })
    return res.status(response.status).json({
      error: 'Failed to get ICE servers',
      details: errorText
    })
  }

  const data = await response.json()
  console.log('ICE servers retrieved:', data)

  return res.status(200).json({
    success: true,
    iceServers: data.iceServers || data.ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }]
  })
}
