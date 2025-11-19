/**
 * Chat Page - WhatsApp Style with Sidebar
 *
 * Features:
 * - Dark theme WhatsApp look
 * - Left sidebar with conversation list
 * - Right panel with active chat
 * - Persistent chat history per personality profile
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  MoreVertical,
  Search,
  Send,
  Phone,
  Video,
  Smile,
  Paperclip,
  Mic,
  Plus,
  MessageCircle,
  Home
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getSecure, setSecure } from '../utils/secureStorage'
import { sendMessageToClaude, generateSystemPrompt } from '../utils/claudeAPI'
import TypingIndicator from '../components/TypingIndicator'
import { Message, PersonalityProfile } from '../types'

const MESSAGES_STORAGE_PREFIX = 'chat_messages_'
const PROFILES_STORAGE_KEY = 'personality_profiles'

interface ChatConversation {
  profileId: string
  profile: PersonalityProfile
  messages: Message[]
  lastMessage?: Message
  unreadCount: number
}

export default function ChatPage() {
  const { isAuthenticated, encryptionKey, updateActivity } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Load all personality profiles and their conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!encryptionKey) return

      try {
        // Load all profiles
        const profiles = await getSecure<PersonalityProfile[]>(
          PROFILES_STORAGE_KEY,
          encryptionKey
        ) || []

        // Load messages for each profile
        const convos: ChatConversation[] = await Promise.all(
          profiles.map(async (profile) => {
            const messages = await getSecure<Message[]>(
              `${MESSAGES_STORAGE_PREFIX}${profile.id}`,
              encryptionKey
            ) || []

            return {
              profileId: profile.id,
              profile,
              messages,
              lastMessage: messages[messages.length - 1],
              unreadCount: 0
            }
          })
        )

        setConversations(convos)

        // Check if there's a profile ID in URL
        const profileIdFromUrl = searchParams.get('profile')
        if (profileIdFromUrl && convos.find(c => c.profileId === profileIdFromUrl)) {
          setActiveProfileId(profileIdFromUrl)
          const activeConvo = convos.find(c => c.profileId === profileIdFromUrl)
          if (activeConvo) {
            setCurrentMessages(activeConvo.messages)
          }
        } else if (convos.length > 0) {
          // Select first conversation
          setActiveProfileId(convos[0].profileId)
          setCurrentMessages(convos[0].messages)
          setSearchParams({ profile: convos[0].profileId })
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [encryptionKey, searchParams])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, isTyping])

  const getActiveConversation = () => {
    return conversations.find(c => c.profileId === activeProfileId)
  }

  const saveMessages = async (profileId: string, messages: Message[]) => {
    if (!encryptionKey) return
    try {
      await setSecure(`${MESSAGES_STORAGE_PREFIX}${profileId}`, messages, encryptionKey)

      // Update conversations list
      setConversations(prev => prev.map(c =>
        c.profileId === profileId
          ? { ...c, messages, lastMessage: messages[messages.length - 1] }
          : c
      ))
    } catch (error) {
      console.error('Error saving messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeProfileId || !encryptionKey) return

    const activeConvo = getActiveConversation()
    if (!activeConvo) return

    updateActivity()

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      sender: 'user',
      timestamp: Date.now(),
      status: 'sending',
    }

    const updatedMessages = [...currentMessages, userMessage]
    setCurrentMessages(updatedMessages)
    setMessageInput('')

    setTimeout(() => {
      setCurrentMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      )
    }, 500)

    setIsTyping(true)

    try {
      const systemPrompt = generateSystemPrompt(
        activeConvo.profile.name,
        activeConvo.profile.relationship,
        activeConvo.profile.tone,
        activeConvo.profile.typicalPhrases,
        []
      )

      const aiResponse = await sendMessageToClaude(updatedMessages, systemPrompt)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: Date.now(),
        status: 'sent',
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setCurrentMessages(finalMessages)
      await saveMessages(activeProfileId, finalMessages)
    } catch (error) {
      console.error('Error getting AI response:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, something went wrong. Please try again.',
        sender: 'ai',
        timestamp: Date.now(),
        status: 'error',
      }

      const finalMessages = [...updatedMessages, errorMessage]
      setCurrentMessages(finalMessages)
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatLastSeen = (timestamp: number) => {
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffMs = now.getTime() - messageDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return messageDate.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(c =>
    c.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectConversation = (profileId: string) => {
    setActiveProfileId(profileId)
    const convo = conversations.find(c => c.profileId === profileId)
    if (convo) {
      setCurrentMessages(convo.messages)
      setSearchParams({ profile: profileId })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a1014]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  const activeConvo = getActiveConversation()

  return (
    <div className="flex h-screen bg-[#0a1014]">
      {/* Left Sidebar - Conversations List */}
      <div className="w-full md:w-96 bg-[#1f2c34] border-r border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-[#1f2c34] px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-700/50 rounded-full transition"
                title="Home"
              >
                <Home className="w-5 h-5 text-gray-300" />
              </button>
              <h2 className="text-xl font-semibold text-gray-100">Chats</h2>
              <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs font-semibold rounded">
                v2.1.0
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-700/50 rounded-full transition"
                title="New Chat"
              >
                <Plus className="w-5 h-5 text-gray-300" />
              </button>
              <button
                className="p-2 hover:bg-gray-700/50 rounded-full transition"
                title="Menu"
              >
                <MoreVertical className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#2a3942] text-gray-100 placeholder-gray-500 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-300 font-medium mb-2">No conversations yet</p>
              <p className="text-gray-500 text-sm mb-4">
                Create a personality profile to start chatting
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-[#00a884] text-white rounded-lg hover:bg-[#00a884]/90 transition"
              >
                Create Profile
              </button>
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <button
                key={convo.profileId}
                onClick={() => handleSelectConversation(convo.profileId)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2a3942] transition border-b border-gray-700 ${
                  activeProfileId === convo.profileId ? 'bg-[#2a3942]' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center text-white font-semibold">
                  {convo.profile.photoUrl ? (
                    <img
                      src={convo.profile.photoUrl}
                      alt={convo.profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    convo.profile.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-100 truncate">
                      {convo.profile.name}
                    </h3>
                    {convo.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatLastSeen(convo.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {convo.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Active Chat */}
      {activeConvo ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-[#1f2c34] border-b border-gray-700 shadow-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Profile Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                  {activeConvo.profile.photoUrl ? (
                    <img
                      src={activeConvo.profile.photoUrl}
                      alt={activeConvo.profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    activeConvo.profile.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Profile Info */}
                <div>
                  <h2 className="font-semibold text-gray-100">{activeConvo.profile.name}</h2>
                  <p className="text-xs text-gray-400 capitalize">{activeConvo.profile.relationship}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-700/50 rounded-full transition">
                  <Video className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 hover:bg-gray-700/50 rounded-full transition">
                  <Phone className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 hover:bg-gray-700/50 rounded-full transition">
                  <MoreVertical className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-6"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          >
            <div className="max-w-4xl mx-auto space-y-3">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 shadow-md ${
                      message.sender === 'user'
                        ? 'bg-[#005c4b] text-white'
                        : 'bg-[#1f2c34] text-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-300 opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1f2c34] rounded-lg px-4 py-3 shadow-md">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-[#1f2c34] border-t border-gray-700 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <button className="p-2 hover:bg-gray-700/50 rounded-full transition">
                <Smile className="w-6 h-6 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-700/50 rounded-full transition">
                <Paperclip className="w-6 h-6 text-gray-400" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message"
                className="flex-1 px-4 py-2.5 bg-[#2a3942] text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              />
              {messageInput.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 bg-[#00a884] hover:bg-[#00a884]/90 rounded-full transition"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button className="p-2 hover:bg-gray-700/50 rounded-full transition">
                  <Mic className="w-6 h-6 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#0a1014]">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-16 h-16 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-100 mb-2">
              TalkToYouAI
            </h3>
            <p className="text-gray-400">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
