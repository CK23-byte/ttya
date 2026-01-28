/**
 * Vercel Serverless Function: Simli Session Management
 *
 * Creates audio-to-video streaming sessions and retrieves ICE servers.
 * Actions:
 * - start: Create new streaming session (POST)
 * - ice: Get ICE servers for WebRTC (POST)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const SIMLI_API_KEY = process.env.SIMLI_API_KEY

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SIMLI_API_KEY) {
    return res.status(500).json({
      error: 'Simli API key not configured',
      hint: 'Set SIMLI_API_KEY in Vercel environment variables'
    })
  }

  const { action } = req.query

  try {
    switch (action) {
      case 'start':
        return await handleStartSession(req, res)
      case 'ice':
        return await handleGetIceServers(res)
      default:
        return res.status(400).json({ error: 'Invalid action. Use: start, ice' })
    }
  } catch (error) {
    console.error('Simli session endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleStartSession(req: VercelRequest, res: VercelResponse) {
  const { faceId } = req.body

  if (!faceId) {
    return res.status(400).json({ error: 'Missing required field: faceId' })
  }

  console.log('Creating Simli audio-to-video session:', { faceId })

  const response = await fetch('https://api.simli.ai/startAudioToVideoSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      faceId,
      apiKey: SIMLI_API_KEY!,
      handleSilence: true,
      maxSessionLength: 3600,
      maxIdleTime: 300,
      syncAudio: true,
      audioInputFormat: 'pcm16'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Simli startAudioToVideoSession error:', { status: response.status, error: errorText })
    return res.status(response.status).json({
      error: 'Failed to create streaming session',
      details: errorText,
      hint: 'Check that faceId is valid and Simli API key has permissions'
    })
  }

  const data = await response.json()
  console.log('Simli session created:', data)

  return res.status(200).json({
    success: true,
    sessionToken: data.session_token || data.sessionToken,
    ...data
  })
}

async function handleGetIceServers(res: VercelResponse) {
  console.log('Getting Simli ICE servers...')

  const response = await fetch('https://api.simli.ai/getIceServers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: SIMLI_API_KEY! })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Simli getIceServers error:', { status: response.status, error: errorText })
    return res.status(response.status).json({
      error: 'Failed to get ICE servers',
      details: errorText
    })
  }

  const data = await response.json()
  console.log('ICE servers retrieved:', data)

  return res.status(200).json({
    success: true,
    iceServers: data.iceServers || data.ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }]
  })
}
