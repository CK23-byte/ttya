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
  Upload,
  Crown,
  Zap,
  Check
} from 'lucide-react'

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

const USE_CASES = [
  {
    avatar: '👵',
    name: 'Grandma',
    preview: "Oh sweetie, I made your favorite cookies! 🍪",
    relationship: 'Grandmother'
  },
  {
    avatar: '👴',
    name: 'Grandpa',
    preview: "Remember when we went fishing? Those were the days!",
    relationship: 'Grandfather'
  },
  {
    avatar: '🐕',
    name: 'Max',
    preview: "*wags tail excitedly* Woof! I miss our walks! 🐾",
    relationship: 'Beloved Pet'
  },
  {
    avatar: '👨',
    name: 'Dad',
    preview: "I'm so proud of you, kiddo. Keep going! 💪",
    relationship: 'Father'
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([
    { id: 1, content: "Hello sweetheart! 💕 It's Grandma Rose. I'm so happy to chat with you! Try saying hello!", sender: 'ai' }
  ])
  const [demoInput, setDemoInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const MAX_FREE_MESSAGES = 5

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [demoMessages, isTyping])

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
          <span className="text-xs font-semibold text-gray-600">v2.3.0</span>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => navigate('/pricing')}
          className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md transition text-sm font-semibold text-gray-700 hover:text-orange-600"
        >
          Pricing
        </button>
        <button
          onClick={() => navigate('/auth')}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full shadow-sm hover:shadow-md transition text-sm font-semibold"
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
              Upload your WhatsApp conversations and let AI recreate the personality of loved ones.
              Secure, private, and deeply personal.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <button
                onClick={() => navigate('/auth')}
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
                    onClick={() => navigate('/auth')}
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

      {/* Use Cases - Visual Examples */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Who Would You Like to Talk To?
          </h3>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Recreate meaningful conversations with anyone you miss. Upload their messages and let AI capture their unique personality.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((useCase, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center text-2xl">
                    {useCase.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{useCase.name}</h4>
                    <p className="text-xs text-gray-500">{useCase.relationship}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100 group-hover:border-orange-200 transition">
                  <p className="text-sm text-gray-700 italic">"{useCase.preview}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
              Simple Setup
            </span>
            <h3 className="text-3xl font-bold text-gray-900">
              Start Chatting in 2 Steps
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold text-xl">1</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Upload Your Chat</h4>
              <p className="text-gray-600">Export and upload any WhatsApp conversation. AI learns their personality instantly.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold text-xl">2</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Start Chatting</h4>
              <p className="text-gray-600">Have meaningful conversations whenever you want. It's that simple.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="py-16 bg-gradient-to-r from-orange-500 to-rose-500">
        <div className="max-w-6xl mx-auto px-4 text-center text-white">
          <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h3 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h3>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Choose a plan that fits your needs. Start free, upgrade anytime.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
            {/* Free */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-left hover:bg-white/15 transition">
              <div className="text-2xl font-bold mb-1">Free</div>
              <div className="text-xl font-bold mb-3">€0<span className="text-sm font-normal">/mo</span></div>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>50 messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>1 AI personality</span>
                </li>
              </ul>
            </div>

            {/* Starter */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-left hover:bg-white/15 transition">
              <div className="text-2xl font-bold mb-1">Starter</div>
              <div className="text-xl font-bold mb-3">€9.99<span className="text-sm font-normal">/mo</span></div>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>1,500 messages/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>3 AI personalities</span>
                </li>
              </ul>
            </div>

            {/* Pro - Popular */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 text-left border-2 border-white/40 relative hover:bg-white/25 transition">
              <span className="absolute -top-2 right-3 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Popular
              </span>
              <div className="text-2xl font-bold mb-1">Pro</div>
              <div className="text-xl font-bold mb-3">€24.99<span className="text-sm font-normal">/mo</span></div>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>6,000 messages/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>10 AI personalities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Memory enhancement</span>
                </li>
              </ul>
            </div>

            {/* Premium */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-left hover:bg-white/15 transition relative">
              <span className="absolute -top-2 right-3 px-2 py-0.5 bg-amber-400 text-gray-900 text-xs font-bold rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Premium
              </span>
              <div className="text-2xl font-bold mb-1">Premium</div>
              <div className="text-xl font-bold mb-3">€49.99<span className="text-sm font-normal">/mo</span></div>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>20,000 messages/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Unlimited AI's</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Ultra fast responses</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate('/pricing')}
            className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            See All Plans & Add-ons
          </button>

          {/* Add-on Notice */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm">
            <Video className="w-4 h-4" />
            <span>+ Voice & Video credits available</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition">
              <MessageCircle className="w-8 h-8 text-orange-500 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Natural Conversations</h4>
              <p className="text-sm text-gray-600">AI learns their exact writing style and expressions</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition">
              <Users className="w-8 h-8 text-orange-500 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Multiple Profiles</h4>
              <p className="text-sm text-gray-600">Create conversations with different loved ones</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition">
              <Sparkles className="w-8 h-8 text-orange-500 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Chat Themes</h4>
              <p className="text-sm text-gray-600">WhatsApp, iMessage, or Messenger style</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-2xl font-medium text-gray-700 italic">
            "It felt like talking to her again. The way she used to say things... it brought tears to my eyes."
          </p>
          <p className="text-gray-500 mt-4">— Sarah, who lost her mother in 2022</p>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to reconnect?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Start with 10 free credits. No credit card required.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="group px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            Create Free Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer with Privacy */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
              <span className="font-medium text-gray-900">TalkToYouAI</span>
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
