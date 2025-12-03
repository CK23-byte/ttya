/**
 * Avatar Response Processor
 * Handles speech-to-text, text-to-speech, and video generation
 */

const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

// API Keys from environment
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

/**
 * Transcribe audio using OpenAI Whisper API
 */
async function transcribeAudio(audioPath) {
  try {
    console.log('[Processor] Transcribing audio with Whisper API')

    const formData = new FormData()
    formData.append('file', fs.createReadStream(audioPath))
    formData.append('model', 'whisper-1')

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      }
    )

    console.log('[Processor] Transcription:', response.data.text)
    return response.data.text

  } catch (error) {
    console.error('[Processor] Transcription error:', error.response?.data || error.message)
    throw new Error('Failed to transcribe audio')
  }
}

/**
 * Generate conversational response using OpenAI
 */
async function generateResponse(userMessage, conversationHistory = []) {
  try {
    console.log('[Processor] Generating response for:', userMessage)

    const messages = [
      {
        role: 'system',
        content: 'You are a loving family member sharing wisdom and memories with your loved ones. Speak naturally and warmly, as if having a real conversation. Keep responses concise (2-3 sentences) for video delivery.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ]

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages,
        max_tokens: 150,
        temperature: 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const responseText = response.data.choices[0].message.content
    console.log('[Processor] Generated response:', responseText)

    return responseText

  } catch (error) {
    console.error('[Processor] Response generation error:', error.response?.data || error.message)
    throw new Error('Failed to generate response')
  }
}

/**
 * Convert text to speech using ElevenLabs
 */
async function textToSpeech(text, voiceId) {
  try {
    console.log('[Processor] Converting text to speech')

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    )

    // Save audio temporarily
    const audioPath = `/tmp/speech_${Date.now()}.mp3`
    await fs.promises.writeFile(audioPath, response.data)

    console.log('[Processor] Audio saved:', audioPath)
    return audioPath

  } catch (error) {
    console.error('[Processor] TTS error:', error.response?.data || error.message)
    throw new Error('Failed to generate speech')
  }
}

/**
 * Generate avatar video using Heygen
 */
async function generateAvatarVideo(audioPath, avatarId = null) {
  try {
    console.log('[Processor] Generating avatar video with Heygen')

    // Read audio file and convert to base64
    const audioBuffer = await fs.promises.readFile(audioPath)
    const audioBase64 = audioBuffer.toString('base64')

    // Use default Heygen avatar if none specified
    const selectedAvatarId = avatarId || 'Daisy-inskirt-20220818'

    // Create video generation request
    const response = await axios.post(
      'https://api.heygen.com/v2/video/generate',
      {
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: selectedAvatarId,
              avatar_style: 'normal'
            },
            voice: {
              type: 'audio',
              audio_data: audioBase64,
              audio_format: 'mp3'
            },
            background: {
              type: 'color',
              value: '#FFFFFF'
            }
          }
        ],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: '16:9'
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    const videoId = response.data.data.video_id
    console.log('[Processor] Heygen video creation started:', videoId)

    // Poll for completion
    const videoUrl = await pollForHeygenCompletion(videoId)

    console.log('[Processor] Video ready:', videoUrl)
    return videoUrl

  } catch (error) {
    console.error('[Processor] Video generation error:', error.response?.data || error.message)
    throw new Error('Failed to generate video')
  }
}

/**
 * Poll Heygen for video completion
 */
async function pollForHeygenCompletion(videoId, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(
        `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
        {
          headers: {
            'X-Api-Key': HEYGEN_API_KEY
          }
        }
      )

      const status = response.data.data.status

      console.log(`[Processor] Heygen status (${i + 1}/${maxAttempts}):`, status)

      if (status === 'completed') {
        return response.data.data.video_url
      }

      if (status === 'failed') {
        throw new Error('Video generation failed')
      }

      // Wait 5 seconds before next attempt (Heygen can take longer)
      await new Promise(resolve => setTimeout(resolve, 5000))

    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error
      }
    }
  }

  throw new Error('Video generation timed out')
}

/**
 * Get avatar configuration from database
 */
async function getAvatarConfig(avatarId) {
  // In production, fetch from Supabase
  // For now, return mock config for testing
  return {
    voiceId: process.env.TEST_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Default ElevenLabs voice
    heygenAvatarId: process.env.TEST_HEYGEN_AVATAR_ID || 'Daisy-inskirt-20220818' // Default Heygen avatar
  }
}

/**
 * Main processor function
 */
async function processAvatarResponse(input, avatarId, inputType = 'text') {
  try {
    console.log(`[Processor] Processing ${inputType} input for avatar: ${avatarId}`)

    // Get avatar configuration
    const config = await getAvatarConfig(avatarId)

    // Step 1: Get text (either from transcription or direct input)
    let text = input
    if (inputType === 'audio') {
      text = await transcribeAudio(input)
    }

    // Step 2: Generate conversational response
    const responseText = await generateResponse(text)

    // Step 3: Convert response to speech
    const audioPath = await textToSpeech(responseText, config.voiceId)

    // Step 4: Generate avatar video with Heygen
    const videoUrl = await generateAvatarVideo(audioPath, config.heygenAvatarId)

    // Cleanup temporary audio
    await fs.promises.unlink(audioPath)

    return {
      userMessage: text,
      responseText: responseText,
      videoUrl: videoUrl
    }

  } catch (error) {
    console.error('[Processor] Processing error:', error)
    throw error
  }
}

module.exports = {
  processAvatarResponse,
  transcribeAudio,
  generateResponse,
  textToSpeech,
  generateAvatarVideo
}
