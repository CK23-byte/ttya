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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎬 SIMLI SESSION CREATE - START')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (req.method !== 'POST') {
    console.error('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileId, userId, photoUrl, voiceId } = req.body
  console.log('📥 Request body:', {
    profileId,
    userId,
    photoUrl: photoUrl?.substring(0, 50) + '...',
    voiceId
  })

  if (!profileId || !userId) {
    console.error('❌ Missing required fields')
    return res.status(400).json({
      error: 'Missing required fields: profileId, userId'
    })
  }

  console.log('✅ Request validation passed')
  console.log('🔗 Creating Supabase client...')
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  console.log('✅ Supabase client created')

  // Check user credits (minimum 1 credit for video call)
  console.log('💳 Step 1: Checking user credits...')
  console.log('📤 Query: profiles.select(credits).eq(id, userId).single()')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  console.log('📥 Query result:', { profile, profileError })

  if (profileError || !profile) {
    console.error('❌ Profile not found:', profileError)
    return res.status(404).json({
      error: 'User profile not found',
      details: profileError?.message
    })
  }

  const currentCredits = (profile as any).credits || 0
  console.log('💰 Current credits:', currentCredits)

  if (currentCredits < 1) {
    console.error('❌ Insufficient credits:', { required: 1, available: currentCredits })
    return res.status(402).json({
      error: 'Insufficient credits',
      required: 1,
      available: currentCredits
    })
  }

  // Deduct initial 1 credit (5 minutes minimum)
  // Check for custom faceID
  console.log('🎭 Step 2: Checking for custom avatar...')
  const { data: avatar } = await supabase
    .from('simli_avatars')
    .select('face_id, status')
    .eq('profile_id', profileId)
    .eq('user_id', userId)
    .single()

  let faceId: string | null = null
  let usingCustomFace = false

  if (avatar && avatar.face_id && avatar.status === 'ready') {
    faceId = avatar.face_id
    usingCustomFace = true
    console.log('✅ Using custom faceID:', faceId)
  } else if (avatar && avatar.status === 'processing') {
    console.log('⏳ Custom avatar still processing, will use default face')
  } else {
    console.log('ℹ️ No custom avatar found, will use default face')
  }

  // Deduct initial 1 credit (5 minutes minimum)
  console.log('💸 Step 3: Deducting credits...')
  const newCredits = currentCredits - 1
  console.log('📊 Credits calculation:', { before: currentCredits, after: newCredits, deducted: 1 })

  const { error: deductError } = await supabase
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', userId)

  if (deductError) {
    console.error('❌ Credit deduction error:', deductError)
    return res.status(500).json({
      error: 'Failed to deduct credits',
      details: deductError.message
    })
  }

  console.log(`✅ Credits deducted successfully: ${currentCredits} → ${newCredits}`)

  // Create session record
  console.log('📝 Step 4: Creating session record...')
  const sessionId = `simli_session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  console.log('🆔 Session ID:', sessionId)

  const sessionData = {
    session_id: sessionId,
    user_id: userId,
    profile_id: profileId,
    photo_url: photoUrl,
    voice_id: voiceId,
    status: 'active',
    credits_used: 1,
    started_at: new Date().toISOString()
  }
  console.log('📋 Session data:', sessionData)

  const { error: sessionError } = await supabase
    .from('simli_sessions')
    .insert(sessionData)

  if (sessionError) {
    console.error('❌ Session creation error:', sessionError)
    return res.status(500).json({
      error: 'Failed to create session',
      details: sessionError.message
    })
  }

  console.log('✅ Session record created successfully')

  // Return session configuration for frontend
  console.log('📤 Step 5: Preparing response...')
  const response = {
    success: true,
    sessionId,
    faceId: faceId || undefined, // Custom faceID if available
    photoUrl: !faceId ? photoUrl : undefined, // Fallback photo URL if no custom face
    voiceId,
    apiKey: SIMLI_API_KEY, // Frontend needs this for SimliClient
    usingCustomFace,
    config: {
      maxDuration: 3600, // 1 hour max
      minCredits: 1
    }
  }

  console.log('📋 Response data:', {
    ...response,
    apiKey: response.apiKey ? `${response.apiKey.substring(0, 10)}...` : 'MISSING',
    faceId: faceId ? `${faceId.substring(0, 20)}...` : 'none'
  })

  console.log('✅ Simli session created successfully')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 SIMLI SESSION CREATE - SUCCESS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return res.status(200).json(response)
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
    // Get current credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profile) {
      const currentCredits = (profile as any).credits || 0
      const newCredits = currentCredits - additionalCredits

      await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId)

      console.log(`✅ Additional credits deducted: ${currentCredits} → ${newCredits} (-${additionalCredits})`)
    }
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
