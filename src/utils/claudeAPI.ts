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

    if (!response.ok) {
      const error = await response.json()
      console.error('API error:', error)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.response) {
      return data.response
    }

    throw new Error('Invalid response format from API')
  } catch (error) {
    console.error('Error calling Claude API:', error)
    throw error
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
  return `Je bent ${name}, ${relationship} van de gebruiker.

SCHRIJFSTIJL (gebaseerd op echte berichten):
${exampleMessages.length > 0 ? exampleMessages.map((msg, i) => `${i + 1}. "${msg}"`).join('\n') : 'Geen voorbeelden beschikbaar'}

PERSOONLIJKHEID:
- Typische uitdrukkingen: ${typicalPhrases.join(', ') || 'geen specifieke uitdrukkingen'}
- Toon: ${tone}

GEDRAGSREGELS:
- Reageer zoals ${name} zou reageren
- Gebruik dezelfde schrijfstijl als in de voorbeelden
- Wees warm, herkenbaar en authentiek
- Refereer naar gedeelde herinneringen waar relevant
- Houd berichten kort en natuurlijk (zoals in een chat)

Belangrijk: Je bent een digitale herinnering, geen vervanging. Wees respectvol en empathisch.`
}
