/**
import { logger } from '../utils/logger'
 * Simplified Personality Builder
import { logger } from '../utils/logger'
 *
import { logger } from '../utils/logger'
 * Create a personality profile from WhatsApp export in 3 simple steps
import { logger } from '../utils/logger'
 */
import { logger } from '../utils/logger'

import { logger } from '../utils/logger'
import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, User, Check, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { setSecure, getSecure } from '../utils/secureStorage'
import { parseWhatsAppExport, getUniqueSenders, filterBySender } from '../utils/whatsappParser'
import { PersonalityProfile, WhatsAppMessage } from '../types'

const PERSONALITY_STORAGE_KEY = 'personality_profiles'

type Step = 'upload' | 'select' | 'photo' | 'done'

export default function PersonalityBuilderPage() {
  const { isAuthenticated, encryptionKey } = useAuth()
  const navigate = useNavigate()

  // State
  const [step, setStep] = useState<Step>('upload')
  const [allMessages, setAllMessages] = useState<WhatsAppMessage[]>([])
  const [senders, setSenders] = useState<string[]>([])
  const [selectedSender, setSelectedSender] = useState<string>('')
  const [personMessages, setPersonMessages] = useState<WhatsAppMessage[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [relationship, setRelationship] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/email-auth')
    }
  }, [isAuthenticated, navigate])

  // Step 1: Upload WhatsApp export
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    try {
      logger.log('Reading file:', file.name)
      const text = await file.text()
      logger.log('File size:', text.length, 'characters')

      const messages = parseWhatsAppExport(text)
      logger.log('Parsed messages:', messages.length)

      if (messages.length === 0) {
        setError('No messages found. Please check if this is a valid WhatsApp export file. The file should start with a date and time.')
        logger.log('First 500 chars:', text.substring(0, 500))
        return
      }

      setAllMessages(messages)
      const uniqueSenders = getUniqueSenders(messages)
      logger.log('Unique senders:', uniqueSenders)
      setSenders(uniqueSenders)
      setStep('select')
    } catch (err) {
      setError('Error reading file: ' + (err as Error).message)
      logger.error('Upload error:', err)
    }
  }

  // Step 2: Select person and set relationship
  const handleSelectPerson = () => {
    if (!selectedSender || !relationship) {
      setError('Please fill in all fields')
      return
    }

    const filtered = filterBySender(allMessages, selectedSender)
    setPersonMessages(filtered)
    setStep('photo')
  }

  // Step 3: Photos (optional) and create profile
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed the limit
    if (photoUrls.length + files.length > 5) {
      setError('You can upload a maximum of 5 photos')
      return
    }

    // Read all selected files
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateProfile = async () => {
    if (!encryptionKey) return

    setIsProcessing(true)
    setError('')

    try {
      // Extract typical phrases (first 20 messages from person)
      const typicalPhrases = personMessages
        .slice(0, 20)
        .map(m => m.content)
        .filter(c => c.length < 100 && c.length > 10)
        .slice(0, 10)

      // Create personality profile
      const profile: PersonalityProfile = {
        id: Date.now().toString(),
        name: selectedSender,
        relationship: relationship,
        photoUrl: photoUrls[0] || undefined, // Legacy: use first photo
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined, // New: all photos
        typicalPhrases: typicalPhrases,
        hobbies: [],
        habits: [],
        humorStyle: 'Analyzed from messages',
        traits: [],
        tone: 'informal',
        emojiUsage: detectEmojiUsage(personMessages),
        systemPrompt: generateSystemPrompt(selectedSender, relationship, personMessages),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Load existing profiles and add new one
      const existingProfiles = await getSecure<PersonalityProfile[]>(
        PERSONALITY_STORAGE_KEY,
        encryptionKey
      ) || []

      const updatedProfiles = [...existingProfiles, profile]

      // Save encrypted profiles array
      await setSecure(PERSONALITY_STORAGE_KEY, updatedProfiles, encryptionKey)

      setStep('done')

      // Redirect to chat with new profile after 2 seconds
      setTimeout(() => {
        navigate(`/chat?profile=${profile.id}`)
      }, 2000)
    } catch (err) {
      setError('Error creating profile')
      logger.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const detectEmojiUsage = (messages: WhatsAppMessage[]): 'high' | 'medium' | 'low' | 'none' => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    const messagesWithEmoji = messages.filter(m => emojiRegex.test(m.content)).length
    const percentage = (messagesWithEmoji / messages.length) * 100

    if (percentage > 50) return 'high'
    if (percentage > 20) return 'medium'
    if (percentage > 5) return 'low'
    return 'none'
  }

  const generateSystemPrompt = (name: string, rel: string, messages: WhatsAppMessage[]): string => {
    const examples = messages.slice(0, 15).map(m => m.content).join('\n')

    return `You are ${name}, ${rel} of the user.

WRITING STYLE (based on real messages):
${examples}

BEHAVIOR:
- Write short and natural, like in a chat
- Use the same tone as in the examples
- Be warm and recognizable
- Respond like ${name} would respond

Important: You are a digital memory. Be respectful and empathetic.`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Create a Profile</h1>
            <p className="text-sm text-gray-600">Simple and fast via WhatsApp export</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Upload WhatsApp Chat
                </h2>
                <p className="text-gray-600">
                  Export a chat with the person you want to add
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-orange-400 transition">
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">Click to choose file</p>
                  <p className="text-sm text-gray-500">WhatsApp export (.txt)</p>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  💡 How to export a WhatsApp chat?
                </p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Open WhatsApp and go to the chat</li>
                  <li>Tap the name at the top</li>
                  <li>Scroll down → "Export chat"</li>
                  <li>Choose "Without media"</li>
                  <li>Upload the .txt file here</li>
                </ol>
              </div>
            </div>
          )}

          {/* Step 2: Select Person */}
          {step === 'select' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Select Person
                </h2>
                <p className="text-gray-600">
                  {allMessages.length} messages imported
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who do you want to talk to?
                </label>
                <select
                  value={selectedSender}
                  onChange={(e) => setSelectedSender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Choose a person --</option>
                  {senders.map((sender) => (
                    <option key={sender} value={sender}>
                      {sender}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your relationship?
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. my mother, my grandfather, my friend"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSelectPerson}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Photos (Optional) */}
          {step === 'photo' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <ImageIcon className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Add Photos for Video Calls
                </h2>
                <p className="text-gray-600">
                  Upload 3-5 photos for better video avatar quality
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Optional - you can skip this step
                </p>
              </div>

              {/* Photo Gallery */}
              <div className="grid grid-cols-3 gap-4">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`${selectedSender} ${index + 1}`}
                      className="w-full aspect-square rounded-lg object-cover border-2 border-orange-200"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add Photo Button */}
                {photoUrls.length < 5 && (
                  <label className="cursor-pointer">
                    <div className="w-full aspect-square rounded-lg bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-400 transition">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Add Photo</span>
                      <span className="text-xs text-gray-400">({photoUrls.length}/5)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  💡 Why multiple photos?
                </p>
                <p className="text-xs text-blue-700">
                  Multiple photos of {selectedSender} from different angles help create a more realistic and natural video avatar for video calls. Upload 3-5 clear photos showing the face from different perspectives.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Profile of {selectedSender}</strong>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {personMessages.length} messages analyzed • {photoUrls.length} photo{photoUrls.length !== 1 ? 's' : ''} uploaded
                </p>
                <p className="text-xs text-green-600 mt-2">
                  The AI will automatically learn the writing style from the messages
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50"
                >
                  {isProcessing ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Profile Created! 🎉
              </h2>
              <p className="text-gray-600">
                You can now chat with {selectedSender}
              </p>
              <div className="animate-pulse text-orange-600 text-sm">
                Redirecting to chat...
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
