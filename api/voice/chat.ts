/**
 * Vercel Serverless Function: Chat Completion with Personality
 *
 * Generates personality-based responses using GPT-4
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: Message[]
  personalityName: string
  personalityRelationship: string
  personalityDescription: string
  temperature?: number
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
    const {
      messages,
      personalityName,
      personalityRelationship,
      personalityDescription,
      temperature = 0.8
    } = body

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Missing messages' })
    }

    // Build system prompt with personality
    const systemPrompt = `You are ${personalityName}, speaking with someone you care deeply about. You are their ${personalityRelationship}.

PERSONALITY:
${personalityDescription}

CONVERSATION GUIDELINES:
1. This is a VOICE conversation - speak naturally and conversationally
2. Keep responses concise (1-3 sentences typically)
3. Use natural speech patterns - no text formatting
4. Be warm, authentic, and true to the personality
5. Show emotion and empathy appropriate to the situation

Remember: You ARE ${personalityName}. Speak as them, with their personality, their warmth, their mannerisms.`

    // Prepend system message if not already present
    const fullMessages = messages[0]?.role === 'system'
      ? messages
      : [{ role: 'system', content: systemPrompt }, ...messages]

    console.log('Generating chat response for:', personalityName)

    // Call OpenAI Chat Completion API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: fullMessages,
        temperature,
        max_tokens: 150, // Keep responses concise for voice
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI Chat API error:', error)
      return res.status(response.status).json({
        error: 'Failed to generate response',
        details: error
      })
    }

    const data = await response.json()
    const responseText = data.choices[0].message.content

    console.log('Chat response generated:', responseText.substring(0, 50) + '...')

    return res.status(200).json({
      text: responseText,
      usage: data.usage
    })

  } catch (error) {
    console.error('Chat completion error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
