/**
 * Tavus Video Call Page
 *
 * Real-time video conversation with Tavus interactive avatar
 * Embedded Daily.co video call interface
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { PersonalityProfile } from '../types'
import { loadPersonalityProfiles } from '../utils/profileStorage'
import { createTavusConversation, endTavusConversation } from '../utils/tavusAPI'
import { logger } from '../utils/logger'
import { ArrowLeft, Phone, Loader } from 'lucide-react'

type CallStatus = 'connecting' | 'connected' | 'ended' | 'error'

export default function VideoTavusPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSupabaseAuth()

  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting')
  const [conversationUrl, setConversationUrl] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  const callStartTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<number | null>(null)

  const profileId = searchParams.get('profile')

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) {
        setError('No profile selected')
        setCallStatus('error')
        return
      }

      try {
        const profiles = await loadPersonalityProfiles(null)
        const selectedProfile = profiles.find(p => p.id === profileId)

        if (!selectedProfile) {
          setError('Profile not found')
          setCallStatus('error')
          return
        }

        setProfile(selectedProfile)
      } catch (err) {
        logger.error('Error loading profile:', err)
        setError('Failed to load profile')
        setCallStatus('error')
      }
    }

    loadProfile()
  }, [profileId, user])

  // Start video call
  useEffect(() => {
    if (!profile || !user) return

    startVideoCall()
  }, [profile, user])

  // Duration tracker
  useEffect(() => {
    if (callStatus === 'connected' && callStartTimeRef.current) {
      durationIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current!) / 1000)
        setDuration(elapsed)
      }, 1000)
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [callStatus])

  const startVideoCall = async () => {
    if (!profile || !user) return

    try {
      logger.log('Starting Tavus video call...', { profileId: profile.id })

      // Create conversation
      const conversation = await createTavusConversation(profile.id)

      logger.log('Conversation created:', conversation)

      setConversationId(conversation.conversationId)
      setConversationUrl(conversation.conversationUrl)
      callStartTimeRef.current = Date.now()
      setCallStatus('connected')

    } catch (err) {
      logger.error('Error starting video call:', err)
      setError(err instanceof Error ? err.message : 'Failed to start video call')
      setCallStatus('error')
    }
  }

  const endCall = async () => {
    logger.log('Ending Tavus video call...')

    if (conversationId && callStartTimeRef.current) {
      const durationSeconds = Math.floor((Date.now() - callStartTimeRef.current) / 1000)

      try {
        await endTavusConversation(conversationId, durationSeconds)
      } catch (err) {
        logger.error('Error ending conversation:', err)
      }
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }

    setCallStatus('ended')

    // Return to chat after delay
    setTimeout(() => {
      navigate(`/chat?profile=${profile?.id}`)
    }, 2000)
  }

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400 flex items-center space-x-2">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (callStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-red-400">Call Failed</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate(`/chat?profile=${profile.id}`)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Chat
          </button>
        </div>
      </div>
    )
  }

  if (callStatus === 'ended') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 space-y-4 text-center">
          <h2 className="text-xl font-semibold text-gray-300">Call Ended</h2>
          <p className="text-gray-400">Duration: {formatDuration(duration)}</p>
          <p className="text-sm text-gray-500">Returning to chat...</p>
        </div>
      </div>
    )
  }

  if (callStatus === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="text-center space-y-4">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-300 text-lg">Connecting to {profile.name}...</p>
          <p className="text-gray-500 text-sm">Setting up video call</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen bg-black">
      {/* Tavus Video Call (Daily.co Embedded) */}
      {conversationUrl && (
        <iframe
          src={conversationUrl}
          allow="camera; microphone; autoplay; display-capture; fullscreen"
          className="w-full h-full border-0"
          title="Tavus Video Call"
        />
      )}

      {/* Call Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={endCall}
            className="flex items-center space-x-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          {/* Call Info */}
          <div className="text-center">
            <p className="text-white font-medium">{profile.name}</p>
            <p className="text-white/60 text-sm">{formatDuration(duration)}</p>
          </div>

          {/* Spacer */}
          <div className="w-20" />
        </div>
      </div>

      {/* End Call Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={endCall}
          className="bg-red-600 text-white px-8 py-4 rounded-full hover:bg-red-700 flex items-center space-x-2 shadow-lg"
        >
          <Phone className="h-5 w-5" />
          <span className="font-medium">End Call</span>
        </button>
      </div>
    </div>
  )
}
