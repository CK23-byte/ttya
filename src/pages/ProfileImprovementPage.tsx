/**
 * Profile Improvement Page
 *
 * Allows users to enhance personality profiles by adding:
 * - Text notes and memories
 * - Voice samples
 * - Photos
 * - Videos
 *
 * Shows profile completeness indicator (but everything is optional)
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Mic,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Check,
  X,
  Trash2,
  Play,
  Pause,
  Save
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getSecure, setSecure } from '../utils/secureStorage'
import { PersonalityProfile } from '../types'
import Header from '../components/Header'

const PROFILES_STORAGE_KEY = 'personality_profiles'

interface ProfileData {
  textNotes: string[]
  voiceSamples: { id: string; blob: Blob; duration: number; name: string }[]
  photos: { id: string; url: string; name: string }[]
  videos: { id: string; url: string; name: string }[]
}

export default function ProfileImprovementPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const profileId = searchParams.get('profileId')
  const { encryptionKey } = useAuth()

  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    textNotes: [],
    voiceSamples: [],
    photos: [],
    videos: []
  })

  const [newNote, setNewNote] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const voiceSectionRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const focusParam = searchParams.get('focus')

  useEffect(() => {
    if (!profileId || !encryptionKey) {
      navigate('/dashboard')
      return
    }

    loadProfile()
    loadProfileData()
  }, [profileId, encryptionKey])

  // Scroll to focused section if focus parameter is provided
  useEffect(() => {
    if (focusParam === 'voice' && voiceSectionRef.current) {
      setTimeout(() => {
        voiceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 500)
    }
  }, [focusParam])

  const loadProfile = async () => {
    if (!encryptionKey) return

    try {
      const profiles = await getSecure<PersonalityProfile[]>(
        PROFILES_STORAGE_KEY,
        encryptionKey
      ) || []

      const foundProfile = profiles.find(p => p.id === profileId)
      if (foundProfile) {
        setProfile(foundProfile)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadProfileData = async () => {
    if (!encryptionKey || !profileId) return

    try {
      const data = await getSecure<ProfileData>(
        `profile_data_${profileId}`,
        encryptionKey
      )

      if (data) {
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    }
  }

  const saveProfileData = async () => {
    if (!encryptionKey || !profileId) return

    setIsSaving(true)
    try {
      await setSecure(
        `profile_data_${profileId}`,
        profileData,
        encryptionKey
      )
    } catch (error) {
      console.error('Error saving profile data:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate profile completeness (0-100%)
  const calculateCompleteness = (): number => {
    let score = 0
    const weights = {
      basic: 20, // Name, relationship (always filled)
      text: 20,
      voice: 30,
      photos: 15,
      videos: 15
    }

    // Basic profile info (always 20%)
    score += weights.basic

    // Text notes
    if (profileData.textNotes.length > 0) {
      score += weights.text
    }

    // Voice samples (important for calls)
    if (profileData.voiceSamples.length > 0) {
      score += weights.voice
    }

    // Photos
    if (profileData.photos.length > 0) {
      score += weights.photos
    }

    // Videos
    if (profileData.videos.length > 0) {
      score += weights.videos
    }

    return Math.min(100, score)
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      setProfileData(prev => ({
        ...prev,
        textNotes: [...prev.textNotes, newNote.trim()]
      }))
      setNewNote('')
    }
  }

  const handleDeleteNote = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      textNotes: prev.textNotes.filter((_, i) => i !== index)
    }))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const id = `voice_${Date.now()}`
        const duration = recordingTime

        setProfileData(prev => ({
          ...prev,
          voiceSamples: [
            ...prev.voiceSamples,
            {
              id,
              blob: audioBlob,
              duration,
              name: `Voice Sample ${prev.voiceSamples.length + 1}`
            }
          ]
        }))

        stream.getTracks().forEach(track => track.stop())
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const id = `voice_${Date.now()}`
      setProfileData(prev => ({
        ...prev,
        voiceSamples: [
          ...prev.voiceSamples,
          {
            id,
            blob: file,
            duration: 0,
            name: file.name
          }
        ]
      }))
    }
  }

  const handleDeleteVoice = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      voiceSamples: prev.voiceSamples.filter(v => v.id !== id)
    }))
  }

  const togglePlayAudio = (id: string, blob: Blob) => {
    if (playingAudioId === id) {
      audioElementRef.current?.pause()
      setPlayingAudioId(null)
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
      }

      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioElementRef.current = audio

      audio.onended = () => {
        setPlayingAudioId(null)
      }

      audio.play()
      setPlayingAudioId(id)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        const id = `photo_${Date.now()}_${Math.random()}`

        setProfileData(prev => ({
          ...prev,
          photos: [
            ...prev.photos,
            { id, url, name: file.name }
          ]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        const id = `video_${Date.now()}`

        setProfileData(prev => ({
          ...prev,
          videos: [
            ...prev.videos,
            { id, url, name: file.name }
          ]
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeletePhoto = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id)
    }))
  }

  const handleDeleteVideo = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== id)
    }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const completeness = calculateCompleteness()

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header variant="transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-semibold text-2xl shadow-lg">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.name}</h1>
              <p className="text-gray-600 capitalize">{profile.relationship}</p>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Profile Completeness</span>
              <span className="font-semibold text-orange-600">{completeness}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Everything is optional! Add what you feel comfortable sharing to improve conversations.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Text Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Text Notes & Memories</h2>
            </div>

            <div className="space-y-4">
              {/* Add Note */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a memory, note, or characteristic..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>

              {/* Notes List */}
              {profileData.textNotes.length > 0 && (
                <div className="space-y-2">
                  {profileData.textNotes.map((note, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      <p className="flex-1 text-gray-700">{note}</p>
                      <button
                        onClick={() => handleDeleteNote(index)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Samples */}
          <div ref={voiceSectionRef} className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Mic className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900">Voice Samples</h2>
              <span className="text-sm text-gray-500">(Required for voice calls)</span>
            </div>

            <div className="space-y-4">
              {/* Recording Controls */}
              <div className="flex gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Record Voice Sample'}
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition border border-blue-200 flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Audio
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleVoiceUpload}
                  className="hidden"
                />
              </div>

              {/* Voice Samples List */}
              {profileData.voiceSamples.length > 0 && (
                <div className="space-y-2">
                  {profileData.voiceSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                    >
                      <button
                        onClick={() => togglePlayAudio(sample.id, sample.blob)}
                        className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition"
                      >
                        {playingAudioId === sample.id ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{sample.name}</p>
                        {sample.duration > 0 && (
                          <p className="text-sm text-gray-500">{formatTime(sample.duration)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteVoice(sample.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">Photos</h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition border border-blue-200 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Photos
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {profileData.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {profileData.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Videos */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <VideoIcon className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900">Videos</h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition border border-purple-200 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Video
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />

              {profileData.videos.length > 0 && (
                <div className="space-y-3">
                  {profileData.videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                    >
                      <VideoIcon className="w-5 h-5 text-purple-500" />
                      <p className="flex-1 font-medium text-gray-700">{video.name}</p>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 sticky bottom-4">
          <button
            onClick={saveProfileData}
            disabled={isSaving}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
