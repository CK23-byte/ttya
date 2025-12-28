/**
 * Simli Conversation API Endpoint
 *
 * Manages real-time avatar conversations using Simli API
 * Single photo → Real-time interactive avatar with WebRTC
 *
 * Features:
 * - Photo-based avatar creation (no video required)
 * - Real-time lip sync (<300ms latency)
 * - WebRTC streaming via SimliClient
 * - Voice cloning integration (ElevenLabs)
 * - Credit management
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
const SIMLI_API_KEY = process.env.SIMLI_API_KEY

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query

  // Check API key
  if (!SIMLI_API_KEY) {
    console.error('SIMLI_API_KEY not configured')
    return res.status(500).json({
      error: 'Simli API key not configured',
      hint: 'Set SIMLI_API_KEY in Vercel environment variables'
    })
  }

  try {
    if (action === 'create') {
      return await handleCreateSession(req, res)
    } else if (action === 'end') {
      return await handleEndSession(req, res)
    } else if (action === 'avatar') {
      return await handleCreateAvatar(req, res)
    } else {
      return res.status(400).json({ error: 'Invalid action parameter' })
    }
  } catch (error) {
    console.error('Simli API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Create a Simli avatar from a photo
 * This creates the avatar configuration that will be used in video calls
 */
async function handleCreateAvatar(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { photoUrl, avatarName, profileId, userId } = req.body

  if (!photoUrl || !avatarName || !profileId || !userId) {
    return res.status(400).json({
      error: 'Missing required fields: photoUrl, avatarName, profileId, userId'
    })
  }

  console.log('Creating Simli avatar:', { avatarName, profileId })

  // Note: Simli doesn't require pre-registration of avatars
  // Avatars are created on-the-fly during session creation
  // We just store the photo URL for later use

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Store avatar configuration in database
  const avatarId = `simli_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const { error: dbError } = await supabase
    .from('simli_avatars')
    .upsert({
      avatar_id: avatarId,
      user_id: userId,
      profile_id: profileId,
      avatar_name: avatarName,
      photo_url: photoUrl,
      status: 'ready',
      created_at: new Date().toISOString()
    })

  if (dbError) {
    console.error('Database error:', dbError)
    return res.status(500).json({ error: 'Failed to save avatar configuration' })
  }

  return res.status(200).json({
    success: true,
    avatarId,
    avatarName,
    photoUrl,
    status: 'ready',
    message: 'Avatar ready for video calls'
  })
}

/**
 * Create a new Simli video session
 * Returns session configuration for WebRTC connection
 */
async function handleCreateSession(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileId, userId, photoUrl, voiceId } = req.body

  if (!profileId || !userId) {
    return res.status(400).json({
      error: 'Missing required fields: profileId, userId'
    })
  }

  console.log('Creating Simli session:', { profileId, userId })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Check user credits (minimum 1 credit for video call)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return res.status(404).json({ error: 'User profile not found' })
  }

  const currentCredits = (profile as any).credits || 0
  if (currentCredits < 1) {
    return res.status(402).json({
      error: 'Insufficient credits',
      required: 1,
      available: currentCredits
    })
  }

  // Deduct initial 1 credit (5 minutes minimum)
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_description: `Simli video call started`
  })

  if (deductError) {
    console.error('Credit deduction error:', deductError)
    return res.status(500).json({ error: 'Failed to deduct credits' })
  }

  // Create session record
  const sessionId = `simli_session_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const { error: sessionError } = await supabase
    .from('simli_sessions')
    .insert({
      session_id: sessionId,
      user_id: userId,
      profile_id: profileId,
      photo_url: photoUrl,
      voice_id: voiceId,
      status: 'active',
      credits_used: 1,
      started_at: new Date().toISOString()
    })

  if (sessionError) {
    console.error('Session creation error:', sessionError)
    return res.status(500).json({ error: 'Failed to create session' })
  }

  // Return session configuration for frontend
  // Simli uses WebRTC directly - no server-side session needed
  return res.status(200).json({
    success: true,
    sessionId,
    photoUrl,
    voiceId,
    apiKey: SIMLI_API_KEY, // Frontend needs this for SimliClient
    config: {
      maxDuration: 3600, // 1 hour max
      minCredits: 1
    }
  })
}

/**
 * End a Simli video session
 * Calculates final credits and updates database
 */
async function handleEndSession(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId, durationSeconds, userId } = req.body

  if (!sessionId || !userId) {
    return res.status(400).json({
      error: 'Missing required fields: sessionId, userId'
    })
  }

  console.log('Ending Simli session:', { sessionId, durationSeconds })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Calculate additional credits needed
  // 1 credit = 5 minutes (already deducted at start)
  // Additional: 0.2 credits per minute after first 5 minutes
  const durationMinutes = Math.ceil(durationSeconds / 60)
  let additionalCredits = 0

  if (durationMinutes > 5) {
    additionalCredits = (durationMinutes - 5) * 0.2
  }

  // Deduct additional credits if needed
  if (additionalCredits > 0) {
    await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: additionalCredits,
      p_description: `Simli video call - additional ${durationMinutes - 5} minutes`
    })
  }

  // Update session record
  const totalCredits = 1 + additionalCredits

  const { error: updateError } = await supabase
    .from('simli_sessions')
    .update({
      status: 'ended',
      duration_seconds: durationSeconds,
      credits_used: totalCredits,
      ended_at: new Date().toISOString()
    })
    .eq('session_id', sessionId)

  if (updateError) {
    console.error('Session update error:', updateError)
  }

  return res.status(200).json({
    success: true,
    sessionId,
    durationSeconds,
    durationMinutes,
    creditsUsed: totalCredits,
    message: 'Session ended successfully'
  })
}
