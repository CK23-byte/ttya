/**
 * Vercel Serverless Function: Tavus Replica Management
 *
 * Endpoints:
 * - POST ?action=create: Create new replica from training video
 * - GET ?replicaId=xxx: Check replica status
 *
 * Tavus API Docs: https://docs.tavus.io/api-reference/phoenix-replica-model/create-replica
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const TAVUS_API_KEY = process.env.TAVUS_API_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Check API key
  if (!TAVUS_API_KEY) {
    return res.status(500).json({
      error: 'Tavus API key not configured',
      hint: 'Set TAVUS_API_KEY in Vercel environment variables'
    })
  }

  // Check Supabase
  if (!supabase) {
    return res.status(500).json({
      error: 'Supabase not configured',
      hint: 'Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    })
  }

  const { action, replicaId } = req.query

  try {
    if (action === 'create') {
      return await handleCreateReplica(req, res)
    } else if (replicaId) {
      return await handleGetStatus(req, res)
    } else {
      return res.status(400).json({ error: 'Invalid request: specify action or replicaId' })
    }
  } catch (error) {
    console.error('Tavus replica endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ============================================================================
// Create Replica Handler
// ============================================================================

async function handleCreateReplica(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { videoUrl, consentVideoUrl, replicaName, profileId, modelName = 'phoenix-3' } = req.body

  // Validate required fields
  if (!videoUrl || !replicaName || !profileId) {
    return res.status(400).json({
      error: 'Missing required fields: videoUrl, replicaName, profileId'
    })
  }

  console.log('Creating Tavus replica:', { replicaName, profileId, modelName })

  // Get user ID from auth header (implement your auth logic)
  // For now, we'll need to pass userId in request or extract from JWT
  const userId = req.body.userId // TODO: Extract from auth token
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: userId required' })
  }

  // Call Tavus API to create replica
  const tavusResponse = await fetch('https://tavusapi.com/v2/replicas', {
    method: 'POST',
    headers: {
      'x-api-key': TAVUS_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      train_video_url: videoUrl,
      consent_video_url: consentVideoUrl,
      replica_name: replicaName,
      model_name: modelName
    })
  })

  if (!tavusResponse.ok) {
    const error = await tavusResponse.text()
    console.error('Tavus create replica error:', {
      status: tavusResponse.status,
      error
    })

    let errorMessage = 'Failed to create replica'
    try {
      const errorJson = JSON.parse(error)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch (e) {
      errorMessage = error || errorMessage
    }

    return res.status(tavusResponse.status).json({
      error: 'Failed to create replica',
      details: errorMessage
    })
  }

  const data = await tavusResponse.json()
  console.log('Tavus replica response:', data)

  const replicaId = data.replica_id

  if (!replicaId) {
    console.error('No replica_id in response:', data)
    return res.status(500).json({
      error: 'Replica created but no ID returned',
      details: 'Tavus API did not return a replica ID'
    })
  }

  // Save to database
  const { error: dbError } = await supabase!.from('tavus_replicas').insert({
    user_id: userId,
    profile_id: profileId,
    replica_id: replicaId,
    replica_name: replicaName,
    train_video_url: videoUrl,
    consent_video_url: consentVideoUrl,
    model_name: modelName,
    replica_status: 'training'
  })

  if (dbError) {
    console.error('Database error saving replica:', dbError)
    // Don't fail the request - replica is created in Tavus
    console.warn('Replica created in Tavus but failed to save to DB')
  }

  console.log('✅ Replica created successfully:', replicaId)

  return res.status(200).json({
    success: true,
    replicaId,
    status: data.status || 'training',
    estimatedCompletionTime: '10-30 minutes',
    message: 'Replica is being trained. This may take 10-30 minutes.'
  })
}

// ============================================================================
// Get Status Handler
// ============================================================================

async function handleGetStatus(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { replicaId } = req.query

  if (!replicaId || typeof replicaId !== 'string') {
    return res.status(400).json({
      error: 'Missing required query parameter: replicaId'
    })
  }

  console.log('Checking Tavus replica status:', replicaId)

  // Call Tavus API to get status
  const tavusResponse = await fetch(`https://tavusapi.com/v2/replicas/${replicaId}`, {
    method: 'GET',
    headers: {
      'x-api-key': TAVUS_API_KEY!,
      'Content-Type': 'application/json'
    }
  })

  if (!tavusResponse.ok) {
    const error = await tavusResponse.text()
    console.error('Tavus get status error:', {
      status: tavusResponse.status,
      error
    })

    return res.status(tavusResponse.status).json({
      error: 'Failed to get replica status',
      details: error
    })
  }

  const data = await tavusResponse.json()
  console.log('Tavus replica status:', data)

  // Update database if status changed
  if (data.status === 'ready' || data.status === 'failed') {
    const updateData: any = {
      replica_status: data.status
    }

    if (data.status === 'ready') {
      updateData.replica_ready_at = new Date().toISOString()
    } else if (data.status === 'failed' && data.error_message) {
      updateData.error_message = data.error_message
    }

    await supabase!
      .from('tavus_replicas')
      .update(updateData)
      .eq('replica_id', replicaId)
  }

  return res.status(200).json({
    replicaId,
    status: data.status,
    progress: data.progress,
    errorMessage: data.error_message
  })
}
