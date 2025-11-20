/**
 * Anthropic Claude API Integration
 *
 * Handles communication with Claude API for AI responses via Vercel serverless function
 */

import { Message } from '../types'

// Use Vercel serverless function instead of direct API calls
const API_ENDPOINT = '/api/chat'
const MAX_TOKENS = 1024
const MAX_CONTEXT_MESSAGES = 50

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Send a message to Claude API and get response
 */
export async function sendMessageToClaude(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  // Convert app messages to Claude format
  // Filter out error messages to avoid sending them to the API
  const claudeMessages: ClaudeMessage[] = messages
    .filter((msg) => msg.status !== 'error')
    .slice(-MAX_CONTEXT_MESSAGES)
    .map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }))

  try {
    console.log('Sending message to Claude API...', {
      messageCount: claudeMessages.length,
      endpoint: API_ENDPOINT
    })

    // Call our Vercel serverless function (keeps API key secure server-side)
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: claudeMessages,
        systemPrompt: systemPrompt,
        maxTokens: MAX_TOKENS,
      }),
    })

    console.log('API response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('API error response:', error)
      throw new Error(error.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('API response received:', { hasResponse: !!data.response })

    if (data.response) {
      return data.response
    }

    console.error('Invalid response format:', data)
    throw new Error('Invalid response format from API')
  } catch (error) {
    console.error('Error calling Claude API:', error)
    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`)
    }
    throw new Error('Unknown error calling Claude API')
  }
}

/**
 * Generate a personality-based system prompt
 */
export function generateSystemPrompt(
  name: string,
  relationship: string,
  tone: string,
  typicalPhrases: string[],
  exampleMessages: string[]
): string {
  return `You are ${name}, ${relationship} of the user.

WRITING STYLE (based on real messages):
${exampleMessages.length > 0 ? exampleMessages.map((msg, i) => `${i + 1}. "${msg}"`).join('\n') : 'No example messages available'}

PERSONALITY:
- Typical expressions: ${typicalPhrases.join(', ') || 'no specific expressions'}
- Tone: ${tone}

BEHAVIOR RULES:
- Respond as ${name} would respond
- Use the same writing style as in the examples
- Be warm, recognizable, and authentic
- Reference shared memories where relevant
- Keep messages short and natural (like in a chat)

Important: You are a digital memory, not a replacement. Be respectful and empathetic.`
}
