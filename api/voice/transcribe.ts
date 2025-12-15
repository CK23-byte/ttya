/**
 * Vercel Serverless Function: Transcribe Audio with Whisper
 *
 * Converts audio to text using OpenAI Whisper API
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface RequestBody {
  audioBase64: string
  mimeType?: string
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
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured')
    return res.status(500).json({
      error: 'OpenAI API key not configured'
    })
  }

  try {
    const body = req.body as RequestBody
    const { audioBase64, mimeType = 'audio/webm' } = body

    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audio data' })
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64')

    console.log('Transcribing audio:', {
      size: audioBuffer.length,
      mimeType
    })

    // Create FormData for Whisper API (using native FormData with Blob)
    const formData = new FormData()

    // Convert Buffer to Blob for native FormData
    const audioBlob = new Blob([audioBuffer], { type: mimeType })

    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en') // Optional: specify language
    formData.append('response_format', 'json')

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
        // Don't set Content-Type header - fetch will set it automatically with boundary
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Whisper API error:', error)
      return res.status(response.status).json({
        error: 'Failed to transcribe audio',
        details: error
      })
    }

    const data = await response.json()
    console.log('Transcription successful:', data.text)

    return res.status(200).json({
      text: data.text,
      duration: data.duration
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
