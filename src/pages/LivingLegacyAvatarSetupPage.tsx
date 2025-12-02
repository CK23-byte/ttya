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
