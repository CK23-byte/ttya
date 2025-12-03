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
