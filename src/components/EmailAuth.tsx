/**
 * Email Authentication Component
 *
 * Sign up and sign in with email using Supabase Auth
 * Includes signup bonus credits and password reset
 */

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Heart, Gift, ArrowLeft } from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { CREDIT_PRICING } from '../types/database'
import { validatePassword, getPasswordStrength } from '../utils/validation'

// Import logos (you'll need to add these SVG components or use URLs)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)


type AuthMode = 'signin' | 'signup' | 'reset'

interface EmailAuthProps {
  onBack?: () => void
  onSuccess?: () => void
}

export default function EmailAuth({ onBack, onSuccess }: EmailAuthProps) {
  const { signIn, signUp, signInWithOAuth, resetPassword, isConfigured } = useSupabaseAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

  // Check for message from navigation state (e.g., email verified)
  useEffect(() => {
    const state = location.state as { message?: string } | null
    if (state?.message) {
      setMessage(state.message)
      setMode('signin') // Switch to sign in mode
      // Clear the state after reading it using React Router's navigate
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Email login not available
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Supabase is not configured. Please contact the administrator.
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)

    if (mode === 'signup' && value) {
      const { isValid, errors } = validatePassword(value)
      setPasswordErrors(errors)

      if (isValid) {
        const strength = getPasswordStrength(value)
        setPasswordStrength(strength)
      } else {
        setPasswordStrength(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      // Enhanced password validation
      const { isValid, errors } = validatePassword(password)
      if (!isValid) {
        setError(errors[0]) // Show first error
        setPasswordErrors(errors)
        return
      }
    }

    setIsLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message === 'Invalid login credentials'
            ? 'Invalid login credentials'
            : error.message)
        } else {
          onSuccess?.()
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName)
        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email address is already registered')
          } else {
            setError(error.message)
          }
        } else {
          setMessage('Check your email to confirm your account!')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Check your email for a password reset link')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
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
    setPasswordErrors([])
    setPasswordStrength(null)
  }

  const handleOAuthSignIn = async () => {
    setError('')
    setIsLoading(true)

    const { error } = await signInWithOAuth('google')

    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
    // If successful, user will be redirected to OAuth provider
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
              <span className="text-sm">Back</span>
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </h1>
            <p className="text-gray-600 text-sm">
              {mode === 'signin' && 'Log in with your email address'}
              {mode === 'signup' && 'Create a free account'}
              {mode === 'reset' && 'We will send you a reset link'}
            </p>
          </div>

          {/* Signup Bonus Banner */}
          {mode === 'signup' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Gift className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Welcome Bonus!</p>
                  <p className="text-xs">
                    Get {CREDIT_PRICING.SIGNUP_BONUS} free credits upon registration
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
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Name (optional)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password (not for reset) */}
            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder={mode === 'signup' ? 'Minimum 12 characters' : 'Your password'}
                    required
                    disabled={isLoading}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    aria-describedby={mode === 'signup' && passwordErrors.length > 0 ? 'password-errors' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>

                {/* Password Strength Indicator (signup only) */}
                {mode === 'signup' && password && (
                  <div className="mt-2">
                    {passwordStrength && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                              passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                              'w-full bg-green-500'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength === 'weak' ? 'text-red-600' :
                          passwordStrength === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {passwordStrength === 'weak' ? 'Weak' :
                           passwordStrength === 'medium' ? 'Medium' :
                           'Strong'}
                        </span>
                      </div>
                    )}

                    {/* Password Requirements */}
                    {passwordErrors.length > 0 && (
                      <div id="password-errors" className="text-xs text-gray-600 space-y-1" role="alert" aria-live="polite">
                        {passwordErrors.map((err, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-500 mt-0.5" aria-hidden="true">•</span>
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="Repeat your password"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
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
                  Loading...
                </span>
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Link'}
                </>
              )}
            </button>
          </form>

          {/* OAuth Providers */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleOAuthSignIn}
                  disabled={isLoading}
                  aria-label="Sign in with Google"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleIcon />
                  <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode Switchers */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => { resetForm(); setMode('signup') }}
                  className="w-full text-sm text-gray-600 hover:text-orange-600 transition"
                >
                  Don't have an account? <span className="font-medium">Sign Up</span>
                </button>
                <button
                  onClick={() => { resetForm(); setMode('reset') }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Forgot password?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                onClick={() => { resetForm(); setMode('signin') }}
                className="w-full text-sm text-gray-600 hover:text-orange-600 transition"
              >
                Already have an account? <span className="font-medium">Sign In</span>
              </button>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => { resetForm(); setMode('signin') }}
                className="w-full text-sm text-gray-600 hover:text-orange-600 transition"
              >
                Back to sign in
              </button>
            )}
          </div>

          {/* Credits Info */}
          {mode === 'signup' && (
            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>Credits are used for AI conversations.</p>
              <p>You can purchase more credits later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
