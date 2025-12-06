/**
 * HeyGen API Integration
 *
 * Wrapper for HeyGen Interactive Avatar API calls for video conversations
 * https://docs.heygen.com/docs/interactive-avatar-api
 */

export interface VideoGenerationOptions {
  sourceUrl?: string // URL to image/avatar or avatar_id
  script: string // What the avatar should say
  voice?: string // Voice ID
  avatarId?: string // HeyGen avatar ID (alternative to sourceUrl)
}

export interface VideoStream {
  id: string
  status: 'created' | 'started' | 'done' | 'error'
  result_url?: string
  error?: string
}

export interface StreamingSessionResponse {
  id: string
  session_id: string
  offer: RTCSessionDescriptionInit
  ice_servers?: RTCIceServer[]
}

/**
 * Create a HeyGen Interactive Avatar streaming session for real-time conversations
 */
export async function createHeyGenStreamingSession(
  avatarId: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<StreamingSessionResponse> {
  console.log('Creating HeyGen streaming session...', {
    avatarId,
    quality,
    endpoint: '/api/heygen/create-stream'
  })

  const response = await fetch('/api/heygen/create-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      avatarId,
      quality
    }),
  })

  console.log('HeyGen streaming session response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    console.error('HeyGen streaming session error:', error)
    throw new Error(error.message || 'Failed to create streaming session')
  }

  const data = await response.json()
  console.log('HeyGen streaming session created:', {
    id: data.id,
    session_id: data.session_id,
    hasOffer: !!data.offer
  })
  return data
}

/**
 * Send message to HeyGen streaming session
 */
export async function sendHeyGenStreamMessage(
  sessionId: string,
  message: string,
  task_type: 'repeat' | 'talk' = 'talk'
): Promise<void> {
  console.log('Sending HeyGen stream message...', {
    sessionId,
    messageLength: message.length,
    task_type
  })

  const response = await fetch('/api/heygen/stream-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      message,
      task_type
    }),
  })

  console.log('HeyGen stream message response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    console.error('HeyGen stream message error:', error)
    throw new Error(error.message || 'Failed to send message')
  }

  console.log('HeyGen stream message sent successfully')
}

/**
 * Close HeyGen streaming session
 */
export async function closeHeyGenStreamSession(sessionId: string): Promise<void> {
  console.log('Closing HeyGen streaming session:', sessionId)

  const response = await fetch('/api/heygen/close-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  })

  console.log('HeyGen close stream response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    console.error('HeyGen close stream error:', error)
    // Don't throw error - closing is best effort
  } else {
    console.log('HeyGen stream closed successfully')
  }
}

/**
 * Start avatar speaking in streaming session
 */
export async function startHeyGenAvatarSpeaking(
  sessionId: string
): Promise<void> {
  console.log('Starting HeyGen avatar speaking:', sessionId)

  const response = await fetch('/api/heygen/start-speaking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('HeyGen start speaking error:', error)
    throw new Error(error.message || 'Failed to start avatar speaking')
  }

  console.log('HeyGen avatar started speaking successfully')
}

/**
 * Stop avatar speaking in streaming session
 */
export async function stopHeyGenAvatarSpeaking(
  sessionId: string
): Promise<void> {
  console.log('Stopping HeyGen avatar speaking:', sessionId)

  const response = await fetch('/api/heygen/stop-speaking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('HeyGen stop speaking error:', error)
    // Don't throw - stopping is best effort
  } else {
    console.log('HeyGen avatar stopped speaking successfully')
  }
}
