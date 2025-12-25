/**
 * Vercel Serverless Function: HeyGen Streaming Management
 *
 * Consolidated endpoint for HeyGen streaming operations:
 * - create: Create new streaming session
 * - message: Send message to stream
 * - close: Close streaming session
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Get action from query parameter
  const { action } = req.query

  if (!HEYGEN_API_KEY) {
    return res.status(500).json({
      error: 'HeyGen API key not configured',
      hint: 'Set HEYGEN_API_KEY in Vercel environment variables'
    })
  }

  try {
    switch (action) {
      case 'create':
        return await handleCreateStream(req, res)
      case 'start':
        return await handleStartStream(req, res)
      case 'message':
        return await handleStreamMessage(req, res)
      case 'close':
        return await handleCloseStream(req, res)
      default:
        return res.status(400).json({ error: 'Invalid action. Use: create, start, message, or close' })
    }
  } catch (error) {
    console.error('HeyGen stream endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Create Stream Handler
async function handleCreateStream(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { avatarId, quality = 'medium' } = req.body

  if (!avatarId) {
    return res.status(400).json({
      error: 'Missing required field: avatarId'
    })
  }

  console.log('Creating HeyGen streaming session:', { avatarId, quality })

  const response = await fetch('https://api.heygen.com/v1/streaming.new', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      avatar_id: avatarId,
      quality
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen create stream error:', error)

    let errorMessage = 'Failed to create streaming session'
    try {
      const errorJson = JSON.parse(error)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch (e) {
      errorMessage = error || errorMessage
    }

    return res.status(response.status).json({
      error: errorMessage,
      details: error,
      hint: 'Check that avatarId is valid and HeyGen API key has streaming permissions'
    })
  }

  const data = await response.json()

  console.log('HeyGen streaming session created:', {
    sessionId: data.data?.session_id,
    hasOffer: !!data.data?.sdp?.sdp
  })

  return res.status(200).json({
    success: true,
    session_id: data.data?.session_id,
    offer: data.data?.sdp,
    ice_servers: data.data?.ice_servers2 || data.data?.ice_servers || [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  })
}

// Start Stream Handler
async function handleStartStream(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({
      error: 'Missing required field: sessionId'
    })
  }

  console.log('Starting HeyGen streaming session:', sessionId)

  const response = await fetch('https://api.heygen.com/v1/streaming.start', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_id: sessionId
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen start stream error:', error)

    let errorMessage = 'Failed to start streaming session'
    try {
      const errorJson = JSON.parse(error)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch (e) {
      errorMessage = error || errorMessage
    }

    return res.status(response.status).json({
      error: errorMessage,
      details: error
    })
  }

  const data = await response.json()

  console.log('HeyGen streaming session started successfully')

  return res.status(200).json({
    success: true,
    data
  })
}

// Stream Message Handler
async function handleStreamMessage(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId, text } = req.body

  if (!sessionId || !text) {
    return res.status(400).json({
      error: 'Missing required fields: sessionId, text'
    })
  }

  console.log('Sending message to HeyGen stream:', { sessionId, textLength: text.length })

  const response = await fetch('https://api.heygen.com/v1/streaming.task', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_id: sessionId,
      text
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen stream message error:', error)

    let errorMessage = 'Failed to send message to stream'
    try {
      const errorJson = JSON.parse(error)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch (e) {
      errorMessage = error || errorMessage
    }

    return res.status(response.status).json({
      error: errorMessage,
      details: error
    })
  }

  const data = await response.json()

  console.log('Message sent to HeyGen stream:', { taskId: data.data?.task_id })

  return res.status(200).json({
    success: true,
    taskId: data.data?.task_id,
    duration: data.data?.duration
  })
}

// Close Stream Handler
async function handleCloseStream(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({
      error: 'Missing required field: sessionId'
    })
  }

  console.log('Closing HeyGen streaming session:', sessionId)

  const response = await fetch('https://api.heygen.com/v1/streaming.stop', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_id: sessionId
    })
  })

  console.log('HeyGen API response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen API error:', error)

    let errorMessage = 'Failed to close session'
    try {
      const errorJson = JSON.parse(error)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch (e) {
      errorMessage = error || errorMessage
    }

    // Don't fail hard on close errors - session may already be closed
    console.warn('HeyGen close session warning:', errorMessage)
  }

  const heygenData = response.ok ? await response.json() : {}
  console.log('HeyGen streaming session closed:', heygenData)

  return res.status(200).json({
    success: true,
    message: 'Session closed successfully'
  })
}
