/**
 * Email Authentication Component
 *
 * Sign up and sign in with email using Supabase Auth
 * Includes signup bonus credits and password reset
 */

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Heart, Gift, ArrowLeft } from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { CREDIT_PRICING } from '../types/database'

type AuthMode = 'signin' | 'signup' | 'reset'

interface EmailAuthProps {
  onBack?: () => void
  onSuccess?: () => void
}

export default function EmailAuth({ onBack, onSuccess }: EmailAuthProps) {
  const { signIn, signUp, resetPassword, isConfigured } = useSupabaseAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              E-mail login niet beschikbaar
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Supabase is niet geconfigureerd. Neem contact op met de beheerder.
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Terug
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Wachtwoorden komen niet overeen')
        return
      }
      if (password.length < 8) {
        setError('Wachtwoord moet minimaal 8 tekens bevatten')
        return
      }
    }

    setIsLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message === 'Invalid login credentials'
            ? 'Ongeldige inloggegevens'
            : error.message)
        } else {
          onSuccess?.()
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName)
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Dit e-mailadres is al geregistreerd')
          } else {
            setError(error.message)
          }
        } else {
          setMessage('Check je e-mail om je account te bevestigen!')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Check je e-mail voor een wachtwoord reset link')
        }
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setDisplayName('')
    setError('')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Terug</span>
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {mode === 'signin' && 'Inloggen'}
              {mode === 'signup' && 'Account aanmaken'}
              {mode === 'reset' && 'Wachtwoord resetten'}
            </h1>
            <p className="text-gray-600 text-sm">
              {mode === 'signin' && 'Log in met je e-mailadres'}
              {mode === 'signup' && 'Maak een gratis account aan'}
              {mode === 'reset' && 'We sturen je een reset link'}
            </p>
          </div>

          {/* Signup Bonus Banner */}
          {mode === 'signup' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Gift className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Welkomstbonus!</p>
                  <p className="text-xs">
                    Ontvang {CREDIT_PRICING.SIGNUP_BONUS} gratis credits bij registratie
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam (optioneel)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="Je naam"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="jouw@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password (not for reset) */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder={mode === 'signup' ? 'Minimaal 8 tekens' : 'Je wachtwoord'}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bevestig wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="Herhaal je wachtwoord"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Bezig...
                </span>
              ) : (
                <>
                  {mode === 'signin' && 'Inloggen'}
                  {mode === 'signup' && 'Account aanmaken'}
                  {mode === 'reset' && 'Reset link versturen'}
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => { resetForm(); setMode('signup') }}
                  className="w-full text-sm text-gray-600 hover:text-orange-600 transition"
                >
                  Nog geen account? <span className="font-medium">Registreren</span>
                </button>
                <button
                  onClick={() => { resetForm(); setMode('reset') }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Wachtwoord vergeten?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                onClick={() => { resetForm(); setMode('signin') }}
                className="w-full text-sm text-gray-600 hover:text-orange-600 transition"
              >
                Al een account? <span className="font-medium">Inloggen</span>
              </button>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => { resetForm(); setMode('signin') }}
                className="w-full text-sm text-gray-600 hover:text-orange-600 transition"
              >
                Terug naar inloggen
              </button>
            )}
          </div>

          {/* Credits Info */}
          {mode === 'signup' && (
            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>Credits worden gebruikt voor AI-gesprekken.</p>
              <p>Je kunt later meer credits kopen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
