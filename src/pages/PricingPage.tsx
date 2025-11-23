/**
 * Pricing Page - Credit-Based Pricing
 *
 * Matching homepage style with 300% margin on credits
 */

import { useNavigate } from 'react-router-dom'
import { Check, Heart, ArrowLeft, Sparkles, Video, MessageCircle, Shield, Lock } from 'lucide-react'

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    credits: 50,
    price: 4.99,
    description: '~50 messages',
  },
  {
    id: 'popular',
    credits: 200,
    price: 14.99,
    description: '~200 messages',
    popular: true,
  },
  {
    id: 'value',
    credits: 500,
    price: 29.99,
    description: 'Best value',
  },
]

export default function PricingPage() {
  const navigate = useNavigate()

  const handleBuyCredits = (packageId: string) => {
    // TODO: Implement Stripe checkout
    alert(`Stripe checkout for ${packageId} coming soon!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Version Badge */}
      <div className="fixed top-4 left-4 z-50">
        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm">
          <span className="text-xs font-semibold text-gray-600">v2.3.0</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white py-16">
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple Credit Pricing</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Buy credits, use them for conversations. No subscriptions, no surprises.
            </p>
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-2xl p-6 relative shadow-lg hover:shadow-xl transition ${
                pkg.popular ? 'border-2 border-orange-400 transform scale-105' : 'border border-gray-100'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
                  pkg.popular ? 'bg-gradient-to-br from-orange-100 to-rose-100' : 'bg-gray-100'
                }`}>
                  <Sparkles className={`w-7 h-7 ${pkg.popular ? 'text-orange-500' : 'text-gray-600'}`} />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">{pkg.credits}</div>
                <div className="text-gray-500 mb-4">credits</div>
                <div className="text-3xl font-bold text-gray-900">${pkg.price}</div>
                <p className="text-sm text-gray-500 mt-2">{pkg.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>1 credit = ~1 message</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Credits never expire</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited profiles</span>
                </li>
              </ul>

              <button
                onClick={() => handleBuyCredits(pkg.id)}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Buy Credits
              </button>
            </div>
          ))}
        </div>

        {/* Free Credits Notice */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
          <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Start Free!</h3>
          <p className="text-gray-600">
            Every new account gets <strong>10 free credits</strong> to try the service.
            No credit card required.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
          >
            Create Free Account
          </button>
        </div>

        {/* Video Plan Coming Soon */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 bg-purple-200 text-purple-700 text-xs font-semibold rounded-full mb-2">
                COMING SOON
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Video Call Credits</h3>
              <p className="text-gray-600 mb-3">
                Have face-to-face video conversations with AI-generated avatars of your loved ones.
                Video credits will be available separately with realistic pricing.
              </p>
              <p className="text-sm text-gray-500">
                Join the waitlist to be notified when video calls launch.
              </p>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Everything Included with Every Purchase
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <MessageCircle className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Natural Chats</h4>
              <p className="text-sm text-gray-600">AI captures their unique personality</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <Sparkles className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Chat Themes</h4>
              <p className="text-sm text-gray-600">WhatsApp, iMessage & Messenger styles</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <Shield className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">End-to-End Encrypted</h4>
              <p className="text-sm text-gray-600">Your data stays private</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <Lock className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">No Data Storage</h4>
              <p className="text-sm text-gray-600">Everything stays on your device</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                How do credits work?
              </h3>
              <p className="text-gray-600 text-sm">
                1 credit = approximately 1 message. When you send a message, 1 credit is deducted from your balance. Credits never expire.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I buy more credits anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You can purchase additional credits whenever you need them. They're added to your existing balance instantly.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, debit cards, and Apple Pay through our secure Stripe payment system.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600 text-sm">
                Unused credits can be refunded within 30 days of purchase. Contact us if you need assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
              <span className="font-medium text-gray-900">TalkToYouAI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Privacy First</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              © 2024 TalkToYouAI
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
