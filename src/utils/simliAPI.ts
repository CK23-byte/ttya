/**
 * Simli API Integration
 *
 * Client-side wrapper for Simli avatar and streaming API calls.
 * Replaces HeyGen API for video avatar functionality.
 */

import { logger } from './logger'

export interface SimliFaceResponse {
  success: boolean
  faceId: string
  faceName: string
}

/**
 * Create a Simli face ID from a photo URL
 */
export async function createSimliFace(
  photoUrl: string,
  faceName: string
): Promise<SimliFaceResponse> {
  logger.log('Creating Simli face...', { faceName, photoUrl: photoUrl.substring(0, 80) })

  const response = await fetch('/api/simli/face', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoUrl, faceName })
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Simli face creation error:', error)
    throw new Error(error.details || error.error || 'Failed to create face')
  }

  const data = await response.json()
  logger.log('Simli face created:', data)
  return data
}

export interface SimliSessionResponse {
  success: boolean
  sessionToken: string
  [key: string]: unknown
}

/**
 * Start a Simli audio-to-video streaming session
 */
export async function startSimliSession(
  faceId: string
): Promise<SimliSessionResponse> {
  logger.log('Starting Simli session...', { faceId })

  const response = await fetch('/api/simli/session?action=start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ faceId })
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Simli session error:', error)
    throw new Error(error.details || error.error || 'Failed to start session')
  }

  const data = await response.json()
  logger.log('Simli session started:', data)
  return data
}

export interface SimliIceServersResponse {
  success: boolean
  iceServers: RTCIceServer[]
}

/**
 * Get ICE servers for WebRTC connection
 */
export async function getSimliIceServers(): Promise<SimliIceServersResponse> {
  logger.log('Getting Simli ICE servers...')

  const response = await fetch('/api/simli/session?action=ice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Simli ICE servers error:', error)
    throw new Error(error.details || error.error || 'Failed to get ICE servers')
  }

  const data = await response.json()
  logger.log('Simli ICE servers:', data)
  return data
}
