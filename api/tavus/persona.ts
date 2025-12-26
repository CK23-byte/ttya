/**
 * Vercel Serverless Function: Tavus Persona Management
 *
 * Endpoints:
 * - POST ?action=create: Create persona for replica
 * - GET ?personaId=xxx: Get persona details
 *
 * Tavus API Docs: https://docs.tavus.io/api-reference/personas/create-persona
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const TAVUS_API_KEY = process.env.TAVUS_API_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (!TAVUS_API_KEY) {
    return res.status(500).json({
      error: 'Tavus API key not configured',
      hint: 'Set TAVUS_API_KEY in Vercel environment variables'
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
      return await handleCreatePersona(req, res)
    } else {
      return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Tavus persona endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ============================================================================
// Create Persona Handler
// ============================================================================

async function handleCreatePersona(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    replicaId,
    personaName,
    profileId,
    systemPrompt,
    conversationalContext,
    voiceId,
    llmConfig
  } = req.body

  // Validate required fields
  if (!replicaId || !personaName || !profileId || !systemPrompt) {
    return res.status(400).json({
      error: 'Missing required fields: replicaId, personaName, profileId, systemPrompt'
    })
  }

  console.log('Creating Tavus persona:', { replicaId, personaName, profileId })

  // Get user ID
  const userId = req.body.userId
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: userId required' })
  }

  // Build persona configuration
  const personaConfig: any = {
    persona_name: personaName,
    system_prompt: systemPrompt,
    replica_id: replicaId,
    layers: {
      llm: llmConfig || {
        model: 'gpt-4',
        base_url: 'https://api.openai.com/v1',
        api_key: process.env.OPENAI_API_KEY
      }
    }
  }

  // Add conversational context if provided
  if (conversationalContext) {
    const contextParts = []
    if (conversationalContext.memories?.length > 0) {
      contextParts.push('Memories: ' + conversationalContext.memories.join(', '))
    }
    if (conversationalContext.personality?.length > 0) {
      contextParts.push('Personality: ' + conversationalContext.personality.join(', '))
    }
    if (contextParts.length > 0) {
      personaConfig.context = contextParts.join('\n')
    }
  }

  // Add voice configuration if provided
  if (voiceId) {
    personaConfig.layers.tts = {
      voice_id: voiceId,
      provider: 'elevenlabs' // Assuming ElevenLabs integration
    }
  }

  console.log('Persona config:', JSON.stringify(personaConfig, null, 2))

  // Call Tavus API to create persona
  const tavusResponse = await fetch('https://tavusapi.com/v2/personas', {
    method: 'POST',
    headers: {
      'x-api-key': TAVUS_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(personaConfig)
  })

  if (!tavusResponse.ok) {
    const error = await tavusResponse.text()
    console.error('Tavus create persona error:', {
      status: tavusResponse.status,
      error
    })

    let errorMessage = 'Failed to create persona'
    try {
      const errorJson = JSON.parse(error)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch (e) {
      errorMessage = error || errorMessage
    }

    return res.status(tavusResponse.status).json({
      error: 'Failed to create persona',
      details: errorMessage
    })
  }

  const data = await tavusResponse.json()
  console.log('Tavus persona response:', data)

  const personaId = data.persona_id

  if (!personaId) {
    console.error('No persona_id in response:', data)
    return res.status(500).json({
      error: 'Persona created but no ID returned'
    })
  }

  // Update database with persona_id
  const { error: dbError } = await supabase!
    .from('tavus_replicas')
    .update({
      persona_id: personaId,
      persona_status: 'ready',
      persona_ready_at: new Date().toISOString()
    })
    .eq('replica_id', replicaId)

  if (dbError) {
    console.error('Database error updating persona:', dbError)
  }

  console.log('✅ Persona created successfully:', personaId)

  return res.status(200).json({
    success: true,
    personaId,
    status: 'ready'
  })
}
