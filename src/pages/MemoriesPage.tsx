/**
 * Memories Page
 *
 * Upload system for WhatsApp exports, photos, and audio clips
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { setSecure, getSecure } from '../utils/secureStorage'
import WhatsAppUploader from '../components/WhatsAppUploader'
import PhotoUploader from '../components/PhotoUploader'
import AudioUploader from '../components/AudioUploader'
import { WhatsAppMessage, PhotoMemory, AudioMemory, MemoryCollection } from '../types'
import { logger } from '../utils/logger'

const MEMORIES_STORAGE_KEY = 'memory_collection'

export default function MemoriesPage() {
  const { isAuthenticated, encryptionKey } = useAuth()
  const { user, isLoading: supabaseLoading, isConfigured } = useSupabaseAuth()
  const navigate = useNavigate()

  // Check auth: Support both old password-based and new Supabase email auth
  const isUserAuthenticated = isAuthenticated || (isConfigured && user !== null)

  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([])
  const [photos, setPhotos] = useState<PhotoMemory[]>([])
  const [audioClips, setAudioClips] = useState<AudioMemory[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    // Wait for Supabase auth to finish loading
    if (isConfigured && supabaseLoading) {
      return
    }

    // Redirect to login if not authenticated
    if (!isUserAuthenticated) {
      navigate('/email-auth')
    }
  }, [isUserAuthenticated, supabaseLoading, navigate, isConfigured])

  // Load existing memories
  useEffect(() => {
    const loadMemories = async () => {
      try {
        let saved: MemoryCollection | null = null

        if (encryptionKey) {
          // Old password-based auth: use encrypted storage
          saved = await getSecure<MemoryCollection>(
            MEMORIES_STORAGE_KEY,
            encryptionKey
          )
        } else {
          // Supabase users: use plain localStorage
          const stored = localStorage.getItem(MEMORIES_STORAGE_KEY)
          saved = stored ? JSON.parse(stored) : null
        }

        if (saved) {
          setWhatsappMessages(saved.whatsappMessages || [])
          setPhotos(saved.photos || [])
          setAudioClips(saved.audioClips || [])
        }
      } catch (error) {
        logger.error('Error loading memories:', error)
      }
    }

    loadMemories()
  }, [encryptionKey])

  const handleWhatsAppLoaded = (messages: WhatsAppMessage[]) => {
    setWhatsappMessages(messages)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const collection: MemoryCollection = {
        whatsappMessages,
        photos,
        audioClips,
      }

      if (encryptionKey) {
        // Old password-based auth: use encrypted storage
        await setSecure(MEMORIES_STORAGE_KEY, collection, encryptionKey)
      } else {
        // Supabase users: use plain localStorage
        localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(collection))
      }

      setSaveSuccess(true)

      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      logger.error('Error saving memories:', error)
      alert('Save failed. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasContent =
    whatsappMessages.length > 0 || photos.length > 0 || audioClips.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Upload Memories</h1>
              <p className="text-sm text-gray-600">
                Add messages, photos and audio
              </p>
            </div>
          </div>

          {hasContent && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">
              Herinneringen veilig opgeslagen!
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* WhatsApp Export Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <WhatsAppUploader onMessagesLoaded={handleWhatsAppLoaded} />
        </div>

        {/* Photos Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <PhotoUploader onPhotosLoaded={setPhotos} />
        </div>

        {/* Audio Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <AudioUploader onAudioLoaded={setAudioClips} />
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-2">
            Privacy & Beveiliging
          </h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>✓ Alle bestanden worden alleen lokaal verwerkt</li>
            <li>✓ Niets wordt naar externe servers gestuurd</li>
            <li>✓ Data wordt versleuteld opgeslagen op je apparaat</li>
            <li>✓ Je hebt volledige controle over je gegevens</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
