/**
 * Pricing Page - Unified Credit System
 *
 * Features:
 * - Single unified credit type
 * - 10 credits = 500 messages OR 5min voice OR 1min video
 * - Simple credit packs
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  MessageCircle,
  Heart,
  ArrowRight,
  Shield,
  Zap,
  Crown,
  Phone,
  Video,
  Check,
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { UNIFIED_CREDIT_PACKS, UnifiedCreditPackType } from '../utils/unifiedCredits'
import Header from '../components/Header'

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useSupabaseAuth()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleBuyCredits = async (pack: UnifiedCreditPackType) => {
    setError(null)

    if (!user) {
      navigate('/email-auth')
      return
    }

    setIsLoading(pack)

    // TODO: Implement Stripe checkout when ready
    setError('Payment integration coming soon. For now, please contact support.')
    setIsLoading(null)

    // When Stripe is ready:
    // try {
    //   await redirectToCheckout(UNIFIED_CREDIT_PACKS[pack].priceId, user.email || undefined)
    // } catch (err) {
    //   console.error('Checkout error:', err)
    //   setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    // } finally {
    //   setIsLoading(null)
    // }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, unified pricing
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            One Credit Type, Unlimited Possibilities
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Buy credits once, use them for text, voice, or video. Your choice.
          </p>

          {/* What Credits Can Do */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-orange-100">
              <MessageCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">10 credits</p>
              <p className="text-sm text-gray-600">500 messages</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-orange-100">
              <Phone className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">10 credits</p>
              <p className="text-sm text-gray-600">5 minutes voice</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-orange-100">
              <Video className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">10 credits</p>
              <p className="text-sm text-gray-600">1 minute video</p>
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center whitespace-pre-line">
            {error}
          </div>
        </div>
      )}

      {/* Credit Packs */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Choose Your Credit Pack
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              All packs include the same flexible credits. Use them however you want.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter Pack */}
            <div className="bg-white rounded-2xl border border-orange-200 p-6 flex flex-col hover:shadow-lg transition">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{UNIFIED_CREDIT_PACKS.starter.name}</h3>
                <p className="text-gray-500 text-sm">{UNIFIED_CREDIT_PACKS.starter.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">${UNIFIED_CREDIT_PACKS.starter.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {UNIFIED_CREDIT_PACKS.starter.credits} credits
                </p>
              </div>

              <div className="mb-6 space-y-2 text-sm text-gray-600">
                {UNIFIED_CREDIT_PACKS.starter.examples.map((example, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>{example}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleBuyCredits('starter')}
                disabled={isLoading === 'starter'}
                className="w-full py-3 border-2 border-orange-200 text-orange-700 rounded-xl font-medium hover:bg-orange-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'starter' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Buy Credits</>
                )}
              </button>
            </div>

            {/* Basic Pack */}
            <div className="bg-white rounded-2xl border border-orange-200 p-6 flex flex-col hover:shadow-lg transition">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{UNIFIED_CREDIT_PACKS.basic.name}</h3>
                <p className="text-gray-500 text-sm">{UNIFIED_CREDIT_PACKS.basic.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">${UNIFIED_CREDIT_PACKS.basic.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {UNIFIED_CREDIT_PACKS.basic.credits} credits
                </p>
              </div>

              <div className="mb-6 space-y-2 text-sm text-gray-600">
                {UNIFIED_CREDIT_PACKS.basic.examples.map((example, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>{example}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleBuyCredits('basic')}
                disabled={isLoading === 'basic'}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'basic' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Buy Credits</>
                )}
              </button>
            </div>

            {/* Popular Pack */}
            <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl shadow-xl p-6 flex flex-col relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Popular
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{UNIFIED_CREDIT_PACKS.popular.name}</h3>
                <p className="text-white/80 text-sm">{UNIFIED_CREDIT_PACKS.popular.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">${UNIFIED_CREDIT_PACKS.popular.price}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  {UNIFIED_CREDIT_PACKS.popular.credits} credits
                </p>
              </div>

              <div className="mb-6 space-y-2 text-sm text-white/90">
                {UNIFIED_CREDIT_PACKS.popular.examples.map((example, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    <span>{example}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleBuyCredits('popular')}
                disabled={isLoading === 'popular'}
                className="w-full py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'popular' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Buy Credits</>
                )}
              </button>
            </div>

            {/* Pro Pack - Best Value */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 flex flex-col relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                Best Value
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{UNIFIED_CREDIT_PACKS.pro.name}</h3>
                <p className="text-gray-400 text-sm">{UNIFIED_CREDIT_PACKS.pro.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">${UNIFIED_CREDIT_PACKS.pro.price}</span>
                </div>
                <p className="text-xs text-green-400 mt-1">
                  {UNIFIED_CREDIT_PACKS.pro.credits} credits - Save 40%!
                </p>
              </div>

              <div className="mb-6 space-y-2 text-sm text-gray-300">
                {UNIFIED_CREDIT_PACKS.pro.examples.map((example, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{example}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleBuyCredits('pro')}
                disabled={isLoading === 'pro'}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'pro' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Buy Credits</>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How Credits Work
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Text Messages</h3>
              <p className="text-gray-600 text-sm">
                1 credit = 50 messages<br />
                Perfect for long conversations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Voice Calls</h3>
              <p className="text-gray-600 text-sm">
                1 credit = 30 seconds<br />
                Hear their voice again
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Video Calls</h3>
              <p className="text-gray-600 text-sm">
                1 credit = 6 seconds<br />
                See them like they're there
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Secure Payments</h4>
              <p className="text-sm text-gray-600">Powered by Stripe</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Instant Access</h4>
              <p className="text-sm text-gray-600">Credits added immediately</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Never Expires</h4>
              <p className="text-sm text-gray-600">Use credits anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                How do I use my credits?
              </h3>
              <p className="text-gray-600">
                Credits are automatically deducted when you send messages, make voice calls, or start video calls.
                You choose how to spend them - all credits work for all features.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Do credits expire?
              </h3>
              <p className="text-gray-600">
                No! Your credits never expire. Buy them once and use them whenever you want.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I get a refund?
              </h3>
              <p className="text-gray-600">
                We offer refunds within 7 days of purchase if you haven't used any credits yet.
                Contact our support team for assistance.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                How are credits calculated for messages?
              </h3>
              <p className="text-gray-600">
                Each message costs a small fraction of a credit (0.02 credits per message).
                This means 1 credit = 50 messages, or 10 credits = 500 messages.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my data if I run out of credits?
              </h3>
              <p className="text-gray-600">
                All your conversations, AI personalities, and memories are saved.
                Simply buy more credits to continue using the service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-500 to-rose-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to reconnect?
          </h2>
          <p className="text-white/80 mb-8">
            Get started with just 10 credits and experience the magic.
          </p>
          <button
            onClick={() => user ? handleBuyCredits('starter') : navigate('/email-auth')}
            className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-50 transition inline-flex items-center gap-2"
          >
            {user ? 'Buy Credits' : 'Sign Up Free'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span className="text-white font-semibold">TalkToYouAI</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} TalkToYouAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
