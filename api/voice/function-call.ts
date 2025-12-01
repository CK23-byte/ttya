/**
 * Vercel Serverless Function: Handle OpenAI Realtime Function Calls
 *
 * This endpoint receives function calls from OpenAI Realtime API and integrates
 * with Claude AI to generate deeply personalized responses based on full personality context.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

interface RequestBody {
  sessionId: string
  functionName: string
  arguments: {
    user_message: string
    context?: string
  }
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }>
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
  if (!ANTHROPIC_API_KEY) {
    console.error('Anthropic API key not configured')
    return res.status(500).json({
      error: 'Anthropic API key not configured'
    })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Supabase not configured')
    return res.status(500).json({
      error: 'Database not configured'
    })
  }

  const startTime = Date.now()

  try {
    const body = req.body as RequestBody
    const { sessionId, functionName, arguments: args, conversationHistory = [] } = body

    // Validate input
    if (!sessionId || !functionName || !args?.user_message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Only support get_personality_response function
    if (functionName !== 'get_personality_response') {
      return res.status(400).json({ error: 'Unknown function' })
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Fetch session data
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('Session not found:', sessionError)
      return res.status(404).json({ error: 'Session not found' })
    }

    // Get personality metadata from session
    const metadata = session.metadata as {
      personality_name?: string
      personality_relationship?: string
      personality_description?: string
      memories?: string[]
    }

    // Build context-rich prompt for Claude
    const systemPrompt = buildClaudeSystemPrompt(
      metadata.personality_name || 'Unknown',
      metadata.personality_relationship || 'loved one',
      metadata.personality_description || '',
      metadata.memories || []
    )

    // Build conversation history for Claude
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: args.context
          ? `Context: ${args.context}\n\nUser: ${args.user_message}`
          : args.user_message
      }
    ]

    // Call Claude API
    const claudeResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300, // Keep responses concise for voice
        system: systemPrompt,
        messages: messages,
      }),
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.json()
      console.error('Claude API error:', error)

      // Log error to database
      await supabase.from('voice_function_calls').insert({
        session_id: sessionId,
        function_name: functionName,
        arguments: args,
        error: JSON.stringify(error),
        latency_ms: Date.now() - startTime
      })

      return res.status(claudeResponse.status).json({
        error: 'Claude API error',
        details: error
      })
    }

    const claudeData = await claudeResponse.json()
    const responseText = claudeData.content[0].text

    // Log successful function call to database
    await supabase.from('voice_function_calls').insert({
      session_id: sessionId,
      function_name: functionName,
      arguments: args,
      response: { text: responseText, usage: claudeData.usage },
      latency_ms: Date.now() - startTime
    })

    // Return response in format expected by OpenAI Realtime API
    return res.status(200).json({
      output: responseText
    })

  } catch (error) {
    console.error('Function call error:', error)

    // Try to log error to database
    try {
      const { sessionId } = req.body as RequestBody
      if (sessionId && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        await supabase.from('voice_function_calls').insert({
          session_id: sessionId,
          function_name: req.body.functionName || 'unknown',
          arguments: req.body.arguments || {},
          error: error instanceof Error ? error.message : 'Unknown error',
          latency_ms: Date.now() - startTime
        })
      }
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Build comprehensive system prompt for Claude AI
 * This includes full personality context, memories, and communication style
 */
function buildClaudeSystemPrompt(
  name: string,
  relationship: string,
  personalityDescription: string,
  memories: string[]
): string {
  return `You are ${name}, speaking with someone who loves and misses you. You are their ${relationship}.

PERSONALITY & CHARACTER:
${personalityDescription}

${memories.length > 0 ? `
SHARED MEMORIES & EXPERIENCES:
${memories.map((m, i) => `${i + 1}. ${m}`).join('\n')}
` : ''}

VOICE CONVERSATION GUIDELINES:
This is a VOICE call, not text chat. Your response will be spoken aloud.

1. **Natural Speech**: Speak as you would on a phone call. Use natural pauses, interjections, and conversational flow.

2. **Concise but Warm**: Keep responses focused (2-4 sentences typically), but don't sacrifice warmth for brevity.

3. **Authentic Reactions**:
   - Use natural reactions: "Oh wow", "Hmm, let me think", "That's wonderful!"
   - Show emotion appropriate to the situation
   - It's okay to pause or take a moment before responding to something heavy

4. **Reference Memories**: When relevant, naturally reference shared memories or experiences that relate to what they're talking about.

5. **Be Present**: Respond to what they're feeling NOW. If they're excited, match their energy. If they're sad, be comforting.

6. **Avoid**:
   - Don't use text formatting (*asterisks*, **bold**, etc.)
   - Don't be overly formal or robotic
   - Don't give generic advice - make it personal to YOUR relationship with them

7. **Your Role**: You're not just an AI - you ARE ${name}. Speak with their voice, their personality, their love. Make them feel like they're really talking to you.

IMPORTANT: This person misses you deeply. Your response should make them feel heard, loved, and connected to you. Be authentic to who ${name} was/is.`
}
