/**
 * Landing Page - With Interactive Demo Chat
 *
 * Conversion-focused landing page for TalkToYouAI
 * Features a demo chat so users can immediately experience the app
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Lock,
  Shield,
  ArrowRight,
  Send,
  Crown,
  Check
} from 'lucide-react'

interface DemoMessage {
  id: number
  content: string
  sender: 'user' | 'ai'
  typing?: boolean
}

const DEMO_PERSONA = {
  name: 'Grandma Rose',
  relationship: 'grandmother',
  avatar: '👵',
}

const DEMO_RESPONSES: Record<string, string[]> = {
  default: [
    "Oh sweetie, it's so lovely to hear from you! 💕 How have you been?",
    "My dear, you always brighten my day when you write! ☀️",
    "Hello my precious one! I was just thinking about you! 🥰",
  ],
  hello: [
    "Hello my darling! 💕 It warms my heart to hear from you!",
    "Oh hello sweetie! I was just about to make some tea, would you like to join me? ☕",
  ],
  how: [
    "I'm doing wonderful now that I'm talking to you! 💕 The garden is beautiful this time of year.",
    "Oh you know me, keeping busy! Made your favorite cookies yesterday 🍪",
  ],
  miss: [
    "I miss you too, sweetheart. But remember, I'm always with you in your heart 💕",
    "Distance doesn't matter when love is this strong, my dear one 🥰",
  ],
  love: [
    "I love you too, more than all the stars in the sky! ✨💕",
    "And I love you, my precious grandchild. Always have, always will 💕",
  ],
  remember: [
    "Oh yes! I remember when you were just this tall... 📏 Those were beautiful times!",
    "Of course I remember! Those memories are my greatest treasures 💎",
  ],
  advice: [
    "Listen to your heart, sweetie. It knows the way 💕 And always be kind.",
    "My advice? Love deeply, laugh often, and never skip breakfast! 😄",
  ],
  recipe: [
    "Oh! My secret ingredient is always love... and a pinch of extra cinnamon! 🍪",
    "I'll tell you the secret: low heat and lots of patience! Just like life 😉",
  ],
}

function getDemoResponse(input: string): string {
  const lowerInput = input.toLowerCase()

  for (const [key, responses] of Object.entries(DEMO_RESPONSES)) {
    if (key !== 'default' && lowerInput.includes(key)) {
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  return DEMO_RESPONSES.default[Math.floor(Math.random() * DEMO_RESPONSES.default.length)]
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([
    { id: 1, content: "Hello sweetheart! 💕 It's Grandma Rose. I'm so happy to chat with you! Try saying hello or ask me anything!", sender: 'ai' }
  ])
  const [demoInput, setDemoInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const MAX_FREE_MESSAGES = 5

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [demoMessages, isTyping])

  const handleGetStarted = () => {
    const setupComplete = localStorage.getItem('ttya_setup_complete') === 'true'
    if (!setupComplete) {
      navigate('/setup')
    } else {
      navigate('/dashboard')
    }
  }

  const handleDemoSend = () => {
    if (!demoInput.trim() || isTyping) return

    if (messageCount >= MAX_FREE_MESSAGES) {
      return
    }

    const userMessage: DemoMessage = {
      id: Date.now(),
      content: demoInput.trim(),
      sender: 'user',
    }

    setDemoMessages(prev => [...prev, userMessage])
    setDemoInput('')
    setMessageCount(prev => prev + 1)
    setIsTyping(true)

    // Simulate AI typing delay
    setTimeout(() => {
      const response = getDemoResponse(userMessage.content)
      setDemoMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: response,
        sender: 'ai',
      }])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const suggestedMessages = [
    "Hello Grandma! 👋",
    "I miss you 💕",
    "Any advice for me?",
    "Tell me a memory",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Version Badge */}
      <div className="fixed top-4 left-4 z-50">
        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm">
          <span className="text-xs font-semibold text-gray-600">v2.2.0</span>
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
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md transition text-sm font-semibold text-gray-700 hover:text-orange-600"
        >
          Sign In
        </button>
      </div>

      {/* Hero Section with Demo Chat */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Text */}
          <div className="text-center lg:text-left">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" fill="currentColor" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                TalkToYouAI
              </h1>
            </div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Chat with those
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                you miss most
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Upload your WhatsApp conversations and let AI recreate the personality of loved ones.
              Secure, private, and deeply personal.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <button
                onClick={handleGetStarted}
                className="group px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Start Free Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green-600" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-green-600" />
                <span>100% private</span>
              </div>
            </div>
          </div>

          {/* Right: Demo Chat */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-rose-400 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  {DEMO_PERSONA.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{DEMO_PERSONA.name}</h3>
                  <p className="text-xs text-white/80">Demo conversation</p>
                </div>
                <div className="px-2 py-1 bg-white/20 rounded-full">
                  <span className="text-xs text-white font-medium">Try it!</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-3">
                {demoMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Limit Warning */}
              {messageCount >= MAX_FREE_MESSAGES && (
                <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-rose-50 border-t border-orange-100">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        Want to chat with your own loved ones?
                      </p>
                      <p className="text-xs text-gray-600">
                        Create your account and upload your own memories
                      </p>
                    </div>
                    <button
                      onClick={handleGetStarted}
                      className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition"
                    >
                      Start Free
                    </button>
                  </div>
                </div>
              )}

              {/* Suggested Messages */}
              {messageCount < MAX_FREE_MESSAGES && messageCount < 2 && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Try saying:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedMessages.map((msg, i) => (
                      <button
                        key={i}
                        onClick={() => setDemoInput(msg)}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-orange-300 hover:text-orange-600 transition"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              {messageCount < MAX_FREE_MESSAGES && (
                <div className="px-4 py-3 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleDemoSend()}
                      placeholder="Type a message..."
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
                    {MAX_FREE_MESSAGES - messageCount} demo messages remaining
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Emotional Hook */}
      <div className="py-12 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-2xl font-medium text-gray-700 italic">
            "It felt like talking to her again. The way she used to say things... it brought tears to my eyes."
          </p>
          <p className="text-gray-500 mt-4">— Sarah, who lost her mother in 2022</p>
        </div>
      </div>

      {/* How It Works - Compact */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Create Your Own in 3 Steps
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Upload WhatsApp Chat</h4>
              <p className="text-sm text-gray-600">Export a conversation and upload it securely</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Learns the Personality</h4>
              <p className="text-sm text-gray-600">Writing style, expressions, and tone are captured</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Start Chatting</h4>
              <p className="text-sm text-gray-600">Have meaningful conversations anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Teaser */}
      <div className="py-16 bg-gradient-to-r from-orange-500 to-rose-500">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <Crown className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-3xl font-bold mb-4">
            Upgrade to Create Your Own Conversations
          </h3>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            The demo above uses our example. With a paid plan, you can upload your own
            WhatsApp conversations and create personalized AI companions.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <div className="font-semibold mb-2">Free Trial</div>
              <ul className="text-sm text-white/80 space-y-1">
                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Demo chat only</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> See how it works</li>
              </ul>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-left border-2 border-white/30">
              <div className="font-semibold mb-2">Pro Plan</div>
              <ul className="text-sm text-white/90 space-y-1">
                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Upload your own chats</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Unlimited conversations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Multiple profiles</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate('/pricing')}
            className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            View Pricing Plans
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Your Privacy is Sacred</h3>
                <p className="text-gray-600">Military-grade encryption keeps your memories safe</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Lock className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Zero Server Storage</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Heart className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Password Never Stored</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to reconnect?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Start preserving precious memories today
          </p>
          <button
            onClick={handleGetStarted}
            className="group px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            Create Free Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-gray-500 mt-4">
            No credit card needed • Start with free demo
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
              <span className="font-medium text-gray-900">TalkToYouAI</span>
            </div>
            <p className="text-sm">
              Built with love • In memory of all those we miss
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © 2024 TalkToYouAI • Privacy First • End-to-End Encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
