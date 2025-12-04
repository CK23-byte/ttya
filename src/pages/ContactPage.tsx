/**
 * Contact Page with Message Form
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ArrowLeft, Send, Mail, CheckCircle, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus('error')
      setErrorMessage('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    try {
      // In a real app, this would send to your backend
      // For now, we'll simulate a successful submission
      console.log('Contact form submitted:', formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to send message. Please try again.')
    }
  }

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
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or need help? We're here for you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Success Message */}
        {status === 'success' && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-1">Message Sent Successfully!</h3>
                <p className="text-sm text-green-700">
                  Thank you for contacting us. We'll get back to you within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                placeholder="john@example.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none bg-white"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="privacy">Privacy Concern</option>
                <option value="feature">Feature Request</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                Your Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none"
                placeholder="Please provide as much detail as possible..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 20 characters. Please do not include sensitive personal information.
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600">
                By submitting this form, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => navigate('/privacy')}
                  className="text-orange-600 hover:underline font-semibold"
                >
                  Privacy Policy
                </button>
                . We will only use your information to respond to your inquiry.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Alternative Contact Methods */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
            <h3 className="font-bold text-gray-900 mb-3">Response Time</h3>
            <p className="text-sm text-gray-700">
              We typically respond to all inquiries within 24-48 hours during business days.
              For urgent technical issues, we prioritize responses.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
            <h3 className="font-bold text-gray-900 mb-3">Support Hours</h3>
            <p className="text-sm text-gray-700">
              Our support team is available Monday through Friday, 9:00 AM - 6:00 PM EST.
              Messages received outside these hours will be answered on the next business day.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">How long does it take to create a Living Legacy avatar?</h3>
              <p className="text-sm text-gray-600">
                Avatar creation typically takes 2-5 business days, depending on the complexity and amount of content provided.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Can I update my avatar after it's created?</h3>
              <p className="text-sm text-gray-600">
                Yes! All avatars can be updated at any time. The Lifetime plan includes 10 years of annual AI technology updates.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">How do credits work?</h3>
              <p className="text-sm text-gray-600">
                Each conversation (chat, voice, or video) uses credits. Credits never expire and can be purchased anytime.
                The system will notify you when credits are running low.
              </p>
            </div>

            <div className="pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-sm text-gray-600">
                Absolutely. We use AES-256 encryption, secure cloud hosting, and strict access controls. View our{' '}
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-orange-600 hover:underline font-semibold"
                >
                  Privacy Policy
                </button>{' '}
                for details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2024 TalkToYouAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
