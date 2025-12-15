/**
 * Vercel Serverless Function: Send Message to HeyGen Streaming Session
 *
 * Sends a text message to the HeyGen Interactive Avatar to make it speak
 * https://docs.heygen.com/reference/send-task
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY

interface RequestBody {
  sessionId: string
  message: string
  task_type?: 'repeat' | 'talk'
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
  if (!HEYGEN_API_KEY) {
    console.error('HeyGen API key not configured')
    return res.status(500).json({
      error: 'HeyGen API key not configured',
      hint: 'Set HEYGEN_API_KEY in Vercel environment variables'
    })
  }

  try {
    const body = req.body as RequestBody
    const { sessionId, message, task_type = 'talk' } = body

    // Validate input
    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['sessionId', 'message']
      })
    }

    console.log('Sending message to HeyGen session:', {
      sessionId,
      messageLength: message.length,
      task_type
    })

    // Prepare request body for HeyGen API
    const heygenRequestBody = {
      session_id: sessionId,
      text: message,
      task_type: task_type
    }

    console.log('HeyGen API request:', heygenRequestBody)

    // Call HeyGen API to send message
    const heygenResponse = await fetch('https://api.heygen.com/v1/streaming.task', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(heygenRequestBody)
    })

    console.log('HeyGen API response status:', heygenResponse.status)

    if (!heygenResponse.ok) {
      const error = await heygenResponse.text()
      console.error('HeyGen API error:', error)

      // Parse error if it's JSON
      let errorMessage = 'Failed to send message'
      try {
        const errorJson = JSON.parse(error)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch (e) {
        errorMessage = error || errorMessage
      }

      return res.status(heygenResponse.status).json({
        error: 'Failed to send message',
        details: errorMessage,
        hint: 'Check that the session is still active'
      })
    }

    const heygenData = await heygenResponse.json()
    console.log('HeyGen message sent successfully:', heygenData)

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    })

  } catch (error) {
    console.error('Error sending HeyGen stream message:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
