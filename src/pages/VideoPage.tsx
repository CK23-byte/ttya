/**
 * Video Call Page - WhatsApp Style Video Call
 *
 * Features:
 * - D-ID powered video avatars
 * - WhatsApp-style video call interface
 * - Real-time conversation with avatars
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { getSecure } from '../utils/secureStorage'
import { PersonalityProfile } from '../types'
import { createDIDStreamingSession, closeDIDStreamSession } from '../utils/didAPI'

const PROFILES_STORAGE_KEY = 'personality_profiles'

type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended' | 'error'

export default function VideoPage() {
  const navigate = useNavigate()
  const { isAuthenticated, encryptionKey } = useAuth()
  const [searchParams] = useSearchParams()

  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    loadProfile()
  }, [isAuthenticated, encryptionKey, searchParams])

  const loadProfile = async () => {
    if (!encryptionKey) return

    const profileId = searchParams.get('profile')
    if (!profileId) {
      navigate('/dashboard')
      return
    }

    try {
      const profiles = await getSecure<PersonalityProfile[]>(
        PROFILES_STORAGE_KEY,
        encryptionKey
      ) || []

      const foundProfile = profiles.find(p => p.id === profileId)
      if (!foundProfile) {
        navigate('/dashboard')
        return
      }

      setProfile(foundProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    }
  }

  const startCall = async () => {
    if (!profile) return

    setCallStatus('connecting')
    setError(null)

    try {
      // For now, use a default avatar image or profile photo
      const avatarUrl = profile.photoUrl || 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg'

      // Create D-ID streaming session
      const session = await createDIDStreamingSession(avatarUrl)
      setSessionId(session.session_id)

      // Set up WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })

      peerConnectionRef.current = pc

      // Handle incoming video stream
      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0]
        }
      }

      // Set remote description (offer from D-ID)
      await pc.setRemoteDescription(session.offer)

      // Create answer
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      // TODO: Send answer back to D-ID via stream-message endpoint
      // This will be completed when D-ID integration is fully set up

      setCallStatus('connected')
    } catch (error) {
      console.error('Error starting call:', error)
      setError('Failed to start video call. Please check your D-ID API configuration.')
      setCallStatus('error')
    }
  }

  const endCall = async () => {
    if (sessionId) {
      try {
        await closeDIDStreamSession(sessionId)
      } catch (error) {
        console.error('Error closing session:', error)
      }
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
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
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

          <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs font-semibold rounded">
            v2.1.0
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black">
        {/* Main Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          {callStatus === 'idle' && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-5xl mx-auto mb-6">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{profile.name}</h3>
              <p className="text-gray-400 mb-8">Start a video call</p>
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
            <div className="text-center">
              <Loader className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Connecting to {profile.name}...</p>
            </div>
          )}

          {callStatus === 'connected' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
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

        {/* D-ID Setup Notice */}
        {callStatus === 'idle' && (
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-blue-900/50 backdrop-blur-sm border border-blue-700 rounded-lg p-4 max-w-md">
              <p className="text-sm text-blue-200">
                <strong>Note:</strong> Video calls require D-ID API configuration.
                Add your D-ID API key in environment variables as <code className="bg-blue-800 px-1 rounded">VITE_DID_API_KEY</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
