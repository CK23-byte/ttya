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

// Storage interface (what gets saved - with base64)
interface StoredProfileData {
  textNotes: string[]
  voiceSamples: { id: string; base64Data: string; duration: number; name: string; mimeType: string }[]
  photos: { id: string; url: string; name: string }[]
  videos: { id: string; url: string; name: string }[]
}

// Runtime interface (what we work with - with Blobs)
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
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)
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
      const data = await getSecure<StoredProfileData>(
        `profile_data_${profileId}`,
        encryptionKey
      )

      console.log('Loading profile data:', data)

      if (data) {
        // Convert base64 voice samples back to Blobs for runtime use
        const voiceSamples = await Promise.all(
          (data.voiceSamples || []).map(async (sample) => {
            try {
              const response = await fetch(sample.base64Data)
              const blob = await response.blob()
              return {
                id: sample.id,
                blob,
                duration: sample.duration,
                name: sample.name
              }
            } catch (error) {
              console.error('Error converting voice sample:', error)
              return null
            }
          })
        )

        // Filter out any failed conversions
        const validVoiceSamples = voiceSamples.filter((s): s is { id: string; blob: Blob; duration: number; name: string } => s !== null)

        setProfileData({
          textNotes: data.textNotes || [],
          voiceSamples: validVoiceSamples,
          photos: data.photos || [],
          videos: data.videos || []
        })

        console.log('Profile data loaded successfully:', {
          textNotes: data.textNotes?.length || 0,
          voiceSamples: validVoiceSamples.length,
          photos: data.photos?.length || 0,
          videos: data.videos?.length || 0
        })
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    }
  }

  const saveProfileData = async () => {
    if (!encryptionKey || !profileId) return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      // Convert Blobs to base64 for storage
      const voiceSamplesForStorage = await Promise.all(
        profileData.voiceSamples.map(async (sample) => {
          return new Promise<{ id: string; base64Data: string; duration: number; name: string; mimeType: string }>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              resolve({
                id: sample.id,
                base64Data: reader.result as string,
                duration: sample.duration,
                name: sample.name,
                mimeType: sample.blob.type
              })
            }
            reader.readAsDataURL(sample.blob)
          })
        })
      )

      const dataToStore: StoredProfileData = {
        textNotes: profileData.textNotes,
        voiceSamples: voiceSamplesForStorage,
        photos: profileData.photos,
        videos: profileData.videos
      }

      console.log('Saving profile data:', {
        textNotes: dataToStore.textNotes.length,
        voiceSamples: dataToStore.voiceSamples.length,
        photos: dataToStore.photos.length,
        videos: dataToStore.videos.length
      })

      await setSecure(
        `profile_data_${profileId}`,
        dataToStore,
        encryptionKey
      )

      console.log('Profile data saved successfully')

      setSaveSuccess(true)

      // Navigate back to dashboard after 1 second
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Error saving profile data:', error)
      alert('Failed to save changes. Please try again.')
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

  const parseChatFile = (text: string): string[] => {
    const messages: string[] = []

    // WhatsApp chat format patterns
    // Pattern 1: [DD/MM/YYYY, HH:MM:SS] Name: Message
    // Pattern 2: DD/MM/YYYY, HH:MM - Name: Message
    // Pattern 3: M/D/YY, H:MM AM/PM - Name: Message

    const lines = text.split('\n')
    let currentMessage = ''

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue

      // Check if line starts with a timestamp (various formats)
      const timestampPatterns = [
        /^\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?\]?\s*[-:]\s*/,
        /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?\s*[-:]\s*/
      ]

      const isNewMessage = timestampPatterns.some(pattern => pattern.test(line))

      if (isNewMessage) {
        // Save previous message if exists
        if (currentMessage.trim()) {
          messages.push(currentMessage.trim())
        }

        // Remove timestamp and start new message
        let messageContent = line
        for (const pattern of timestampPatterns) {
          messageContent = messageContent.replace(pattern, '')
        }

        currentMessage = messageContent
      } else {
        // Continuation of previous message
        currentMessage += '\n' + line
      }
    }

    // Add last message
    if (currentMessage.trim()) {
      messages.push(currentMessage.trim())
    }

    return messages
  }

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (file.name.endsWith('.txt')) {
        // Read text file
        const text = await file.text()
        const messages = parseChatFile(text)

        if (messages.length > 0) {
          setProfileData(prev => ({
            ...prev,
            textNotes: [...prev.textNotes, ...messages]
          }))
          alert(`Successfully imported ${messages.length} messages from chat export!`)
        } else {
          alert('No messages found in the file. Please check the file format.')
        }
      } else if (file.name.endsWith('.zip')) {
        // For ZIP files, we'll need to use a library like jszip
        alert('ZIP file support coming soon! For now, please extract the ZIP file and upload the .txt file inside.')
      } else {
        alert('Please upload a .txt or .zip file')
      }
    } catch (error) {
      console.error('Error reading chat file:', error)
      alert('Failed to read chat file. Please try again.')
    }

    // Reset file input
    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = ''
    }
  }

  const startRecording = async () => {
    try {
      console.log('Starting recording...')

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.')
        return
      }

      console.log('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Microphone access granted')

      // Try different MIME types for better browser compatibility
      let mimeType = 'audio/webm'
      const supportedTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg'
      ]

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          console.log('Using MIME type:', mimeType)
          break
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      console.log('MediaRecorder created with type:', mimeType)

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes')
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, total chunks:', audioChunksRef.current.length)
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        console.log('Created blob:', audioBlob.size, 'bytes')

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

        console.log('Voice sample added to profile data')
        stream.getTracks().forEach(track => track.stop())
        setRecordingTime(0)
      }

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error)
        alert('Recording error: ' + event.error?.message || 'Unknown error')
      }

      mediaRecorder.start()
      setIsRecording(true)
      console.log('Recording started')

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error: any) {
      console.error('Error starting recording:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)

      let errorMessage = 'Could not access microphone.'

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access denied. Please:\n\n1. Click the lock/camera icon in your browser address bar\n2. Allow microphone access for this site\n3. Refresh the page (F5) and try again\n\nCurrent error: ' + error.message
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please check that:\n\n1. Your microphone is connected\n2. Your microphone is not being used by another application\n3. Your browser has permission to access the microphone\n\nCurrent error: ' + error.message
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Microphone is already in use. Please:\n\n1. Close other apps using your microphone (Zoom, Teams, etc.)\n2. Close other browser tabs that might be using the microphone\n3. Try again\n\nCurrent error: ' + error.message
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Your browser does not support audio recording. Please:\n\n1. Update your browser to the latest version\n2. Try using Chrome, Firefox, or Edge\n\nCurrent error: ' + error.message
      } else {
        errorMessage = 'Recording failed: ' + error.message + '\n\nPlease try:\n1. Refreshing the page\n2. Using a different browser\n3. Checking your microphone settings'
      }

      alert(errorMessage)
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

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Chat File Upload */}
              <div className="space-y-2">
                <input
                  ref={chatFileInputRef}
                  type="file"
                  accept=".txt,.zip"
                  onChange={handleChatFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => chatFileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 font-medium"
                >
                  <Upload className="w-5 h-5" />
                  Upload Chat Export (TXT or ZIP)
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Import WhatsApp, Telegram, or other chat exports to add conversation history
                </p>
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
        <div className="mt-8 sticky bottom-4 space-y-3">
          {saveSuccess && (
            <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">Changes saved successfully!</span>
            </div>
          )}
          <button
            onClick={saveProfileData}
            disabled={isSaving}
            className={`w-full px-6 py-4 rounded-xl font-semibold transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 ${
              saveSuccess
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
