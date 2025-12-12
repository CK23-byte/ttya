/**
 * Pricing Page - Subscription Plans & Credit Packs
 *
 * Features:
 * - 4 subscription tiers (Free, Starter, Pro, Premium)
 * - Voice & Video credit packs
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
  Phone,
  Video,
  Upload,
  Brain,
  Clock
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import {
  SUBSCRIPTION_PLANS,
  VOICE_CREDIT_PACKS,
  VIDEO_CREDIT_PACKS,
  redirectToCheckout,
  buyVoiceCredits,
  buyVideoCredits,
  isStripeConfigured,
  arePaymentLinksConfigured,
  PlanType,
  VoiceCreditPackType,
  VideoCreditPackType,
  BillingPeriod
} from '../lib/stripe'
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
      navigate('/auth')
      return
    }

    if (!user) {
      navigate('/auth')
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
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const handleBuyVoiceCredits = async (pack: VoiceCreditPackType) => {
    setError(null)

    if (!user) {
      navigate('/auth')
      return
    }

    setIsLoading(`voice_${pack}`)

    try {
      await buyVoiceCredits(pack, user.email || undefined)
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const handleBuyVideoCredits = async (pack: VideoCreditPackType) => {
    setError(null)

    if (!user) {
      navigate('/auth')
      return
    }

    setIsLoading(`video_${pack}`)

    try {
      await buyVideoCredits(pack, user.email || undefined)
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const getIconForFeature = (feature: string) => {
    if (feature.toLowerCase().includes('message')) return <MessageCircle className="w-4 h-4" />
    if (feature.toLowerCase().includes('personal')) return <Users className="w-4 h-4" />
    if (feature.toLowerCase().includes('theme')) return <Palette className="w-4 h-4" />
    if (feature.toLowerCase().includes('memory')) return <Brain className="w-4 h-4" />
    if (feature.toLowerCase().includes('fast') || feature.toLowerCase().includes('response')) return <Zap className="w-4 h-4" />
    if (feature.toLowerCase().includes('upload') || feature.toLowerCase().includes('archive')) return <Upload className="w-4 h-4" />
    if (feature.toLowerCase().includes('support')) return <Heart className="w-4 h-4" />
    return <Check className="w-4 h-4" />
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
            Simple, transparent pricing
          </div>

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

      {/* Text Chat Plans */}
      <section className="pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Text Chat Subscriptions
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Free</h3>
                <p className="text-gray-600 text-sm">Try it out</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">€0</span>
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
                onClick={() => navigate('/auth')}
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
                    €{billingPeriod === 'monthly'
                      ? SUBSCRIPTION_PLANS.starter.monthly.price
                      : (SUBSCRIPTION_PLANS.starter.yearly.price / 12).toFixed(2)}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-green-600 mt-1">
                    Billed €{SUBSCRIPTION_PLANS.starter.yearly.price}/year
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
                    €{billingPeriod === 'monthly'
                      ? SUBSCRIPTION_PLANS.pro.monthly.price
                      : (SUBSCRIPTION_PLANS.pro.yearly.price / 12).toFixed(2)}
                  </span>
                  <span className="text-white/70">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-white/80 mt-1">
                    Billed €{SUBSCRIPTION_PLANS.pro.yearly.price}/year
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
                    €{billingPeriod === 'monthly'
                      ? SUBSCRIPTION_PLANS.premium.monthly.price
                      : (SUBSCRIPTION_PLANS.premium.yearly.price / 12).toFixed(2)}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-amber-400 mt-1">
                    Billed €{SUBSCRIPTION_PLANS.premium.yearly.price}/year
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

      {/* Voice Credits */}
      <section className="py-12 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
              <Phone className="w-4 h-4" />
              Voice Add-on
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Voice Call Credits
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Buy credits for voice calls. 1 credit = 1 minute of voice call time.
              Works with any subscription plan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Voice Small Pack */}
            <div className="bg-white rounded-2xl border border-orange-200 p-6 flex flex-col hover:shadow-lg transition">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{VOICE_CREDIT_PACKS.small.name}</h3>
                <p className="text-gray-500 text-sm">Perfect to try it out</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">€{VOICE_CREDIT_PACKS.small.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  €{VOICE_CREDIT_PACKS.small.pricePerCredit.toFixed(2)} per minute
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>{VOICE_CREDIT_PACKS.small.credits} minutes</span>
                </div>
              </div>

              <button
                onClick={() => handleBuyVoiceCredits('small')}
                disabled={isLoading === 'voice_small'}
                className="w-full py-3 border-2 border-orange-200 text-orange-700 rounded-xl font-medium hover:bg-orange-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'voice_small' ? 'Processing...' : 'Buy Voice Credits'}
              </button>
            </div>

            {/* Voice Medium Pack - Popular */}
            <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl shadow-xl p-6 flex flex-col relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Most Popular
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{VOICE_CREDIT_PACKS.medium.name}</h3>
                <p className="text-white/80 text-sm">Best for regular use</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">€{VOICE_CREDIT_PACKS.medium.price}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  €{VOICE_CREDIT_PACKS.medium.pricePerCredit.toFixed(2)} per minute
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{VOICE_CREDIT_PACKS.medium.credits} minutes</span>
                </div>
              </div>

              <button
                onClick={() => handleBuyVoiceCredits('medium')}
                disabled={isLoading === 'voice_medium'}
                className="w-full py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'voice_medium' ? 'Processing...' : 'Buy Voice Credits'}
              </button>
            </div>

            {/* Voice Large Pack - Best Value */}
            <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 flex flex-col relative hover:shadow-lg transition">
              <div className="absolute top-3 right-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Best Value
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{VOICE_CREDIT_PACKS.large.name}</h3>
                <p className="text-gray-500 text-sm">For power users</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">€{VOICE_CREDIT_PACKS.large.price}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  €{VOICE_CREDIT_PACKS.large.pricePerCredit.toFixed(2)} per minute - Save 20%!
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>{VOICE_CREDIT_PACKS.large.credits} minutes</span>
                </div>
              </div>

              <button
                onClick={() => handleBuyVoiceCredits('large')}
                disabled={isLoading === 'voice_large'}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'voice_large' ? 'Processing...' : 'Buy Voice Credits'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Credits */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
              <Video className="w-4 h-4" />
              Video Add-on
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Video Call Credits
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Buy credits for video calls. 1 credit = 1 minute of video call time.
              Works with any subscription plan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Video Small Pack */}
            <div className="bg-white rounded-2xl border border-orange-200 p-6 flex flex-col hover:shadow-lg transition">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{VIDEO_CREDIT_PACKS.small.name}</h3>
                <p className="text-gray-500 text-sm">Perfect to try it out</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">€{VIDEO_CREDIT_PACKS.small.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  €{VIDEO_CREDIT_PACKS.small.pricePerCredit.toFixed(2)} per minute
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>{VIDEO_CREDIT_PACKS.small.credits} minutes</span>
                </div>
              </div>

              <button
                onClick={() => handleBuyVideoCredits('small')}
                disabled={isLoading === 'video_small'}
                className="w-full py-3 border-2 border-orange-200 text-orange-700 rounded-xl font-medium hover:bg-orange-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'video_small' ? 'Processing...' : 'Buy Video Credits'}
              </button>
            </div>

            {/* Video Medium Pack - Popular */}
            <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl shadow-xl p-6 flex flex-col relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Most Popular
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{VIDEO_CREDIT_PACKS.medium.name}</h3>
                <p className="text-white/80 text-sm">Best for regular use</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">€{VIDEO_CREDIT_PACKS.medium.price}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  €{VIDEO_CREDIT_PACKS.medium.pricePerCredit.toFixed(2)} per minute
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{VIDEO_CREDIT_PACKS.medium.credits} minutes</span>
                </div>
              </div>

              <button
                onClick={() => handleBuyVideoCredits('medium')}
                disabled={isLoading === 'video_medium'}
                className="w-full py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'video_medium' ? 'Processing...' : 'Buy Video Credits'}
              </button>
            </div>

            {/* Video Large Pack - Best Value */}
            <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 flex flex-col relative hover:shadow-lg transition">
              <div className="absolute top-3 right-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Best Value
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{VIDEO_CREDIT_PACKS.large.name}</h3>
                <p className="text-gray-500 text-sm">For power users</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">€{VIDEO_CREDIT_PACKS.large.price}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  €{VIDEO_CREDIT_PACKS.large.pricePerCredit.toFixed(2)} per minute - Save 20%!
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>{VIDEO_CREDIT_PACKS.large.credits} minutes</span>
                </div>
              </div>

              <button
                onClick={() => handleBuyVideoCredits('large')}
                disabled={isLoading === 'video_large'}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === 'video_large' ? 'Processing...' : 'Buy Video Credits'}
              </button>
            </div>
          </div>
        </div>
      </section>

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
                What's the difference between subscriptions and credits?
              </h3>
              <p className="text-gray-600">
                Subscriptions give you access to text chat with your AI personalities.
                Credits are used for voice and video calls - each credit equals 1 minute of call time.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time from your account page.
                You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Do credits expire?
              </h3>
              <p className="text-gray-600">
                No, your voice and video credits never expire. Use them whenever you want.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600">
                Your conversations and AI personalities are stored locally on your device
                with end-to-end encryption. They remain yours even after cancellation.
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
            onClick={() => navigate('/auth')}
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
