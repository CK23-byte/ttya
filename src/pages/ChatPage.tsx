/**
 * Chat Page
 *
 * WhatsApp-style chat interface with AI personality
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSecure, setSecure } from '../utils/secureStorage'
import { sendMessageToClaude, generateSystemPrompt } from '../utils/claudeAPI'
import ChatHeader from '../components/ChatHeader'
import ChatMessage from '../components/ChatMessage'
import MessageInput from '../components/MessageInput'
import TypingIndicator from '../components/TypingIndicator'
import { Message, PersonalityProfile } from '../types'

const MESSAGES_STORAGE_KEY = 'chat_messages'
const PERSONALITY_STORAGE_KEY = 'personality_profile'

export default function ChatPage() {
  const { isAuthenticated, encryptionKey, updateActivity } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Load personality profile and messages
  useEffect(() => {
    const loadData = async () => {
      if (!encryptionKey) return

      try {
        // Load personality profile
        const savedProfile = await getSecure<PersonalityProfile>(
          PERSONALITY_STORAGE_KEY,
          encryptionKey
        )

        if (!savedProfile) {
          // No profile yet, redirect to builder
          navigate('/personality-builder')
          return
        }

        setProfile(savedProfile)

        // Load messages
        const savedMessages = await getSecure<Message[]>(
          MESSAGES_STORAGE_KEY,
          encryptionKey
        )

        if (savedMessages) {
          setMessages(savedMessages)
        } else {
          // Welcome message
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            content: `Hey! Zo fijn om weer van je te horen. Hoe gaat het met je?`,
            sender: 'ai',
            timestamp: Date.now(),
            status: 'sent',
          }
          setMessages([welcomeMessage])
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [encryptionKey, navigate])

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Save messages
  const saveMessages = async (newMessages: Message[]) => {
    if (!encryptionKey) return
    try {
      await setSecure(MESSAGES_STORAGE_KEY, newMessages, encryptionKey)
    } catch (error) {
      console.error('Error saving messages:', error)
    }
  }

  // Handle sending message
  const handleSendMessage = async (content: string) => {
    if (!profile || !encryptionKey) return

    updateActivity()

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: Date.now(),
      status: 'sending',
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    // Update message status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      )
    }, 500)

    // Show typing indicator
    setIsTyping(true)

    try {
      // Generate system prompt from profile
      const systemPrompt = generateSystemPrompt(
        profile.name,
        profile.relationship,
        profile.tone,
        profile.typicalPhrases,
        [] // We'll add example messages from WhatsApp imports later
      )

      // Get AI response
      const aiResponse = await sendMessageToClaude(updatedMessages, systemPrompt)

      // Create AI message
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

      // Error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, er ging iets mis. Probeer het opnieuw.',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-whatsapp-background">
        <div className="text-gray-600">Laden...</div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-whatsapp-background">
      {/* Header */}
      <ChatHeader
        name={profile.name}
        avatar={profile.photoUrl}
        isOnline={true}
        lastSeen="vandaag"
      />

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <MessageInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  )
}
