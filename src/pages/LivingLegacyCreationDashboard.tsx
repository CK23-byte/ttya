import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Upload, Mic, BookOpen, MessageCircle, Heart, Sparkles, CheckCircle2, Clock,
  ArrowRight, User, Settings, LogOut, ChevronRight, AlertCircle, Camera
} from 'lucide-react'

interface ProfileData {
  profile: {
    id: string
    fullName: string
    profilePhotoUrl?: string
    status: string
    completionPercentage: number
    tier: string
    hasVoiceClone: boolean
    hasVideoAvatar: boolean
    lastEditedAt: string
    createdAt: string
  }
  recipients: Array<{ name: string; relationship: string; isPrimary: boolean }>
  executor: { name: string; email: string } | null
  statistics: {
    totalMessages: number
    completedMessages: number
    timeCapsules: number
    messagesByCategory: Record<string, number>
    voiceMinutesRecorded: number
    voiceMinutesNeeded: number
    avatarPhotos: number
    avatarPhotosNeeded: number
    uploadCounts: Record<string, number>
  }
  voiceClone: { status: string } | null
  videoAvatar: { status: string } | null
}

interface CreationStep {
  id: number
  title: string
  icon: any
  description: string
  status: 'completed' | 'in_progress' | 'not_started'
  progress?: number
  items?: Array<{ label: string; status: 'completed' | 'pending' }>
  action: string
  actionPath: string
}

export default function LivingLegacyCreationDashboard() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    loadProfile()
  }, [profileId])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/legacy/get-profile?profileId=${profileId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile')
      }

      setProfileData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getCreationSteps = (): CreationStep[] => {
    if (!profileData) return []

    const { statistics, profile, voiceClone, videoAvatar } = profileData

    // Determine status for each step based on data
    const hasUploads = (statistics.uploadCounts.whatsapp || 0) + (statistics.uploadCounts.photos || 0) > 0
    const uploadsComplete = hasUploads

    const voiceComplete = !profile.hasVoiceClone || (voiceClone?.status === 'completed')
    const voiceInProgress = profile.hasVoiceClone && voiceClone?.status === 'collecting_samples'
    const voiceMinutes = statistics.voiceMinutesRecorded

    const avatarComplete = !profile.hasVideoAvatar || (videoAvatar?.status === 'completed')
    const avatarInProgress = profile.hasVideoAvatar && videoAvatar?.status === 'collecting_photos'
    const avatarPhotos = statistics.avatarPhotos

    const lifeStoryMessages = statistics.messagesByCategory['life_story'] || 0
    const wisdomMessages = statistics.messagesByCategory['wisdom'] || 0
    const specificMessages = statistics.messagesByCategory['specific_person'] || 0

    return [
      {
        id: 1,
        title: 'Upload Existing Data',
        icon: Upload,
        description: 'Upload WhatsApp chats, photos, videos',
        status: uploadsComplete ? 'completed' : 'not_started',
        items: [
          { label: `WhatsApp: ${statistics.uploadCounts.whatsapp || 0} files`, status: (statistics.uploadCounts.whatsapp || 0) > 0 ? 'completed' : 'pending' },
          { label: `Photos: ${statistics.uploadCounts.photos || 0} uploaded`, status: (statistics.uploadCounts.photos || 0) > 0 ? 'completed' : 'pending' },
          { label: `Videos: ${statistics.uploadCounts.videos || 0} uploaded`, status: (statistics.uploadCounts.videos || 0) > 0 ? 'completed' : 'pending' }
        ],
        action: 'Upload Files',
        actionPath: `/living-legacy/${profileId}/upload`
      },
      {
        id: 2,
        title: 'Voice & Avatar Setup',
        icon: Mic,
        description: profile.hasVoiceClone && profile.hasVideoAvatar
          ? 'Set up voice cloning and video avatar'
          : profile.hasVoiceClone
          ? 'Record voice samples'
          : 'Skip this step (Essential tier)',
        status: voiceComplete && avatarComplete ? 'completed' : voiceInProgress || avatarInProgress ? 'in_progress' : 'not_started',
        progress: profile.hasVoiceClone ? Math.min(100, (voiceMinutes / 15) * 100) : 100,
        items: profile.hasVoiceClone ? [
          { label: `Voice samples: ${voiceMinutes}/15 min recorded`, status: voiceMinutes >= 15 ? 'completed' : 'pending' },
          { label: `Avatar photos: ${avatarPhotos} uploaded`, status: avatarPhotos >= 20 ? 'completed' : 'pending' }
        ] : [],
        action: profile.hasVoiceClone ? 'Continue Recording' : 'Skip',
        actionPath: `/living-legacy/${profileId}/voice-setup`
      },
      {
        id: 3,
        title: 'Life Story & History',
        icon: BookOpen,
        description: 'Share your journey, experiences, and memories',
        status: lifeStoryMessages >= 5 ? 'completed' : lifeStoryMessages > 0 ? 'in_progress' : 'not_started',
        progress: Math.min(100, (lifeStoryMessages / 5) * 100),
        items: [
          { label: `${lifeStoryMessages} life story segments recorded`, status: lifeStoryMessages >= 5 ? 'completed' : 'pending' }
        ],
        action: 'Add Life Stories',
        actionPath: `/living-legacy/${profileId}/record?category=life_story`
      },
      {
        id: 4,
        title: 'Messages for Loved Ones',
        icon: MessageCircle,
        description: 'Record personal messages for each recipient',
        status: specificMessages >= profileData.recipients.length ? 'completed' : specificMessages > 0 ? 'in_progress' : 'not_started',
        progress: Math.min(100, (specificMessages / profileData.recipients.length) * 100),
        items: profileData.recipients.slice(0, 3).map(r => ({
          label: `For ${r.name} (${r.relationship}): ${statistics.messagesByCategory[`specific_${r.name}`] || 0} messages`,
          status: (statistics.messagesByCategory[`specific_${r.name}`] || 0) > 0 ? 'completed' : 'pending'
        })),
        action: 'Add Messages',
        actionPath: `/living-legacy/${profileId}/record?category=specific_person`
      },
      {
        id: 5,
        title: 'Wisdom & Advice',
        icon: Heart,
        description: 'Share lessons learned and guidance',
        status: wisdomMessages >= 3 ? 'completed' : wisdomMessages > 0 ? 'in_progress' : 'not_started',
        progress: Math.min(100, (wisdomMessages / 3) * 100),
        items: [
          { label: `${wisdomMessages} wisdom messages recorded`, status: wisdomMessages >= 3 ? 'completed' : 'pending' }
        ],
        action: 'Share Wisdom',
        actionPath: `/living-legacy/${profileId}/record?category=wisdom`
      },
      {
        id: 6,
        title: 'Time Capsule Messages',
        icon: Sparkles,
        description: 'Create messages for future milestones',
        status: statistics.timeCapsules >= 3 ? 'completed' : statistics.timeCapsules > 0 ? 'in_progress' : 'not_started',
        progress: Math.min(100, (statistics.timeCapsules / 3) * 100),
        items: [
          { label: `${statistics.timeCapsules} time capsules created`, status: statistics.timeCapsules >= 3 ? 'completed' : 'pending' }
        ],
        action: 'Create Time Capsules',
        actionPath: `/living-legacy/${profileId}/time-capsule`
      },
      {
        id: 7,
        title: 'Review & Finalize',
        icon: CheckCircle2,
        description: 'Preview your legacy and generate notary link',
        status: profile.completionPercentage >= 100 ? 'completed' : 'not_started',
        items: [
          { label: 'Preview your legacy', status: 'pending' },
          { label: 'Generate notary link', status: profile.completionPercentage >= 100 ? 'completed' : 'pending' }
        ],
        action: profile.completionPercentage >= 100 ? 'Finalize' : 'Not Ready Yet',
        actionPath: `/living-legacy/${profileId}/finalize`
      }
    ]
  }

  const getNextSteps = () => {
    if (!profileData) return []

    const steps = getCreationSteps()
    const incomplete = steps.filter(s => s.status !== 'completed')
    return incomplete.slice(0, 3)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />
      case 'in_progress':
        return <Clock className="w-6 h-6 text-orange-500 animate-pulse" />
      default:
        return <AlertCircle className="w-6 h-6 text-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'in_progress':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your legacy...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { profile, statistics } = profileData
  const steps = getCreationSteps()
  const nextSteps = getNextSteps()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Creating Your Living Legacy</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/account')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Account Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Exit to Dashboard"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative">
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <button
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
                title="Change Photo"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{profile.fullName}'s Living Legacy</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                  profile.tier === 'complete' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)} Tier
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progress: {profile.completionPercentage}% Complete
                  </span>
                  <span className="text-sm text-gray-500">
                    Last edited: {new Date(profile.lastEditedAt || profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${profile.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{statistics.completedMessages}</div>
                  <div className="text-xs text-gray-600">Messages</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{statistics.timeCapsules}</div>
                  <div className="text-xs text-gray-600">Time Capsules</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{profileData.recipients.length}</div>
                  <div className="text-xs text-gray-600">Recipients</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {steps.filter(s => s.status === 'completed').length}/{steps.length}
                  </div>
                  <div className="text-xs text-gray-600">Steps Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Next Steps
            </h3>
            <div className="space-y-3">
              {nextSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <step.icon className="w-5 h-5" />
                    <span className="font-medium">{step.title}</span>
                  </div>
                  <button
                    onClick={() => navigate(step.actionPath)}
                    className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
                  >
                    {step.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creation Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all ${getStatusColor(step.status)}`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {index + 1}. {step.title}
                        </h3>
                        {step.status === 'completed' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Complete
                          </span>
                        )}
                        {step.status === 'in_progress' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(step.actionPath)}
                        disabled={step.id === 7 && profile.completionPercentage < 100}
                        className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                          step.id === 7 && profile.completionPercentage < 100
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600'
                        }`}
                      >
                        {step.action} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4">{step.description}</p>

                    {step.progress !== undefined && step.progress < 100 && (
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {step.items && step.items.length > 0 && (
                      <div className="space-y-2">
                        {step.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                            <span className={item.status === 'completed' ? 'text-gray-700' : 'text-gray-500'}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {profile.completionPercentage >= 100 && (
          <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Your Legacy is Complete! 🎉
            </h3>
            <p className="text-gray-600 mb-6">
              You're ready to preview your legacy and generate the notary activation link.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(`/living-legacy/${profileId}/preview`)}
                className="px-6 py-3 bg-white border-2 border-green-500 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Preview Your Legacy
              </button>
              <button
                onClick={() => navigate(`/living-legacy/${profileId}/finalize`)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition"
              >
                Finalize & Generate Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
