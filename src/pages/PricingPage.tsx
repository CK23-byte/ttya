/**
 * Pricing Page
 *
 * Standalone pricing page with all subscription tiers
 */

import { useNavigate } from 'react-router-dom'
import { Check, Crown, Zap, Heart, ArrowLeft } from 'lucide-react'
import { usePayment } from '../contexts/PaymentContext'

export default function PricingPage() {
  const navigate = useNavigate()
  const { updateSubscription } = usePayment()

  const handleSubscribe = async (plan: 'free' | 'pro' | 'lifetime') => {
    try {
      await updateSubscription(plan)
      // Navigate to chat after subscription
      navigate('/dashboard')
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Version Badge */}
      <div className="fixed top-4 left-4 z-50">
        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm">
          <span className="text-xs font-semibold text-gray-600">v2.3.0</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-8 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Heart className="w-8 h-8" fill="currentColor" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Start preserving precious memories today. All plans include end-to-end encryption and privacy-first features.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition shadow-lg">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
                <Heart className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 text-lg">/forever</span>
              </div>
              <p className="text-sm text-gray-600">Perfect for trying it out</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">1 personality profile</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">100 messages per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">End-to-end encryption</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">WhatsApp import</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Basic support</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('free')}
              className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-200 transition"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Plan - Most Popular */}
          <div className="bg-white border-2 border-purple-600 rounded-2xl p-8 relative shadow-2xl transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg">
              MOST POPULAR
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
                <Zap className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">$9</span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              <p className="text-sm text-gray-600">For unlimited memories</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  <strong>Unlimited</strong> personality profiles
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  <strong>Unlimited</strong> messages
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Priority AI responses</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Photo memories</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Voice messages (soon)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('pro')}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Subscribe Now
            </button>
          </div>

          {/* Lifetime Plan */}
          <div className="bg-white border-2 border-yellow-400 rounded-2xl p-8 hover:border-yellow-500 transition shadow-lg">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-full mb-4">
                <Crown className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Lifetime</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">$99</span>
                <span className="text-gray-600 text-lg">/once</span>
              </div>
              <p className="text-sm text-gray-600">Best value - pay once</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  <strong>Everything in Pro</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Pay once, use forever</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Early access to features</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Premium support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  <strong>Save $80/year</strong>
                </span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('lifetime')}
              className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Get Lifetime Access
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-6 h-6 text-green-600" />
              <span className="font-medium">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-6 h-6 text-green-600" />
              <span className="font-medium">30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-6 h-6 text-green-600" />
              <span className="font-medium">Secure payment</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does the free plan work?
              </h3>
              <p className="text-gray-600">
                The free plan lets you create 1 personality profile and send up to 100 messages per month. Perfect for trying out the service!
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data safe?
              </h3>
              <p className="text-gray-600">
                Absolutely. All your data is encrypted end-to-end with AES-256 encryption. We never store your master password, and only you can access your memories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
