import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Plus, X, User, Heart, Users, Shield, FileText, Settings } from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

interface OnboardingData {
  // Step 1: Basic Information
  fullName: string
  dateOfBirth: string
  currentLocation: string
  occupation: string

  // Step 2: About This Legacy
  primaryReason: string
  urgency: string
  emotionalState: string[]

  // Step 3: Recipients
  recipients: Array<{
    name: string
    relationship: string
    age?: number
    email?: string
  }>
  primaryRecipient: string

  // Step 4: Executor
  executorName: string
  executorRelationship: string
  executorEmail: string
  executorPhone: string
  hasNotary: boolean
  notaryInfo?: {
    name: string
    firm: string
    email: string
    phone: string
  }

  // Step 5: Content Preferences
  wantsVideoAvatar: boolean
  wantsVoiceClone: boolean
  contentTypes: string[]
  estimatedTime: string
}

const STEPS = [
  { id: 1, title: 'Basic Information', icon: User },
  { id: 2, title: 'About This Legacy', icon: Heart },
  { id: 3, title: 'Who Is This For?', icon: Users },
  { id: 4, title: 'Executor Information', icon: Shield },
  { id: 5, title: 'Content Preferences', icon: Settings },
  { id: 6, title: 'Review & Confirm', icon: FileText }
]

export default function LivingLegacyOnboardingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tier = (searchParams.get('tier') || 'complete') as 'essential' | 'complete' | 'premium'
  const { user } = useSupabaseAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    dateOfBirth: '',
    currentLocation: '',
    occupation: '',
    primaryReason: '',
    urgency: '',
    emotionalState: [],
    recipients: [],
    primaryRecipient: '',
    executorName: '',
    executorRelationship: '',
    executorEmail: '',
    executorPhone: '',
    hasNotary: false,
    wantsVideoAvatar: tier === 'complete' || tier === 'premium',
    wantsVoiceClone: tier === 'complete' || tier === 'premium',
    contentTypes: [],
    estimatedTime: ''
  })

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addRecipient = () => {
    updateFormData({
      recipients: [...formData.recipients, { name: '', relationship: '', age: undefined, email: '' }]
    })
  }

  const updateRecipient = (index: number, updates: Partial<OnboardingData['recipients'][0]>) => {
    const newRecipients = [...formData.recipients]
    newRecipients[index] = { ...newRecipients[index], ...updates }
    updateFormData({ recipients: newRecipients })
  }

  const removeRecipient = (index: number) => {
    updateFormData({
      recipients: formData.recipients.filter((_, i) => i !== index)
    })
  }

  const toggleEmotionalState = (state: string) => {
    const current = formData.emotionalState
    updateFormData({
      emotionalState: current.includes(state)
        ? current.filter(s => s !== state)
        : [...current, state]
    })
  }

  const toggleContentType = (type: string) => {
    const current = formData.contentTypes
    updateFormData({
      contentTypes: current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
    })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.dateOfBirth
      case 2:
        return formData.primaryReason && formData.urgency && formData.emotionalState.length > 0
      case 3:
        return formData.recipients.length > 0 && formData.recipients.every(r => r.name && r.relationship)
      case 4:
        return formData.executorName && formData.executorEmail
      case 5:
        return formData.contentTypes.length > 0 && formData.estimatedTime
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/legacy/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          tier,
          onboardingData: formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile')
      }

      // Navigate to creation dashboard
      navigate(`/living-legacy/create/${data.profile.id}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => currentStep === 1 ? navigate(-1) : setCurrentStep(currentStep - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Your Living Legacy</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {STEPS.length}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold">
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 flex gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded-full transition-all ${
                  step.id < currentStep
                    ? 'bg-green-500'
                    : step.id === currentStep
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <User className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's start with the basics</h2>
                <p className="text-gray-600">Tell us a little about yourself</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your full name? *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData({ fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When were you born? *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where do you live?
                </label>
                <input
                  type="text"
                  value={formData.currentLocation}
                  onChange={(e) => updateFormData({ currentLocation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="New York, NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your occupation or what did you do for work?
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => updateFormData({ occupation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          )}

          {/* Step 2: About This Legacy */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">About this legacy</h2>
                <p className="text-gray-600">Help us understand your journey</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you creating your Living Legacy? *
                </label>
                <select
                  value={formData.primaryReason}
                  onChange={(e) => updateFormData({ primaryReason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  <option value="terminal_illness">Terminal illness</option>
                  <option value="aging">Aging / End of life planning</option>
                  <option value="proactive">Proactive planning</option>
                  <option value="high_risk_profession">High-risk profession</option>
                  <option value="peace_of_mind">Peace of mind</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How soon would you like to complete this? *
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => updateFormData({ urgency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select timeframe...</option>
                  <option value="within_week">Within a week</option>
                  <option value="within_month">Within a month</option>
                  <option value="within_3_months">Within 3 months</option>
                  <option value="no_rush">No rush, taking my time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How are you feeling about this process? * (Select all that apply)
                </label>
                <div className="space-y-2">
                  {['hopeful', 'anxious', 'peaceful', 'overwhelmed', 'empowered'].map((state) => (
                    <label key={state} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emotionalState.includes(state)}
                        onChange={() => toggleEmotionalState(state)}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-gray-700 capitalize">{state}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Recipients */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Who is this for?</h2>
                <p className="text-gray-600">Add the people who will receive your legacy</p>
              </div>

              <div className="space-y-4">
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                    <button
                      onClick={() => removeRecipient(index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(index, { name: e.target.value })}
                        placeholder="Name *"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        value={recipient.relationship}
                        onChange={(e) => updateRecipient(index, { relationship: e.target.value })}
                        placeholder="Relationship * (e.g., Daughter)"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={recipient.age || ''}
                        onChange={(e) => updateRecipient(index, { age: parseInt(e.target.value) || undefined })}
                        placeholder="Age (optional)"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="email"
                        value={recipient.email || ''}
                        onChange={(e) => updateRecipient(index, { email: e.target.value })}
                        placeholder="Email (optional)"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addRecipient}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Recipient
                </button>
              </div>

              {formData.recipients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who is the primary person this is for?
                  </label>
                  <select
                    value={formData.primaryRecipient}
                    onChange={(e) => updateFormData({ primaryRecipient: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select primary recipient...</option>
                    {formData.recipients.map((r, idx) => (
                      <option key={idx} value={r.name}>
                        {r.name} ({r.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Executor */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Executor information</h2>
                <p className="text-gray-600">Who will activate your legacy?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Executor's Name *
                  </label>
                  <input
                    type="text"
                    value={formData.executorName}
                    onChange={(e) => updateFormData({ executorName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    value={formData.executorRelationship}
                    onChange={(e) => updateFormData({ executorRelationship: e.target.value })}
                    placeholder="Brother"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.executorEmail}
                    onChange={(e) => updateFormData({ executorEmail: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.executorPhone}
                    onChange={(e) => updateFormData({ executorPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasNotary}
                    onChange={(e) => updateFormData({ hasNotary: e.target.checked, notaryInfo: e.target.checked ? { name: '', firm: '', email: '', phone: '' } : undefined })}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="ml-3 text-gray-700">I have a notary or lawyer</span>
                </label>
              </div>

              {formData.hasNotary && formData.notaryInfo && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <h3 className="font-semibold text-gray-900">Notary Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.notaryInfo.name}
                      onChange={(e) => updateFormData({ notaryInfo: { ...formData.notaryInfo!, name: e.target.value } })}
                      placeholder="Notary Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={formData.notaryInfo.firm}
                      onChange={(e) => updateFormData({ notaryInfo: { ...formData.notaryInfo!, firm: e.target.value } })}
                      placeholder="Law Firm"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="email"
                      value={formData.notaryInfo.email}
                      onChange={(e) => updateFormData({ notaryInfo: { ...formData.notaryInfo!, email: e.target.value } })}
                      placeholder="Email"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      value={formData.notaryInfo.phone}
                      onChange={(e) => updateFormData({ notaryInfo: { ...formData.notaryInfo!, phone: e.target.value } })}
                      placeholder="Phone"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Content Preferences */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Settings className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Content preferences</h2>
                <p className="text-gray-600">Customize your legacy creation experience</p>
              </div>

              {(tier === 'complete' || tier === 'premium') && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-lg">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">Voice cloning (your actual voice)</span>
                    <input
                      type="checkbox"
                      checked={formData.wantsVoiceClone}
                      onChange={(e) => updateFormData({ wantsVoiceClone: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">Realistic video avatar</span>
                    <input
                      type="checkbox"
                      checked={formData.wantsVideoAvatar}
                      onChange={(e) => updateFormData({ wantsVideoAvatar: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What types of content do you want to include? * (Select all that apply)
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'life_stories', label: 'Life Stories & History' },
                    { value: 'wisdom_advice', label: 'Wisdom & Advice' },
                    { value: 'specific_messages', label: 'Messages for Specific People' },
                    { value: 'time_capsules', label: 'Time Capsule Messages' },
                    { value: 'everyday_moments', label: 'Everyday Moments & Personality' }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.contentTypes.includes(type.value)}
                        onChange={() => toggleContentType(type.value)}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How much time can you dedicate per week? *
                </label>
                <select
                  value={formData.estimatedTime}
                  onChange={(e) => updateFormData({ estimatedTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select time commitment...</option>
                  <option value="1_hour">1 hour</option>
                  <option value="2_3_hours">2-3 hours</option>
                  <option value="4_5_hours">4-5 hours</option>
                  <option value="as_much_as_needed">As much as needed</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
                <p className="text-gray-600">Make sure everything looks good</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Name:</strong> {formData.fullName}</p>
                    <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
                    {formData.currentLocation && <p><strong>Location:</strong> {formData.currentLocation}</p>}
                    {formData.occupation && <p><strong>Occupation:</strong> {formData.occupation}</p>}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Recipients ({formData.recipients.length})</h3>
                  <div className="space-y-2">
                    {formData.recipients.map((r, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        <strong>{r.name}</strong> - {r.relationship}
                        {r.email && ` (${r.email})`}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Executor</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>{formData.executorName}</strong> ({formData.executorRelationship})</p>
                    <p>{formData.executorEmail}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Content Preferences</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Content Types:</strong> {formData.contentTypes.length} selected</p>
                    <p><strong>Time Commitment:</strong> {formData.estimatedTime.replace(/_/g, ' ')}</p>
                    {formData.wantsVoiceClone && <p>✓ Voice cloning enabled</p>}
                    {formData.wantsVideoAvatar && <p>✓ Video avatar enabled</p>}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Edit Responses
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating Profile...' : 'Start Creating My Legacy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 6 && (
            <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
