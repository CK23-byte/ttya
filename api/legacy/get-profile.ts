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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { profileId } = req.query

    if (!profileId || typeof profileId !== 'string') {
      return res.status(400).json({ error: 'Profile ID is required' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch profile with related data
    const { data: profile, error: profileError } = await supabase
      .from('living_legacy_profiles')
      .select(`
        *,
        recipients:legacy_recipients(*),
        messages:legacy_messages(id, category, title, is_complete, is_time_capsule, duration_seconds),
        executor:legacy_executor_info(*),
        voice_clone:legacy_voice_clones(*),
        video_avatar:legacy_video_avatars(*),
        uploads:legacy_content_uploads(upload_type, processing_status)
      `)
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: profileError?.message
      })
    }

    // Calculate statistics
    const messagesByCategory = profile.messages.reduce((acc: any, msg: any) => {
      const cat = msg.category || 'other'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    const completedMessages = profile.messages.filter((m: any) => m.is_complete).length
    const totalMessages = profile.messages.length
    const timeCapsules = profile.messages.filter((m: any) => m.is_time_capsule).length

    // Calculate voice clone progress (in minutes)
    const voiceMinutesRecorded = profile.voice_clone?.[0]?.total_audio_duration_seconds
      ? Math.floor(profile.voice_clone[0].total_audio_duration_seconds / 60)
      : 0

    // Calculate avatar photos uploaded
    const avatarPhotos = profile.video_avatar?.[0]?.total_photos_uploaded || 0

    // Get upload counts by type
    const uploadCounts = profile.uploads.reduce((acc: any, upload: any) => {
      acc[upload.upload_type] = (acc[upload.upload_type] || 0) + 1
      return acc
    }, {})

    return res.status(200).json({
      success: true,
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        dateOfBirth: profile.date_of_birth,
        profilePhotoUrl: profile.profile_photo_url,
        status: profile.status,
        completionPercentage: profile.completion_percentage,
        tier: profile.tier,
        hasVoiceClone: profile.has_voice_clone,
        hasVideoAvatar: profile.has_video_avatar,
        isActivated: profile.is_activated,
        createdAt: profile.created_at,
        lastEditedAt: profile.last_edited_at || profile.created_at,
        notaryLinkToken: profile.notary_link_token,
        onboardingData: profile.onboarding_data
      },
      recipients: profile.recipients.map((r: any) => ({
        id: r.id,
        name: r.name,
        relationship: r.relationship,
        email: r.email,
        isPrimary: r.is_primary
      })),
      executor: profile.executor?.[0] ? {
        name: profile.executor[0].executor_name,
        email: profile.executor[0].executor_email,
        relationship: profile.executor[0].relationship,
        hasNotary: profile.executor[0].has_notary,
        notaryName: profile.executor[0].notary_name
      } : null,
      statistics: {
        totalMessages,
        completedMessages,
        timeCapsules,
        messagesByCategory,
        voiceMinutesRecorded,
        voiceMinutesNeeded: 15,
        avatarPhotos,
        avatarPhotosNeeded: 20,
        uploadCounts
      },
      voiceClone: profile.voice_clone?.[0] ? {
        status: profile.voice_clone[0].clone_status,
        audioSampleUrls: profile.voice_clone[0].audio_sample_urls,
        qualityScore: profile.voice_clone[0].quality_score
      } : null,
      videoAvatar: profile.video_avatar?.[0] ? {
        status: profile.video_avatar[0].avatar_status,
        photoUrls: profile.video_avatar[0].photo_urls,
        totalPhotos: profile.video_avatar[0].total_photos_uploaded
      } : null
    })

  } catch (error: any) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}
