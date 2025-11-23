/**
 * Pricing Page - Subscription Plans
 *
 * Features:
 * - Monthly/yearly billing toggle
 * - Multiple subscription tiers
 * - Stripe checkout integration
 * - Free tier comparison
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  Sparkles,
  MessageCircle,
  Users,
  Palette,
  Headphones,
  Video,
  Mic,
  Heart,
  ArrowRight,
  Shield,
  Zap,
  Crown,
  ArrowLeft
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import {
  SUBSCRIPTION_PLANS,
  redirectToCheckout,
  isStripeConfigured,
  PlanType,
  BillingPeriod
} from '../lib/stripe'

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useSupabaseAuth()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (plan: PlanType) => {
    setError(null)

    if (!user) {
      navigate('/auth')
      return
    }

    if (!isStripeConfigured()) {
      setError('Payment system is being configured. Please try again later.')
      return
    }

    const priceId = SUBSCRIPTION_PLANS[plan][billingPeriod].priceId

    if (!priceId) {
      setError('This plan is not yet available. Please contact support.')
      return
    }

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

  const getIconForFeature = (feature: string) => {
    if (feature.includes('message')) return <MessageCircle className="w-4 h-4" />
    if (feature.includes('personalit')) return <Users className="w-4 h-4" />
    if (feature.includes('theme')) return <Palette className="w-4 h-4" />
    if (feature.includes('support')) return <Headphones className="w-4 h-4" />
    if (feature.includes('Video')) return <Video className="w-4 h-4" />
    if (feature.includes('Voice')) return <Mic className="w-4 h-4" />
    return <Check className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">TalkToYouAI</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
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
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
            {error}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 text-sm">Try it out</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-gray-500" />
                  </div>
                  <span>50 messages total</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-3 h-3 text-gray-500" />
                  </div>
                  <span>2 AI personalities</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                    <Palette className="w-3 h-3 text-gray-500" />
                  </div>
                  <span>All chat themes</span>
                </li>
              </ul>

              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition"
              >
                Get Started Free
              </button>
            </div>

            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {SUBSCRIPTION_PLANS.starter.name}
                </h3>
                <p className="text-gray-600 text-sm">{SUBSCRIPTION_PLANS.starter.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${billingPeriod === 'monthly'
                      ? SUBSCRIPTION_PLANS.starter.monthly.price
                      : (SUBSCRIPTION_PLANS.starter.yearly.price / 12).toFixed(2)}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-green-600 mt-1">
                    Billed ${SUBSCRIPTION_PLANS.starter.yearly.price}/year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {SUBSCRIPTION_PLANS.starter.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
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
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl shadow-xl p-8 flex flex-col relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Most Popular
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {SUBSCRIPTION_PLANS.pro.name}
                </h3>
                <p className="text-white/80 text-sm">{SUBSCRIPTION_PLANS.pro.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${billingPeriod === 'monthly'
                      ? SUBSCRIPTION_PLANS.pro.monthly.price
                      : (SUBSCRIPTION_PLANS.pro.yearly.price / 12).toFixed(2)}
                  </span>
                  <span className="text-white/70">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-white/80 mt-1">
                    Billed ${SUBSCRIPTION_PLANS.pro.yearly.price}/year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {SUBSCRIPTION_PLANS.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90">
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
                  <>
                    Subscribe to Pro
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
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
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time from your account page.
                You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express),
                as well as Apple Pay and Google Pay through our secure payment provider Stripe.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I switch between monthly and yearly billing?
              </h3>
              <p className="text-gray-600">
                Yes! You can switch between billing periods at any time. If you switch to yearly,
                you'll save 17% compared to monthly billing.
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

            <div className="pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee for first-time subscribers.
                If you're not satisfied, contact us within 7 days for a full refund.
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
