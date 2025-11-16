/**
 * Password Setup Component
 *
 * First-time setup for master password
 * Validates password strength and confirms password match
 */

import { useState } from 'react'
import { Eye, EyeOff, Lock, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { validatePassword } from '../utils/encryption'

export default function PasswordSetup() {
  const { setupMasterPassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    // Validate password
    const validation = validatePassword(password)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    // Check password match
    if (password !== confirmPassword) {
      setErrors(['Wachtwoorden komen niet overeen'])
      return
    }

    try {
      setIsLoading(true)
      await setupMasterPassword(password)
    } catch (error) {
      setErrors(['Er is een fout opgetreden. Probeer het opnieuw.'])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welkom bij TalkToYouAI
            </h1>
            <p className="text-gray-600 text-sm">
              Stel je master wachtwoord in om te beginnen
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Belangrijk</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Dit wachtwoord wordt <strong>nooit opgeslagen</strong></li>
                  <li>Alle gegevens worden versleuteld met dit wachtwoord</li>
                  <li>Als je dit wachtwoord vergeet, is je data <strong>niet te herstellen</strong></li>
                  <li>Bewaar het veilig - bijvoorbeeld in een wachtwoordmanager</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Wachtwoord
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
                  placeholder="Minimaal 12 tekens"
                  required
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bevestig Wachtwoord
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Herhaal je wachtwoord"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Wachtwoord vereisten:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className={password.length >= 12 ? 'text-green-600' : ''}>
                  ✓ Minimaal 12 tekens
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                  ✓ Kleine letters (a-z)
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                  ✓ Hoofdletters (A-Z)
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                  ✓ Cijfers (0-9)
                </li>
                <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : ''}>
                  ✓ Speciale tekens (!@#$%^&*)
                </li>
              </ul>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Instellen...' : 'Wachtwoord Instellen'}
            </button>
          </form>

          {/* Privacy Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Alle data wordt client-side versleuteld met AES-256-GCM.
              <br />
              Niets wordt naar onze servers gestuurd.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
