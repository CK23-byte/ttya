/**
 * Chat Page - Multi-Theme Chat Interface
 *
 * Features:
 * - Theme switcher: WhatsApp, iMessage, Messenger
 * - Left sidebar with conversation list
 * - Right panel with active chat
 * - Persistent chat history per personality profile
 * - Working emoji picker
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { logger } from '../utils/logger'
import {
  MoreVertical,
  Search,
  Send,
  Phone,
  Smile,
  Paperclip,
  Plus,
  MessageCircle,
  Home,
  Palette
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { sendMessageToClaude, generateSystemPrompt } from '../utils/claudeAPI'
import { loadPersonalityProfiles, loadChatMessages, saveChatMessages } from '../utils/profileStorage'
import TypingIndicator from '../components/TypingIndicator'
import EmojiPicker from '../components/EmojiPicker'
import AttachmentPicker from '../components/AttachmentPicker'
import VoiceCallModal from '../components/VoiceCallModal'
import Modal from '../components/Modal'
import { Message, PersonalityProfile } from '../types'
import { CREDIT_PRICING } from '../types/database'

const THEME_STORAGE_KEY = 'chat_theme'

type ChatTheme = 'whatsapp' | 'imessage' | 'messenger'

const THEMES = {
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    bg: 'bg-[#0a1014]',
    sidebar: 'bg-[#1f2c34]',
    header: 'bg-[#1f2c34]',
    input: 'bg-[#2a3942]',
    userBubble: 'bg-[#005c4b] text-white',
    aiBubble: 'bg-[#1f2c34] text-gray-100',
    accent: '#00a884',
    accentHover: '#00a884/90',
    border: 'border-gray-700',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    placeholder: 'placeholder-gray-500',
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  imessage: {
    name: 'iMessage',
    icon: '🍎',
    bg: 'bg-gray-100',
    sidebar: 'bg-white',
    header: 'bg-gray-50',
    input: 'bg-white',
    userBubble: 'bg-blue-500 text-white',
    aiBubble: 'bg-gray-200 text-gray-900',
    accent: '#007AFF',
    accentHover: '#007AFF/90',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    placeholder: 'placeholder-gray-400',
    pattern: 'none',
  },
  messenger: {
    name: 'Messenger',
    icon: '💜',
    bg: 'bg-white',
    sidebar: 'bg-white',
    header: 'bg-white',
    input: 'bg-gray-100',
    userBubble: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
    aiBubble: 'bg-gray-100 text-gray-900',
    accent: '#0084FF',
    accentHover: '#0084FF/90',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    placeholder: 'placeholder-gray-400',
    pattern: 'none',
  },
}

interface ChatConversation {
  profileId: string
  profile: PersonalityProfile
  messages: Message[]
  lastMessage?: Message
  unreadCount: number
}

export default function ChatPage() {
  const { isAuthenticated, encryptionKey, updateActivity } = useAuth()
  const { user, profile: supabaseProfile, refreshCredits, isLoading: supabaseLoading, isConfigured } = useSupabaseAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Check auth: Support both old password-based and new Supabase email auth
  const isUserAuthenticated = isAuthenticated || (isConfigured && user !== null)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false)
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false)
  const [theme, setTheme] = useState<ChatTheme>('whatsapp')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasLoadedRef = useRef(false)
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

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ChatTheme
    if (savedTheme && THEMES[savedTheme]) {
      setTheme(savedTheme)
    }
  }, [])

  const handleThemeChange = (newTheme: ChatTheme) => {
    setTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    setShowThemePicker(false)
  }

  const currentTheme = THEMES[theme]

  // Redirect if not authenticated (but wait for initial auth check)
  useEffect(() => {
    // Wait for Supabase auth to finish loading
    if (isConfigured && supabaseLoading) {
      return
    }

    // Redirect to login if not authenticated
    if (!isUserAuthenticated) {
      navigate('/email-auth')
    }
  }, [isUserAuthenticated, supabaseLoading, navigate, isConfigured])

  // Load all personality profiles and their conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Use centralized storage utility (handles both encrypted and Supabase database)
        const profiles = await loadPersonalityProfiles(encryptionKey)
        logger.log('📱 ChatPage: Loaded profiles from storage:', profiles.length)

        // Load messages for each profile
        const convos: ChatConversation[] = await Promise.all(
          profiles.map(async (profile) => {
            // Use centralized message loading (handles both encrypted and Supabase database)
            const messages = await loadChatMessages(profile.id, encryptionKey)

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

        // Only set active profile on first load or if URL has specific profile
        const profileIdFromUrl = searchParams.get('profile')

        if (profileIdFromUrl && convos.find(c => c.profileId === profileIdFromUrl)) {
          // URL has specific profile - use it
          setActiveProfileId(profileIdFromUrl)
          const activeConvo = convos.find(c => c.profileId === profileIdFromUrl)
          if (activeConvo) {
            setCurrentMessages(activeConvo.messages)
          }
          hasLoadedRef.current = true
        } else if (!hasLoadedRef.current && convos.length > 0) {
          // First load and no URL profile - select first conversation
          setActiveProfileId(convos[0].profileId)
          setCurrentMessages(convos[0].messages)
          setSearchParams({ profile: convos[0].profileId }, { replace: true })
          hasLoadedRef.current = true
        }
      } catch (error) {
        logger.error('Error loading conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [encryptionKey])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, isTyping])

  const getActiveConversation = () => {
    return conversations.find(c => c.profileId === activeProfileId)
  }

  const saveMessages = async (profileId: string, messages: Message[]) => {
    try {
      // Use centralized message saving (handles both encrypted and Supabase database)
      await saveChatMessages(profileId, messages, encryptionKey)

      // Update conversations list
      setConversations(prev => prev.map(c =>
        c.profileId === profileId
          ? { ...c, messages, lastMessage: messages[messages.length - 1] }
          : c
      ))
    } catch (error) {
      logger.error('Error saving messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeProfileId) return

    const activeConvo = getActiveConversation()
    if (!activeConvo) return

    // Check if user has Supabase account and credits
    if (!user || !supabaseProfile) {
      showModal(
        'Account Required',
        'Please sign in with email to use chat features and track your credits.',
        'warning'
      )
      return
    }

    // Check if user has enough text credits
    const textCredits = supabaseProfile.text_credits || 0
    const requiredCredits = CREDIT_PRICING.MESSAGE_BASE_COST

    if (textCredits < requiredCredits) {
      showModal(
        'Insufficient Credits',
        `You need ${requiredCredits} text credit${requiredCredits > 1 ? 's' : ''} to send a message.\n\nYou have ${textCredits} text credit${textCredits !== 1 ? 's' : ''} remaining.\n\nPlease purchase more credits to continue chatting.`,
        'warning'
      )
      navigate('/pricing')
      return
    }

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

    // Save user message immediately (before AI responds)
    await saveMessages(activeProfileId, updatedMessages)

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

      // Deduct text credits after successful message
      try {
        const response = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            amount: requiredCredits,
            creditType: 'text',
            description: `Chat message to ${activeConvo.profile.name}`
          })
        })

        if (response.ok) {
          // Refresh credits to update UI
          await refreshCredits()
        } else {
          logger.error('Failed to deduct credits:', await response.text())
        }
      } catch (creditError) {
        logger.error('Error deducting credits:', creditError)
        // Don't show error to user - message was already sent successfully
      }

    } catch (error) {
      logger.error('Error getting AI response:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, something went wrong. Please try again.',
        sender: 'ai',
        timestamp: Date.now(),
        status: 'error',
      }

      const finalMessages = [...updatedMessages, errorMessage]
      setCurrentMessages(finalMessages)
      await saveMessages(activeProfileId, finalMessages)
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

  // Handle file attachments
  const handleAttachmentUpload = (files: File[], type: 'photo' | 'video' | 'text') => {
    logger.log(`Uploading ${files.length} ${type} files:`, files.map(f => f.name))
    // TODO: Store files locally and attach to profile
    alert(`${files.length} ${type} file(s) uploaded successfully! These will help the AI better understand ${getActiveConversation()?.profile.name}.`)
  }

  // Handle voice sample upload
  const handleVoiceSampleUpload = (file: File) => {
    logger.log('Voice sample uploaded:', file.name)
    // TODO: Store voice sample with profile
    alert(`Voice sample "${file.name}" uploaded! This will be used to generate voice calls.`)
  }

  // Handle buy credits
  const handleBuyVoiceCredits = () => {
    alert('Voice credits purchase coming soon! This will redirect to Stripe checkout.')
    setShowVoiceCallModal(false)
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-screen ${currentTheme.bg}`}>
        <div className={currentTheme.textMuted}>Loading...</div>
      </div>
    )
  }

  const activeConvo = getActiveConversation()

  return (
    <div className={`flex h-screen ${currentTheme.bg}`}>
      {/* Left Sidebar - Conversations List */}
      <div className={`w-full md:w-96 ${currentTheme.sidebar} border-r ${currentTheme.border} flex flex-col`}>
        {/* Sidebar Header */}
        <div className={`${currentTheme.sidebar} px-4 py-3 border-b ${currentTheme.border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-black/10 rounded-full transition"
                title="Home"
              >
                <Home className={`w-5 h-5 ${currentTheme.textMuted}`} />
              </button>
              <h2 className={`text-xl font-semibold ${currentTheme.text}`}>Chats</h2>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded" title="Build: 2025-12-18 10:57 UTC">
                v2.11.0
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="p-2 hover:bg-black/10 rounded-full transition flex items-center gap-1"
                  title="Change Theme"
                >
                  <Palette className={`w-5 h-5 ${currentTheme.textMuted}`} />
                </button>
                {showThemePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Choose Theme
                    </div>
                    {(Object.keys(THEMES) as ChatTheme[]).map((themeKey) => (
                      <button
                        key={themeKey}
                        onClick={() => handleThemeChange(themeKey)}
                        className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition ${
                          theme === themeKey ? 'bg-gray-100' : ''
                        }`}
                      >
                        <span className="text-xl">{THEMES[themeKey].icon}</span>
                        <span className="text-gray-900 font-medium">{THEMES[themeKey].name}</span>
                        {theme === themeKey && (
                          <span className="ml-auto text-green-500">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-black/10 rounded-full transition"
                title="New Chat"
              >
                <Plus className={`w-5 h-5 ${currentTheme.textMuted}`} />
              </button>
              <button
                className="p-2 hover:bg-black/10 rounded-full transition"
                title="Menu"
              >
                <MoreVertical className={`w-5 h-5 ${currentTheme.textMuted}`} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${currentTheme.textMuted}`} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${currentTheme.input} ${currentTheme.text} ${currentTheme.placeholder} border ${currentTheme.border} rounded-lg text-sm focus:outline-none focus:ring-2`}
              style={{ '--tw-ring-color': currentTheme.accent } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className={`w-16 h-16 ${theme === 'whatsapp' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center mb-4`}>
                <MessageCircle className={`w-8 h-8 ${currentTheme.textMuted}`} />
              </div>
              <p className={`${currentTheme.text} font-medium mb-2`}>No conversations yet</p>
              <p className={`${currentTheme.textMuted} text-sm mb-4`}>
                Create a personality profile to start chatting
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-white rounded-lg transition"
                style={{ backgroundColor: currentTheme.accent }}
              >
                Create Profile
              </button>
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <button
                key={convo.profileId}
                onClick={() => handleSelectConversation(convo.profileId)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-black/5 transition border-b ${currentTheme.border} ${
                  activeProfileId === convo.profileId ? 'bg-black/5' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center text-white font-semibold">
                  {(convo.profile.photoUrls && convo.profile.photoUrls.length > 0) || convo.profile.photoUrl ? (
                    <img
                      src={convo.profile.photoUrls?.[0] || convo.profile.photoUrl}
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
                    <h3 className={`font-semibold ${currentTheme.text} truncate`}>
                      {convo.profile.name}
                    </h3>
                    {convo.lastMessage && (
                      <span className={`text-xs ${currentTheme.textMuted} ml-2`}>
                        {formatLastSeen(convo.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${currentTheme.textMuted} truncate`}>
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
          <div className={`${currentTheme.header} border-b ${currentTheme.border} shadow-sm`}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Profile Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                  {(activeConvo.profile.photoUrls && activeConvo.profile.photoUrls.length > 0) || activeConvo.profile.photoUrl ? (
                    <img
                      src={activeConvo.profile.photoUrls?.[0] || activeConvo.profile.photoUrl}
                      alt={activeConvo.profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    activeConvo.profile.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Profile Info */}
                <div>
                  <h2 className={`font-semibold ${currentTheme.text}`}>{activeConvo.profile.name}</h2>
                  <p className={`text-xs ${currentTheme.textMuted} capitalize`}>{activeConvo.profile.relationship}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Navigate to voice call with personality data
                    const profile = activeConvo.profile
                    const params = new URLSearchParams({
                      personalityId: activeConvo.profileId,
                      name: profile.name,
                      relationship: profile.relationship || '',
                      description: profile.systemPrompt || `${profile.name} is a ${profile.relationship} with a warm and loving personality.`,
                      returnTo: `/chat?profile=${activeConvo.profileId}` // Return to this chat after call ends
                    })
                    navigate(`/voice-call?${params.toString()}`)
                  }}
                  className="p-2 hover:bg-green-500/20 rounded-full transition group"
                  title="Start Voice Call (OpenAI Realtime API)"
                >
                  <Phone className={`w-5 h-5 ${currentTheme.textMuted} group-hover:text-green-500 transition`} />
                </button>
                <button className="p-2 hover:bg-black/10 rounded-full transition">
                  <MoreVertical className={`w-5 h-5 ${currentTheme.textMuted}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            className={`flex-1 overflow-y-auto px-4 py-6 ${currentTheme.bg}`}
            style={{
              backgroundImage: currentTheme.pattern
            }}
          >
            <div className="max-w-4xl mx-auto space-y-3">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 shadow-sm ${
                      message.sender === 'user'
                        ? `${currentTheme.userBubble} ${theme === 'imessage' ? 'rounded-2xl rounded-br-sm' : theme === 'messenger' ? 'rounded-full' : 'rounded-lg rounded-br-sm'}`
                        : `${currentTheme.aiBubble} ${theme === 'imessage' ? 'rounded-2xl rounded-bl-sm' : theme === 'messenger' ? 'rounded-full' : 'rounded-lg rounded-bl-sm'}`
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className={`text-[10px] ${message.sender === 'user' ? 'text-white/70' : currentTheme.textMuted} opacity-70`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className={`${currentTheme.aiBubble} ${theme === 'imessage' ? 'rounded-2xl rounded-bl-sm' : theme === 'messenger' ? 'rounded-full' : 'rounded-lg rounded-bl-sm'} px-4 py-3 shadow-sm`}>
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={`${currentTheme.header} border-t ${currentTheme.border} px-4 py-3`}>
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 hover:bg-black/10 rounded-full transition ${showEmojiPicker ? 'bg-black/10' : ''}`}
                >
                  <Smile className={`w-6 h-6 ${currentTheme.textMuted}`} />
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onSelect={(emoji) => setMessageInput(prev => prev + emoji)}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </div>
              <button
                onClick={() => setShowAttachmentPicker(true)}
                className="p-2 hover:bg-black/10 rounded-full transition"
                title="Add photos, videos, or text samples"
              >
                <Paperclip className={`w-6 h-6 ${currentTheme.textMuted}`} />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                onClick={() => setShowEmojiPicker(false)}
                placeholder="Type a message"
                className={`flex-1 px-4 py-2.5 ${currentTheme.input} ${currentTheme.text} ${currentTheme.placeholder} ${theme === 'messenger' ? 'rounded-full' : 'rounded-lg'} border ${currentTheme.border} focus:outline-none focus:ring-2`}
                style={{ '--tw-ring-color': currentTheme.accent } as React.CSSProperties}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className={`p-2.5 rounded-full transition text-white ${
                  messageInput.trim()
                    ? 'opacity-100 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
                style={{ backgroundColor: currentTheme.accent }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center ${currentTheme.bg}`}>
          <div className="text-center">
            <div className={`w-32 h-32 ${theme === 'whatsapp' ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <MessageCircle className={`w-16 h-16 ${currentTheme.textMuted}`} />
            </div>
            <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
              TalkToYouAI
            </h3>
            <p className={currentTheme.textMuted}>
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAttachmentPicker && activeConvo && (
        <AttachmentPicker
          onClose={() => setShowAttachmentPicker(false)}
          onUpload={handleAttachmentUpload}
          profileName={activeConvo.profile.name}
        />
      )}

      {showVoiceCallModal && activeConvo && (
        <VoiceCallModal
          onClose={() => setShowVoiceCallModal(false)}
          profileName={activeConvo.profile.name}
          hasVoiceSample={false}
          onUploadVoiceSample={handleVoiceSampleUpload}
          onBuyCredits={handleBuyVoiceCredits}
          theme={theme}
        />
      )}

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
