/**
import { logger } from '../utils/logger'
 * Supabase Storage Utilities
import { logger } from '../utils/logger'
 *
import { logger } from '../utils/logger'
 * Handles file uploads to Supabase Storage for large files (videos, photos, audio)
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

export interface UploadResult {
  url: string
  path: string
  publicUrl: string
}

/**
 * Upload a file to Supabase Storage
 *
 * @param file - The file to upload
 * @param bucket - Storage bucket name (default: 'user-uploads')
 * @param folder - Optional folder path within bucket
 * @returns Upload result with URLs
 */
export async function uploadFileToStorage(
  file: File,
  bucket: string = 'user-uploads',
  folder?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`

    // Construct full path
    const filePath = folder ? `${folder}/${fileName}` : fileName

    logger.log('Uploading file to Supabase Storage:', {
      fileName,
      size: file.size,
      type: file.type,
      path: filePath
    })

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      logger.error('Supabase Storage upload error:', error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    logger.log('File uploaded successfully:', {
      path: data.path,
      publicUrl
    })

    return {
      url: publicUrl,
      path: data.path,
      publicUrl
    }
  } catch (error) {
    logger.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 *
 * @param path - The file path in storage
 * @param bucket - Storage bucket name (default: 'user-uploads')
 */
export async function deleteFileFromStorage(
  path: string,
  bucket: string = 'user-uploads'
): Promise<void> {
  try {
    logger.log('Deleting file from Supabase Storage:', path)

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      logger.error('Supabase Storage delete error:', error)
      throw new Error(`Failed to delete file: ${error.message}`)
    }

    logger.log('File deleted successfully')
  } catch (error) {
    logger.error('Error deleting file:', error)
    // Don't throw - deletion is best effort
  }
}

/**
 * Extract audio from video file using Web Audio API
 * Returns a Blob containing audio-only version of the video
 *
 * @param videoFile - The video file to extract audio from
 * @returns Audio blob (WebM format)
 */
export async function extractAudioFromVideo(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const videoElement = document.createElement('video')
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      videoElement.src = URL.createObjectURL(videoFile)

      videoElement.addEventListener('loadedmetadata', async () => {
        try {
          // Create media source
          const source = audioContext.createMediaElementSource(videoElement)
          const destination = audioContext.createMediaStreamDestination()

          source.connect(destination)

          // Create MediaRecorder to capture audio
          const mediaRecorder = new MediaRecorder(destination.stream, {
            mimeType: 'audio/webm'
          })

          const audioChunks: Blob[] = []

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data)
            }
          }

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
            URL.revokeObjectURL(videoElement.src)
            resolve(audioBlob)
          }

          mediaRecorder.onerror = (error) => {
            URL.revokeObjectURL(videoElement.src)
            reject(error)
          }

          // Start recording and play video
          mediaRecorder.start()
          await videoElement.play()

          // Stop when video ends
          videoElement.onended = () => {
            mediaRecorder.stop()
          }
        } catch (error) {
          URL.revokeObjectURL(videoElement.src)
          reject(error)
        }
      })

      videoElement.onerror = () => {
        URL.revokeObjectURL(videoElement.src)
        reject(new Error('Failed to load video'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Convert audio/video file to a format suitable for voice cloning
 * If it's a video, extract audio first
 * Then convert to MP3 if needed
 *
 * @param file - Audio or video file
 * @returns Audio file ready for voice cloning
 */
export async function prepareAudioForVoiceCloning(file: File): Promise<File> {
  logger.log('Preparing audio for voice cloning:', {
    name: file.name,
    type: file.type,
    size: file.size
  })

  // If it's already an audio file and supported format, return as-is
  const supportedAudioFormats = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/flac']
  if (supportedAudioFormats.includes(file.type)) {
    logger.log('File is already in supported audio format')
    return file
  }

  // If it's a video, extract audio
  if (file.type.startsWith('video/')) {
    logger.log('Extracting audio from video...')
    const audioBlob = await extractAudioFromVideo(file)

    // Convert blob to File
    const audioFile = new File([audioBlob], file.name.replace(/\.[^/.]+$/, '.webm'), {
      type: 'audio/webm'
    })

    logger.log('Audio extracted from video:', {
      size: audioFile.size,
      type: audioFile.type
    })

    return audioFile
  }

  // If it's an unsupported audio format, return as-is and let the backend handle it
  logger.warn('Unsupported format, passing through:', file.type)
  return file
}
