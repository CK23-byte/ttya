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
