/**
 * Permission Modal Component
 *
 * Friendly modal to request device permissions before showing browser prompts
 * Explains why the permission is needed and handles denials gracefully
 */

import { Mic, Camera, Shield } from 'lucide-react'

interface PermissionModalProps {
  isOpen: boolean
  permissionType: 'microphone' | 'camera' | 'both'
  onAllow: () => void
  onCancel: () => void
}

export default function PermissionModal({
  isOpen,
  permissionType,
  onAllow,
  onCancel
}: PermissionModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (permissionType) {
      case 'microphone':
        return <Mic className="w-10 h-10 text-green-500" />
      case 'camera':
        return <Camera className="w-10 h-10 text-blue-500" />
      case 'both':
        return (
          <div className="flex gap-2">
            <Mic className="w-8 h-8 text-green-500" />
            <Camera className="w-8 h-8 text-blue-500" />
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (permissionType) {
      case 'microphone':
        return 'Microphone Access Required'
      case 'camera':
        return 'Camera Access Required'
      case 'both':
        return 'Camera & Microphone Required'
    }
  }

  const getMessage = () => {
    switch (permissionType) {
      case 'microphone':
        return 'To start a voice call, we need access to your microphone so you can speak with the AI.'
      case 'camera':
        return 'To take a photo, we need access to your camera.'
      case 'both':
        return 'To start a video call, we need access to your camera and microphone.'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-fade-in">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            {getIcon()}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-center">{getMessage()}</p>

          {/* Privacy assurances */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Your data stays private and secure</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Audio is processed in real-time, not stored</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>You can revoke access anytime in browser settings</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={onAllow}
            className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-medium transition shadow-lg shadow-green-500/25"
          >
            Allow Access
          </button>
        </div>
      </div>
    </div>
  )
}
