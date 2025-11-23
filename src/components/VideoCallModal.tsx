/**
 * Video Call Modal Component
 *
 * Allows users to:
 * - Buy video call credits
 * - Upload required media (photos/video + voice sample)
 */

import { useState, useRef } from 'react'
import { X, Video, Image, Mic, Upload, Check, ShoppingCart, AlertCircle } from 'lucide-react'

interface VideoCallModalProps {
  onClose: () => void
  profileName: string
  hasVoiceSample: boolean
  hasVisualMedia: boolean
  onUploadMedia: (files: File[], type: 'photo' | 'video' | 'voice') => void
  onBuyCredits: () => void
}

export default function VideoCallModal({
  onClose,
  profileName,
  hasVoiceSample,
  hasVisualMedia,
  onUploadMedia,
  onBuyCredits
}: VideoCallModalProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([])
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
  const [uploadedVoice, setUploadedVoice] = useState<File | null>(null)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const voiceInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedPhotos(prev => [...prev, ...files])
      onUploadMedia(files, 'photo')
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedVideo(file)
      onUploadMedia([file], 'video')
    }
  }

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedVoice(file)
      onUploadMedia([file], 'voice')
    }
  }

  const hasRequiredMedia = (hasVisualMedia || uploadedPhotos.length > 0 || uploadedVideo) && (hasVoiceSample || uploadedVoice)
  const hasAnyVisual = hasVisualMedia || uploadedPhotos.length > 0 || uploadedVideo
  const hasVoice = hasVoiceSample || uploadedVoice

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Video Calls</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Requirements Notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-800">Requirements for Video Calls</h3>
                <p className="text-sm text-purple-700 mt-1">
                  To create a realistic video avatar of {profileName}, we need:
                </p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    {hasAnyVisual ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="w-4 h-4 border-2 border-purple-400 rounded" />
                    )}
                    Photos or video of the person
                  </li>
                  <li className="flex items-center gap-2">
                    {hasVoice ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="w-4 h-4 border-2 border-purple-400 rounded" />
                    )}
                    At least 10 seconds of voice
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Visual Media */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Visual Media
              {hasAnyVisual && <Check className="w-4 h-4 text-green-500" />}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Photos */}
              <button
                onClick={() => photoInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition"
              >
                <Image className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Photos</span>
                {uploadedPhotos.length > 0 && (
                  <span className="text-xs text-purple-600">{uploadedPhotos.length} uploaded</span>
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {/* Video */}
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition"
              >
                <Video className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Video</span>
                {uploadedVideo && (
                  <span className="text-xs text-purple-600">1 uploaded</span>
                )}
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
              />
            </div>
          </div>

          {/* Upload Voice */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Sample (10+ seconds)
              {hasVoice && <Check className="w-4 h-4 text-green-500" />}
            </h3>

            <button
              onClick={() => voiceInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition"
            >
              <Upload className="w-5 h-5" />
              {uploadedVoice ? uploadedVoice.name : (hasVoiceSample ? 'Update Voice Sample' : 'Upload Voice Sample')}
            </button>
            <input
              ref={voiceInputRef}
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={handleVoiceUpload}
            />
            <p className="text-xs text-gray-500">
              You can also upload a video with audio - we'll extract the voice automatically.
            </p>
          </div>

          {/* Buy Credits Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Video Call Credits</h3>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">Video Pack</p>
                  <p className="text-sm text-gray-600">10 minutes of video calls</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">€14.99</p>
              </div>
              <button
                onClick={onBuyCredits}
                disabled={!hasRequiredMedia}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {hasRequiredMedia ? 'Buy Video Credits' : 'Upload Required Media First'}
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
            <strong>Privacy:</strong> All media is processed locally and stored with end-to-end encryption.
            Your personal data never leaves your device unencrypted.
          </div>
        </div>
      </div>
    </div>
  )
}
