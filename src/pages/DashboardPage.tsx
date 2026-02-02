/**
 * Dashboard Page - Active Chats Overview
 *
 * Shows all personality profiles as cards
 * Easy navigation to individual chats
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logger } from '../utils/logger'
import {
  Plus,
  MessageCircle,
  Clock,
  Phone,
  Upload,
  CreditCard,
  Crown,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { usePayment } from '../contexts/PaymentContext'
import { PersonalityProfile } from '../types'
import { getSecure } from '../utils/secureStorage'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { loadPersonalityProfiles, deletePersonalityProfile, loadChatMessages } from '../utils/profileStorage'

interface ProfileWithStats extends PersonalityProfile {
  messageCount: number
  lastMessageTime: number | null
  unreadCount: number
}

// Voice configuration interface
interface VoiceConfig {
  type: 'cloned' | 'standard' // cloned = voice AI service, standard = OpenAI
  clonedVoiceId?: string // voice AI service voice ID (if type is 'cloned')
  clonedVoiceName?: string // voice AI service voice name
  standardVoice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' // OpenAI voice (if type is 'standard')
}

// Storage interface for checking voice samples (matches StoredProfileData in ProfileImprovementPage)
interface StoredProfileData {
  textNotes: string[]
  voiceSamples: { id: string; base64Data: string; duration: number; name: string; mimeType: string }[]
  photos: { id: string; url: string; name: string }[]
  videos: { id: string; url: string; name: string }[]
  voiceConfig?: VoiceConfig // Voice configuration for calls
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated, encryptionKey } = useAuth()
  const { user, isLoading: supabaseLoading, isConfigured } = useSupabaseAuth()
  const { subscription } = usePayment()
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setModal({ isOpen: true, title, message, type, onConfirm, confirmText, cancelText })
  }

  // Check auth: Support both old password-based and new Supabase email auth
  const isUserAuthenticated = isAuthenticated || (isConfigured && user !== null)

  useEffect(() => {
    // Wait for Supabase auth to finish loading
    if (isConfigured && supabaseLoading) {
      logger.log('Waiting for Supabase auth to load...')
      return
    }

    // Redirect to login if not authenticated
    if (!isUserAuthenticated) {
      logger.log('User not authenticated, redirecting to email-auth')
      navigate('/email-auth')
      return
    }

    logger.log('User authenticated, loading profiles')
    loadProfiles()
  }, [isUserAuthenticated, supabaseLoading])

  const loadProfiles = async () => {
    try {
      // Use centralized storage utility (handles both encrypted and Supabase database)
      const savedProfiles = await loadPersonalityProfiles(encryptionKey)
      logger.log('Loaded profiles:', savedProfiles.length)

      // Load message stats for each profile
      const profilesWithStats = await Promise.all(
        savedProfiles.map(async (profile) => {
          // Use centralized message loading (handles both encrypted and Supabase database)
          const messages = await loadChatMessages(profile.id, encryptionKey)
          const lastMessage = messages[messages.length - 1]

          return {
            ...profile,
            messageCount: messages.length,
            lastMessageTime: lastMessage?.timestamp || null,
            unreadCount: 0
          }
        })
      )

      // Sort by last message time
      profilesWithStats.sort((a, b) => {
        if (!a.lastMessageTime) return 1
        if (!b.lastMessageTime) return -1
        return b.lastMessageTime - a.lastMessageTime
      })

      setProfiles(profilesWithStats)
    } catch (error) {
      logger.error('Error loading profiles:', error)
      setProfiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProfile = () => {
    // For Supabase users: allow profile creation, credits will be checked when actually using features
    // For old password users: check subscription limits
    if (subscription) {
      const profileCount = profiles.length

      if (profileCount >= subscription.profileLimit) {
        navigate('/pricing')
        return
      }
    }

    // Allow profile creation
    navigate('/personality-builder')
  }

  const formatLastSeen = (timestamp: number | null) => {
    if (!timestamp) return 'No messages yet'

    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffMs = now.getTime() - messageDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return messageDate.toLocaleDateString()
  }

  const handleDeleteProfile = async (profileId: string, profileName: string) => {
    // Confirm deletion
    showModal(
      'Delete Profile',
      `Are you sure you want to delete "${profileName}"? This will delete all conversations and data. This action cannot be undone.`,
      'warning',
      async () => {
        try {
          // Use centralized delete utility (handles both encrypted and Supabase database)
          await deletePersonalityProfile(profileId, encryptionKey)

          // Reload profiles
          await loadProfiles()

          showModal(
            'Profile Deleted',
            `The profile "${profileName}" has been successfully deleted.`,
            'success'
          )
        } catch (error) {
          logger.error('Error deleting profile:', error)
          showModal(
            'Delete Failed',
            'Something went wrong while deleting the profile. Please try again.',
            'error'
          )
        }
      },
      'Yes, Delete',
      'Cancel'
    )
  }

  const handleStartCall = async (profile: ProfileWithStats) => {
    try {
      // Load profile data from storage
      let profileData: StoredProfileData | null = null

      if (encryptionKey) {
        // Old password-based auth: use encrypted storage
        profileData = await getSecure<StoredProfileData>(
          `profile_data_${profile.id}`,
          encryptionKey
        )
      } else {
        // Supabase users: use plain localStorage
        const stored = localStorage.getItem(`profile_data_${profile.id}`)
        profileData = stored ? JSON.parse(stored) : null
      }

      if (!profileData || !profileData.voiceSamples || profileData.voiceSamples.length === 0) {
        // No voice samples - show modal and redirect to improvement page
        showModal(
          'Voice Sample Required',
          `To enable voice calls with ${profile.name}, you need to add a voice sample first. This allows us to clone their voice for realistic conversations.\n\nWould you like to add a voice sample now?`,
          'info',
          () => navigate(`/profile-improvement?profileId=${profile.id}&focus=voice`)
        )
        return
      }

      // Voice samples exist - navigate to call page
      const params = new URLSearchParams({
        personalityId: profile.id,
        name: profile.name,
        relationship: profile.relationship || '',
        description: profile.systemPrompt || `${profile.name} is a ${profile.relationship} with a warm and loving personality.`
      })

      // Add voice config if available
      if (profileData.voiceConfig) {
        params.append('voiceType', profileData.voiceConfig.type)
        if (profileData.voiceConfig.type === 'cloned' && profileData.voiceConfig.clonedVoiceId) {
          params.append('voiceId', profileData.voiceConfig.clonedVoiceId)
        } else if (profileData.voiceConfig.type === 'standard' && profileData.voiceConfig.standardVoice) {
          params.append('voice', profileData.voiceConfig.standardVoice)
        }
      }

      navigate(`/voice-call?${params.toString()}`)
    } catch (error) {
      logger.error('Error checking voice samples:', error)
      // On error, show modal and redirect to improvement page
      showModal(
        'Voice Sample Required',
        `To enable voice calls with ${profile.name}, you need to add a voice sample first.\n\nWould you like to add one now?`,
        'warning',
        () => navigate(`/profile-improvement?profileId=${profile.id}&focus=voice`)
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <Header variant="transparent" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title with Subscription Info */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Conversations</h1>
              <p className="text-gray-600">
                {profiles.length === 0
                  ? 'Start chatting with AI personalities'
                  : `You have ${profiles.length} active conversation${profiles.length === 1 ? '' : 's'}`
                }
              </p>
            </div>

            {/* Subscription Badge */}
            <div className="flex items-center gap-3">
              {subscription && (
                <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-orange-200">
                  <div className="flex items-center gap-2">
                    {subscription.plan === 'pro' && <Crown className="w-4 h-4 text-orange-500" />}
                    {subscription.plan === 'lifetime' && <Crown className="w-4 h-4 text-purple-500" />}
                    <span className="text-sm font-semibold text-gray-900">
                      {subscription.plan === 'free' && `Free Plan (${profiles.length}/1)`}
                      {subscription.plan === 'pro' && 'Pro Plan'}
                      {subscription.plan === 'lifetime' && 'Lifetime Access'}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition font-medium text-sm shadow-sm flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Upgrade</span>
              </button>
            </div>
          </div>
        </div>
        {profiles.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full mb-6">
              <MessageCircle className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No conversations yet
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Create your first personality profile to start chatting with AI that learns from real conversations.
            </p>
            <button
              onClick={handleCreateProfile}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition"
            >
              <Plus className="w-5 h-5" />
              Create First Profile
            </button>
          </div>
        ) : (
          <>
            {/* Create New Profile Button */}
            <div className="mb-8">
              <button
                onClick={handleCreateProfile}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
              >
                <Plus className="w-5 h-5" />
                Create New Profile
              </button>
            </div>

            {/* Profile Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-left group border border-transparent hover:border-orange-200"
                >
                  {/* Profile Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex-shrink-0 flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                      {(profile.photoUrls && profile.photoUrls.length > 0) || profile.photoUrl ? (
                        <img
                          src={profile.photoUrls?.[0] || profile.photoUrl}
                          alt={profile.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        profile.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                        {profile.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {profile.relationship}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MessageCircle className="w-4 h-4 text-orange-500" />
                      <span>{profile.messageCount} messages</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{formatLastSeen(profile.lastMessageTime)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-orange-100 space-y-2">
                    {/* Primary: Open Chat */}
                    <button
                      onClick={() => navigate(`/chat?profile=${profile.id}`)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-rose-600 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Open Chat
                    </button>

                    {/* Secondary: Voice Call */}
                    <button
                      onClick={() => handleStartCall(profile)}
                      className="w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition flex items-center justify-center gap-2 border border-green-200"
                      title="Start Voice Call (requires voice sample)"
                    >
                      <Phone className="w-4 h-4" />
                      Voice Call
                    </button>

                    {/* Tertiary: Improve Profile */}
                    <button
                      onClick={() => navigate(`/profile-improvement?profileId=${profile.id}`)}
                      className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-200 text-sm"
                      title="Add text, photos, videos or voice samples to improve this profile"
                    >
                      <Upload className="w-4 h-4" />
                      Improve Profile
                    </button>

                    {/* Delete Profile */}
                    <button
                      onClick={() => handleDeleteProfile(profile.id, profile.name)}
                      className="w-full px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition flex items-center justify-center gap-2 border border-red-200 text-sm"
                      title="Delete this profile permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText || "OK"}
        cancelText={modal.cancelText || "Cancel"}
        showCancel={!!modal.onConfirm}
        onConfirm={modal.onConfirm}
      />
    </div>
  )
}
