/**
 * Vercel Serverless Function: End Voice Session & Save Conversation
 *
 * This endpoint finalizes a voice call session, saves the transcript,
 * and optionally generates a summary of the conversation.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  audio_duration_ms?: number
}

interface RequestBody {
  sessionId: string
  userId: string
  durationSeconds: number
  transcript: {
    messages: Message[]
  }
  audioUrl?: string
  generateSummary?: boolean
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check Supabase configuration
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Supabase not configured')
    return res.status(500).json({
      error: 'Database not configured'
    })
  }

  try {
    const body = req.body as RequestBody
    const {
      sessionId,
      userId,
      durationSeconds,
      transcript,
      audioUrl,
      generateSummary = true
    } = body

    // Validate input
    if (!sessionId || !userId || !transcript) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Fetch session data
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (sessionError || !session) {
      console.error('Session not found:', sessionError)
      return res.status(404).json({ error: 'Session not found' })
    }

    const metadata = session.metadata as {
      personality_name?: string
      personality_relationship?: string
    }

    // Calculate message statistics
    const totalMessages = transcript.messages.length
    const userMessages = transcript.messages.filter(m => m.role === 'user').length
    const aiMessages = transcript.messages.filter(m => m.role === 'assistant').length

    // Generate conversation summary (optional)
    let summary: string | null = null
    let sentimentScore: number | null = null

    if (generateSummary && ANTHROPIC_API_KEY && totalMessages > 0) {
      try {
        const summaryResult = await generateConversationSummary(transcript.messages)
        summary = summaryResult.summary
        sentimentScore = summaryResult.sentiment
      } catch (error) {
        console.error('Failed to generate summary:', error)
        // Continue even if summary generation fails
      }
    }

    // Save conversation to database
    const { data: conversation, error: conversationError } = await supabase
      .from('voice_conversations')
      .insert({
        session_id: sessionId,
        user_id: userId,
        personality_name: metadata.personality_name || 'Unknown',
        personality_relationship: metadata.personality_relationship || 'loved one',
        transcript,
        audio_url: audioUrl || null,
        summary,
        sentiment_score: sentimentScore,
        total_messages: totalMessages,
        user_messages: userMessages,
        ai_messages: aiMessages
      })
      .select()
      .single()

    if (conversationError) {
      console.error('Failed to save conversation:', conversationError)
      return res.status(500).json({
        error: 'Failed to save conversation',
        details: conversationError.message
      })
    }

    // Update session status to ended
    const { error: updateError } = await supabase
      .from('voice_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Failed to update session:', updateError)
      // Don't fail the request since conversation is already saved
    }

    // Return success with conversation data
    return res.status(200).json({
      success: true,
      conversationId: conversation.id,
      summary: summary || undefined,
      stats: {
        durationSeconds,
        totalMessages,
        userMessages,
        aiMessages,
        sentimentScore
      }
    })

  } catch (error) {
    console.error('End session error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Generate a summary of the conversation using Claude AI
 * Also performs basic sentiment analysis
 */
async function generateConversationSummary(
  messages: Message[]
): Promise<{ summary: string; sentiment: number }> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  // Build conversation text
  const conversationText = messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
    .join('\n\n')

  const prompt = `Please analyze this voice conversation and provide:

1. A brief summary (2-3 sentences) of what was discussed
2. The overall emotional tone/sentiment on a scale of 0.0 to 1.0 where:
   - 0.0-0.3 = negative/sad
   - 0.3-0.7 = neutral/mixed
   - 0.7-1.0 = positive/happy

Conversation:
${conversationText}

Respond in this JSON format:
{
  "summary": "Brief summary here",
  "sentiment": 0.75
}`

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const responseText = data.content[0].text

  // Parse JSON response
  try {
    // Extract JSON from response (handle if wrapped in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      summary: parsed.summary || 'Conversation completed',
      sentiment: Math.max(0, Math.min(1, parsed.sentiment || 0.5))
    }
  } catch (parseError) {
    console.error('Failed to parse summary JSON:', parseError)
    // Return fallback
    return {
      summary: 'Conversation completed',
      sentiment: 0.5
    }
  }
}
