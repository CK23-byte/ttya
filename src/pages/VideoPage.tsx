/**
 * Video Call Page - WhatsApp Style Video Call
 *
 * Features:
 * - AI-powered interactive video avatars
 * - WhatsApp-style video call interface
 * - Real-time conversation with avatars
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { logger } from '../utils/logger'
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageCircle,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Loader
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { getSecure } from '../utils/secureStorage'
import { PersonalityProfile } from '../types'
import { SimliClient } from 'simli-client'
import { startSimliSession } from '../utils/simliAPI'
import { loadProfileData as loadProfileDataFromStorage } from '../utils/profileStorage'
import Modal from '../components/Modal'
import { CREDIT_PRICING } from '../types/database'

const PROFILES_STORAGE_KEY = 'personality_profiles'

// Avatar configuration interface
interface AvatarConfig {
  type: 'custom'
  customAvatarId?: string
  customAvatarName?: string
  customAvatarThumbnail?: string
}

// Profile data interface (what's stored for each profile)
interface ProfileData {
  avatarConfig?: AvatarConfig
}

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended' | 'error'

export default function VideoPage() {
  const navigate = useNavigate()
  const { isAuthenticated, encryptionKey } = useAuth()
  const { user, profile: supabaseProfile, refreshCredits, isLoading: supabaseLoading, isConfigured } = useSupabaseAuth()
  const [searchParams] = useSearchParams()

  // Check auth: Support both old password-based and new Supabase email auth
  const isUserAuthenticated = isAuthenticated || (isConfigured && user !== null)

  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [_sessionId, setSessionId] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
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
  const simliClientRef = useRef<SimliClient | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const lastCreditDeductionRef = useRef<number>(0)
  const hasShownLowCreditWarningRef = useRef<boolean>(false)
  const callStartTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Wait for Supabase auth to finish loading
    if (isConfigured && supabaseLoading) {
      return
    }

    // Redirect to login if not authenticated
    if (!isUserAuthenticated) {
      navigate('/email-auth')
      return
    }

    loadProfile()
  }, [isUserAuthenticated, supabaseLoading, encryptionKey, searchParams, navigate, isConfigured])

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

  // Track call duration and deduct credits
  useEffect(() => {
    if (!user || !supabaseProfile || callStatus !== 'connected') {
      return
    }

    // Deduct credits every minute
    const currentMinute = Math.floor(duration / 60)

    // If we've entered a new minute, deduct credits
    if (currentMinute > lastCreditDeductionRef.current && duration > 0) {
      lastCreditDeductionRef.current = currentMinute

      const creditsToDeduct = CREDIT_PRICING.VIDEO_COST_PER_MINUTE

      // Deduct credits
      fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: creditsToDeduct,
          creditType: 'video',
          description: `Video call with ${profile?.name} (minute ${currentMinute})`
        })
      })
        .then(async (response) => {
          if (response.ok) {
            await refreshCredits()

            // Check remaining credits
            const updatedProfile = await fetch(`/api/credits/check?userId=${user.id}`).then(r => r.json())
            const remainingCredits = updatedProfile.video_credits || 0
            const remainingMinutes = Math.floor(remainingCredits / CREDIT_PRICING.VIDEO_COST_PER_MINUTE)

            // Show warning if low on credits (less than 1 minute left)
            if (remainingMinutes < 1 && !hasShownLowCreditWarningRef.current) {
              hasShownLowCreditWarningRef.current = true
              showModal(
                'Low Video Credits',
                `You have less than 1 minute of video call time remaining. Your call will end when you run out of credits.`,
                'warning'
              )
            }

            // End call if out of credits
            if (remainingCredits < CREDIT_PRICING.VIDEO_COST_PER_MINUTE) {
              showModal(
                'Credits Exhausted',
                'Your video credits have been exhausted. The call will now end.',
                'info'
              )
              setTimeout(() => {
                endCall()
              }, 3000)
            }
          } else if (response.status === 402) {
            // Insufficient credits
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

  const loadProfile = async () => {
    const profileId = searchParams.get('profile')
    if (!profileId) {
      navigate('/dashboard')
      return
    }

    try {
      let profiles: PersonalityProfile[] = []

      if (encryptionKey) {
        // Old password-based auth: use encrypted storage
        profiles = await getSecure<PersonalityProfile[]>(
          PROFILES_STORAGE_KEY,
          encryptionKey
        ) || []
      } else {
        // Supabase users: use plain localStorage
        const stored = localStorage.getItem(PROFILES_STORAGE_KEY)
        profiles = stored ? JSON.parse(stored) : []
      }

      const foundProfile = profiles.find(p => p.id === profileId)
      if (!foundProfile) {
        navigate('/dashboard')
        return
      }

      setProfile(foundProfile)

      // Load profile data (contains avatarConfig)
      const data = await loadProfileDataFromStorage<ProfileData>(profileId, encryptionKey)
      setProfileData(data)
    } catch (error) {
      logger.error('Error loading profile:', error)
      setError('Failed to load profile')
    }
  }

  const startCall = async () => {
    if (!profile) return

    // Check if user has Supabase account and credits
    if (!user || !supabaseProfile) {
      showModal(
        'Account Required',
        'Please sign in with email to use video call features and track your credits.',
        'warning'
      )
      return
    }

    // Check if user has enough video credits for at least 12 seconds (1 credit minimum)
    const videoCredits = supabaseProfile.video_credits || 0
    const minRequiredCredits = 1 // Minimum 1 credit (12 seconds)

    if (videoCredits < minRequiredCredits) {
      showModal(
        'Insufficient Video Credits',
        `You need at least ${minRequiredCredits} video credit${minRequiredCredits > 1 ? 's' : ''} for a video call.\n\nYou have ${videoCredits} video credit${videoCredits !== 1 ? 's' : ''} remaining.\n\nPlease purchase more credits to continue.`,
        'warning'
      )
      setTimeout(() => navigate('/pricing'), 2000)
      return
    }

    // Check if custom avatar is configured
    const customAvatarId = profileData?.avatarConfig?.customAvatarId
    if (!customAvatarId) {
      showModal(
        'Avatar Required',
        'Please create a custom avatar for this profile first. Go to Profile Settings and upload a photo to create your personalized avatar.',
        'warning'
      )
      return
    }

    setCallStatus('connecting')
    setError(null)

    try {
      const faceId = customAvatarId
      logger.log('Creating Simli video streaming session with face:', faceId)

      // Initialize SimliClient
      const simliClient = new SimliClient()
      simliClientRef.current = simliClient

      // Get session token from our backend (keeps API key server-side)
      const sessionData = await startSimliSession(faceId)
      setSessionId(sessionData.sessionToken || 'simli-session')

      logger.log('Simli session started:', sessionData)

      // Initialize SimliClient with config
      // Note: SimliClient handles WebRTC internally
      simliClient.Initialize({
        apiKey: '', // API key is handled server-side via session token
        faceId: faceId,
        handleSilence: true,
        videoRef: videoRef.current,
        audioRef: audioRef.current,
        maxSessionLength: 3600,
        maxIdleTime: 300
      } as any)

      await simliClient.start()

      logger.log('Simli video session established successfully')

      callStartTimeRef.current = Date.now()
      setCallStatus('connected')
    } catch (error) {
      logger.error('Error starting call:', error)
      setError('Failed to start video call. Please try again later.')
      setCallStatus('error')
    }
  }

  /**
   * Send audio data to Simli for lip-sync video generation.
   * Audio must be PCM16 format, 16kHz, mono.
   * Called from the TTS pipeline when ElevenLabs returns audio.
   */
  const sendAudioToSimli = (audioData: Uint8Array) => {
    if (simliClientRef.current) {
      simliClientRef.current.sendAudioData(audioData)
    }
  }

  // Expose sendAudioToSimli for use by voice pipeline
  // This can be called when TTS audio (PCM16 16kHz) is received from ElevenLabs
  useEffect(() => {
    if (callStatus === 'connected') {
      // Store on window for cross-component access (voice pipeline)
      (window as any).__simliSendAudio = sendAudioToSimli
    }
    return () => {
      delete (window as any).__simliSendAudio
    }
  }, [callStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const endCall = async () => {
    // Close Simli client
    if (simliClientRef.current) {
      try {
        simliClientRef.current.close()
      } catch (error) {
        logger.error('Error closing Simli session:', error)
      }
      simliClientRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCallStatus('ended')
    setSessionId(null)

    // Return to chat after a delay
    setTimeout(() => {
      navigate(`/chat?profile=${profile?.id}`)
    }, 2000)
  }

  const toggleMute = () => setIsMuted(!isMuted)
  const toggleVideo = () => setIsVideoOn(!isVideoOn)
  const toggleSpeaker = () => setIsSpeakerOn(!isSpeakerOn)
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a1014]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen bg-[#0a1014] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                {(profile.photoUrls && profile.photoUrls.length > 0) || profile.photoUrl ? (
                  <img
                    src={profile.photoUrls?.[0] || profile.photoUrl}
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
                  {callStatus === 'connected' && 'Connected'}
                  {callStatus === 'ended' && 'Call ended'}
                  {callStatus === 'error' && 'Connection failed'}
                  {callStatus === 'idle' && 'Ready to call'}
                </p>
              </div>
            </div>
          </div>

          <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs font-semibold rounded" title="Build: 2025-12-18 10:57 UTC">
            v2.11.0
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black">
        {/* Main Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          {callStatus === 'idle' && (
            <div className="text-center">
              {profileData?.avatarConfig?.customAvatarThumbnail ? (
                <img
                  src={profileData.avatarConfig.customAvatarThumbnail}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-purple-500/50"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-5xl mx-auto mb-6">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{profile.name}</h3>

              {profileData?.avatarConfig?.customAvatarId ? (
                <>
                  <p className="text-gray-400 mb-8">Start a video call</p>
                  <button
                    onClick={startCall}
                    className="px-8 py-4 bg-[#00a884] hover:bg-[#00a884]/90 rounded-full text-white font-semibold flex items-center gap-3 mx-auto transition"
                  >
                    <Video className="w-5 h-5" />
                    Start Call
                  </button>
                </>
              ) : (
                <>
                  <p className="text-yellow-400 mb-4">Custom avatar required for video calls</p>
                  <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
                    Upload a photo and create a custom avatar in Profile Settings to enable video calls with {profile.name}.
                  </p>
                  <button
                    onClick={() => navigate(`/profile-improvement?profileId=${profile.id}`)}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-semibold flex items-center gap-3 mx-auto transition"
                  >
                    <Video className="w-5 h-5" />
                    Create Avatar
                  </button>
                </>
              )}
            </div>
          )}

          {callStatus === 'connecting' && (
            <div className="text-center">
              <Loader className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Connecting to {profile.name}...</p>
            </div>
          )}

          {callStatus === 'connected' && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
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

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              >
                {isFullscreen ? (
                  <Minimize className="w-6 h-6 text-white" />
                ) : (
                  <Maximize className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Chat */}
              <button
                onClick={() => navigate(`/chat?profile=${profile.id}`)}
                className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}


        {/* Call Duration Display */}
        {callStatus === 'connected' && (
          <div className="absolute top-4 right-4">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-sm font-mono">
                {Math.floor(duration / 60).toString().padStart(2, '0')}:
                {(duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Credit Warning Modal */}
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
