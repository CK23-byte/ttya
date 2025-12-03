/**
 * Avatar Orchestration Service
 * Combines ElevenLabs voice cloning + D-ID video generation
 * Main service for creating and interacting with Living Legacy avatars
 */

import * as ElevenLabs from './elevenlabs.service'
import * as DID from './did.service'
import * as Storage from './storage.service'
import { supabase } from './storage.service'

export interface AvatarProfile {
  id: string
  user_id: string
  name: string
  elevenlabs_voice_id: string | null
  did_presenter_id: string | null
  presenter_image_url: string | null
  voice_samples_count: number
  video_samples_count: number
  text_samples_count: number
  quality_score: number
  status: 'creating' | 'training' | 'ready' | 'error'
  created_at: string
  updated_at: string
}

export interface CreateAvatarRequest {
  userId: string
  name: string
  voiceFiles: File[]
  presenterImage: File
}

export interface AvatarMessageRequest {
  avatarId: string
  messageText: string
  recipientId?: string
}

export interface AvatarMessageResponse {
  messageId: string
  videoUrl: string
  audioUrl: string
  status: 'processing' | 'completed' | 'error'
}

/**
 * Step 1: Create avatar profile from uploads
 * Processes voice samples and creates cloned voice + presenter
 */
export async function createAvatar(request: CreateAvatarRequest): Promise<AvatarProfile> {
  try {
    // 1. Upload voice files to storage
    console.log('Uploading voice files...')
    const voiceUploadPromises = request.voiceFiles.map(file =>
      Storage.uploadVoiceRecording(file, request.userId)
    )
    const voiceUrls = await Promise.all(voiceUploadPromises)

    // 2. Clone voice with ElevenLabs
    console.log('Cloning voice with ElevenLabs...')
    const voiceClone = await ElevenLabs.cloneVoice({
      name: `${request.name}_voice`,
      description: `Living Legacy voice for ${request.name}`,
      files: request.voiceFiles,
      labels: {
        type: 'living_legacy',
        user_id: request.userId,
      },
    })

    // 3. Upload presenter image to storage
    console.log('Uploading presenter image...')
    const presenterUpload = await Storage.uploadVideoRecording(
      request.presenterImage,
      request.userId
    )

    // 4. Create D-ID presenter
    console.log('Creating D-ID presenter...')
    const presenter = await DID.createPresenter(presenterUpload.publicUrl)

    // 5. Save avatar profile to database
    console.log('Saving avatar profile...')
    const { data: profile, error } = await supabase
      .from('avatar_profiles')
      .insert({
        user_id: request.userId,
        name: request.name,
        elevenlabs_voice_id: voiceClone.voice_id,
        did_presenter_id: presenter.id,
        presenter_image_url: presenterUpload.publicUrl,
        voice_samples_count: request.voiceFiles.length,
        video_samples_count: 1,
        text_samples_count: 0,
        quality_score: calculateQualityScore(request.voiceFiles.length, 1, 0),
        status: 'ready',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save avatar profile: ${error.message}`)
    }

    return profile
  } catch (error) {
    console.error('Error creating avatar:', error)
    throw error
  }
}

/**
 * Step 2: Generate avatar video message
 * Creates a talking video of the avatar delivering a message
 */
export async function generateAvatarMessage(
  request: AvatarMessageRequest
): Promise<AvatarMessageResponse> {
  try {
    // 1. Get avatar profile
    const { data: avatar, error } = await supabase
      .from('avatar_profiles')
      .select('*')
      .eq('id', request.avatarId)
      .single()

    if (error || !avatar) {
      throw new Error('Avatar not found')
    }

    if (!avatar.elevenlabs_voice_id || !avatar.presenter_image_url) {
      throw new Error('Avatar not fully configured')
    }

    // 2. Generate speech with ElevenLabs
    console.log('Generating speech...')
    const audioBlob = await ElevenLabs.textToSpeech({
      text: request.messageText,
      voice_id: avatar.elevenlabs_voice_id,
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true,
      },
    })

    // 3. Upload audio to storage
    const audioFile = new File([audioBlob], 'speech.mp3', { type: 'audio/mpeg' })
    const audioUpload = await Storage.uploadVoiceRecording(audioFile, avatar.user_id)

    // 4. Generate video with D-ID
    console.log('Generating avatar video...')
    const videoUrl = await DID.generateAvatarVideo(
      avatar.presenter_image_url,
      audioUpload.publicUrl,
      avatar.elevenlabs_voice_id
    )

    // 5. Create message record
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const { error: messageError } = await supabase.from('avatar_messages').insert({
      id: messageId,
      avatar_id: request.avatarId,
      recipient_id: request.recipientId,
      message_text: request.messageText,
      audio_url: audioUpload.publicUrl,
      video_url: videoUrl,
      status: 'completed',
    })

    if (messageError) {
      console.error('Failed to save message:', messageError)
    }

    return {
      messageId,
      videoUrl,
      audioUrl: audioUpload.publicUrl,
      status: 'completed',
    }
  } catch (error) {
    console.error('Error generating avatar message:', error)
    throw error
  }
}

/**
 * Update avatar with additional content
 */
export async function updateAvatarContent(
  avatarId: string,
  content: {
    voiceFiles?: File[]
    videoFiles?: File[]
    textFiles?: File[]
  }
): Promise<AvatarProfile> {
  const { data: avatar, error } = await supabase
    .from('avatar_profiles')
    .select('*')
    .eq('id', avatarId)
    .single()

  if (error || !avatar) {
    throw new Error('Avatar not found')
  }

  let updates: Partial<AvatarProfile> = {}

  // Update voice samples if provided
  if (content.voiceFiles && content.voiceFiles.length > 0) {
    // Upload new voice samples
    await Promise.all(
      content.voiceFiles.map(file => Storage.uploadVoiceRecording(file, avatar.user_id))
    )

    updates.voice_samples_count = avatar.voice_samples_count + content.voiceFiles.length

    // Optionally re-train voice (would need to delete and recreate)
    // For now, we'll keep the existing voice_id
  }

  // Update video samples if provided
  if (content.videoFiles && content.videoFiles.length > 0) {
    await Promise.all(
      content.videoFiles.map(file => Storage.uploadVideoRecording(file, avatar.user_id))
    )

    updates.video_samples_count = avatar.video_samples_count + content.videoFiles.length
  }

  // Update text samples if provided
  if (content.textFiles && content.textFiles.length > 0) {
    await Promise.all(
      content.textFiles.map(file => Storage.uploadTextContent(file, avatar.user_id))
    )

    updates.text_samples_count = avatar.text_samples_count + content.textFiles.length
  }

  // Recalculate quality score
  updates.quality_score = calculateQualityScore(
    updates.voice_samples_count || avatar.voice_samples_count,
    updates.video_samples_count || avatar.video_samples_count,
    updates.text_samples_count || avatar.text_samples_count
  )

  // Update database
  const { data: updatedAvatar, error: updateError } = await supabase
    .from('avatar_profiles')
    .update(updates)
    .eq('id', avatarId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to update avatar: ${updateError.message}`)
  }

  return updatedAvatar
}

/**
 * Get avatar profile by ID
 */
export async function getAvatar(avatarId: string): Promise<AvatarProfile | null> {
  const { data, error } = await supabase
    .from('avatar_profiles')
    .select('*')
    .eq('id', avatarId)
    .single()

  if (error) {
    console.error('Error fetching avatar:', error)
    return null
  }

  return data
}

/**
 * Get all avatars for a user
 */
export async function getUserAvatars(userId: string): Promise<AvatarProfile[]> {
  const { data, error } = await supabase
    .from('avatar_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user avatars:', error)
    return []
  }

  return data || []
}

/**
 * Delete avatar and cleanup resources
 */
export async function deleteAvatar(avatarId: string): Promise<void> {
  const avatar = await getAvatar(avatarId)
  if (!avatar) {
    throw new Error('Avatar not found')
  }

  // Delete ElevenLabs voice
  if (avatar.elevenlabs_voice_id) {
    try {
      await ElevenLabs.deleteVoice(avatar.elevenlabs_voice_id)
    } catch (error) {
      console.error('Failed to delete ElevenLabs voice:', error)
    }
  }

  // Delete from database
  const { error } = await supabase.from('avatar_profiles').delete().eq('id', avatarId)

  if (error) {
    throw new Error(`Failed to delete avatar: ${error.message}`)
  }

  // Note: D-ID doesn't require deletion of presenters
  // Storage files can be cleaned up separately if needed
}

/**
 * Calculate quality score based on content uploads
 */
function calculateQualityScore(
  voiceCount: number,
  videoCount: number,
  textCount: number
): number {
  const voiceScore = Math.min(100, voiceCount * 10)
  const videoScore = Math.min(100, videoCount * 25)
  const textScore = Math.min(100, textCount * 5)

  return Math.round((voiceScore + videoScore + textScore) / 3)
}

/**
 * Get avatar message history
 */
export async function getAvatarMessages(avatarId: string) {
  const { data, error } = await supabase
    .from('avatar_messages')
    .select('*')
    .eq('avatar_id', avatarId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}
