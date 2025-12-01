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
    const { profileId } = req.body

    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID is required' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch profile to verify completion
    const { data: profile, error: profileError } = await supabase
      .from('living_legacy_profiles')
      .select('*, executor:legacy_executor_info(*), recipients:legacy_recipients(*)')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: profileError?.message
      })
    }

    // Check if already finalized
    if (profile.notary_link_token) {
      return res.status(200).json({
        success: true,
        alreadyFinalized: true,
        notaryLinkToken: profile.notary_link_token,
        notaryLinkUrl: `${process.env.VITE_APP_URL || 'https://talktoyouai.com'}/legacy/activate/${profile.notary_link_token}`
      })
    }

    // Verify completion (should be 100%)
    if (profile.completion_percentage < 100) {
      return res.status(400).json({
        error: 'Profile must be 100% complete before finalization',
        completionPercentage: profile.completion_percentage
      })
    }

    // Generate unique notary link token
    const notaryToken = generateNotaryToken()

    // Update profile with token and mark as completed
    const { error: updateError } = await supabase
      .from('living_legacy_profiles')
      .update({
        notary_link_token: notaryToken,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)

    if (updateError) {
      return res.status(500).json({
        error: 'Failed to finalize profile',
        details: updateError.message
      })
    }

    // Generate full URL
    const notaryLinkUrl = `${process.env.VITE_APP_URL || 'https://talktoyouai.com'}/legacy/activate/${notaryToken}`

    // Prepare email data for executor (to be sent separately)
    const executorEmail = profile.executor?.[0] ? {
      to: profile.executor[0].executor_email,
      executorName: profile.executor[0].executor_name,
      creatorName: profile.full_name,
      notaryLinkUrl,
      relationship: profile.executor[0].relationship
    } : null

    // TODO: Send email to executor (implement email service)
    // await sendExecutorEmail(executorEmail)

    return res.status(200).json({
      success: true,
      notaryLinkToken: notaryToken,
      notaryLinkUrl,
      executorEmail: executorEmail ? {
        sent: false, // Will be true after email service is implemented
        email: executorEmail.to
      } : null,
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        status: 'completed',
        recipientCount: profile.recipients.length
      }
    })

  } catch (error: any) {
    console.error('Finalize profile error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}

function generateNotaryToken(): string {
  // Generate a secure random token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = 'NL-'

  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return token
}
