/**
 * Video Call Modal Component
 *
 * Allows users to:
 * - Buy video call credits
 * - Upload required media (photos/video + voice sample)
 */

import { useState, useRef } from 'react'
import { X, Video, Image, Mic, Upload, Check, ShoppingCart, AlertCircle } from 'lucide-react'

type ChatTheme = 'whatsapp' | 'imessage' | 'messenger'

const THEME_COLORS = {
  whatsapp: {
    gradient: 'from-[#00a884] to-[#005c4b]',
    bg: 'bg-[#1f2c34]',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    border: 'border-gray-700',
    input: 'bg-[#2a3942]',
    accent: 'bg-[#00a884]',
    accentHover: 'hover:bg-[#00957a]',
    notice: 'bg-[#1f2c34] border-[#00a884]/30',
    noticeText: 'text-gray-200',
    checkBg: 'bg-gray-700',
  },
  imessage: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    border: 'border-gray-200',
    input: 'bg-gray-100',
    accent: 'bg-blue-500',
    accentHover: 'hover:bg-blue-600',
    notice: 'bg-blue-50 border-blue-200',
    noticeText: 'text-blue-800',
    checkBg: 'bg-gray-200',
  },
  messenger: {
    gradient: 'from-blue-500 to-purple-500',
    bg: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    border: 'border-gray-200',
    input: 'bg-gray-100',
    accent: 'bg-gradient-to-r from-blue-500 to-purple-500',
    accentHover: 'hover:from-blue-600 hover:to-purple-600',
    notice: 'bg-purple-50 border-purple-200',
    noticeText: 'text-purple-800',
    checkBg: 'bg-gray-200',
  },
}

interface VideoCallModalProps {
  onClose: () => void
  profileName: string
  hasVoiceSample: boolean
  hasVisualMedia: boolean
  onUploadMedia: (files: File[], type: 'photo' | 'video' | 'voice') => void
  onBuyCredits: () => void
  theme?: ChatTheme
}

export default function VideoCallModal({
  onClose,
  profileName,
  hasVoiceSample,
  hasVisualMedia,
  onUploadMedia,
  onBuyCredits,
  theme = 'whatsapp'
}: VideoCallModalProps) {
  const colors = THEME_COLORS[theme]
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
      <div className={`${colors.bg} rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.gradient} px-6 py-4 sticky top-0`}>
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
          <div className={`${colors.notice} border rounded-xl p-4`}>
            <div className="flex gap-3">
              <AlertCircle className={`w-5 h-5 ${colors.noticeText} flex-shrink-0 mt-0.5`} />
              <div>
                <h3 className={`font-semibold ${colors.noticeText}`}>Requirements for Video Calls</h3>
                <p className={`text-sm ${colors.noticeText} opacity-80 mt-1`}>
                  To create a realistic video avatar of {profileName}, we need:
                </p>
                <ul className={`text-sm ${colors.noticeText} opacity-80 mt-2 space-y-1`}>
                  <li className="flex items-center gap-2">
                    {hasAnyVisual ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className={`w-4 h-4 border-2 ${colors.border} rounded`} />
                    )}
                    Photos or video of the person
                  </li>
                  <li className="flex items-center gap-2">
                    {hasVoice ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className={`w-4 h-4 border-2 ${colors.border} rounded`} />
                    )}
                    At least 10 seconds of voice
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Visual Media */}
          <div className="space-y-3">
            <h3 className={`font-semibold ${colors.text} flex items-center gap-2`}>
              <Image className="w-5 h-5" />
              Visual Media
              {hasAnyVisual && <Check className="w-4 h-4 text-green-500" />}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Photos */}
              <button
                onClick={() => photoInputRef.current?.click()}
                className={`flex flex-col items-center gap-2 p-4 border-2 border-dashed ${colors.border} rounded-xl hover:opacity-80 transition ${colors.input}`}
              >
                <Image className={`w-8 h-8 ${colors.textMuted}`} />
                <span className={`text-sm font-medium ${colors.text}`}>Photos</span>
                {uploadedPhotos.length > 0 && (
                  <span className={`text-xs ${theme === 'whatsapp' ? 'text-[#00a884]' : theme === 'imessage' ? 'text-blue-500' : 'text-purple-500'}`}>{uploadedPhotos.length} uploaded</span>
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
                className={`flex flex-col items-center gap-2 p-4 border-2 border-dashed ${colors.border} rounded-xl hover:opacity-80 transition ${colors.input}`}
              >
                <Video className={`w-8 h-8 ${colors.textMuted}`} />
                <span className={`text-sm font-medium ${colors.text}`}>Video</span>
                {uploadedVideo && (
                  <span className={`text-xs ${theme === 'whatsapp' ? 'text-[#00a884]' : theme === 'imessage' ? 'text-blue-500' : 'text-purple-500'}`}>1 uploaded</span>
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
            <h3 className={`font-semibold ${colors.text} flex items-center gap-2`}>
              <Mic className="w-5 h-5" />
              Voice Sample (10+ seconds)
              {hasVoice && <Check className="w-4 h-4 text-green-500" />}
            </h3>

            <button
              onClick={() => voiceInputRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed ${colors.border} rounded-xl ${colors.text} opacity-70 hover:opacity-100 transition`}
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
            <p className={`text-xs ${colors.textMuted}`}>
              You can also upload a video with audio - we'll extract the voice automatically.
            </p>
          </div>

          {/* Buy Credits Section */}
          <div className={`border-t ${colors.border} pt-6`}>
            <h3 className={`font-semibold ${colors.text} mb-3`}>Video Call Credits</h3>
            <div className={`${theme === 'whatsapp' ? 'bg-[#005c4b]/20' : 'bg-gradient-to-r from-purple-50 to-pink-50'} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`font-semibold ${colors.text}`}>Video Pack</p>
                  <p className={`text-sm ${colors.textMuted}`}>10 minutes of video calls</p>
                </div>
                <p className={`text-2xl font-bold ${theme === 'whatsapp' ? 'text-[#00a884]' : theme === 'imessage' ? 'text-blue-500' : 'text-purple-500'}`}>€14.99</p>
              </div>
              <button
                onClick={onBuyCredits}
                disabled={!hasRequiredMedia}
                className={`w-full py-3 ${colors.accent} text-white rounded-lg font-medium ${colors.accentHover} transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                <ShoppingCart className="w-5 h-5" />
                {hasRequiredMedia ? 'Buy Video Credits' : 'Upload Required Media First'}
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className={`${colors.input} rounded-lg p-4 text-xs ${colors.textMuted}`}>
            <strong>Privacy:</strong> All media is processed locally and stored with end-to-end encryption.
            Your personal data never leaves your device unencrypted.
          </div>
        </div>
      </div>
    </div>
  )
}
