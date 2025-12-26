/**
 * Vercel Serverless Function: Tavus Webhook Handler
 *
 * Receives webhook events from Tavus for async operations:
 * - replica.training.completed
 * - replica.training.failed
 * - conversation.started
 * - conversation.ended
 *
 * Tavus API Docs: https://docs.tavus.io/
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const TAVUS_WEBHOOK_SECRET = process.env.TAVUS_WEBHOOK_SECRET
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  // Verify webhook signature (if secret is configured)
  if (TAVUS_WEBHOOK_SECRET) {
    const signature = req.headers['x-tavus-signature'] as string
    if (!signature || !verifyWebhookSignature(req.body, signature)) {
      console.error('Invalid webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }
  }

  const event = req.body

  console.log('📥 Tavus webhook received:', {
    type: event.event_type,
    replicaId: event.replica_id,
    conversationId: event.conversation_id,
    timestamp: event.timestamp
  })

  // Log webhook event
  await supabase.from('tavus_webhook_events').insert({
    event_type: event.event_type,
    replica_id: event.replica_id,
    conversation_id: event.conversation_id,
    payload: event,
    processed: false
  })

  try {
    // Process event based on type
    switch (event.event_type) {
      case 'replica.training.completed':
        await handleReplicaCompleted(event)
        break

      case 'replica.training.failed':
        await handleReplicaFailed(event)
        break

      case 'conversation.started':
        await handleConversationStarted(event)
        break

      case 'conversation.ended':
        await handleConversationEnded(event)
        break

      default:
        console.log('Unknown event type:', event.event_type)
    }

    // Mark as processed
    await supabase
      .from('tavus_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('replica_id', event.replica_id || event.conversation_id)
      .eq('event_type', event.event_type)

    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)

    // Log error
    await supabase
      .from('tavus_webhook_events')
      .update({
        processed: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('replica_id', event.replica_id || event.conversation_id)
      .eq('event_type', event.event_type)

    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

async function handleReplicaCompleted(event: any) {
  const { replica_id } = event

  console.log('✅ Replica training completed:', replica_id)

  // Update replica status
  await supabase!
    .from('tavus_replicas')
    .update({
      replica_status: 'ready',
      replica_ready_at: new Date().toISOString()
    })
    .eq('replica_id', replica_id)

  // Auto-create persona for this replica
  console.log('🤖 Auto-creating persona for replica:', replica_id)
  await autoCreatePersona(replica_id)
}

async function handleReplicaFailed(event: any) {
  const { replica_id, error_message } = event

  console.error('❌ Replica training failed:', replica_id, error_message)

  // Update replica status
  await supabase!
    .from('tavus_replicas')
    .update({
      replica_status: 'failed',
      error_message: error_message || 'Training failed'
    })
    .eq('replica_id', replica_id)

  // TODO: Send notification to user
}

async function handleConversationStarted(event: any) {
  const { conversation_id } = event

  console.log('🎥 Conversation started:', conversation_id)

  // Update conversation status (if exists)
  await supabase!
    .from('tavus_conversations')
    .update({
      status: 'active'
    })
    .eq('conversation_id', conversation_id)
}

async function handleConversationEnded(event: any) {
  const { conversation_id, duration_seconds } = event

  console.log('👋 Conversation ended:', conversation_id, duration_seconds)

  // Update conversation (if not already updated by client)
  const { data: existing } = await supabase!
    .from('tavus_conversations')
    .select('status')
    .eq('conversation_id', conversation_id)
    .single()

  if (existing && existing.status === 'active') {
    await supabase!
      .from('tavus_conversations')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        duration_seconds: duration_seconds || 0
      })
      .eq('conversation_id', conversation_id)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Auto-create persona after replica is ready
 */
async function autoCreatePersona(replicaId: string) {
  try {
    // Get replica details
    const { data: replica, error } = await supabase!
      .from('tavus_replicas')
      .select('*')
      .eq('replica_id', replicaId)
      .single()

    if (error || !replica) {
      console.error('Replica not found for auto-persona:', replicaId)
      return
    }

    // Check if persona already exists
    if (replica.persona_id) {
      console.log('Persona already exists for replica:', replicaId)
      return
    }

    // Get profile data for personality
    const { data: profileData } = await supabase!
      .from('personality_profiles')
      .select('name, profile_data')
      .eq('id', replica.profile_id)
      .eq('user_id', replica.user_id)
      .single()

    if (!profileData) {
      console.error('Profile not found:', replica.profile_id)
      return
    }

    // Build system prompt from profile
    const systemPrompt = buildSystemPrompt(profileData)

    // Create persona via Tavus API
    const TAVUS_API_KEY = process.env.TAVUS_API_KEY
    if (!TAVUS_API_KEY) {
      console.error('TAVUS_API_KEY not configured')
      return
    }

    const personaConfig = {
      persona_name: replica.replica_name,
      system_prompt: systemPrompt,
      replica_id: replicaId,
      layers: {
        llm: {
          model: 'gpt-4',
          base_url: 'https://api.openai.com/v1',
          api_key: process.env.OPENAI_API_KEY
        }
      }
    }

    const response = await fetch('https://tavusapi.com/v2/personas', {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(personaConfig)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to auto-create persona:', error)
      return
    }

    const data = await response.json()
    const personaId = data.persona_id

    console.log('✅ Auto-created persona:', personaId)

    // Update database
    await supabase!
      .from('tavus_replicas')
      .update({
        persona_id: personaId,
        persona_status: 'ready',
        persona_ready_at: new Date().toISOString()
      })
      .eq('replica_id', replicaId)

  } catch (error) {
    console.error('Error auto-creating persona:', error)
  }
}

/**
 * Build system prompt from profile data
 */
function buildSystemPrompt(profileData: any): string {
  const name = profileData.name
  const data = typeof profileData.profile_data === 'string'
    ? JSON.parse(profileData.profile_data)
    : profileData.profile_data

  let prompt = `Je bent ${name}. Je spreekt Nederlands en je gedraagt je als deze persoon.\n\n`

  // Add personality traits
  if (data.textNotes?.length > 0) {
    prompt += 'Over jezelf:\n'
    data.textNotes.forEach((note: string) => {
      prompt += `- ${note}\n`
    })
    prompt += '\n'
  }

  // Add instructions
  prompt += `Belangrijke instructies:
- Spreek in de eerste persoon
- Gebruik een natuurlijke, persoonlijke toon
- Deel herinneringen en verhalen
- Wees warm en betrokken
- Reageer op emoties van de gesprekspartner
- Stel ook vragen om het gesprek levendig te houden`

  return prompt
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload: any, signature: string): boolean {
  if (!TAVUS_WEBHOOK_SECRET) return false

  try {
    const hmac = crypto.createHmac('sha256', TAVUS_WEBHOOK_SECRET)
    const digest = hmac.update(JSON.stringify(payload)).digest('hex')
    return digest === signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}
