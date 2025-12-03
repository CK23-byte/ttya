/**
 * D-ID Avatar Video Generation Service
 * Handles avatar creation and talking head video generation
 */

const DID_API_KEY = import.meta.env.DID_API_KEY || ''
const DID_BASE_URL = 'https://api.d-id.com'

export interface CreatePresenterRequest {
  source_url: string
  driver_url?: string
}

export interface CreatePresenterResponse {
  id: string
  created_at: string
  source_url: string
  driver_url?: string
}

export interface CreateTalkRequest {
  source_url: string
  script: {
    type: 'audio' | 'text'
    audio_url?: string
    ssml?: boolean
    input?: string
    provider?: {
      type: 'elevenlabs' | 'microsoft' | 'amazon'
      voice_id?: string
      voice_config?: any
    }
  }
  config?: {
    fluent?: boolean
    pad_audio?: number
    stitch?: boolean
    align_driver?: boolean
    align_expand_factor?: number
    auto_match?: boolean
    motion_factor?: number
    normalization_factor?: number
    sharpen?: boolean
    logo?: {
      url: string
      position: [number, number]
    }
  }
  webhook?: string
}

export interface CreateTalkResponse {
  id: string
  created_at: string
  status: 'created' | 'started' | 'done' | 'error'
  result_url?: string
  error?: {
    description: string
    kind: string
  }
}

/**
 * Upload image to D-ID and create a presenter
 * The presenter can be reused for multiple talks
 */
export async function createPresenter(imageUrl: string): Promise<CreatePresenterResponse> {
  const response = await fetch(`${DID_BASE_URL}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(DID_API_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: imageUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`D-ID API error: ${error.description || response.statusText}`)
  }

  return response.json()
}

/**
 * Create a talking video using presenter and audio/text
 * This is the main function for generating avatar videos
 */
export async function createTalk(request: CreateTalkRequest): Promise<CreateTalkResponse> {
  const response = await fetch(`${DID_BASE_URL}/talks`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(DID_API_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`D-ID API error: ${error.description || response.statusText}`)
  }

  return response.json()
}

/**
 * Get the status of a talk (video generation job)
 * Poll this to check when video is ready
 */
export async function getTalkStatus(talkId: string): Promise<CreateTalkResponse> {
  const response = await fetch(`${DID_BASE_URL}/talks/${talkId}`, {
    headers: {
      'Authorization': `Basic ${btoa(DID_API_KEY)}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`D-ID API error: ${error.description || response.statusText}`)
  }

  return response.json()
}

/**
 * Delete a talk
 */
export async function deleteTalk(talkId: string): Promise<void> {
  const response = await fetch(`${DID_BASE_URL}/talks/${talkId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Basic ${btoa(DID_API_KEY)}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to delete talk')
  }
}

/**
 * Poll for talk completion
 * Waits until video is ready or timeout occurs
 */
export async function waitForTalkCompletion(
  talkId: string,
  maxWaitTimeMs: number = 60000,
  pollIntervalMs: number = 3000
): Promise<CreateTalkResponse> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitTimeMs) {
    const status = await getTalkStatus(talkId)

    if (status.status === 'done') {
      return status
    }

    if (status.status === 'error') {
      throw new Error(`Talk generation failed: ${status.error?.description}`)
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error('Talk generation timed out')
}

/**
 * Complete workflow: Generate avatar video from text + voice
 * Combines ElevenLabs audio with D-ID video generation
 */
export async function generateAvatarVideo(
  presenterImageUrl: string,
  audioUrl: string,
  elevenLabsVoiceId?: string
): Promise<string> {
  // Create the talk with audio
  const talkRequest: CreateTalkRequest = {
    source_url: presenterImageUrl,
    script: {
      type: 'audio',
      audio_url: audioUrl,
      ...(elevenLabsVoiceId && {
        provider: {
          type: 'elevenlabs',
          voice_id: elevenLabsVoiceId,
        },
      }),
    },
    config: {
      fluent: true,
      pad_audio: 0,
      stitch: true,
      align_driver: true,
      auto_match: true,
      motion_factor: 1.0,
      normalization_factor: 1.0,
    },
  }

  const talk = await createTalk(talkRequest)

  // Wait for completion
  const completed = await waitForTalkCompletion(talk.id)

  if (!completed.result_url) {
    throw new Error('No video URL in completed talk')
  }

  return completed.result_url
}

/**
 * Generate avatar video directly from text (uses D-ID's TTS)
 */
export async function generateAvatarVideoFromText(
  presenterImageUrl: string,
  text: string,
  voiceProvider: 'microsoft' | 'amazon' = 'microsoft',
  voiceId?: string
): Promise<string> {
  const talkRequest: CreateTalkRequest = {
    source_url: presenterImageUrl,
    script: {
      type: 'text',
      input: text,
      provider: {
        type: voiceProvider,
        voice_id: voiceId,
      },
    },
    config: {
      fluent: true,
      stitch: true,
    },
  }

  const talk = await createTalk(talkRequest)
  const completed = await waitForTalkCompletion(talk.id)

  if (!completed.result_url) {
    throw new Error('No video URL in completed talk')
  }

  return completed.result_url
}

/**
 * Get available credits
 */
export async function getCredits() {
  const response = await fetch(`${DID_BASE_URL}/credits`, {
    headers: {
      'Authorization': `Basic ${btoa(DID_API_KEY)}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch credits')
  }

  return response.json()
}
