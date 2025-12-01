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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      userId,
      fullName,
      dateOfBirth,
      tier,
      onboardingData
    } = req.body

    // Validation
    if (!userId || !fullName || !tier) {
      return res.status(400).json({
        error: 'Missing required fields: userId, fullName, tier'
      })
    }

    if (!['essential', 'complete', 'premium'].includes(tier)) {
      return res.status(400).json({
        error: 'Invalid tier. Must be: essential, complete, or premium'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user already has a Living Legacy profile
    const { data: existingProfile } = await supabase
      .from('living_legacy_profiles')
      .select('id')
      .eq('creator_id', userId)
      .single()

    if (existingProfile) {
      return res.status(409).json({
        error: 'User already has a Living Legacy profile',
        profileId: existingProfile.id
      })
    }

    // Determine features based on tier
    const hasVoiceClone = tier === 'complete' || tier === 'premium'
    const hasVideoAvatar = tier === 'complete' || tier === 'premium'

    // Create the profile
    const { data: profile, error: profileError } = await supabase
      .from('living_legacy_profiles')
      .insert({
        creator_id: userId,
        full_name: fullName,
        date_of_birth: dateOfBirth || null,
        tier,
        has_voice_clone: hasVoiceClone,
        has_video_avatar: hasVideoAvatar,
        status: 'draft',
        completion_percentage: 0,
        onboarding_data: onboardingData || {},
        current_location: onboardingData?.currentLocation || null,
        occupation: onboardingData?.occupation || null
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return res.status(500).json({
        error: 'Failed to create profile',
        details: profileError.message
      })
    }

    // Create voice clone record if applicable
    if (hasVoiceClone) {
      await supabase
        .from('legacy_voice_clones')
        .insert({
          profile_id: profile.id,
          voice_name: `${fullName}'s Voice`,
          clone_status: 'not_started'
        })
    }

    // Create video avatar record if applicable
    if (hasVideoAvatar) {
      await supabase
        .from('legacy_video_avatars')
        .insert({
          profile_id: profile.id,
          avatar_name: `${fullName}'s Avatar`,
          avatar_status: 'not_started',
          avatar_type: tier === 'premium' ? 'ultra_hd' : 'hd'
        })
    }

    // Add recipients from onboarding if provided
    if (onboardingData?.recipients && Array.isArray(onboardingData.recipients)) {
      const recipients = onboardingData.recipients.map((r: any) => ({
        profile_id: profile.id,
        name: r.name,
        relationship: r.relationship,
        age: r.age || null,
        email: r.email || null,
        is_primary: r.name === onboardingData.primaryRecipient,
        can_video_call: tier === 'premium'
      }))

      await supabase
        .from('legacy_recipients')
        .insert(recipients)
    }

    // Add executor info if provided
    if (onboardingData?.executorName) {
      await supabase
        .from('legacy_executor_info')
        .insert({
          profile_id: profile.id,
          executor_name: onboardingData.executorName,
          executor_email: onboardingData.executorEmail || null,
          executor_phone: onboardingData.executorPhone || null,
          relationship: onboardingData.executorRelationship || null,
          has_notary: onboardingData.hasNotary || false,
          notary_name: onboardingData.notaryInfo?.name || null,
          notary_firm: onboardingData.notaryInfo?.firm || null,
          notary_email: onboardingData.notaryInfo?.email || null,
          notary_phone: onboardingData.notaryInfo?.phone || null
        })
    }

    return res.status(201).json({
      success: true,
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        tier: profile.tier,
        status: profile.status,
        completionPercentage: profile.completion_percentage,
        hasVoiceClone: profile.has_voice_clone,
        hasVideoAvatar: profile.has_video_avatar
      }
    })

  } catch (error: any) {
    console.error('Create profile error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}
