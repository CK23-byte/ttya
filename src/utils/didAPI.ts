/**
 * D-ID API Integration
 *
 * Wrapper for D-ID API calls for video avatar conversations
 * https://docs.d-id.com/reference/api-overview
 */

export interface DIDConfig {
  apiKey: string
  baseURL?: string
}

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

const DEFAULT_BASE_URL = 'https://api.d-id.com'

/**
 * Create a D-ID video stream
 */
export async function createDIDVideo(
  options: VideoGenerationOptions,
  config: DIDConfig
): Promise<VideoStream> {
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

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create video')
  }

  return response.json()
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
  const response = await fetch('/api/did/create-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sourceUrl }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create streaming session')
  }

  return response.json()
}

/**
 * Send message to streaming session
 */
export async function sendDIDStreamMessage(
  sessionId: string,
  message: string
): Promise<void> {
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

  if (!response.ok) {
    throw new Error('Failed to send message')
  }
}

/**
 * Close streaming session
 */
export async function closeDIDStreamSession(sessionId: string): Promise<void> {
  await fetch('/api/did/close-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  })
}
