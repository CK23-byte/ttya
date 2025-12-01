import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Shield, Heart, Clock } from 'lucide-react'

interface PricingTier {
  id: 'essential' | 'complete' | 'premium'
  name: string
  price: number
  popular?: boolean
  description: string
  features: string[]
  familyMembers: number
  hostingYears: number
}

const tiers: PricingTier[] = [
  {
    id: 'essential',
    name: 'Essential Legacy',
    price: 499,
    description: 'Perfect for getting started with your legacy',
    familyMembers: 5,
    hostingYears: 50,
    features: [
      'Text-based AI personality',
      'Upload existing data (chats, photos)',
      'Record 50+ messages',
      'Life story chapters',
      'Wisdom & advice section',
      'Access for 5 family members',
      'Secure notary link system',
      '50-year hosting guarantee',
      'Email support'
    ]
  },
  {
    id: 'complete',
    name: 'Complete Legacy',
    price: 999,
    popular: true,
    description: 'Perfect for creating a comprehensive legacy',
    familyMembers: 15,
    hostingYears: 50,
    features: [
      'Everything in Essential, PLUS:',
      '✨ Voice cloning (your actual voice)',
      '✨ Video avatar (realistic)',
      'Unlimited messages',
      'Time capsule messages',
      'Ultra-realistic lip-sync',
      'Access for 15 family members',
      'Priority support',
      '50-year hosting guarantee'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Legacy',
    price: 1999,
    description: 'The ultimate legacy experience',
    familyMembers: 999,
    hostingYears: 100,
    features: [
      'Everything in Complete, PLUS:',
      '✨ Professional video recording session',
      '✨ Guided interview with legacy specialist',
      'Ultra-HD avatar with micro-expressions',
      'Unlimited family members',
      '100-year hosting guarantee',
      'White-glove service',
      'Personal legacy coach',
      'On-demand updates for life'
    ]
  }
]

export default function LivingLegacyPricingPage() {
  const navigate = useNavigate()

  const handleGetStarted = (tierId: 'essential' | 'complete' | 'premium') => {
    // Navigate to onboarding
    navigate(`/living-legacy/onboarding?tier=${tierId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            One-Time Investment, Eternal Connection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create your Living Legacy today. No monthly fees, no hidden costs.
            <br />
            Just a single payment for a gift that lasts generations.
          </p>

          {/* Trust Badges */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Bank-Level Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">50+ Year Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Heart className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-medium">Unlimited Updates</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${
                tier.popular ? 'ring-4 ring-orange-500 scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-center py-2 font-semibold text-sm">
                  ⭐ MOST POPULAR
                </div>
              )}

              <div className={`p-8 ${tier.popular ? 'pt-14' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">€{tier.price}</span>
                  <span className="text-gray-600 ml-2">one-time</span>
                </div>

                <button
                  onClick={() => handleGetStarted(tier.id)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all mb-8 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.id === 'premium' ? 'Contact Us' : 'Get Started'} <ArrowRight className="inline w-5 h-5 ml-2" />
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${feature.startsWith('✨') ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Family Access:</span>
                    <span className="font-semibold text-gray-900">
                      {tier.familyMembers === 999 ? 'Unlimited' : `Up to ${tier.familyMembers}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Hosting:</span>
                    <span className="font-semibold text-gray-900">{tier.hostingYears} years</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Essential</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Complete</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-4 text-gray-700">AI Personality</td>
                  <td className="text-center py-4 px-4 text-gray-600">Text-based</td>
                  <td className="text-center py-4 px-4 text-gray-600">Voice + Video</td>
                  <td className="text-center py-4 px-4 text-gray-600">Ultra-realistic</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Voice Cloning</td>
                  <td className="text-center py-4 px-4">✗</td>
                  <td className="text-center py-4 px-4 text-green-600 font-semibold">✓</td>
                  <td className="text-center py-4 px-4 text-green-600 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Video Avatar</td>
                  <td className="text-center py-4 px-4">✗</td>
                  <td className="text-center py-4 px-4 text-gray-600">Realistic</td>
                  <td className="text-center py-4 px-4 text-gray-600">Ultra-HD</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Message Limit</td>
                  <td className="text-center py-4 px-4 text-gray-600">50 recordings</td>
                  <td className="text-center py-4 px-4 text-gray-600">Unlimited</td>
                  <td className="text-center py-4 px-4 text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Time Capsules</td>
                  <td className="text-center py-4 px-4 text-gray-600">5 messages</td>
                  <td className="text-center py-4 px-4 text-gray-600">Unlimited</td>
                  <td className="text-center py-4 px-4 text-gray-600">Unlimited + guided</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Recording Help</td>
                  <td className="text-center py-4 px-4 text-gray-600">Self-guided</td>
                  <td className="text-center py-4 px-4 text-gray-600">Prompts & tips</td>
                  <td className="text-center py-4 px-4 text-gray-600">Personal coach</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Support</td>
                  <td className="text-center py-4 px-4 text-gray-600">Email</td>
                  <td className="text-center py-4 px-4 text-gray-600">Priority</td>
                  <td className="text-center py-4 px-4 text-gray-600">White-glove</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Flexible Payment Options</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">One-Time Payment</h3>
              <p className="text-gray-600 text-sm">
                Pay in full and you're done. No recurring charges ever.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Payment Plan (Interest-Free)</h3>
              <p className="text-gray-600 text-sm mb-3">
                Spread the cost while you create your legacy:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Essential: 3 monthly payments of €175</li>
                <li>• Complete: 6 monthly payments of €175</li>
                <li>• Premium: 12 monthly payments of €175</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                What happens if I can't complete it before I pass?
              </h3>
              <p className="text-gray-600">
                Your legacy will be activated with whatever content you've created. We recommend completing at least the essential sections (basic info, main messages, and recipient list) as soon as possible.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Can I upgrade my tier later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade from Essential to Complete or Premium at any time by paying the difference. Contact support to arrange an upgrade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee if you haven't started creating content yet. Once you begin recording messages, sales are final.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                What happens if TalkToYouAI goes out of business?
              </h3>
              <p className="text-gray-600">
                Your legacy is protected. We have partnered with a data escrow service that will ensure your legacy remains accessible for the full hosting period, even if our company ceases operations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                How secure is my data?
              </h3>
              <p className="text-gray-600">
                All data is encrypted with bank-level AES-256 encryption. Your notary activation link uses advanced cryptographic signing. No one can access your legacy without proper verification and authorization.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Create Your Living Legacy?</h2>
          <p className="text-xl mb-8 opacity-90">
            Give your loved ones the gift of connection that lasts forever.
          </p>
          <button
            onClick={() => handleGetStarted('complete')}
            className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl"
          >
            Start Creating Today <ArrowRight className="inline w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}
