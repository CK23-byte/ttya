/**
 * Vercel Serverless Function: Claude API Proxy
 *
 * This endpoint acts as a secure proxy between the frontend and Anthropic API.
 * The API key stays server-side and is never exposed to the browser.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

// Use ANTHROPIC_API_KEY (without VITE_ prefix) for serverless functions
// VITE_ prefix is only for frontend build-time variables
const API_KEY = process.env.ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

interface RequestBody {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  systemPrompt: string
  maxTokens?: number
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check API key
  if (!API_KEY) {
    console.error('Anthropic API key not configured. Make sure ANTHROPIC_API_KEY is set in Vercel environment variables.')
    return res.status(500).json({
      error: 'Anthropic API key not configured',
      hint: 'Set ANTHROPIC_API_KEY in Vercel Settings → Environment Variables'
    })
  }

  try {
    const body = req.body as RequestBody
    const { messages, systemPrompt, maxTokens = 1024 } = body

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages array' })
    }

    if (!systemPrompt) {
      return res.status(400).json({ error: 'System prompt is required' })
    }

    // Call Anthropic API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Anthropic API error:', error)
      return res.status(response.status).json({
        error: `API error: ${response.status}`,
        details: error
      })
    }

    const data = await response.json()

    if (data.content && data.content[0] && data.content[0].text) {
      return res.status(200).json({
        response: data.content[0].text,
        usage: data.usage
      })
    }

    return res.status(500).json({ error: 'Invalid response format from API' })
  } catch (error) {
    console.error('Error in chat endpoint:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
