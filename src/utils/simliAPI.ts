/**
 * Simli API Client
 *
 * Utilities for interacting with Simli real-time avatar API
 * Single photo → Real-time interactive video with lip sync
 */

export interface SimliAvatarResponse {
  success: boolean
  avatarId: string
  avatarName: string
  photoUrl: string
  status: 'ready' | 'failed'
  message: string
}

export interface SimliSessionResponse {
  success: boolean
  sessionId: string
  faceId?: string // Custom Simli faceID if available
  photoUrl?: string // Fallback photo URL if no custom face
  voiceId?: string
  apiKey: string
  usingCustomFace: boolean // True if using custom uploaded face
  config: {
    maxDuration: number
    minCredits: number
  }
}

export interface SimliEndSessionResponse {
  success: boolean
  sessionId: string
  durationSeconds: number
  durationMinutes: number
  creditsUsed: number
  message: string
}

/**
 * Create a Simli avatar from a photo
 *
 * @param photoUrl - Supabase Storage URL of the photo
 * @param avatarName - Display name for the avatar
 * @param profileId - Profile ID this avatar belongs to
 * @param userId - User ID who owns this avatar
 * @returns Avatar creation result
 */
export async function createSimliAvatar(
  photoUrl: string,
  avatarName: string,
  profileId: string,
  userId: string
): Promise<SimliAvatarResponse> {
  const response = await fetch('/api/simli/conversation?action=avatar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      photoUrl,
      avatarName,
      profileId,
      userId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create Simli avatar')
  }

  return await response.json()
}

/**
 * Start a new Simli video session
 *
 * @param profileId - Profile ID for the session
 * @param userId - User ID starting the session
 * @param photoUrl - Photo URL for the avatar
 * @param voiceId - Optional ElevenLabs voice ID for voice cloning
 * @returns Session configuration
 */
export async function createSimliSession(
  profileId: string,
  userId: string,
  photoUrl: string,
  voiceId?: string
): Promise<SimliSessionResponse> {
  const response = await fetch('/api/simli/conversation?action=create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      profileId,
      userId,
      photoUrl,
      voiceId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create Simli session')
  }

  return await response.json()
}

/**
 * End a Simli video session
 *
 * @param sessionId - Session ID to end
 * @param durationSeconds - Total duration in seconds
 * @param userId - User ID who owns the session
 * @returns End session result with credit calculation
 */
export async function endSimliSession(
  sessionId: string,
  durationSeconds: number,
  userId: string
): Promise<SimliEndSessionResponse> {
  const response = await fetch('/api/simli/conversation?action=end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId,
      durationSeconds,
      userId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to end Simli session')
  }

  return await response.json()
}

/**
 * Validate photo for Simli avatar creation
 *
 * @param file - File object to validate
 * @returns Promise with validation result
 */
export async function validateAvatarPhoto(file: File): Promise<{ valid: boolean; error?: string }> {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, or WebP image.'
    }
  }

  // Check file size (max 10MB for photos)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB for photos.'
    }
  }

  // Check minimum dimensions (Simli works best with 512x512 or higher)
  const img = new Image()
  const imageUrl = URL.createObjectURL(file)

  return new Promise((resolve) => {
    img.onload = () => {
      URL.revokeObjectURL(imageUrl)

      if (img.width < 256 || img.height < 256) {
        resolve({
          valid: false,
          error: 'Image too small. Minimum resolution is 256x256 pixels.'
        })
      } else {
        resolve({ valid: true })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      resolve({
        valid: false,
        error: 'Failed to load image. Please try a different file.'
      })
    }

    img.src = imageUrl
  })
}

/**
 * Calculate estimated credits for call duration
 *
 * @param durationMinutes - Duration in minutes
 * @returns Estimated credits
 */
export function calculateSimliCredits(durationMinutes: number): number {
  if (durationMinutes <= 5) {
    return 1 // First 5 minutes = 1 credit
  }
  return 1 + (durationMinutes - 5) * 0.2 // Additional minutes = 0.2 credits each
}
