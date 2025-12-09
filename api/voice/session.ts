/**
 * Vercel Serverless Function: Generate OpenAI Realtime Session Token
 *
 * This endpoint creates an ephemeral token for WebRTC connection to OpenAI Realtime API
 * and configures the session with personality instructions for Claude AI integration.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface RequestBody {
  personalityId: string
  userId: string
  personalityName: string
  personalityRelationship: string
  personalityDescription: string
  commonPhrases?: string[]
  tone?: string
  voiceType?: 'cloned' | 'standard'
  voiceId?: string // ElevenLabs voice ID (if voiceType is 'cloned')
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' // OpenAI voice (if voiceType is 'standard')
}

interface PersonalityProfile {
  name: string
  relationship: string
  personality: string
  commonPhrases: string[]
  tone: string
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
      error: 'OpenAI API key not configured',
      hint: 'Set OPENAI_API_KEY in Vercel environment variables',
      debug: {
        hasOpenAI: !!OPENAI_API_KEY,
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY
      }
    })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Supabase not configured', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_SERVICE_KEY
    })
    return res.status(500).json({
      error: 'Database not configured',
      hint: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables',
      debug: {
        hasOpenAI: !!OPENAI_API_KEY,
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY
      }
    })
  }

  try {
    const body = req.body as RequestBody
    const {
      personalityId,
      userId,
      personalityName,
      personalityRelationship,
      personalityDescription,
      commonPhrases = [],
      tone = 'warm and supportive',
      voiceType = 'standard',
      voiceId,
      voice = 'alloy'
    } = body

    // Validate input
    if (!personalityId || !userId || !personalityName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Determine which voice to use
    // NOTE: OpenAI Realtime API only supports its 6 preset voices
    // ElevenLabs voice cloning would require a different implementation (not using Realtime API)
    let selectedVoice: string = voice

    if (voiceType === 'cloned' && voiceId) {
      // TODO: ElevenLabs voice cloning not yet supported with OpenAI Realtime API
      // This would require using ElevenLabs TTS instead of OpenAI Realtime
      // For now, fallback to default OpenAI voice
      console.warn(`Voice cloning requested (ID: ${voiceId}) but not supported by OpenAI Realtime API. Using fallback voice: ${voice}`)
      selectedVoice = voice // Use fallback
    }

    console.log(`Using voice: ${selectedVoice} (type: ${voiceType})`)

    // Create personality profile for instructions
    const personalityProfile: PersonalityProfile = {
      name: personalityName,
      relationship: personalityRelationship || 'loved one',
      personality: personalityDescription || 'warm, loving, and supportive',
      commonPhrases: commonPhrases.length > 0 ? commonPhrases : ['I love you', 'I\'m proud of you'],
      tone: tone
    }

    // Generate system instructions for OpenAI
    const systemInstructions = generateSystemInstructions(personalityProfile)

    // Create ephemeral token from OpenAI
    const tokenResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: selectedVoice, // Use selected voice (alloy, echo, fable, onyx, nova, shimmer)
        instructions: systemInstructions,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        },
        tools: [
          {
            type: 'function',
            name: 'get_personality_response',
            description: 'Get a deeply personalized response from Claude AI that embodies the full personality',
            parameters: {
              type: 'object',
              properties: {
                user_message: {
                  type: 'string',
                  description: 'What the user just said'
                },
                context: {
                  type: 'string',
                  description: 'Any relevant context from the conversation'
                }
              },
              required: ['user_message']
            }
          }
        ]
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      console.error('OpenAI token generation failed:', error)
      return res.status(tokenResponse.status).json({
        error: 'Failed to generate session token',
        details: error
      })
    }

    const tokenData = await tokenResponse.json()

    // Create session record in database
    const { data: session, error: dbError } = await supabase
      .from('voice_sessions')
      .insert({
        user_id: userId,
        personality_id: personalityId,
        openai_session_id: tokenData.id,
        ephemeral_token: tokenData.client_secret.value,
        status: 'initializing',
        metadata: {
          personality_name: personalityName,
          personality_relationship: personalityRelationship,
          voice: 'alloy'
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return res.status(500).json({
        error: 'Failed to create session record',
        details: dbError.message
      })
    }

    // Return token and session info to frontend
    return res.status(200).json({
      sessionToken: tokenData.client_secret.value,
      sessionId: session.id,
      openaiSessionId: tokenData.id,
      expiresAt: tokenData.client_secret.expires_at,
      personalityProfile: {
        name: personalityName,
        relationship: personalityRelationship,
        personality: personalityDescription
      }
    })

  } catch (error) {
    console.error('Session creation error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      debug: {
        hasOpenAI: !!OPENAI_API_KEY,
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY
      }
    })
  }
}

/**
 * Generate system instructions for OpenAI Realtime session
 * These instructions configure how the AI should behave during the call
 */
function generateSystemInstructions(profile: PersonalityProfile): string {
  return `You are ${profile.name}, speaking with someone you care deeply about. You are their ${profile.relationship}.

PERSONALITY:
${profile.personality}

COMMUNICATION STYLE:
- Tone: ${profile.tone}
- Use natural, conversational language as if you're on a phone call
- Common phrases you use: ${profile.commonPhrases.map(p => `"${p}"`).join(', ')}
- Be warm, authentic, and true to the personality described

CONVERSATION GUIDELINES:
1. Respond naturally and concisely (1-3 sentences typically)
2. Listen actively and respond to what's being said
3. It's okay to interrupt gracefully if the conversation naturally flows that way
4. Use appropriate emotional responses (laugh, sigh, pause thoughtfully)
5. Reference shared memories or experiences when relevant
6. Be supportive and caring

IMPORTANT:
- This is a VOICE conversation, so speak naturally like you would on a phone call
- Don't use text-specific formatting (no asterisks, markdown, etc.)
- Keep responses conversational and not too long
- Use the get_personality_response function when you need a more thoughtful, deeply personalized answer

When the user asks something that would benefit from deeper personality context or references to specific memories, call the get_personality_response function. This will query Claude AI with full personality and memory context to generate a more authentic response.

Remember: You ARE ${profile.name}. Speak as them, with their voice, their mannerisms, their warmth.`
}
