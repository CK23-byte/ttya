import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  User,
  Heart,
  Users,
  Shield,
  FileText,
  Settings,
  Sparkles,
  Video,
  Mic,
  Gift,
  CheckCircle,
  Brain
} from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

interface OnboardingData {
  // Step 0: Tier Selection (added)
  selectedTier: 'essential' | 'complete' | 'premium'

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

  // Step 6: Personality Questionnaire
  personalityData: {
    humor: string
    adviceStyle: string
    communicationStyle: string
    coreValues: string[]
    conflictHandling: string
    commonPhrases: string
    affectionExpression: string
    decisionMaking: string
    lifeOutlook: string
    traditionImportance: string
    difficultTopicsApproach: string
    politicalViews: string
    spiritualOrientation: string
    culturalBackground: string
    personalityWords: string
  }
}

const STEPS = [
  { id: 0, title: 'Welcome', icon: Sparkles },
  { id: 1, title: 'Choose Your Plan', icon: Gift },
  { id: 2, title: 'Basic Information', icon: User },
  { id: 3, title: 'About This Legacy', icon: Heart },
  { id: 4, title: 'Who Is This For?', icon: Users },
  { id: 5, title: 'Executor Information', icon: Shield },
  { id: 6, title: 'Content Preferences', icon: Settings },
  { id: 7, title: 'Your Personality', icon: Brain },
  { id: 8, title: 'Review & Confirm', icon: FileText }
]

export default function LivingLegacyOnboardingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSupabaseAuth()

  // Get tier from URL params or localStorage
  const getTier = (): 'essential' | 'complete' | 'premium' => {
    const urlTier = searchParams.get('tier')
    if (urlTier) return urlTier as 'essential' | 'complete' | 'premium'

    const storedTier = localStorage.getItem('living-legacy-tier')
    if (storedTier) {
      localStorage.removeItem('living-legacy-tier')
      return storedTier as 'essential' | 'complete' | 'premium'
    }

    return 'complete'
  }

  const tier = getTier()

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auth guard - redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      localStorage.setItem('living-legacy-tier', tier)
      localStorage.setItem('living-legacy-return-to-onboarding', 'true')
      navigate('/auth')
    }
  }, [user, navigate, tier])

  const [formData, setFormData] = useState<OnboardingData>({
    selectedTier: tier,
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
    estimatedTime: '',
    personalityData: {
      humor: '',
      adviceStyle: '',
      communicationStyle: '',
      coreValues: [],
      conflictHandling: '',
      commonPhrases: '',
      affectionExpression: '',
      decisionMaking: '',
      lifeOutlook: '',
      traditionImportance: '',
      difficultTopicsApproach: '',
      politicalViews: '',
      spiritualOrientation: '',
      culturalBackground: '',
      personalityWords: ''
    }
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

  const toggleCoreValue = (value: string) => {
    const current = formData.personalityData.coreValues
    updateFormData({
      personalityData: {
        ...formData.personalityData,
        coreValues: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      }
    })
  }

  const updatePersonalityData = (updates: Partial<OnboardingData['personalityData']>) => {
    updateFormData({
      personalityData: {
        ...formData.personalityData,
        ...updates
      }
    })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true // Welcome screen
      case 1:
        return formData.selectedTier !== undefined // Tier selection
      case 2:
        return formData.fullName && formData.dateOfBirth
      case 3:
        return formData.primaryReason && formData.urgency && formData.emotionalState.length > 0
      case 4:
        return formData.recipients.length > 0 && formData.recipients.every(r => r.name && r.relationship)
      case 5:
        return formData.executorName && formData.executorEmail
      case 6:
        return formData.contentTypes.length > 0 && formData.estimatedTime
      case 7:
        // Personality questionnaire - at least basic fields required
        return formData.personalityData.communicationStyle &&
               formData.personalityData.coreValues.length > 0 &&
               formData.personalityData.lifeOutlook
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
      const response = await fetch('/api/legacy?action=create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          tier: formData.selectedTier,
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => currentStep === 0 ? navigate(-1) : setCurrentStep(currentStep - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Your Living Legacy</h1>
                <p className="text-sm text-gray-600">
                  {currentStep === 0 ? 'Welcome' : `Step ${currentStep} of ${STEPS.length - 1}`}
                </p>
              </div>
            </div>
            {currentStep > 0 && (
              <div className="hidden sm:block px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold text-sm">
                {formData.selectedTier.charAt(0).toUpperCase() + formData.selectedTier.slice(1)}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {currentStep > 0 && (
            <div className="mt-4 flex gap-1 sm:gap-2">
              {STEPS.slice(1).map((step) => (
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
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="space-y-8 text-center">
              <Sparkles className="w-16 h-16 text-orange-500 mx-auto" />
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Welcome to Your Living Legacy Journey
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  In the next few minutes, we'll guide you through creating a meaningful digital legacy
                  that will preserve your voice, wisdom, and love for generations to come.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left max-w-3xl mx-auto">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl border border-orange-200">
                  <Video className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Video & Voice</h3>
                  <p className="text-sm text-gray-600">Record messages in your own voice and appearance</p>
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl border border-orange-200">
                  <Gift className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Time Capsules</h3>
                  <p className="text-sm text-gray-600">Schedule messages for future milestones</p>
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl border border-orange-200">
                  <Shield className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Secure Forever</h3>
                  <p className="text-sm text-gray-600">Bank-level encryption and 50-year guarantee</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  ⏱️ Takes about <strong>10-15 minutes</strong> to complete
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
                >
                  Let's Begin
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Tier Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Gift className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Select the plan that best fits your needs</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Essential */}
                <button
                  onClick={() => updateFormData({
                    selectedTier: 'essential',
                    wantsVideoAvatar: false,
                    wantsVoiceClone: false
                  })}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.selectedTier === 'essential'
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Essential</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-4">€499</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Text-based AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>50+ messages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>5 family members</span>
                    </li>
                  </ul>
                </button>

                {/* Complete - Most Popular */}
                <button
                  onClick={() => updateFormData({
                    selectedTier: 'complete',
                    wantsVideoAvatar: true,
                    wantsVoiceClone: true
                  })}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                    formData.selectedTier === 'complete'
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-rose-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                  <h3 className="text-xl font-bold mb-2">Complete</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-4">€999</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Voice cloning</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Video avatar</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Unlimited messages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>15 family members</span>
                    </li>
                  </ul>
                </button>

                {/* Premium */}
                <button
                  onClick={() => updateFormData({
                    selectedTier: 'premium',
                    wantsVideoAvatar: true,
                    wantsVoiceClone: true
                  })}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.selectedTier === 'premium'
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-4">€1,999</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Professional recording</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Ultra-realistic avatar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Unlimited family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Concierge service</span>
                    </li>
                  </ul>
                </button>
              </div>

              <p className="text-sm text-gray-600 text-center">
                ✓ One-time payment • ✓ 50+ year hosting guarantee • ✓ No hidden fees
              </p>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <User className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Let's start with the basics</h2>
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

          {/* Step 3: About This Legacy */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">About this legacy</h2>
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
                    <label key={state} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
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

          {/* Step 4: Recipients */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Who is this for?</h2>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Step 5: Executor */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Executor information</h2>
                <p className="text-gray-600">Who will activate your legacy?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-1">
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

                <div className="col-span-1 sm:col-span-1">
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

                <div className="col-span-1 sm:col-span-1">
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

                <div className="col-span-1 sm:col-span-1">
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
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Step 6: Content Preferences */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Settings className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Content preferences</h2>
                <p className="text-gray-600">Customize your legacy creation experience</p>
              </div>

              {(formData.selectedTier === 'complete' || formData.selectedTier === 'premium') && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-lg">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-900 font-medium">Voice cloning (your actual voice)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.wantsVoiceClone}
                      onChange={(e) => updateFormData({ wantsVoiceClone: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-900 font-medium">Realistic video avatar</span>
                    </div>
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
                    <label key={type.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
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

          {/* Step 7: Personality Questionnaire */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Brain className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Capture your personality</h2>
                <p className="text-gray-600">
                  Help us understand what makes you uniquely you. This helps create more authentic responses.
                </p>
              </div>

              {/* Humor Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you describe your sense of humor?
                </label>
                <select
                  value={formData.personalityData.humor}
                  onChange={(e) => updatePersonalityData({ humor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="dry_witty">Dry / Witty</option>
                  <option value="slapstick">Slapstick / Physical</option>
                  <option value="sarcastic">Sarcastic</option>
                  <option value="gentle">Gentle / Wholesome</option>
                  <option value="serious">I'm more serious</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Advice Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When giving advice, you tend to be:
                </label>
                <select
                  value={formData.personalityData.adviceStyle}
                  onChange={(e) => updatePersonalityData({ adviceStyle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="direct">Direct and straightforward</option>
                  <option value="thoughtful">Thoughtful and measured</option>
                  <option value="storytelling">Use stories / analogies</option>
                  <option value="supportive">Supportive and encouraging</option>
                  <option value="socratic">Ask questions to guide thinking</option>
                </select>
              </div>

              {/* Communication Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your communication style is usually: *
                </label>
                <select
                  value={formData.personalityData.communicationStyle}
                  onChange={(e) => updatePersonalityData({ communicationStyle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="formal">Formal and professional</option>
                  <option value="casual">Casual and relaxed</option>
                  <option value="warm">Warm and affectionate</option>
                  <option value="playful">Playful and lighthearted</option>
                  <option value="thoughtful">Serious and thoughtful</option>
                </select>
              </div>

              {/* Core Values */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What matters most to you in life? * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'family', label: 'Family' },
                    { value: 'achievement', label: 'Personal achievement' },
                    { value: 'helping', label: 'Helping others' },
                    { value: 'learning', label: 'Learning / Growth' },
                    { value: 'independence', label: 'Independence' },
                    { value: 'tradition', label: 'Tradition' },
                    { value: 'adventure', label: 'Adventure' },
                    { value: 'security', label: 'Security' }
                  ].map((val) => (
                    <label key={val.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.personalityData.coreValues.includes(val.value)}
                        onChange={() => toggleCoreValue(val.value)}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{val.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conflict Handling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How do you typically handle difficult situations?
                </label>
                <select
                  value={formData.personalityData.conflictHandling}
                  onChange={(e) => updatePersonalityData({ conflictHandling: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="head_on">Face them head-on</option>
                  <option value="thoughtful">Think carefully before acting</option>
                  <option value="seek_advice">Seek advice from others</option>
                  <option value="gut_instinct">Trust my gut instinct</option>
                  <option value="creative">Look for creative solutions</option>
                </select>
              </div>

              {/* Common Phrases */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Words or phrases you often use (optional)
                </label>
                <textarea
                  value={formData.personalityData.commonPhrases}
                  onChange={(e) => updatePersonalityData({ commonPhrases: e.target.value })}
                  placeholder='e.g., "At the end of the day...", "Listen here...", "My dear..."'
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Affection Expression */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How do you express affection?
                </label>
                <select
                  value={formData.personalityData.affectionExpression}
                  onChange={(e) => updatePersonalityData({ affectionExpression: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="words">Words of affirmation</option>
                  <option value="time">Quality time</option>
                  <option value="service">Acts of service</option>
                  <option value="touch">Physical touch</option>
                  <option value="gifts">Gifts</option>
                  <option value="reserved">I'm more reserved</option>
                </select>
              </div>

              {/* Decision Making */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your approach to decision-making:
                </label>
                <select
                  value={formData.personalityData.decisionMaking}
                  onChange={(e) => updatePersonalityData({ decisionMaking: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="logical">Logical and analytical</option>
                  <option value="heart">Follow my heart</option>
                  <option value="others">Consider impact on others</option>
                  <option value="weigh">Weigh pros and cons carefully</option>
                  <option value="decisive">Quick and decisive</option>
                </select>
              </div>

              {/* Life Outlook */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your outlook on life? *
                </label>
                <select
                  value={formData.personalityData.lifeOutlook}
                  onChange={(e) => updatePersonalityData({ lifeOutlook: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="optimistic">Optimistic</option>
                  <option value="realistic">Realistic / Pragmatic</option>
                  <option value="philosophical">Philosophical</option>
                  <option value="cautious">Cautious</option>
                  <option value="adventurous">Adventurous</option>
                </select>
              </div>

              {/* Tradition Importance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How important is tradition to you?
                </label>
                <div className="flex gap-4 items-center">
                  {['Not important', 'Somewhat', 'Very important'].map((level) => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="tradition"
                        value={level.toLowerCase().replace(' ', '_')}
                        checked={formData.personalityData.traditionImportance === level.toLowerCase().replace(' ', '_')}
                        onChange={(e) => updatePersonalityData({ traditionImportance: e.target.value })}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficult Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When talking about difficult topics, you:
                </label>
                <select
                  value={formData.personalityData.difficultTopicsApproach}
                  onChange={(e) => updatePersonalityData({ difficultTopicsApproach: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="direct">Address them directly</option>
                  <option value="gentle">Use gentle language</option>
                  <option value="humor">Use humor to lighten mood</option>
                  <option value="avoid">Avoid if possible</option>
                  <option value="empathetic">Ask others how they feel</option>
                </select>
              </div>

              {/* Political Views (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your political/social views are (optional):
                </label>
                <select
                  value={formData.personalityData.politicalViews}
                  onChange={(e) => updatePersonalityData({ politicalViews: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="progressive">Progressive</option>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="independent">Independent / varies by issue</option>
                  <option value="prefer_not">Prefer not to discuss</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Spiritual Orientation (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your spiritual/religious orientation (optional):
                </label>
                <select
                  value={formData.personalityData.spiritualOrientation}
                  onChange={(e) => updatePersonalityData({ spiritualOrientation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="deeply_spiritual">Deeply spiritual / religious</option>
                  <option value="somewhat_spiritual">Somewhat spiritual</option>
                  <option value="agnostic">Agnostic</option>
                  <option value="atheist">Atheist</option>
                  <option value="prefer_not">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Cultural Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any specific cultural background or traditions important to you? (optional)
                </label>
                <textarea
                  value={formData.personalityData.culturalBackground}
                  onChange={(e) => updatePersonalityData({ culturalBackground: e.target.value })}
                  placeholder="e.g., Irish-American, celebrate Diwali, Sunday family dinners..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Personality Words */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your personality in 3-5 words (optional):
                </label>
                <input
                  type="text"
                  value={formData.personalityData.personalityWords}
                  onChange={(e) => updatePersonalityData({ personalityWords: e.target.value })}
                  placeholder="e.g., Caring, practical, funny, direct, optimistic"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  💡 <strong>Why we ask:</strong> These details help us create an AI that sounds and responds like you.
                  Your answers are private and only used to personalize your legacy.
                </p>
              </div>
            </div>
          )}

          {/* Step 8: Review */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
                <p className="text-gray-600">Make sure everything looks good</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-orange-600" />
                    Selected Plan
                  </h3>
                  <p className="text-gray-700">
                    <strong>{formData.selectedTier.charAt(0).toUpperCase() + formData.selectedTier.slice(1)}</strong> Tier
                  </p>
                </div>

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

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Edit Responses
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Creating Profile...' : 'Start Creating My Legacy'}
                    {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep > 0 && currentStep < 8 && (
            <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 0}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
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
