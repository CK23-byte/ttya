/**
 * Upload Face to Simli API
 *
 * Creates a custom faceID from a photo URL for use in video avatars.
 * Note: Face processing can take several hours to complete.
 *
 * POST /api/simli/upload-face
 * Body: { photoUrl, profileId, userId }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SIMLI_API_KEY = process.env.SIMLI_API_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📸 SIMLI FACE UPLOAD - START')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (req.method !== 'POST') {
    console.error('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { photoUrl, profileId, userId, avatarName } = req.body
  console.log('📥 Request body:', {
    photoUrl: photoUrl?.substring(0, 50) + '...',
    profileId,
    userId,
    avatarName
  })

  if (!photoUrl || !profileId || !userId || !avatarName) {
    console.error('❌ Missing required fields')
    return res.status(400).json({
      error: 'Missing required fields: photoUrl, profileId, userId, avatarName'
    })
  }

  if (!SIMLI_API_KEY) {
    console.error('❌ SIMLI_API_KEY not configured')
    return res.status(500).json({
      error: 'Simli API key not configured',
      hint: 'Set SIMLI_API_KEY in Vercel environment variables'
    })
  }

  console.log('✅ Request validation passed')

  try {
    // Step 1: Download image from Supabase URL
    console.log('📥 Step 1: Downloading image from Supabase...')
    console.log('🔗 GET', photoUrl)

    const imageResponse = await fetch(photoUrl)
    if (!imageResponse.ok) {
      console.error('❌ Failed to download image:', imageResponse.status, imageResponse.statusText)
      return res.status(400).json({
        error: 'Failed to download image from URL',
        details: `HTTP ${imageResponse.status}: ${imageResponse.statusText}`
      })
    }

    const imageBlob = await imageResponse.blob()
    console.log('✅ Image downloaded:', {
      size: imageBlob.size,
      type: imageBlob.type
    })

    // Step 2: Prepare multipart/form-data request
    console.log('📤 Step 2: Uploading photo to Simli API...')
    console.log('🔗 POST https://api.simli.ai/generateFaceID')

    // Create FormData
    const FormData = (await import('form-data')).default
    const formData = new FormData()

    // Convert Blob to Buffer for form-data
    const buffer = Buffer.from(await imageBlob.arrayBuffer())
    formData.append('image', buffer, {
      filename: 'avatar.jpg',
      contentType: imageBlob.type || 'image/jpeg'
    })
    formData.append('face_name', avatarName)

    console.log('📋 Form data prepared:', {
      imageSize: buffer.length,
      faceName: avatarName
    })

    const simliResponse = await fetch('https://api.simli.ai/generateFaceID', {
      method: 'POST',
      headers: {
        'api-key': SIMLI_API_KEY,
        ...formData.getHeaders()
      },
      body: formData as any
    })

    console.log('📊 Simli API response status:', simliResponse.status)

    if (!simliResponse.ok) {
      const errorText = await simliResponse.text()
      console.error('❌ Simli API error:', {
        status: simliResponse.status,
        statusText: simliResponse.statusText,
        body: errorText
      })

      return res.status(simliResponse.status).json({
        error: 'Simli API request failed',
        details: errorText,
        status: simliResponse.status
      })
    }

    const simliData = await simliResponse.json()
    console.log('✅ Simli API response:', simliData)

    // Extract faceID from response
    // Note: Actual response format may vary - adjust based on Simli's response
    const faceId = simliData.faceId || simliData.face_id || simliData.id
    const status = simliData.status || 'processing'

    if (!faceId) {
      console.error('❌ No faceID in Simli response:', simliData)
      return res.status(500).json({
        error: 'Invalid response from Simli API',
        details: 'No faceID returned',
        response: simliData
      })
    }

    console.log('✅ FaceID received:', faceId)
    console.log('📋 Status:', status)

    // Save avatar configuration to database
    console.log('📝 Step 2: Saving avatar to database...')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const avatarId = `simli_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const { error: dbError } = await supabase
      .from('simli_avatars')
      .upsert({
        avatar_id: avatarId,
        user_id: userId,
        profile_id: profileId,
        avatar_name: avatarName,
        photo_url: photoUrl,
        face_id: faceId,
        status: status, // 'processing', 'ready', 'failed'
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'profile_id' // Update if avatar already exists for this profile
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return res.status(500).json({
        error: 'Failed to save avatar configuration',
        details: dbError.message
      })
    }

    console.log('✅ Avatar saved to database')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ FACE UPLOAD COMPLETE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return res.status(200).json({
      success: true,
      avatarId,
      faceId,
      status,
      message: status === 'processing'
        ? 'Face upload started. Processing may take several hours. Check status later.'
        : 'Avatar created successfully',
      estimatedTime: status === 'processing' ? '1-3 hours' : null
    })

  } catch (error) {
    console.error('❌ ERROR in upload-face:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return res.status(500).json({
      error: 'Internal server error during face upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
