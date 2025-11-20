/**
 * Landing Page - English Version
 *
 * Beautiful, empathetic landing page for TalkToYouAI
 */

import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Lock,
  MessageCircle,
  Shield,
  Upload,
  UserPlus,
  Video,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    // Check if setup is complete
    const setupComplete = localStorage.getItem('ttya_setup_complete') === 'true'

    if (!setupComplete) {
      // New user - go to setup
      navigate('/setup')
    } else {
      // Existing user - go to dashboard (will redirect to login if needed)
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Version Badge */}
      <div className="fixed top-4 left-4 z-50">
        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm">
          <span className="text-xs font-semibold text-gray-600">v2.1.0</span>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => navigate('/pricing')}
          className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md transition text-sm font-semibold text-gray-700 hover:text-purple-600"
        >
          Pricing
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md transition text-sm font-semibold text-gray-700 hover:text-purple-600"
        >
          Sign In
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TalkToYouAI
              </h1>
            </div>

            {/* Headline */}
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Stay connected with
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                those you miss
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              A secure, privacy-first app that uses AI to preserve the personality
              of loved ones. Chat, share memories, and feel the connection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                Sign In
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                <span>100% privacy</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <span>Built with respect</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              In just 3 simple steps you can start preserving memories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-purple-600 mb-2">STEP 1</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Upload Memories
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Import WhatsApp chats, photos, and audio. Everything is stored encrypted.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-pink-600 mb-2">STEP 2</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Create a Profile
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  AI analyzes writing style, humor, and personality from your uploads.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-semibold text-blue-600 mb-2">STEP 3</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Start Chatting
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Talk with the AI as if you're talking to your loved one. Warm and familiar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why TalkToYouAI?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with privacy, security, and empathy as core values
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                AES-256 Encryption
              </h4>
              <p className="text-gray-600 text-sm">
                All data is encrypted client-side. Nobody can read your memories.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Zero Server Storage
              </h4>
              <p className="text-gray-600 text-sm">
                Everything stays local in your browser. Full control over your data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                WhatsApp-Style Chat
              </h4>
              <p className="text-gray-600 text-sm">
                Familiar interface where you instantly feel at home.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                AI Personality Analysis
              </h4>
              <p className="text-gray-600 text-sm">
                Claude AI learns from real messages for authentic responses.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Video Calls (Coming Soon)
              </h4>
              <p className="text-gray-600 text-sm">
                Animated video conversations for an even deeper connection.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Built with Respect
              </h4>
              <p className="text-gray-600 text-sm">
                A digital memory, not a replacement. Empathetic and thoughtful.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-6 opacity-90" />
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Your Privacy is Sacred
          </h3>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            TalkToYouAI stores your memories with military-grade encryption.
            Your master password is never stored, and only you have access to your data.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-white">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 mb-3" />
              <div className="font-semibold">No Tracking</div>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 mb-3" />
              <div className="font-semibold">No Analytics</div>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 mb-3" />
              <div className="font-semibold">Open Source</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to get started?
          </h3>
          <p className="text-xl text-gray-600 mb-10">
            Start preserving precious memories today
          </p>
          <button
            onClick={handleGetStarted}
            className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            Create Free Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-gray-500 mt-6">
            No credit card needed • 100% free • Privacy guaranteed
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
              <span className="font-medium text-gray-900">TalkToYouAI</span>
            </div>
            <p className="text-sm">
              Built with love • In memory of all those we miss
            </p>
            <p className="text-xs text-gray-500 mt-4">
              © 2024 TalkToYouAI • Privacy First • End-to-End Encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
