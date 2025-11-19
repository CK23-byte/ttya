/**
 * Chat Page - WhatsApp Style Single Chat View
 *
 * Focused chat interface with WhatsApp look & feel
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Phone,
  Video,
  Smile,
  Paperclip,
  Mic
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getSecure, setSecure } from '../utils/secureStorage'
import { sendMessageToClaude, generateSystemPrompt } from '../utils/claudeAPI'
import TypingIndicator from '../components/TypingIndicator'
import { Message, PersonalityProfile } from '../types'

const MESSAGES_STORAGE_PREFIX = 'chat_messages_'
const PROFILES_STORAGE_KEY = 'personality_profiles'

export default function ChatPage() {
  const { isAuthenticated, encryptionKey, updateActivity } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Load profile and messages
  useEffect(() => {
    const loadChat = async () => {
      if (!encryptionKey) return

      const profileId = searchParams.get('profile')
      if (!profileId) {
        navigate('/dashboard')
        return
      }

      try {
        // Load all profiles
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

        // Load messages for this profile
        const savedMessages = await getSecure<Message[]>(
          `${MESSAGES_STORAGE_PREFIX}${profileId}`,
          encryptionKey
        ) || []

        setMessages(savedMessages)
      } catch (error) {
        console.error('Error loading chat:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChat()
  }, [encryptionKey, searchParams, navigate])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const saveMessages = async (newMessages: Message[]) => {
    if (!encryptionKey || !profile) return
    try {
      await setSecure(`${MESSAGES_STORAGE_PREFIX}${profile.id}`, newMessages, encryptionKey)
    } catch (error) {
      console.error('Error saving messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !profile || !encryptionKey) return

    updateActivity()

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      sender: 'user',
      timestamp: Date.now(),
      status: 'sending',
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setMessageInput('')

    // Update status to sent
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      )
    }, 500)

    setIsTyping(true)

    try {
      const systemPrompt = generateSystemPrompt(
        profile.name,
        profile.relationship,
        profile.tone,
        profile.typicalPhrases,
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
      setMessages(finalMessages)
      await saveMessages(finalMessages)
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
      setMessages(finalMessages)
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a1014]">
      {/* WhatsApp-style Header */}
      <div className="bg-[#1f2c34] border-b border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-700/50 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>

            {/* Profile Avatar */}
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

            {/* Profile Info */}
            <div>
              <h2 className="font-semibold text-gray-100">{profile.name}</h2>
              <p className="text-xs text-gray-400 capitalize">{profile.relationship}</p>
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

      {/* Chat Background with Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((message) => (
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
          {/* Emoji Button */}
          <button className="p-2 hover:bg-gray-700/50 rounded-full transition">
            <Smile className="w-6 h-6 text-gray-400" />
          </button>

          {/* Attachment Button */}
          <button className="p-2 hover:bg-gray-700/50 rounded-full transition">
            <Paperclip className="w-6 h-6 text-gray-400" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message"
            className="flex-1 px-4 py-2.5 bg-[#2a3942] text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
          />

          {/* Send / Voice Button */}
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
  )
}
