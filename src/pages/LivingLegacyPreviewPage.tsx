/**
 * Living Legacy Preview Page
 *
 * Allows creators to preview their legacy as recipients will see it
 * Test chat, voice, video interactions before finalization
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Video,
  Gift,
  BookOpen,
  Sparkles,
  Calendar,
  Lock,
  CheckCircle,
  Play,
  Users,
  Volume2,
  Camera
} from 'lucide-react'

interface Recipient {
  id: string
  name: string
  relationship: string
  email: string
}

interface Message {
  id: string
  category: string
  title: string
  isComplete: boolean
  isTimeCapsule: boolean
  unlockCondition?: string
  recipientIds: string[] | null
}

interface ProfilePreviewData {
  profile: {
    id: string
    fullName: string
    profilePhotoUrl: string | null
    tier: string
    hasVoiceClone: boolean
    hasVideoAvatar: boolean
    completionPercentage: number
  }
  recipients: Recipient[]
  messages: Message[]
  statistics: {
    totalMessages: number
    completedMessages: number
    timeCapsules: number
    messagesByCategory: Record<string, number>
    voiceMinutesRecorded: number
    avatarPhotos: number
  }
}

export default function LivingLegacyPreviewPage() {
  const navigate = useNavigate()
  const { profileId } = useParams<{ profileId: string }>()

  const [selectedRecipient, setSelectedRecipient] = useState<string | 'all'>('all')
  const [profileData, setProfileData] = useState<ProfilePreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [testMode, setTestMode] = useState<'overview' | 'chat' | 'voice' | 'video'>('overview')

  useEffect(() => {
    loadPreviewData()
  }, [profileId])

  const loadPreviewData = async () => {
    setIsLoading(true)
    try {
      // TODO: Fetch from API
      // Mock data for now
      const mockData: ProfilePreviewData = {
        profile: {
          id: profileId || '',
          fullName: 'John Davis',
          profilePhotoUrl: null,
          tier: 'complete',
          hasVoiceClone: true,
          hasVideoAvatar: true,
          completionPercentage: 85
        },
        recipients: [
          { id: '1', name: 'Emma', relationship: 'Daughter', email: 'emma@example.com' },
          { id: '2', name: 'Sarah', relationship: 'Wife', email: 'sarah@example.com' },
          { id: '3', name: 'Michael', relationship: 'Son', email: 'michael@example.com' }
        ],
        messages: [
          { id: '1', category: 'life_story', title: 'My Childhood', isComplete: true, isTimeCapsule: false, recipientIds: null },
          { id: '2', category: 'specific_person', title: 'For Emma - Career Advice', isComplete: true, isTimeCapsule: false, recipientIds: ['1'] },
          { id: '3', category: 'time_capsule', title: "Emma's Wedding Day", isComplete: true, isTimeCapsule: true, unlockCondition: 'wedding', recipientIds: ['1'] }
        ],
        statistics: {
          totalMessages: 23,
          completedMessages: 20,
          timeCapsules: 4,
          messagesByCategory: {
            life_story: 8,
            wisdom: 5,
            specific_person: 6,
            time_capsule: 4
          },
          voiceMinutesRecorded: 18,
          avatarPhotos: 47
        }
      }
      setProfileData(mockData)

      // Auto-select first recipient if available
      if (mockData.recipients.length > 0) {
        setSelectedRecipient(mockData.recipients[0].id)
      }
    } catch (error) {
      console.error('Error loading preview data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMessagesForRecipient = () => {
    if (!profileData) return []

    if (selectedRecipient === 'all') {
      return profileData.messages
    }

    return profileData.messages.filter(msg =>
      msg.recipientIds === null || msg.recipientIds.includes(selectedRecipient as string)
    )
  }

  const getTimeCapsules = () => {
    return getMessagesForRecipient().filter(msg => msg.isTimeCapsule)
  }

  const getGeneralMessages = () => {
    return getMessagesForRecipient().filter(msg => !msg.isTimeCapsule)
  }

  const selectedRecipientData = profileData?.recipients.find(r => r.id === selectedRecipient)

  if (isLoading || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Editing</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-semibold">
            <Sparkles className="w-5 h-5" />
            <span>Preview Mode</span>
          </div>

          <button
            onClick={() => navigate(`/living-legacy/${profileId}/finalize`)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition"
          >
            Looks Good, Finalize →
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Preview Your Living Legacy
          </h1>
          <p className="text-lg text-gray-600">
            This is what your loved ones will experience. Test everything before you finalize.
          </p>
        </div>

        {/* Warning if incomplete */}
        {profileData.profile.completionPercentage < 100 && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Profile Not Complete ({profileData.profile.completionPercentage}%)
                </h3>
                <p className="text-gray-700 mb-4">
                  You can preview what you've created so far, but you must complete 100% before you can finalize and generate the notary link.
                </p>
                <button
                  onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipient Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-gray-900">View As:</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedRecipient('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedRecipient === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Recipients
            </button>

            {profileData.recipients.map((recipient) => (
              <button
                key={recipient.id}
                onClick={() => setSelectedRecipient(recipient.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedRecipient === recipient.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {recipient.name} ({recipient.relationship})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Preview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                  {profileData.profile.profilePhotoUrl ? (
                    <img
                      src={profileData.profile.profilePhotoUrl}
                      alt={profileData.profile.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profileData.profile.fullName.charAt(0)
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedRecipient === 'all'
                      ? 'Welcome to My Living Legacy'
                      : `Welcome, ${selectedRecipientData?.name}`}
                  </h2>
                  <p className="text-white/90 mb-4">
                    {profileData.profile.fullName}
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {selectedRecipient === 'all'
                      ? "I created this so we could stay connected, always. You can talk to me, hear my voice, and access the messages I've left for you."
                      : `Hi ${selectedRecipientData?.name}. If you're seeing this, I'm no longer there in person, but I'm here in every way that matters. I made this for you.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Interaction Options */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                How Would You Like to Connect?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTestMode('chat')}
                  className={`p-6 rounded-xl border-2 transition ${
                    testMode === 'chat'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1">Chat</h4>
                  <p className="text-sm text-gray-600">Text conversation</p>
                </button>

                <button
                  onClick={() => setTestMode('voice')}
                  disabled={!profileData.profile.hasVoiceClone}
                  className={`p-6 rounded-xl border-2 transition ${
                    testMode === 'voice'
                      ? 'border-blue-500 bg-blue-50'
                      : profileData.profile.hasVoiceClone
                      ? 'border-gray-200 bg-white hover:border-blue-300'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1">Voice Call</h4>
                  <p className="text-sm text-gray-600">
                    {profileData.profile.hasVoiceClone ? 'Hear my voice' : 'Not available'}
                  </p>
                </button>

                <button
                  onClick={() => setTestMode('video')}
                  disabled={!profileData.profile.hasVideoAvatar}
                  className={`p-6 rounded-xl border-2 transition ${
                    testMode === 'video'
                      ? 'border-blue-500 bg-blue-50'
                      : profileData.profile.hasVideoAvatar
                      ? 'border-gray-200 bg-white hover:border-blue-300'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Video className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1">Video Call</h4>
                  <p className="text-sm text-gray-600">
                    {profileData.profile.hasVideoAvatar ? 'See my face' : 'Not available'}
                  </p>
                </button>
              </div>
            </div>

            {/* Test Mode Content */}
            {testMode === 'chat' && (
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat Preview
                  </h3>
                </div>
                <div className="p-6 bg-gray-50 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Chat interface will open here
                    </p>
                    <p className="text-sm text-gray-500">
                      Your AI personality will respond based on all the content you've created
                    </p>
                  </div>
                </div>
              </div>
            )}

            {testMode === 'voice' && (
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Voice Call Preview
                  </h3>
                </div>
                <div className="p-6 bg-gray-50 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-16 h-16 text-green-600" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Voice call simulation
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Recipients will hear your actual voice speaking naturally
                    </p>
                    <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition">
                      Start Test Call
                    </button>
                  </div>
                </div>
              </div>
            )}

            {testMode === 'video' && (
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Video Call Preview
                  </h3>
                </div>
                <div className="p-6 bg-gray-900 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-16 h-16 text-purple-600" />
                    </div>
                    <p className="text-white mb-4">
                      Video call simulation
                    </p>
                    <p className="text-sm text-gray-300 mb-6">
                      Recipients will see your realistic avatar speaking with natural expressions
                    </p>
                    <button className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition">
                      Start Test Video Call
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Available Content */}
          <div className="space-y-6">
            {/* General Messages */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Available Messages</h3>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getGeneralMessages().length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No messages available
                  </p>
                ) : (
                  getGeneralMessages().map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                    >
                      <Play className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {message.title}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {message.category.replace('_', ' ')}
                        </p>
                      </div>
                      {message.isComplete && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>{getGeneralMessages().length}</strong> messages ready for{' '}
                  {selectedRecipient === 'all' ? 'all recipients' : selectedRecipientData?.name}
                </p>
              </div>
            </div>

            {/* Time Capsules */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Time Capsules</h3>
              </div>

              <div className="space-y-3">
                {getTimeCapsules().length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No time capsules
                  </p>
                ) : (
                  getTimeCapsules().map((capsule) => (
                    <div
                      key={capsule.id}
                      className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {capsule.title}
                          </p>
                          <p className="text-xs text-purple-600 capitalize mt-1">
                            Unlocks: {capsule.unlockCondition?.replace('_', ' ')}
                          </p>
                        </div>
                        <Lock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-sm text-gray-600">
                  <strong>{getTimeCapsules().length}</strong> time capsules will unlock at special moments
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Your Legacy</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="font-semibold text-gray-900">
                    {profileData.statistics.totalMessages}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Capsules</span>
                  <span className="font-semibold text-gray-900">
                    {profileData.statistics.timeCapsules}
                  </span>
                </div>

                {profileData.profile.hasVoiceClone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Voice Recorded</span>
                    <span className="font-semibold text-gray-900">
                      {profileData.statistics.voiceMinutesRecorded} min
                    </span>
                  </div>
                )}

                {profileData.profile.hasVideoAvatar && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avatar Photos</span>
                    <span className="font-semibold text-gray-900">
                      {profileData.statistics.avatarPhotos}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipients</span>
                  <span className="font-semibold text-gray-900">
                    {profileData.recipients.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
          >
            ← Back to Editing
          </button>

          <div className="flex items-center gap-4">
            {profileData.profile.completionPercentage < 100 ? (
              <div className="text-sm text-amber-600 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Complete your profile to finalize</span>
              </div>
            ) : (
              <button
                onClick={() => navigate(`/living-legacy/${profileId}/finalize`)}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                Looks Good, Finalize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
