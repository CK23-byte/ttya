/**
import { logger } from '../utils/logger'
 * HeyGen API Integration
import { logger } from '../utils/logger'
 *
import { logger } from '../utils/logger'
 * Wrapper for HeyGen Interactive Avatar API calls for video conversations
import { logger } from '../utils/logger'
 * https://docs.heygen.com/docs/interactive-avatar-api
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
export interface VideoGenerationOptions {
import { logger } from '../utils/logger'
  sourceUrl?: string // URL to image/avatar or avatar_id
import { logger } from '../utils/logger'
  script: string // What the avatar should say
import { logger } from '../utils/logger'
  voice?: string // Voice ID
import { logger } from '../utils/logger'
  avatarId?: string // HeyGen avatar ID (alternative to sourceUrl)
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
export interface StreamingSessionResponse {
import { logger } from '../utils/logger'
  id: string
import { logger } from '../utils/logger'
  session_id: string
import { logger } from '../utils/logger'
  offer: RTCSessionDescriptionInit
import { logger } from '../utils/logger'
  ice_servers?: RTCIceServer[]
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
/**
import { logger } from '../utils/logger'
 * Create a HeyGen Interactive Avatar streaming session for real-time conversations
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'
export async function createHeyGenStreamingSession(
import { logger } from '../utils/logger'
  avatarId: string,
import { logger } from '../utils/logger'
  quality: 'low' | 'medium' | 'high' = 'medium'
import { logger } from '../utils/logger'
): Promise<StreamingSessionResponse> {
import { logger } from '../utils/logger'
  logger.log('Creating HeyGen streaming session...', {
import { logger } from '../utils/logger'
    avatarId,
import { logger } from '../utils/logger'
    quality,
import { logger } from '../utils/logger'
    endpoint: '/api/heygen/create-stream'
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const response = await fetch('/api/heygen/stream?action=create', {
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
      avatarId,
import { logger } from '../utils/logger'
      quality
import { logger } from '../utils/logger'
    }),
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  logger.log('HeyGen streaming session response status:', response.status)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  if (!response.ok) {
import { logger } from '../utils/logger'
    const error = await response.json()
import { logger } from '../utils/logger'
    logger.error('HeyGen streaming session error:', error)
import { logger } from '../utils/logger'
    logger.error('Full error details:', {
import { logger } from '../utils/logger'
      status: response.status,
import { logger } from '../utils/logger'
      error: error.error,
import { logger } from '../utils/logger'
      details: error.details,
import { logger } from '../utils/logger'
      hint: error.hint,
import { logger } from '../utils/logger'
      message: error.message
import { logger } from '../utils/logger'
    })
import { logger } from '../utils/logger'
    throw new Error(error.details || error.message || 'Failed to create streaming session')
import { logger } from '../utils/logger'
  }
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const data = await response.json()
import { logger } from '../utils/logger'
  logger.log('HeyGen streaming session created:', {
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
 * Send message to HeyGen streaming session
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'
export async function sendHeyGenStreamMessage(
import { logger } from '../utils/logger'
  sessionId: string,
import { logger } from '../utils/logger'
  message: string,
import { logger } from '../utils/logger'
  task_type: 'repeat' | 'talk' = 'talk'
import { logger } from '../utils/logger'
): Promise<void> {
import { logger } from '../utils/logger'
  logger.log('Sending HeyGen stream message...', {
import { logger } from '../utils/logger'
    sessionId,
import { logger } from '../utils/logger'
    messageLength: message.length,
import { logger } from '../utils/logger'
    task_type
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const response = await fetch('/api/heygen/stream?action=message', {
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
      text: message,
import { logger } from '../utils/logger'
      task_type
import { logger } from '../utils/logger'
    }),
import { logger } from '../utils/logger'
  })
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  logger.log('HeyGen stream message response status:', response.status)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  if (!response.ok) {
import { logger } from '../utils/logger'
    const error = await response.json()
import { logger } from '../utils/logger'
    logger.error('HeyGen stream message error:', error)
import { logger } from '../utils/logger'
    throw new Error(error.message || 'Failed to send message')
import { logger } from '../utils/logger'
  }
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  logger.log('HeyGen stream message sent successfully')
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
/**
import { logger } from '../utils/logger'
 * Close HeyGen streaming session
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'
export async function closeHeyGenStreamSession(sessionId: string): Promise<void> {
import { logger } from '../utils/logger'
  logger.log('Closing HeyGen streaming session:', sessionId)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  const response = await fetch('/api/heygen/stream?action=close', {
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
  logger.log('HeyGen close stream response status:', response.status)
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
  if (!response.ok) {
import { logger } from '../utils/logger'
    const error = await response.json()
import { logger } from '../utils/logger'
    logger.error('HeyGen close stream error:', error)
import { logger } from '../utils/logger'
    // Don't throw error - closing is best effort
import { logger } from '../utils/logger'
  } else {
import { logger } from '../utils/logger'
    logger.log('HeyGen stream closed successfully')
import { logger } from '../utils/logger'
  }
import { logger } from '../utils/logger'
}
import { logger } from '../utils/logger'
