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
  LogOut,
  User,
  Mail,
  Crown,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { CREDIT_PRICING } from '../types/database'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, profile, credits, signOut, isConfigured } = useSupabaseAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
    navigate('/')
  }

  const handleBuyCredits = async (packageId: string) => {
    // TODO: Implement Stripe checkout
    alert(`Stripe checkout voor ${packageId} komt binnenkort!`)
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
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Terug</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Mijn Account</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {profile?.display_name || 'Gebruiker'}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Uitloggen</span>
          </button>
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8" />
              <div>
                <p className="text-white/80 text-sm">Huidige saldo</p>
                <p className="text-3xl font-bold">{credits} credits</p>
              </div>
            </div>
            <Crown className="w-12 h-12 text-white/30" />
          </div>

          <div className="bg-white/20 rounded-lg p-3 text-sm">
            <p className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>1 credit = ~1 AI bericht</span>
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
