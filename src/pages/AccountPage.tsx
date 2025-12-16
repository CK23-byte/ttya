/**
 * Account Page
 *
 * Shows user account info, credits balance, and purchase options
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  Coins,
  Gift,
  History,
  User,
  Mail,
  Crown,
  Sparkles,
  ExternalLink,
  Key,
  Lock,
  Edit3,
  Check,
  X,
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { CREDIT_PRICING } from '../types/database'
import Header from '../components/Header'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, profile, credits, isConfigured } = useSupabaseAuth()

  // Profile editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')

  // Password change
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleBuyCredits = async (packageId: string) => {
    // TODO: Implement Stripe checkout
    alert(`Stripe checkout voor ${packageId} komt binnenkort!`)
  }

  const handleSaveName = async () => {
    // TODO: Implement saving display name to Supabase profile
    setIsEditingName(false)
    alert('Display name opslaan komt binnenkort!')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Nieuwe wachtwoorden komen niet overeen')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Wachtwoord moet minimaal 8 tekens zijn')
      return
    }

    // TODO: Implement password change with Supabase
    setPasswordSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setIsChangingPassword(false)

    alert('Wachtwoord wijzigen komt binnenkort!')
  }

  // Redirect if not logged in with Supabase
  if (!user || !isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Niet ingelogd
          </h2>
          <p className="text-gray-600 mb-6">
            Log in met je e-mailadres om je account te bekijken.
          </p>
          <button
            onClick={() => navigate('/email-auth')}
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition"
          >
            Inloggen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <Header variant="transparent" />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Terug naar Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Beheer je profiel, wachtwoord en abonnement</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            Profiel Informatie
          </h3>

          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weergavenaam</label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Je naam"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{profile?.display_name || 'Geen naam ingesteld'}</span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Bewerken</span>
                  </button>
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mailadres</label>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-500" />
            Wachtwoord Wijzigen
          </h3>

          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Wachtwoord wijzigen
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Huidig wachtwoord</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nieuw wachtwoord</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bevestig nieuw wachtwoord</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  minLength={8}
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Wachtwoord succesvol gewijzigd!
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Opslaan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Annuleren
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Subscription Management Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            Abonnement Beheren
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Huidige plan</span>
                <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                  Free
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Je gebruikt momenteel het gratis plan met basisfeatures.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/pricing')}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade naar Pro
              </button>
              <button
                onClick={() => alert('Abonnement annuleren komt binnenkort!')}
                className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8" />
              <div>
                <p className="text-white/80 text-sm">Totaal saldo</p>
                <p className="text-3xl font-bold">{credits} credits</p>
              </div>
            </div>
            <Crown className="w-12 h-12 text-white/30" />
          </div>

          {/* Credit Breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Text Credits */}
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{profile?.text_credits || 0}</p>
              <p className="text-white/80 text-xs mt-1">💬 Text</p>
              <p className="text-white/60 text-xs">(messages)</p>
            </div>

            {/* Voice Credits */}
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{profile?.voice_credits || 0}</p>
              <p className="text-white/80 text-xs mt-1">🎙️ Voice</p>
              <p className="text-white/60 text-xs">({Math.floor((profile?.voice_credits || 0) / 2)}min)</p>
            </div>

            {/* Video Credits */}
            <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{profile?.video_credits || 0}</p>
              <p className="text-white/80 text-xs mt-1">📹 Video</p>
              <p className="text-white/60 text-xs">({Math.floor((profile?.video_credits || 0) / 5)}min)</p>
            </div>
          </div>

          <div className="bg-white/20 rounded-lg p-3 text-sm">
            <p className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Text: 1 credit/msg • Voice: 2 credits/min • Video: 5 credits/min</span>
            </p>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-500" />
            Credits Kopen
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {CREDIT_PRICING.PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleBuyCredits(pkg.id)}
                className={`relative p-4 rounded-xl border-2 transition hover:shadow-md text-left ${
                  pkg.popular
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2 right-3 px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                    Populair
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {pkg.credits}
                  </span>
                  <CreditCard className="w-5 h-5 text-gray-400" />
                </div>

                <p className="text-sm text-gray-600 mb-2">credits</p>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-orange-600">
                    €{pkg.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    (€{(pkg.price / pkg.credits).toFixed(3)}/credit)
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Veilig betalen via Stripe. Je credits worden direct bijgeschreven.
          </p>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Transactiegeschiedenis
          </h3>

          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nog geen transacties</p>
            <p className="text-xs text-gray-400 mt-1">
              Je transacties verschijnen hier na je eerste aankoop
            </p>
          </div>
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Hulp nodig? Bekijk onze FAQ</span>
          </a>
        </div>
      </main>
    </div>
  )
}
