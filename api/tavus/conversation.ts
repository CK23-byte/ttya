/**
 * Vercel Serverless Function: Tavus Conversation Management
 *
 * Endpoints:
 * - POST ?action=create: Start new conversation
 * - POST ?action=end: End conversation and record usage
 *
 * Tavus API Docs: https://docs.tavus.io/api-reference/conversations/create-conversation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const TAVUS_API_KEY = process.env.TAVUS_API_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (!TAVUS_API_KEY) {
    return res.status(500).json({
      error: 'Tavus API key not configured'
    })
  }

  if (!supabase) {
    return res.status(500).json({
      error: 'Supabase not configured'
    })
  }

  const { action } = req.query

  try {
    if (action === 'create') {
      return await handleCreateConversation(req, res)
    } else if (action === 'end') {
      return await handleEndConversation(req, res)
    } else {
      return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Tavus conversation endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ============================================================================
// Create Conversation Handler
// ============================================================================

async function handleCreateConversation(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileId, conversationName, userId } = req.body

  if (!profileId || !userId) {
    return res.status(400).json({
      error: 'Missing required fields: profileId, userId'
    })
  }

  console.log('Creating Tavus conversation:', { profileId, conversationName })

  // Get replica and persona from database
  const { data: replica, error: replicaError } = await supabase!
    .from('tavus_replicas')
    .select('replica_id, persona_id, replica_status, persona_status, replica_name')
    .eq('profile_id', profileId)
    .eq('user_id', userId)
    .single()

  if (replicaError || !replica) {
    console.error('Replica not found:', replicaError)
    return res.status(404).json({
      error: 'No replica found for this profile',
      hint: 'Create a replica first in Profile Improvement page'
    })
  }

  // Check if replica and persona are ready
  if (replica.replica_status !== 'ready') {
    return res.status(400).json({
      error: 'Replica is not ready yet',
      status: replica.replica_status,
      hint: 'Please wait for replica training to complete'
    })
  }

  if (!replica.persona_id || replica.persona_status !== 'ready') {
    return res.status(400).json({
      error: 'Persona is not ready yet',
      hint: 'Persona is being configured automatically'
    })
  }

  console.log('Using replica:', replica.replica_id, 'persona:', replica.persona_id)

  // Deduct minimum credits (5 minutes minimum charge)
  const MINIMUM_CREDITS = 1 // 5 minutes × 0.2 credits
  const { error: creditError } = await supabase!.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: MINIMUM_CREDITS,
    p_description: `Video call started: ${replica.replica_name}`
  })

  if (creditError) {
    console.error('Credit deduction error:', creditError)
    return res.status(402).json({
      error: 'Insufficient credits',
      hint: 'Purchase more credits to start video calls'
    })
  }

  // Call Tavus API to create conversation
  const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
    method: 'POST',
    headers: {
      'x-api-key': TAVUS_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      replica_id: replica.replica_id,
      persona_id: replica.persona_id,
      conversation_name: conversationName || `Video call at ${new Date().toLocaleString()}`
    })
  })

  if (!tavusResponse.ok) {
    const error = await tavusResponse.text()
    console.error('Tavus create conversation error:', {
      status: tavusResponse.status,
      error
    })

    // Refund credits if conversation creation failed
    await supabase!.rpc('add_credits', {
      p_user_id: userId,
      p_amount: MINIMUM_CREDITS,
      p_description: 'Refund: Video call failed to start'
    })

    let errorMessage = 'Failed to create conversation'
    try {
      const errorJson = JSON.parse(error)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch (e) {
      errorMessage = error || errorMessage
    }

    return res.status(tavusResponse.status).json({
      error: 'Failed to create conversation',
      details: errorMessage
    })
  }

  const data = await tavusResponse.json()
  console.log('Tavus conversation response:', data)

  const conversationId = data.conversation_id
  const conversationUrl = data.conversation_url

  if (!conversationId || !conversationUrl) {
    console.error('Missing conversation data:', data)
    return res.status(500).json({
      error: 'Conversation created but missing data'
    })
  }

  // Save conversation to database
  const { error: dbError } = await supabase!.from('tavus_conversations').insert({
    user_id: userId,
    replica_id: replica.replica_id,
    conversation_id: conversationId,
    conversation_url: conversationUrl,
    conversation_name: conversationName,
    status: 'active',
    credits_used: MINIMUM_CREDITS
  })

  if (dbError) {
    console.error('Database error saving conversation:', dbError)
  }

  console.log('✅ Conversation created successfully:', conversationId)

  return res.status(200).json({
    success: true,
    conversationId,
    conversationUrl,
    expiresAt: data.expires_at
  })
}

// ============================================================================
// End Conversation Handler
// ============================================================================

async function handleEndConversation(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { conversationId, durationSeconds, userId } = req.body

  if (!conversationId || durationSeconds === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: conversationId, durationSeconds'
    })
  }

  console.log('Ending conversation:', { conversationId, durationSeconds })

  // Calculate additional credits (beyond 5-minute minimum)
  const durationMinutes = Math.ceil(durationSeconds / 60)
  const additionalMinutes = Math.max(0, durationMinutes - 5)
  const additionalCredits = additionalMinutes * 0.2

  console.log('Duration:', durationMinutes, 'min, Additional credits:', additionalCredits)

  // Deduct additional credits if needed
  if (additionalCredits > 0 && userId) {
    await supabase!.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: additionalCredits,
      p_description: `Video call additional time: ${additionalMinutes} min`
    })
  }

  // Update conversation in database
  const totalCredits = 1 + additionalCredits // 1 (minimum) + additional
  const { error: dbError } = await supabase!
    .from('tavus_conversations')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      credits_used: totalCredits
    })
    .eq('conversation_id', conversationId)

  if (dbError) {
    console.error('Database error updating conversation:', dbError)
  }

  console.log('✅ Conversation ended:', {
    duration: durationMinutes,
    totalCredits
  })

  return res.status(200).json({
    success: true,
    durationMinutes,
    creditsUsed: totalCredits
  })
}
