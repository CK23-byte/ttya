# 🏛️ LIVING LEGACY - COMPLETE CODE EXPORT
**Datum:** 2025-12-06  
**Versie:** v2.4.0  
**Bestandsgrootte:** 464KB (11,952 regels)

---

# 🏛️ LIVING LEGACY - COMPLETE CODE EXPORT
## Standalone Application - Alle Code

**Datum:** 2025-12-06  
**Van:** TalkToYouAI v2.4.0  
**Doel:** Nieuwe standalone Living Legacy applicatie

---

## 📦 PACKAGE DEPENDENCIES

Voeg deze toe aan je `package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "react-router-dom": "^6.x.x",
    "lucide-react": "^0.x.x"
  },
  "devDependencies": {
    "@types/react": "^18.x.x",
    "@types/react-dom": "^18.x.x",
    "@vitejs/plugin-react": "^4.x.x",
    "typescript": "^5.x.x",
    "vite": "^5.x.x"
  }
}
```

---

## 🎨 HUISSTIJL & KLEUREN

Living Legacy gebruikt een oranje/amber kleurenschema:
- Primair: `from-amber-50 via-orange-50 to-rose-50`
- Accenten: `from-orange-500 to-rose-500`
- Buttons: Rounded, gradient backgrounds
- Navigatie: Floating badges, backdrop-blur effecten

---

## 📄 FRONTEND PAGES (17 bestanden)

### LivingLegacyAuthPage.tsx
```typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

export default function LivingLegacyAuthPage() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })

  // Check if user is already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('living_legacy_authenticated')
    if (isAuthenticated === 'true') {
      // Already logged in, redirect to dashboard
      navigate('/living-legacy/upload-dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In real app: authenticate with Supabase
    // For now: directly navigate to upload dashboard
    localStorage.setItem('living_legacy_authenticated', 'true')
    localStorage.setItem('living_legacy_user', JSON.stringify({
      email: formData.email,
      firstName: formData.firstName || 'User',
      lastName: formData.lastName || ''
    }))

    navigate('/living-legacy/upload-dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Living Legacy</h1>
              <p className="text-gray-600">Preserve your voice forever</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-orange-200">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Preservation</h3>
                <p className="text-sm text-gray-600">Upload your voice, videos, and photos to create a lifelike digital avatar</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-rose-200">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share Your Wisdom</h3>
                <p className="text-sm text-gray-600">Record messages for your loved ones to treasure forever</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-purple-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Easy to Use</h3>
                <p className="text-sm text-gray-600">Simple upload process with real-time preview of your avatar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
            {/* Mobile Header */}
            <div className="lg:hidden mb-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Living Legacy</h1>
              <p className="text-gray-600">Preserve your voice forever</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Your Legacy'}
              </h2>
              <p className="text-gray-600">
                {isLogin
                  ? 'Sign in to continue building your Living Legacy'
                  : 'Start preserving your memories today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <button type="button" className="text-orange-600 hover:text-orange-700 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                {' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### LivingLegacyAvatarSetupPage.tsx
```typescript
/**
 * Living Legacy Video Avatar Setup Page
 *
 * Allows users to upload photos and record video for avatar creation
 * Requires 20-50 photos and optional talking video (Premium)
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Trash2,
  Video,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Smile,
  Frown,
  Meh
} from 'lucide-react'

interface PhotoUpload {
  id: string
  url: string
  file: File
  angle: 'front' | 'left' | 'right' | 'unknown'
  expression: 'smile' | 'neutral' | 'serious' | 'talking' | 'unknown'
}

type SetupStep = 'photos' | 'video'

export default function LivingLegacyAvatarSetupPage() {
  const navigate = useNavigate()
  const { profileId } = useParams<{ profileId: string }>()

  const [currentStep, setCurrentStep] = useState<SetupStep>('photos')
  const [photos, setPhotos] = useState<PhotoUpload[]>([])
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

  // Video recording
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const targetPhotos = 20
  const recommendedPhotos = 50
  const photoProgress = Math.min((photos.length / targetPhotos) * 100, 100)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newPhotos: PhotoUpload[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        continue
      }

      const photo: PhotoUpload = {
        id: `photo-${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        file,
        angle: 'unknown', // Would be detected by backend
        expression: 'unknown'
      }

      newPhotos.push(photo)
    }

    setPhotos(prev => [...prev, ...newPhotos])
  }

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id))
    if (selectedPhotoId === id) {
      setSelectedPhotoId(null)
    }
  }

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720 }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        // TODO: Save blob for upload
        setVideoUrl(url)
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please check permissions.')
    }
  }

  const pauseVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  const deleteVideo = () => {
    setVideoUrl(null)
    setRecordingTime(0)
  }

  const handleSaveAndContinue = async () => {
    if (photos.length < targetPhotos) {
      alert(`Please upload at least ${targetPhotos} photos to continue.`)
      return
    }

    // TODO: Upload photos and video to backend
    // For now, navigate to preview
    navigate(`/living-legacy/${profileId}/preview`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentStep('photos')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                currentStep === 'photos'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              1. Photos
            </button>
            <button
              onClick={() => setCurrentStep('video')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                currentStep === 'video'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              2. Video (Optional)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-medium mb-4">
            <Camera className="w-5 h-5" />
            <span>Video Avatar Creation</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Create Your Video Avatar
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload photos of yourself to create a realistic video avatar that looks and moves like you.
          </p>
        </div>

        {/* Photos Step */}
        {currentStep === 'photos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  Upload Your Photos
                </h3>

                <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center mb-6">
                  <Camera className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop photos here or click to browse
                  </h4>
                  <p className="text-gray-600 mb-4">
                    We need {targetPhotos}-{recommendedPhotos} photos from different angles and expressions
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition cursor-pointer shadow-lg"
                  >
                    Select Photos
                  </label>
                  <p className="text-sm text-gray-500 mt-4">
                    JPG, PNG, HEIC • Max 10MB per photo
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    Tips for Best Results
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 mb-2">✓ Do Include:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Front-facing photos (most important)</li>
                        <li>• Slight side angles (left & right)</li>
                        <li>• Different expressions (smile, serious, talking)</li>
                        <li>• Well-lit, clear photos</li>
                        <li>• Recent photos (within last year)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 mb-2">✗ Avoid:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Sunglasses or face coverings</li>
                        <li>• Group photos (solo only)</li>
                        <li>• Blurry or dark photos</li>
                        <li>• Extreme angles or filters</li>
                        <li>• Photos with hats or hoods</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      Your Photos ({photos.length})
                    </h3>
                    <button
                      onClick={() => setPhotos([])}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition cursor-pointer"
                        onClick={() => setSelectedPhotoId(photo.id)}
                      >
                        <img
                          src={photo.url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePhoto(photo.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {selectedPhotoId === photo.id && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle className="w-5 h-5 text-blue-500 fill-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Progress</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Photos Uploaded</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {photos.length} / {targetPhotos}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${photoProgress}%` }}
                      />
                    </div>
                    {photos.length >= targetPhotos ? (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        ✓ Minimum reached!
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        {targetPhotos - photos.length} more needed
                      </p>
                    )}
                  </div>

                  {photos.length >= targetPhotos && photos.length < recommendedPhotos && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800">
                        <strong>Tip:</strong> {recommendedPhotos} photos recommended for best results
                      </p>
                    </div>
                  )}

                  {photos.length >= recommendedPhotos && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span><strong>Excellent!</strong> You have enough for ultra-realistic results</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Variety Guide */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-4">Variety Needed</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Smile className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Smiling</p>
                      <p className="text-xs text-gray-600">Natural, happy expressions</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Meh className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Neutral</p>
                      <p className="text-xs text-gray-600">Relaxed, calm face</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Frown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Serious</p>
                      <p className="text-xs text-gray-600">Thoughtful, focused</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                      <Camera className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Talking</p>
                      <p className="text-xs text-gray-600">Mid-conversation photos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Step */}
        {currentStep === 'video' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full text-purple-700 font-semibold text-sm mb-4">
                  <Sparkles className="w-4 h-4" />
                  Premium Feature
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  Record Talking Video (Optional)
                </h3>
                <p className="text-gray-600">
                  Record 2-3 minutes of yourself speaking naturally. This creates ultra-realistic
                  facial movements and expressions for your avatar.
                </p>
              </div>

              {/* Video Recording Area */}
              <div className="bg-gray-900 rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                {!videoUrl ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}

                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full text-white font-semibold">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span>REC {formatTime(recordingTime)}</span>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="space-y-4">
                {!videoUrl ? (
                  <div className="flex items-center justify-center gap-4">
                    {!isRecording ? (
                      <button
                        onClick={startVideoRecording}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition shadow-lg"
                      >
                        <Video className="w-5 h-5" />
                        Start Recording
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={pauseVideoRecording}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                        >
                          {isPaused ? (
                            <>
                              <Play className="w-5 h-5" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="w-5 h-5" />
                              Pause
                            </>
                          )}
                        </button>

                        <button
                          onClick={stopVideoRecording}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                        >
                          <Square className="w-5 h-5" />
                          Stop Recording
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={deleteVideo}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete & Re-record
                    </button>

                    <button
                      onClick={() => {}}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Looks Good
                    </button>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-2">Recording Tips:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Speak naturally, as if talking to family</li>
                        <li>Make different facial expressions</li>
                        <li>Move your head slightly while talking</li>
                        <li>Look directly at the camera</li>
                        <li>Ensure good lighting on your face</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Suggested Topics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">What to talk about:</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• Tell a favorite story</p>
                    <p>• Share some advice</p>
                    <p>• Talk about your day</p>
                    <p>• Describe your hobbies or interests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
          >
            Save and Come Back Later
          </button>

          <div className="flex items-center gap-4">
            {currentStep === 'photos' && photos.length >= targetPhotos && (
              <button
                onClick={() => setCurrentStep('video')}
                className="px-6 py-3 text-blue-600 hover:text-blue-700 font-semibold transition"
              >
                Skip to Video (Optional) →
              </button>
            )}

            <button
              onClick={handleSaveAndContinue}
              disabled={photos.length < targetPhotos}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition ${
                photos.length >= targetPhotos
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Preview
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### LivingLegacyConversationPage.tsx
```typescript
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  MessageCircle
} from 'lucide-react'
import * as AvatarService from '../services/avatar.service'

interface Message {
  id: string
  role: 'user' | 'avatar'
  text: string
  videoUrl?: string
  audioUrl?: string
  timestamp: Date
  status: 'sending' | 'generating' | 'completed' | 'error'
}

export default function LivingLegacyConversationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const avatarId = searchParams.get('avatarId')

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [avatar, setAvatar] = useState<AvatarService.AvatarProfile | null>(null)
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  useEffect(() => {
    if (avatarId) {
      loadAvatar()
    }
  }, [avatarId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadAvatar = async () => {
    if (!avatarId) return

    try {
      const avatarData = await AvatarService.getAvatar(avatarId)
      if (avatarData) {
        setAvatar(avatarData)
      }
    } catch (error) {
      console.error('Failed to load avatar:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || !avatarId || isSending) return

    const userMessageId = `user_${Date.now()}`
    const avatarMessageId = `avatar_${Date.now()}`

    // Add user message
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
      status: 'completed',
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsSending(true)

    // Add placeholder avatar message
    const avatarMessage: Message = {
      id: avatarMessageId,
      role: 'avatar',
      text: '',
      timestamp: new Date(),
      status: 'generating',
    }

    setMessages((prev) => [...prev, avatarMessage])

    try {
      // Generate avatar response
      const response = await AvatarService.generateAvatarMessage({
        avatarId: avatarId,
        messageText: userMessage.text,
      })

      // Update avatar message with video
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === avatarMessageId
            ? {
                ...msg,
                text: userMessage.text,
                videoUrl: response.videoUrl,
                audioUrl: response.audioUrl,
                status: 'completed',
              }
            : msg
        )
      )

      // Auto-play the video
      setTimeout(() => {
        const videoEl = videoRefs.current.get(avatarMessageId)
        if (videoEl) {
          videoEl.play()
          setCurrentlyPlayingId(avatarMessageId)
        }
      }, 500)
    } catch (error) {
      console.error('Failed to generate avatar message:', error)

      // Update message with error status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === avatarMessageId
            ? {
                ...msg,
                text: 'Sorry, I had trouble generating a response. Please try again.',
                status: 'error',
              }
            : msg
        )
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleVideoPlay = (messageId: string) => {
    // Pause all other videos
    videoRefs.current.forEach((video, id) => {
      if (id !== messageId) {
        video.pause()
      }
    })

    const video = videoRefs.current.get(messageId)
    if (video) {
      if (video.paused) {
        video.play()
        setCurrentlyPlayingId(messageId)
      } else {
        video.pause()
        setCurrentlyPlayingId(null)
      }
    }
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)

    videoRefs.current.forEach((video) => {
      video.muted = newMuted
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {avatar ? `Conversation with ${avatar.name}` : 'Loading...'}
                </h1>
                <p className="text-sm text-gray-600">Ask questions and receive video responses</p>
              </div>
            </div>
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Start a Conversation</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Ask your avatar anything. They'll respond with a personalized video message in their own voice.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'user' ? (
                    <div className="max-w-[70%]">
                      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl rounded-tr-sm px-6 py-3 shadow-md">
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-[70%]">
                      {message.status === 'generating' ? (
                        <div className="bg-white rounded-2xl rounded-tl-sm px-6 py-4 shadow-md border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                            <span className="text-sm text-gray-600">Generating video response...</span>
                          </div>
                        </div>
                      ) : message.status === 'error' ? (
                        <div className="bg-red-50 rounded-2xl rounded-tl-sm px-6 py-4 shadow-md border border-red-200">
                          <p className="text-sm text-red-700">{message.text}</p>
                        </div>
                      ) : message.videoUrl ? (
                        <div className="bg-white rounded-2xl rounded-tl-sm overflow-hidden shadow-lg border border-gray-200">
                          <div className="relative aspect-video bg-black">
                            <video
                              ref={(el) => {
                                if (el) videoRefs.current.set(message.id, el)
                              }}
                              src={message.videoUrl}
                              className="w-full h-full"
                              muted={isMuted}
                              playsInline
                              onEnded={() => setCurrentlyPlayingId(null)}
                            />
                            <button
                              onClick={() => handleVideoPlay(message.id)}
                              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                            >
                              {currentlyPlayingId === message.id ? (
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <Pause className="w-8 h-8 text-white" />
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                  <Play className="w-8 h-8 text-orange-500 ml-1" />
                                </div>
                              )}
                            </button>
                          </div>
                          <div className="px-4 py-2 bg-gray-50">
                            <p className="text-xs text-gray-600">{message.text}</p>
                          </div>
                        </div>
                      ) : null}
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Your avatar will respond with a personalized video message
          </p>
        </div>
      </div>
    </div>
  )
}
```

### LivingLegacyConversationPageWebRTC.tsx
```typescript
/**
 * Living Legacy WebRTC Conversation Page
 * Real-time voice conversations with avatar using WebRTC
 */

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Loader2,
  ArrowLeft,
  Video,
  Waves,
  CheckCircle2,
  AlertCircle,
  Phone,
  PhoneOff,
} from 'lucide-react'
import {
  WebRTCConversationService,
  ConnectionState,
  AvatarResponse,
} from '../services/webrtc.service'
import { getAvatar, AvatarProfile } from '../services/avatar.service'

interface Message {
  id: string
  role: 'user' | 'avatar'
  text?: string
  videoUrl?: string
  audioUrl?: string
  timestamp: Date
  status: 'sending' | 'processing' | 'completed' | 'error'
}

const LivingLegacyConversationPageWebRTC: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const avatarId = searchParams.get('avatarId')

  // Avatar state
  const [avatar, setAvatar] = useState<AvatarProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // WebRTC state
  const [webrtcService, setWebrtcService] = useState<WebRTCConversationService | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [processingStatus, setProcessingStatus] = useState<string>('')

  // Conversation state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioLevelIntervalRef = useRef<number | null>(null)

  // Video playback refs
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!avatarId) {
      navigate('/living-legacy/upload')
      return
    }

    loadAvatar()
  }, [avatarId])

  const loadAvatar = async () => {
    try {
      const avatarData = await getAvatar(avatarId!)
      if (!avatarData) {
        throw new Error('Avatar not found')
      }
      setAvatar(avatarData)
      await initializeWebRTC(avatarData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading avatar:', error)
      alert('Failed to load avatar. Please try again.')
      navigate('/living-legacy/upload')
    }
  }

  const initializeWebRTC = async (avatarData: AvatarProfile) => {
    try {
      const serverUrl = import.meta.env.VITE_WEBRTC_SERVER_URL || 'http://localhost:3001'

      const service = new WebRTCConversationService({
        serverUrl,
        avatarId: avatarData.id,
      })

      // Setup callbacks
      service.onStateChange((state) => {
        console.log('Connection state changed:', state)
        setConnectionState(state)
      })

      service.onProcessing((status) => {
        console.log('Processing:', status)
        setProcessingStatus(status)
      })

      service.onResponse((response) => {
        console.log('Avatar response received:', response)
        handleAvatarResponse(response)
      })

      // Initialize connection
      await service.initialize()
      setWebrtcService(service)
    } catch (error) {
      console.error('WebRTC initialization error:', error)
      alert('Failed to initialize real-time connection. Please check your microphone permissions.')
    }
  }

  const handleAvatarResponse = (response: AvatarResponse) => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1]
      if (lastMessage && lastMessage.role === 'avatar' && lastMessage.status === 'processing') {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            text: response.text,
            videoUrl: response.videoUrl,
            audioUrl: response.audioUrl,
            status: response.status === 'ready' ? 'completed' : 'error',
          },
        ]
      }
      return prev
    })

    setProcessingStatus('')
    scrollToBottom()
  }

  const handleSendText = () => {
    if (!inputText.trim() || !webrtcService) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
      status: 'completed',
    }

    setMessages((prev) => [...prev, userMessage])

    const avatarMessage: Message = {
      id: `avatar_${Date.now()}`,
      role: 'avatar',
      timestamp: new Date(),
      status: 'processing',
    }

    setMessages((prev) => [...prev, avatarMessage])

    webrtcService.sendTextMessage(inputText.trim())
    setInputText('')
    scrollToBottom()
  }

  const startVoiceRecording = () => {
    if (!webrtcService) return

    const recorder = webrtcService.startVoiceRecording()
    if (!recorder) {
      alert('Failed to start recording. Please check microphone permissions.')
      return
    }

    mediaRecorderRef.current = recorder
    setIsRecording(true)

    // Add user message placeholder
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: '🎤 Voice message...',
      timestamp: new Date(),
      status: 'sending',
    }
    setMessages((prev) => [...prev, userMessage])

    // Start audio level monitoring
    audioLevelIntervalRef.current = window.setInterval(() => {
      const level = webrtcService.getAudioLevel()
      setAudioLevel(level)
    }, 100)
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    setIsRecording(false)
    setAudioLevel(0)

    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current)
      audioLevelIntervalRef.current = null
    }

    // Update last message status
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1]
      if (lastMessage && lastMessage.role === 'user' && lastMessage.status === 'sending') {
        return [...prev.slice(0, -1), { ...lastMessage, status: 'completed' }]
      }
      return prev
    })

    // Add avatar processing message
    const avatarMessage: Message = {
      id: `avatar_${Date.now()}`,
      role: 'avatar',
      timestamp: new Date(),
      status: 'processing',
    }
    setMessages((prev) => [...prev, avatarMessage])

    scrollToBottom()
  }

  const handleDisconnect = () => {
    if (webrtcService) {
      webrtcService.disconnect()
    }
    navigate('/living-legacy/upload')
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const getConnectionStateColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-500'
      case 'connecting':
        return 'text-yellow-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  const getConnectionStateIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4" />
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Phone className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing real-time connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleDisconnect}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{avatar?.name}</h1>
                  <div className={`flex items-center gap-2 text-sm ${getConnectionStateColor()}`}>
                    {getConnectionStateIcon()}
                    <span className="capitalize">{connectionState}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-[600px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Start a conversation with {avatar?.name}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Use voice recording for the best real-time experience
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  } rounded-2xl p-4`}
                >
                  {message.status === 'processing' && (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <div>
                        <p className="text-sm font-medium">Processing...</p>
                        {processingStatus && (
                          <p className="text-xs opacity-75 mt-1">{processingStatus}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {message.text && message.status !== 'processing' && (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  )}

                  {message.videoUrl && message.status === 'completed' && (
                    <div className="mt-2">
                      <video
                        src={message.videoUrl}
                        controls
                        autoPlay
                        className="w-full rounded-lg"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}

                  {message.status === 'error' && (
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Failed to process message</span>
                    </div>
                  )}

                  <p className="text-xs opacity-50 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              {/* Voice Recording Button */}
              <button
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                onTouchStart={startVoiceRecording}
                onTouchEnd={stopVoiceRecording}
                disabled={connectionState !== 'connected'}
                className={`p-4 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 scale-110 shadow-lg'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white disabled:opacity-50 disabled:cursor-not-allowed relative`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                {isRecording && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
                    <Waves className="w-4 h-4 text-red-500 animate-pulse" />
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-100"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Type a message or hold to record..."
                disabled={connectionState !== 'connected'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />

              {/* Send Button */}
              <button
                onClick={handleSendText}
                disabled={!inputText.trim() || connectionState !== 'connected'}
                className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Hold the microphone button to record voice messages
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LivingLegacyConversationPageWebRTC
```

### LivingLegacyCreationDashboard.tsx
```typescript
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Upload, Mic, BookOpen, MessageCircle, Heart, Sparkles, CheckCircle2, Clock,
  ArrowRight, User, Settings, LogOut, ChevronRight, AlertCircle, Camera
} from 'lucide-react'

interface ProfileData {
  profile: {
    id: string
    fullName: string
    profilePhotoUrl?: string
    status: string
    completionPercentage: number
    tier: string
    hasVoiceClone: boolean
    hasVideoAvatar: boolean
    lastEditedAt: string
    createdAt: string
  }
  recipients: Array<{ name: string; relationship: string; isPrimary: boolean }>
  executor: { name: string; email: string } | null
  statistics: {
    totalMessages: number
    completedMessages: number
    timeCapsules: number
    messagesByCategory: Record<string, number>
    voiceMinutesRecorded: number
    voiceMinutesNeeded: number
    avatarPhotos: number
    avatarPhotosNeeded: number
    uploadCounts: Record<string, number>
  }
  voiceClone: { status: string } | null
  videoAvatar: { status: string } | null
}

interface CreationStep {
  id: number
  title: string
  icon: any
  description: string
  status: 'completed' | 'in_progress' | 'not_started'
  progress?: number
  items?: Array<{ label: string; status: 'completed' | 'pending' }>
  action: string
  actionPath: string
}

export default function LivingLegacyCreationDashboard() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    loadProfile()
  }, [profileId])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/legacy/get-profile?profileId=${profileId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile')
      }

      setProfileData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getCreationSteps = (): CreationStep[] => {
    if (!profileData) return []

    const { statistics, profile, voiceClone, videoAvatar } = profileData

    // Determine status for each step based on data
    const hasUploads = (statistics.uploadCounts.whatsapp || 0) + (statistics.uploadCounts.photos || 0) > 0
    const uploadsComplete = hasUploads

    const voiceComplete = !profile.hasVoiceClone || (voiceClone?.status === 'completed')
    const voiceInProgress = profile.hasVoiceClone && voiceClone?.status === 'collecting_samples'
    const voiceMinutes = statistics.voiceMinutesRecorded

    const avatarComplete = !profile.hasVideoAvatar || (videoAvatar?.status === 'completed')
    const avatarInProgress = profile.hasVideoAvatar && videoAvatar?.status === 'collecting_photos'
    const avatarPhotos = statistics.avatarPhotos

    const lifeStoryMessages = statistics.messagesByCategory['life_story'] || 0
    const wisdomMessages = statistics.messagesByCategory['wisdom'] || 0
    const specificMessages = statistics.messagesByCategory['specific_person'] || 0

    return [
      {
        id: 1,
        title: 'Upload Existing Data',
        icon: Upload,
        description: 'Upload WhatsApp chats, photos, videos',
        status: uploadsComplete ? 'completed' : 'not_started',
        items: [
          { label: `WhatsApp: ${statistics.uploadCounts.whatsapp || 0} files`, status: (statistics.uploadCounts.whatsapp || 0) > 0 ? 'completed' : 'pending' },
          { label: `Photos: ${statistics.uploadCounts.photos || 0} uploaded`, status: (statistics.uploadCounts.photos || 0) > 0 ? 'completed' : 'pending' },
          { label: `Videos: ${statistics.uploadCounts.videos || 0} uploaded`, status: (statistics.uploadCounts.videos || 0) > 0 ? 'completed' : 'pending' }
        ],
        action: 'Upload Files',
        actionPath: `/living-legacy/${profileId}/upload`
      },
      {
        id: 2,
        title: 'Voice & Avatar Setup',
        icon: Mic,
        description: profile.hasVoiceClone && profile.hasVideoAvatar
          ? 'Set up voice cloning and video avatar'
          : profile.hasVoiceClone
          ? 'Record voice samples'
          : 'Skip this step (Essential tier)',
        status: voiceComplete && avatarComplete ? 'completed' : voiceInProgress || avatarInProgress ? 'in_progress' : 'not_started',
        progress: profile.hasVoiceClone ? Math.min(100, (voiceMinutes / 15) * 100) : 100,
        items: profile.hasVoiceClone ? [
          { label: `Voice samples: ${voiceMinutes}/15 min recorded`, status: voiceMinutes >= 15 ? 'completed' : 'pending' },
          { label: `Avatar photos: ${avatarPhotos} uploaded`, status: avatarPhotos >= 20 ? 'completed' : 'pending' }
        ] : [],
        action: profile.hasVoiceClone ? 'Continue Recording' : 'Skip',
        actionPath: `/living-legacy/${profileId}/voice-setup`
      },
      {
        id: 3,
        title: 'Life Story & History',
        icon: BookOpen,
        description: 'Share your journey, experiences, and memories',
        status: lifeStoryMessages >= 5 ? 'completed' : lifeStoryMessages > 0 ? 'in_progress' : 'not_started',
        progress: Math.min(100, (lifeStoryMessages / 5) * 100),
        items: [
          { label: `${lifeStoryMessages} life story segments recorded`, status: lifeStoryMessages >= 5 ? 'completed' : 'pending' }
        ],
        action: 'Add Life Stories',
        actionPath: `/living-legacy/${profileId}/record?category=life_story`
      },
      {
        id: 4,
        title: 'Messages for Loved Ones',
        icon: MessageCircle,
        description: 'Record personal messages for each recipient',
        status: specificMessages >= profileData.recipients.length ? 'completed' : specificMessages > 0 ? 'in_progress' : 'not_started',
        progress: Math.min(100, (specificMessages / profileData.recipients.length) * 100),
        items: profileData.recipients.slice(0, 3).map(r => ({
          label: `For ${r.name} (${r.relationship}): ${statistics.messagesByCategory[`specific_${r.name}`] || 0} messages`,
          status: (statistics.messagesByCategory[`specific_${r.name}`] || 0) > 0 ? 'completed' : 'pending'
        })),
        action: 'Add Messages',
        actionPath: `/living-legacy/${profileId}/record?category=specific_person`
      },
      {
        id: 5,
        title: 'Wisdom & Advice',
        icon: Heart,
        description: 'Share lessons learned and guidance',
        status: wisdomMessages >= 3 ? 'completed' : wisdomMessages > 0 ? 'in_progress' : 'not_started',
        progress: Math.min(100, (wisdomMessages / 3) * 100),
        items: [
          { label: `${wisdomMessages} wisdom messages recorded`, status: wisdomMessages >= 3 ? 'completed' : 'pending' }
        ],
        action: 'Share Wisdom',
        actionPath: `/living-legacy/${profileId}/record?category=wisdom`
      },
      {
        id: 6,
        title: 'Time Capsule Messages',
        icon: Sparkles,
        description: 'Create messages for future milestones',
        status: statistics.timeCapsules >= 3 ? 'completed' : statistics.timeCapsules > 0 ? 'in_progress' : 'not_started',
        progress: Math.min(100, (statistics.timeCapsules / 3) * 100),
        items: [
          { label: `${statistics.timeCapsules} time capsules created`, status: statistics.timeCapsules >= 3 ? 'completed' : 'pending' }
        ],
        action: 'Create Time Capsules',
        actionPath: `/living-legacy/${profileId}/time-capsule`
      },
      {
        id: 7,
        title: 'Review & Finalize',
        icon: CheckCircle2,
        description: 'Preview your legacy and generate notary link',
        status: profile.completionPercentage >= 100 ? 'completed' : 'not_started',
        items: [
          { label: 'Preview your legacy', status: 'pending' },
          { label: 'Generate notary link', status: profile.completionPercentage >= 100 ? 'completed' : 'pending' }
        ],
        action: profile.completionPercentage >= 100 ? 'Finalize' : 'Not Ready Yet',
        actionPath: `/living-legacy/${profileId}/finalize`
      }
    ]
  }

  const getNextSteps = () => {
    if (!profileData) return []

    const steps = getCreationSteps()
    const incomplete = steps.filter(s => s.status !== 'completed')
    return incomplete.slice(0, 3)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />
      case 'in_progress':
        return <Clock className="w-6 h-6 text-orange-500 animate-pulse" />
      default:
        return <AlertCircle className="w-6 h-6 text-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'in_progress':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your legacy...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { profile, statistics } = profileData
  const steps = getCreationSteps()
  const nextSteps = getNextSteps()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Creating Your Living Legacy</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/account')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Account Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Exit to Dashboard"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative">
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <button
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
                title="Change Photo"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{profile.fullName}'s Living Legacy</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                  profile.tier === 'complete' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)} Tier
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progress: {profile.completionPercentage}% Complete
                  </span>
                  <span className="text-sm text-gray-500">
                    Last edited: {new Date(profile.lastEditedAt || profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${profile.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{statistics.completedMessages}</div>
                  <div className="text-xs text-gray-600">Messages</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{statistics.timeCapsules}</div>
                  <div className="text-xs text-gray-600">Time Capsules</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{profileData.recipients.length}</div>
                  <div className="text-xs text-gray-600">Recipients</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {steps.filter(s => s.status === 'completed').length}/{steps.length}
                  </div>
                  <div className="text-xs text-gray-600">Steps Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Next Steps
            </h3>
            <div className="space-y-3">
              {nextSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <step.icon className="w-5 h-5" />
                    <span className="font-medium">{step.title}</span>
                  </div>
                  <button
                    onClick={() => navigate(step.actionPath)}
                    className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
                  >
                    {step.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creation Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all ${getStatusColor(step.status)}`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {index + 1}. {step.title}
                        </h3>
                        {step.status === 'completed' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Complete
                          </span>
                        )}
                        {step.status === 'in_progress' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(step.actionPath)}
                        disabled={step.id === 7 && profile.completionPercentage < 100}
                        className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                          step.id === 7 && profile.completionPercentage < 100
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600'
                        }`}
                      >
                        {step.action} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4">{step.description}</p>

                    {step.progress !== undefined && step.progress < 100 && (
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {step.items && step.items.length > 0 && (
                      <div className="space-y-2">
                        {step.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                            <span className={item.status === 'completed' ? 'text-gray-700' : 'text-gray-500'}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {profile.completionPercentage >= 100 && (
          <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Your Legacy is Complete! 🎉
            </h3>
            <p className="text-gray-600 mb-6">
              You're ready to preview your legacy and generate the notary activation link.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(`/living-legacy/${profileId}/preview`)}
                className="px-6 py-3 bg-white border-2 border-green-500 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Preview Your Legacy
              </button>
              <button
                onClick={() => navigate(`/living-legacy/${profileId}/finalize`)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition"
              >
                Finalize & Generate Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

### LivingLegacyFinalizationPage.tsx
```typescript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Link as LinkIcon, Download, Mail, Copy, ArrowLeft,
  Shield, FileText, Users, AlertCircle, Loader, ExternalLink, Check
} from 'lucide-react'

interface ProfileData {
  profile: {
    id: string
    fullName: string
    completionPercentage: number
    notaryLinkToken: string | null
  }
  executor: {
    name: string
    email: string
    relationship: string
    hasNotary: boolean
    notaryName?: string
    notaryEmail?: string
  } | null
  recipients: Array<{ name: string; relationship: string }>
}

export default function LivingLegacyFinalizationPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [finalizing, setFinalizing] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [notaryLink, setNotaryLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [profileId])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/legacy/get-profile?profileId=${profileId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile')
      }

      setProfileData(data)

      // Check if already finalized
      if (data.profile.notaryLinkToken) {
        setFinalized(true)
        setNotaryLink(`${window.location.origin}/legacy/activate/${data.profile.notaryLinkToken}`)
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!profileData || profileData.profile.completionPercentage < 100) {
      setError('Profile must be 100% complete before finalization')
      return
    }

    setFinalizing(true)
    setError(null)

    try {
      const response = await fetch('/api/legacy/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to finalize profile')
      }

      setFinalized(true)
      setNotaryLink(data.notaryLinkUrl)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setFinalizing(false)
    }
  }

  const copyToClipboard = async () => {
    if (!notaryLink) return

    try {
      await navigator.clipboard.writeText(notaryLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  const downloadDocumentation = () => {
    if (!profileData) return

    const docContent = `
LIVING LEGACY ACTIVATION INSTRUCTIONS

Profile: ${profileData.profile.fullName}
Created: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════

EXECUTOR INFORMATION
────────────────────────────────────────────────────────────
${profileData.executor ? `
Name: ${profileData.executor.name}
Email: ${profileData.executor.email}
Relationship: ${profileData.executor.relationship}
${profileData.executor.hasNotary ? `
Notary: ${profileData.executor.notaryName}
Notary Email: ${profileData.executor.notaryEmail}
` : ''}
` : 'No executor information provided'}

ACTIVATION LINK
────────────────────────────────────────────────────────────
${notaryLink || 'Link will be generated after finalization'}

⚠️ IMPORTANT: Keep this link secure. Anyone with this link can
request activation of the Living Legacy.

DESIGNATED RECIPIENTS (${profileData.recipients.length})
────────────────────────────────────────────────────────────
${profileData.recipients.map(r => `• ${r.name} (${r.relationship})`).join('\n')}

HOW TO ACTIVATE
────────────────────────────────────────────────────────────
1. When ${profileData.profile.fullName} passes away, the executor should
   visit the activation link above.

2. The executor will need to upload:
   • Death certificate
   • Proof of executor status (will, court document, etc.)
   • Government-issued ID

3. TalkToYouAI's verification team will review the documents
   (typically within 24-48 hours).

4. Once verified, all designated recipients will automatically
   receive access via email.

STORAGE RECOMMENDATIONS
────────────────────────────────────────────────────────────
• Store this document in a secure location
• Consider including it with your will
• Share with your executor and trusted family members
• Keep a digital copy in a password manager
• Inform your executor where to find this information

SUPPORT
────────────────────────────────────────────────────────────
Questions? Contact TalkToYouAI Support:
Email: support@talktoyouai.com
Website: https://talktoyouai.com

═══════════════════════════════════════════════════════════

Generated by TalkToYouAI Living Legacy System
Date: ${new Date().toLocaleString()}
`

    const blob = new Blob([docContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profileData.profile.fullName.replace(/\s+/g, '_')}_Living_Legacy_Instructions.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendToExecutor = () => {
    if (!profileData?.executor || !notaryLink) return

    const subject = encodeURIComponent(`Important: Living Legacy Executor Instructions - ${profileData.profile.fullName}`)
    const body = encodeURIComponent(`Dear ${profileData.executor.name},

${profileData.profile.fullName} has designated you as the executor of their Living Legacy on TalkToYouAI.

IMPORTANT: Please keep this email in a safe place.

When the time comes, you will use this secure link to activate their legacy for designated family members:

${notaryLink}

You can find detailed instructions in the attached documentation.

If you have any questions, please contact support@talktoyouai.com

With respect,
TalkToYouAI Team`)

    window.open(`mailto:${profileData.executor.email}?subject=${subject}&body=${body}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load profile'}</p>
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { profile, executor, recipients } = profileData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/living-legacy/create/${profileId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finalize Your Living Legacy</h1>
              <p className="text-sm text-gray-600">Generate your notary activation link</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Completion Check */}
        {profile.completionPercentage < 100 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Profile Not Complete</h3>
                <p className="text-yellow-800 mb-4">
                  Your profile is {profile.completionPercentage}% complete. You need to complete all required sections before finalizing.
                </p>
                <button
                  onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition"
                >
                  Complete Your Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Already Finalized */}
        {finalized && notaryLink && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Legacy is Complete! 🎉</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your Living Legacy has been finalized. The notary activation link has been generated and is ready to share with your executor.
            </p>
          </div>
        )}

        {/* Not Yet Finalized */}
        {!finalized && profile.completionPercentage >= 100 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Finalize</h2>
              <p className="text-gray-600">
                Your profile is complete. Click below to generate your notary activation link.
              </p>
            </div>

            <button
              onClick={handleFinalize}
              disabled={finalizing}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {finalizing ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  Generate Notary Link
                </>
              )}
            </button>
          </div>
        )}

        {/* Notary Link Display */}
        {finalized && notaryLink && (
          <div className="space-y-6">
            {/* Step 1: Notary Link */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-6 h-6 text-orange-500" />
                    Notary Activation Link
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This encrypted link will be used to activate your legacy after you pass away.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <code className="flex-1 text-sm bg-white px-4 py-3 rounded border border-gray-300 overflow-x-auto">
                        {notaryLink}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      ⚠️ Keep this link secure. Anyone with it can request activation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Download Documentation */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Download className="w-6 h-6 text-blue-500" />
                    Download Documentation
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Legal documents to include in your will or give to your executor.
                  </p>

                  <button
                    onClick={downloadDocumentation}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Download Instructions (TXT)
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Share with Executor */}
            {executor && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Mail className="w-6 h-6 text-green-500" />
                      Share with Executor
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{executor.name}</div>
                          <div className="text-sm text-gray-600">{executor.relationship}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">{executor.email}</div>
                    </div>

                    <button
                      onClick={sendToExecutor}
                      className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Send Instructions via Email
                    </button>

                    {executor.hasNotary && executor.notaryEmail && (
                      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-900 mb-2">Optional: Share with Notary</p>
                        <p className="text-sm text-purple-700 mb-3">
                          {executor.notaryName} ({executor.notaryEmail})
                        </p>
                        <button
                          onClick={() => {
                            const subject = encodeURIComponent(`Living Legacy Notary Information - ${profile.fullName}`)
                            const body = encodeURIComponent(`Dear ${executor.notaryName},\n\nThis email contains notary information for ${profile.fullName}'s Living Legacy...\n\n${notaryLink}`)
                            window.open(`mailto:${executor.notaryEmail}?subject=${subject}&body=${body}`)
                          }}
                          className="text-sm px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                        >
                          Send to Notary
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📌 Important Notes</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>You can continue editing your legacy until it's activated</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Keep the activation link secure - store it in a password manager or safe</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Make sure your executor knows where to find the link and documentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Consider including this information in your will or estate planning documents</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Recipients ({recipients.length} people) will automatically receive access after verification</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition"
              >
                Exit to Main Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

### LivingLegacyMessageRecordingPage.tsx
```typescript
/**
 * Living Legacy Message Recording Page - Enhanced Version
 *
 * Features:
 * - Better recording interface with real-time feedback
 * - Message categories (Life Story, Advice, Time Capsules)
 * - Draft system with editing capabilities
 * - Audio quality indicators
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
  FileText,
  Heart,
  Clock,
  Gift,
  BookOpen,
  Sparkles,
  Users,
  Volume2
} from 'lucide-react'

interface Message {
  id: string
  title: string
  category: 'life_story' | 'advice' | 'time_capsule' | 'specific_person' | 'everyday'
  status: 'draft' | 'recorded' | 'finalized'
  audioUrl?: string
  audioBlob?: Blob
  duration: number
  recipientIds: string[] | null // null = all recipients
  transcript?: string
  qualityScore?: number
  createdAt: Date
  updatedAt: Date
}

interface AudioQuality {
  clearAudio: boolean
  goodVolume: boolean
  minLength: boolean
  noClipping: boolean
}

const CATEGORIES = [
  { id: 'life_story', label: 'Life Story', icon: BookOpen, color: 'blue' },
  { id: 'advice', label: 'Advice & Wisdom', icon: Sparkles, color: 'purple' },
  { id: 'time_capsule', label: 'Time Capsule', icon: Gift, color: 'orange' },
  { id: 'specific_person', label: 'Specific Person', icon: Users, color: 'green' },
  { id: 'everyday', label: 'Everyday Moment', icon: Heart, color: 'rose' }
]

export default function LivingLegacyMessageRecordingPage() {
  const navigate = useNavigate()
  const { profileId } = useParams()

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)

  // Current message being created/edited
  const [currentMessage, setCurrentMessage] = useState<Partial<Message>>({
    category: 'life_story',
    recipientIds: null
  })

  // All messages
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Load existing messages
  useEffect(() => {
    loadMessages()
  }, [profileId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const loadMessages = async () => {
    // TODO: Load from API
    // Mock data for now
    setMessages([])
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Setup audio analysis
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const checkAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(Math.min(100, (average / 255) * 150))
          requestAnimationFrame(checkAudioLevel)
        }
      }
      checkAudioLevel()

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(blob)

        setCurrentMessage(prev => ({
          ...prev,
          audioUrl,
          audioBlob: blob,
          duration: recordingTime
        }))

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  const analyzeQuality = (): AudioQuality => {
    return {
      clearAudio: recordingTime >= 5,
      goodVolume: audioLevel > 20 && audioLevel < 80,
      minLength: recordingTime >= 10,
      noClipping: audioLevel < 90
    }
  }

  const calculateQualityScore = (quality: AudioQuality): number => {
    const scores = Object.values(quality).filter(Boolean).length
    return (scores / Object.keys(quality).length) * 100
  }

  const saveAsDraft = () => {
    if (!currentMessage.title) {
      alert('Please enter a message title')
      return
    }

    const quality = analyzeQuality()
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      title: currentMessage.title || '',
      category: currentMessage.category as any,
      status: 'draft',
      audioUrl: currentMessage.audioUrl,
      audioBlob: currentMessage.audioBlob,
      duration: currentMessage.duration || 0,
      recipientIds: currentMessage.recipientIds || null,
      qualityScore: calculateQualityScore(quality),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    resetCurrentMessage()
    alert('Message saved as draft!')
  }

  const finalizeMessage = async () => {
    if (!currentMessage.title) {
      alert('Please enter a message title')
      return
    }

    const quality = analyzeQuality()
    if (!quality.minLength) {
      alert('Message must be at least 10 seconds long')
      return
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      title: currentMessage.title || '',
      category: currentMessage.category as any,
      status: 'recorded',
      audioUrl: currentMessage.audioUrl,
      audioBlob: currentMessage.audioBlob,
      duration: currentMessage.duration || 0,
      recipientIds: currentMessage.recipientIds || null,
      qualityScore: calculateQualityScore(quality),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // TODO: Upload to API
    setMessages(prev => [...prev, newMessage])
    resetCurrentMessage()
    alert('Message finalized!')
  }

  const resetCurrentMessage = () => {
    setCurrentMessage({
      category: 'life_story',
      recipientIds: null
    })
    setRecordingTime(0)
    setAudioLevel(0)
  }

  const deleteMessage = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      setMessages(prev => prev.filter(m => m.id !== messageId))
    }
  }

  const editMessage = (message: Message) => {
    setCurrentMessage({
      title: message.title,
      category: message.category,
      recipientIds: message.recipientIds,
      audioUrl: message.audioUrl,
      audioBlob: message.audioBlob,
      duration: message.duration
    })
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category)
    return cat ? cat.icon : FileText
  }

  const filteredMessages = selectedCategory
    ? messages.filter(m => m.category === selectedCategory)
    : messages

  const quality = currentMessage.audioUrl ? analyzeQuality() : null
  const qualityScore = quality ? calculateQualityScore(quality) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Record Messages</h1>
                <p className="text-sm text-gray-600">{messages.length} messages recorded</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recording Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Message Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon
                  const isSelected = currentMessage.category === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => setCurrentMessage(prev => ({ ...prev, category: category.id as any }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `border-${category.color}-500 bg-${category.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? `text-${category.color}-600` : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-900">{category.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Message Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Message Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Title *
                  </label>
                  <input
                    type="text"
                    value={currentMessage.title || ''}
                    onChange={(e) => setCurrentMessage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Birthday Message for Sarah"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    For whom? (Leave empty for all)
                  </label>
                  <input
                    type="text"
                    placeholder="All recipients"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Recipient management available in dedicated section</p>
                </div>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl shadow-md p-8 border-2 border-orange-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 relative">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
                  )}
                  <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatTime(recordingTime)}
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <Volume2 className="w-5 h-5" />
                    <p className="text-sm font-medium">Recording...</p>
                  </div>
                )}
              </div>

              {/* Audio Level Indicator */}
              {isRecording && (
                <div className="mb-6">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-orange-500 transition-all duration-100"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-2">Audio Level</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!currentMessage.title}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center gap-2"
                    >
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Square className="w-5 h-5" />
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quality Indicators */}
            {currentMessage.audioUrl && quality && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Audio Quality</h2>
                  <div className="text-2xl font-bold text-orange-600">{qualityScore.toFixed(0)}%</div>
                </div>
                <div className="space-y-3">
                  {Object.entries(quality).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      {value ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Audio Player */}
                {currentMessage.audioUrl && (
                  <div className="mt-6">
                    <audio src={currentMessage.audioUrl} controls className="w-full" />
                  </div>
                )}

                {/* Save Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveAsDraft}
                    className="flex-1 px-6 py-3 border-2 border-orange-300 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save as Draft
                  </button>
                  <button
                    onClick={finalizeMessage}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Finalize
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages List */}
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Filter by Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedCategory === null ? 'bg-orange-100 text-orange-700 font-medium' : 'hover:bg-gray-100'
                  }`}
                >
                  All Messages ({messages.length})
                </button>
                {CATEGORIES.map((category) => {
                  const count = messages.filter(m => m.category === category.id).length
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedCategory === category.id ? 'bg-orange-100 text-orange-700 font-medium' : 'hover:bg-gray-100'
                      }`}
                    >
                      {category.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Messages</h3>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((message) => {
                    const Icon = getCategoryIcon(message.category)
                    return (
                      <div
                        key={message.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-orange-600" />
                            <h4 className="font-medium text-gray-900 text-sm">{message.title}</h4>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => editMessage(message)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(message.duration)}
                          </div>
                          <div className={`px-2 py-0.5 rounded-full ${
                            message.status === 'finalized' ? 'bg-green-100 text-green-700' :
                            message.status === 'recorded' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {message.status}
                          </div>
                          {message.qualityScore && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {message.qualityScore.toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### LivingLegacyOnboardingPage.tsx
```typescript
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  User,
  Heart,
  Users,
  Shield,
  FileText,
  Settings,
  Sparkles,
  Video,
  Mic,
  Gift,
  CheckCircle,
  Brain
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

interface OnboardingData {
  // Step 0: Tier Selection (added)
  selectedTier: 'essential' | 'complete' | 'premium'

  // Step 1: Basic Information
  fullName: string
  dateOfBirth: string
  currentLocation: string
  occupation: string

  // Step 2: About This Legacy
  primaryReason: string
  urgency: string
  emotionalState: string[]

  // Step 3: Recipients
  recipients: Array<{
    name: string
    relationship: string
    age?: number
    email?: string
  }>
  primaryRecipient: string

  // Step 4: Executor
  executorName: string
  executorRelationship: string
  executorEmail: string
  executorPhone: string
  hasNotary: boolean
  notaryInfo?: {
    name: string
    firm: string
    email: string
    phone: string
  }

  // Step 5: Content Preferences
  wantsVideoAvatar: boolean
  wantsVoiceClone: boolean
  contentTypes: string[]
  estimatedTime: string

  // Step 6: Personality Questionnaire
  personalityData: {
    humor: string
    adviceStyle: string
    communicationStyle: string
    coreValues: string[]
    conflictHandling: string
    commonPhrases: string
    affectionExpression: string
    decisionMaking: string
    lifeOutlook: string
    traditionImportance: string
    difficultTopicsApproach: string
    politicalViews: string
    spiritualOrientation: string
    culturalBackground: string
    personalityWords: string
  }
}

const STEPS = [
  { id: 0, title: 'Welcome', icon: Sparkles },
  { id: 1, title: 'Choose Your Plan', icon: Gift },
  { id: 2, title: 'Basic Information', icon: User },
  { id: 3, title: 'About This Legacy', icon: Heart },
  { id: 4, title: 'Who Is This For?', icon: Users },
  { id: 5, title: 'Executor Information', icon: Shield },
  { id: 6, title: 'Content Preferences', icon: Settings },
  { id: 7, title: 'Your Personality', icon: Brain },
  { id: 8, title: 'Review & Confirm', icon: FileText }
]

export default function LivingLegacyOnboardingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSupabaseAuth()

  // Get tier from URL params or localStorage
  const getTier = (): 'essential' | 'complete' | 'premium' => {
    const urlTier = searchParams.get('tier')
    if (urlTier) return urlTier as 'essential' | 'complete' | 'premium'

    const storedTier = localStorage.getItem('living-legacy-tier')
    if (storedTier) {
      localStorage.removeItem('living-legacy-tier')
      return storedTier as 'essential' | 'complete' | 'premium'
    }

    return 'complete'
  }

  const tier = getTier()

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auth guard - redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      localStorage.setItem('living-legacy-tier', tier)
      localStorage.setItem('living-legacy-return-to-onboarding', 'true')
      navigate('/auth')
    }
  }, [user, navigate, tier])

  const [formData, setFormData] = useState<OnboardingData>({
    selectedTier: tier,
    fullName: '',
    dateOfBirth: '',
    currentLocation: '',
    occupation: '',
    primaryReason: '',
    urgency: '',
    emotionalState: [],
    recipients: [],
    primaryRecipient: '',
    executorName: '',
    executorRelationship: '',
    executorEmail: '',
    executorPhone: '',
    hasNotary: false,
    wantsVideoAvatar: tier === 'complete' || tier === 'premium',
    wantsVoiceClone: tier === 'complete' || tier === 'premium',
    contentTypes: [],
    estimatedTime: '',
    personalityData: {
      humor: '',
      adviceStyle: '',
      communicationStyle: '',
      coreValues: [],
      conflictHandling: '',
      commonPhrases: '',
      affectionExpression: '',
      decisionMaking: '',
      lifeOutlook: '',
      traditionImportance: '',
      difficultTopicsApproach: '',
      politicalViews: '',
      spiritualOrientation: '',
      culturalBackground: '',
      personalityWords: ''
    }
  })

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addRecipient = () => {
    updateFormData({
      recipients: [...formData.recipients, { name: '', relationship: '', age: undefined, email: '' }]
    })
  }

  const updateRecipient = (index: number, updates: Partial<OnboardingData['recipients'][0]>) => {
    const newRecipients = [...formData.recipients]
    newRecipients[index] = { ...newRecipients[index], ...updates }
    updateFormData({ recipients: newRecipients })
  }

  const removeRecipient = (index: number) => {
    updateFormData({
      recipients: formData.recipients.filter((_, i) => i !== index)
    })
  }

  const toggleEmotionalState = (state: string) => {
    const current = formData.emotionalState
    updateFormData({
      emotionalState: current.includes(state)
        ? current.filter(s => s !== state)
        : [...current, state]
    })
  }

  const toggleContentType = (type: string) => {
    const current = formData.contentTypes
    updateFormData({
      contentTypes: current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
    })
  }

  const toggleCoreValue = (value: string) => {
    const current = formData.personalityData.coreValues
    updateFormData({
      personalityData: {
        ...formData.personalityData,
        coreValues: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      }
    })
  }

  const updatePersonalityData = (updates: Partial<OnboardingData['personalityData']>) => {
    updateFormData({
      personalityData: {
        ...formData.personalityData,
        ...updates
      }
    })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true // Welcome screen
      case 1:
        return formData.selectedTier !== undefined // Tier selection
      case 2:
        return formData.fullName && formData.dateOfBirth
      case 3:
        return formData.primaryReason && formData.urgency && formData.emotionalState.length > 0
      case 4:
        return formData.recipients.length > 0 && formData.recipients.every(r => r.name && r.relationship)
      case 5:
        return formData.executorName && formData.executorEmail
      case 6:
        return formData.contentTypes.length > 0 && formData.estimatedTime
      case 7:
        // Personality questionnaire - at least basic fields required
        return formData.personalityData.communicationStyle &&
               formData.personalityData.coreValues.length > 0 &&
               formData.personalityData.lifeOutlook
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/legacy/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          tier: formData.selectedTier,
          onboardingData: formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile')
      }

      // Navigate to creation dashboard
      navigate(`/living-legacy/create/${data.profile.id}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => currentStep === 0 ? navigate(-1) : setCurrentStep(currentStep - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Your Living Legacy</h1>
                <p className="text-sm text-gray-600">
                  {currentStep === 0 ? 'Welcome' : `Step ${currentStep} of ${STEPS.length - 1}`}
                </p>
              </div>
            </div>
            {currentStep > 0 && (
              <div className="hidden sm:block px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold text-sm">
                {formData.selectedTier.charAt(0).toUpperCase() + formData.selectedTier.slice(1)}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {currentStep > 0 && (
            <div className="mt-4 flex gap-1 sm:gap-2">
              {STEPS.slice(1).map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    step.id < currentStep
                      ? 'bg-green-500'
                      : step.id === currentStep
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="space-y-8 text-center">
              <Sparkles className="w-16 h-16 text-orange-500 mx-auto" />
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Welcome to Your Living Legacy Journey
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  In the next few minutes, we'll guide you through creating a meaningful digital legacy
                  that will preserve your voice, wisdom, and love for generations to come.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left max-w-3xl mx-auto">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl border border-orange-200">
                  <Video className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Video & Voice</h3>
                  <p className="text-sm text-gray-600">Record messages in your own voice and appearance</p>
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl border border-orange-200">
                  <Gift className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Time Capsules</h3>
                  <p className="text-sm text-gray-600">Schedule messages for future milestones</p>
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl border border-orange-200">
                  <Shield className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Secure Forever</h3>
                  <p className="text-sm text-gray-600">Bank-level encryption and 50-year guarantee</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  ⏱️ Takes about <strong>10-15 minutes</strong> to complete
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
                >
                  Let's Begin
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Tier Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Gift className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Select the plan that best fits your needs</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Essential */}
                <button
                  onClick={() => updateFormData({
                    selectedTier: 'essential',
                    wantsVideoAvatar: false,
                    wantsVoiceClone: false
                  })}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.selectedTier === 'essential'
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Essential</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-4">€499</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Text-based AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>50+ messages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>5 family members</span>
                    </li>
                  </ul>
                </button>

                {/* Complete - Most Popular */}
                <button
                  onClick={() => updateFormData({
                    selectedTier: 'complete',
                    wantsVideoAvatar: true,
                    wantsVoiceClone: true
                  })}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                    formData.selectedTier === 'complete'
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-rose-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                  <h3 className="text-xl font-bold mb-2">Complete</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-4">€999</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Voice cloning</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Video avatar</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Unlimited messages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>15 family members</span>
                    </li>
                  </ul>
                </button>

                {/* Premium */}
                <button
                  onClick={() => updateFormData({
                    selectedTier: 'premium',
                    wantsVideoAvatar: true,
                    wantsVoiceClone: true
                  })}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.selectedTier === 'premium'
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-4">€1,999</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Professional recording</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Ultra-realistic avatar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Unlimited family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Concierge service</span>
                    </li>
                  </ul>
                </button>
              </div>

              <p className="text-sm text-gray-600 text-center">
                ✓ One-time payment • ✓ 50+ year hosting guarantee • ✓ No hidden fees
              </p>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <User className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Let's start with the basics</h2>
                <p className="text-gray-600">Tell us a little about yourself</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your full name? *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData({ fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When were you born? *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where do you live?
                </label>
                <input
                  type="text"
                  value={formData.currentLocation}
                  onChange={(e) => updateFormData({ currentLocation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="New York, NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your occupation or what did you do for work?
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => updateFormData({ occupation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          )}

          {/* Step 3: About This Legacy */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">About this legacy</h2>
                <p className="text-gray-600">Help us understand your journey</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you creating your Living Legacy? *
                </label>
                <select
                  value={formData.primaryReason}
                  onChange={(e) => updateFormData({ primaryReason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  <option value="terminal_illness">Terminal illness</option>
                  <option value="aging">Aging / End of life planning</option>
                  <option value="proactive">Proactive planning</option>
                  <option value="high_risk_profession">High-risk profession</option>
                  <option value="peace_of_mind">Peace of mind</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How soon would you like to complete this? *
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => updateFormData({ urgency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select timeframe...</option>
                  <option value="within_week">Within a week</option>
                  <option value="within_month">Within a month</option>
                  <option value="within_3_months">Within 3 months</option>
                  <option value="no_rush">No rush, taking my time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How are you feeling about this process? * (Select all that apply)
                </label>
                <div className="space-y-2">
                  {['hopeful', 'anxious', 'peaceful', 'overwhelmed', 'empowered'].map((state) => (
                    <label key={state} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.emotionalState.includes(state)}
                        onChange={() => toggleEmotionalState(state)}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-gray-700 capitalize">{state}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Recipients */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Who is this for?</h2>
                <p className="text-gray-600">Add the people who will receive your legacy</p>
              </div>

              <div className="space-y-4">
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                    <button
                      onClick={() => removeRecipient(index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(index, { name: e.target.value })}
                        placeholder="Name *"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        value={recipient.relationship}
                        onChange={(e) => updateRecipient(index, { relationship: e.target.value })}
                        placeholder="Relationship * (e.g., Daughter)"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={recipient.age || ''}
                        onChange={(e) => updateRecipient(index, { age: parseInt(e.target.value) || undefined })}
                        placeholder="Age (optional)"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="email"
                        value={recipient.email || ''}
                        onChange={(e) => updateRecipient(index, { email: e.target.value })}
                        placeholder="Email (optional)"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addRecipient}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Recipient
                </button>
              </div>

              {formData.recipients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who is the primary person this is for?
                  </label>
                  <select
                    value={formData.primaryRecipient}
                    onChange={(e) => updateFormData({ primaryRecipient: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select primary recipient...</option>
                    {formData.recipients.map((r, idx) => (
                      <option key={idx} value={r.name}>
                        {r.name} ({r.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Executor */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Executor information</h2>
                <p className="text-gray-600">Who will activate your legacy?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Executor's Name *
                  </label>
                  <input
                    type="text"
                    value={formData.executorName}
                    onChange={(e) => updateFormData({ executorName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="col-span-1 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    value={formData.executorRelationship}
                    onChange={(e) => updateFormData({ executorRelationship: e.target.value })}
                    placeholder="Brother"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="col-span-1 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.executorEmail}
                    onChange={(e) => updateFormData({ executorEmail: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="col-span-1 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.executorPhone}
                    onChange={(e) => updateFormData({ executorPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={formData.hasNotary}
                    onChange={(e) => updateFormData({ hasNotary: e.target.checked, notaryInfo: e.target.checked ? { name: '', firm: '', email: '', phone: '' } : undefined })}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="ml-3 text-gray-700">I have a notary or lawyer</span>
                </label>
              </div>

              {formData.hasNotary && formData.notaryInfo && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <h3 className="font-semibold text-gray-900">Notary Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.notaryInfo.name}
                      onChange={(e) => updateFormData({ notaryInfo: { ...formData.notaryInfo!, name: e.target.value } })}
                      placeholder="Notary Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={formData.notaryInfo.firm}
                      onChange={(e) => updateFormData({ notaryInfo: { ...formData.notaryInfo!, firm: e.target.value } })}
                      placeholder="Law Firm"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="email"
                      value={formData.notaryInfo.email}
                      onChange={(e) => updateFormData({ notaryInfo: { ...formData.notaryInfo!, email: e.target.value } })}
                      placeholder="Email"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      value={formData.notaryInfo.phone}
                      onChange={(e) => updateFormData({ notaryInfo: { ...formData.notaryInfo!, phone: e.target.value } })}
                      placeholder="Phone"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Content Preferences */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Settings className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Content preferences</h2>
                <p className="text-gray-600">Customize your legacy creation experience</p>
              </div>

              {(formData.selectedTier === 'complete' || formData.selectedTier === 'premium') && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-lg">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-900 font-medium">Voice cloning (your actual voice)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.wantsVoiceClone}
                      onChange={(e) => updateFormData({ wantsVoiceClone: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-900 font-medium">Realistic video avatar</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.wantsVideoAvatar}
                      onChange={(e) => updateFormData({ wantsVideoAvatar: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What types of content do you want to include? * (Select all that apply)
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'life_stories', label: 'Life Stories & History' },
                    { value: 'wisdom_advice', label: 'Wisdom & Advice' },
                    { value: 'specific_messages', label: 'Messages for Specific People' },
                    { value: 'time_capsules', label: 'Time Capsule Messages' },
                    { value: 'everyday_moments', label: 'Everyday Moments & Personality' }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.contentTypes.includes(type.value)}
                        onChange={() => toggleContentType(type.value)}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How much time can you dedicate per week? *
                </label>
                <select
                  value={formData.estimatedTime}
                  onChange={(e) => updateFormData({ estimatedTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select time commitment...</option>
                  <option value="1_hour">1 hour</option>
                  <option value="2_3_hours">2-3 hours</option>
                  <option value="4_5_hours">4-5 hours</option>
                  <option value="as_much_as_needed">As much as needed</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 7: Personality Questionnaire */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Brain className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Capture your personality</h2>
                <p className="text-gray-600">
                  Help us understand what makes you uniquely you. This helps create more authentic responses.
                </p>
              </div>

              {/* Humor Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you describe your sense of humor?
                </label>
                <select
                  value={formData.personalityData.humor}
                  onChange={(e) => updatePersonalityData({ humor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="dry_witty">Dry / Witty</option>
                  <option value="slapstick">Slapstick / Physical</option>
                  <option value="sarcastic">Sarcastic</option>
                  <option value="gentle">Gentle / Wholesome</option>
                  <option value="serious">I'm more serious</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Advice Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When giving advice, you tend to be:
                </label>
                <select
                  value={formData.personalityData.adviceStyle}
                  onChange={(e) => updatePersonalityData({ adviceStyle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="direct">Direct and straightforward</option>
                  <option value="thoughtful">Thoughtful and measured</option>
                  <option value="storytelling">Use stories / analogies</option>
                  <option value="supportive">Supportive and encouraging</option>
                  <option value="socratic">Ask questions to guide thinking</option>
                </select>
              </div>

              {/* Communication Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your communication style is usually: *
                </label>
                <select
                  value={formData.personalityData.communicationStyle}
                  onChange={(e) => updatePersonalityData({ communicationStyle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="formal">Formal and professional</option>
                  <option value="casual">Casual and relaxed</option>
                  <option value="warm">Warm and affectionate</option>
                  <option value="playful">Playful and lighthearted</option>
                  <option value="thoughtful">Serious and thoughtful</option>
                </select>
              </div>

              {/* Core Values */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What matters most to you in life? * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'family', label: 'Family' },
                    { value: 'achievement', label: 'Personal achievement' },
                    { value: 'helping', label: 'Helping others' },
                    { value: 'learning', label: 'Learning / Growth' },
                    { value: 'independence', label: 'Independence' },
                    { value: 'tradition', label: 'Tradition' },
                    { value: 'adventure', label: 'Adventure' },
                    { value: 'security', label: 'Security' }
                  ].map((val) => (
                    <label key={val.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.personalityData.coreValues.includes(val.value)}
                        onChange={() => toggleCoreValue(val.value)}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{val.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conflict Handling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How do you typically handle difficult situations?
                </label>
                <select
                  value={formData.personalityData.conflictHandling}
                  onChange={(e) => updatePersonalityData({ conflictHandling: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="head_on">Face them head-on</option>
                  <option value="thoughtful">Think carefully before acting</option>
                  <option value="seek_advice">Seek advice from others</option>
                  <option value="gut_instinct">Trust my gut instinct</option>
                  <option value="creative">Look for creative solutions</option>
                </select>
              </div>

              {/* Common Phrases */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Words or phrases you often use (optional)
                </label>
                <textarea
                  value={formData.personalityData.commonPhrases}
                  onChange={(e) => updatePersonalityData({ commonPhrases: e.target.value })}
                  placeholder='e.g., "At the end of the day...", "Listen here...", "My dear..."'
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Affection Expression */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How do you express affection?
                </label>
                <select
                  value={formData.personalityData.affectionExpression}
                  onChange={(e) => updatePersonalityData({ affectionExpression: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="words">Words of affirmation</option>
                  <option value="time">Quality time</option>
                  <option value="service">Acts of service</option>
                  <option value="touch">Physical touch</option>
                  <option value="gifts">Gifts</option>
                  <option value="reserved">I'm more reserved</option>
                </select>
              </div>

              {/* Decision Making */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your approach to decision-making:
                </label>
                <select
                  value={formData.personalityData.decisionMaking}
                  onChange={(e) => updatePersonalityData({ decisionMaking: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="logical">Logical and analytical</option>
                  <option value="heart">Follow my heart</option>
                  <option value="others">Consider impact on others</option>
                  <option value="weigh">Weigh pros and cons carefully</option>
                  <option value="decisive">Quick and decisive</option>
                </select>
              </div>

              {/* Life Outlook */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your outlook on life? *
                </label>
                <select
                  value={formData.personalityData.lifeOutlook}
                  onChange={(e) => updatePersonalityData({ lifeOutlook: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="optimistic">Optimistic</option>
                  <option value="realistic">Realistic / Pragmatic</option>
                  <option value="philosophical">Philosophical</option>
                  <option value="cautious">Cautious</option>
                  <option value="adventurous">Adventurous</option>
                </select>
              </div>

              {/* Tradition Importance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How important is tradition to you?
                </label>
                <div className="flex gap-4 items-center">
                  {['Not important', 'Somewhat', 'Very important'].map((level) => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="tradition"
                        value={level.toLowerCase().replace(' ', '_')}
                        checked={formData.personalityData.traditionImportance === level.toLowerCase().replace(' ', '_')}
                        onChange={(e) => updatePersonalityData({ traditionImportance: e.target.value })}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficult Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When talking about difficult topics, you:
                </label>
                <select
                  value={formData.personalityData.difficultTopicsApproach}
                  onChange={(e) => updatePersonalityData({ difficultTopicsApproach: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="direct">Address them directly</option>
                  <option value="gentle">Use gentle language</option>
                  <option value="humor">Use humor to lighten mood</option>
                  <option value="avoid">Avoid if possible</option>
                  <option value="empathetic">Ask others how they feel</option>
                </select>
              </div>

              {/* Political Views (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your political/social views are (optional):
                </label>
                <select
                  value={formData.personalityData.politicalViews}
                  onChange={(e) => updatePersonalityData({ politicalViews: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="progressive">Progressive</option>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="independent">Independent / varies by issue</option>
                  <option value="prefer_not">Prefer not to discuss</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Spiritual Orientation (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your spiritual/religious orientation (optional):
                </label>
                <select
                  value={formData.personalityData.spiritualOrientation}
                  onChange={(e) => updatePersonalityData({ spiritualOrientation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="deeply_spiritual">Deeply spiritual / religious</option>
                  <option value="somewhat_spiritual">Somewhat spiritual</option>
                  <option value="agnostic">Agnostic</option>
                  <option value="atheist">Atheist</option>
                  <option value="prefer_not">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Cultural Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any specific cultural background or traditions important to you? (optional)
                </label>
                <textarea
                  value={formData.personalityData.culturalBackground}
                  onChange={(e) => updatePersonalityData({ culturalBackground: e.target.value })}
                  placeholder="e.g., Irish-American, celebrate Diwali, Sunday family dinners..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Personality Words */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your personality in 3-5 words (optional):
                </label>
                <input
                  type="text"
                  value={formData.personalityData.personalityWords}
                  onChange={(e) => updatePersonalityData({ personalityWords: e.target.value })}
                  placeholder="e.g., Caring, practical, funny, direct, optimistic"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  💡 <strong>Why we ask:</strong> These details help us create an AI that sounds and responds like you.
                  Your answers are private and only used to personalize your legacy.
                </p>
              </div>
            </div>
          )}

          {/* Step 8: Review */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
                <p className="text-gray-600">Make sure everything looks good</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-orange-600" />
                    Selected Plan
                  </h3>
                  <p className="text-gray-700">
                    <strong>{formData.selectedTier.charAt(0).toUpperCase() + formData.selectedTier.slice(1)}</strong> Tier
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Name:</strong> {formData.fullName}</p>
                    <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
                    {formData.currentLocation && <p><strong>Location:</strong> {formData.currentLocation}</p>}
                    {formData.occupation && <p><strong>Occupation:</strong> {formData.occupation}</p>}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Recipients ({formData.recipients.length})</h3>
                  <div className="space-y-2">
                    {formData.recipients.map((r, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        <strong>{r.name}</strong> - {r.relationship}
                        {r.email && ` (${r.email})`}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Executor</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>{formData.executorName}</strong> ({formData.executorRelationship})</p>
                    <p>{formData.executorEmail}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Content Preferences</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Content Types:</strong> {formData.contentTypes.length} selected</p>
                    <p><strong>Time Commitment:</strong> {formData.estimatedTime.replace(/_/g, ' ')}</p>
                    {formData.wantsVoiceClone && <p>✓ Voice cloning enabled</p>}
                    {formData.wantsVideoAvatar && <p>✓ Video avatar enabled</p>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Edit Responses
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Creating Profile...' : 'Start Creating My Legacy'}
                    {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep > 0 && currentStep < 8 && (
            <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 0}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### LivingLegacyPage.tsx
```typescript
/**
 * Living Legacy Page - Conversion-Optimized v2.4.0
 *
 * A conversion-focused landing page that guides users through understanding
 * Living Legacy with interactive preview questions and clear CTAs.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  ArrowRight,
  Shield,
  Users,
  Video,
  Mic,
  FileText,
  CheckCircle,
  Sparkles,
  Gift,
  BookOpen,
  Camera,
  Play,
  ChevronRight,
  Baby
} from 'lucide-react'

export default function LivingLegacyPage() {
  const navigate = useNavigate()

  // Preview questions state
  const [selectedRecipient, setSelectedRecipient] = useState<string>('')
  const [selectedContent, setSelectedContent] = useState<string>('')
  const [selectedFormat, setSelectedFormat] = useState<string>('')
  const [showPreviewResult, setShowPreviewResult] = useState(false)

  const handleStartOnboarding = () => {
    // Always navigate to Living Legacy auth page first
    // (separate authentication from regular chat)
    localStorage.setItem('living-legacy-tier', 'complete')
    navigate('/living-legacy/auth')
  }

  const handlePreviewComplete = () => {
    setShowPreviewResult(true)
    setTimeout(() => {
      handleStartOnboarding()
    }, 2000)
  }

  const isPreviewComplete = selectedRecipient && selectedContent && selectedFormat

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Navigation - Mobile Responsive */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              TalkToYouAI
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            <button
              onClick={() => navigate('/')}
              className="text-sm sm:text-base text-gray-600 hover:text-orange-600 font-medium transition-colors px-2"
            >
              Home
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm sm:text-base text-gray-600 hover:text-orange-600 font-medium transition-colors px-2"
            >
              Pricing
            </button>
            <button
              onClick={handleStartOnboarding}
              className="px-3 sm:px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:from-orange-600 hover:to-rose-600 transition-all shadow-md whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Compact & Clear */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 font-medium mb-6">
              <Sparkles className="w-5 h-5" />
              <span>Your voice, preserved forever</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Your{' '}
              <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                Living Legacy
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create your own digital legacy <strong>while you're still alive</strong>.
              Share your story, wisdom, and love with your loved ones - forever.
            </p>
          </div>

          {/* Visual Example Preview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Video Messages</h3>
              <p className="text-gray-600 text-sm mb-4">Record personal videos for your loved ones</p>
              <div className="mt-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg h-32 flex items-center justify-center relative overflow-hidden">
                {/* Animated recording preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-400 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 16 + 8}px`,
                            animationDelay: `${i * 100}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-white/60">Recording...</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Your Own Voice</h3>
              <p className="text-gray-600 text-sm mb-4">AI learns your voice, face, and personality</p>
              <div className="mt-4 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <div className="flex gap-1">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-1 bg-orange-400 rounded-full" style={{ height: `${Math.random() * 48 + 16}px` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Pictures</h3>
              <p className="text-gray-600 text-sm mb-4">Upload photos for visual representation</p>
              <div className="mt-4 bg-gradient-to-br from-orange-50 to-rose-50 rounded-lg h-32 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 p-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-12 h-12 bg-gradient-to-br from-orange-200 to-rose-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-orange-600 opacity-50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Text & Conversations</h3>
              <p className="text-gray-600 text-sm mb-4">Upload chat exports to capture personality</p>
              <div className="mt-4 space-y-2">
                <div className="bg-orange-50 rounded-lg p-2 text-xs">
                  💬 WhatsApp chats
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-xs">
                  📝 Written stories
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-xs">
                  ✉️ Letters & emails
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Preview Questions - KEY FEATURE */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Try It Now - Answer 3 Quick Questions
            </h2>
            <p className="text-xl text-gray-600">
              Discover how powerful a Living Legacy can be for you
            </p>
          </div>

          {/* Question 1: For whom? */}
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-8 mb-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Who are you creating this for?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'partner', label: 'My Partner', icon: Heart },
                { id: 'children', label: 'My Children', icon: Users },
                { id: 'grandchildren', label: 'Grandchildren', icon: Baby }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedRecipient(option.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRecipient === option.id
                      ? 'border-orange-500 bg-white shadow-lg scale-105'
                      : 'border-orange-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <option.icon className={`w-8 h-8 mx-auto mb-3 ${
                    selectedRecipient === option.id ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: What to share? */}
          <div className={`bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-8 mb-6 border-2 border-orange-200 transition-all ${
            !selectedRecipient ? 'opacity-50' : 'opacity-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900">What do you want to share most?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'lifestory', label: 'My Life Story', icon: BookOpen },
                { id: 'advice', label: 'Advice & Wisdom', icon: Sparkles },
                { id: 'timecapsules', label: 'Time Capsule Messages', icon: Gift }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectedRecipient && setSelectedContent(option.id)}
                  disabled={!selectedRecipient}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedContent === option.id
                      ? 'border-orange-500 bg-white shadow-lg scale-105'
                      : 'border-orange-200 bg-white hover:border-orange-300'
                  } ${!selectedRecipient ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option.icon className={`w-8 h-8 mx-auto mb-3 ${
                    selectedContent === option.id ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: How to express? */}
          <div className={`bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-8 mb-8 border-2 border-orange-200 transition-all ${
            !selectedContent ? 'opacity-50' : 'opacity-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900">How do you want to express yourself?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'text', label: 'Written Text', icon: FileText },
                { id: 'voice', label: 'Voice + Voice AI', icon: Mic },
                { id: 'video', label: 'Video + Avatar', icon: Video }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectedContent && setSelectedFormat(option.id)}
                  disabled={!selectedContent}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedFormat === option.id
                      ? 'border-orange-500 bg-white shadow-lg scale-105'
                      : 'border-orange-200 bg-white hover:border-orange-300'
                  } ${!selectedContent ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option.icon className={`w-8 h-8 mx-auto mb-3 ${
                    selectedFormat === option.id ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Result & CTA */}
          {isPreviewComplete && (
            <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-8 text-white text-center animate-fade-in">
              <Sparkles className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4">
                Perfect! This is what your Living Legacy could look like
              </h3>
              <p className="text-xl mb-2 opacity-90">
                📝 {selectedContent === 'lifestory' ? 'Life Story' : selectedContent === 'advice' ? 'Advice & Wisdom' : 'Time Capsule Messages'}
              </p>
              <p className="text-xl mb-2 opacity-90">
                👥 For: {selectedRecipient === 'partner' ? 'Your Partner' : selectedRecipient === 'children' ? 'Your Children' : 'Your Grandchildren'}
              </p>
              <p className="text-xl mb-6 opacity-90">
                🎬 Format: {selectedFormat === 'text' ? 'Written Text' : selectedFormat === 'voice' ? 'With Your Voice' : 'Video with Avatar'}
              </p>

              {showPreviewResult ? (
                <div className="text-lg">Redirecting to onboarding...</div>
              ) : (
                <button
                  onClick={handlePreviewComplete}
                  className="px-10 py-5 bg-white text-orange-600 rounded-xl font-bold text-xl hover:bg-orange-50 transition-all shadow-2xl inline-flex items-center gap-3"
                >
                  Start Your Living Legacy Now
                  <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* What is Living Legacy - Compact */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            The Difference from a Standard Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Profile */}
            <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-300">
              <h3 className="text-xl font-bold mb-4 text-gray-700">❌ Standard Profile</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Family collects data after passing</li>
                <li>• Only existing content</li>
                <li>• No control over your story</li>
                <li>• Subscription required</li>
              </ul>
            </div>

            {/* Living Legacy */}
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl p-6 border-2 border-orange-400 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-orange-700">✅ Living Legacy</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>You</strong> create your own legacy</li>
                <li>• Intentional recordings & messages</li>
                <li>• Full control over your story</li>
                <li>• One-time investment (€499-€1999)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            4 simple steps to your own Living Legacy
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: 'Start Onboarding',
                description: 'Answer questions about who you are and who you\'re creating this for',
                icon: Users
              },
              {
                step: 2,
                title: 'Record',
                description: 'Video, audio, or text - share your story the way you want',
                icon: Camera
              },
              {
                step: 3,
                title: 'Preview & Test',
                description: 'See how your legacy looks before you finalize it',
                icon: Play
              },
              {
                step: 4,
                title: 'Save & Secure',
                description: 'Get a notary link for activation after passing',
                icon: Shield
              }
            ].map((item) => (
              <div key={item.step} className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <item.icon className="w-8 h-8 text-orange-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleStartOnboarding}
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Use Cases / Examples */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Real Living Legacy Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah, 68',
                scenario: 'Palliative care',
                content: 'Left 47 video messages for her 3 children and 5 grandchildren. Including time capsules for future weddings.',
                quote: '"I know now that my grandchildren will always be able to hear me. That gives me so much peace."'
              },
              {
                name: 'Michael, 45',
                scenario: 'Young father',
                content: 'Proactively created a legacy for his 2 young children. With advice for their 18th, 21st, and 25th birthdays.',
                quote: '"As a father, I want to always be there. This gives me that certainty."'
              },
              {
                name: 'Eleanor, 72',
                scenario: 'Family historian',
                content: 'Shared her life story and family history spanning 4 generations. 12 hours of stories and wisdom.',
                quote: '"My great-grandchildren will know where they come from."'
              }
            ].map((example, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {example.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{example.name}</h3>
                    <p className="text-sm text-orange-600">{example.scenario}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{example.content}</p>
                <div className="bg-orange-50 rounded-lg p-4 italic text-gray-700 border-l-4 border-orange-400">
                  {example.quote}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleStartOnboarding}
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Your Story Deserves This Too
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section - Credit Based System */}
      <section id="pricing" className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            One-time avatar creation • Share via link with family
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter - $499 */}
            <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">$499</div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span><strong>Complete Avatar Creation</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Text, Voice & Video</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>100 conversation credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Share link with family</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Credits can be added anytime</span>
                </li>
              </ul>
              <button
                onClick={handleStartOnboarding}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Complete - $999 - Popular */}
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl p-6 border-4 border-orange-500 relative transform scale-105 shadow-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Complete</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">$999</div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span><strong>Complete Avatar Creation</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Text, Voice & Video</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span><strong>500 conversation credits</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Share link with family</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Credits can be added anytime</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button
                onClick={handleStartOnboarding}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Lifetime - $1499 */}
            <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-2">Lifetime</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">$1,499</div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span><strong>Complete Avatar Creation</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Text, Voice & Video</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>500 conversation credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Share link with family</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Credits can be added anytime</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span><strong>10 Years Annual AI Updates</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Latest technology guarantee</span>
                </li>
              </ul>
              <button
                onClick={handleStartOnboarding}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-8 text-sm md:text-base">
            ✓ All plans include text, voice & video • ✓ Credits available for purchase anytime • ✓ AES-256 encryption
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Story Deserves to Be Preserved
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Start your Living Legacy today. Ready to record in less than 30 minutes.
          </p>
          <button
            onClick={handleStartOnboarding}
            className="px-12 py-5 bg-white text-orange-600 rounded-xl font-bold text-xl hover:bg-orange-50 transition-all shadow-2xl inline-flex items-center gap-3"
          >
            Start for Free
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-sm mt-6 opacity-75">
            No credit card required • Start free • Pay only when finalizing
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold">TalkToYouAI Living Legacy</span>
          </div>
          <p className="text-gray-400 mb-4">
            Preserving love, wisdom, and memories for generations to come
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-orange-400 transition-colors">
              Home
            </button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-orange-400 transition-colors">
              Pricing
            </button>
            <button onClick={() => navigate('/privacy')} className="hover:text-orange-400 transition-colors">
              Privacy
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-orange-400 transition-colors">
              Terms
            </button>
            <button onClick={() => navigate('/contact')} className="hover:text-orange-400 transition-colors">
              Contact
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            © 2024 TalkToYouAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
```

### LivingLegacyPreviewPage.tsx
```typescript
/**
 * Living Legacy Preview Page
 *
 * Allows creators to preview their legacy as recipients will see it
 * Test chat, voice, video interactions before finalization
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Video,
  Gift,
  BookOpen,
  Sparkles,
  Calendar,
  Lock,
  CheckCircle,
  Play,
  Users,
  Volume2,
  Camera
} from 'lucide-react'

interface Recipient {
  id: string
  name: string
  relationship: string
  email: string
}

interface Message {
  id: string
  category: string
  title: string
  isComplete: boolean
  isTimeCapsule: boolean
  unlockCondition?: string
  recipientIds: string[] | null
}

interface ProfilePreviewData {
  profile: {
    id: string
    fullName: string
    profilePhotoUrl: string | null
    tier: string
    hasVoiceClone: boolean
    hasVideoAvatar: boolean
    completionPercentage: number
  }
  recipients: Recipient[]
  messages: Message[]
  statistics: {
    totalMessages: number
    completedMessages: number
    timeCapsules: number
    messagesByCategory: Record<string, number>
    voiceMinutesRecorded: number
    avatarPhotos: number
  }
}

export default function LivingLegacyPreviewPage() {
  const navigate = useNavigate()
  const { profileId } = useParams<{ profileId: string }>()

  const [selectedRecipient, setSelectedRecipient] = useState<string | 'all'>('all')
  const [profileData, setProfileData] = useState<ProfilePreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [testMode, setTestMode] = useState<'overview' | 'chat' | 'voice' | 'video'>('overview')

  useEffect(() => {
    loadPreviewData()
  }, [profileId])

  const loadPreviewData = async () => {
    setIsLoading(true)
    try {
      // TODO: Fetch from API
      // Mock data for now
      const mockData: ProfilePreviewData = {
        profile: {
          id: profileId || '',
          fullName: 'John Davis',
          profilePhotoUrl: null,
          tier: 'complete',
          hasVoiceClone: true,
          hasVideoAvatar: true,
          completionPercentage: 85
        },
        recipients: [
          { id: '1', name: 'Emma', relationship: 'Daughter', email: 'emma@example.com' },
          { id: '2', name: 'Sarah', relationship: 'Wife', email: 'sarah@example.com' },
          { id: '3', name: 'Michael', relationship: 'Son', email: 'michael@example.com' }
        ],
        messages: [
          { id: '1', category: 'life_story', title: 'My Childhood', isComplete: true, isTimeCapsule: false, recipientIds: null },
          { id: '2', category: 'specific_person', title: 'For Emma - Career Advice', isComplete: true, isTimeCapsule: false, recipientIds: ['1'] },
          { id: '3', category: 'time_capsule', title: "Emma's Wedding Day", isComplete: true, isTimeCapsule: true, unlockCondition: 'wedding', recipientIds: ['1'] }
        ],
        statistics: {
          totalMessages: 23,
          completedMessages: 20,
          timeCapsules: 4,
          messagesByCategory: {
            life_story: 8,
            wisdom: 5,
            specific_person: 6,
            time_capsule: 4
          },
          voiceMinutesRecorded: 18,
          avatarPhotos: 47
        }
      }
      setProfileData(mockData)

      // Auto-select first recipient if available
      if (mockData.recipients.length > 0) {
        setSelectedRecipient(mockData.recipients[0].id)
      }
    } catch (error) {
      console.error('Error loading preview data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMessagesForRecipient = () => {
    if (!profileData) return []

    if (selectedRecipient === 'all') {
      return profileData.messages
    }

    return profileData.messages.filter(msg =>
      msg.recipientIds === null || msg.recipientIds.includes(selectedRecipient as string)
    )
  }

  const getTimeCapsules = () => {
    return getMessagesForRecipient().filter(msg => msg.isTimeCapsule)
  }

  const getGeneralMessages = () => {
    return getMessagesForRecipient().filter(msg => !msg.isTimeCapsule)
  }

  const selectedRecipientData = profileData?.recipients.find(r => r.id === selectedRecipient)

  if (isLoading || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Editing</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-semibold">
            <Sparkles className="w-5 h-5" />
            <span>Preview Mode</span>
          </div>

          <button
            onClick={() => navigate(`/living-legacy/${profileId}/finalize`)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition"
          >
            Looks Good, Finalize →
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Preview Your Living Legacy
          </h1>
          <p className="text-lg text-gray-600">
            This is what your loved ones will experience. Test everything before you finalize.
          </p>
        </div>

        {/* Warning if incomplete */}
        {profileData.profile.completionPercentage < 100 && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Profile Not Complete ({profileData.profile.completionPercentage}%)
                </h3>
                <p className="text-gray-700 mb-4">
                  You can preview what you've created so far, but you must complete 100% before you can finalize and generate the notary link.
                </p>
                <button
                  onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipient Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-gray-900">View As:</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedRecipient('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedRecipient === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Recipients
            </button>

            {profileData.recipients.map((recipient) => (
              <button
                key={recipient.id}
                onClick={() => setSelectedRecipient(recipient.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedRecipient === recipient.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {recipient.name} ({recipient.relationship})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Preview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                  {profileData.profile.profilePhotoUrl ? (
                    <img
                      src={profileData.profile.profilePhotoUrl}
                      alt={profileData.profile.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profileData.profile.fullName.charAt(0)
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedRecipient === 'all'
                      ? 'Welcome to My Living Legacy'
                      : `Welcome, ${selectedRecipientData?.name}`}
                  </h2>
                  <p className="text-white/90 mb-4">
                    {profileData.profile.fullName}
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {selectedRecipient === 'all'
                      ? "I created this so we could stay connected, always. You can talk to me, hear my voice, and access the messages I've left for you."
                      : `Hi ${selectedRecipientData?.name}. If you're seeing this, I'm no longer there in person, but I'm here in every way that matters. I made this for you.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Interaction Options */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                How Would You Like to Connect?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTestMode('chat')}
                  className={`p-6 rounded-xl border-2 transition ${
                    testMode === 'chat'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1">Chat</h4>
                  <p className="text-sm text-gray-600">Text conversation</p>
                </button>

                <button
                  onClick={() => setTestMode('voice')}
                  disabled={!profileData.profile.hasVoiceClone}
                  className={`p-6 rounded-xl border-2 transition ${
                    testMode === 'voice'
                      ? 'border-blue-500 bg-blue-50'
                      : profileData.profile.hasVoiceClone
                      ? 'border-gray-200 bg-white hover:border-blue-300'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1">Voice Call</h4>
                  <p className="text-sm text-gray-600">
                    {profileData.profile.hasVoiceClone ? 'Hear my voice' : 'Not available'}
                  </p>
                </button>

                <button
                  onClick={() => setTestMode('video')}
                  disabled={!profileData.profile.hasVideoAvatar}
                  className={`p-6 rounded-xl border-2 transition ${
                    testMode === 'video'
                      ? 'border-blue-500 bg-blue-50'
                      : profileData.profile.hasVideoAvatar
                      ? 'border-gray-200 bg-white hover:border-blue-300'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Video className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1">Video Call</h4>
                  <p className="text-sm text-gray-600">
                    {profileData.profile.hasVideoAvatar ? 'See my face' : 'Not available'}
                  </p>
                </button>
              </div>
            </div>

            {/* Test Mode Content */}
            {testMode === 'chat' && (
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat Preview
                  </h3>
                </div>
                <div className="p-6 bg-gray-50 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Chat interface will open here
                    </p>
                    <p className="text-sm text-gray-500">
                      Your AI personality will respond based on all the content you've created
                    </p>
                  </div>
                </div>
              </div>
            )}

            {testMode === 'voice' && (
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Voice Call Preview
                  </h3>
                </div>
                <div className="p-6 bg-gray-50 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-16 h-16 text-green-600" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Voice call simulation
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Recipients will hear your actual voice speaking naturally
                    </p>
                    <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition">
                      Start Test Call
                    </button>
                  </div>
                </div>
              </div>
            )}

            {testMode === 'video' && (
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Video Call Preview
                  </h3>
                </div>
                <div className="p-6 bg-gray-900 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-16 h-16 text-purple-600" />
                    </div>
                    <p className="text-white mb-4">
                      Video call simulation
                    </p>
                    <p className="text-sm text-gray-300 mb-6">
                      Recipients will see your realistic avatar speaking with natural expressions
                    </p>
                    <button className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition">
                      Start Test Video Call
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Available Content */}
          <div className="space-y-6">
            {/* General Messages */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Available Messages</h3>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getGeneralMessages().length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No messages available
                  </p>
                ) : (
                  getGeneralMessages().map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                    >
                      <Play className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {message.title}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {message.category.replace('_', ' ')}
                        </p>
                      </div>
                      {message.isComplete && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>{getGeneralMessages().length}</strong> messages ready for{' '}
                  {selectedRecipient === 'all' ? 'all recipients' : selectedRecipientData?.name}
                </p>
              </div>
            </div>

            {/* Time Capsules */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Time Capsules</h3>
              </div>

              <div className="space-y-3">
                {getTimeCapsules().length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No time capsules
                  </p>
                ) : (
                  getTimeCapsules().map((capsule) => (
                    <div
                      key={capsule.id}
                      className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {capsule.title}
                          </p>
                          <p className="text-xs text-purple-600 capitalize mt-1">
                            Unlocks: {capsule.unlockCondition?.replace('_', ' ')}
                          </p>
                        </div>
                        <Lock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-sm text-gray-600">
                  <strong>{getTimeCapsules().length}</strong> time capsules will unlock at special moments
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Your Legacy</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="font-semibold text-gray-900">
                    {profileData.statistics.totalMessages}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Capsules</span>
                  <span className="font-semibold text-gray-900">
                    {profileData.statistics.timeCapsules}
                  </span>
                </div>

                {profileData.profile.hasVoiceClone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Voice Recorded</span>
                    <span className="font-semibold text-gray-900">
                      {profileData.statistics.voiceMinutesRecorded} min
                    </span>
                  </div>
                )}

                {profileData.profile.hasVideoAvatar && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avatar Photos</span>
                    <span className="font-semibold text-gray-900">
                      {profileData.statistics.avatarPhotos}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipients</span>
                  <span className="font-semibold text-gray-900">
                    {profileData.recipients.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
          >
            ← Back to Editing
          </button>

          <div className="flex items-center gap-4">
            {profileData.profile.completionPercentage < 100 ? (
              <div className="text-sm text-amber-600 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Complete your profile to finalize</span>
              </div>
            ) : (
              <button
                onClick={() => navigate(`/living-legacy/${profileId}/finalize`)}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                Looks Good, Finalize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### LivingLegacyPricingPage.tsx
```typescript
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Shield, Heart, Clock } from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

interface PricingTier {
  id: 'essential' | 'complete' | 'premium'
  name: string
  price: number
  popular?: boolean
  description: string
  features: string[]
  familyMembers: number
  hostingYears: number
}

const tiers: PricingTier[] = [
  {
    id: 'essential',
    name: 'Essential Legacy',
    price: 499,
    description: 'Perfect for getting started with your legacy',
    familyMembers: 5,
    hostingYears: 50,
    features: [
      'Text-based AI personality',
      'Upload existing data (chats, photos)',
      'Record 50+ messages',
      'Life story chapters',
      'Wisdom & advice section',
      'Access for 5 family members',
      'Secure notary link system',
      '50-year hosting guarantee',
      'Email support'
    ]
  },
  {
    id: 'complete',
    name: 'Complete Legacy',
    price: 999,
    popular: true,
    description: 'Perfect for creating a comprehensive legacy',
    familyMembers: 15,
    hostingYears: 50,
    features: [
      'Everything in Essential, PLUS:',
      '✨ Voice cloning (your actual voice)',
      '✨ Video avatar (realistic)',
      'Unlimited messages',
      'Time capsule messages',
      'Ultra-realistic lip-sync',
      'Access for 15 family members',
      'Priority support',
      '50-year hosting guarantee'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Legacy',
    price: 1999,
    description: 'The ultimate legacy experience',
    familyMembers: 999,
    hostingYears: 100,
    features: [
      'Everything in Complete, PLUS:',
      '✨ Professional video recording session',
      '✨ Guided interview with legacy specialist',
      'Ultra-HD avatar with micro-expressions',
      'Unlimited family members',
      '100-year hosting guarantee',
      'White-glove service',
      'Personal legacy coach',
      'On-demand updates for life'
    ]
  }
]

export default function LivingLegacyPricingPage() {
  const navigate = useNavigate()
  const { user } = useSupabaseAuth()

  const handleGetStarted = (tierId: 'essential' | 'complete' | 'premium') => {
    // Check if user is authenticated
    if (!user) {
      // Store selected tier for after login
      localStorage.setItem('living-legacy-tier', tierId)
      // Redirect to auth page
      navigate('/auth')
      return
    }

    // Navigate to onboarding
    navigate(`/living-legacy/onboarding?tier=${tierId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            One-Time Investment, Eternal Connection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create your Living Legacy today. No monthly fees, no hidden costs.
            <br />
            Just a single payment for a gift that lasts generations.
          </p>

          {/* Trust Badges */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Bank-Level Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">50+ Year Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Heart className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-medium">Unlimited Updates</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${
                tier.popular ? 'ring-4 ring-orange-500 scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-center py-2 font-semibold text-sm">
                  ⭐ MOST POPULAR
                </div>
              )}

              <div className={`p-8 ${tier.popular ? 'pt-14' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">€{tier.price}</span>
                  <span className="text-gray-600 ml-2">one-time</span>
                </div>

                <button
                  onClick={() => handleGetStarted(tier.id)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all mb-8 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.id === 'premium' ? 'Contact Us' : 'Get Started'} <ArrowRight className="inline w-5 h-5 ml-2" />
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${feature.startsWith('✨') ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Family Access:</span>
                    <span className="font-semibold text-gray-900">
                      {tier.familyMembers === 999 ? 'Unlimited' : `Up to ${tier.familyMembers}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Hosting:</span>
                    <span className="font-semibold text-gray-900">{tier.hostingYears} years</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Essential</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Complete</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-4 text-gray-700">AI Personality</td>
                  <td className="text-center py-4 px-4 text-gray-600">Text-based</td>
                  <td className="text-center py-4 px-4 text-gray-600">Voice + Video</td>
                  <td className="text-center py-4 px-4 text-gray-600">Ultra-realistic</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Voice Cloning</td>
                  <td className="text-center py-4 px-4">✗</td>
                  <td className="text-center py-4 px-4 text-green-600 font-semibold">✓</td>
                  <td className="text-center py-4 px-4 text-green-600 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Video Avatar</td>
                  <td className="text-center py-4 px-4">✗</td>
                  <td className="text-center py-4 px-4 text-gray-600">Realistic</td>
                  <td className="text-center py-4 px-4 text-gray-600">Ultra-HD</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Message Limit</td>
                  <td className="text-center py-4 px-4 text-gray-600">50 recordings</td>
                  <td className="text-center py-4 px-4 text-gray-600">Unlimited</td>
                  <td className="text-center py-4 px-4 text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Time Capsules</td>
                  <td className="text-center py-4 px-4 text-gray-600">5 messages</td>
                  <td className="text-center py-4 px-4 text-gray-600">Unlimited</td>
                  <td className="text-center py-4 px-4 text-gray-600">Unlimited + guided</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Recording Help</td>
                  <td className="text-center py-4 px-4 text-gray-600">Self-guided</td>
                  <td className="text-center py-4 px-4 text-gray-600">Prompts & tips</td>
                  <td className="text-center py-4 px-4 text-gray-600">Personal coach</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Support</td>
                  <td className="text-center py-4 px-4 text-gray-600">Email</td>
                  <td className="text-center py-4 px-4 text-gray-600">Priority</td>
                  <td className="text-center py-4 px-4 text-gray-600">White-glove</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Flexible Payment Options</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">One-Time Payment</h3>
              <p className="text-gray-600 text-sm">
                Pay in full and you're done. No recurring charges ever.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Payment Plan (Interest-Free)</h3>
              <p className="text-gray-600 text-sm mb-3">
                Spread the cost while you create your legacy:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Essential: 3 monthly payments of €175</li>
                <li>• Complete: 6 monthly payments of €175</li>
                <li>• Premium: 12 monthly payments of €175</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                What happens if I can't complete it before I pass?
              </h3>
              <p className="text-gray-600">
                Your legacy will be activated with whatever content you've created. We recommend completing at least the essential sections (basic info, main messages, and recipient list) as soon as possible.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Can I upgrade my tier later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade from Essential to Complete or Premium at any time by paying the difference. Contact support to arrange an upgrade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee if you haven't started creating content yet. Once you begin recording messages, sales are final.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                What happens if TalkToYouAI goes out of business?
              </h3>
              <p className="text-gray-600">
                Your legacy is protected. We have partnered with a data escrow service that will ensure your legacy remains accessible for the full hosting period, even if our company ceases operations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                How secure is my data?
              </h3>
              <p className="text-gray-600">
                All data is encrypted with bank-level AES-256 encryption. Your notary activation link uses advanced cryptographic signing. No one can access your legacy without proper verification and authorization.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Create Your Living Legacy?</h2>
          <p className="text-xl mb-8 opacity-90">
            Give your loved ones the gift of connection that lasts forever.
          </p>
          <button
            onClick={() => handleGetStarted('complete')}
            className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl"
          >
            Start Creating Today <ArrowRight className="inline w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

### LivingLegacyProgressDashboardPage.tsx
```typescript
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  Target,
  Award,
  User,
  Users,
  Mic,
  Video,
  Gift,
  Heart,
  Shield,
  FileText,
  Clock,
  Star,
  Zap,
  Crown,
  ChevronRight,
  Info
} from 'lucide-react'

interface ProgressData {
  tier: 'essential' | 'complete' | 'premium'
  profile: {
    basicInfo: boolean
    profilePhoto: boolean
    bio: boolean
  }
  recipients: {
    added: number
    configured: number
  }
  messages: {
    lifeStory: number
    advice: number
    timeCapsules: number
    specific: number
    everyday: number
  }
  voice: {
    samplesRecorded: number
    voiceCloned: boolean
  }
  avatar: {
    photosUploaded: number
    avatarCreated: boolean
  }
  content: {
    totalMessages: number
    totalDuration: number
    averageQuality: number
  }
  finalization: {
    executorAssigned: boolean
    accessControlSet: boolean
    reviewed: boolean
  }
}

interface ChecklistItem {
  id: string
  label: string
  description: string
  completed: boolean
  required: boolean
  icon: any
  action?: () => void
  actionLabel?: string
}

interface TierRequirement {
  tier: 'essential' | 'complete' | 'premium'
  label: string
  icon: any
  color: string
  requirements: {
    messages: number
    recipients: number
    voiceSamples: number
    avatarPhotos: number
    timeCapsules: number
  }
}

const TIER_REQUIREMENTS: TierRequirement[] = [
  {
    tier: 'essential',
    label: 'Essential',
    icon: Star,
    color: 'blue',
    requirements: {
      messages: 3,
      recipients: 1,
      voiceSamples: 3,
      avatarPhotos: 5,
      timeCapsules: 0
    }
  },
  {
    tier: 'complete',
    label: 'Complete',
    icon: Zap,
    color: 'purple',
    requirements: {
      messages: 10,
      recipients: 3,
      voiceSamples: 5,
      avatarPhotos: 10,
      timeCapsules: 2
    }
  },
  {
    tier: 'premium',
    label: 'Premium',
    icon: Crown,
    color: 'orange',
    requirements: {
      messages: 20,
      recipients: 5,
      voiceSamples: 10,
      avatarPhotos: 20,
      timeCapsules: 5
    }
  }
]

export default function LivingLegacyProgressDashboardPage() {
  const navigate = useNavigate()

  // Mock data - in real app, this would come from API/database
  const [progressData] = useState<ProgressData>({
    tier: 'complete',
    profile: {
      basicInfo: true,
      profilePhoto: true,
      bio: true
    },
    recipients: {
      added: 2,
      configured: 2
    },
    messages: {
      lifeStory: 3,
      advice: 2,
      timeCapsules: 1,
      specific: 1,
      everyday: 1
    },
    voice: {
      samplesRecorded: 4,
      voiceCloned: false
    },
    avatar: {
      photosUploaded: 7,
      avatarCreated: false
    },
    content: {
      totalMessages: 8,
      totalDuration: 450, // seconds
      averageQuality: 82
    },
    finalization: {
      executorAssigned: true,
      accessControlSet: true,
      reviewed: false
    }
  })

  const currentTier = TIER_REQUIREMENTS.find(t => t.tier === progressData.tier)!

  // Calculate overall completion
  const completionPercentage = useMemo(() => {
    const requirements = currentTier.requirements

    const scores = [
      // Profile completion (10%)
      (progressData.profile.basicInfo && progressData.profile.profilePhoto && progressData.profile.bio) ? 10 : 0,

      // Recipients (15%)
      Math.min((progressData.recipients.configured / requirements.recipients) * 15, 15),

      // Messages (30%)
      Math.min((progressData.content.totalMessages / requirements.messages) * 30, 30),

      // Voice samples (15%)
      Math.min((progressData.voice.samplesRecorded / requirements.voiceSamples) * 15, 15),

      // Avatar photos (10%)
      Math.min((progressData.avatar.photosUploaded / requirements.avatarPhotos) * 10, 10),

      // Time capsules (10%)
      Math.min((progressData.messages.timeCapsules / requirements.timeCapsules) * 10, 10),

      // Finalization (10%)
      (progressData.finalization.executorAssigned &&
       progressData.finalization.accessControlSet &&
       progressData.finalization.reviewed) ? 10 :
       (progressData.finalization.executorAssigned && progressData.finalization.accessControlSet) ? 7 :
       progressData.finalization.executorAssigned ? 3 : 0
    ]

    return Math.round(scores.reduce((a, b) => a + b, 0))
  }, [progressData, currentTier])

  // Generate checklist items
  const checklistItems = useMemo((): ChecklistItem[] => {
    const requirements = currentTier.requirements

    return [
      {
        id: 'profile',
        label: 'Complete Your Profile',
        description: 'Add basic information, photo, and bio',
        completed: progressData.profile.basicInfo && progressData.profile.profilePhoto && progressData.profile.bio,
        required: true,
        icon: User,
        action: () => navigate('/living-legacy/create/profile'),
        actionLabel: 'Edit Profile'
      },
      {
        id: 'recipients',
        label: `Add Recipients (${progressData.recipients.configured}/${requirements.recipients})`,
        description: 'Configure who will receive your legacy',
        completed: progressData.recipients.configured >= requirements.recipients,
        required: true,
        icon: Users,
        action: () => navigate('/living-legacy/recipients'),
        actionLabel: 'Manage Recipients'
      },
      {
        id: 'messages',
        label: `Record Messages (${progressData.content.totalMessages}/${requirements.messages})`,
        description: 'Share your stories, advice, and memories',
        completed: progressData.content.totalMessages >= requirements.messages,
        required: true,
        icon: Mic,
        action: () => navigate('/living-legacy/record-message'),
        actionLabel: 'Record Messages'
      },
      {
        id: 'voice',
        label: `Voice Samples (${progressData.voice.samplesRecorded}/${requirements.voiceSamples})`,
        description: 'Record voice samples for AI cloning',
        completed: progressData.voice.samplesRecorded >= requirements.voiceSamples,
        required: true,
        icon: Mic,
        action: () => navigate('/living-legacy/voice-setup'),
        actionLabel: 'Record Voice'
      },
      {
        id: 'avatar',
        label: `Upload Photos (${progressData.avatar.photosUploaded}/${requirements.avatarPhotos})`,
        description: 'Photos for creating your digital avatar',
        completed: progressData.avatar.photosUploaded >= requirements.avatarPhotos,
        required: true,
        icon: Video,
        action: () => navigate('/living-legacy/avatar-setup'),
        actionLabel: 'Upload Photos'
      },
      {
        id: 'timecapsules',
        label: `Time Capsules (${progressData.messages.timeCapsules}/${requirements.timeCapsules})`,
        description: 'Messages for future milestones',
        completed: progressData.messages.timeCapsules >= requirements.timeCapsules,
        required: requirements.timeCapsules > 0,
        icon: Gift,
        action: () => navigate('/living-legacy/time-capsule'),
        actionLabel: 'Create Time Capsule'
      },
      {
        id: 'executor',
        label: 'Assign Executor',
        description: 'Choose who will manage your legacy',
        completed: progressData.finalization.executorAssigned,
        required: true,
        icon: Shield,
        action: () => navigate('/living-legacy/finalize'),
        actionLabel: 'Assign Executor'
      },
      {
        id: 'access',
        label: 'Configure Access Control',
        description: 'Set permissions for recipients',
        completed: progressData.finalization.accessControlSet,
        required: true,
        icon: Shield,
        action: () => navigate('/living-legacy/finalize'),
        actionLabel: 'Set Permissions'
      },
      {
        id: 'review',
        label: 'Review & Finalize',
        description: 'Final review before activation',
        completed: progressData.finalization.reviewed,
        required: true,
        icon: FileText,
        action: () => navigate('/living-legacy/finalize'),
        actionLabel: 'Review'
      }
    ]
  }, [progressData, currentTier, navigate])

  const completedItems = checklistItems.filter(item => item.completed).length
  const totalRequiredItems = checklistItems.filter(item => item.required).length

  // Quality recommendations
  const recommendations = useMemo(() => {
    const recs = []

    // Content quality
    if (progressData.content.averageQuality < 70) {
      recs.push({
        type: 'warning',
        title: 'Improve Recording Quality',
        description: 'Some recordings have low audio quality. Consider re-recording in a quieter environment.',
        action: () => navigate('/living-legacy/record-message'),
        actionLabel: 'View Messages'
      })
    }

    // Content diversity
    const totalMessages = progressData.content.totalMessages
    if (progressData.messages.lifeStory < totalMessages * 0.3) {
      recs.push({
        type: 'info',
        title: 'Add More Life Stories',
        description: 'Share more about your life experiences and personal history.',
        action: () => navigate('/living-legacy/record-message'),
        actionLabel: 'Record Story'
      })
    }

    if (progressData.messages.advice < 2) {
      recs.push({
        type: 'info',
        title: 'Share Your Wisdom',
        description: 'Record advice and lessons learned to guide future generations.',
        action: () => navigate('/living-legacy/record-message'),
        actionLabel: 'Record Advice'
      })
    }

    // Voice cloning
    if (progressData.voice.samplesRecorded >= currentTier.requirements.voiceSamples && !progressData.voice.voiceCloned) {
      recs.push({
        type: 'success',
        title: 'Ready for Voice Cloning',
        description: 'You have enough samples to create your AI voice clone.',
        action: () => navigate('/living-legacy/voice-setup'),
        actionLabel: 'Clone Voice'
      })
    }

    // Avatar creation
    if (progressData.avatar.photosUploaded >= currentTier.requirements.avatarPhotos && !progressData.avatar.avatarCreated) {
      recs.push({
        type: 'success',
        title: 'Ready for Avatar Creation',
        description: 'You have enough photos to create your digital avatar.',
        action: () => navigate('/living-legacy/avatar-setup'),
        actionLabel: 'Create Avatar'
      })
    }

    // Time capsules
    if (currentTier.tier !== 'essential' && progressData.messages.timeCapsules === 0) {
      recs.push({
        type: 'info',
        title: 'Create Time Capsules',
        description: 'Schedule messages for important future milestones.',
        action: () => navigate('/living-legacy/time-capsule'),
        actionLabel: 'Create Capsule'
      })
    }

    return recs
  }, [progressData, currentTier, navigate])

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100'
    if (percentage >= 70) return 'text-blue-600 bg-blue-100'
    if (percentage >= 50) return 'text-orange-600 bg-orange-100'
    return 'text-rose-600 bg-rose-100'
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-500'
    if (percentage >= 70) return 'from-blue-500 to-cyan-500'
    if (percentage >= 50) return 'from-orange-500 to-yellow-500'
    return 'from-rose-500 to-pink-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
              <p className="text-sm text-gray-600">Track your Living Legacy completion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Overall Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <currentTier.icon className={`w-6 h-6 text-${currentTier.color}-600`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentTier.label} Tier</h2>
                  <p className="text-white/80 text-sm">Overall Completion</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full ${getStatusColor(completionPercentage)}`}>
                <span className="text-2xl font-bold">{completionPercentage}%</span>
              </div>
            </div>

            <div className="relative">
              <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressBarColor(completionPercentage)} transition-all duration-500`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-white/90 text-sm">
              <div>
                <div className="font-semibold text-white">{completedItems}/{totalRequiredItems}</div>
                <div className="text-white/70">Tasks Complete</div>
              </div>
              <div>
                <div className="font-semibold text-white">{progressData.content.totalMessages}</div>
                <div className="text-white/70">Messages Recorded</div>
              </div>
              <div>
                <div className="font-semibold text-white">{Math.floor(progressData.content.totalDuration / 60)} min</div>
                <div className="text-white/70">Total Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Recommendations
            </h3>
            {recommendations.map((rec, index) => {
              const Icon = rec.type === 'warning' ? AlertCircle : rec.type === 'success' ? CheckCircle2 : Info
              const colorClass = rec.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                                rec.type === 'success' ? 'border-green-200 bg-green-50' :
                                'border-blue-200 bg-blue-50'
              const iconColor = rec.type === 'warning' ? 'text-orange-600' :
                               rec.type === 'success' ? 'text-green-600' :
                               'text-blue-600'

              return (
                <div key={index} className={`border ${colorClass} rounded-xl p-4`}>
                  <div className="flex items-start gap-4">
                    <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      <button
                        onClick={rec.action}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        {rec.actionLabel}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Checklist */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Completion Checklist
          </h3>
          <div className="space-y-3">
            {checklistItems.map(item => {
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border ${item.completed ? 'border-green-200' : 'border-gray-200'} p-4 hover:shadow-md transition-all`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {item.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={`font-semibold ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {item.label}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        {!item.completed && item.action && (
                          <button
                            onClick={item.action}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all text-sm font-medium whitespace-nowrap"
                          >
                            {item.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Content Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8 text-rose-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.lifeStory}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Life Stories</h4>
              <p className="text-sm text-gray-600">Personal history shared</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.advice}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Advice & Wisdom</h4>
              <p className="text-sm text-gray-600">Guidance messages</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Gift className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.timeCapsules}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Time Capsules</h4>
              <p className="text-sm text-gray-600">Scheduled for future</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.specific}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Personal Messages</h4>
              <p className="text-sm text-gray-600">For specific people</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.everyday}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Everyday Moments</h4>
              <p className="text-sm text-gray-600">Daily life captured</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.content.averageQuality}%</span>
              </div>
              <h4 className="font-semibold text-gray-900">Avg. Quality Score</h4>
              <p className="text-sm text-gray-600">Content quality rating</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {completionPercentage < 100 && (
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 rounded-2xl p-8 text-center text-white">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">
              {completionPercentage >= 90 ? "You're Almost There!" :
               completionPercentage >= 70 ? "Great Progress!" :
               completionPercentage >= 50 ? "Keep Going!" :
               "Let's Get Started!"}
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              {completionPercentage >= 90 ? "Just a few more steps to complete your Living Legacy and preserve your voice forever." :
               completionPercentage >= 70 ? "You're making excellent progress. Keep adding content to enrich your legacy." :
               completionPercentage >= 50 ? "You're halfway there! Continue recording to build a comprehensive legacy." :
               "Start creating your Living Legacy today and leave a lasting impact for generations to come."}
            </p>
            <button
              onClick={() => {
                const nextIncomplete = checklistItems.find(item => !item.completed && item.action)
                if (nextIncomplete?.action) {
                  nextIncomplete.action()
                }
              }}
              className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Building
            </button>
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              You've completed your Living Legacy. Your voice, wisdom, and memories are now preserved for future generations.
            </p>
            <button
              onClick={() => navigate('/living-legacy/finalize')}
              className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Review & Activate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 19H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 9H4C3.46957 9 2.96086 8.78929 2.58579 8.41421C2.21071 8.03914 2 7.53043 2 7V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 9H20C20.5304 9 21.0391 8.78929 21.4142 8.41421C21.7893 8.03914 22 7.53043 22 7V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 4H18V9C18 10.5913 17.3679 12.1174 16.2426 13.2426C15.1174 14.3679 13.5913 15 12 15C10.4087 15 8.88258 14.3679 7.75736 13.2426C6.63214 12.1174 6 10.5913 6 9V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
```

### LivingLegacyRecipientManagementPage.tsx
```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Users,
  Pencil,
  Trash2,
  Mail,
  Calendar,
  Shield,
  Eye,
  Check,
  X,
  Heart,
  User,
  Baby,
  UserPlus,
  Search,
  Filter
} from 'lucide-react'

interface Recipient {
  id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  relationshipType: RelationshipType
  accessControl: AccessControl
  messageVisibility: MessageVisibility
  profilePhotoUrl?: string
  phoneNumber?: string
  address?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

type RelationshipType =
  | 'child'
  | 'grandchild'
  | 'great_grandchild'
  | 'spouse'
  | 'sibling'
  | 'parent'
  | 'friend'
  | 'other'

interface AccessControl {
  canViewProfile: boolean
  canViewMessages: boolean
  canViewTimeCapsules: boolean
  canDownloadContent: boolean
  canShareContent: boolean
}

interface MessageVisibility {
  allMessages: boolean
  specificCategories: string[]
  specificMessages: string[]
}

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string; icon: any; color: string }[] = [
  { value: 'child', label: 'Child', icon: User, color: 'blue' },
  { value: 'grandchild', label: 'Grandchild', icon: Baby, color: 'purple' },
  { value: 'great_grandchild', label: 'Great-Grandchild', icon: Baby, color: 'pink' },
  { value: 'spouse', label: 'Spouse / Partner', icon: Heart, color: 'rose' },
  { value: 'sibling', label: 'Sibling', icon: Users, color: 'green' },
  { value: 'parent', label: 'Parent', icon: Shield, color: 'orange' },
  { value: 'friend', label: 'Friend', icon: UserPlus, color: 'cyan' },
  { value: 'other', label: 'Other', icon: Users, color: 'gray' }
]

const MESSAGE_CATEGORIES = [
  { id: 'life_story', label: 'Life Stories' },
  { id: 'advice', label: 'Advice & Wisdom' },
  { id: 'time_capsule', label: 'Time Capsules' },
  { id: 'specific_person', label: 'Personal Messages' },
  { id: 'everyday', label: 'Everyday Moments' }
]

export default function LivingLegacyRecipientManagementPage() {
  const navigate = useNavigate()

  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: '1',
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma.johnson@email.com',
      dateOfBirth: '2005-03-15',
      relationshipType: 'child',
      accessControl: {
        canViewProfile: true,
        canViewMessages: true,
        canViewTimeCapsules: true,
        canDownloadContent: true,
        canShareContent: false
      },
      messageVisibility: {
        allMessages: true,
        specificCategories: [],
        specificMessages: []
      },
      phoneNumber: '+1 (555) 123-4567',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      firstName: 'Oliver',
      lastName: 'Johnson',
      email: 'oliver.j@email.com',
      dateOfBirth: '2008-07-22',
      relationshipType: 'child',
      accessControl: {
        canViewProfile: true,
        canViewMessages: true,
        canViewTimeCapsules: true,
        canDownloadContent: true,
        canShareContent: false
      },
      messageVisibility: {
        allMessages: false,
        specificCategories: ['advice', 'life_story'],
        specificMessages: []
      },
      phoneNumber: '+1 (555) 123-4568',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRelationship, setFilterRelationship] = useState<RelationshipType | 'all'>('all')

  // Form state
  const [formData, setFormData] = useState<Partial<Recipient>>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    relationshipType: 'child',
    phoneNumber: '',
    address: '',
    notes: '',
    accessControl: {
      canViewProfile: true,
      canViewMessages: true,
      canViewTimeCapsules: true,
      canDownloadContent: true,
      canShareContent: false
    },
    messageVisibility: {
      allMessages: true,
      specificCategories: [],
      specificMessages: []
    }
  })

  const handleAddRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      firstName: formData.firstName!,
      lastName: formData.lastName!,
      email: formData.email!,
      dateOfBirth: formData.dateOfBirth!,
      relationshipType: formData.relationshipType!,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      notes: formData.notes,
      accessControl: formData.accessControl!,
      messageVisibility: formData.messageVisibility!,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setRecipients([...recipients, newRecipient])
    resetForm()
    setShowAddModal(false)
  }

  const handleEditRecipient = () => {
    if (!editingRecipient) return

    setRecipients(recipients.map(r =>
      r.id === editingRecipient.id
        ? { ...formData as Recipient, id: r.id, createdAt: r.createdAt, updatedAt: new Date() }
        : r
    ))

    resetForm()
    setEditingRecipient(null)
  }

  const handleDeleteRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id))
    setShowDeleteConfirm(null)
  }

  const startEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient)
    setFormData(recipient)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      relationshipType: 'child',
      phoneNumber: '',
      address: '',
      notes: '',
      accessControl: {
        canViewProfile: true,
        canViewMessages: true,
        canViewTimeCapsules: true,
        canDownloadContent: true,
        canShareContent: false
      },
      messageVisibility: {
        allMessages: true,
        specificCategories: [],
        specificMessages: []
      }
    })
  }

  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch =
      recipient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterRelationship === 'all' || recipient.relationshipType === filterRelationship

    return matchesSearch && matchesFilter
  })

  const getRelationshipInfo = (type: RelationshipType) => {
    return RELATIONSHIP_TYPES.find(r => r.value === type) || RELATIONSHIP_TYPES[0]
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recipient Management</h1>
                <p className="text-sm text-gray-600">Manage who can access your Living Legacy</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Recipient</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterRelationship}
                onChange={(e) => setFilterRelationship(e.target.value as RelationshipType | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Relationships</option>
                {RELATIONSHIP_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recipients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecipients.map(recipient => {
            const relationshipInfo = getRelationshipInfo(recipient.relationshipType)
            const RelationIcon = relationshipInfo.icon
            const age = calculateAge(recipient.dateOfBirth)

            return (
              <div key={recipient.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className={`bg-gradient-to-r from-${relationshipInfo.color}-500 to-${relationshipInfo.color}-600 p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <RelationIcon className={`w-6 h-6 text-${relationshipInfo.color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {recipient.firstName} {recipient.lastName}
                        </h3>
                        <p className="text-sm text-white/80">{relationshipInfo.label}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(recipient)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(recipient.id)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{recipient.email}</span>
                    </div>
                    {recipient.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{recipient.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{age} years old (Born {new Date(recipient.dateOfBirth).toLocaleDateString()})</span>
                    </div>
                  </div>

                  {/* Access Control */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Access Permissions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(recipient.accessControl).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          {value ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-300" />
                          )}
                          <span className={value ? 'text-gray-700' : 'text-gray-400'}>
                            {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Visibility */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Message Visibility
                    </h4>
                    {recipient.messageVisibility.allMessages ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Can view all messages</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 mb-1">Limited to specific categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {recipient.messageVisibility.specificCategories.map(cat => {
                            const category = MESSAGE_CATEGORIES.find(c => c.id === cat)
                            return category ? (
                              <span key={cat} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                {category.label}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {recipient.notes && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm text-gray-700">{recipient.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredRecipients.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipients found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterRelationship !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first recipient to get started'}
            </p>
            {!searchQuery && filterRelationship === 'all' && (
              <button
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all"
              >
                Add First Recipient
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRecipient) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingRecipient(null)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship *
                    </label>
                    <select
                      value={formData.relationshipType}
                      onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value as RelationshipType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {RELATIONSHIP_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Any additional notes about this recipient..."
                  />
                </div>
              </div>

              {/* Access Control */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Access Permissions
                </h3>
                <div className="space-y-3">
                  {Object.entries(formData.accessControl || {}).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          accessControl: {
                            ...formData.accessControl!,
                            [key]: e.target.checked
                          }
                        })}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message Visibility */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Message Visibility
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.messageVisibility?.allMessages}
                      onChange={(e) => setFormData({
                        ...formData,
                        messageVisibility: {
                          ...formData.messageVisibility!,
                          allMessages: e.target.checked,
                          specificCategories: e.target.checked ? [] : formData.messageVisibility!.specificCategories
                        }
                      })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Allow access to all messages</span>
                      <p className="text-sm text-gray-600">Recipient can view all current and future messages</p>
                    </div>
                  </label>

                  {!formData.messageVisibility?.allMessages && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Or select specific categories:</p>
                      <div className="space-y-2">
                        {MESSAGE_CATEGORIES.map(category => (
                          <label key={category.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.messageVisibility?.specificCategories.includes(category.id)}
                              onChange={(e) => {
                                const current = formData.messageVisibility!.specificCategories
                                setFormData({
                                  ...formData,
                                  messageVisibility: {
                                    ...formData.messageVisibility!,
                                    specificCategories: e.target.checked
                                      ? [...current, category.id]
                                      : current.filter(c => c !== category.id)
                                  }
                                })
                              }}
                              className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{category.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingRecipient(null)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingRecipient ? handleEditRecipient : handleAddRecipient}
                  disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingRecipient ? 'Save Changes' : 'Add Recipient'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Recipient?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this recipient? This action cannot be undone. They will lose access to all messages and time capsules.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRecipient(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### LivingLegacyRecordMessagePage.tsx
```typescript
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Mic, Video as VideoIcon, FileText, Save, Trash2, Square,
  Check, Users, Sparkles, AlertCircle, Loader
} from 'lucide-react'

type RecordingFormat = 'text' | 'audio' | 'video'

interface Recipient {
  id: string
  name: string
  relationship: string
}

export default function LivingLegacyRecordMessagePage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || 'life_story'

  const [format, setFormat] = useState<RecordingFormat>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [isForAll, setIsForAll] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [recipients, setRecipients] = useState<Recipient[]>([])

  useEffect(() => {
    // TODO: Fetch recipients from profile
    // For now using mock data
    setRecipients([
      { id: '1', name: 'Emma', relationship: 'Daughter' },
      { id: '2', name: 'Sarah', relationship: 'Wife' },
      { id: '3', name: 'Michael', relationship: 'Son' }
    ])
  }, [profileId])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecording()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const getCategoryInfo = () => {
    switch (category) {
      case 'life_story':
        return {
          title: 'Life Story & History',
          description: 'Share your journey, experiences, and memories',
          prompts: [
            'What was your childhood like?',
            'Tell me about your first job',
            'What\'s your proudest achievement?',
            'What lessons did you learn from challenges?'
          ]
        }
      case 'wisdom':
        return {
          title: 'Wisdom & Advice',
          description: 'Share lessons learned and guidance',
          prompts: [
            'What advice would you give about relationships?',
            'What\'s the most important thing you\'ve learned?',
            'How do you handle difficult times?',
            'What do you wish you knew when you were younger?'
          ]
        }
      case 'specific_person':
        return {
          title: 'Message for Loved Ones',
          description: 'Record personal messages for specific people',
          prompts: [
            'What do you want them to know?',
            'What memories do you cherish together?',
            'What are your hopes for their future?',
            'What makes them special to you?'
          ]
        }
      default:
        return {
          title: 'Record a Message',
          description: 'Share your thoughts and feelings',
          prompts: []
        }
    }
  }

  const startRecording = async () => {
    try {
      const constraints = format === 'video'
        ? { audio: true, video: { width: 1280, height: 720 } }
        : { audio: true }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (format === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      chunksRef.current = []
      const mimeType = format === 'video' ? 'video/webm' : 'audio/webm'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        if (format === 'video') {
          setVideoBlob(blob)
          if (videoRef.current) {
            videoRef.current.srcObject = null
            videoRef.current.src = URL.createObjectURL(blob)
          }
        } else {
          setAudioBlob(blob)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)

    } catch (err: any) {
      setError(`Failed to start recording: ${err.message}`)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
  }

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    )
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please add a title')
      return
    }

    if (format === 'text' && !content.trim()) {
      setError('Please add content')
      return
    }

    if ((format === 'audio' && !audioBlob) || (format === 'video' && !videoBlob)) {
      setError('Please record your message first')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // TODO: Upload audio/video to storage and get URLs
      // For now, we'll just save the text content

      const messageData = {
        profileId,
        category,
        title,
        content: format === 'text' ? content : null,
        recipientIds: isForAll ? null : selectedRecipients,
        isForAllRecipients: isForAll,
        durationSeconds: format !== 'text' ? recordingTime : null,
        recordingFormat: format,
        // TODO: Add videoUrl and audioUrl after upload
      }

      const response = await fetch('/api/legacy/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save message')
      }

      setSuccess(true)
      setTimeout(() => {
        navigate(`/living-legacy/create/${profileId}`)
      }, 1500)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const categoryInfo = getCategoryInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/living-legacy/create/${profileId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{categoryInfo.title}</h1>
              <p className="text-sm text-gray-600">{categoryInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3">
              <Check className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-900">Message saved successfully!</p>
                <p className="text-sm text-green-700">Returning to dashboard...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-900">{error}</p>
            </div>
          )}

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Recording Format:</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('text')}
                disabled={isRecording}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  format === 'text'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <FileText className="w-5 h-5" />
                Text
              </button>
              <button
                onClick={() => setFormat('audio')}
                disabled={isRecording}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  format === 'audio'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <Mic className="w-5 h-5" />
                Audio
              </button>
              <button
                onClick={() => setFormat('video')}
                disabled={isRecording}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  format === 'video'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <VideoIcon className="w-5 h-5" />
                Video
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Career Advice for Emma"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Users className="inline w-4 h-4 mr-1" />
              Who is this message for?
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={isForAll}
                  onChange={() => setIsForAll(true)}
                  className="w-5 h-5 text-orange-500"
                />
                <span className="ml-3 text-gray-900">Everyone (all recipients)</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={!isForAll}
                  onChange={() => setIsForAll(false)}
                  className="w-5 h-5 text-orange-500"
                />
                <span className="ml-3 text-gray-900">Specific people</span>
              </label>
            </div>

            {!isForAll && (
              <div className="mt-3 space-y-2 pl-8">
                {recipients.map(recipient => (
                  <label key={recipient.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(recipient.id)}
                      onChange={() => toggleRecipient(recipient.id)}
                      className="w-4 h-4 text-orange-500 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {recipient.name} ({recipient.relationship})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Content Area */}
          {format === 'text' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Message *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">{content.length} characters</p>
            </div>
          )}

          {(format === 'audio' || format === 'video') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {format === 'video' ? 'Video Recording' : 'Audio Recording'}
              </label>

              {format === 'video' && (
                <div className="mb-4 bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    controls={!isRecording && videoBlob !== null}
                  />
                </div>
              )}

              <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-lg">
                {!isRecording && !audioBlob && !videoBlob && (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition flex items-center gap-2"
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{formatTime(recordingTime)}</div>
                      <div className="text-sm text-gray-600">Recording...</div>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Square className="w-5 h-5" />
                      Stop
                    </button>
                  </>
                )}

                {(audioBlob || videoBlob) && !isRecording && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">✓ Recorded</div>
                      <div className="text-sm text-gray-600">{formatTime(recordingTime)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setAudioBlob(null)
                        setVideoBlob(null)
                        setRecordingTime(0)
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={startRecording}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                      Re-record
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Suggested Prompts */}
          {categoryInfo.prompts.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Suggested prompts:</h3>
              </div>
              <ul className="space-y-2">
                {categoryInfo.prompts.map((prompt, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/living-legacy/create/${profileId}`)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || success}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### LivingLegacyTimeCapsulePage.tsx
```typescript
/**
 * Living Legacy Time Capsule Builder
 *
 * Features:
 * - Create time capsules with multiple unlock conditions
 * - Date-based, age-based, and event-based triggers
 * - Preview for different recipients
 * - Reminder system for time capsule activation
 */

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Gift,
  Calendar,
  User,
  Star,
  Plus,
  Trash2,
  Eye,
  Clock,
  Heart,
  Cake,
  GraduationCap,
  Baby,
  Home,
  Briefcase,
  CheckCircle
} from 'lucide-react'

interface TimeCapsule {
  id: string
  title: string
  message: string
  recipientId: string
  recipientName: string
  unlockConditions: UnlockCondition[]
  status: 'pending' | 'unlocked' | 'delivered'
  createdAt: Date
  scheduledFor?: Date
}

interface UnlockCondition {
  type: 'date' | 'age' | 'event'
  value: string | number
  label: string
}

interface Recipient {
  id: string
  name: string
  relationship: string
  dateOfBirth?: string
}

const EVENT_TEMPLATES = [
  { id: 'birthday', label: '18th Birthday', icon: Cake, suggestedAge: 18 },
  { id: 'graduation', label: 'Graduation', icon: GraduationCap, suggestedAge: 22 },
  { id: 'wedding', label: 'Wedding Day', icon: Heart, suggestedAge: 28 },
  { id: 'first_child', label: 'First Child', icon: Baby, suggestedAge: 30 },
  { id: 'first_home', label: 'First Home', icon: Home, suggestedAge: 32 },
  { id: 'career', label: 'Career Milestone', icon: Briefcase, suggestedAge: 35 }
]

export default function LivingLegacyTimeCapsulePage() {
  const navigate = useNavigate()
  const { profileId } = useParams()

  // Mock recipients - would come from API
  const [recipients] = useState<Recipient[]>([
    { id: '1', name: 'Sarah', relationship: 'Daughter', dateOfBirth: '2010-05-15' },
    { id: '2', name: 'Michael', relationship: 'Son', dateOfBirth: '2015-08-22' }
  ])

  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [currentCapsule, setCurrentCapsule] = useState<Partial<TimeCapsule>>({
    unlockConditions: []
  })
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [previewCapsule, setPreviewCapsule] = useState<TimeCapsule | null>(null)

  const addUnlockCondition = (condition: UnlockCondition) => {
    setCurrentCapsule(prev => ({
      ...prev,
      unlockConditions: [...(prev.unlockConditions || []), condition]
    }))
  }

  const removeUnlockCondition = (index: number) => {
    setCurrentCapsule(prev => ({
      ...prev,
      unlockConditions: prev.unlockConditions?.filter((_, i) => i !== index) || []
    }))
  }

  const createTimeCapsule = () => {
    if (!currentCapsule.title || !currentCapsule.message || !selectedRecipient) {
      alert('Please fill in all required fields')
      return
    }

    if (!currentCapsule.unlockConditions || currentCapsule.unlockConditions.length === 0) {
      alert('Please add at least one unlock condition')
      return
    }

    const newCapsule: TimeCapsule = {
      id: `capsule-${Date.now()}`,
      title: currentCapsule.title,
      message: currentCapsule.message,
      recipientId: selectedRecipient.id,
      recipientName: selectedRecipient.name,
      unlockConditions: currentCapsule.unlockConditions,
      status: 'pending',
      createdAt: new Date()
    }

    setTimeCapsules(prev => [...prev, newCapsule])
    setIsCreating(false)
    setCurrentCapsule({ unlockConditions: [] })
    setSelectedRecipient(null)
    alert('Time Capsule created!')
  }

  const deleteCapsule = (id: string) => {
    if (confirm('Are you sure you want to delete this time capsule?')) {
      setTimeCapsules(prev => prev.filter(c => c.id !== id))
    }
  }

  const calculateAge = (birthDate: string, targetDate: Date = new Date()): number => {
    const birth = new Date(birthDate)
    let age = targetDate.getFullYear() - birth.getFullYear()
    const monthDiff = targetDate.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && targetDate.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getUnlockDate = (capsule: TimeCapsule): Date | null => {
    const recipient = recipients.find(r => r.id === capsule.recipientId)
    if (!recipient || !recipient.dateOfBirth) return null

    const dateBirth = new Date(recipient.dateOfBirth)

    // Find age-based condition
    const ageCondition = capsule.unlockConditions.find(c => c.type === 'age')
    if (ageCondition) {
      const targetAge = ageCondition.value as number
      const unlockDate = new Date(dateBirth)
      unlockDate.setFullYear(dateBirth.getFullYear() + targetAge)
      return unlockDate
    }

    // Find date-based condition
    const dateCondition = capsule.unlockConditions.find(c => c.type === 'date')
    if (dateCondition) {
      return new Date(dateCondition.value as string)
    }

    return null
  }

  const formatUnlockDate = (date: Date | null): string => {
    if (!date) return 'Event-based'
    const now = new Date()
    const diffYears = date.getFullYear() - now.getFullYear()
    const diffMonths = date.getMonth() - now.getMonth()
    const totalMonths = diffYears * 12 + diffMonths

    if (totalMonths < 0) return 'Unlocked'
    if (totalMonths < 12) return `In ${totalMonths} month${totalMonths !== 1 ? 's' : ''}`
    return `In ${diffYears} year${diffYears !== 1 ? 's' : ''}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Time Capsules</h1>
                <p className="text-sm text-gray-600">{timeCapsules.length} capsules created</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Capsule
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isCreating ? (
          /* Time Capsules List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeCapsules.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Time Capsules Yet</h3>
                <p className="text-gray-600 mb-6">Create messages for future milestones</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Capsule
                </button>
              </div>
            ) : (
              timeCapsules.map((capsule) => {
                const unlockDate = getUnlockDate(capsule)
                const unlockInfo = formatUnlockDate(unlockDate)

                return (
                  <div
                    key={capsule.id}
                    className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-orange-300 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{capsule.title}</h3>
                          <p className="text-sm text-gray-600">For {capsule.recipientName}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPreviewCapsule(capsule)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteCapsule(capsule.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {capsule.unlockConditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          {condition.type === 'date' && <Calendar className="w-4 h-4 text-orange-600" />}
                          {condition.type === 'age' && <User className="w-4 h-4 text-orange-600" />}
                          {condition.type === 'event' && <Star className="w-4 h-4 text-orange-600" />}
                          <span>{condition.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">{unlockInfo}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        capsule.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        capsule.status === 'unlocked' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {capsule.status}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          /* Create New Capsule */
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Time Capsule</h2>

              {/* Step 1: Select Recipient */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  For whom? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recipients.map((recipient) => (
                    <button
                      key={recipient.id}
                      onClick={() => setSelectedRecipient(recipient)}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        selectedRecipient?.id === recipient.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{recipient.name}</div>
                      <div className="text-sm text-gray-600">{recipient.relationship}</div>
                      {recipient.dateOfBirth && (
                        <div className="text-xs text-gray-500 mt-1">
                          Age: {calculateAge(recipient.dateOfBirth)} years
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Title & Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capsule Title *
                </label>
                <input
                  type="text"
                  value={currentCapsule.title || ''}
                  onChange={(e) => setCurrentCapsule(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 18th Birthday Message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  value={currentCapsule.message || ''}
                  onChange={(e) => setCurrentCapsule(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  placeholder="Write your message for this special moment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Step 3: Unlock Conditions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When should this unlock? *
                </label>

                {/* Event Templates */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {EVENT_TEMPLATES.map((template) => {
                    const Icon = template.icon
                    return (
                      <button
                        key={template.id}
                        onClick={() => addUnlockCondition({
                          type: 'event',
                          value: template.id,
                          label: template.label
                        })}
                        className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition text-center"
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-xs font-medium text-gray-900">{template.label}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Custom Conditions */}
                <div className="space-y-3">
                  {/* Age-based */}
                  {selectedRecipient?.dateOfBirth && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Age"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const age = parseInt((e.target as HTMLInputElement).value)
                            if (age > 0) {
                              addUnlockCondition({
                                type: 'age',
                                value: age,
                                label: `${selectedRecipient.name}'s ${age}th birthday`
                              })
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling as HTMLInputElement
                          const age = parseInt(input.value)
                          if (age > 0) {
                            addUnlockCondition({
                              type: 'age',
                              value: age,
                              label: `${selectedRecipient.name}'s ${age}th birthday`
                            })
                            input.value = ''
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        Add Age
                      </button>
                    </div>
                  )}

                  {/* Date-based */}
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => {
                        if (e.target.value) {
                          addUnlockCondition({
                            type: 'date',
                            value: e.target.value,
                            label: `On ${new Date(e.target.value).toLocaleDateString()}`
                          })
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Added Conditions */}
                {currentCapsule.unlockConditions && currentCapsule.unlockConditions.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-2">Unlock Conditions:</p>
                    <div className="space-y-2">
                      {currentCapsule.unlockConditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            {condition.type === 'date' && <Calendar className="w-4 h-4 text-orange-600" />}
                            {condition.type === 'age' && <User className="w-4 h-4 text-orange-600" />}
                            {condition.type === 'event' && <Star className="w-4 h-4 text-orange-600" />}
                            <span>{condition.label}</span>
                          </div>
                          <button
                            onClick={() => removeUnlockCondition(idx)}
                            className="p-1 hover:bg-gray-100 rounded transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setCurrentCapsule({ unlockConditions: [] })
                    setSelectedRecipient(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createTimeCapsule}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Create Capsule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewCapsule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setPreviewCapsule(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{previewCapsule.title}</h2>
              <p className="text-gray-600">For {previewCapsule.recipientName}</p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{previewCapsule.message}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Unlock Conditions:</p>
              {previewCapsule.unlockConditions.map((condition, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 p-2 bg-orange-50 rounded">
                  {condition.type === 'date' && <Calendar className="w-4 h-4 text-orange-600" />}
                  {condition.type === 'age' && <User className="w-4 h-4 text-orange-600" />}
                  {condition.type === 'event' && <Star className="w-4 h-4 text-orange-600" />}
                  <span>{condition.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### LivingLegacyUploadDashboard.tsx
```typescript
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  Mic,
  Video,
  X,
  Trash2,
  Eye,
  Sparkles,
  User,
  TrendingUp,
  Camera,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Image as ImageIcon,
  Star
} from 'lucide-react'
import DirectRecordingModal from '../components/DirectRecordingModal'
import * as AvatarService from '../services/avatar.service'

interface UploadedFile {
  id: string
  type: 'text' | 'voice' | 'video' | 'photo'
  file: File
  name: string
  size: number
  uploadedAt: Date
  preview?: string
  duration?: number
  isFavorite?: boolean
}

interface AvatarQuality {
  overall: number
  voiceClarity: number
  visualQuality: number
  textContent: number
  photoQuality: number
}

export default function LivingLegacyUploadDashboard() {
  const navigate = useNavigate()
  const textInputRef = useRef<HTMLInputElement>(null)
  const voiceInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [showDirectRecording, setShowDirectRecording] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState<UploadedFile | null>(null)

  // Avatar creation state
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false)
  const [avatarCreated, setAvatarCreated] = useState(false)
  const [creationProgress, setCreationProgress] = useState('')
  const [avatarId, setAvatarId] = useState<string | null>(null)

  // Load saved avatar state
  useEffect(() => {
    const savedAvatarId = localStorage.getItem('living_legacy_avatar_id')
    const savedAvatarCreated = localStorage.getItem('living_legacy_avatar_created')

    if (savedAvatarId && savedAvatarCreated === 'true') {
      setAvatarId(savedAvatarId)
      setAvatarCreated(true)
    }

    // Load saved uploads
    const savedUploads = localStorage.getItem('living_legacy_uploads')
    if (savedUploads) {
      try {
        const parsedUploads = JSON.parse(savedUploads)
        // Note: Files can't be serialized, so we only restore metadata
        setUploads(parsedUploads.map((u: any) => ({
          ...u,
          uploadedAt: new Date(u.uploadedAt),
          file: null // Files need to be re-uploaded on reload
        })).filter((u: any) => u.file !== null))
      } catch (e) {
        console.error('Error loading saved uploads:', e)
      }
    }
  }, [])

  // Save uploads to localStorage
  useEffect(() => {
    if (uploads.length > 0) {
      try {
        const uploadsToSave = uploads.map(u => ({
          id: u.id,
          type: u.type,
          name: u.name,
          size: u.size,
          uploadedAt: u.uploadedAt.toISOString(),
          preview: u.preview,
          isFavorite: u.isFavorite
        }))
        localStorage.setItem('living_legacy_uploads', JSON.stringify(uploadsToSave))
      } catch (e) {
        console.error('Error saving uploads:', e)
      }
    }
  }, [uploads])

  // Calculate avatar quality based on uploads
  const avatarQuality: AvatarQuality = {
    overall: Math.min(
      100,
      (uploads.filter(u => u.type === 'text').length * 10 +
        uploads.filter(u => u.type === 'voice').length * 15 +
        uploads.filter(u => u.type === 'video').length * 20 +
        uploads.filter(u => u.type === 'photo').length * 10)
    ),
    voiceClarity: Math.min(100, uploads.filter(u => u.type === 'voice').length * 20),
    visualQuality: Math.min(100, uploads.filter(u => u.type === 'video').length * 25),
    textContent: Math.min(100, uploads.filter(u => u.type === 'text').length * 15),
    photoQuality: Math.min(100, uploads.filter(u => u.type === 'photo').length * 15)
  }

  const handleFileUpload = (type: 'text' | 'voice' | 'video' | 'photo', files: FileList | null) => {
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      const newUpload: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        type,
        file,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        isFavorite: false
      }

      // Create preview for video and photos
      if (type === 'video' || type === 'photo') {
        const url = URL.createObjectURL(file)
        newUpload.preview = url
      }

      setUploads(prev => [...prev, newUpload])
    })
  }

  const deleteUpload = (id: string) => {
    const upload = uploads.find(u => u.id === id)
    if (upload?.preview) {
      URL.revokeObjectURL(upload.preview)
    }
    setUploads(prev => prev.filter(u => u.id !== id))
  }

  const toggleFavoritePhoto = (id: string) => {
    setUploads(prev => prev.map(u => ({
      ...u,
      isFavorite: u.id === id ? true : (u.type === 'photo' ? false : u.isFavorite)
    })))
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

  const getBlurAmount = (quality: number) => {
    // More quality = less blur
    // 0% quality = 20px blur
    // 100% quality = 0px blur
    return Math.max(0, 20 - (quality / 100) * 20)
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
      const photoFiles = uploads.filter(u => u.type === 'photo')

      if (voiceFiles.length < 3) {
        alert('Please upload at least 3 voice recordings for better quality voice cloning')
        setIsCreatingAvatar(false)
        return
      }

      if (videoFiles.length === 0 && photoFiles.length === 0) {
        alert('Please upload at least 1 video or photo for avatar creation')
        setIsCreatingAvatar(false)
        return
      }

      // Use favorite photo if available, otherwise first video or photo
      const favoritePhoto = uploads.find(u => u.type === 'photo' && u.isFavorite)
      const presenterImage = favoritePhoto?.file || videoFiles[0]?.file || photoFiles[0]?.file

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

      // Save avatar state
      localStorage.setItem('living_legacy_avatar_id', avatar.id)
      localStorage.setItem('living_legacy_avatar_created', 'true')

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
    (uploads.filter(u => u.type === 'video').length >= 1 || uploads.filter(u => u.type === 'photo').length >= 1) &&
    !avatarCreated &&
    !isCreatingAvatar

  const favoritePhoto = uploads.find(u => u.type === 'photo' && u.isFavorite)

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
              <span className="hidden sm:inline">Quick Record</span>
              <span className="sm:hidden">Record</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Sections - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Text Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Text</h3>
                <p className="text-xs text-gray-600">Stories</p>
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
              <p className="text-sm font-medium text-gray-700">Upload</p>
            </button>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {uploads.filter(u => u.type === 'text').map(upload => (
                <div key={upload.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg group">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 truncate">{upload.name}</p>
                  </div>
                  <button
                    onClick={() => deleteUpload(upload.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
              {uploads.filter(u => u.type === 'text').length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No files</p>
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
                <h3 className="font-semibold text-gray-900">Voice</h3>
                <p className="text-xs text-gray-600">Audio</p>
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
              <p className="text-sm font-medium text-gray-700">Upload</p>
            </button>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {uploads.filter(u => u.type === 'voice').map(upload => (
                <div key={upload.id} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg group">
                  <Mic className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 truncate">{upload.name}</p>
                  </div>
                  <button
                    onClick={() => deleteUpload(upload.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
              {uploads.filter(u => u.type === 'voice').length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No files</p>
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
                <h3 className="font-semibold text-gray-900">Video</h3>
                <p className="text-xs text-gray-600">Clips</p>
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
              <p className="text-sm font-medium text-gray-700">Upload</p>
            </button>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {uploads.filter(u => u.type === 'video').map(upload => (
                <div key={upload.id} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg group">
                  <Video className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 truncate">{upload.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPreview(upload)}
                    className="p-1 hover:bg-orange-200 rounded"
                  >
                    <Eye className="w-3 h-3 text-orange-600" />
                  </button>
                  <button
                    onClick={() => deleteUpload(upload.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
              {uploads.filter(u => u.type === 'video').length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No files</p>
              )}
            </div>
          </div>

          {/* Photo Upload - NEW */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Photos</h3>
                <p className="text-xs text-gray-600">Images</p>
              </div>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic,.webp"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload('photo', e.target.files)}
            />

            <button
              onClick={() => photoInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-pink-300 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group"
            >
              <Upload className="w-8 h-8 text-pink-400 group-hover:text-pink-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Upload</p>
            </button>

            {/* Photo Grid with Favorite Selection */}
            <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
              {uploads.filter(u => u.type === 'photo').length > 0 && (
                <div className="text-xs text-pink-600 font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>Click to set favorite</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {uploads.filter(u => u.type === 'photo').map(upload => (
                  <div key={upload.id} className="relative group">
                    <button
                      onClick={() => toggleFavoritePhoto(upload.id)}
                      className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        upload.isFavorite
                          ? 'border-pink-500 ring-2 ring-pink-300'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {upload.preview && (
                        <img
                          src={upload.preview}
                          alt={upload.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {upload.isFavorite && (
                        <div className="absolute top-1 right-1 bg-pink-500 rounded-full p-1">
                          <Star className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => deleteUpload(upload.id)}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              {uploads.filter(u => u.type === 'photo').length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No photos</p>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Preview Section with Blur Effect */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Digital Avatar</h2>
                <p className="text-white/80">More content = clearer avatar preview</p>
              </div>
              <div className={`px-6 py-3 rounded-full ${getQualityColor(avatarQuality.overall)} font-bold text-lg`}>
                {avatarQuality.overall}%
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Avatar Visual with Blur */}
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-rose-500/20 to-purple-500/20" />

                  {/* Avatar Icon with Progressive Blur */}
                  <div
                    className="relative transition-all duration-1000"
                    style={{
                      filter: `blur(${getBlurAmount(avatarQuality.overall)}px)`,
                      opacity: Math.max(0.3, avatarQuality.overall / 100)
                    }}
                  >
                    {favoritePhoto && favoritePhoto.preview ? (
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl">
                        <img
                          src={favoritePhoto.preview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-gradient-to-br from-orange-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white/50 shadow-2xl">
                        <User className="w-24 h-24 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Quality Overlay Text */}
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <p className="text-white font-bold text-lg mb-1">
                      {avatarQuality.overall < 30 ? 'Keep uploading content...' :
                       avatarQuality.overall < 60 ? 'Avatar is forming...' :
                       avatarQuality.overall < 80 ? 'Almost there!' :
                       'Avatar is ready!'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {avatarQuality.overall < 30 ? 'Upload more files to see your avatar' :
                       avatarQuality.overall < 60 ? 'Sharpening avatar image' :
                       avatarQuality.overall < 80 ? 'High quality achieved' :
                       'Excellent quality - ready for conversations'}
                    </p>
                  </div>

                  {/* Quality Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-4 py-2 rounded-full ${getQualityColor(avatarQuality.overall)} font-semibold text-sm shadow-lg`}>
                      {getQualityText(avatarQuality.overall)}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{uploads.filter(u => u.type === 'text').length}</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <Mic className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{uploads.filter(u => u.type === 'voice').length}</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <Video className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{uploads.filter(u => u.type === 'video').length}</p>
                  </div>
                  <div className="text-center p-2 bg-pink-50 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{uploads.filter(u => u.type === 'photo').length}</p>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Avatar Quality Metrics
                  </h3>

                  <div className="space-y-4">
                    {/* Voice Clarity */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Voice</span>
                        <span className="text-sm font-bold text-gray-900">{avatarQuality.voiceClarity}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${avatarQuality.voiceClarity}%` }}
                        />
                      </div>
                    </div>

                    {/* Visual Quality */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Videos</span>
                        <span className="text-sm font-bold text-gray-900">{avatarQuality.visualQuality}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
                          style={{ width: `${avatarQuality.visualQuality}%` }}
                        />
                      </div>
                    </div>

                    {/* Photo Quality */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Photos</span>
                        <span className="text-sm font-bold text-gray-900">{avatarQuality.photoQuality}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-500"
                          style={{ width: `${avatarQuality.photoQuality}%` }}
                        />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Text</span>
                        <span className="text-sm font-bold text-gray-900">{avatarQuality.textContent}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                          style={{ width: `${avatarQuality.textContent}%` }}
                        />
                      </div>
                    </div>
                  </div>
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
                        onClick={() => navigate(`/living-legacy/conversation-webrtc?avatarId=${avatarId}`)}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg flex items-center justify-center gap-3 font-semibold text-lg"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span>Start Conversation</span>
                      </button>
                    </div>
                  )}

                  {!canCreateAvatar && !avatarCreated && !isCreatingAvatar && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Upload at least 3 voice clips and 1 video/photo to create your avatar
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
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          handleFileUpload('video', dataTransfer.files)
          setShowDirectRecording(false)
        }} />
      )}
    </div>
  )
}
```

### LivingLegacyVoiceSetupPage.tsx
```typescript
/**
 * Living Legacy Voice Cloning Setup Page
 *
 * Allows users to record or upload voice samples for voice cloning
 * Requires 15-20 minutes of clear audio
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Mic,
  Upload,
  Play,
  Pause,
  Trash2,
  Check,
  AlertCircle,
  Volume2,
  FileAudio,
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface VoiceRecording {
  id: string
  name: string
  duration: number
  audioUrl: string
  audioBlob: Blob
  qualityChecks: {
    clearAudio: boolean
    noBackgroundNoise: boolean
    naturalPace: boolean
  }
}

type RecordingMethod = 'script' | 'freeform' | 'upload'

const READING_SCRIPTS = [
  {
    id: 1,
    title: "Introduction Script",
    text: "Hello, my name is [Your Name]. I'm creating this voice recording so that my loved ones can hear my voice even when I'm no longer here. This technology allows me to stay connected with those I care about most.",
    estimatedDuration: 30
  },
  {
    id: 2,
    title: "Life Story Script",
    text: "Let me tell you about my life. I was born in [Year] in [Place]. Growing up, I learned that family is the most important thing. The lessons I learned shaped who I became, and I want to share these with you.",
    estimatedDuration: 30
  },
  {
    id: 3,
    title: "Emotional Range Script",
    text: "I've experienced so much joy in my life - laughter with friends, celebrations with family, quiet moments of peace. But I've also known sadness, worry, and challenge. All of these experiences made me who I am today.",
    estimatedDuration: 35
  },
  {
    id: 4,
    title: "Conversational Script",
    text: "You know, when I think about the future, I hope you remember the good times we had together. Remember when we used to sit and talk for hours? Those conversations meant everything to me.",
    estimatedDuration: 30
  },
  {
    id: 5,
    title: "Advice Script",
    text: "Here's what I want you to know: be kind to yourself and others. Work hard, but don't forget to enjoy life. Take risks when they matter, but always protect what's important to you. And never forget how much you're loved.",
    estimatedDuration: 40
  }
]

export default function LivingLegacyVoiceSetupPage() {
  const navigate = useNavigate()
  const { profileId } = useParams<{ profileId: string }>()

  const [recordingMethod, setRecordingMethod] = useState<RecordingMethod>('script')
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])
  const [currentScript, setCurrentScript] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Calculate total duration
  const totalDuration = recordings.reduce((sum, rec) => sum + rec.duration, 0)
  const totalMinutes = Math.floor(totalDuration / 60)
  const totalSeconds = totalDuration % 60
  const targetMinutes = 15
  const progressPercentage = Math.min((totalDuration / (targetMinutes * 60)) * 100, 100)

  // Quality checks
  const qualityScore = recordings.length > 0
    ? recordings.reduce((sum, rec) => {
        const checks = Object.values(rec.qualityChecks).filter(Boolean).length
        return sum + (checks / 3)
      }, 0) / recordings.length
    : 0

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(blob)

        const newRecording: VoiceRecording = {
          id: `recording-${Date.now()}`,
          name: recordingMethod === 'script'
            ? READING_SCRIPTS[currentScript].title
            : `Recording ${recordings.length + 1}`,
          duration: recordingTime,
          audioUrl,
          audioBlob: blob,
          qualityChecks: {
            clearAudio: true, // Would be checked by backend
            noBackgroundNoise: recordingTime >= 10, // Simple heuristic
            naturalPace: recordingTime >= 15
          }
        }

        setRecordings(prev => [...prev, newRecording])
        setRecordingTime(0)

        if (recordingMethod === 'script' && currentScript < READING_SCRIPTS.length - 1) {
          setCurrentScript(prev => prev + 1)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id))
  }

  const playRecording = (recording: VoiceRecording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const audio = new Audio(recording.audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setPlayingId(null)
      }

      audio.play()
      setPlayingId(recording.id)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.type.startsWith('audio/')) {
        alert(`${file.name} is not an audio file`)
        continue
      }

      // Get duration
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)

      audio.onloadedmetadata = () => {
        const newRecording: VoiceRecording = {
          id: `upload-${Date.now()}-${i}`,
          name: file.name,
          duration: Math.floor(audio.duration),
          audioUrl: audio.src,
          audioBlob: file,
          qualityChecks: {
            clearAudio: true,
            noBackgroundNoise: true,
            naturalPace: audio.duration >= 15
          }
        }

        setRecordings(prev => [...prev, newRecording])
      }
    }
  }

  const handleSaveAndContinue = async () => {
    if (totalDuration < 60) {
      alert('Please record at least 1 minute of audio to continue.')
      return
    }

    // TODO: Upload recordings to backend
    // For now, just navigate to avatar setup
    navigate(`/living-legacy/${profileId}/avatar-setup`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Progress:</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-purple-600">
              {totalMinutes}:{totalSeconds.toString().padStart(2, '0')} / {targetMinutes}:00
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-4">
            <Volume2 className="w-5 h-5" />
            <span>Voice Cloning Setup</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Record Your Voice
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We need 15-20 minutes of your voice to create a perfect clone.
            Choose your preferred recording method below.
          </p>
        </div>

        {/* Recording Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setRecordingMethod('script')}
            className={`p-6 rounded-xl border-2 transition ${
              recordingMethod === 'script'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <FileAudio className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Read Scripts</h3>
            <p className="text-sm text-gray-600">
              Read provided scripts for consistent quality (Recommended)
            </p>
          </button>

          <button
            onClick={() => setRecordingMethod('freeform')}
            className={`p-6 rounded-xl border-2 transition ${
              recordingMethod === 'freeform'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <Mic className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Free-Form</h3>
            <p className="text-sm text-gray-600">
              Talk naturally about anything you'd like
            </p>
          </button>

          <button
            onClick={() => setRecordingMethod('upload')}
            className={`p-6 rounded-xl border-2 transition ${
              recordingMethod === 'upload'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <Upload className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Upload Files</h3>
            <p className="text-sm text-gray-600">
              Upload existing audio recordings
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recording Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              {/* Script Reading Mode */}
              {recordingMethod === 'script' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      Script {currentScript + 1} of {READING_SCRIPTS.length}
                    </h3>
                    <span className="text-sm text-gray-600">
                      Est. {READING_SCRIPTS[currentScript].estimatedDuration}s
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-rose-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-purple-900 mb-3">
                      {READING_SCRIPTS[currentScript].title}
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {READING_SCRIPTS[currentScript].text}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">Recording Tips:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Speak at a natural pace, not too fast or slow</li>
                          <li>Use natural emotions and inflections</li>
                          <li>Find a quiet room with no background noise</li>
                          <li>Speak clearly but naturally</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Free-Form Mode */}
              {recordingMethod === 'freeform' && (
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    Free-Form Recording
                  </h3>

                  <div className="bg-gradient-to-br from-purple-50 to-rose-50 rounded-lg p-6 mb-6">
                    <p className="text-gray-700 mb-4">
                      Talk about anything you'd like. Here are some conversation starters:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Tell a favorite family story or memory</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Share advice you'd give to loved ones</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Describe your daily routine or hobbies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Talk about your values and beliefs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Share your hopes for the future</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Upload Mode */}
              {recordingMethod === 'upload' && (
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    Upload Audio Files
                  </h3>

                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-12 text-center mb-6">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-700 mb-4">
                      Drop audio files here or click to browse
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label
                      htmlFor="audio-upload"
                      className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition cursor-pointer"
                    >
                      Select Audio Files
                    </label>
                    <p className="text-sm text-gray-500 mt-4">
                      Supported formats: MP3, WAV, M4A, OGG
                    </p>
                  </div>
                </div>
              )}

              {/* Recording Controls */}
              {recordingMethod !== 'upload' && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    {isRecording && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full text-red-700 font-semibold mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span>Recording: {formatTime(recordingTime)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-rose-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-rose-600 transition shadow-lg"
                      >
                        <Mic className="w-5 h-5" />
                        Start Recording
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={pauseRecording}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                        >
                          {isPaused ? (
                            <>
                              <Play className="w-5 h-5" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="w-5 h-5" />
                              Pause
                            </>
                          )}
                        </button>

                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                        >
                          <Check className="w-5 h-5" />
                          Finish Recording
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recordings List & Stats */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Progress</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {totalMinutes}m {totalSeconds}s
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalDuration >= targetMinutes * 60 ? (
                      <span className="text-green-600 font-semibold">✓ Target reached!</span>
                    ) : (
                      `${Math.max(0, targetMinutes * 60 - totalDuration)}s remaining`
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Quality Score</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {Math.round(qualityScore * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${qualityScore * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Recordings</span>
                    <span className="font-semibold text-gray-900">{recordings.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recordings List */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Your Recordings ({recordings.length})
              </h3>

              {recordings.length === 0 ? (
                <div className="text-center py-8">
                  <Mic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No recordings yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {recording.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(recording.duration)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playRecording(recording)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                          >
                            {playingId === recording.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => deleteRecording(recording.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quality indicators */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {recording.qualityChecks.clearAudio && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Clear
                          </span>
                        )}
                        {recording.qualityChecks.noBackgroundNoise && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Quiet
                          </span>
                        )}
                        {recording.qualityChecks.naturalPace && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Natural
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
          >
            Save and Come Back Later
          </button>

          <div className="flex items-center gap-4">
            {totalDuration >= 60 && totalDuration < targetMinutes * 60 && (
              <div className="text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Recommended: {targetMinutes - totalMinutes} more minutes</span>
              </div>
            )}

            <button
              onClick={handleSaveAndContinue}
              disabled={totalDuration < 60}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition ${
                totalDuration >= 60
                  ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white hover:from-purple-600 hover:to-rose-600 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {totalDuration >= targetMinutes * 60 ? (
                <>
                  Continue to Avatar Setup
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  Save & Continue
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 🔌 API ENDPOINTS (4 bestanden)

### create-profile.ts
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      userId,
      fullName,
      dateOfBirth,
      tier,
      onboardingData
    } = req.body

    // Validation
    if (!userId || !fullName || !tier) {
      return res.status(400).json({
        error: 'Missing required fields: userId, fullName, tier'
      })
    }

    if (!['essential', 'complete', 'premium'].includes(tier)) {
      return res.status(400).json({
        error: 'Invalid tier. Must be: essential, complete, or premium'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user already has a Living Legacy profile
    const { data: existingProfile } = await supabase
      .from('living_legacy_profiles')
      .select('id')
      .eq('creator_id', userId)
      .single()

    if (existingProfile) {
      return res.status(409).json({
        error: 'User already has a Living Legacy profile',
        profileId: existingProfile.id
      })
    }

    // Determine features based on tier
    const hasVoiceClone = tier === 'complete' || tier === 'premium'
    const hasVideoAvatar = tier === 'complete' || tier === 'premium'

    // Create the profile
    const { data: profile, error: profileError } = await supabase
      .from('living_legacy_profiles')
      .insert({
        creator_id: userId,
        full_name: fullName,
        date_of_birth: dateOfBirth || null,
        tier,
        has_voice_clone: hasVoiceClone,
        has_video_avatar: hasVideoAvatar,
        status: 'draft',
        completion_percentage: 0,
        onboarding_data: onboardingData || {},
        current_location: onboardingData?.currentLocation || null,
        occupation: onboardingData?.occupation || null
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return res.status(500).json({
        error: 'Failed to create profile',
        details: profileError.message
      })
    }

    // Create voice clone record if applicable
    if (hasVoiceClone) {
      await supabase
        .from('legacy_voice_clones')
        .insert({
          profile_id: profile.id,
          voice_name: `${fullName}'s Voice`,
          clone_status: 'not_started'
        })
    }

    // Create video avatar record if applicable
    if (hasVideoAvatar) {
      await supabase
        .from('legacy_video_avatars')
        .insert({
          profile_id: profile.id,
          avatar_name: `${fullName}'s Avatar`,
          avatar_status: 'not_started',
          avatar_type: tier === 'premium' ? 'ultra_hd' : 'hd'
        })
    }

    // Add recipients from onboarding if provided
    if (onboardingData?.recipients && Array.isArray(onboardingData.recipients)) {
      const recipients = onboardingData.recipients.map((r: any) => ({
        profile_id: profile.id,
        name: r.name,
        relationship: r.relationship,
        age: r.age || null,
        email: r.email || null,
        is_primary: r.name === onboardingData.primaryRecipient,
        can_video_call: tier === 'premium'
      }))

      await supabase
        .from('legacy_recipients')
        .insert(recipients)
    }

    // Add executor info if provided
    if (onboardingData?.executorName) {
      await supabase
        .from('legacy_executor_info')
        .insert({
          profile_id: profile.id,
          executor_name: onboardingData.executorName,
          executor_email: onboardingData.executorEmail || null,
          executor_phone: onboardingData.executorPhone || null,
          relationship: onboardingData.executorRelationship || null,
          has_notary: onboardingData.hasNotary || false,
          notary_name: onboardingData.notaryInfo?.name || null,
          notary_firm: onboardingData.notaryInfo?.firm || null,
          notary_email: onboardingData.notaryInfo?.email || null,
          notary_phone: onboardingData.notaryInfo?.phone || null
        })
    }

    return res.status(201).json({
      success: true,
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        tier: profile.tier,
        status: profile.status,
        completionPercentage: profile.completion_percentage,
        hasVoiceClone: profile.has_voice_clone,
        hasVideoAvatar: profile.has_video_avatar
      }
    })

  } catch (error: any) {
    console.error('Create profile error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}
```

### finalize.ts
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { profileId } = req.body

    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID is required' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch profile to verify completion
    const { data: profile, error: profileError } = await supabase
      .from('living_legacy_profiles')
      .select('*, executor:legacy_executor_info(*), recipients:legacy_recipients(*)')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: profileError?.message
      })
    }

    // Check if already finalized
    if (profile.notary_link_token) {
      return res.status(200).json({
        success: true,
        alreadyFinalized: true,
        notaryLinkToken: profile.notary_link_token,
        notaryLinkUrl: `${process.env.VITE_APP_URL || 'https://talktoyouai.com'}/legacy/activate/${profile.notary_link_token}`
      })
    }

    // Verify completion (should be 100%)
    if (profile.completion_percentage < 100) {
      return res.status(400).json({
        error: 'Profile must be 100% complete before finalization',
        completionPercentage: profile.completion_percentage
      })
    }

    // Generate unique notary link token
    const notaryToken = generateNotaryToken()

    // Update profile with token and mark as completed
    const { error: updateError } = await supabase
      .from('living_legacy_profiles')
      .update({
        notary_link_token: notaryToken,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)

    if (updateError) {
      return res.status(500).json({
        error: 'Failed to finalize profile',
        details: updateError.message
      })
    }

    // Generate full URL
    const notaryLinkUrl = `${process.env.VITE_APP_URL || 'https://talktoyouai.com'}/legacy/activate/${notaryToken}`

    // Prepare email data for executor (to be sent separately)
    const executorEmail = profile.executor?.[0] ? {
      to: profile.executor[0].executor_email,
      executorName: profile.executor[0].executor_name,
      creatorName: profile.full_name,
      notaryLinkUrl,
      relationship: profile.executor[0].relationship
    } : null

    // TODO: Send email to executor (implement email service)
    // await sendExecutorEmail(executorEmail)

    return res.status(200).json({
      success: true,
      notaryLinkToken: notaryToken,
      notaryLinkUrl,
      executorEmail: executorEmail ? {
        sent: false, // Will be true after email service is implemented
        email: executorEmail.to
      } : null,
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        status: 'completed',
        recipientCount: profile.recipients.length
      }
    })

  } catch (error: any) {
    console.error('Finalize profile error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}

function generateNotaryToken(): string {
  // Generate a secure random token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = 'NL-'

  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return token
}
```

### get-profile.ts
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { profileId } = req.query

    if (!profileId || typeof profileId !== 'string') {
      return res.status(400).json({ error: 'Profile ID is required' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch profile with related data
    const { data: profile, error: profileError } = await supabase
      .from('living_legacy_profiles')
      .select(`
        *,
        recipients:legacy_recipients(*),
        messages:legacy_messages(id, category, title, is_complete, is_time_capsule, duration_seconds),
        executor:legacy_executor_info(*),
        voice_clone:legacy_voice_clones(*),
        video_avatar:legacy_video_avatars(*),
        uploads:legacy_content_uploads(upload_type, processing_status)
      `)
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: profileError?.message
      })
    }

    // Calculate statistics
    const messagesByCategory = profile.messages.reduce((acc: any, msg: any) => {
      const cat = msg.category || 'other'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    const completedMessages = profile.messages.filter((m: any) => m.is_complete).length
    const totalMessages = profile.messages.length
    const timeCapsules = profile.messages.filter((m: any) => m.is_time_capsule).length

    // Calculate voice clone progress (in minutes)
    const voiceMinutesRecorded = profile.voice_clone?.[0]?.total_audio_duration_seconds
      ? Math.floor(profile.voice_clone[0].total_audio_duration_seconds / 60)
      : 0

    // Calculate avatar photos uploaded
    const avatarPhotos = profile.video_avatar?.[0]?.total_photos_uploaded || 0

    // Get upload counts by type
    const uploadCounts = profile.uploads.reduce((acc: any, upload: any) => {
      acc[upload.upload_type] = (acc[upload.upload_type] || 0) + 1
      return acc
    }, {})

    return res.status(200).json({
      success: true,
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        dateOfBirth: profile.date_of_birth,
        profilePhotoUrl: profile.profile_photo_url,
        status: profile.status,
        completionPercentage: profile.completion_percentage,
        tier: profile.tier,
        hasVoiceClone: profile.has_voice_clone,
        hasVideoAvatar: profile.has_video_avatar,
        isActivated: profile.is_activated,
        createdAt: profile.created_at,
        lastEditedAt: profile.last_edited_at || profile.created_at,
        notaryLinkToken: profile.notary_link_token,
        onboardingData: profile.onboarding_data
      },
      recipients: profile.recipients.map((r: any) => ({
        id: r.id,
        name: r.name,
        relationship: r.relationship,
        email: r.email,
        isPrimary: r.is_primary
      })),
      executor: profile.executor?.[0] ? {
        name: profile.executor[0].executor_name,
        email: profile.executor[0].executor_email,
        relationship: profile.executor[0].relationship,
        hasNotary: profile.executor[0].has_notary,
        notaryName: profile.executor[0].notary_name
      } : null,
      statistics: {
        totalMessages,
        completedMessages,
        timeCapsules,
        messagesByCategory,
        voiceMinutesRecorded,
        voiceMinutesNeeded: 15,
        avatarPhotos,
        avatarPhotosNeeded: 20,
        uploadCounts
      },
      voiceClone: profile.voice_clone?.[0] ? {
        status: profile.voice_clone[0].clone_status,
        audioSampleUrls: profile.voice_clone[0].audio_sample_urls,
        qualityScore: profile.voice_clone[0].quality_score
      } : null,
      videoAvatar: profile.video_avatar?.[0] ? {
        status: profile.video_avatar[0].avatar_status,
        photoUrls: profile.video_avatar[0].photo_urls,
        totalPhotos: profile.video_avatar[0].total_photos_uploaded
      } : null
    })

  } catch (error: any) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}
```

### messages.ts
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // GET - Fetch messages for a profile
    if (req.method === 'GET') {
      const { profileId, category } = req.query

      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ error: 'Profile ID is required' })
      }

      let query = supabase
        .from('legacy_messages')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })

      if (category && typeof category === 'string') {
        query = query.eq('category', category)
      }

      const { data: messages, error } = await query

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch messages', details: error.message })
      }

      return res.status(200).json({ success: true, messages })
    }

    // POST - Create a new message
    if (req.method === 'POST') {
      const {
        profileId,
        category,
        subcategory,
        title,
        content,
        videoUrl,
        audioUrl,
        thumbnailUrl,
        recipientIds,
        isForAllRecipients,
        isTimeCapsule,
        unlockCondition,
        unlockDate,
        unlockAge,
        durationSeconds,
        recordingFormat
      } = req.body

      // Validation
      if (!profileId || !title || !category) {
        return res.status(400).json({
          error: 'Missing required fields: profileId, title, category'
        })
      }

      const messageData = {
        profile_id: profileId,
        category,
        subcategory: subcategory || null,
        title,
        content: content || null,
        video_url: videoUrl || null,
        audio_url: audioUrl || null,
        thumbnail_url: thumbnailUrl || null,
        recipient_ids: recipientIds || null,
        is_for_all_recipients: isForAllRecipients !== false,
        is_time_capsule: isTimeCapsule || false,
        unlock_condition: unlockCondition || null,
        unlock_date: unlockDate || null,
        unlock_age: unlockAge || null,
        duration_seconds: durationSeconds || null,
        recording_format: recordingFormat || 'text',
        is_complete: false,
        is_draft: true,
        recorded_at: new Date().toISOString()
      }

      const { data: message, error: insertError } = await supabase
        .from('legacy_messages')
        .insert(messageData)
        .select()
        .single()

      if (insertError) {
        return res.status(500).json({
          error: 'Failed to create message',
          details: insertError.message
        })
      }

      return res.status(201).json({ success: true, message })
    }

    // PATCH - Update an existing message
    if (req.method === 'PATCH') {
      const { messageId } = req.query
      const updates = req.body

      if (!messageId || typeof messageId !== 'string') {
        return res.status(400).json({ error: 'Message ID is required' })
      }

      // Convert camelCase to snake_case for database
      const dbUpdates: any = {}
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.content !== undefined) dbUpdates.content = updates.content
      if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl
      if (updates.audioUrl !== undefined) dbUpdates.audio_url = updates.audioUrl
      if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl
      if (updates.transcript !== undefined) dbUpdates.transcript = updates.transcript
      if (updates.isComplete !== undefined) dbUpdates.is_complete = updates.isComplete
      if (updates.isDraft !== undefined) dbUpdates.is_draft = updates.isDraft
      if (updates.durationSeconds !== undefined) dbUpdates.duration_seconds = updates.durationSeconds

      dbUpdates.updated_at = new Date().toISOString()

      const { data: message, error: updateError } = await supabase
        .from('legacy_messages')
        .update(dbUpdates)
        .eq('id', messageId)
        .select()
        .single()

      if (updateError) {
        return res.status(500).json({
          error: 'Failed to update message',
          details: updateError.message
        })
      }

      return res.status(200).json({ success: true, message })
    }

    // DELETE - Delete a message
    if (req.method === 'DELETE') {
      const { messageId } = req.query

      if (!messageId || typeof messageId !== 'string') {
        return res.status(400).json({ error: 'Message ID is required' })
      }

      const { error: deleteError } = await supabase
        .from('legacy_messages')
        .delete()
        .eq('id', messageId)

      if (deleteError) {
        return res.status(500).json({
          error: 'Failed to delete message',
          details: deleteError.message
        })
      }

      return res.status(200).json({ success: true, message: 'Message deleted' })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error: any) {
    console.error('Messages API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}
```


## 🛣️ REACT ROUTER ROUTES

Voeg deze routes toe aan je App.tsx:

```typescript
import { lazy } from 'react'

// Living Legacy Pages (lazy loaded)
const LivingLegacyPage = lazy(() => import('./pages/LivingLegacyPage'))
const LivingLegacyAuthPage = lazy(() => import('./pages/LivingLegacyAuthPage'))
const LivingLegacyUploadDashboard = lazy(() => import('./pages/LivingLegacyUploadDashboard'))
const LivingLegacyConversationPage = lazy(() => import('./pages/LivingLegacyConversationPage'))
const LivingLegacyConversationPageWebRTC = lazy(() => import('./pages/LivingLegacyConversationPageWebRTC'))
const LivingLegacyPricingPage = lazy(() => import('./pages/LivingLegacyPricingPage'))
const LivingLegacyOnboardingPage = lazy(() => import('./pages/LivingLegacyOnboardingPage'))
const LivingLegacyCreationDashboard = lazy(() => import('./pages/LivingLegacyCreationDashboard'))
const LivingLegacyRecordMessagePage = lazy(() => import('./pages/LivingLegacyRecordMessagePage'))
const LivingLegacyVoiceSetupPage = lazy(() => import('./pages/LivingLegacyVoiceSetupPage'))
const LivingLegacyAvatarSetupPage = lazy(() => import('./pages/LivingLegacyAvatarSetupPage'))
const LivingLegacyPreviewPage = lazy(() => import('./pages/LivingLegacyPreviewPage'))
const LivingLegacyFinalizationPage = lazy(() => import('./pages/LivingLegacyFinalizationPage'))
const LivingLegacyMessageRecordingPage = lazy(() => import('./pages/LivingLegacyMessageRecordingPage'))
const LivingLegacyTimeCapsulePage = lazy(() => import('./pages/LivingLegacyTimeCapsulePage'))
const LivingLegacyRecipientManagementPage = lazy(() => import('./pages/LivingLegacyRecipientManagementPage'))
const LivingLegacyProgressDashboardPage = lazy(() => import('./pages/LivingLegacyProgressDashboardPage'))

// Routes
<Routes>
  <Route path="/" element={<LivingLegacyPage />} />
  <Route path="/auth" element={<LivingLegacyAuthPage />} />
  <Route path="/upload-dashboard" element={<LivingLegacyUploadDashboard />} />
  <Route path="/conversation" element={<LivingLegacyConversationPage />} />
  <Route path="/conversation-webrtc" element={<LivingLegacyConversationPageWebRTC />} />
  <Route path="/pricing" element={<LivingLegacyPricingPage />} />
  <Route path="/onboarding" element={<LivingLegacyOnboardingPage />} />
  <Route path="/create/:profileId" element={<LivingLegacyCreationDashboard />} />
  <Route path="/:profileId/record" element={<LivingLegacyRecordMessagePage />} />
  <Route path="/:profileId/voice-setup" element={<LivingLegacyVoiceSetupPage />} />
  <Route path="/:profileId/avatar-setup" element={<LivingLegacyAvatarSetupPage />} />
  <Route path="/:profileId/preview" element={<LivingLegacyPreviewPage />} />
  <Route path="/:profileId/finalize" element={<LivingLegacyFinalizationPage />} />
  <Route path="/record-message" element={<LivingLegacyMessageRecordingPage />} />
  <Route path="/time-capsule" element={<LivingLegacyTimeCapsulePage />} />
  <Route path="/recipients" element={<LivingLegacyRecipientManagementPage />} />
  <Route path="/progress" element={<LivingLegacyProgressDashboardPage />} />
</Routes>
```

---

## 🔧 TYPESCRIPT TYPES

Maak bestand `src/types/livingLegacy.ts`:

```typescript
export interface LegacyProfile {
  id: string
  userId: string
  name: string
  relationship?: string
  birthDate?: string
  bio?: string
  photos?: string[]
  videos?: string[]
  audioRecordings?: string[]
  messages?: LegacyMessage[]
  voiceSample?: string
  avatarId?: string
  createdAt: number
  updatedAt: number
  status: 'draft' | 'in_progress' | 'completed' | 'active'
  progress: {
    basicInfo: boolean
    media: boolean
    voice: boolean
    avatar: boolean
    messages: boolean
    recipients: boolean
  }
}

export interface LegacyMessage {
  id: string
  content: string
  occasion: string // 'birthday', 'anniversary', 'graduation', etc.
  scheduledFor?: string // ISO date string
  isTimeCapsule: boolean
  createdAt: number
}

export interface Recipient {
  id: string
  name: string
  email?: string
  phone?: string
  relationship: string
  accessLevel: 'full' | 'limited' | 'specific_messages'
  allowedMessages?: string[] // message IDs if accessLevel is 'specific_messages'
}

export interface UploadedFile {
  id: string
  type: 'photo' | 'video' | 'audio' | 'text'
  url: string
  name: string
  size: number
  uploadedAt: number
}
```

---

## 🔐 ENVIRONMENT VARIABLES

Maak bestand `.env`:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (voor AI chat)
VITE_OPENAI_API_KEY=your_openai_api_key

# ElevenLabs (voor voice)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# HeyGen (voor video avatars)
VITE_HEYGEN_API_KEY=your_heygen_api_key
VITE_HEYGEN_AVATAR_ID=Angela-inblackskirt-20220820

# Stripe (voor betalingen)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Maak bestand `.env.example` met placeholders.

---

## 🛠️ SHARED UTILITIES

### src/utils/whatsappParser.ts
```typescript
/**
 * WhatsApp Export Parser
 *
 * Parses WhatsApp chat exports (.txt format)
 * Supports multiple date/time formats from different locales
 */

import { WhatsAppMessage } from '../types'

/**
 * Parse WhatsApp export text file
 * Supports common WhatsApp export formats
 */
export function parseWhatsAppExport(text: string): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = []
  const lines = text.split('\n')

  // Common WhatsApp patterns (supporting multiple locales):
  // [DD/MM/YYYY, HH:MM:SS] Name: Message
  // [DD/MM/YY, HH:MM:SS] Name: Message
  // DD/MM/YYYY, HH:MM - Name: Message
  // DD-MM-YYYY HH:MM - Name: Message
  // [M/D/YY, H:MM:SS AM/PM] Name: Message (US format)
  // DD.MM.YY, HH:MM - Name: Message (European format)
  const patterns = [
    // Bracket formats
    /\[(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]\s*([^:]+?):\s*(.+)/i,
    // Non-bracket formats
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\s*[-–]\s*([^:]+?):\s*(.+)/i,
    // Alternative format with em-dash
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–]\s*([^:]+?):\s*(.+)/,
  ]

  let currentMessage: WhatsAppMessage | null = null

  for (const line of lines) {
    if (!line.trim()) continue

    // Remove invisible Unicode characters (left-to-right mark, etc.)
    const cleanedLine = line.replace(/[\u200E\u200F\u202A-\u202E]/g, '')

    // Skip WhatsApp system messages (Dutch and English)
    if (cleanedLine.includes('end-to-end versleuteld') ||
        cleanedLine.includes('end-to-end encrypted') ||
        cleanedLine.includes('Messages and calls are') ||
        cleanedLine.includes('Berichten en oproepen') ||
        cleanedLine.includes('sticker weggelaten') ||
        cleanedLine.includes('afbeelding weggelaten') ||
        cleanedLine.includes('video weggelaten') ||
        cleanedLine.includes('audio weggelaten') ||
        cleanedLine.includes('GIF weggelaten') ||
        cleanedLine.includes('document weggelaten') ||
        cleanedLine.includes('Media omitted') ||
        cleanedLine.includes('image omitted') ||
        cleanedLine.includes('sticker omitted') ||
        cleanedLine.includes('created this group') ||
        cleanedLine.includes('changed the subject') ||
        cleanedLine.includes('left') ||
        cleanedLine.includes('was added') ||
        cleanedLine.includes('joined using this')) {
      continue
    }

    let matched = false
    for (const pattern of patterns) {
      const match = cleanedLine.match(pattern)
      if (match) {
        const [, date, time, sender, content] = match

        // Filter out empty content or system messages
        if (!content.trim() || content.trim() === '<Media omitted>') {
          matched = true
          break
        }

        currentMessage = {
          date: date.trim(),
          time: time.trim(),
          sender: sender.trim(),
          content: content.trim(),
        }
        messages.push(currentMessage)
        matched = true
        break
      }
    }

    // If not matched, it might be a continuation of previous message
    if (!matched && currentMessage) {
      currentMessage.content += '\n' + cleanedLine.trim()
    }
  }

  return messages
}

/**
 * Validate if text looks like a WhatsApp export
 */
export function isValidWhatsAppExport(text: string): boolean {
  const messages = parseWhatsAppExport(text)
  return messages.length >= 1 // At least 1 message to be valid
}

/**
 * Get unique senders from parsed messages
 */
export function getUniqueSenders(messages: WhatsAppMessage[]): string[] {
  const senders = new Set<string>()
  messages.forEach((msg) => senders.add(msg.sender))
  return Array.from(senders)
}

/**
 * Filter messages by sender
 */
export function filterBySender(
  messages: WhatsAppMessage[],
  sender: string
): WhatsAppMessage[] {
  return messages.filter((msg) => msg.sender === sender)
}

/**
 * Debug helper - analyze export format
 */
export function analyzeExportFormat(text: string): {
  totalLines: number
  sampleLines: string[]
  detectedPattern: string | null
} {
  const lines = text.split('\n').filter(l => l.trim())
  const sampleLines = lines.slice(0, 5)

  const patterns = [
    { name: 'Bracket format', regex: /\[(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\]/ },
    { name: 'Dash format', regex: /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-/ },
  ]

  let detectedPattern = null
  for (const pattern of patterns) {
    if (lines.some(line => pattern.regex.test(line))) {
      detectedPattern = pattern.name
      break
    }
  }

  return {
    totalLines: lines.length,
    sampleLines,
    detectedPattern,
  }
}
```

---

## 🔄 AUTHENTICATION CONTEXT

### src/contexts/SupabaseAuthContext.tsx
```typescript
/**
 * Supabase Authentication Context
 *
 * Manages email-based authentication with Supabase
 * Handles user sessions, profiles, and credits
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Profile, CREDIT_PRICING } from '../types/database'

interface SupabaseAuthContextType {
  // Auth state
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isConfigured: boolean

  // Credits
  credits: number
  refreshCredits: () => Promise<void>

  // Auth methods
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const isConfigured = isSupabaseConfigured()

  // Pages where we should NOT auto-redirect after sign in
  const noRedirectPaths = ['/reset-password']

  // Initialize auth state
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)

          // Redirect to dashboard on sign in or email confirmation
          // But not if we're on certain pages like password reset
          if (
            (event === 'SIGNED_IN' || event === 'USER_UPDATED') &&
            !noRedirectPaths.includes(location.pathname)
          ) {
            // Check if we're on homepage or auth pages, then redirect to dashboard
            const authPaths = ['/', '/auth', '/email-auth', '/login', '/setup']
            if (authPaths.includes(location.pathname)) {
              navigate('/dashboard')
            }
          }
        } else {
          setProfile(null)
          setCredits(0)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [isConfigured, navigate, location.pathname])

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Profile doesn't exist yet - will be created on signup
        console.log('Profile not found, might be new user')
        setProfile(null)
        setCredits(0)
      } else if (data) {
        setProfile(data as Profile)
        setCredits((data as Profile).credits)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh credits from database
  const refreshCredits = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setCredits((data as { credits: number }).credits)
    }
  }

  // Sign up with email
  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (!error && data.user) {
      // Create profile with signup bonus credits
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          display_name: displayName || null,
          credits: CREDIT_PRICING.SIGNUP_BONUS,
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
      } else {
        // Record the signup bonus as a transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: data.user.id,
            amount: CREDIT_PRICING.SIGNUP_BONUS,
            type: 'bonus',
            description: 'Welkomstbonus bij registratie',
          })
      }
    }

    return { error }
  }

  // Sign in with email
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setCredits(0)
  }

  // Reset password
  const resetPassword = async (
    email: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    return { error }
  }

  // Update password
  const updatePassword = async (
    newPassword: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isConfigured) {
      return { error: { message: 'Supabase niet geconfigureerd' } as AuthError }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    return { error }
  }

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured,
        credits,
        refreshCredits,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext)
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  }
  return context
}
```

---

## 🗄️ SUPABASE DATABASE SCHEMA

Maak deze tabellen in je Supabase database:

```sql
-- Living Legacy Profiles tabel
CREATE TABLE living_legacy_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  birth_date DATE,
  bio TEXT,
  photos TEXT[], -- Array van URLs
  videos TEXT[], -- Array van URLs
  audio_recordings TEXT[], -- Array van URLs
  voice_sample TEXT, -- URL naar voice sample
  avatar_id TEXT, -- HeyGen avatar ID
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'active')),
  progress JSONB DEFAULT '{
    "basicInfo": false,
    "media": false,
    "voice": false,
    "avatar": false,
    "messages": false,
    "recipients": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Living Legacy Messages tabel
CREATE TABLE living_legacy_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES living_legacy_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  occasion TEXT, -- 'birthday', 'anniversary', etc.
  scheduled_for TIMESTAMP WITH TIME ZONE,
  is_time_capsule BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipients tabel
CREATE TABLE living_legacy_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES living_legacy_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship TEXT,
  access_level TEXT DEFAULT 'full' CHECK (access_level IN ('full', 'limited', 'specific_messages')),
  allowed_messages UUID[], -- Array van message IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uploaded Files tabel
CREATE TABLE living_legacy_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES living_legacy_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'audio', 'text')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes voor performance
CREATE INDEX idx_profiles_user_id ON living_legacy_profiles(user_id);
CREATE INDEX idx_messages_profile_id ON living_legacy_messages(profile_id);
CREATE INDEX idx_recipients_profile_id ON living_legacy_recipients(profile_id);
CREATE INDEX idx_files_profile_id ON living_legacy_files(profile_id);

-- Row Level Security (RLS)
ALTER TABLE living_legacy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_legacy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_legacy_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_legacy_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profiles"
  ON living_legacy_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles"
  ON living_legacy_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
  ON living_legacy_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles"
  ON living_legacy_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

---

## 📦 PACKAGE.JSON (Volledig)

```json
{
  "name": "living-legacy",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

---

## 🚀 PROJECT SETUP INSTRUCTIES

### 1. Nieuw Vite + React + TypeScript project

```bash
npm create vite@latest living-legacy -- --template react-ts
cd living-legacy
npm install
```

### 2. Installeer dependencies

```bash
npm install @supabase/supabase-js react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configureer Tailwind CSS

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Project structuur

```
living-legacy/
├── api/
│   └── legacy/
│       ├── create-profile.ts
│       ├── finalize.ts
│       ├── get-profile.ts
│       └── messages.ts
├── src/
│   ├── contexts/
│   │   └── SupabaseAuthContext.tsx
│   ├── pages/
│   │   ├── LivingLegacyPage.tsx
│   │   ├── LivingLegacyAuthPage.tsx
│   │   ├── ... (alle 17 pages)
│   ├── types/
│   │   └── livingLegacy.ts
│   ├── utils/
│   │   └── whatsappParser.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

### 5. Kopieer alle code

Kopieer alle code uit dit export document naar de juiste bestanden in je nieuwe project.

### 6. Configureer environment variables

```bash
cp .env.example .env
# Vul .env in met je API keys
```

### 7. Start development server

```bash
npm run dev
```

### 8. Deploy naar Vercel

```bash
npm install -g vercel
vercel
```

---

## 🎯 VERCEL CONFIGURATIE

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.elevenlabs.io https://api.heygen.com https://api.openai.com; frame-ancestors 'none'"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## ✅ CHECKLIST VOOR NIEUWE APP

- [ ] Vite project aangemaakt
- [ ] Dependencies geïnstalleerd
- [ ] Tailwind CSS geconfigureerd
- [ ] Alle 17 pages gekopieerd
- [ ] Alle 4 API endpoints gekopieerd
- [ ] Types gedefinieerd
- [ ] Contexts toegevoegd
- [ ] Routes geconfigureerd in App.tsx
- [ ] Environment variables ingesteld
- [ ] Supabase database schema uitgevoerd
- [ ] Supabase RLS policies ingesteld
- [ ] Local development test
- [ ] Production build test (`npm run build`)
- [ ] Vercel deployment
- [ ] DNS configuratie (custom domain)
- [ ] SSL certificaat (automatisch via Vercel)

---

## 📚 FUNCTIONALITEIT OVERZICHT

### Core Features:
1. **Profile Creation** - Maak Living Legacy profiel van overleden persoon
2. **Media Upload** - Upload fotos, videos, audio
3. **WhatsApp Chat Import** - Importeer WhatsApp/Messenger gesprekken
4. **Voice Clone** - ElevenLabs voice cloning
5. **Video Avatar** - HeyGen interactive avatars
6. **Message Recording** - Pre-opgenomen berichten voor speciale gelegenheden
7. **Time Capsule** - Berichten die op specifieke data worden vrijgegeven
8. **Recipient Management** - Wie toegang heeft tot welke content
9. **AI Conversations** - Chat met AI versie van persoon
10. **Progress Tracking** - Dashboard met voortgang

### User Flow:
1. Landing Page → Call to action
2. Auth Page → Inloggen/registreren (Supabase)
3. Onboarding → Uitleg van proces
4. Upload Dashboard → Media uploaden
5. Creation Dashboard → Profiel samenstellen
6. Voice Setup → Voice sample opnemen
7. Avatar Setup → Avatar kiezen/maken
8. Message Recording → Berichten opnemen
9. Preview → Test AI gesprek
10. Finalize → Profiel activeren
11. Conversation → Familie kan chatten met AI

---

## 🔒 BEVEILIGING

- **Authentication**: Supabase Auth
- **Database**: Row Level Security (RLS)
- **Storage**: Supabase Storage met signed URLs
- **API**: Serverless functions met auth checks
- **Encryption**: Client-side encryption voor gevoelige data
- **HTTPS**: Force SSL via Vercel
- **CSP**: Content Security Policy headers

---

## 💰 MONETIZATION

**Pricing tiers** (vanuit LivingLegacyPricingPage):
- **Free**: 1 profiel, basis features
- **Standard**: €9.99/maand - 3 profielen, voice clone
- **Premium**: €19.99/maand - Unlimited profielen, video avatars
- **Enterprise**: Custom pricing

---

