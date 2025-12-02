import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  Target,
  Award,
  User,
  Users,
  Mic,
  Video,
  Gift,
  Heart,
  Shield,
  FileText,
  Clock,
  Star,
  Zap,
  Crown,
  ChevronRight,
  Info
} from 'lucide-react'

interface ProgressData {
  tier: 'essential' | 'complete' | 'premium'
  profile: {
    basicInfo: boolean
    profilePhoto: boolean
    bio: boolean
  }
  recipients: {
    added: number
    configured: number
  }
  messages: {
    lifeStory: number
    advice: number
    timeCapsules: number
    specific: number
    everyday: number
  }
  voice: {
    samplesRecorded: number
    voiceCloned: boolean
  }
  avatar: {
    photosUploaded: number
    avatarCreated: boolean
  }
  content: {
    totalMessages: number
    totalDuration: number
    averageQuality: number
  }
  finalization: {
    executorAssigned: boolean
    accessControlSet: boolean
    reviewed: boolean
  }
}

interface ChecklistItem {
  id: string
  label: string
  description: string
  completed: boolean
  required: boolean
  icon: any
  action?: () => void
  actionLabel?: string
}

interface TierRequirement {
  tier: 'essential' | 'complete' | 'premium'
  label: string
  icon: any
  color: string
  requirements: {
    messages: number
    recipients: number
    voiceSamples: number
    avatarPhotos: number
    timeCapsules: number
  }
}

const TIER_REQUIREMENTS: TierRequirement[] = [
  {
    tier: 'essential',
    label: 'Essential',
    icon: Star,
    color: 'blue',
    requirements: {
      messages: 3,
      recipients: 1,
      voiceSamples: 3,
      avatarPhotos: 5,
      timeCapsules: 0
    }
  },
  {
    tier: 'complete',
    label: 'Complete',
    icon: Zap,
    color: 'purple',
    requirements: {
      messages: 10,
      recipients: 3,
      voiceSamples: 5,
      avatarPhotos: 10,
      timeCapsules: 2
    }
  },
  {
    tier: 'premium',
    label: 'Premium',
    icon: Crown,
    color: 'orange',
    requirements: {
      messages: 20,
      recipients: 5,
      voiceSamples: 10,
      avatarPhotos: 20,
      timeCapsules: 5
    }
  }
]

export default function LivingLegacyProgressDashboardPage() {
  const navigate = useNavigate()

  // Mock data - in real app, this would come from API/database
  const [progressData] = useState<ProgressData>({
    tier: 'complete',
    profile: {
      basicInfo: true,
      profilePhoto: true,
      bio: true
    },
    recipients: {
      added: 2,
      configured: 2
    },
    messages: {
      lifeStory: 3,
      advice: 2,
      timeCapsules: 1,
      specific: 1,
      everyday: 1
    },
    voice: {
      samplesRecorded: 4,
      voiceCloned: false
    },
    avatar: {
      photosUploaded: 7,
      avatarCreated: false
    },
    content: {
      totalMessages: 8,
      totalDuration: 450, // seconds
      averageQuality: 82
    },
    finalization: {
      executorAssigned: true,
      accessControlSet: true,
      reviewed: false
    }
  })

  const currentTier = TIER_REQUIREMENTS.find(t => t.tier === progressData.tier)!

  // Calculate overall completion
  const completionPercentage = useMemo(() => {
    const requirements = currentTier.requirements

    const scores = [
      // Profile completion (10%)
      (progressData.profile.basicInfo && progressData.profile.profilePhoto && progressData.profile.bio) ? 10 : 0,

      // Recipients (15%)
      Math.min((progressData.recipients.configured / requirements.recipients) * 15, 15),

      // Messages (30%)
      Math.min((progressData.content.totalMessages / requirements.messages) * 30, 30),

      // Voice samples (15%)
      Math.min((progressData.voice.samplesRecorded / requirements.voiceSamples) * 15, 15),

      // Avatar photos (10%)
      Math.min((progressData.avatar.photosUploaded / requirements.avatarPhotos) * 10, 10),

      // Time capsules (10%)
      Math.min((progressData.messages.timeCapsules / requirements.timeCapsules) * 10, 10),

      // Finalization (10%)
      (progressData.finalization.executorAssigned &&
       progressData.finalization.accessControlSet &&
       progressData.finalization.reviewed) ? 10 :
       (progressData.finalization.executorAssigned && progressData.finalization.accessControlSet) ? 7 :
       progressData.finalization.executorAssigned ? 3 : 0
    ]

    return Math.round(scores.reduce((a, b) => a + b, 0))
  }, [progressData, currentTier])

  // Generate checklist items
  const checklistItems = useMemo((): ChecklistItem[] => {
    const requirements = currentTier.requirements

    return [
      {
        id: 'profile',
        label: 'Complete Your Profile',
        description: 'Add basic information, photo, and bio',
        completed: progressData.profile.basicInfo && progressData.profile.profilePhoto && progressData.profile.bio,
        required: true,
        icon: User,
        action: () => navigate('/living-legacy/create/profile'),
        actionLabel: 'Edit Profile'
      },
      {
        id: 'recipients',
        label: `Add Recipients (${progressData.recipients.configured}/${requirements.recipients})`,
        description: 'Configure who will receive your legacy',
        completed: progressData.recipients.configured >= requirements.recipients,
        required: true,
        icon: Users,
        action: () => navigate('/living-legacy/recipients'),
        actionLabel: 'Manage Recipients'
      },
      {
        id: 'messages',
        label: `Record Messages (${progressData.content.totalMessages}/${requirements.messages})`,
        description: 'Share your stories, advice, and memories',
        completed: progressData.content.totalMessages >= requirements.messages,
        required: true,
        icon: Mic,
        action: () => navigate('/living-legacy/record-message'),
        actionLabel: 'Record Messages'
      },
      {
        id: 'voice',
        label: `Voice Samples (${progressData.voice.samplesRecorded}/${requirements.voiceSamples})`,
        description: 'Record voice samples for AI cloning',
        completed: progressData.voice.samplesRecorded >= requirements.voiceSamples,
        required: true,
        icon: Mic,
        action: () => navigate('/living-legacy/voice-setup'),
        actionLabel: 'Record Voice'
      },
      {
        id: 'avatar',
        label: `Upload Photos (${progressData.avatar.photosUploaded}/${requirements.avatarPhotos})`,
        description: 'Photos for creating your digital avatar',
        completed: progressData.avatar.photosUploaded >= requirements.avatarPhotos,
        required: true,
        icon: Video,
        action: () => navigate('/living-legacy/avatar-setup'),
        actionLabel: 'Upload Photos'
      },
      {
        id: 'timecapsules',
        label: `Time Capsules (${progressData.messages.timeCapsules}/${requirements.timeCapsules})`,
        description: 'Messages for future milestones',
        completed: progressData.messages.timeCapsules >= requirements.timeCapsules,
        required: requirements.timeCapsules > 0,
        icon: Gift,
        action: () => navigate('/living-legacy/time-capsule'),
        actionLabel: 'Create Time Capsule'
      },
      {
        id: 'executor',
        label: 'Assign Executor',
        description: 'Choose who will manage your legacy',
        completed: progressData.finalization.executorAssigned,
        required: true,
        icon: Shield,
        action: () => navigate('/living-legacy/finalize'),
        actionLabel: 'Assign Executor'
      },
      {
        id: 'access',
        label: 'Configure Access Control',
        description: 'Set permissions for recipients',
        completed: progressData.finalization.accessControlSet,
        required: true,
        icon: Shield,
        action: () => navigate('/living-legacy/finalize'),
        actionLabel: 'Set Permissions'
      },
      {
        id: 'review',
        label: 'Review & Finalize',
        description: 'Final review before activation',
        completed: progressData.finalization.reviewed,
        required: true,
        icon: FileText,
        action: () => navigate('/living-legacy/finalize'),
        actionLabel: 'Review'
      }
    ]
  }, [progressData, currentTier, navigate])

  const completedItems = checklistItems.filter(item => item.completed).length
  const totalRequiredItems = checklistItems.filter(item => item.required).length

  // Quality recommendations
  const recommendations = useMemo(() => {
    const recs = []

    // Content quality
    if (progressData.content.averageQuality < 70) {
      recs.push({
        type: 'warning',
        title: 'Improve Recording Quality',
        description: 'Some recordings have low audio quality. Consider re-recording in a quieter environment.',
        action: () => navigate('/living-legacy/record-message'),
        actionLabel: 'View Messages'
      })
    }

    // Content diversity
    const totalMessages = progressData.content.totalMessages
    if (progressData.messages.lifeStory < totalMessages * 0.3) {
      recs.push({
        type: 'info',
        title: 'Add More Life Stories',
        description: 'Share more about your life experiences and personal history.',
        action: () => navigate('/living-legacy/record-message'),
        actionLabel: 'Record Story'
      })
    }

    if (progressData.messages.advice < 2) {
      recs.push({
        type: 'info',
        title: 'Share Your Wisdom',
        description: 'Record advice and lessons learned to guide future generations.',
        action: () => navigate('/living-legacy/record-message'),
        actionLabel: 'Record Advice'
      })
    }

    // Voice cloning
    if (progressData.voice.samplesRecorded >= currentTier.requirements.voiceSamples && !progressData.voice.voiceCloned) {
      recs.push({
        type: 'success',
        title: 'Ready for Voice Cloning',
        description: 'You have enough samples to create your AI voice clone.',
        action: () => navigate('/living-legacy/voice-setup'),
        actionLabel: 'Clone Voice'
      })
    }

    // Avatar creation
    if (progressData.avatar.photosUploaded >= currentTier.requirements.avatarPhotos && !progressData.avatar.avatarCreated) {
      recs.push({
        type: 'success',
        title: 'Ready for Avatar Creation',
        description: 'You have enough photos to create your digital avatar.',
        action: () => navigate('/living-legacy/avatar-setup'),
        actionLabel: 'Create Avatar'
      })
    }

    // Time capsules
    if (currentTier.tier !== 'essential' && progressData.messages.timeCapsules === 0) {
      recs.push({
        type: 'info',
        title: 'Create Time Capsules',
        description: 'Schedule messages for important future milestones.',
        action: () => navigate('/living-legacy/time-capsule'),
        actionLabel: 'Create Capsule'
      })
    }

    return recs
  }, [progressData, currentTier, navigate])

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100'
    if (percentage >= 70) return 'text-blue-600 bg-blue-100'
    if (percentage >= 50) return 'text-orange-600 bg-orange-100'
    return 'text-rose-600 bg-rose-100'
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-500'
    if (percentage >= 70) return 'from-blue-500 to-cyan-500'
    if (percentage >= 50) return 'from-orange-500 to-yellow-500'
    return 'from-rose-500 to-pink-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
              <p className="text-sm text-gray-600">Track your Living Legacy completion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Overall Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <currentTier.icon className={`w-6 h-6 text-${currentTier.color}-600`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentTier.label} Tier</h2>
                  <p className="text-white/80 text-sm">Overall Completion</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full ${getStatusColor(completionPercentage)}`}>
                <span className="text-2xl font-bold">{completionPercentage}%</span>
              </div>
            </div>

            <div className="relative">
              <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressBarColor(completionPercentage)} transition-all duration-500`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-white/90 text-sm">
              <div>
                <div className="font-semibold text-white">{completedItems}/{totalRequiredItems}</div>
                <div className="text-white/70">Tasks Complete</div>
              </div>
              <div>
                <div className="font-semibold text-white">{progressData.content.totalMessages}</div>
                <div className="text-white/70">Messages Recorded</div>
              </div>
              <div>
                <div className="font-semibold text-white">{Math.floor(progressData.content.totalDuration / 60)} min</div>
                <div className="text-white/70">Total Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Recommendations
            </h3>
            {recommendations.map((rec, index) => {
              const Icon = rec.type === 'warning' ? AlertCircle : rec.type === 'success' ? CheckCircle2 : Info
              const colorClass = rec.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                                rec.type === 'success' ? 'border-green-200 bg-green-50' :
                                'border-blue-200 bg-blue-50'
              const iconColor = rec.type === 'warning' ? 'text-orange-600' :
                               rec.type === 'success' ? 'text-green-600' :
                               'text-blue-600'

              return (
                <div key={index} className={`border ${colorClass} rounded-xl p-4`}>
                  <div className="flex items-start gap-4">
                    <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      <button
                        onClick={rec.action}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        {rec.actionLabel}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Checklist */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Completion Checklist
          </h3>
          <div className="space-y-3">
            {checklistItems.map(item => {
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border ${item.completed ? 'border-green-200' : 'border-gray-200'} p-4 hover:shadow-md transition-all`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {item.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={`font-semibold ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {item.label}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        {!item.completed && item.action && (
                          <button
                            onClick={item.action}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all text-sm font-medium whitespace-nowrap"
                          >
                            {item.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Content Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8 text-rose-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.lifeStory}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Life Stories</h4>
              <p className="text-sm text-gray-600">Personal history shared</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.advice}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Advice & Wisdom</h4>
              <p className="text-sm text-gray-600">Guidance messages</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Gift className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.timeCapsules}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Time Capsules</h4>
              <p className="text-sm text-gray-600">Scheduled for future</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.specific}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Personal Messages</h4>
              <p className="text-sm text-gray-600">For specific people</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.messages.everyday}</span>
              </div>
              <h4 className="font-semibold text-gray-900">Everyday Moments</h4>
              <p className="text-sm text-gray-600">Daily life captured</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{progressData.content.averageQuality}%</span>
              </div>
              <h4 className="font-semibold text-gray-900">Avg. Quality Score</h4>
              <p className="text-sm text-gray-600">Content quality rating</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {completionPercentage < 100 && (
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 rounded-2xl p-8 text-center text-white">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">
              {completionPercentage >= 90 ? "You're Almost There!" :
               completionPercentage >= 70 ? "Great Progress!" :
               completionPercentage >= 50 ? "Keep Going!" :
               "Let's Get Started!"}
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              {completionPercentage >= 90 ? "Just a few more steps to complete your Living Legacy and preserve your voice forever." :
               completionPercentage >= 70 ? "You're making excellent progress. Keep adding content to enrich your legacy." :
               completionPercentage >= 50 ? "You're halfway there! Continue recording to build a comprehensive legacy." :
               "Start creating your Living Legacy today and leave a lasting impact for generations to come."}
            </p>
            <button
              onClick={() => {
                const nextIncomplete = checklistItems.find(item => !item.completed && item.action)
                if (nextIncomplete?.action) {
                  nextIncomplete.action()
                }
              }}
              className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Building
            </button>
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-center text-white">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              You've completed your Living Legacy. Your voice, wisdom, and memories are now preserved for future generations.
            </p>
            <button
              onClick={() => navigate('/living-legacy/finalize')}
              className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Review & Activate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 19H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 9H4C3.46957 9 2.96086 8.78929 2.58579 8.41421C2.21071 8.03914 2 7.53043 2 7V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 9H20C20.5304 9 21.0391 8.78929 21.4142 8.41421C21.7893 8.03914 22 7.53043 22 7V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 4H18V9C18 10.5913 17.3679 12.1174 16.2426 13.2426C15.1174 14.3679 13.5913 15 12 15C10.4087 15 8.88258 14.3679 7.75736 13.2426C6.63214 12.1174 6 10.5913 6 9V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
