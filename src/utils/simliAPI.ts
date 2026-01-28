/**
 * Simli API Integration
 *
 * Client-side wrapper for Simli avatar and streaming API calls.
 * Replaces HeyGen API for video avatar functionality.
 *
 * Note: Face generation is an asynchronous process that can take several hours.
 */

import { logger } from './logger'

export interface SimliFaceResponse {
  success: boolean
  faceId?: string
  faceName?: string
  processing?: boolean
  status?: string
  message?: string
  requestId?: string
}

export interface SimliFaceStatusResponse {
  success: boolean
  faceId: string
  status: string
  isReady: boolean
  isProcessing: boolean
  isFailed: boolean
  message: string
}

/**
 * Create a Simli face ID from a photo URL
 *
 * Note: Face creation can take several hours. The response may indicate
 * that the request is still processing, in which case you should poll
 * the status using checkSimliFaceStatus().
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

  // Handle 202 Accepted (processing) as a valid response
  if (response.status === 202) {
    const data = await response.json()
    logger.log('Simli face creation submitted (processing):', data)
    return data
  }

  if (!response.ok) {
    const error = await response.json()
    logger.error('Simli face creation error:', error)
    throw new Error(error.details || error.error || 'Failed to create face')
  }

  const data = await response.json()
  logger.log('Simli face created:', data)
  return data
}

/**
 * Check the status of a pending face creation
 *
 * Use this to poll for completion when createSimliFace returns a processing status.
 */
export async function checkSimliFaceStatus(
  faceId: string
): Promise<SimliFaceStatusResponse> {
  logger.log('Checking Simli face status...', { faceId })

  const response = await fetch('/api/simli/face?action=status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ faceId })
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Simli face status error:', error)
    throw new Error(error.details || error.error || 'Failed to check face status')
  }

  const data = await response.json()
  logger.log('Simli face status:', data)
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
