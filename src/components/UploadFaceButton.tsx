/**
 * Upload Face to Simli Button Component
 *
 * Allows triggering custom face upload for existing photos
 */

import { useState } from 'react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

interface UploadFaceButtonProps {
  profileId: string
  photoUrl: string
  avatarName: string
}

export default function UploadFaceButton({ profileId, photoUrl, avatarName }: UploadFaceButtonProps) {
  const { user } = useSupabaseAuth()
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const handleUpload = async () => {
    if (!user) {
      setStatus('error')
      setMessage('Not authenticated')
      return
    }

    setUploading(true)
    setStatus('uploading')
    setMessage('Uploading photo to Simli...')

    try {
      const response = await fetch('/api/simli/upload-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photoUrl,
          profileId,
          userId: user.id,
          avatarName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setStatus('success')
      setMessage(`✅ Upload started! Processing time: ${data.estimatedTime || '1-3 hours'}. Video calls will use custom face when ready.`)

      console.log('✅ Face upload started:', data)
    } catch (error) {
      console.error('❌ Face upload error:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleUpload}
        disabled={uploading || status === 'success'}
        className={`w-full px-4 py-2 rounded-lg font-medium transition ${
          status === 'success'
            ? 'bg-green-100 text-green-700 cursor-not-allowed'
            : status === 'error'
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : uploading
            ? 'bg-gray-100 text-gray-400 cursor-wait'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Uploading...
          </span>
        ) : status === 'success' ? (
          '✅ Upload Started'
        ) : (
          '🎭 Create Custom Avatar'
        )}
      </button>

      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          status === 'success'
            ? 'bg-green-50 text-green-700'
            : status === 'error'
            ? 'bg-red-50 text-red-700'
            : 'bg-blue-50 text-blue-700'
        }`}>
          {message}
        </div>
      )}

      {status === 'idle' && (
        <p className="text-xs text-gray-500">
          ℹ️ Processing takes 1-3 hours. Video calls use default avatar during processing.
        </p>
      )}
    </div>
  )
}
