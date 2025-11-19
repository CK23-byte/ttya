/**
 * Login Screen Component
 *
 * Secure login with master password
 * Includes rate limiting and lockout protection
 */

import { useState } from 'react'
import { Eye, EyeOff, Lock, Heart, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginScreen() {
  const { login, resetAllData, loginAttempts, isLockedOut, lockoutEndsAt } = useAuth()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isLockedOut) {
      setError('Account temporarily locked. Please try again later.')
      return
    }

    try {
      setIsLoading(true)
      const result = await login(password)

      if (!result.success) {
        setError(result.error || 'Login failed')
        setPassword('')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getLockoutMessage = () => {
    if (!lockoutEndsAt) return ''
    const remainingSeconds = Math.max(0, Math.ceil((lockoutEndsAt - Date.now()) / 1000))
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your master password to continue
            </p>
          </div>

          {/* Lockout Warning */}
          {isLockedOut && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Account Locked</p>
                  <p>
                    Too many invalid attempts. Try again in{' '}
                    <span className="font-mono font-bold">{getLockoutMessage()}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                  required
                  disabled={isLockedOut || isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLockedOut}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && !isLockedOut && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  {loginAttempts === 1 && 'Incorrect password. 4 attempts remaining.'}
                  {loginAttempts === 2 && 'Incorrect password. 3 attempts remaining.'}
                  {loginAttempts === 3 && 'Incorrect password. 2 attempts remaining.'}
                  {loginAttempts === 4 && 'Last attempt! Account will be locked afterwards.'}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={resetAllData}
              className="w-full text-sm text-gray-600 hover:text-gray-800 transition"
            >
              Forgot password?
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Warning: This will permanently delete all data
            </p>
          </div>

          {/* Privacy Info */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>Your password is never stored.</p>
            <p>All data stays on this device.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
