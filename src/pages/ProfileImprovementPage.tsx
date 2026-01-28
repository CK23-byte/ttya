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
import { logger } from '../utils/logger'
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
  Save,
  Edit2,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import type { PersonalityProfile } from '../types'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { uploadFileToStorage, prepareAudioForVoiceCloning } from '../utils/supabaseStorage'
import { loadProfileData as loadProfileDataFromStorage, saveProfileData as saveProfileDataToStorage, loadPersonalityProfiles, savePersonalityProfiles } from '../utils/profileStorage'
import JSZip from 'jszip'

// Voice configuration
interface VoiceConfig {
  type: 'cloned' | 'standard' // cloned = voice cloning, standard = preset voice
  clonedVoiceId?: string // Cloned voice ID (if type is 'cloned')
  clonedVoiceName?: string // Cloned voice name
  standardVoice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' // Standard voice (if type is 'standard')
}

// Avatar configuration (custom avatars only - no presets)
interface AvatarConfig {
  type: 'custom'
  customAvatarId?: string
  customAvatarName?: string
  customAvatarThumbnail?: string
}

// Storage interface (what gets saved - with base64)
interface StoredProfileData {
  textNotes: string[]
  voiceSamples: { id: string; base64Data: string; duration: number; name: string; mimeType: string }[]
  photos: { id: string; url: string; name: string; storagePath?: string }[]
  videos: { id: string; url: string; name: string; storagePath?: string }[]
  voiceConfig?: VoiceConfig // Voice configuration for calls
  avatarConfig?: AvatarConfig // Avatar configuration for video calls
}

// Runtime interface (what we work with - with Blobs)
interface ProfileData {
  textNotes: string[]
  voiceSamples: { id: string; blob: Blob; duration: number; name: string }[]
  photos: { id: string; url: string; name: string; storagePath?: string }[]
  videos: { id: string; url: string; name: string; storagePath?: string }[]
  voiceConfig?: VoiceConfig // Voice configuration for calls
  avatarConfig?: AvatarConfig // Avatar configuration for video calls
}

export default function ProfileImprovementPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const profileId = searchParams.get('profileId')
  const { encryptionKey } = useAuth()
  const { user, isConfigured } = useSupabaseAuth()

  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    textNotes: [],
    voiceSamples: [],
    photos: [],
    videos: [],
    voiceConfig: {
      type: 'standard',
      standardVoice: 'alloy'
    },
    avatarConfig: {
      type: 'custom'
    }
  })

  const [newNote, setNewNote] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isCloningVoice, setIsCloningVoice] = useState(false)
  const [cloneError, setCloneError] = useState<string | null>(null)
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false)
  const [avatarCreationStatus, setAvatarCreationStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
  const [avatarCreationProgress, setAvatarCreationProgress] = useState(0)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showTextNotesHelp, setShowTextNotesHelp] = useState(false)
  const [isEditingProfileName, setIsEditingProfileName] = useState(false)
  const [tempProfileName, setTempProfileName] = useState('')
  const [isEditingRelationship, setIsEditingRelationship] = useState(false)
  const [tempRelationship, setTempRelationship] = useState('')

  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setModal({ isOpen: true, title, message, type })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const profilePhotoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const voiceSectionRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const focusParam = searchParams.get('focus')

  useEffect(() => {
    // Check auth: either encryptionKey (password auth) or Supabase user
    const isAuthenticated = encryptionKey || (isConfigured && user)

    if (!profileId || !isAuthenticated) {
      navigate('/dashboard')
      return
    }

    loadProfile()
    loadProfileData()
  }, [profileId, encryptionKey, user, isConfigured])

  // Scroll to focused section if focus parameter is provided
  useEffect(() => {
    if (focusParam === 'voice' && voiceSectionRef.current) {
      setTimeout(() => {
        voiceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 500)
    }
  }, [focusParam])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  const loadProfile = async () => {
    try {
      // Use centralized storage utility (handles both encrypted and Supabase database)
      const profiles = await loadPersonalityProfiles(encryptionKey)

      const foundProfile = profiles.find(p => p.id === profileId)
      if (foundProfile) {
        setProfile(foundProfile)
      } else {
        logger.warn('Profile not found:', profileId)
        navigate('/dashboard')
      }
    } catch (error) {
      logger.error('Error loading profile:', error)
      navigate('/dashboard')
    }
  }

  const loadProfileData = async () => {
    if (!profileId) return

    try {
      // Use centralized storage utility (handles both encrypted and Supabase)
      const data = await loadProfileDataFromStorage<StoredProfileData>(profileId, encryptionKey)

      logger.log('Loading profile data:', data)

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
              logger.error('Error converting voice sample:', error)
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
          videos: data.videos || [],
          voiceConfig: data.voiceConfig, // ✅ Load voice config
          avatarConfig: data.avatarConfig // ✅ Load avatar config
        })

        logger.log('Profile data loaded successfully:', {
          textNotes: data.textNotes?.length || 0,
          voiceSamples: validVoiceSamples.length,
          photos: data.photos?.length || 0,
          videos: data.videos?.length || 0,
          voiceConfig: data.voiceConfig ? `${data.voiceConfig.type}` : 'none'
        })
      }
    } catch (error) {
      logger.error('Error loading profile data:', error)
    }
  }

  const saveProfileData = async () => {
    if (!profileId) return

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
        videos: profileData.videos,
        voiceConfig: profileData.voiceConfig, // ✅ Save voice config
        avatarConfig: profileData.avatarConfig // ✅ Save avatar config
      }

      logger.log('Saving profile data:', {
        textNotes: dataToStore.textNotes.length,
        voiceSamples: dataToStore.voiceSamples.length,
        photos: dataToStore.photos.length,
        videos: dataToStore.videos.length,
        voiceConfig: dataToStore.voiceConfig ? `${dataToStore.voiceConfig.type}` : 'none'
      })

      // Use centralized storage utility (handles both encrypted and Supabase database)
      await saveProfileDataToStorage(profileId, dataToStore, encryptionKey)

      logger.log('Profile data saved successfully')

      setSaveSuccess(true)

      // Navigate back to dashboard after 1 second
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      logger.error('Error saving profile data:', error)
      showModal('Save Failed', 'Failed to save changes. Please try again.', 'error')
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
    if (!file || !profile) return

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
          showModal('Import Successful', `Successfully imported ${messages.length} messages from chat export!`, 'success')
        } else {
          showModal('No Messages Found', 'No messages found in the file. Please check the file format.', 'warning')
        }
      } else if (file.name.endsWith('.zip')) {
        // Handle ZIP files with text, photos, and videos
        const zip = new JSZip()
        const zipContents = await zip.loadAsync(file)

        let textMessages: string[] = []
        let photoCount = 0
        let videoCount = 0

        // Process all files in ZIP
        for (const [filename, zipEntry] of Object.entries(zipContents.files)) {
          if (zipEntry.dir) continue // Skip directories

          if (filename.endsWith('.txt')) {
            // Extract and parse text files
            const text = await zipEntry.async('text')
            const messages = parseChatFile(text)
            textMessages = [...textMessages, ...messages]
          } else if (filename.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
            // Extract and upload photos
            const blob = await zipEntry.async('blob')
            const photoFile = new File([blob], filename, { type: `image/${filename.split('.').pop()}` })

            try {
              const { publicUrl, path } = await uploadFileToStorage(
                photoFile,
                'user-uploads',
                `profiles/${profile.id}/photos`
              )

              const id = `photo_${Date.now()}_${Math.random()}`
              setProfileData(prev => ({
                ...prev,
                photos: [
                  ...prev.photos,
                  { id, url: publicUrl, name: filename, storagePath: path }
                ]
              }))
              photoCount++
            } catch (error) {
              logger.error('Error uploading photo from ZIP:', error)
            }
          } else if (filename.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
            // Extract and upload videos
            const blob = await zipEntry.async('blob')
            const videoFile = new File([blob], filename, { type: `video/${filename.split('.').pop()}` })

            try {
              const { publicUrl, path } = await uploadFileToStorage(
                videoFile,
                'user-uploads',
                `profiles/${profile.id}/videos`
              )

              const id = `video_${Date.now()}_${Math.random()}`
              setProfileData(prev => ({
                ...prev,
                videos: [
                  ...prev.videos,
                  { id, url: publicUrl, name: filename, storagePath: path }
                ]
              }))
              videoCount++
            } catch (error) {
              logger.error('Error uploading video from ZIP:', error)
            }
          }
        }

        // Update text notes
        if (textMessages.length > 0) {
          setProfileData(prev => ({
            ...prev,
            textNotes: [...prev.textNotes, ...textMessages]
          }))
        }

        // Show summary
        showModal(
          'ZIP Import Successful',
          `Successfully imported from ZIP:\n- ${textMessages.length} text messages\n- ${photoCount} photos\n- ${videoCount} videos`,
          'success'
        )
      } else {
        showModal('Invalid File Type', 'Please upload a .txt or .zip file', 'warning')
      }
    } catch (error) {
      logger.error('Error reading chat file:', error)
      showModal('File Read Error', 'Failed to read chat file. Please try again.', 'error')
    }

    // Reset file input
    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = ''
    }
  }

  const startRecording = async () => {
    logger.log('🎤 Starting recording...')

    try {
      // Simple audio request - no fancy options
      logger.log('🎤 Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      logger.log('✅ Microphone access granted!')

      streamRef.current = stream

      // Create recorder with simple webm format
      logger.log('🎤 Creating MediaRecorder...')

      // Choose audio format that voice AI service supports
      // voice AI service supports: MP3, WAV, FLAC, OGG, M4A (but NOT WEBM!)
      let mimeType = 'audio/webm' // fallback
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/mpeg')) {
        mimeType = 'audio/mpeg'
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg'
      }

      logger.log('🎵 Using audio format:', mimeType)
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        logger.log('📦 Data available:', e.data.size, 'bytes')
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        logger.log('⏹️ Recording stopped')
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        logger.log('✅ Created audio blob:', blob.size, 'bytes, type:', mimeType)

        // IMPORTANT: Capture recordingTime BEFORE resetting
        const capturedDuration = recordingTime

        const newSample = {
          id: `voice_${Date.now()}`,
          blob: blob,
          duration: capturedDuration, // ✅ Use captured value
          name: `Voice Sample ${profileData.voiceSamples.length + 1}`
        }

        logger.log('📝 Saving voice sample:', {
          id: newSample.id,
          blobSize: newSample.blob.size,
          duration: newSample.duration,
          name: newSample.name
        })

        setProfileData(prev => ({
          ...prev,
          voiceSamples: [...prev.voiceSamples, newSample]
        }))

        setRecordingTime(0)

        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            logger.log('🛑 Stopping track:', track.kind)
            track.stop()
          })
          streamRef.current = null
        }
      }

      // Start recording
      logger.log('▶️ Starting MediaRecorder...')
      recorder.start()
      setIsRecording(true)
      logger.log('✅ Recording started!')

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      recordingIntervalRef.current = interval

    } catch (err: any) {
      logger.error('❌ Microphone error:', err)
      logger.error('Error name:', err.name)
      logger.error('Error message:', err.message)

      let errorMsg = 'Could not access microphone.'

      if (err.name === 'NotAllowedError') {
        errorMsg = 'Microphone permission denied. Click the lock icon in your browser address bar and allow microphone access.'
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No microphone found. Please check that your microphone is connected.'
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Microphone is in use by another application. Please close other apps and try again.'
      } else {
        errorMsg = 'Microphone error: ' + err.message
      }

      showModal('Microphone Error', errorMsg, 'error')
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    logger.log('⏹️ Stop recording requested')

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      logger.log('⏹️ Stopping MediaRecorder...')
      mediaRecorderRef.current.stop()
    }

    setIsRecording(false)

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Read audio duration from file
        const audioDuration = await getAudioDuration(file)

        const id = `voice_${Date.now()}`
        setProfileData(prev => ({
          ...prev,
          voiceSamples: [
            ...prev.voiceSamples,
            {
              id,
              blob: file,
              duration: audioDuration, // ✅ Actual duration from file
              name: file.name
            }
          ]
        }))

        logger.log('✅ Voice file uploaded:', {
          name: file.name,
          size: file.size,
          type: file.type,
          duration: audioDuration
        })
      } catch (error) {
        logger.error('Error reading audio duration:', error)
        showModal('Audio File Error', 'Failed to read audio file. Please try again.', 'error')
      }
    }
  }

  // Helper function to get audio duration from file
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const objectUrl = URL.createObjectURL(file)

      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(objectUrl)
        const duration = Math.floor(audio.duration)
        resolve(duration)
      })

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load audio'))
      })

      audio.src = objectUrl
    })
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 Photo upload triggered')

    const files = Array.from(e.target.files || [])
    console.log('📸 Files selected:', files.length, files)

    if (!profile) {
      console.error('❌ No profile found, cannot upload photos')
      showModal('Upload Error', 'Profile not loaded. Please refresh the page and try again.', 'error')
      return
    }

    if (files.length === 0) {
      console.log('⚠️ No files selected')
      return
    }

    for (const file of files) {
      try {
        console.log('📤 Uploading photo:', file.name, file.type, file.size)
        logger.log('Uploading photo to Supabase Storage...', {
          name: file.name,
          size: file.size,
          type: file.type
        })

        // Upload to Supabase Storage
        const { publicUrl, path } = await uploadFileToStorage(
          file,
          'user-uploads',
          `profiles/${profile.id}/photos`
        )

        const id = `photo_${Date.now()}_${Math.random()}`

        console.log('✅ Photo uploaded, adding to state:', id, publicUrl)

        setProfileData(prev => ({
          ...prev,
          photos: [
            ...prev.photos,
            {
              id,
              url: publicUrl,
              name: file.name,
              storagePath: path // Store path for deletion
            }
          ]
        }))

        logger.log('Photo uploaded successfully:', publicUrl)
        showModal('Upload Success', `${file.name} uploaded successfully!`, 'success')
      } catch (error) {
        console.error('❌ Error uploading photo:', error)
        logger.error('Error uploading photo:', error)
        showModal('Upload Failed', `Failed to upload ${file.name}. Please try again.`, 'error')
      }
    }

    // Reset file input to allow re-uploading same file
    e.target.value = ''
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    try {
      logger.log('Uploading video to Supabase Storage...', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      // Upload to Supabase Storage
      const { publicUrl, path } = await uploadFileToStorage(
        file,
        'user-uploads',
        `profiles/${profile.id}/videos`
      )

      const id = `video_${Date.now()}`

      setProfileData(prev => ({
        ...prev,
        videos: [
          ...prev.videos,
          {
            id,
            url: publicUrl,
            name: file.name,
            storagePath: path // Store path for deletion
          }
        ]
      }))

      logger.log('Video uploaded successfully:', publicUrl)
    } catch (error) {
      logger.error('Error uploading video:', error)
      showModal('Upload Failed', 'Failed to upload video. Please try again.', 'error')
    }
  }

  const handleProfileNameSave = async () => {
    if (!tempProfileName.trim() || !profile) return

    try {
      // Load profiles from database/storage
      const profiles = await loadPersonalityProfiles(encryptionKey)

      // Update profile name
      const updatedProfiles = profiles.map(p =>
        p.id === profile.id ? { ...p, name: tempProfileName.trim() } : p
      )

      // Save profiles back to database/storage
      await savePersonalityProfiles(updatedProfiles, encryptionKey)

      // Update local state
      setProfile({ ...profile, name: tempProfileName.trim() })
      setIsEditingProfileName(false)

      showModal('Name Updated', 'The profile name has been successfully updated.', 'success')
    } catch (error) {
      logger.error('Error updating profile name:', error)
      showModal('Update Failed', 'Something went wrong while updating the name.', 'error')
    }
  }

  const handleRelationshipSave = async () => {
    if (!tempRelationship.trim() || !profile) return

    try {
      // Load profiles from database/storage
      const profiles = await loadPersonalityProfiles(encryptionKey)

      // Update relationship
      const updatedProfiles = profiles.map(p =>
        p.id === profile.id ? { ...p, relationship: tempRelationship.trim() } : p
      )

      // Save profiles back to database/storage
      await savePersonalityProfiles(updatedProfiles, encryptionKey)

      // Update local state
      setProfile({ ...profile, relationship: tempRelationship.trim() })
      setIsEditingRelationship(false)

      showModal('Relationship Updated', 'The relationship has been successfully updated.', 'success')
    } catch (error) {
      logger.error('Error updating relationship:', error)
      showModal('Update Failed', 'Something went wrong while updating the relationship.', 'error')
    }
  }

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    try {
      logger.log('Uploading profile photo...', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      // Upload to Supabase Storage
      const { publicUrl, path } = await uploadFileToStorage(
        file,
        'user-uploads',
        `profiles/${profile.id}/photos`
      )

      const id = `photo_${Date.now()}_profile`

      // Insert at the beginning (make it the profile photo)
      setProfileData(prev => ({
        ...prev,
        photos: [
          {
            id,
            url: publicUrl,
            name: 'Profile Photo',
            storagePath: path
          },
          ...prev.photos
        ]
      }))

      logger.log('Profile photo uploaded successfully:', publicUrl)
      showModal('Photo Uploaded', 'The profile photo has been successfully updated.', 'success')
    } catch (error) {
      logger.error('Error uploading profile photo:', error)
      showModal('Upload Failed', 'Something went wrong while uploading the photo.', 'error')
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

  // Rename functions
  const handleRenameVoice = (id: string, newName: string) => {
    setProfileData(prev => ({
      ...prev,
      voiceSamples: prev.voiceSamples.map(v =>
        v.id === id ? { ...v, name: newName } : v
      )
    }))
    setEditingItemId(null)
    setEditingName('')
  }

  const handleRenamePhoto = (id: string, newName: string) => {
    setProfileData(prev => ({
      ...prev,
      photos: prev.photos.map(p =>
        p.id === id ? { ...p, name: newName } : p
      )
    }))
    setEditingItemId(null)
    setEditingName('')
  }

  const handleRenameVideo = (id: string, newName: string) => {
    setProfileData(prev => ({
      ...prev,
      videos: prev.videos.map(v =>
        v.id === id ? { ...v, name: newName } : v
      )
    }))
    setEditingItemId(null)
    setEditingName('')
  }

  const handleCloneVoice = async () => {
    if (!profileData.voiceSamples || profileData.voiceSamples.length === 0) {
      showModal('No Voice Sample', 'Please record or upload a voice sample first!', 'warning')
      return
    }

    if (!profile) return

    setIsCloningVoice(true)
    setCloneError(null)

    try {
      // Use the first voice sample for cloning
      const sample = profileData.voiceSamples[0]

      logger.log('📋 Sample info:', {
        id: sample.id,
        blobSize: sample.blob.size,
        blobType: sample.blob.type,
        duration: sample.duration,
        name: sample.name
      })

      // Convert blob to File if needed
      const originalFile = sample.blob instanceof File
        ? sample.blob
        : new File([sample.blob], sample.name, { type: sample.blob.type })

      // Prepare audio for voice cloning (extract audio from video if needed)
      logger.log('Preparing audio for voice cloning...')
      const audioFile = await prepareAudioForVoiceCloning(originalFile)

      // Get MIME type from processed audio
      const mimeType = audioFile.type || 'audio/mp4'

      logger.log('Cloning voice to voice AI service...', {
        audioSize: audioFile.size,
        mimeType,
        duration: sample.duration,
        wasVideo: originalFile.type.startsWith('video/')
      })

      // Validate audio duration (voice AI service requires at least 30 seconds, recommends 1+ minute)
      if (!sample.duration || sample.duration < 30) {
        showModal(
          'Voice Sample Too Short',
          `Duration: ${sample.duration || 0} seconds.\n\nvoice AI service requires at least 30 seconds of audio. Please record a longer sample.`,
          'warning'
        )
        setIsCloningVoice(false)
        return
      }

      // Convert audio file to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string
          // Remove data:audio/xxx;base64, prefix
          const base64Data = base64.split(',')[1]
          resolve(base64Data)
        }
        reader.readAsDataURL(audioFile) // Use processed audioFile instead of sample.blob
      })

      const audioBase64 = await base64Promise

      // Call our API to clone the voice
      const response = await fetch('/api/voice/clone-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voiceName: `${profile.name} Voice`,
          voiceDescription: `Cloned voice for ${profile.name}`,
          audioBase64,
          mimeType, // ✅ Send MIME type to backend
          userId: '00000000-0000-0000-0000-000000000001',
          profileId: profile.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        logger.error('❌ voice AI service API Error:', {
          status: response.status,
          error: error.error,
          details: error.details,
          message: error.message,
          fullError: error
        })
        throw new Error(error.error || 'Failed to clone voice')
      }

      const data = await response.json()
      logger.log('Voice cloned successfully:', data)

      // Update voice config with cloned voice ID
      setProfileData(prev => ({
        ...prev,
        voiceConfig: {
          type: 'cloned',
          clonedVoiceId: data.voiceId,
          clonedVoiceName: data.voiceName
        }
      }))

      showModal(
        'Voice Cloned Successfully',
        `Your cloned voice "${data.voiceName}" is ready to use in voice calls!`,
        'success'
      )

    } catch (error) {
      logger.error('Voice cloning error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setCloneError(errorMsg)
      showModal('Voice Cloning Failed', errorMsg, 'error')
    } finally {
      setIsCloningVoice(false)
    }
  }

  const handleVoiceTypeChange = (type: 'cloned' | 'standard') => {
    setProfileData(prev => ({
      ...prev,
      voiceConfig: {
        ...prev.voiceConfig,
        type,
        ...(type === 'standard' && !prev.voiceConfig?.standardVoice ? { standardVoice: 'alloy' } : {})
      }
    }))
  }

  const handleStandardVoiceChange = (voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => {
    setProfileData(prev => ({
      ...prev,
      voiceConfig: {
        ...prev.voiceConfig,
        type: 'standard',
        standardVoice: voice
      }
    }))
  }

  // Avatar creation handler - uses Simli generateFaceID API
  const handleCreateAvatar = async () => {
    if (!profileData.photos || profileData.photos.length === 0) {
      showModal('No Photo', 'Please upload a photo first! Upload a clear, front-facing photo with good lighting and a neutral expression.', 'warning')
      return
    }

    setIsCreatingAvatar(true)
    setAvatarCreationStatus('uploading')
    setAvatarCreationProgress(10)

    try {
      const firstPhoto = profileData.photos[0]
      const faceName = `${profile?.name || 'Avatar'}_${Date.now()}`

      logger.log('Creating Simli face from photo:', {
        photoPath: firstPhoto.storagePath || 'unknown',
        photoUrl: firstPhoto.url,
        faceName
      })

      const photoUrl = firstPhoto.url
      setAvatarCreationProgress(30)

      logger.log('Sending photo to Simli generateFaceID:', photoUrl.substring(0, 100) + '...')

      setAvatarCreationProgress(50)
      const response = await fetch('/api/simli/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl, faceName })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error || 'Failed to create face')
      }

      const data = await response.json()
      logger.log('Simli face creation response:', data)

      setAvatarCreationProgress(100)
      setProfileData(prev => ({
        ...prev,
        avatarConfig: {
          type: 'custom',
          customAvatarId: data.faceId,
          customAvatarName: data.faceName || faceName,
          customAvatarThumbnail: firstPhoto.url
        }
      }))

      setAvatarCreationStatus('completed')
      showModal(
        'Avatar Created Successfully',
        `Your custom avatar "${data.faceName || faceName}" is ready for video calls!`,
        'success'
      )

    } catch (error) {
      logger.error('Avatar creation error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setAvatarCreationStatus('error')
      setAvatarCreationProgress(0)
      showModal('Avatar Creation Failed', errorMsg, 'error')
    } finally {
      setIsCreatingAvatar(false)
    }
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
            {/* Profile Photo with Edit Button */}
            <div className="relative group">
              {profileData.photos.length > 0 ? (
                <img
                  src={profileData.photos[0].url}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-semibold text-2xl shadow-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => profilePhotoInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-blue-600"
                title="Change profile photo"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Profile Name with Edit */}
            <div className="flex-1">
              {isEditingProfileName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={tempProfileName}
                    onChange={(e) => setTempProfileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleProfileNameSave()
                      if (e.key === 'Escape') {
                        setIsEditingProfileName(false)
                        setTempProfileName('')
                      }
                    }}
                    className="flex-1 text-3xl font-bold text-gray-900 px-3 py-1 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleProfileNameSave}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    title="Save"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfileName(false)
                      setTempProfileName('')
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1 group/name">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <button
                    onClick={() => {
                      setIsEditingProfileName(true)
                      setTempProfileName(profile.name)
                    }}
                    className="p-1 text-gray-400 opacity-0 group-hover/name:opacity-100 hover:text-blue-500 transition"
                    title="Edit name"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              )}
              {isEditingRelationship ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempRelationship}
                    onChange={(e) => setTempRelationship(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRelationshipSave()
                      if (e.key === 'Escape') {
                        setIsEditingRelationship(false)
                        setTempRelationship('')
                      }
                    }}
                    className="flex-1 px-3 py-1 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    placeholder="e.g., mother, friend, grandmother"
                    autoFocus
                  />
                  <button
                    onClick={handleRelationshipSave}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingRelationship(false)
                      setTempRelationship('')
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/relationship">
                  <p className="text-gray-600 capitalize">{profile.relationship}</p>
                  <button
                    onClick={() => {
                      setIsEditingRelationship(true)
                      setTempRelationship(profile.relationship)
                    }}
                    className="p-1 text-gray-400 opacity-0 group-hover/relationship:opacity-100 hover:text-blue-500 transition"
                    title="Edit relationship"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
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
              <h2 className="flex-1 text-xl font-bold text-gray-900">Text Notes & Memories</h2>
              <div className="relative">
                <button
                  onClick={() => setShowTextNotesHelp(!showTextNotesHelp)}
                  className="p-1 text-gray-400 hover:text-orange-500 transition"
                  title="How to import chat history"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                {showTextNotesHelp && (
                  <div className="absolute right-0 top-8 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10">
                    <h3 className="font-bold text-gray-900 mb-2">Import Chat History</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>WhatsApp:</strong></p>
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Open chat → Menu (⋮) → More → Export chat</li>
                        <li>Choose "Without Media" or "Include Media"</li>
                        <li>Save the .zip or .txt file</li>
                        <li>Upload here using "Upload Chat File"</li>
                      </ol>

                      <p className="mt-3"><strong>iMessage:</strong></p>
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Use apps like "iMazing" or "Decipher TextMessage"</li>
                        <li>Export as TXT or PDF</li>
                        <li>Save and upload here</li>
                      </ol>

                      <p className="mt-3"><strong>Telegram:</strong></p>
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Settings → Advanced → Export chat history</li>
                        <li>Choose format (HTML or JSON)</li>
                        <li>Upload the exported file</li>
                      </ol>

                      <p className="mt-3 text-xs text-gray-500">
                        💡 ZIP files can contain text, photos, and videos - all will be imported automatically!
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTextNotesHelp(false)}
                      className="mt-3 w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
                    >
                      Got it!
                    </button>
                  </div>
                )}
              </div>
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
              <span className="text-sm text-gray-500">(Required for voice cloning)</span>
            </div>

            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> If the microphone doesn't work, click the <strong>lock icon</strong> in your browser address bar and ensure microphone access is allowed. Then refresh the page.
                </p>
              </div>

              {/* Recording Controls */}
              <div className="flex gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isRecording && recordingTime === 0}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Record Voice'}
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition border border-blue-200 flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload File
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
                        {editingItemId === sample.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameVoice(sample.id, editingName)
                              if (e.key === 'Escape') {
                                setEditingItemId(null)
                                setEditingName('')
                              }
                            }}
                            onBlur={() => {
                              if (editingName.trim()) handleRenameVoice(sample.id, editingName)
                              else {
                                setEditingItemId(null)
                                setEditingName('')
                              }
                            }}
                            className="w-full px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                          />
                        ) : (
                          <p className="font-medium text-gray-700">{sample.name}</p>
                        )}
                        {sample.duration > 0 && (
                          <p className="text-sm text-gray-500">{formatTime(sample.duration)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingItemId(sample.id)
                          setEditingName(sample.name)
                        }}
                        className="text-gray-500 hover:text-green-600 transition"
                        title="Rename"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVoice(sample.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Configuration */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Mic className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900">Voice Configuration</h2>
              <span className="text-sm text-gray-500">(For voice calls)</span>
            </div>

            <div className="space-y-4">
              {/* Voice Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Voice Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleVoiceTypeChange('cloned')}
                    className={`p-4 rounded-lg border-2 transition ${
                      profileData.voiceConfig?.type === 'cloned'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">🎭 Cloned Voice</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Clone the voice for a more personalized experience
                      </p>
                      {profileData.voiceConfig?.type === 'cloned' && profileData.voiceConfig.clonedVoiceName && (
                        <p className="text-xs text-purple-600 mt-2 font-medium">
                          ✓ {profileData.voiceConfig.clonedVoiceName}
                        </p>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleVoiceTypeChange('standard')}
                    className={`p-4 rounded-lg border-2 transition ${
                      profileData.voiceConfig?.type === 'standard'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">🔊 Standard Voice</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Use preset AI voices
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Cloned Voice Section */}
              {profileData.voiceConfig?.type === 'cloned' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  {!profileData.voiceConfig.clonedVoiceId ? (
                    <>
                      <p className="text-sm text-purple-800">
                        <strong>Voice Cloning:</strong> Upload your voice sample to create a cloned voice. This requires at least 1 voice sample.
                      </p>
                      <button
                        onClick={handleCloneVoice}
                        disabled={isCloningVoice || profileData.voiceSamples.length === 0}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                          isCloningVoice || profileData.voiceSamples.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                      >
                        {isCloningVoice ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Cloning Voice...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Clone Voice
                          </>
                        )}
                      </button>
                      {profileData.voiceSamples.length === 0 && (
                        <p className="text-xs text-purple-600">
                          ⚠️ Please record or upload a voice sample first
                        </p>
                      )}
                      {cloneError && (
                        <p className="text-xs text-red-600">
                          ❌ Error: {cloneError}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-purple-900">
                          Voice Cloned Successfully!
                        </p>
                        <p className="text-sm text-purple-700">
                          Using: {profileData.voiceConfig.clonedVoiceName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Voice Selection */}
              {profileData.voiceConfig?.type === 'standard' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select AI Voice
                  </label>
                  <select
                    value={profileData.voiceConfig.standardVoice || 'alloy'}
                    onChange={(e) => handleStandardVoiceChange(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="alloy">Alloy (Neutral, Balanced)</option>
                    <option value="echo">Echo (Male, Warm)</option>
                    <option value="fable">Fable (British Accent)</option>
                    <option value="onyx">Onyx (Deep Male)</option>
                    <option value="nova">Nova (Female, Energetic)</option>
                    <option value="shimmer">Shimmer (Soft Female)</option>
                  </select>
                  <p className="text-xs text-blue-700">
                    💡 These are preset AI voices. No voice cloning required.
                  </p>
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
                  {profileData.photos.map((photo) => {
                    console.log('🖼️ Rendering photo:', photo.url)
                    return (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('❌ Failed to load photo:', photo.url)
                          e.currentTarget.style.border = '2px solid red'
                        }}
                        onLoad={() => {
                          console.log('✅ Photo loaded successfully:', photo.url)
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                        {editingItemId === photo.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenamePhoto(photo.id, editingName)
                              if (e.key === 'Escape') {
                                setEditingItemId(null)
                                setEditingName('')
                              }
                            }}
                            onBlur={() => {
                              if (editingName.trim()) handleRenamePhoto(photo.id, editingName)
                              else {
                                setEditingItemId(null)
                                setEditingName('')
                              }
                            }}
                            className="w-full px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                          />
                        ) : (
                          <p className="text-xs text-white truncate">{photo.name}</p>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditingItemId(photo.id)
                            setEditingName(photo.name)
                          }}
                          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    )
                  })}
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
                      <div className="flex-1">
                        {editingItemId === video.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameVideo(video.id, editingName)
                              if (e.key === 'Escape') {
                                setEditingItemId(null)
                                setEditingName('')
                              }
                            }}
                            onBlur={() => {
                              if (editingName.trim()) handleRenameVideo(video.id, editingName)
                              else {
                                setEditingItemId(null)
                                setEditingName('')
                              }
                            }}
                            className="w-full px-2 py-1 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                          />
                        ) : (
                          <p className="font-medium text-gray-700">{video.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingItemId(video.id)
                          setEditingName(video.name)
                        }}
                        className="text-gray-500 hover:text-purple-600 transition"
                        title="Rename"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Avatar Configuration */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <VideoIcon className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-bold text-gray-900">Avatar Configuration</h2>
              <span className="text-sm text-gray-500">(For video calls)</span>
            </div>

            <div className="space-y-4">
              {/* Custom Avatar Section */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-3">
                {!profileData.avatarConfig?.customAvatarId ? (
                  <>
                    <p className="text-sm text-pink-800">
                      <strong>Create Your Avatar:</strong> Upload a clear photo showing a frontal view of the face with good lighting. This will be used to create a personalized talking AI avatar for video calls. JPG/JPEG format recommended.
                    </p>

                    {/* Avatar Preview */}
                    {profileData.photos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-pink-900">Preview (using first photo):</p>
                        <div className="relative rounded-lg overflow-hidden bg-gray-100 max-w-xs mx-auto">
                          <img
                            src={profileData.photos[0].url}
                            alt="Avatar preview"
                            className="w-full object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Avatar Creation Button with Progress */}
                    <div className="space-y-2">
                      <button
                        onClick={handleCreateAvatar}
                        disabled={isCreatingAvatar || profileData.photos.length === 0}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                          isCreatingAvatar || profileData.photos.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-pink-500 text-white hover:bg-pink-600'
                        }`}
                      >
                        {!isCreatingAvatar && (
                          <>
                            <Upload className="w-5 h-5" />
                            Create Avatar from Photo
                          </>
                        )}
                        {isCreatingAvatar && avatarCreationStatus === 'uploading' && (
                          <>
                            <span className="animate-spin">⏳</span>
                            Preparing video... {Math.round(avatarCreationProgress)}%
                          </>
                        )}
                        {isCreatingAvatar && avatarCreationStatus === 'processing' && (
                          <>
                            <span className="animate-pulse">🎬</span>
                            Processing avatar... {Math.round(avatarCreationProgress)}%
                          </>
                        )}
                      </button>

                      {/* Progress Bar */}
                      {isCreatingAvatar && (
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 ease-out"
                              style={{ width: `${avatarCreationProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-center text-pink-700">
                            {avatarCreationStatus === 'uploading' && 'Uploading and preparing video...'}
                            {avatarCreationStatus === 'processing' && 'AI is processing your avatar (this may take 2-5 minutes)'}
                          </p>
                        </div>
                      )}
                    </div>

                    {profileData.photos.length === 0 && (
                      <p className="text-xs text-pink-700 text-center">
                        Upload a photo in the Photos section above to create your avatar.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-pink-900">
                          Avatar Created Successfully!
                        </p>
                        <p className="text-sm text-pink-700">
                          Using: {profileData.avatarConfig.customAvatarName}
                        </p>
                      </div>
                    </div>

                    {/* Avatar Thumbnail Preview */}
                    {profileData.avatarConfig.customAvatarThumbnail && (
                      <div className="rounded-lg overflow-hidden max-w-xs mx-auto">
                        <img
                          src={profileData.avatarConfig.customAvatarThumbnail}
                          alt="Avatar Preview"
                          className="w-full"
                        />
                      </div>
                    )}

                    <p className="text-xs text-pink-700 text-center">
                      Your avatar is ready for video calls!
                    </p>
                  </div>
                )}
              </div>
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

      {/* Custom Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}
