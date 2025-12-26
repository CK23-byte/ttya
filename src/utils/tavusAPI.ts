/**
 * Tavus API Integration
 *
 * Wrapper for Tavus API calls for real-time video conversations
 * https://docs.tavus.io/
 */

import { logger } from './logger'

// ============================================================================
// Types
// ============================================================================

export interface TavusReplicaResponse {
  replicaId: string
  status: 'training' | 'ready' | 'failed'
  estimatedCompletionTime?: string
}

export interface TavusPersonaResponse {
  personaId: string
  status: 'ready' | 'failed'
}

export interface TavusConversationResponse {
  conversationId: string
  conversationUrl: string
  expiresAt?: string
}

export interface TavusReplicaStatus {
  replicaId: string
  status: 'training' | 'ready' | 'failed'
  progress?: number
  errorMessage?: string
}

// ============================================================================
// Replica Management
// ============================================================================

/**
 * Create a Tavus replica (digital twin) from training video
 */
export async function createTavusReplica(
  videoUrl: string,
  replicaName: string,
  profileId: string,
  consentVideoUrl?: string,
  modelName: string = 'phoenix-3'
): Promise<TavusReplicaResponse> {
  logger.log('Creating Tavus replica...', {
    replicaName,
    profileId,
    modelName,
    hasConsentVideo: !!consentVideoUrl
  })

  const response = await fetch('/api/tavus/replica?action=create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      videoUrl,
      consentVideoUrl,
      replicaName,
      profileId,
      modelName
    }),
  })

  logger.log('Tavus replica creation response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('Tavus replica creation error:', error)
    throw new Error(error.details || error.message || 'Failed to create replica')
  }

  const data = await response.json()
  logger.log('Tavus replica created:', {
    replicaId: data.replicaId,
    status: data.status
  })

  return data
}

/**
 * Check replica training status
 */
export async function getTavusReplicaStatus(
  replicaId: string
): Promise<TavusReplicaStatus> {
  logger.log('Checking Tavus replica status:', replicaId)

  const response = await fetch(`/api/tavus/replica?replicaId=${replicaId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  logger.log('Tavus replica status response:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('Tavus replica status error:', error)
    throw new Error(error.message || 'Failed to get replica status')
  }

  const data = await response.json()
  logger.log('Tavus replica status:', data)

  return data
}

// ============================================================================
// Persona Management
// ============================================================================

/**
 * Create a Tavus persona for the replica
 */
export async function createTavusPersona(
  replicaId: string,
  personaName: string,
  profileId: string,
  options: {
    systemPrompt: string
    conversationalContext?: {
      memories?: string[]
      personality?: string[]
    }
    voiceId?: string
    llmConfig?: {
      provider: 'openai' | 'anthropic' | 'custom'
      model: string
      temperature?: number
    }
  }
): Promise<TavusPersonaResponse> {
  logger.log('Creating Tavus persona...', {
    replicaId,
    personaName,
    profileId,
    hasVoiceId: !!options.voiceId
  })

  const response = await fetch('/api/tavus/persona?action=create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      replicaId,
      personaName,
      profileId,
      ...options
    }),
  })

  logger.log('Tavus persona creation response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('Tavus persona creation error:', error)
    throw new Error(error.details || error.message || 'Failed to create persona')
  }

  const data = await response.json()
  logger.log('Tavus persona created:', {
    personaId: data.personaId,
    status: data.status
  })

  return data
}

// ============================================================================
// Conversation Management
// ============================================================================

/**
 * Start a real-time video conversation
 */
export async function createTavusConversation(
  profileId: string,
  conversationName?: string
): Promise<TavusConversationResponse> {
  logger.log('Creating Tavus conversation...', {
    profileId,
    conversationName
  })

  const response = await fetch('/api/tavus/conversation?action=create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profileId,
      conversationName: conversationName || `Video call at ${new Date().toLocaleString()}`
    }),
  })

  logger.log('Tavus conversation creation response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('Tavus conversation creation error:', error)
    throw new Error(error.details || error.message || 'Failed to create conversation')
  }

  const data = await response.json()
  logger.log('Tavus conversation created:', {
    conversationId: data.conversationId,
    conversationUrl: data.conversationUrl
  })

  return data
}

/**
 * End a conversation and record usage
 */
export async function endTavusConversation(
  conversationId: string,
  durationSeconds: number
): Promise<void> {
  logger.log('Ending Tavus conversation...', {
    conversationId,
    durationSeconds
  })

  const response = await fetch('/api/tavus/conversation?action=end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId,
      durationSeconds
    }),
  })

  logger.log('Tavus conversation end response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    logger.error('Tavus conversation end error:', error)
    // Don't throw - ending is best effort
    logger.warn('Failed to end conversation properly, but continuing...')
  } else {
    logger.log('Tavus conversation ended successfully')
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Poll replica status until ready or failed
 */
export async function waitForReplicaReady(
  replicaId: string,
  maxAttempts: number = 180, // 30 minutes with 10s intervals
  intervalMs: number = 10000
): Promise<TavusReplicaStatus> {
  logger.log('Waiting for replica to be ready...', { replicaId, maxAttempts })

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getTavusReplicaStatus(replicaId)

    if (status.status === 'ready') {
      logger.log('Replica is ready!', { replicaId, attempts: attempt + 1 })
      return status
    }

    if (status.status === 'failed') {
      logger.error('Replica training failed', { replicaId, errorMessage: status.errorMessage })
      throw new Error(status.errorMessage || 'Replica training failed')
    }

    // Still training, wait and retry
    logger.log(`Replica still training... (attempt ${attempt + 1}/${maxAttempts})`, {
      progress: status.progress
    })

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timeout waiting for replica to be ready')
}

/**
 * Estimate replica creation time based on video duration
 */
export function estimateReplicaCreationTime(videoDurationSeconds: number): string {
  // Tavus typically takes 10-30 minutes regardless of video length
  // But longer videos may take longer
  if (videoDurationSeconds < 180) { // < 3 minutes
    return '10-15 minutes'
  } else if (videoDurationSeconds < 300) { // < 5 minutes
    return '15-20 minutes'
  } else {
    return '20-30 minutes'
  }
}

/**
 * Calculate credits needed for conversation
 */
export function calculateConversationCredits(durationMinutes: number): number {
  // Tavus pricing: 1 minute = 6.5 interactions = 0.2 credits
  // Minimum 5 minutes charged
  const billableMinutes = Math.max(5, Math.ceil(durationMinutes))
  return billableMinutes * 0.2
}

/**
 * Validate video file for replica training
 */
export function validateTrainingVideo(file: File): {
  valid: boolean
  error?: string
} {
  // Check file type
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload MP4, WebM, or MOV.'
    }
  }

  // Check file size (max 500MB)
  const maxSize = 500 * 1024 * 1024 // 500MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 500MB.'
    }
  }

  // Min size check (should be at least 2 minutes of video ~10MB)
  const minSize = 10 * 1024 * 1024 // 10MB
  if (file.size < minSize) {
    return {
      valid: false,
      error: 'File too small. Video should be at least 2 minutes long.'
    }
  }

  return { valid: true }
}
