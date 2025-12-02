/**
 * Living Legacy Page - Conversion-Optimized v2.4.0
 *
 * A conversion-focused landing page that guides users through understanding
 * Living Legacy with interactive preview questions and clear CTAs.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  ArrowRight,
  Shield,
  Users,
  Video,
  Mic,
  FileText,
  CheckCircle,
  Sparkles,
  Gift,
  BookOpen,
  Camera,
  Play,
  Star,
  ChevronRight,
  Baby
} from 'lucide-react'

export default function LivingLegacyPage() {
  const navigate = useNavigate()

  // Preview questions state
  const [selectedRecipient, setSelectedRecipient] = useState<string>('')
  const [selectedContent, setSelectedContent] = useState<string>('')
  const [selectedFormat, setSelectedFormat] = useState<string>('')
  const [showPreviewResult, setShowPreviewResult] = useState(false)

  const handleStartOnboarding = () => {
    // Always navigate to Living Legacy auth page first
    // (separate authentication from regular chat)
    localStorage.setItem('living-legacy-tier', 'complete')
    navigate('/living-legacy/auth')
  }

  const handlePreviewComplete = () => {
    setShowPreviewResult(true)
    setTimeout(() => {
      handleStartOnboarding()
    }, 2000)
  }

  const isPreviewComplete = selectedRecipient && selectedContent && selectedFormat

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Heart className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              TalkToYouAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={handleStartOnboarding}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition-all shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Compact & Clear */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 font-medium mb-6">
              <Sparkles className="w-5 h-5" />
              <span>Your voice, preserved forever</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Your{' '}
              <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                Living Legacy
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create your own digital legacy <strong>while you're still alive</strong>.
              Share your story, wisdom, and love with your loved ones - forever.
            </p>
          </div>

          {/* Visual Example Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Video Messages</h3>
              <p className="text-gray-600 text-sm">Record personal videos for your loved ones</p>
              <div className="mt-4 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Your Own Voice</h3>
              <p className="text-gray-600 text-sm">AI learns your voice, face, and personality</p>
              <div className="mt-4 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <div className="flex gap-1">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-1 bg-orange-400 rounded-full" style={{ height: `${Math.random() * 48 + 16}px` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Time Capsules</h3>
              <p className="text-gray-600 text-sm">Messages for future moments</p>
              <div className="mt-4 space-y-2">
                <div className="bg-orange-50 rounded-lg p-2 text-xs">
                  📅 Emma's 18th Birthday
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-xs">
                  💍 Tim's Wedding
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-xs">
                  👶 First Grandchild
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Preview Questions - KEY FEATURE */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Try It Now - Answer 3 Quick Questions
            </h2>
            <p className="text-xl text-gray-600">
              Discover how powerful a Living Legacy can be for you
            </p>
          </div>

          {/* Question 1: For whom? */}
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-8 mb-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Who are you creating this for?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'partner', label: 'My Partner', icon: Heart },
                { id: 'children', label: 'My Children', icon: Users },
                { id: 'grandchildren', label: 'Grandchildren', icon: Baby }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedRecipient(option.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRecipient === option.id
                      ? 'border-orange-500 bg-white shadow-lg scale-105'
                      : 'border-orange-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <option.icon className={`w-8 h-8 mx-auto mb-3 ${
                    selectedRecipient === option.id ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: What to share? */}
          <div className={`bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-8 mb-6 border-2 border-orange-200 transition-all ${
            !selectedRecipient ? 'opacity-50' : 'opacity-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900">What do you want to share most?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'lifestory', label: 'My Life Story', icon: BookOpen },
                { id: 'advice', label: 'Advice & Wisdom', icon: Sparkles },
                { id: 'timecapsules', label: 'Time Capsule Messages', icon: Gift }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectedRecipient && setSelectedContent(option.id)}
                  disabled={!selectedRecipient}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedContent === option.id
                      ? 'border-orange-500 bg-white shadow-lg scale-105'
                      : 'border-orange-200 bg-white hover:border-orange-300'
                  } ${!selectedRecipient ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option.icon className={`w-8 h-8 mx-auto mb-3 ${
                    selectedContent === option.id ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: How to express? */}
          <div className={`bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-8 mb-8 border-2 border-orange-200 transition-all ${
            !selectedContent ? 'opacity-50' : 'opacity-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900">How do you want to express yourself?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'text', label: 'Written Text', icon: FileText },
                { id: 'voice', label: 'Voice + Voice AI', icon: Mic },
                { id: 'video', label: 'Video + Avatar', icon: Video }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectedContent && setSelectedFormat(option.id)}
                  disabled={!selectedContent}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedFormat === option.id
                      ? 'border-orange-500 bg-white shadow-lg scale-105'
                      : 'border-orange-200 bg-white hover:border-orange-300'
                  } ${!selectedContent ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option.icon className={`w-8 h-8 mx-auto mb-3 ${
                    selectedFormat === option.id ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div className="font-semibold">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Result & CTA */}
          {isPreviewComplete && (
            <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-8 text-white text-center animate-fade-in">
              <Sparkles className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4">
                Perfect! This is what your Living Legacy could look like
              </h3>
              <p className="text-xl mb-2 opacity-90">
                📝 {selectedContent === 'lifestory' ? 'Life Story' : selectedContent === 'advice' ? 'Advice & Wisdom' : 'Time Capsule Messages'}
              </p>
              <p className="text-xl mb-2 opacity-90">
                👥 For: {selectedRecipient === 'partner' ? 'Your Partner' : selectedRecipient === 'children' ? 'Your Children' : 'Your Grandchildren'}
              </p>
              <p className="text-xl mb-6 opacity-90">
                🎬 Format: {selectedFormat === 'text' ? 'Written Text' : selectedFormat === 'voice' ? 'With Your Voice' : 'Video with Avatar'}
              </p>

              {showPreviewResult ? (
                <div className="text-lg">Redirecting to onboarding...</div>
              ) : (
                <button
                  onClick={handlePreviewComplete}
                  className="px-10 py-5 bg-white text-orange-600 rounded-xl font-bold text-xl hover:bg-orange-50 transition-all shadow-2xl inline-flex items-center gap-3"
                >
                  Start Your Living Legacy Now
                  <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* What is Living Legacy - Compact */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            The Difference from a Standard Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Profile */}
            <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-300">
              <h3 className="text-xl font-bold mb-4 text-gray-700">❌ Standard Profile</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Family collects data after passing</li>
                <li>• Only existing content</li>
                <li>• No control over your story</li>
                <li>• Subscription required</li>
              </ul>
            </div>

            {/* Living Legacy */}
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl p-6 border-2 border-orange-400 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-orange-700">✅ Living Legacy</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>You</strong> create your own legacy</li>
                <li>• Intentional recordings & messages</li>
                <li>• Full control over your story</li>
                <li>• One-time investment (€499-€1999)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            4 simple steps to your own Living Legacy
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: 'Start Onboarding',
                description: 'Answer questions about who you are and who you\'re creating this for',
                icon: Users
              },
              {
                step: 2,
                title: 'Record',
                description: 'Video, audio, or text - share your story the way you want',
                icon: Camera
              },
              {
                step: 3,
                title: 'Preview & Test',
                description: 'See how your legacy looks before you finalize it',
                icon: Play
              },
              {
                step: 4,
                title: 'Save & Secure',
                description: 'Get a notary link for activation after passing',
                icon: Shield
              }
            ].map((item) => (
              <div key={item.step} className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <item.icon className="w-8 h-8 text-orange-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleStartOnboarding}
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Use Cases / Examples */}
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Real Living Legacy Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah, 68',
                scenario: 'Palliative care',
                content: 'Left 47 video messages for her 3 children and 5 grandchildren. Including time capsules for future weddings.',
                quote: '"I know now that my grandchildren will always be able to hear me. That gives me so much peace."'
              },
              {
                name: 'Michael, 45',
                scenario: 'Young father',
                content: 'Proactively created a legacy for his 2 young children. With advice for their 18th, 21st, and 25th birthdays.',
                quote: '"As a father, I want to always be there. This gives me that certainty."'
              },
              {
                name: 'Eleanor, 72',
                scenario: 'Family historian',
                content: 'Shared her life story and family history spanning 4 generations. 12 hours of stories and wisdom.',
                quote: '"My great-grandchildren will know where they come from."'
              }
            ].map((example, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {example.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{example.name}</h3>
                    <p className="text-sm text-orange-600">{example.scenario}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{example.content}</p>
                <div className="bg-orange-50 rounded-lg p-4 italic text-gray-700 border-l-4 border-orange-400">
                  {example.quote}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleStartOnboarding}
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Your Story Deserves This Too
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Trusted by Hundreds of Families
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">500+</div>
              <p className="text-gray-600">Living Legacies Created</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">10,000+</div>
              <p className="text-gray-600">Messages Recorded</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">4.9/5</div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>

          <button
            onClick={handleStartOnboarding}
            className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
          >
            Be the Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Pricing Section - Compact */}
      <section id="pricing" className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            One-time investment, preserved forever
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Essential */}
            <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
              <h3 className="text-2xl font-bold mb-2">Essential</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">€499</div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>Text-based AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>50+ messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>5 family members</span>
                </li>
              </ul>
              <button
                onClick={handleStartOnboarding}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Complete - Popular */}
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl p-6 border-4 border-orange-500 relative transform scale-105 shadow-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Complete</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">€999</div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span><strong>Voice cloning</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span><strong>Video avatar</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>Unlimited messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>15 family members</span>
                </li>
              </ul>
              <button
                onClick={handleStartOnboarding}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">€1,999</div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span><strong>Professional recording</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>Ultra-realistic avatar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>Unlimited family</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>Concierge service</span>
                </li>
              </ul>
              <button
                onClick={handleStartOnboarding}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-rose-600 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-8">
            ✓ 50+ year hosting guarantee • ✓ AES-256 encryption • ✓ Always editable
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Story Deserves to Be Preserved
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Start your Living Legacy today. Ready to record in less than 30 minutes.
          </p>
          <button
            onClick={handleStartOnboarding}
            className="px-12 py-5 bg-white text-orange-600 rounded-xl font-bold text-xl hover:bg-orange-50 transition-all shadow-2xl inline-flex items-center gap-3"
          >
            Start for Free
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-sm mt-6 opacity-75">
            No credit card required • Start free • Pay only when finalizing
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold">TalkToYouAI Living Legacy</span>
          </div>
          <p className="text-gray-400 mb-4">
            Preserving love, wisdom, and memories for generations to come
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-orange-400 transition-colors">
              Home
            </button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-orange-400 transition-colors">
              Pricing
            </button>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Contact</span>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            © 2024 TalkToYouAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
