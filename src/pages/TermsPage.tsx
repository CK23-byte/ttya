/**
 * Terms of Service Page
 */

import { useNavigate } from 'react-router-dom'
import { Heart, ArrowLeft, FileText, AlertTriangle, CheckCircle, Ban, RefreshCw } from 'lucide-react'

export default function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              TalkToYouAI
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-orange-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing or using TalkToYouAI ("Service", "we", "us", or "our"), you agree to be bound by these Terms of Service.
            If you disagree with any part of these terms, you may not use our Service.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Please read these terms carefully before using our Service.
          </p>
        </section>

        {/* Acceptance of Terms */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-4">
              By creating an account or using TalkToYouAI, you confirm that:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>You are at least 18 years old</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>You have the legal capacity to enter into these terms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>You will use our Service in compliance with all applicable laws</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>All information you provide is accurate and current</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Description of Service */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-4">
              TalkToYouAI provides two primary services:
            </p>
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-bold text-gray-900 mb-2">Chat Service</h3>
                <p className="text-sm text-gray-700">
                  Create AI models based on conversation exports to simulate conversations with loved ones.
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-bold text-gray-900 mb-2">Living Legacy</h3>
                <p className="text-sm text-gray-700">
                  Create digital profiles with voice cloning and personality capture to preserve your
                  legacy for future generations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Accounts */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">3. User Accounts</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-3">Account Security</h3>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>You are responsible for maintaining the confidentiality of your account credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>You are responsible for all activities that occur under your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>You must notify us immediately of any unauthorized use of your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>We reserve the right to suspend or terminate accounts that violate these terms</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Acceptable Use */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Acceptable Use Policy</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-4">
            <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
              <Ban className="w-6 h-6 text-red-600" />
              Prohibited Activities
            </h3>
            <p className="text-gray-700 mb-3">You agree NOT to:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Upload content you don't have the right to use</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Create AI profiles or chat models of people without their consent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Use the Service for illegal, harmful, or abusive purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Attempt to reverse engineer, hack, or compromise our systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Share or resell access to the Service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Upload content containing hate speech, violence, or illegal material</span>
              </li>
            </ul>
          </div>

          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Consequences of Violation</h3>
                <p className="text-sm text-gray-700">
                  Violation of these terms may result in immediate termination of your account, legal action,
                  and reporting to law enforcement authorities where applicable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Ownership */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Content Ownership and License</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Your Content</h3>
              <p className="text-gray-700 mb-3">
                You retain all rights to the content you upload (conversations, recordings, photos, etc.).
                By uploading content, you grant us a limited license to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Process and store your content to provide the Service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Create AI models based on your content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Generate voice clones from your recordings</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Our Content</h3>
              <p className="text-gray-700">
                All intellectual property rights in the Service, including software, design, and trademarks,
                belong to TalkToYouAI. You may not copy, modify, or distribute our Service without permission.
              </p>
            </div>
          </div>
        </section>

        {/* Payments and Refunds */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Payments and Refunds</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-3">Pricing</h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Starter Plan: $499 (100 conversation credits)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Complete Plan: $999 (500 conversation credits)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Lifetime Plan: $1,499 (500 credits + 10 years of annual AI updates)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>All plans include text and voice capabilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Additional credits can be purchased at any time</span>
              </li>
            </ul>

            <h3 className="font-bold text-lg text-gray-900 mb-3">Refund Policy</h3>
            <p className="text-gray-700 mb-3">
              Given the personalized nature of our Service:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Refunds are available within 14 days of purchase if no AI model creation has begun</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Once AI model training has started, refunds are not available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Unused credits do not expire and can be used at any time</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Disclaimers and Limitations</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Service "As Is":</strong> The Service is provided "as is" without warranties of any kind,
                either express or implied. We do not guarantee that the Service will be uninterrupted or error-free.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>AI Limitations:</strong> AI-generated conversations and avatars are approximations and may not
                perfectly replicate the person's actual personality, speech patterns, or appearance.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Limitation of Liability:</strong> We shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use of the Service. Our total liability shall not
                exceed the amount you paid for the Service.
              </p>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Termination</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without prior notice, for:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Violation of these Terms of Service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Fraudulent, abusive, or illegal activity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Upon your request</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              Upon termination, you may request a download of your data within 30 days. After this period,
              we may delete your data in accordance with our Privacy Policy.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="w-8 h-8 text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-900">9. Changes to Terms</h2>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. We will notify users of significant changes via
              email or through a prominent notice on our website. Your continued use of the Service after such modifications
              constitutes acceptance of the updated terms.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">10. Governing Law</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to
              conflict of law provisions. Any disputes shall be resolved through binding arbitration, except where
              prohibited by law.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">11. Contact Information</h2>
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl p-8 text-white text-center">
            <p className="text-lg mb-6">
              Questions about these Terms of Service?
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-all inline-flex items-center gap-2"
            >
              Contact Us
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </section>

        {/* Acknowledgment */}
        <section className="mb-12">
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <p className="text-gray-700">
              <strong>By using TalkToYouAI, you acknowledge that you have read, understood, and agree to be bound by
              these Terms of Service and our Privacy Policy.</strong>
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2024 TalkToYouAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
