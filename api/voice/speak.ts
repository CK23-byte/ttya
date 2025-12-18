/**
 * Vercel Serverless Function: Text-to-Speech with ElevenLabs
 *
 * Converts text to speech using ElevenLabs cloned voice
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

interface RequestBody {
  text: string
  voiceId: string
  stability?: number
  similarity_boost?: number
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
      error: 'ElevenLabs API key not configured'
    })
  }

  try {
    const body = req.body as RequestBody
    const {
      text,
      voiceId,
      stability = 0.5,
      similarity_boost = 0.75
    } = body

    if (!text || !voiceId) {
      return res.status(400).json({ error: 'Missing text or voiceId' })
    }

    console.log('Generating speech:', {
      voiceId,
      textLength: text.length
    })

    // Call ElevenLabs TTS API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2', // Fastest model with lowest latency
        voice_settings: {
          stability,
          similarity_boost,
          use_speaker_boost: true // Enhance voice clarity
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        error
      })

      // Parse error message
      let errorMessage = error
      try {
        const errorJson = JSON.parse(error)
        errorMessage = errorJson.detail?.message || errorJson.message || JSON.stringify(errorJson)
      } catch (e) {
        // Not JSON, use raw error
      }

      // Provide specific guidance based on status code
      let hint = ''
      if (response.status === 401) {
        hint = 'ElevenLabs API key is invalid or expired. Check ELEVENLABS_API_KEY in environment variables. Visit https://elevenlabs.io/app/settings/api-keys'
      } else if (response.status === 429) {
        hint = 'Rate limit exceeded. Too many requests to ElevenLabs. Wait a moment and try again.'
      } else if (response.status === 402) {
        hint = 'Insufficient credits. Your ElevenLabs account is out of credits. Visit https://elevenlabs.io/app/settings/billing'
      }

      return res.status(response.status).json({
        error: 'Failed to generate speech',
        details: errorMessage,
        hint
      })
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer()
    console.log('Speech generated:', audioBuffer.byteLength, 'bytes')

    // Convert to base64 for JSON response
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    return res.status(200).json({
      audioBase64: base64Audio,
      mimeType: 'audio/mpeg'
    })

  } catch (error) {
    console.error('TTS error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
