/**
 * Attachment Picker Component
 *
 * Allows users to upload files to enhance the AI personality:
 * - Photos of the person
 * - Videos of the person
 * - Text samples (messages, letters, etc.)
 */

import { useRef } from 'react'
import { X, Image, Video, FileText, Upload } from 'lucide-react'

interface AttachmentPickerProps {
  onClose: () => void
  onUpload: (files: File[], type: 'photo' | 'video' | 'text') => void
  profileName: string
}

export default function AttachmentPicker({ onClose, onUpload, profileName }: AttachmentPickerProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video' | 'text') => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload(files, type)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Add to {profileName}'s Profile</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Help the AI better understand this person
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Photos */}
          <button
            onClick={() => photoInputRef.current?.click()}
            className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Image className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900">Photos</h3>
              <p className="text-sm text-gray-500">Upload photos for visual reference</p>
            </div>
            <Upload className="w-5 h-5 text-gray-400" />
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'photo')}
          />

          {/* Videos */}
          <button
            onClick={() => videoInputRef.current?.click()}
            className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900">Videos</h3>
              <p className="text-sm text-gray-500">Upload videos with voice and mannerisms</p>
            </div>
            <Upload className="w-5 h-5 text-gray-400" />
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'video')}
          />

          {/* Text Samples */}
          <button
            onClick={() => textInputRef.current?.click()}
            className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900">Text Samples</h3>
              <p className="text-sm text-gray-500">Messages, letters, or writing samples</p>
            </div>
            <Upload className="w-5 h-5 text-gray-400" />
          </button>
          <input
            ref={textInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx,.zip"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'text')}
          />
        </div>

        {/* Info */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p>
              <strong>Privacy:</strong> All files are stored locally on your device with end-to-end encryption.
              We never upload your personal data to external servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
