/**
 * Simli Video Call Page
 *
 * Real-time video calls with photo-based avatars
 * Features:
 * - Single photo → talking avatar
 * - Real-time lip sync (<300ms latency)
 * - Voice cloning integration
 * - WebRTC streaming via Simli
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SimliClient } from 'simli-client'
import { logger } from '../utils/logger'
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  ArrowLeft,
  Loader
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import type { PersonalityProfile } from '../types'
import { createSimliSession, endSimliSession } from '../utils/simliAPI'
import { loadPersonalityProfiles, loadProfileData } from '../utils/profileStorage'
import Modal from '../components/Modal'
import { CREDIT_PRICING } from '../types/database'
import { useSimliConversation } from '../hooks/useSimliConversation'

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended' | 'error'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Storage interface for profile data
interface StoredProfileData {
  textNotes: string[]
  voiceSamples: { id: string; base64Data: string; duration: number; name: string; mimeType: string }[]
  photos: { id: string; url: string; name: string }[]
  videos: { id: string; url: string; name: string }[]
  voiceConfig?: {
    type: 'cloned' | 'standard'
    clonedVoiceId?: string
    clonedVoiceName?: string
    standardVoice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  }
}

export default function SimliVideoPage() {
  const navigate = useNavigate()
  const { user, profile: supabaseProfile, refreshCredits, isLoading: supabaseLoading } = useSupabaseAuth()
  const [searchParams] = useSearchParams()

  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [voiceId, setVoiceId] = useState<string | null>(null) // ElevenLabs voice ID
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationEnabled, setConversationEnabled] = useState(false)
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const callStartTimeRef = useRef<number | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const simliClientRef = useRef<any>(null) // SimliClient instance

  // Initialize conversation hook
  const conversation = useSimliConversation({
    personalityName: profile?.name || 'Assistant',
    personalityRelationship: profile?.relationship || 'friend',
    personalityDescription: profile?.systemPrompt || '',
    voiceId: voiceId || '',
    onTranscript: (message) => {
      setMessages(prev => [...prev, message])
      logger.log('New message:', message.role, message.content)
    },
    onError: (error) => {
      logger.error('Conversation error:', error)
      setError(error.message)
    }
  })

  useEffect(() => {
    if (supabaseLoading) return

    if (!user) {
      navigate('/email-auth')
      return
    }

    loadProfile()
  }, [user, supabaseLoading, searchParams, navigate])

  // Track call duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (callStatus === 'connected' && callStartTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current!) / 1000)
        setDuration(elapsed)
      }, 1000)
    } else if (callStatus === 'ended') {
      setDuration(0)
      callStartTimeRef.current = null
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callStatus])

  // Credit deduction every minute
  useEffect(() => {
    if (!user || !supabaseProfile || callStatus !== 'connected') return

    const currentMinute = Math.floor(duration / 60)

    // Deduct 0.2 credits per minute after first 5 minutes
    if (currentMinute >= 5 && duration > 0 && duration % 60 === 0) {
      const creditsToDeduct = CREDIT_PRICING.VIDEO_COST_PER_MINUTE

      fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: creditsToDeduct,
          usageType: 'video',
          description: `Simli video call with ${profile?.name} (minute ${currentMinute})`
        })
      })
        .then(async (response) => {
          if (response.ok) {
            await refreshCredits()
          } else if (response.status === 402) {
            showModal(
              'Credits Exhausted',
              'Your video credits have been exhausted. The call will now end.',
              'info'
            )
            setTimeout(() => {
              endCall()
            }, 3000)
          }
        })
        .catch((error) => {
          logger.error('Error deducting video credits:', error)
        })
    }
  }, [duration, callStatus, user, supabaseProfile]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount - stop camera/microphone and close Simli connection
  useEffect(() => {
    return () => {
      console.log('🧹 Cleanup: Component unmounting, stopping all streams...')

      // Close Simli client connection
      if (simliClientRef.current) {
        try {
          simliClientRef.current.close()
          console.log('✅ Simli client closed')
        } catch (error) {
          console.error('Error closing Simli client:', error)
        }
        simliClientRef.current = null
      }

      // Stop local camera/microphone
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log(`✅ Stopped ${track.kind} track`)
        })
        localStreamRef.current = null
      }

      // Clear video elements
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }

      console.log('✅ Cleanup complete')
    }
  }, []) // Empty deps = only run on unmount

  const loadProfile = async () => {
    const profileId = searchParams.get('profile')
    logger.log('Loading profile:', profileId)

    if (!profileId) {
      navigate('/dashboard')
      return
    }

    try {
      const profiles = await loadPersonalityProfiles(null)
      const foundProfile = profiles.find(p => p.id === profileId)

      if (!foundProfile) {
        navigate('/dashboard')
        return
      }

      setProfile(foundProfile)

      // Load profile data to get photo and voice config
      const profileData = await loadProfileData<StoredProfileData>(profileId, null)
      if (profileData?.photos && profileData.photos.length > 0) {
        setPhotoUrl(profileData.photos[0].url)
      }

      // Load voice configuration for conversation
      if (profileData?.voiceConfig?.clonedVoiceId) {
        setVoiceId(profileData.voiceConfig.clonedVoiceId)
        logger.log('Loaded cloned voice ID:', profileData.voiceConfig.clonedVoiceId)
      } else {
        logger.warn('No cloned voice configured, conversation will use default voice')
      }
    } catch (error) {
      logger.error('Error loading profile:', error)
      setError('Failed to load profile')
    }
  }

  const startCall = async () => {
    console.group('🎬 SIMLI VIDEO CALL START')
    console.log('📋 Profile:', profile)
    console.log('👤 User:', user)
    console.log('💰 Credits:', supabaseProfile?.credits)
    console.log('📸 Photo URL:', photoUrl)

    if (!profile || !user) {
      console.error('❌ Missing profile or user')
      console.groupEnd()
      return
    }

    logger.log('Starting Simli video call...')

    // Check credits
    const universalCredits = supabaseProfile?.credits || 0
    console.log('💳 Credits check:', { required: 1, available: universalCredits })

    if (universalCredits < 1) {
      console.error('❌ Insufficient credits')
      console.groupEnd()
      showModal(
        'Insufficient Credits',
        `You need at least 1 credit for a video call.\n\nYou have ${universalCredits} credits remaining.\n\nPlease purchase more credits to continue.`,
        'warning'
      )
      setTimeout(() => navigate('/pricing'), 2000)
      return
    }

    // Check if photo exists
    if (!photoUrl) {
      console.error('❌ No photo URL')
      console.groupEnd()
      showModal(
        'Photo Required',
        'Please upload a photo in the profile settings before starting a video call.',
        'warning'
      )
      return
    }

    setCallStatus('connecting')
    setError(null)

    try {
      // Start local camera
      console.log('📹 Step 1: Requesting local camera access...')
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      console.log('✅ Local camera access granted:', {
        videoTracks: localStream.getVideoTracks().length,
        audioTracks: localStream.getAudioTracks().length
      })

      localStreamRef.current = localStream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream
      }

      // Get voice configuration
      console.log('🎤 Step 2: Loading voice configuration...')
      const profileData = await loadProfileData<StoredProfileData>(profile.id, null)
      const voiceId = profileData?.voiceConfig?.clonedVoiceId
      console.log('✅ Voice config loaded:', {
        hasVoiceConfig: !!profileData?.voiceConfig,
        voiceId: voiceId || 'default',
        voiceType: profileData?.voiceConfig?.type
      })

      // Create Simli session
      console.log('🔄 Step 3: Creating Simli session...')
      console.log('📤 Request data:', {
        profileId: profile.id,
        userId: user.id,
        photoUrl: photoUrl?.substring(0, 50) + '...',
        voiceId: voiceId || 'default'
      })

      const session = await createSimliSession(
        profile.id,
        user.id,
        photoUrl,
        voiceId
      )

      console.log('✅ Simli session created:', {
        sessionId: session.sessionId,
        hasApiKey: !!session.apiKey,
        apiKeyLength: session.apiKey?.length,
        usingCustomFace: session.usingCustomFace,
        hasFaceId: !!session.faceId
      })

      setSessionId(session.sessionId)

      // Get faceID (always provided by backend - either custom or default preset)
      const faceId = session.faceId
      if (!faceId) {
        throw new Error('No faceID provided by session')
      }

      // Initialize Simli Client
      console.log('🔍 Step 4: Checking Simli SDK...')
      console.log('✅ SimliClient imported from npm package')

      console.log('🎬 Step 5: Initializing Simli Client...')
      console.log(`🎭 Face type: ${session.usingCustomFace ? 'CUSTOM uploaded face' : 'DEFAULT preset face'}`)

      // Ensure refs are available
      if (!videoRef.current || !audioRef.current) {
        throw new Error('Video or audio element not found')
      }

      const simliConfig = {
        apiKey: session.apiKey,
        faceID: faceId,
        handleSilence: false, // Disable to avoid audio artifacts with listenToMediastreamTrack
        videoRef: videoRef.current,
        audioRef: audioRef.current,
        enableConsoleLogs: true
      }

      console.log('📋 Client config:', {
        hasApiKey: !!simliConfig.apiKey,
        apiKeyLength: simliConfig.apiKey?.length,
        faceID: simliConfig.faceID?.substring(0, 36) + '...',
        faceIDType: session.usingCustomFace ? 'custom' : 'default',
        hasVideoRef: !!simliConfig.videoRef,
        hasAudioRef: !!simliConfig.audioRef
      })

      simliClientRef.current = new SimliClient()
      await simliClientRef.current.Initialize(simliConfig)
      console.log('✅ SimliClient initialized')

      // Provide simliClient to conversation hook
      conversation.setSimliClient(simliClientRef.current)

      // Set up event listeners
      console.log('📡 Step 6: Setting up event listeners...')
      simliClientRef.current.on('connected', () => {
        console.log('✅ Simli client connected')
        setCallStatus('connected')
        callStartTimeRef.current = Date.now()

        // Start conversation flow after Simli is connected
        if (localStreamRef.current && voiceId) {
          console.log('🗣️ Starting conversation flow...')
          conversation.setAudioStream(localStreamRef.current)
          conversation.startListening()
          setConversationEnabled(true)
          console.log('✅ Conversation flow started')
        } else {
          console.warn('⚠️ No voice ID configured, conversation disabled')
        }
      })

      simliClientRef.current.on('videoTrack', (track: MediaStreamTrack) => {
        console.log('📹 Received video track from Simli:', track)
        if (videoRef.current) {
          const stream = new MediaStream([track])
          videoRef.current.srcObject = stream
        }
      })

      simliClientRef.current.on('error', (err: Error) => {
        console.error('❌ Simli client error:', err)
        setError(err.message)
        setCallStatus('error')
      })
      console.log('✅ Event listeners set up')

      // Connect to Simli
      console.log('🔌 Step 7: Starting WebRTC connection...')
      await simliClientRef.current.start()
      console.log('✅ WebRTC connection started')

      // Start audio streaming
      console.log('🎤 Step 8: Starting audio streaming...')
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        await simliClientRef.current.listenToMediastreamTrack(audioTrack)
        console.log('✅ Audio streaming started via MediaStreamTrack')
      } else {
        console.warn('⚠️ No audio track available')
      }

      console.log('🎉 Video call setup complete!')
      console.groupEnd()

    } catch (error) {
      console.error('❌ ERROR in startCall:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      console.groupEnd()

      // Stop local camera on error
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
      }

      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setError(`Failed to start video call: ${errorMsg}`)
      setCallStatus('error')
    }
  }

  const endCall = async () => {
    logger.log('Ending call...')

    // Calculate duration
    const durationSeconds = callStartTimeRef.current
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : 0

    // End Simli session
    if (sessionId && user) {
      try {
        await endSimliSession(sessionId, durationSeconds, user.id)
        await refreshCredits()
      } catch (error) {
        logger.error('Error ending session:', error)
      }
    }

    // Stop conversation flow
    if (conversationEnabled) {
      conversation.stopListening()
      setConversationEnabled(false)
      logger.log('Conversation stopped')
    }

    // Close Simli client connection
    if (simliClientRef.current) {
      simliClientRef.current.close()
      simliClientRef.current = null
    }

    // Stop local camera
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    // Clear video elements
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    setCallStatus('ended')
    setSessionId(null)

    // Return to chat after a delay
    setTimeout(() => {
      navigate(`/chat?profile=${profile?.id}`)
    }, 2000)
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
      }
    }
  }

  const toggleSpeaker = () => setIsSpeakerOn(!isSpeakerOn)

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a1014]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a1014]">
      {/* Header */}
      <div className="bg-[#1f2c34] border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/chat?profile=${profile.id}`)}
              className="p-2 hover:bg-gray-700/50 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-100">{profile.name}</h2>
                <p className="text-xs text-gray-400">
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'connected' && 'Connected • Simli'}
                  {callStatus === 'ended' && 'Call ended'}
                  {callStatus === 'error' && 'Connection failed'}
                  {callStatus === 'idle' && 'Ready to call'}
                </p>
              </div>
            </div>
          </div>

          <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs font-semibold rounded">
            Simli
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black">
        {/* Simli Video Output - Always rendered (hidden when not connected) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!isSpeakerOn}
          className={`w-full h-full object-cover ${callStatus === 'connected' ? '' : 'hidden'}`}
        />

        {/* Main Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          {callStatus === 'idle' && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-5xl mx-auto mb-6 overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{profile.name}</h3>
              <p className="text-gray-400 mb-2">Simli Real-Time Avatar</p>
              <p className="text-sm text-blue-400 mb-8">Photo-based • Fast • Real-time</p>
              <button
                onClick={startCall}
                className="px-8 py-4 bg-[#00a884] hover:bg-[#00a884]/90 rounded-full text-white font-semibold flex items-center gap-3 mx-auto transition"
              >
                <Video className="w-5 h-5" />
                Start Call
              </button>
            </div>
          )}

          {callStatus === 'connecting' && (
            <>
              <div className="text-center">
                <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Connecting to {profile.name}...</p>
                <p className="text-sm text-gray-400 mt-2">Initializing Simli avatar...</p>
              </div>

              {/* Local video preview during connecting */}
              {localStreamRef.current && (
                <div className="absolute top-4 right-4 w-32 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                </div>
              )}
            </>
          )}

          {callStatus === 'connected' && (
            <>
              {/* Conversation Transcript */}
              {conversationEnabled && messages.length > 0 && (
                <div className="absolute bottom-24 left-4 max-w-md bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {messages.slice(-5).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`px-3 py-2 rounded-lg max-w-xs ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-100'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conversation Status Indicator */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    {conversation.status === 'listening' && (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Listening...</span>
                      </>
                    )}
                    {conversation.status === 'processing' && (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        <span>Processing...</span>
                      </>
                    )}
                    {conversation.status === 'speaking' && (
                      <>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span>Speaking...</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Local video preview */}
              <div className="absolute top-4 right-4 w-32 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              </div>
            </>
          )}

          {callStatus === 'ended' && (
            <div className="text-center">
              <PhoneOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white text-lg">Call ended</p>
              <p className="text-gray-400 text-sm">Returning to chat...</p>
            </div>
          )}

          {callStatus === 'error' && error && (
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneOff className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-400 text-lg mb-2">Connection Error</p>
              <p className="text-gray-400 text-sm mb-6">{error}</p>
              <button
                onClick={() => navigate(`/chat?profile=${profile.id}`)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
              >
                Return to Chat
              </button>
            </div>
          )}
        </div>

        {/* Floating Controls */}
        {callStatus === 'connected' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-full px-6 py-4 flex items-center gap-4">
              {/* Mute */}
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>

              {/* End Call */}
              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>

              {/* Video Toggle */}
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition ${
                  !isVideoOn
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isVideoOn ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <VideoOff className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Speaker */}
              <button
                onClick={toggleSpeaker}
                className={`p-4 rounded-full transition ${
                  !isSpeakerOn
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isSpeakerOn ? (
                  <Volume2 className="w-6 h-6 text-white" />
                ) : (
                  <VolumeX className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Call Duration Display */}
        {callStatus === 'connected' && (
          <div className="absolute top-4 left-4">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-sm font-mono">
                {Math.floor(duration / 60).toString().padStart(2, '0')}:
                {(duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element for Simli output */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        className="hidden"
      />

      {/* Modal */}
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
