/**
 * Auth Choice Page
 *
 * Allows users to choose between local (master password) or cloud (email) authentication
 */

import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Smartphone, Cloud, ArrowLeft, Heart, Gift } from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { useAuth } from '../contexts/AuthContext'
import { CREDIT_PRICING } from '../types/database'

export default function AuthChoicePage() {
  const navigate = useNavigate()
  const { user: supabaseUser, isConfigured: supabaseConfigured } = useSupabaseAuth()
  const { isSetupComplete, isAuthenticated } = useAuth()

  // If already authenticated, redirect to dashboard
  if (supabaseUser || isAuthenticated) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="px-6 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </button>
      </header>

      <div className="flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Choose How to Sign In
            </h1>
            <p className="text-gray-600">
              Select the method that works best for you
            </p>
          </div>

          {/* Auth Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cloud Option - Email */}
            <button
              onClick={() => navigate('/email-auth')}
              disabled={!supabaseConfigured}
              className={`bg-white rounded-2xl shadow-lg p-6 text-left transition hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-orange-300 ${
                !supabaseConfigured ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl">
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-800">Email Account</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Sign in with your email and get access to the credit system
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Cloud className="w-4 h-4 text-blue-500" />
                      <span>Access on multiple devices</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Gift className="w-4 h-4 text-green-500" />
                      <span>{CREDIT_PRICING.SIGNUP_BONUS} free credits on signup</span>
                    </div>
                  </div>
                </div>
              </div>

              {!supabaseConfigured && (
                <p className="mt-4 text-xs text-gray-500 italic">
                  Email login is currently unavailable
                </p>
              )}
            </button>

            {/* Local Option - Master Password */}
            <button
              onClick={() => navigate(isSetupComplete ? '/login' : '/setup')}
              className="bg-white rounded-2xl shadow-lg p-6 text-left transition hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Local Password
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Maximum privacy with local encryption
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Smartphone className="w-4 h-4 text-purple-500" />
                      <span>Everything stays on this device</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>AES-256 encryption</span>
                    </div>
                  </div>
                </div>
              </div>

              {isSetupComplete && (
                <p className="mt-4 text-xs text-green-600 font-medium">
                  You already have a local account
                </p>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-8 bg-white/50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">
              <strong>Email account:</strong> Your data is securely stored in the cloud and you get access to the credit system.
              <br />
              <strong>Local password:</strong> Maximum privacy - all data stays on this device and is encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
