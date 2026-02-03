/**
 * Privacy Policy Page
 */

import { useNavigate } from 'react-router-dom'
import { Heart, ArrowLeft, Shield, Lock, Eye, UserCheck, Database, FileText, Check } from 'lucide-react'

export default function PrivacyPage() {
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
            <Shield className="w-12 h-12 text-orange-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At TalkToYouAI, we understand that your memories, conversations, and personal data are deeply sensitive and precious.
            This Privacy Policy explains how we collect, use, protect, and handle your information when you use our services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We are committed to maintaining the highest standards of data protection and privacy. Your trust is our most important asset.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-900">Information We Collect</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Information You Provide</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Account Information:</strong> Email address, name, and authentication credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Chat Content:</strong> Conversation exports from WhatsApp, Messenger, Telegram, or other messaging apps</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Living Legacy Content:</strong> Voice recordings, video messages, photos, text responses, and personality questionnaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Payment Information:</strong> Processed securely through Stripe (we never store full credit card numbers)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Information Collected Automatically</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Usage Data:</strong> How you interact with our service, feature usage, and session duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Device Information:</strong> Browser type, operating system, device type, and IP address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Cookies:</strong> Essential cookies for authentication and session management</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-900">How We Use Your Information</h2>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <strong className="block mb-1">Provide Our Services</strong>
                  <span>Process and train AI models to recreate conversation styles and personalities</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <strong className="block mb-1">Create Living Legacy Profiles</strong>
                  <span>Generate voice clones and personality-based AI models</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <strong className="block mb-1">Improve Our Services</strong>
                  <span>Analyze usage patterns to enhance features and user experience (anonymized data only)</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <strong className="block mb-1">Communicate With You</strong>
                  <span>Send service updates, security alerts, and support responses</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-bold text-sm">5</span>
                </div>
                <div>
                  <strong className="block mb-1">Ensure Security</strong>
                  <span>Detect and prevent fraud, abuse, and security incidents</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Data Protection */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-900">How We Protect Your Data</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-gray-900">Encryption</h3>
              </div>
              <p className="text-sm text-gray-700">
                All data is encrypted in transit (TLS/SSL) and at rest (AES-256 encryption)
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-gray-900">Secure Infrastructure</h3>
              </div>
              <p className="text-sm text-gray-700">
                Hosted on enterprise-grade cloud infrastructure with regular security audits
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-gray-900">Access Control</h3>
              </div>
              <p className="text-sm text-gray-700">
                Strict access controls and authentication requirements for all user data
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-gray-900">Privacy by Design</h3>
              </div>
              <p className="text-sm text-gray-700">
                Data minimization and purpose limitation built into our systems
              </p>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Sharing and Third Parties</h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3">We Never Sell Your Data</h3>
            <p className="text-gray-700">
              We do not and will never sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Limited Third-Party Services</h3>
            <p className="text-gray-700 mb-4">We only share data with trusted service providers who help us operate our service:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Supabase:</strong> Authentication and database hosting (GDPR compliant)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Stripe:</strong> Payment processing (PCI DSS compliant)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>AI Service Providers:</strong> For voice cloning and AI chat generation (data processing agreements in place)</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span><strong>Access:</strong> Request a copy of all personal data we hold about you</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span><strong>Correction:</strong> Request corrections to inaccurate or incomplete data</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span><strong>Portability:</strong> Receive your data in a machine-readable format</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span><strong>Object:</strong> Object to certain processing of your data</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us through our <button onClick={() => navigate('/contact')} className="text-orange-600 hover:underline font-semibold">Contact page</button>.
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Retention</h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-4">
              We retain your data for different periods depending on its purpose:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Living Legacy Content:</strong> Stored for 50+ years or until you request deletion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Account Data:</strong> Retained while your account is active, plus 90 days after deletion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Usage Data:</strong> Anonymized and retained for analytics purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Financial Records:</strong> Retained for 7 years for tax and legal compliance</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Children's Privacy</h2>

          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <p className="text-gray-700">
              Our service is not intended for children under 18. We do not knowingly collect personal information from children.
              If you believe a child has provided us with personal information, please contact us immediately.
            </p>
          </div>
        </section>

        {/* International Data Transfers */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">International Data Transfers</h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards
              are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws,
              including GDPR for EU users.
            </p>
          </div>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to This Privacy Policy</h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by email
              or through a prominent notice on our website. Your continued use of our services after such modifications
              constitutes your acceptance of the updated Privacy Policy.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>

          <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl p-8 text-white text-center">
            <p className="text-lg mb-6">
              Questions about your privacy or this policy?
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-all inline-flex items-center gap-2"
            >
              Contact Our Privacy Team
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
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
