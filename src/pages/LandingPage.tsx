/**
 * Landing Page - High Conversion Design
 *
 * Features working demo chat with real AI
 * Visual examples, clear pricing, and strong CTAs
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  ArrowRight,
  Send,
  MessageCircle,
  Sparkles,
  Users,
  Video,
  Lock,
  Shield,
  Check,
  Mail,
  Globe,
  Camera,
  Mic,
  Archive,
  Database
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

interface DemoMessage {
  id: number
  content: string
  sender: 'user' | 'ai'
}

const DEMO_PERSONA = {
  name: 'Grandma Rose',
  relationship: 'grandmother',
  avatar: '👵',
  systemPrompt: `You are Grandma Rose, a warm and loving grandmother chatting with your grandchild.

PERSONALITY:
- Very loving and affectionate, use terms like "sweetie", "my dear", "darling"
- Use emojis warmly but sparingly: 💕 ☀️ 🥰 🍪 ✨
- Talk about baking cookies, knitting, your garden, and family memories
- Give gentle life advice and wisdom
- Always positive, supportive, and nurturing
- Speak in short, warm messages like in a real chat

RULES:
- Keep responses SHORT (1-2 sentences max, like a real text message)
- Be warm and grandmotherly
- Reference shared memories naturally
- Use 1-2 emojis per message maximum
- This is a demo - show how personal and warm the AI can be`
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useSupabaseAuth()
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([
    { id: 1, content: "Hello sweetheart! 💕 It's Grandma Rose. I'm so happy to chat with you! Try saying hello!", sender: 'ai' }
  ])
  const [demoInput, setDemoInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const MAX_FREE_MESSAGES = 5

  const handleChatClick = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/email-auth')
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [demoMessages, isTyping])

  // Handle email verification redirect from Supabase
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      // Email verification link clicked - redirect to email-auth page with token
      navigate('/email-auth' + hash)
    }
  }, [navigate])

  const handleDemoSend = async () => {
    if (!demoInput.trim() || isTyping || messageCount >= MAX_FREE_MESSAGES) return

    const userMessage: DemoMessage = {
      id: Date.now(),
      content: demoInput.trim(),
      sender: 'user',
    }

    setDemoMessages(prev => [...prev, userMessage])
    setDemoInput('')
    setMessageCount(prev => prev + 1)
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...demoMessages, userMessage].map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          systemPrompt: DEMO_PERSONA.systemPrompt,
          maxTokens: 150,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDemoMessages(prev => [...prev, {
          id: Date.now() + 1,
          content: data.response || "Oh sweetie, I'm having a bit of trouble. Can you try again? 💕",
          sender: 'ai',
        }])
      } else {
        setDemoMessages(prev => [...prev, {
          id: Date.now() + 1,
          content: "Oh my dear, it seems there's a little hiccup! But I'm always here for you 💕",
          sender: 'ai',
        }])
      }
    } catch {
      setDemoMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: "Sweetie, the connection seems fuzzy. But I'm thinking of you! 💕",
        sender: 'ai',
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Version Badge */}
      <div className="fixed top-4 left-4 z-50">
        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm">
          <span className="text-xs font-semibold text-gray-600" title="Build: 2025-12-18 10:57 UTC">v2.11.0</span>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="fixed top-4 right-4 z-50 flex flex-wrap gap-2 justify-end max-w-[calc(100vw-8rem)]">
        <button
          onClick={handleChatClick}
          className="px-3 sm:px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md transition text-xs sm:text-sm font-semibold text-gray-700 hover:text-orange-600"
        >
          Chat
        </button>
        <button
          onClick={() => navigate('/pricing')}
          className="px-3 sm:px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md transition text-xs sm:text-sm font-semibold text-gray-700 hover:text-orange-600"
        >
          Pricing
        </button>
        <button
          onClick={() => navigate('/email-auth')}
          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full shadow-sm hover:shadow-md transition text-xs sm:text-sm font-semibold"
        >
          Sign In
        </button>
      </div>

      {/* Hero Section with Demo Chat */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Text */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" fill="currentColor" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                TalkToYouAI
              </h1>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Chat with those
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                you miss most
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Upload conversations from WhatsApp, Messenger, Telegram, or any messaging app to recreate the personality of loved ones.
              Chat, make voice calls, or video call with AI recreations that sound and feel like them. Secure, private, and deeply personal.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <button
                onClick={() => navigate('/email-auth')}
                className="group px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Start Free Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-orange-300 hover:text-orange-600 transition-all duration-200"
              >
                View Pricing
              </button>
            </div>

            <p className="text-sm text-gray-500">
              ✓ 10 free credits on signup • ✓ No credit card required
            </p>
          </div>

          {/* Right: Demo Chat */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-rose-400 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  {DEMO_PERSONA.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{DEMO_PERSONA.name}</h3>
                  <p className="text-xs text-white/80">Live Demo • Try it now!</p>
                </div>
                <div className="px-2 py-1 bg-green-400 rounded-full animate-pulse">
                  <span className="text-xs text-white font-medium">Online</span>
                </div>
              </div>

              <div ref={chatContainerRef} className="h-72 overflow-y-auto p-4 bg-gray-50 space-y-3">
                {demoMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {messageCount >= MAX_FREE_MESSAGES ? (
                <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-rose-50 border-t border-orange-100 text-center">
                  <p className="text-sm font-medium text-gray-800 mb-2">Want to create your own?</p>
                  <button
                    onClick={() => navigate('/email-auth')}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition"
                  >
                    Get Started Free
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleDemoSend()}
                      placeholder="Say hello to Grandma..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      disabled={isTyping}
                    />
                    <button
                      onClick={handleDemoSend}
                      disabled={!demoInput.trim() || isTyping}
                      className="w-10 h-10 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition hover:shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {MAX_FREE_MESSAGES - messageCount} messages left in demo
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real Stories Section */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
              Real Stories, Real Connections
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Every Moment That Matters
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how TalkToYouAI helps people have those conversations, preserve memories, and share moments that truly matter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Story 1: Het gesprek dat je nooit kon voeren */}
            <div className="group">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* WhatsApp Interface Mockup */}
                <div className="bg-[#075E54] p-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                      alt="Dad"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-white block">Dad</span>
                      <span className="text-xs text-green-100">online</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2 min-h-[280px]" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h100v100H0z\" fill=\"%23E5DDD5\"/%3E%3C/svg%3E')"}}>
                  {/* User message - WhatsApp style */}
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] text-gray-800 rounded-lg rounded-tr-none px-3 py-2 max-w-[85%] text-sm shadow-sm">
                      <p className="mb-1">Dad, I got a job offer in New York. Great career move, but I'd have to relocate. What would you do? 💭</p>
                      <span className="text-xs text-gray-600 float-right ml-2">14:23</span>
                    </div>
                  </div>

                  {/* AI response - WhatsApp style */}
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] text-sm shadow-sm">
                      <p className="mb-1">Sweetheart, what a wonderful dilemma to have! Remember when I got that offer from the tech firm? You were only 8.</p>
                      <p className="mb-1">Mom and I debated for weeks... But sometimes you have to take the leap.</p>
                      <p className="mb-1">If your heart says "yes," then go. You can always come home, kiddo 😊</p>
                      <span className="text-xs text-gray-600 float-right ml-2">14:25</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#075E54] border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-200" />
                    <span className="text-xs text-green-100 font-medium">WhatsApp Style</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 px-2">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">Relive that valuable advice and genuine compliments</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Lisa's father always knew the right words. His wisdom, his encouragement, his unique way of seeing things - now she can experience his personality whenever she needs guidance or just a kind word.
                </p>
                <p className="text-xs text-gray-500 italic">
                  "Experience their personality one more time"
                </p>
              </div>
            </div>

            {/* Story 2: Oma's verhalen voor de volgende generatie */}
            <div className="group">
              <div className="bg-black rounded-2xl shadow-lg overflow-hidden border-2 border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Video Call Interface - Messenger Style */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=faces"
                        alt="Grandma Rose"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                      />
                      <span className="font-semibold">Grandma Rose</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs">02:34</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-slate-900 min-h-[280px] flex flex-col relative overflow-hidden">
                  {/* Main video frame - Grandma */}
                  <div className="flex-1 flex items-center justify-center p-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
                    <div className="relative">
                      {/* Video frame with subtle animation */}
                      <div className="bg-gradient-to-br from-amber-100 to-rose-100 rounded-2xl p-8 shadow-2xl border-4 border-white/10 animate-pulse" style={{animationDuration: '3s'}}>
                        <div className="text-center">
                          <img
                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=faces"
                            alt="Grandma Rose on video call"
                            className="w-24 h-24 rounded-full mx-auto mb-3 object-cover shadow-xl border-4 border-white/30"
                          />
                          <div className="bg-white/90 rounded-lg px-4 py-2 text-sm text-gray-800 italic mt-3 max-w-[200px]">
                            "...and then I would walk to the bakery every morning for fresh bread..."
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Small self-view in corner */}
                  <div className="absolute top-4 right-4 w-20 h-28 bg-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center shadow-xl">
                    <div className="text-2xl">👧</div>
                  </div>

                  {/* Subtitles bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-4 py-2 text-center">
                    <p className="text-white text-xs">
                      "Grandma, tell me about when you were little! 🏠"
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 border-t border-blue-700">
                  <div className="flex items-center justify-center gap-2">
                    <Video className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-medium">Video Call - Messenger Style</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 px-2">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">Stories for the next generation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Emma (4) will never meet her great-grandmother, but she can still hear her stories, her voice, and her laughter. Grandma's memories live on.
                </p>
                <p className="text-xs text-gray-500 italic">
                  "Stories that connect generations."
                </p>
              </div>
            </div>

            {/* Story 3: Een laatste verjaardag samen */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Voice Interface Mockup */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
                      alt="Tim"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                    />
                    <span className="font-semibold text-white">Tim</span>
                  </div>
                </div>

                <div className="p-6 min-h-[280px] flex flex-col justify-center items-center">
                  {/* Profile photo */}
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces"
                    alt="Tim profile"
                    className="w-24 h-24 rounded-full mb-4 object-cover shadow-xl border-4 border-orange-400/30"
                  />

                  <div className="text-amber-400 text-2xl mb-1">🎂 30 years</div>
                  <div className="text-gray-400 text-sm mb-4">March 8, 2024</div>

                  {/* Audio waveform */}
                  <div className="w-full mb-3">
                    <div className="flex items-center justify-center gap-1 h-12">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-orange-500 to-rose-400 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 100 + 20}%`,
                            animationDelay: `${i * 50}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-800/50 rounded-xl px-4 py-3 text-sm text-gray-200 text-center border border-gray-700">
                    "Bro, remember our pact? Skydiving on our 30th? You'd laugh that I did it without you 😄..."
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs text-gray-400 font-medium">Voice Call Active</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 px-2">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">One last birthday together</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Thomas lost his twin brother Tim in a car accident. On what would have been Tim's 30th birthday, he can still mark this moment "together" - with Tim's voice, humor, and responses.
                </p>
                <p className="text-xs text-gray-500 italic">
                  "Moments that matter, together."
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/email-auth')}
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
            >
              Create Your First Memory
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Your Memories, Preserved Forever */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Memories,{' '}
              <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                Preserved Forever
              </span>
            </h2>
            <p className="text-2xl text-gray-700 font-medium mb-4">
              Every conversation holds a lifetime
            </p>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              People drift apart, move away, grow distant — but the memories don't fade. Their voice, their humor,
              the way they said your name, their advice, their stories. All those text messages, voice notes, photos, and moments –
              they don't have to disappear. <span className="font-semibold text-gray-900">TalkToYouAI transforms your digital memories into a living connection</span>, whether they're across the world or no longer with us.
            </p>
          </div>

          {/* The Digital Legacy Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                <Archive className="w-4 h-4" />
                The Digital Legacy We Forget About
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">What's Hidden in Your Conversations</h3>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Whether it's a childhood friend, a loved one who passed away, or family abroad — their entire personality lives in your conversations.
                Thousands of messages, voice notes, and photos that capture exactly who they are. Don't let it sit forgotten in your phone.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* WhatsApp Messages */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">10,000+ Messages</h4>
                    <p className="text-sm text-gray-600">WhatsApp, Telegram, SMS</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Their daily thoughts and feelings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>How they gave advice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Their sense of humor in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>How they celebrated your wins</span>
                  </li>
                </ul>
              </div>

              {/* Voice Notes */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Hours of Voice</h4>
                    <p className="text-sm text-gray-600">Voice notes & recordings</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Their actual voice, tone, and inflection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>How they pronounced your name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Their laugh, sighs, excitement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>The way they said "I love you"</span>
                  </li>
                </ul>
              </div>

              {/* Photos & Videos */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Thousands of Photos</h4>
                    <p className="text-sm text-gray-600">Photos & videos</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Their facial expressions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>How they moved and gestured</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Their smile in different moments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>The way they looked at you</span>
                  </li>
                </ul>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Social Media Posts</h4>
                    <p className="text-sm text-gray-600">Facebook, Instagram, Twitter</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Their opinions and worldviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>What made them laugh or angry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Their interests and passions</span>
                  </li>
                </ul>
              </div>

              {/* Emails */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Emails & Letters</h4>
                    <p className="text-sm text-gray-600">Written correspondence</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                    <span>Their writing style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                    <span>How they structured thoughts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                    <span>Important life advice they shared</span>
                  </li>
                </ul>
              </div>

              {/* Recorded Conversations */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Video Recordings</h4>
                    <p className="text-sm text-gray-600">Family moments captured</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Family dinners on video</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Birthday messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Random vlogs or home videos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quality Levels Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                <Database className="w-4 h-4" />
                Quality Levels
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">How Much Data Do You Need?</h3>
              <p className="text-gray-600 max-w-3xl mx-auto">
                More data creates a more accurate and nuanced AI personality. But even with limited data, we can create something meaningful.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Minimum */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <Archive className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-2">Minimum Viable</h4>
                  <p className="text-3xl font-bold text-orange-600 mb-1">1,000+</p>
                  <p className="text-sm text-gray-600">messages or equivalent</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-600 mt-0.5" />
                    <span>Basic personality captured</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-600 mt-0.5" />
                    <span>Common phrases and tone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-600 mt-0.5" />
                    <span>General conversation style</span>
                  </li>
                </ul>
              </div>

              {/* Good */}
              <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-6 border-2 border-orange-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                  RECOMMENDED
                </div>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                    <Database className="w-8 h-8 text-orange-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-2">Good Profile</h4>
                  <p className="text-3xl font-bold text-orange-600 mb-1">5,000+</p>
                  <p className="text-sm text-gray-600">messages or equivalent</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span>Nuanced personality traits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span>Specific memories referenced</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span>Emotional depth in responses</span>
                  </li>
                </ul>
              </div>

              {/* Exceptional */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full mb-3">
                    <Sparkles className="w-8 h-8 text-orange-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-2">Exceptional</h4>
                  <p className="text-3xl font-bold text-orange-600 mb-1">10,000+</p>
                  <p className="text-sm text-gray-600">messages or equivalent</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span>Remarkably accurate personality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span>Context-aware responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span>Feels remarkably real</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to reconnect?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Start with 50 free credits. No credit card required.
          </p>
          <button
            onClick={() => navigate('/email-auth')}
            className="group px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            Create Free Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="py-16 bg-gradient-to-br from-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Shield className="w-10 h-10 text-orange-400" />
                <h3 className="text-3xl font-bold">Your Data, Your Privacy</h3>
              </div>
              <p className="text-lg text-gray-300 text-center mb-8">
                We understand how precious and private these memories are. That's why we've built TalkToYouAI with security and privacy at its core.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">End-to-End Encryption</h4>
                  <p className="text-sm text-gray-400">Your data is encrypted with AES-256 before it ever leaves your device</p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">You Own Your Data</h4>
                  <p className="text-sm text-gray-400">Download or delete your profiles anytime. No questions asked.</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Never Shared or Sold</h4>
                  <p className="text-sm text-gray-400">Your memories stay yours. We never share or sell your data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Privacy */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
              <span className="font-medium text-gray-900">TalkToYouAI</span>
              <span
                className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full border border-orange-200"
                title="Build: 2025-12-18 10:57 UTC"
              >
                v2.11.0
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>AES-256 Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Privacy First</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              © 2024 TalkToYouAI • Made with ♥
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
