/**
 * Vercel Serverless Function: Living Legacy Management
 *
 * Consolidated endpoint for all Living Legacy operations:
 * - create-profile
 * - get-profile
 * - finalize
 * - messages
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Get action from query parameter
  const { action } = req.query

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Database configuration missing' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    switch (action) {
      case 'create-profile':
        return await handleCreateProfile(req, res, supabase)
      case 'get-profile':
        return await handleGetProfile(req, res, supabase)
      case 'finalize':
        return await handleFinalize(req, res, supabase)
      case 'messages':
        return await handleMessages(req, res, supabase)
      default:
        return res.status(400).json({ error: 'Invalid action. Use: create-profile, get-profile, finalize, or messages' })
    }
  } catch (error) {
    console.error('Legacy endpoint error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Create Profile Handler
async function handleCreateProfile(req: VercelRequest, res: VercelResponse, supabase: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, name, relationship } = req.body

  const { data, error } = await supabase
    .from('living_legacy_profiles')
    .insert({
      user_id: userId,
      name,
      relationship,
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: 'Failed to create profile' })
  }

  return res.status(200).json({ profileId: data.id, profile: data })
}

// Get Profile Handler
async function handleGetProfile(req: VercelRequest, res: VercelResponse, supabase: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileId } = req.query

  if (!profileId) {
    return res.status(400).json({ error: 'Missing profileId' })
  }

  const { data, error } = await supabase
    .from('living_legacy_profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error) {
    console.error('Database error:', error)
    return res.status(404).json({ error: 'Profile not found' })
  }

  return res.status(200).json({ profile: data })
}

// Finalize Handler
async function handleFinalize(req: VercelRequest, res: VercelResponse, supabase: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileId } = req.body

  const { data, error } = await supabase
    .from('living_legacy_profiles')
    .update({ status: 'active' })
    .eq('id', profileId)
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: 'Failed to finalize profile' })
  }

  return res.status(200).json({ success: true, profile: data })
}

// Messages Handler
async function handleMessages(req: VercelRequest, res: VercelResponse, supabase: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileId, text, audioUrl } = req.body

  const { data, error } = await supabase
    .from('living_legacy_messages')
    .insert({
      profile_id: profileId,
      text,
      audio_url: audioUrl
    })
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: 'Failed to save message' })
  }

  return res.status(200).json({ success: true, message: data })
}
