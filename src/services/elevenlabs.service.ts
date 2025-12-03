/**
 * ElevenLabs Voice Cloning Service
 * Handles voice cloning and text-to-speech generation
 */

const ELEVENLABS_API_KEY = import.meta.env.ELEVENLABS_API_KEY || ''
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

export interface VoiceCloneRequest {
  name: string
  description?: string
  files: File[]
  labels?: Record<string, string>
}

export interface VoiceCloneResponse {
  voice_id: string
  name: string
  samples: Array<{
    sample_id: string
    file_name: string
    mime_type: string
    size_bytes: number
  }>
}

export interface TextToSpeechRequest {
  text: string
  voice_id: string
  model_id?: string
  voice_settings?: {
    stability?: number
    similarity_boost?: number
    style?: number
    use_speaker_boost?: boolean
  }
}

/**
 * Clone a voice from audio samples
 * Requires at least 1 minute of clear audio (10+ samples recommended)
 */
export async function cloneVoice(request: VoiceCloneRequest): Promise<VoiceCloneResponse> {
  const formData = new FormData()
  formData.append('name', request.name)

  if (request.description) {
    formData.append('description', request.description)
  }

  // Add all audio files
  request.files.forEach((file) => {
    formData.append('files', file)
  })

  // Add labels if provided
  if (request.labels) {
    formData.append('labels', JSON.stringify(request.labels))
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/add`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`ElevenLabs API error: ${error.detail?.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Generate speech from text using a cloned voice
 * Returns audio blob
 */
export async function textToSpeech(request: TextToSpeechRequest): Promise<Blob> {
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${request.voice_id}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        model_id: request.model_id || 'eleven_multilingual_v2',
        voice_settings: request.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs TTS error: ${error}`)
  }

  return response.blob()
}

/**
 * Get all available voices for the account
 */
export async function getVoices() {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch voices')
  }

  return response.json()
}

/**
 * Delete a cloned voice
 */
export async function deleteVoice(voiceId: string): Promise<void> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
    method: 'DELETE',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to delete voice')
  }
}

/**
 * Get voice details and settings
 */
export async function getVoiceDetails(voiceId: string) {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch voice details')
  }

  return response.json()
}

/**
 * Upload audio to Supabase and return public URL
 * Helper function for storing generated audio
 */
export async function uploadAudioToStorage(
  audioBlob: Blob,
  fileName: string,
  supabaseClient: any
): Promise<string> {
  const { data, error } = await supabaseClient.storage
    .from('living-legacy-audio')
    .upload(`generated/${fileName}`, audioBlob, {
      contentType: 'audio/mpeg',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload audio: ${error.message}`)
  }

  const { data: urlData } = supabaseClient.storage
    .from('living-legacy-audio')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
