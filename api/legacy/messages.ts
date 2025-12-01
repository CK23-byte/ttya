import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // GET - Fetch messages for a profile
    if (req.method === 'GET') {
      const { profileId, category } = req.query

      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ error: 'Profile ID is required' })
      }

      let query = supabase
        .from('legacy_messages')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })

      if (category && typeof category === 'string') {
        query = query.eq('category', category)
      }

      const { data: messages, error } = await query

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch messages', details: error.message })
      }

      return res.status(200).json({ success: true, messages })
    }

    // POST - Create a new message
    if (req.method === 'POST') {
      const {
        profileId,
        category,
        subcategory,
        title,
        content,
        videoUrl,
        audioUrl,
        thumbnailUrl,
        recipientIds,
        isForAllRecipients,
        isTimeCapsule,
        unlockCondition,
        unlockDate,
        unlockAge,
        durationSeconds,
        recordingFormat
      } = req.body

      // Validation
      if (!profileId || !title || !category) {
        return res.status(400).json({
          error: 'Missing required fields: profileId, title, category'
        })
      }

      const messageData = {
        profile_id: profileId,
        category,
        subcategory: subcategory || null,
        title,
        content: content || null,
        video_url: videoUrl || null,
        audio_url: audioUrl || null,
        thumbnail_url: thumbnailUrl || null,
        recipient_ids: recipientIds || null,
        is_for_all_recipients: isForAllRecipients !== false,
        is_time_capsule: isTimeCapsule || false,
        unlock_condition: unlockCondition || null,
        unlock_date: unlockDate || null,
        unlock_age: unlockAge || null,
        duration_seconds: durationSeconds || null,
        recording_format: recordingFormat || 'text',
        is_complete: false,
        is_draft: true,
        recorded_at: new Date().toISOString()
      }

      const { data: message, error: insertError } = await supabase
        .from('legacy_messages')
        .insert(messageData)
        .select()
        .single()

      if (insertError) {
        return res.status(500).json({
          error: 'Failed to create message',
          details: insertError.message
        })
      }

      return res.status(201).json({ success: true, message })
    }

    // PATCH - Update an existing message
    if (req.method === 'PATCH') {
      const { messageId } = req.query
      const updates = req.body

      if (!messageId || typeof messageId !== 'string') {
        return res.status(400).json({ error: 'Message ID is required' })
      }

      // Convert camelCase to snake_case for database
      const dbUpdates: any = {}
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.content !== undefined) dbUpdates.content = updates.content
      if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl
      if (updates.audioUrl !== undefined) dbUpdates.audio_url = updates.audioUrl
      if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl
      if (updates.transcript !== undefined) dbUpdates.transcript = updates.transcript
      if (updates.isComplete !== undefined) dbUpdates.is_complete = updates.isComplete
      if (updates.isDraft !== undefined) dbUpdates.is_draft = updates.isDraft
      if (updates.durationSeconds !== undefined) dbUpdates.duration_seconds = updates.durationSeconds

      dbUpdates.updated_at = new Date().toISOString()

      const { data: message, error: updateError } = await supabase
        .from('legacy_messages')
        .update(dbUpdates)
        .eq('id', messageId)
        .select()
        .single()

      if (updateError) {
        return res.status(500).json({
          error: 'Failed to update message',
          details: updateError.message
        })
      }

      return res.status(200).json({ success: true, message })
    }

    // DELETE - Delete a message
    if (req.method === 'DELETE') {
      const { messageId } = req.query

      if (!messageId || typeof messageId !== 'string') {
        return res.status(400).json({ error: 'Message ID is required' })
      }

      const { error: deleteError } = await supabase
        .from('legacy_messages')
        .delete()
        .eq('id', messageId)

      if (deleteError) {
        return res.status(500).json({
          error: 'Failed to delete message',
          details: deleteError.message
        })
      }

      return res.status(200).json({ success: true, message: 'Message deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error: any) {
    console.error('Messages API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}
