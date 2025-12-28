/**
 * Check Simli Face Processing Status
 *
 * Checks the status of a custom face upload and updates database
 * GET /api/simli/check-status?profileId=XXX
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SIMLI_API_KEY = process.env.SIMLI_API_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileId, userId } = req.query

  if (!profileId || !userId) {
    return res.status(400).json({
      error: 'Missing required parameters: profileId, userId'
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // Get avatar from database
    const { data: avatar, error: dbError } = await supabase
      .from('simli_avatars')
      .select('*')
      .eq('profile_id', profileId)
      .eq('user_id', userId)
      .single()

    if (dbError || !avatar) {
      return res.status(404).json({
        error: 'Avatar not found',
        details: dbError?.message
      })
    }

    // If already ready or failed, return current status
    if (avatar.status !== 'processing') {
      return res.status(200).json({
        status: avatar.status,
        faceId: avatar.face_id,
        message: avatar.status === 'ready'
          ? 'Avatar is ready to use'
          : 'Avatar processing failed',
        errorMessage: avatar.error_message,
        processingTime: avatar.processing_completed_at && avatar.processing_started_at
          ? Math.floor((new Date(avatar.processing_completed_at).getTime() - new Date(avatar.processing_started_at).getTime()) / 1000)
          : null
      })
    }

    // Check with Simli API for updated status
    if (!avatar.face_id) {
      return res.status(200).json({
        status: 'processing',
        message: 'Face processing in progress, no face ID yet'
      })
    }

    console.log('🔍 Checking Simli API for face status:', avatar.face_id)

    // Note: Adjust this endpoint based on actual Simli API documentation
    // This is a placeholder - Simli may have a different status check endpoint
    const simliResponse = await fetch(`https://api.simli.ai/getFaceStatus/${avatar.face_id}`, {
      method: 'GET',
      headers: {
        'X-API-Key': SIMLI_API_KEY
      }
    })

    if (!simliResponse.ok) {
      console.warn('⚠️ Could not check Simli API status:', simliResponse.status)
      // Continue with database status if API check fails
      return res.status(200).json({
        status: 'processing',
        faceId: avatar.face_id,
        message: 'Processing in progress (API status check unavailable)'
      })
    }

    const simliData = await simliResponse.json()
    const newStatus = simliData.status === 'completed' ? 'ready' : simliData.status === 'failed' ? 'failed' : 'processing'

    console.log('📊 Simli API status:', newStatus)

    // Update database if status changed
    if (newStatus !== 'processing') {
      await supabase
        .from('simli_avatars')
        .update({
          status: newStatus,
          processing_completed_at: new Date().toISOString(),
          error_message: newStatus === 'failed' ? (simliData.error || 'Unknown error') : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', avatar.id)

      console.log('✅ Database updated with new status:', newStatus)
    }

    return res.status(200).json({
      status: newStatus,
      faceId: avatar.face_id,
      message: newStatus === 'ready'
        ? 'Avatar is ready to use!'
        : newStatus === 'failed'
          ? 'Avatar processing failed'
          : 'Processing in progress',
      errorMessage: newStatus === 'failed' ? simliData.error : null,
      estimatedTimeRemaining: newStatus === 'processing' ? simliData.estimatedTime : null
    })

  } catch (error) {
    console.error('❌ Error checking status:', error)
    return res.status(500).json({
      error: 'Failed to check avatar status',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
