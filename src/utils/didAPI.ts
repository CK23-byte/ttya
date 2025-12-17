/**
import { logger } from '../utils/logger'
 * D-ID API Integration
import { logger } from '../utils/logger'
 *
import { logger } from '../utils/logger'
 * Wrapper for D-ID API calls for video avatar conversations
import { logger } from '../utils/logger'
 * https://docs.d-id.com/reference/api-overview
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
export interface VideoGenerationOptions {
import { logger } from '../utils/logger'
  sourceUrl?: string // URL to image/avatar
import { logger } from '../utils/logger'
  script: string // What the avatar should say
import { logger } from '../utils/logger'
  voice?: string // Voice ID (default: en-US-JennyNeural)
import { logger } from '../utils/logger'
  provider?: string // TTS provider (default: microsoft)
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
export interface VideoStream {
import { logger } from '../utils/logger'
  id: string
import { logger } from '../utils/logger'
  status: 'created' | 'started' | 'done' | 'error'
import { logger } from '../utils/logger'
  result_url?: string
import { logger } from '../utils/logger'
  error?: string
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
/**
import { logger } from '../utils/logger'
 * Create a D-ID video stream
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'
export async function createDIDVideo(
import { logger } from '../utils/logger'
  options: VideoGenerationOptions
import { logger } from '../utils/logger'
): Promise<VideoStream> {
import { logger } from '../utils/logger'
  logger.log('Creating D-ID video...', {
import { logger } from '../utils/logger'
    hasSourceUrl: !!options.sourceUrl,
import { logger } from '../utils/logger'
    scriptLength: options.script.length
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const response = await fetch('/api/did/create-video', {
import { logger } from '../utils/logger'
    method: 'POST',
import { logger } from '../utils/logger'
    headers: {
import { logger } from '../utils/logger'
      'Content-Type': 'application/json',
import { logger } from '../utils/logger'
    },
import { logger } from '../utils/logger'
    body: JSON.stringify({
import { logger } from '../utils/logger'
      sourceUrl: options.sourceUrl,
import { logger } from '../utils/logger'
      script: options.script,
import { logger } from '../utils/logger'
      voice: options.voice || 'en-US-JennyNeural',
import { logger } from '../utils/logger'
      provider: options.provider || 'microsoft',
import { logger } from '../utils/logger'
    }),
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  logger.log('D-ID video creation response status:', response.status)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  if (!response.ok) {
import { logger } from '../utils/logger'
    const error = await response.json()
import { logger } from '../utils/logger'
    logger.error('D-ID video creation error:', error)
import { logger } from '../utils/logger'
    throw new Error(error.message || 'Failed to create video')
import { logger } from '../utils/logger'
  }
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const data = await response.json()
import { logger } from '../utils/logger'
  logger.log('D-ID video created:', { id: data.id, status: data.status })
import { logger } from '../utils/logger'
  return data
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
/**
import { logger } from '../utils/logger'
 * Get video status
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'
export async function getDIDVideoStatus(videoId: string): Promise<VideoStream> {
import { logger } from '../utils/logger'
  const response = await fetch(`/api/did/video-status?id=${videoId}`)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  if (!response.ok) {
import { logger } from '../utils/logger'
    throw new Error('Failed to get video status')
import { logger } from '../utils/logger'
  }
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  return response.json()
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
/**
import { logger } from '../utils/logger'
 * Create a streaming talk session for real-time conversations
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'
export async function createDIDStreamingSession(
import { logger } from '../utils/logger'
  sourceUrl: string
import { logger } from '../utils/logger'
): Promise<{ id: string; session_id: string; offer: RTCSessionDescriptionInit }> {
import { logger } from '../utils/logger'
  logger.log('Creating D-ID streaming session...', {
import { logger } from '../utils/logger'
    sourceUrl: sourceUrl.substring(0, 50) + '...',
import { logger } from '../utils/logger'
    endpoint: '/api/did/create-stream'
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const response = await fetch('/api/did/create-stream', {
import { logger } from '../utils/logger'
    method: 'POST',
import { logger } from '../utils/logger'
    headers: {
import { logger } from '../utils/logger'
      'Content-Type': 'application/json',
import { logger } from '../utils/logger'
    },
import { logger } from '../utils/logger'
    body: JSON.stringify({ sourceUrl }),
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  logger.log('D-ID streaming session response status:', response.status)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  if (!response.ok) {
import { logger } from '../utils/logger'
    const error = await response.json()
import { logger } from '../utils/logger'
    logger.error('D-ID streaming session error:', error)
import { logger } from '../utils/logger'
    throw new Error(error.message || 'Failed to create streaming session')
import { logger } from '../utils/logger'
  }
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const data = await response.json()
import { logger } from '../utils/logger'
  logger.log('D-ID streaming session created:', {
import { logger } from '../utils/logger'
    id: data.id,
import { logger } from '../utils/logger'
    session_id: data.session_id,
import { logger } from '../utils/logger'
    hasOffer: !!data.offer
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'
  return data
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
/**
import { logger } from '../utils/logger'
 * Send message to streaming session
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'
export async function sendDIDStreamMessage(
import { logger } from '../utils/logger'
  sessionId: string,
import { logger } from '../utils/logger'
  message: string
import { logger } from '../utils/logger'
): Promise<void> {
import { logger } from '../utils/logger'
  logger.log('Sending D-ID stream message...', {
import { logger } from '../utils/logger'
    sessionId,
import { logger } from '../utils/logger'
    messageLength: message.length
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const response = await fetch('/api/did/stream-message', {
import { logger } from '../utils/logger'
    method: 'POST',
import { logger } from '../utils/logger'
    headers: {
import { logger } from '../utils/logger'
      'Content-Type': 'application/json',
import { logger } from '../utils/logger'
    },
import { logger } from '../utils/logger'
    body: JSON.stringify({
import { logger } from '../utils/logger'
      sessionId,
import { logger } from '../utils/logger'
      message,
import { logger } from '../utils/logger'
    }),
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  logger.log('D-ID stream message response status:', response.status)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  if (!response.ok) {
import { logger } from '../utils/logger'
    const error = await response.json()
import { logger } from '../utils/logger'
    logger.error('D-ID stream message error:', error)
import { logger } from '../utils/logger'
    throw new Error(error.message || 'Failed to send message')
import { logger } from '../utils/logger'
  }
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  logger.log('D-ID stream message sent successfully')
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
/**
import { logger } from '../utils/logger'
 * Close streaming session
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'
export async function closeDIDStreamSession(sessionId: string): Promise<void> {
import { logger } from '../utils/logger'
  logger.log('Closing D-ID streaming session:', sessionId)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const response = await fetch('/api/did/close-stream', {
import { logger } from '../utils/logger'
    method: 'POST',
import { logger } from '../utils/logger'
    headers: {
import { logger } from '../utils/logger'
      'Content-Type': 'application/json',
import { logger } from '../utils/logger'
    },
import { logger } from '../utils/logger'
    body: JSON.stringify({ sessionId }),
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  logger.log('D-ID close stream response status:', response.status)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  if (!response.ok) {
import { logger } from '../utils/logger'
    const error = await response.json()
import { logger } from '../utils/logger'
    logger.error('D-ID close stream error:', error)
import { logger } from '../utils/logger'
    // Don't throw error - closing is best effort
import { logger } from '../utils/logger'
  } else {
import { logger } from '../utils/logger'
    logger.log('D-ID stream closed successfully')
import { logger } from '../utils/logger'
  }
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'
