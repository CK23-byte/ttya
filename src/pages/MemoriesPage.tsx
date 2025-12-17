/**
import { logger } from '../utils/logger'
 * Memories Page
import { logger } from '../utils/logger'
 *
import { logger } from '../utils/logger'
 * Upload system for WhatsApp exports, photos, and audio clips
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { setSecure, getSecure } from '../utils/secureStorage'
import WhatsAppUploader from '../components/WhatsAppUploader'
import PhotoUploader from '../components/PhotoUploader'
import AudioUploader from '../components/AudioUploader'
import { WhatsAppMessage, PhotoMemory, AudioMemory, MemoryCollection } from '../types'

const MEMORIES_STORAGE_KEY = 'memory_collection'

export default function MemoriesPage() {
  const { isAuthenticated, encryptionKey } = useAuth()
  const navigate = useNavigate()
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([])
  const [photos, setPhotos] = useState<PhotoMemory[]>([])
  const [audioClips, setAudioClips] = useState<AudioMemory[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/email-auth')
    }
  }, [isAuthenticated, navigate])

  // Load existing memories
  useEffect(() => {
    const loadMemories = async () => {
      if (!encryptionKey) return

      try {
        const saved = await getSecure<MemoryCollection>(
          MEMORIES_STORAGE_KEY,
          encryptionKey
        )

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
    if (!encryptionKey) return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const collection: MemoryCollection = {
        whatsappMessages,
        photos,
        audioClips,
      }

      await setSecure(MEMORIES_STORAGE_KEY, collection, encryptionKey)
      setSaveSuccess(true)

      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      logger.error('Error saving memories:', error)
      alert('Fout bij opslaan. Probeer het opnieuw.')
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
              <h1 className="text-xl font-bold text-gray-800">Herinneringen Uploaden</h1>
              <p className="text-sm text-gray-600">
                Voeg berichten, foto's en audio toe
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
              {isSaving ? 'Opslaan...' : 'Opslaan'}
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
