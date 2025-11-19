/**
 * Paywall Component
 *
 * Shows pricing options and handles payment flow
 * For now, this is a placeholder that can be integrated with Stripe/Paddle/etc.
 */

import { Check, X, Crown, Zap, Heart } from 'lucide-react'

interface PaywallProps {
  onClose: () => void
  onSubscribe: (plan: 'free' | 'pro' | 'lifetime') => void
}

export default function Paywall({ onClose, onSubscribe }: PaywallProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Heart className="w-8 h-8" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-white/90">
              Start preserving precious memories today
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Heart className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/forever</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">1 personality profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">100 messages per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">End-to-end encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">WhatsApp import</span>
                </li>
              </ul>

              <button
                onClick={() => onSubscribe('free')}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan - Most Popular */}
            <div className="border-2 border-purple-600 rounded-xl p-6 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                MOST POPULAR
              </div>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$9</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Unlimited</strong> personality profiles
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Unlimited</strong> messages
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Priority AI responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Photo memories</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Voice messages (soon)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Everything in Free</span>
                </li>
              </ul>

              <button
                onClick={() => onSubscribe('pro')}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Subscribe Now
              </button>
            </div>

            {/* Lifetime Plan */}
            <div className="border-2 border-yellow-400 rounded-xl p-6 hover:border-yellow-500 transition">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lifetime</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/once</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Everything in Pro</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Pay once, use forever</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Early access to features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    <strong>Best value</strong> - Save $80/year
                  </span>
                </li>
              </ul>

              <button
                onClick={() => onSubscribe('lifetime')}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Get Lifetime Access
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
