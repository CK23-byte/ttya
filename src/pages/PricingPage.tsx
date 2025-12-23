/**
 * Pricing Page - Subscription Plans & Credit Packs
 *
 * Features:
 * - 4 subscription tiers (Free, Starter, Pro, Premium) for text messaging
 * - Voice & Video credit packs as add-ons
 * - Monthly/yearly billing toggle
 * - Stripe checkout integration
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  Sparkles,
  MessageCircle,
  Users,
  Palette,
  Heart,
  ArrowRight,
  Shield,
  Zap,
  Crown,
  Upload,
  Brain,
  Coins
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import {
  SUBSCRIPTION_PLANS,
  UNIVERSAL_CREDIT_PACKS,
  redirectToCheckout,
  buyUniversalCredits,
  isStripeConfigured,
  arePaymentLinksConfigured,
  PlanType,
  UniversalCreditPackType,
  BillingPeriod
} from '../lib/stripe'
import { logger } from '../utils/logger'
import Header from '../components/Header'

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useSupabaseAuth()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (plan: PlanType) => {
    setError(null)

    if (plan === 'free') {
      navigate('/email-auth')
      return
    }

    if (!user) {
      navigate('/email-auth')
      return
    }

    if (!isStripeConfigured()) {
      setError('Stripe is nog niet geconfigureerd. Voeg je VITE_STRIPE_PUBLISHABLE_KEY toe aan .env')
      return
    }

    if (!arePaymentLinksConfigured()) {
      setError('Payment Links zijn nog niet geconfigureerd. Maak Payment Links aan in je Stripe Dashboard en voeg de URLs toe aan .env')
      return
    }

    const priceId = SUBSCRIPTION_PLANS[plan][billingPeriod].priceId

    setIsLoading(plan)

    try {
      await redirectToCheckout(priceId, user.email || undefined)
    } catch (err) {
      logger.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const handleBuyCredits = async (packType: UniversalCreditPackType) => {
    setError(null)

    if (!user) {
      navigate('/email-auth')
      return
    }

    if (!isStripeConfigured()) {
      setError('Stripe is not configured yet. Add your VITE_STRIPE_PUBLISHABLE_KEY to .env')
      return
    }

    if (!arePaymentLinksConfigured()) {
      setError('Payment Links not configured yet. Create Payment Links in your Stripe Dashboard and add the URLs to .env')
      return
    }

    setIsLoading(packType)

    try {
      await buyUniversalCredits(packType, user.email || undefined)
    } catch (err) {
      logger.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const getIconForFeature = (feature: string) => {
    // Credits-related features
    if (feature.toLowerCase().includes('credit')) return <Coins className="w-4 h-4" />

    // Communication types
    if (feature.toLowerCase().includes('text')) return <MessageCircle className="w-4 h-4" />
    if (feature.toLowerCase().includes('voice')) return <MessageCircle className="w-4 h-4" />
    if (feature.toLowerCase().includes('video')) return <MessageCircle className="w-4 h-4" />
    if (feature.toLowerCase().includes('chat')) return <MessageCircle className="w-4 h-4" />

    // Personalities and customization
    if (feature.toLowerCase().includes('personal') || feature.toLowerCase().includes('ai')) return <Users className="w-4 h-4" />
    if (feature.toLowerCase().includes('theme')) return <Palette className="w-4 h-4" />

    // Performance features
    if (feature.toLowerCase().includes('fast') || feature.toLowerCase().includes('response') || feature.toLowerCase().includes('priority')) return <Zap className="w-4 h-4" />
    if (feature.toLowerCase().includes('memory') || feature.toLowerCase().includes('extended')) return <Brain className="w-4 h-4" />

    // Data features
    if (feature.toLowerCase().includes('upload') || feature.toLowerCase().includes('archive')) return <Upload className="w-4 h-4" />
    if (feature.toLowerCase().includes('unlimited')) return <Sparkles className="w-4 h-4" />

    // Support
    if (feature.toLowerCase().includes('support')) return <Heart className="w-4 h-4" />

    // Default
    return <Check className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start for free, upgrade when you need more. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 bg-white rounded-full shadow-sm border border-gray-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                billingPeriod === 'yearly'
                  ? 'bg-white/20 text-white'
                  : 'bg-green-100 text-green-700'
              }`}>
                Save 17%
              </span>
            </button>
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

      {/* Monthly Subscriptions */}
      <section className="pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Monthly Plans
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            All plans include credits that work for text, voice, and video. Free tier includes text chat only.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Free</h3>
                <p className="text-gray-600 text-sm">Try it out</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {SUBSCRIPTION_PLANS.free.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      {getIconForFeature(feature)}
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/email-auth')}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition"
              >
                Get Started Free
              </button>
            </div>

            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Starter</h3>
                <p className="text-gray-600 text-sm">{SUBSCRIPTION_PLANS.starter.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ${billingPeriod === 'monthly'
                      ? SUBSCRIPTION_PLANS.starter.monthly.price
                      : (SUBSCRIPTION_PLANS.starter.yearly.price / 12).toFixed(2)}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-green-600 mt-1">
                    Billed ${SUBSCRIPTION_PLANS.starter.yearly.price}/year
                  </p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {SUBSCRIPTION_PLANS.starter.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      {getIconForFeature(feature)}
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('starter')}
                disabled={isLoading === 'starter'}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading === 'starter' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Subscribe <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {/* Pro Plan - Popular */}
            <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl shadow-xl p-6 flex flex-col relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Popular
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                <p className="text-white/80 text-sm">{SUBSCRIPTION_PLANS.pro.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ${billingPeriod === 'monthly'
                      ? SUBSCRIPTION_PLANS.pro.monthly.price
                      : (SUBSCRIPTION_PLANS.pro.yearly.price / 12).toFixed(2)}
                  </span>
                  <span className="text-white/70">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-white/80 mt-1">
                    Billed ${SUBSCRIPTION_PLANS.pro.yearly.price}/year
                  </p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {SUBSCRIPTION_PLANS.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/90">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white">
                      {getIconForFeature(feature)}
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('pro')}
                disabled={isLoading === 'pro'}
                className="w-full py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading === 'pro' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Subscribe to Pro <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 flex flex-col relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-amber-400 text-gray-900 text-xs font-semibold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Premium
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
                <p className="text-gray-400 text-sm">{SUBSCRIPTION_PLANS.premium.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ${billingPeriod === 'monthly'
                      ? SUBSCRIPTION_PLANS.premium.monthly.price
                      : (SUBSCRIPTION_PLANS.premium.yearly.price / 12).toFixed(2)}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-amber-400 mt-1">
                    Billed ${SUBSCRIPTION_PLANS.premium.yearly.price}/year
                  </p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {SUBSCRIPTION_PLANS.premium.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <div className="w-5 h-5 bg-amber-400/20 rounded-full flex items-center justify-center text-amber-400">
                      {getIconForFeature(feature)}
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('premium')}
                disabled={isLoading === 'premium'}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-xl font-semibold hover:from-amber-500 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading === 'premium' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Go Premium <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Packs - Only visible for logged-in users */}
      {user && (
      <section className="py-16 px-4 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 rounded-full text-sm font-medium mb-4">
              <Coins className="w-4 h-4" />
              Credit Packs
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Buy Credits On-Demand
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <strong>One-time purchase</strong> - Credits work for <strong>text chat, voice calls, AND video calls</strong>. Credits never expire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(UNIVERSAL_CREDIT_PACKS).map(([key, pack]) => (
              <div
                key={key}
                className={`rounded-2xl shadow-lg p-6 flex flex-col relative transition-all hover:shadow-xl ${
                  pack.popular
                    ? 'bg-gradient-to-br from-orange-500 to-rose-500 scale-105'
                    : pack.bestValue
                    ? 'bg-gradient-to-br from-orange-600 to-rose-600'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {pack.popular && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Popular
                  </div>
                )}
                {pack.bestValue && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Best Value
                  </div>
                )}

                <div className="mb-4">
                  <h3 className={`text-xl font-bold mb-1 ${pack.popular || pack.bestValue ? 'text-white' : 'text-gray-900'}`}>
                    {pack.name}
                  </h3>
                  <p className={`text-sm ${pack.popular || pack.bestValue ? 'text-white/80' : 'text-gray-600'}`}>
                    {pack.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${pack.popular || pack.bestValue ? 'text-white' : 'text-gray-900'}`}>
                      ${pack.price}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${pack.popular || pack.bestValue ? 'text-white/70' : 'text-gray-500'}`}>
                    ${pack.pricePerCredit.toFixed(2)} per credit
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1 text-sm">
                  <li className={`flex items-center gap-2 ${pack.popular || pack.bestValue ? 'text-white/90' : 'text-gray-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      pack.popular || pack.bestValue ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{pack.credits} universal credits</span>
                  </li>
                  <li className={`flex items-center gap-2 ${pack.popular || pack.bestValue ? 'text-white/90' : 'text-gray-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      pack.popular || pack.bestValue ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <MessageCircle className="w-3 h-3" />
                    </div>
                    <span>Works for text chat</span>
                  </li>
                  <li className={`flex items-center gap-2 ${pack.popular || pack.bestValue ? 'text-white/90' : 'text-gray-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      pack.popular || pack.bestValue ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <Zap className="w-3 h-3" />
                    </div>
                    <span>Works for voice calls</span>
                  </li>
                  <li className={`flex items-center gap-2 ${pack.popular || pack.bestValue ? 'text-white/90' : 'text-gray-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      pack.popular || pack.bestValue ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                    }`}>
                      <Crown className="w-3 h-3" />
                    </div>
                    <span>Works for video calls</span>
                  </li>
                  <li className={`flex items-center gap-2 ${pack.popular || pack.bestValue ? 'text-white/90' : 'text-gray-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      pack.popular || pack.bestValue ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Shield className="w-3 h-3" />
                    </div>
                    <span>Never expires</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleBuyCredits(key as UniversalCreditPackType)}
                  disabled={isLoading === key}
                  className={`w-full py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    pack.popular || pack.bestValue
                      ? 'bg-white text-orange-600 hover:bg-gray-50'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isLoading === key ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Buy Credits <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Credits can be used across all features. 1 credit = 1 text message, 5 seconds of voice, or 3 seconds of video.
            </p>
          </div>
        </div>
      </section>
      )}

      {/* Trust Badges */}
      <section className="py-12 px-4 border-t border-orange-100">
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
              <p className="text-sm text-gray-600">Start chatting immediately</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Cancel Anytime</h4>
              <p className="text-sm text-gray-600">No questions asked</p>
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
                How do credits work?
              </h3>
              <p className="text-gray-600">
                All plans include credits that can be used for text chat, voice calls, or video calls.
                1 credit = 1 text message, 5 seconds of voice, or 3 seconds of video. Higher tiers include more credits and unlock more AI personalities.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I buy extra credits without a subscription?
              </h3>
              <p className="text-gray-600">
                Yes! Once you have an account, you can purchase credit packs as one-time payments. These credits work for all features and never expire.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time from your account settings.
                You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What's included in the free plan?
              </h3>
              <p className="text-gray-600">
                The free plan includes 1 personality profile and 50 credits for text chat only.
                Upgrade to unlock voice & video calls, more credits, and additional personalities.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600">
                Your conversations and AI personalities are saved securely.
                They remain yours even after cancellation, and you can export them anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-500 to-rose-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to reconnect with loved ones?
          </h2>
          <p className="text-white/80 mb-8">
            Start your free trial today. No credit card required.
          </p>
          <button
            onClick={() => navigate('/email-auth')}
            className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-50 transition inline-flex items-center gap-2"
          >
            Start Free Trial
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
