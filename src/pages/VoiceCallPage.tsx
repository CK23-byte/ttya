/**
 * Voice Call Page - Phone-style Interface for AI Voice Calls
 *
 * Full-screen phone call interface with:
 * - Large profile photo/avatar
 * - Call duration timer
 * - Live transcription
 * - Audio visualization
 * - Mute and end call controls
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, PhoneOff, Mic, MicOff, User, AlertCircle } from 'lucide-react'
import { useWebRTC } from '../hooks/useWebRTC'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import AudioVisualizer from '../components/AudioVisualizer'

export default function VoiceCallPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSupabaseAuth()

  // Get personality details from URL params
  const personalityId = searchParams.get('personalityId') || ''
  const personalityName = searchParams.get('name') || 'Unknown'
  const personalityRelationship = searchParams.get('relationship') || 'loved one'
  const personalityDescription = searchParams.get('description') || ''

  const [isMuted, setIsMuted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(true)

  // Initialize WebRTC connection
  const {
    status,
    isConnected,
    isSpeaking,
    isUserSpeaking,
    duration,
    messages,
    error,
    startCall,
    endCall
  } = useWebRTC({
    personalityId,
    personalityName,
    personalityRelationship,
    personalityDescription,
    userId: user?.id || 'local-user',
    onError: (error) => {
      console.error('WebRTC error:', error)
    }
  })

  // Auto-start call on mount
  useEffect(() => {
    if (!personalityId) {
      navigate('/dashboard')
      return
    }

    // Start call after brief delay
    const timer = setTimeout(() => {
      startCall()
    }, 500)

    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle end call
  const handleEndCall = async () => {
    await endCall()
    navigate('/dashboard')
  }

  // Toggle mute
  const toggleMute = () => {
    // TODO: Implement actual muting of microphone
    setIsMuted(!isMuted)
  }

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get status display text
  const getStatusText = (): string => {
    switch (status) {
      case 'requesting-mic':
        return 'Requesting microphone...'
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        return 'Connected'
      case 'active':
        return formatDuration(duration)
      case 'ended':
        return 'Call ended'
      case 'error':
        return 'Error'
      default:
        return 'Initializing...'
    }
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header with status */}
      <div className="p-6 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
          }`} />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Main call interface */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-8">
        {/* Profile avatar */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center shadow-2xl">
            <User className="w-16 h-16 text-white" />
          </div>
          {/* Pulsing ring when active */}
          {isConnected && (
            <div className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-orange-500/30 to-rose-500/30 rounded-full animate-ping" />
          )}
        </div>

        {/* Personality name and relationship */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{personalityName}</h1>
          <p className="text-gray-400 text-lg capitalize">{personalityRelationship}</p>
        </div>

        {/* Audio visualizer */}
        <div className="w-full max-w-md h-32 bg-gray-800/50 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700">
          <AudioVisualizer
            isUserSpeaking={isUserSpeaking}
            isAISpeaking={isSpeaking}
            className="w-full h-full"
          />
        </div>

        {/* Live transcript */}
        {showTranscript && messages.length > 0 && (
          <div className="w-full max-w-md bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-gray-700 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {messages.slice(-3).map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className={`font-semibold ${
                    msg.role === 'user' ? 'text-blue-400' : 'text-orange-400'
                  }`}>
                    {msg.role === 'user' ? 'You' : personalityName}:
                  </span>
                  <span className="text-gray-300 ml-2">{msg.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="p-8 pb-12">
        <div className="flex items-center justify-center gap-6">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            disabled={!isConnected}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isMuted ? (
              <MicOff className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </button>

          {/* End call button */}
          <button
            onClick={handleEndCall}
            className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition shadow-lg hover:shadow-xl"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          {/* Transcript toggle button */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition"
          >
            <Phone className="w-7 h-7 text-white" />
          </button>
        </div>

        {/* Instructions */}
        {status === 'connecting' && (
          <p className="text-center text-gray-400 text-sm mt-6">
            Establishing secure connection...
          </p>
        )}
        {status === 'active' && (
          <p className="text-center text-gray-400 text-sm mt-6">
            Speak naturally. The AI will respond in {personalityName}'s voice
          </p>
        )}
      </div>
    </div>
  )
}
