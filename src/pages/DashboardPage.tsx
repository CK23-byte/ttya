/**
 * Dashboard Page - Active Chats Overview
 *
 * Shows all personality profiles as cards
 * Easy navigation to individual chats
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  MessageCircle,
  LogOut,
  Clock,
  Home
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePayment } from '../contexts/PaymentContext'
import { getSecure } from '../utils/secureStorage'
import { PersonalityProfile, Message } from '../types'

const MESSAGES_STORAGE_PREFIX = 'chat_messages_'
const PROFILES_STORAGE_KEY = 'personality_profiles'

interface ProfileWithStats extends PersonalityProfile {
  messageCount: number
  lastMessageTime: number | null
  unreadCount: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated, encryptionKey, logout } = useAuth()
  const { subscription } = usePayment()
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    loadProfiles()
  }, [isAuthenticated, encryptionKey])

  const loadProfiles = async () => {
    if (!encryptionKey) return

    try {
      const savedProfiles = await getSecure<PersonalityProfile[]>(
        PROFILES_STORAGE_KEY,
        encryptionKey
      ) || []

      // Load message stats for each profile
      const profilesWithStats = await Promise.all(
        savedProfiles.map(async (profile) => {
          const messages = await getSecure<Message[]>(
            `${MESSAGES_STORAGE_PREFIX}${profile.id}`,
            encryptionKey
          ) || []

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
      console.error('Error loading profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProfile = () => {
    if (!subscription) {
      navigate('/pricing')
      return
    }

    const profileCount = profiles.length

    if (profileCount >= subscription.profileLimit) {
      navigate('/pricing')
    } else {
      navigate('/personality-builder')
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Home"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Chats</h1>
                <p className="text-sm text-gray-600">
                  {subscription?.plan === 'free' && `${profiles.length}/1 profile used`}
                  {subscription?.plan === 'pro' && `Pro Plan - ${profiles.length} profiles`}
                  {subscription?.plan === 'lifetime' && `Lifetime - ${profiles.length} profiles`}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                v2.3.0
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {profiles.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-6">
              <MessageCircle className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No conversations yet
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Create your first personality profile to start chatting with AI that learns from real conversations.
            </p>
            <button
              onClick={handleCreateProfile}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition"
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                <Plus className="w-5 h-5" />
                Create New Profile
              </button>
            </div>

            {/* Profile Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => navigate(`/chat?profile=${profile.id}`)}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left group"
                >
                  {/* Profile Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center text-white font-semibold text-xl">
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
                      <MessageCircle className="w-4 h-4" />
                      <span>{profile.messageCount} messages</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatLastSeen(profile.lastMessageTime)}</span>
                    </div>
                  </div>

                  {/* Action Hint */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Click to open chat</span>
                      <MessageCircle className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
