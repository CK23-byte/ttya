/**
 * Living Legacy Time Capsule Builder
 *
 * Features:
 * - Create time capsules with multiple unlock conditions
 * - Date-based, age-based, and event-based triggers
 * - Preview for different recipients
 * - Reminder system for time capsule activation
 */

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Gift,
  Calendar,
  User,
  Star,
  Plus,
  Trash2,
  Eye,
  Clock,
  Heart,
  Cake,
  GraduationCap,
  Baby,
  Home,
  Briefcase,
  CheckCircle
} from 'lucide-react'

interface TimeCapsule {
  id: string
  title: string
  message: string
  recipientId: string
  recipientName: string
  unlockConditions: UnlockCondition[]
  status: 'pending' | 'unlocked' | 'delivered'
  createdAt: Date
  scheduledFor?: Date
}

interface UnlockCondition {
  type: 'date' | 'age' | 'event'
  value: string | number
  label: string
}

interface Recipient {
  id: string
  name: string
  relationship: string
  dateOfBirth?: string
}

const EVENT_TEMPLATES = [
  { id: 'birthday', label: '18th Birthday', icon: Cake, suggestedAge: 18 },
  { id: 'graduation', label: 'Graduation', icon: GraduationCap, suggestedAge: 22 },
  { id: 'wedding', label: 'Wedding Day', icon: Heart, suggestedAge: 28 },
  { id: 'first_child', label: 'First Child', icon: Baby, suggestedAge: 30 },
  { id: 'first_home', label: 'First Home', icon: Home, suggestedAge: 32 },
  { id: 'career', label: 'Career Milestone', icon: Briefcase, suggestedAge: 35 }
]

export default function LivingLegacyTimeCapsulePage() {
  const navigate = useNavigate()
  const { profileId } = useParams()

  // Mock recipients - would come from API
  const [recipients] = useState<Recipient[]>([
    { id: '1', name: 'Sarah', relationship: 'Daughter', dateOfBirth: '2010-05-15' },
    { id: '2', name: 'Michael', relationship: 'Son', dateOfBirth: '2015-08-22' }
  ])

  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [currentCapsule, setCurrentCapsule] = useState<Partial<TimeCapsule>>({
    unlockConditions: []
  })
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [previewCapsule, setPreviewCapsule] = useState<TimeCapsule | null>(null)

  const addUnlockCondition = (condition: UnlockCondition) => {
    setCurrentCapsule(prev => ({
      ...prev,
      unlockConditions: [...(prev.unlockConditions || []), condition]
    }))
  }

  const removeUnlockCondition = (index: number) => {
    setCurrentCapsule(prev => ({
      ...prev,
      unlockConditions: prev.unlockConditions?.filter((_, i) => i !== index) || []
    }))
  }

  const createTimeCapsule = () => {
    if (!currentCapsule.title || !currentCapsule.message || !selectedRecipient) {
      alert('Please fill in all required fields')
      return
    }

    if (!currentCapsule.unlockConditions || currentCapsule.unlockConditions.length === 0) {
      alert('Please add at least one unlock condition')
      return
    }

    const newCapsule: TimeCapsule = {
      id: `capsule-${Date.now()}`,
      title: currentCapsule.title,
      message: currentCapsule.message,
      recipientId: selectedRecipient.id,
      recipientName: selectedRecipient.name,
      unlockConditions: currentCapsule.unlockConditions,
      status: 'pending',
      createdAt: new Date()
    }

    setTimeCapsules(prev => [...prev, newCapsule])
    setIsCreating(false)
    setCurrentCapsule({ unlockConditions: [] })
    setSelectedRecipient(null)
    alert('Time Capsule created!')
  }

  const deleteCapsule = (id: string) => {
    if (confirm('Are you sure you want to delete this time capsule?')) {
      setTimeCapsules(prev => prev.filter(c => c.id !== id))
    }
  }

  const calculateAge = (birthDate: string, targetDate: Date = new Date()): number => {
    const birth = new Date(birthDate)
    let age = targetDate.getFullYear() - birth.getFullYear()
    const monthDiff = targetDate.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && targetDate.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getUnlockDate = (capsule: TimeCapsule): Date | null => {
    const recipient = recipients.find(r => r.id === capsule.recipientId)
    if (!recipient || !recipient.dateOfBirth) return null

    const dateBirth = new Date(recipient.dateOfBirth)

    // Find age-based condition
    const ageCondition = capsule.unlockConditions.find(c => c.type === 'age')
    if (ageCondition) {
      const targetAge = ageCondition.value as number
      const unlockDate = new Date(dateBirth)
      unlockDate.setFullYear(dateBirth.getFullYear() + targetAge)
      return unlockDate
    }

    // Find date-based condition
    const dateCondition = capsule.unlockConditions.find(c => c.type === 'date')
    if (dateCondition) {
      return new Date(dateCondition.value as string)
    }

    return null
  }

  const formatUnlockDate = (date: Date | null): string => {
    if (!date) return 'Event-based'
    const now = new Date()
    const diffYears = date.getFullYear() - now.getFullYear()
    const diffMonths = date.getMonth() - now.getMonth()
    const totalMonths = diffYears * 12 + diffMonths

    if (totalMonths < 0) return 'Unlocked'
    if (totalMonths < 12) return `In ${totalMonths} month${totalMonths !== 1 ? 's' : ''}`
    return `In ${diffYears} year${diffYears !== 1 ? 's' : ''}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Time Capsules</h1>
                <p className="text-sm text-gray-600">{timeCapsules.length} capsules created</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Capsule
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isCreating ? (
          /* Time Capsules List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeCapsules.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Time Capsules Yet</h3>
                <p className="text-gray-600 mb-6">Create messages for future milestones</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Capsule
                </button>
              </div>
            ) : (
              timeCapsules.map((capsule) => {
                const unlockDate = getUnlockDate(capsule)
                const unlockInfo = formatUnlockDate(unlockDate)

                return (
                  <div
                    key={capsule.id}
                    className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-orange-300 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{capsule.title}</h3>
                          <p className="text-sm text-gray-600">For {capsule.recipientName}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPreviewCapsule(capsule)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteCapsule(capsule.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {capsule.unlockConditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          {condition.type === 'date' && <Calendar className="w-4 h-4 text-orange-600" />}
                          {condition.type === 'age' && <User className="w-4 h-4 text-orange-600" />}
                          {condition.type === 'event' && <Star className="w-4 h-4 text-orange-600" />}
                          <span>{condition.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">{unlockInfo}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        capsule.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        capsule.status === 'unlocked' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {capsule.status}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          /* Create New Capsule */
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Time Capsule</h2>

              {/* Step 1: Select Recipient */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  For whom? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recipients.map((recipient) => (
                    <button
                      key={recipient.id}
                      onClick={() => setSelectedRecipient(recipient)}
                      className={`p-4 rounded-lg border-2 text-left transition ${
                        selectedRecipient?.id === recipient.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{recipient.name}</div>
                      <div className="text-sm text-gray-600">{recipient.relationship}</div>
                      {recipient.dateOfBirth && (
                        <div className="text-xs text-gray-500 mt-1">
                          Age: {calculateAge(recipient.dateOfBirth)} years
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Title & Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capsule Title *
                </label>
                <input
                  type="text"
                  value={currentCapsule.title || ''}
                  onChange={(e) => setCurrentCapsule(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 18th Birthday Message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  value={currentCapsule.message || ''}
                  onChange={(e) => setCurrentCapsule(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  placeholder="Write your message for this special moment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Step 3: Unlock Conditions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When should this unlock? *
                </label>

                {/* Event Templates */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {EVENT_TEMPLATES.map((template) => {
                    const Icon = template.icon
                    return (
                      <button
                        key={template.id}
                        onClick={() => addUnlockCondition({
                          type: 'event',
                          value: template.id,
                          label: template.label
                        })}
                        className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition text-center"
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <p className="text-xs font-medium text-gray-900">{template.label}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Custom Conditions */}
                <div className="space-y-3">
                  {/* Age-based */}
                  {selectedRecipient?.dateOfBirth && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Age"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const age = parseInt((e.target as HTMLInputElement).value)
                            if (age > 0) {
                              addUnlockCondition({
                                type: 'age',
                                value: age,
                                label: `${selectedRecipient.name}'s ${age}th birthday`
                              })
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling as HTMLInputElement
                          const age = parseInt(input.value)
                          if (age > 0) {
                            addUnlockCondition({
                              type: 'age',
                              value: age,
                              label: `${selectedRecipient.name}'s ${age}th birthday`
                            })
                            input.value = ''
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        Add Age
                      </button>
                    </div>
                  )}

                  {/* Date-based */}
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => {
                        if (e.target.value) {
                          addUnlockCondition({
                            type: 'date',
                            value: e.target.value,
                            label: `On ${new Date(e.target.value).toLocaleDateString()}`
                          })
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Added Conditions */}
                {currentCapsule.unlockConditions && currentCapsule.unlockConditions.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-2">Unlock Conditions:</p>
                    <div className="space-y-2">
                      {currentCapsule.unlockConditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            {condition.type === 'date' && <Calendar className="w-4 h-4 text-orange-600" />}
                            {condition.type === 'age' && <User className="w-4 h-4 text-orange-600" />}
                            {condition.type === 'event' && <Star className="w-4 h-4 text-orange-600" />}
                            <span>{condition.label}</span>
                          </div>
                          <button
                            onClick={() => removeUnlockCondition(idx)}
                            className="p-1 hover:bg-gray-100 rounded transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setCurrentCapsule({ unlockConditions: [] })
                    setSelectedRecipient(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createTimeCapsule}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Create Capsule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewCapsule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setPreviewCapsule(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{previewCapsule.title}</h2>
              <p className="text-gray-600">For {previewCapsule.recipientName}</p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{previewCapsule.message}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Unlock Conditions:</p>
              {previewCapsule.unlockConditions.map((condition, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 p-2 bg-orange-50 rounded">
                  {condition.type === 'date' && <Calendar className="w-4 h-4 text-orange-600" />}
                  {condition.type === 'age' && <User className="w-4 h-4 text-orange-600" />}
                  {condition.type === 'event' && <Star className="w-4 h-4 text-orange-600" />}
                  <span>{condition.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
