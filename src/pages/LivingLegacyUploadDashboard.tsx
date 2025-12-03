import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  Mic,
  Video,
  X,
  Check,
  Trash2,
  Eye,
  Sparkles,
  User,
  TrendingUp,
  AlertCircle,
  Camera,
  Loader2,
  CheckCircle2,
  MessageCircle
} from 'lucide-react'
import DirectRecordingModal from '../components/DirectRecordingModal'
import * as AvatarService from '../services/avatar.service'

interface UploadedFile {
  id: string
  type: 'text' | 'voice' | 'video'
  file: File
  name: string
  size: number
  uploadedAt: Date
  preview?: string
  duration?: number
}

interface AvatarQuality {
  overall: number
  voiceClarity: number
  visualQuality: number
  textContent: number
}

export default function LivingLegacyUploadDashboard() {
  const navigate = useNavigate()
  const textInputRef = useRef<HTMLInputElement>(null)
  const voiceInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [showDirectRecording, setShowDirectRecording] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState<UploadedFile | null>(null)

  // Avatar creation state
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false)
  const [avatarCreated, setAvatarCreated] = useState(false)
  const [creationProgress, setCreationProgress] = useState('')
  const [avatarId, setAvatarId] = useState<string | null>(null)

  // Calculate avatar quality based on uploads
  const avatarQuality: AvatarQuality = {
    overall: Math.min(
      100,
      (uploads.filter(u => u.type === 'text').length * 10 +
        uploads.filter(u => u.type === 'voice').length * 15 +
        uploads.filter(u => u.type === 'video').length * 25)
    ),
    voiceClarity: Math.min(100, uploads.filter(u => u.type === 'voice').length * 20),
    visualQuality: Math.min(100, uploads.filter(u => u.type === 'video').length * 25),
    textContent: Math.min(100, uploads.filter(u => u.type === 'text').length * 15)
  }

  const handleFileUpload = (type: 'text' | 'voice' | 'video', files: FileList | null) => {
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      const newUpload: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        type,
        file,
        name: file.name,
        size: file.size,
        uploadedAt: new Date()
      }

      // Create preview for video
      if (type === 'video') {
        const url = URL.createObjectURL(file)
        newUpload.preview = url
      }

      setUploads(prev => [...prev, newUpload])
    })
  }

  const deleteUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600 bg-green-100'
    if (quality >= 50) return 'text-orange-600 bg-orange-100'
    return 'text-rose-600 bg-rose-100'
  }

  const getQualityText = (quality: number) => {
    if (quality >= 80) return 'Excellent'
    if (quality >= 50) return 'Good'
    if (quality >= 25) return 'Fair'
    return 'Getting Started'
  }

  const handleCreateAvatar = async () => {
    try {
      setIsCreatingAvatar(true)
      setCreationProgress('Preparing files...')

      const userStr = localStorage.getItem('living_legacy_user')
      if (!userStr) {
        throw new Error('Please log in first')
      }
      const user = JSON.parse(userStr)

      const voiceFiles = uploads.filter(u => u.type === 'voice').map(u => u.file)
      const videoFiles = uploads.filter(u => u.type === 'video')

      if (voiceFiles.length < 3) {
        alert('Please upload at least 3 voice recordings for better quality voice cloning')
        setIsCreatingAvatar(false)
        return
      }

      if (videoFiles.length === 0) {
        alert('Please upload at least 1 video or photo for avatar creation')
        setIsCreatingAvatar(false)
        return
      }

      const presenterImage = videoFiles[0].file

      setCreationProgress('Uploading voice samples...')
      await new Promise(resolve => setTimeout(resolve, 500))

      setCreationProgress('Cloning your voice with AI...')
      await new Promise(resolve => setTimeout(resolve, 500))

      setCreationProgress('Creating digital avatar...')
      await new Promise(resolve => setTimeout(resolve, 500))

      const avatar = await AvatarService.createAvatar({
        userId: user.email,
        name: `${user.firstName} ${user.lastName}`,
        voiceFiles,
        presenterImage,
      })

      setCreationProgress('Avatar created successfully!')
      setAvatarId(avatar.id)
      setAvatarCreated(true)

      setTimeout(() => {
        setIsCreatingAvatar(false)
        setCreationProgress('')
      }, 2000)

    } catch (error) {
      console.error('Error creating avatar:', error)
      alert(`Failed to create avatar: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsCreatingAvatar(false)
      setCreationProgress('')
    }
  }

  const canCreateAvatar =
    uploads.filter(u => u.type === 'voice').length >= 3 &&
    uploads.filter(u => u.type === 'video').length >= 1 &&
    !avatarCreated &&
    !isCreatingAvatar

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Your Living Legacy</h1>
              <p className="text-sm text-gray-600">Upload content to build your digital avatar</p>
            </div>
            <button
              onClick={() => setShowDirectRecording(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg"
            >
              <Camera className="w-5 h-5" />
              <span className="hidden sm:inline">Quick Record (10s)</span>
              <span className="sm:hidden">Record</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Text Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Text Content</h3>
                <p className="text-xs text-gray-600">Stories & Messages</p>
              </div>
            </div>

            <input
              ref={textInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload('text', e.target.files)}
            />

            <button
              onClick={() => textInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <Upload className="w-8 h-8 text-blue-400 group-hover:text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload</p>
              <p className="text-xs text-gray-500 mt-1">TXT, PDF, DOC</p>
            </button>

            {/* Text Files List */}
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {uploads.filter(u => u.type === 'text').map(upload => (
                <div key={upload.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg group">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{upload.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(upload.size)}</p>
                  </div>
                  <button
                    onClick={() => deleteUpload(upload.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              {uploads.filter(u => u.type === 'text').length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No text files uploaded yet</p>
              )}
            </div>
          </div>

          {/* Voice Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Voice Recordings</h3>
                <p className="text-xs text-gray-600">Audio Messages</p>
              </div>
            </div>

            <input
              ref={voiceInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.ogg"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload('voice', e.target.files)}
            />

            <button
              onClick={() => voiceInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <Upload className="w-8 h-8 text-purple-400 group-hover:text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload</p>
              <p className="text-xs text-gray-500 mt-1">MP3, WAV, M4A</p>
            </button>

            {/* Voice Files List */}
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {uploads.filter(u => u.type === 'voice').map(upload => (
                <div key={upload.id} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg group">
                  <Mic className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{upload.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(upload.size)}</p>
                  </div>
                  <button
                    onClick={() => deleteUpload(upload.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              {uploads.filter(u => u.type === 'voice').length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No voice recordings uploaded yet</p>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Video Content</h3>
                <p className="text-xs text-gray-600">Visual Messages</p>
              </div>
            </div>

            <input
              ref={videoInputRef}
              type="file"
              accept=".mp4,.mov,.avi,.webm"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload('video', e.target.files)}
            />

            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <Upload className="w-8 h-8 text-orange-400 group-hover:text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload</p>
              <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI</p>
            </button>

            {/* Video Files List */}
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {uploads.filter(u => u.type === 'video').map(upload => (
                <div key={upload.id} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg group">
                  <Video className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{upload.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(upload.size)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPreview(upload)}
                    className="p-1 hover:bg-orange-200 rounded transition-all"
                  >
                    <Eye className="w-4 h-4 text-orange-600" />
                  </button>
                  <button
                    onClick={() => deleteUpload(upload.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              {uploads.filter(u => u.type === 'video').length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No videos uploaded yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Preview Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Digital Avatar Preview</h2>
                <p className="text-white/80">Real-time visualization of your avatar quality</p>
              </div>
              <div className={`px-6 py-3 rounded-full ${getQualityColor(avatarQuality.overall)} font-bold text-lg`}>
                {avatarQuality.overall}%
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Avatar Visual */}
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                  {avatarQuality.overall === 0 ? (
                    <div className="text-center p-8">
                      <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">Upload content to see your avatar come to life</p>
                      <p className="text-sm text-gray-400 mt-2">Start by recording a 10-second video or uploading files</p>
                    </div>
                  ) : avatarQuality.overall < 30 ? (
                    <div className="text-center p-8">
                      <div className="relative">
                        <User className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                        <Sparkles className="w-8 h-8 text-orange-500 absolute top-0 right-1/3 animate-pulse" />
                      </div>
                      <p className="text-gray-600 font-medium">Your avatar is forming...</p>
                      <p className="text-sm text-gray-500 mt-2">Keep uploading to improve quality</p>
                    </div>
                  ) : avatarQuality.overall < 60 ? (
                    <div className="text-center p-8">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <User className="w-16 h-16 text-white" />
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500 absolute top-0 right-1/3" />
                      </div>
                      <p className="text-gray-700 font-medium">Good progress!</p>
                      <p className="text-sm text-gray-500 mt-2">Avatar quality is improving</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl">
                          <User className="w-16 h-16 text-white" />
                        </div>
                        <Check className="w-10 h-10 text-green-500 absolute top-0 right-1/3 bg-white rounded-full p-1" />
                      </div>
                      <p className="text-gray-800 font-bold text-lg">Excellent Quality!</p>
                      <p className="text-sm text-gray-600 mt-2">Your avatar is ready for interactions</p>
                    </div>
                  )}

                  {/* Quality Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-4 py-2 rounded-full ${getQualityColor(avatarQuality.overall)} font-semibold text-sm shadow-lg`}>
                      {getQualityText(avatarQuality.overall)}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">{uploads.filter(u => u.type === 'text').length}</p>
                    <p className="text-xs text-gray-600">Text Files</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Mic className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">{uploads.filter(u => u.type === 'voice').length}</p>
                    <p className="text-xs text-gray-600">Voice Clips</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Video className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">{uploads.filter(u => u.type === 'video').length}</p>
                    <p className="text-xs text-gray-600">Videos</p>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Personification Quality
                  </h3>

                  <div className="space-y-4">
                    {/* Voice Clarity */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Voice Clarity</span>
                        <span className="text-sm font-bold text-gray-900">{avatarQuality.voiceClarity}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${avatarQuality.voiceClarity}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {avatarQuality.voiceClarity < 50 ? 'Upload more voice recordings' : 'Great voice quality!'}
                      </p>
                    </div>

                    {/* Visual Quality */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Visual Quality</span>
                        <span className="text-sm font-bold text-gray-900">{avatarQuality.visualQuality}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
                          style={{ width: `${avatarQuality.visualQuality}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {avatarQuality.visualQuality < 50 ? 'Add more video content' : 'Excellent visual data!'}
                      </p>
                    </div>

                    {/* Text Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Text Content</span>
                        <span className="text-sm font-bold text-gray-900">{avatarQuality.textContent}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                          style={{ width: `${avatarQuality.textContent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {avatarQuality.textContent < 50 ? 'Share more stories and messages' : 'Rich text content!'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-4 border border-orange-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {avatarQuality.voiceClarity < 100 && (
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span>Record more voice samples for better voice cloning</span>
                      </li>
                    )}
                    {avatarQuality.visualQuality < 100 && (
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span>Upload additional videos for enhanced avatar quality</span>
                      </li>
                    )}
                    {avatarQuality.textContent < 100 && (
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span>Add more text content to enrich conversations</span>
                      </li>
                    )}
                    {avatarQuality.overall >= 80 && (
                      <li className="flex items-start gap-2 text-sm text-green-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Your avatar is ready! You can now interact with it.</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Create Avatar Button */}
                <div className="pt-4">
                  {!avatarCreated ? (
                    <button
                      onClick={handleCreateAvatar}
                      disabled={!canCreateAvatar || isCreatingAvatar}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
                        canCreateAvatar && !isCreatingAvatar
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 hover:shadow-xl'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCreatingAvatar ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>{creationProgress}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          <span>Create My Avatar</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl shadow-lg">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <CheckCircle2 className="w-6 h-6" />
                          <span className="font-semibold text-lg">Avatar Created!</span>
                        </div>
                        <p className="text-center text-white/90 text-sm">
                          Your digital avatar is ready. You can now have conversations!
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/living-legacy/conversation?avatarId=${avatarId}`)}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg flex items-center justify-center gap-3 font-semibold text-lg"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span>Start Conversation</span>
                      </button>
                    </div>
                  )}

                  {!canCreateAvatar && !avatarCreated && !isCreatingAvatar && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Upload at least 3 voice recordings and 1 video to create your avatar
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {selectedPreview && selectedPreview.preview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{selectedPreview.name}</h3>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <video
                src={selectedPreview.preview}
                controls
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Direct Recording Modal */}
      {showDirectRecording && (
        <DirectRecordingModal onClose={() => setShowDirectRecording(false)} onComplete={(file) => {
          // Create a proper FileList-like object
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          handleFileUpload('video', dataTransfer.files)
          setShowDirectRecording(false)
        }} />
      )}
    </div>
  )
}
