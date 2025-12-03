/**
 * Supabase Storage Service
 * Handles file uploads for Living Legacy content
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface UploadResult {
  path: string
  publicUrl: string
  bucket: string
}

/**
 * Upload voice recording to Supabase Storage
 */
export async function uploadVoiceRecording(
  file: File,
  userId: string
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `voice/${fileName}`

  const { data, error } = await supabase.storage
    .from('living-legacy')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload voice recording: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('living-legacy')
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
    bucket: 'living-legacy',
  }
}

/**
 * Upload video recording to Supabase Storage
 */
export async function uploadVideoRecording(
  file: File,
  userId: string
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `video/${fileName}`

  const { data, error } = await supabase.storage
    .from('living-legacy')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload video recording: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('living-legacy')
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
    bucket: 'living-legacy',
  }
}

/**
 * Upload text content to Supabase Storage
 */
export async function uploadTextContent(
  file: File,
  userId: string
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `text/${fileName}`

  const { data, error } = await supabase.storage
    .from('living-legacy')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload text content: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('living-legacy')
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
    bucket: 'living-legacy',
  }
}

/**
 * Upload generated avatar video to storage
 */
export async function uploadGeneratedVideo(
  videoBlob: Blob,
  userId: string,
  messageId: string
): Promise<UploadResult> {
  const fileName = `${userId}/generated/${messageId}_${Date.now()}.mp4`
  const filePath = `avatars/${fileName}`

  const { data, error } = await supabase.storage
    .from('living-legacy')
    .upload(filePath, videoBlob, {
      contentType: 'video/mp4',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload generated video: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('living-legacy')
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
    bucket: 'living-legacy',
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Get download URL for a file (with optional expiration)
 */
export async function getDownloadUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to get download URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * List all files for a user
 */
export async function listUserFiles(userId: string, type?: 'voice' | 'video' | 'text') {
  const prefix = type ? `${type}/${userId}/` : userId

  const { data, error } = await supabase.storage
    .from('living-legacy')
    .list(prefix, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}
