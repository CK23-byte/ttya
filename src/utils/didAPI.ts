/**
 * D-ID API Integration
 *
 * Wrapper for D-ID API calls for video avatar conversations
 * https://docs.d-id.com/reference/api-overview
 */

import { logger } from './logger'

export interface VideoGenerationOptions {
  sourceUrl?: string // URL to image/avatar
  script: string // What the avatar should say
  voice?: string // Voice ID (default: en-US-JennyNeural)
  provider?: string // TTS provider (default: microsoft)
}

export interface VideoStream {
  id: string
  status: 'created' | 'started' | 'done' | 'error'
  result_url?: string
  error?: string
}

/**
 * Create a D-ID video stream
 */
export async function createDIDVideo(
  options: VideoGenerationOptions
): Promise<VideoStream> {
  logger.log('Creating D-ID video...', {
    hasSourceUrl: !!options.sourceUrl,
    scriptLength: options.script.length
  })

  const response = await fetch('/api/did/create-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sourceUrl: options.sourceUrl,
      script: options.script,
      voice: options.voice || 'en-US-JennyNeural',
      provider: options.provider || 'microsoft',
    }),
  })

  logger.log('D-ID video creation response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('D-ID video creation error:', error)
    throw new Error(error.message || 'Failed to create video')
  }

  const data = await response.json()
  logger.log('D-ID video created:', { id: data.id, status: data.status })
  return data
}

/**
 * Get video status
 */
export async function getDIDVideoStatus(videoId: string): Promise<VideoStream> {
  const response = await fetch(`/api/did/video-status?id=${videoId}`)

  if (!response.ok) {
    throw new Error('Failed to get video status')
  }

  return response.json()
}

/**
 * Create a streaming talk session for real-time conversations
 */
export async function createDIDStreamingSession(
  sourceUrl: string
): Promise<{ id: string; session_id: string; offer: RTCSessionDescriptionInit }> {
  logger.log('Creating D-ID streaming session...', {
    sourceUrl: sourceUrl.substring(0, 50) + '...',
    endpoint: '/api/did/create-stream'
  })

  const response = await fetch('/api/did/create-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sourceUrl }),
  })

  logger.log('D-ID streaming session response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('D-ID streaming session error:', error)
    throw new Error(error.message || 'Failed to create streaming session')
  }

  const data = await response.json()
  logger.log('D-ID streaming session created:', {
    id: data.id,
    session_id: data.session_id,
    hasOffer: !!data.offer
  })
  return data
}

/**
 * Send message to streaming session
 */
export async function sendDIDStreamMessage(
  sessionId: string,
  message: string
): Promise<void> {
  logger.log('Sending D-ID stream message...', {
    sessionId,
    messageLength: message.length
  })

  const response = await fetch('/api/did/stream-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      message,
    }),
  })

  logger.log('D-ID stream message response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('D-ID stream message error:', error)
    throw new Error(error.message || 'Failed to send message')
  }

  logger.log('D-ID stream message sent successfully')
}

/**
 * Close streaming session
 */
export async function closeDIDStreamSession(sessionId: string): Promise<void> {
  logger.log('Closing D-ID streaming session:', sessionId)

  const response = await fetch('/api/did/close-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  })

  logger.log('D-ID close stream response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('D-ID close stream error:', error)
    // Don't throw error - closing is best effort
  } else {
    logger.log('D-ID stream closed successfully')
  }
}
