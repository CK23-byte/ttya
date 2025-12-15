/**
 * Vercel Serverless Function: Clone Voice with ElevenLabs
 *
 * This endpoint uploads a voice sample to ElevenLabs and creates a cloned voice
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface RequestBody {
  voiceName: string
  voiceDescription?: string
  audioBase64: string // Base64 encoded audio file
  mimeType?: string // MIME type of audio file (e.g., 'audio/mp4', 'audio/mpeg')
  userId: string
  profileId: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check required environment variables
  if (!ELEVENLABS_API_KEY) {
    console.error('ElevenLabs API key not configured')
    return res.status(500).json({
      error: 'ElevenLabs API key not configured',
      hint: 'Set ELEVENLABS_API_KEY in Vercel environment variables'
    })
  }

  try {
    const body = req.body as RequestBody
    const { voiceName, voiceDescription, audioBase64, mimeType = 'audio/mp4', userId, profileId } = body

    // Validate input
    if (!voiceName || !audioBase64 || !userId || !profileId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['voiceName', 'audioBase64', 'userId', 'profileId']
      })
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64')

    // Determine file extension from mimeType
    const extensionMap: Record<string, string> = {
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/ogg': 'ogg',
      'audio/wav': 'wav',
      'audio/flac': 'flac',
      'audio/webm': 'webm'
    }
    const extension = extensionMap[mimeType] || 'mp3'

    console.log('Cloning voice:', {
      voiceName,
      audioSize: audioBuffer.length,
      mimeType,
      extension,
      userId,
      profileId
    })

    // Validate that ElevenLabs supports this format
    const supportedFormats = ['audio/mp4', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/flac']
    if (!supportedFormats.includes(mimeType)) {
      console.warn(`Unsupported format: ${mimeType}. ElevenLabs may reject this.`)
      return res.status(400).json({
        error: 'Unsupported audio format',
        message: `Format ${mimeType} is not supported by ElevenLabs. Please use MP3, MP4, WAV, FLAC, or OGG.`,
        supportedFormats
      })
    }

    // Create FormData for ElevenLabs API (using native FormData with Blob)
    const formData = new FormData()

    // Convert Buffer to Blob for native FormData
    const audioBlob = new Blob([audioBuffer], { type: mimeType })

    // Add the audio file (native FormData needs File or Blob)
    formData.append('files', audioBlob, `voice_sample.${extension}`)

    // Add voice metadata
    formData.append('name', voiceName)
    if (voiceDescription) {
      formData.append('description', voiceDescription)
    }

    // Optional: Add labels for organization
    formData.append('labels', JSON.stringify({
      'source': 'ttya',
      'profile_id': profileId,
      'user_id': userId
    }))

    // Call ElevenLabs API to add voice
    console.log('Calling ElevenLabs API...')
    const elevenlabsResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
        // Don't set Content-Type header - fetch will set it automatically with boundary
      },
      body: formData
    })

    if (!elevenlabsResponse.ok) {
      const error = await elevenlabsResponse.text()
      console.error('ElevenLabs API error:', error)
      return res.status(elevenlabsResponse.status).json({
        error: 'Failed to clone voice',
        details: error,
        hint: 'Check that your audio sample is at least 1 minute long and good quality'
      })
    }

    const elevenlabsData = await elevenlabsResponse.json()
    console.log('Voice cloned successfully:', elevenlabsData)

    // Store voice clone info in Supabase (optional, for tracking)
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

      await supabase.from('voice_clones').insert({
        user_id: userId,
        profile_id: profileId,
        voice_id: elevenlabsData.voice_id,
        voice_name: voiceName,
        provider: 'elevenlabs',
        metadata: {
          voice_description: voiceDescription,
          elevenlabs_data: elevenlabsData
        }
      })
    }

    // Return voice ID and info
    return res.status(200).json({
      success: true,
      voiceId: elevenlabsData.voice_id,
      voiceName: voiceName,
      provider: 'elevenlabs',
      message: 'Voice cloned successfully! You can now use this voice in calls.'
    })

  } catch (error) {
    console.error('Voice cloning error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
