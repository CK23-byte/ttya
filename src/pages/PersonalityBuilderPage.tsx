/**
 * Simplified Personality Builder
 *
 * Create a personality profile from WhatsApp export in 3 simple steps
 */

import { useState, useEffect } from 'react'
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
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [relationship, setRelationship] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Step 1: Upload WhatsApp export
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    try {
      console.log('Reading file:', file.name)
      const text = await file.text()
      console.log('File size:', text.length, 'characters')

      const messages = parseWhatsAppExport(text)
      console.log('Parsed messages:', messages.length)

      if (messages.length === 0) {
        setError('Geen berichten gevonden. Controleer of dit een geldig WhatsApp export bestand is. Het bestand moet beginnen met een datum en tijd.')
        console.log('First 500 chars:', text.substring(0, 500))
        return
      }

      setAllMessages(messages)
      const uniqueSenders = getUniqueSenders(messages)
      console.log('Unique senders:', uniqueSenders)
      setSenders(uniqueSenders)
      setStep('select')
    } catch (err) {
      setError('Fout bij het lezen van het bestand: ' + (err as Error).message)
      console.error('Upload error:', err)
    }
  }

  // Step 2: Select person and set relationship
  const handleSelectPerson = () => {
    if (!selectedSender || !relationship) {
      setError('Vul alle velden in')
      return
    }

    const filtered = filterBySender(allMessages, selectedSender)
    setPersonMessages(filtered)
    setStep('photo')
  }

  // Step 3: Photo (optional) and create profile
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
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
        photoUrl: photoUrl || undefined,
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
      setError('Fout bij het aanmaken van profiel')
      console.error(err)
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

    return `Je bent ${name}, ${rel} van de gebruiker.

SCHRIJFSTIJL (gebaseerd op echte berichten):
${examples}

GEDRAG:
- Schrijf kort en natuurlijk, zoals in een chat
- Gebruik dezelfde toon als in de voorbeelden
- Wees warm en herkenbaar
- Reageer zoals ${name} zou reageren

Belangrijk: Je bent een digitale herinnering. Wees respectvol en empathisch.`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
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
            <h1 className="text-xl font-bold text-gray-800">Maak een Profiel</h1>
            <p className="text-sm text-gray-600">Simpel en snel via WhatsApp export</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Upload WhatsApp Chat
                </h2>
                <p className="text-gray-600">
                  Exporteer een chat met de persoon die je wilt toevoegen
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-400 transition">
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">Klik om bestand te kiezen</p>
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
                  💡 Hoe exporteer je een WhatsApp chat?
                </p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Open WhatsApp en ga naar de chat</li>
                  <li>Tik op de naam bovenaan</li>
                  <li>Scroll naar beneden → "Exporteer chat"</li>
                  <li>Kies "Zonder media"</li>
                  <li>Upload het .txt bestand hier</li>
                </ol>
              </div>
            </div>
          )}

          {/* Step 2: Select Person */}
          {step === 'select' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Selecteer Persoon
                </h2>
                <p className="text-gray-600">
                  {allMessages.length} berichten geïmporteerd
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Met wie wil je kunnen praten?
                </label>
                <select
                  value={selectedSender}
                  onChange={(e) => setSelectedSender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">-- Kies een persoon --</option>
                  {senders.map((sender) => (
                    <option key={sender} value={sender}>
                      {sender}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wat is jullie relatie?
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="bijv. mijn moeder, mijn opa, mijn vriend"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  Terug
                </button>
                <button
                  onClick={handleSelectPerson}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Volgende
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Photo (Optional) */}
          {step === 'photo' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <ImageIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Voeg een Foto Toe
                </h2>
                <p className="text-gray-600">
                  Optioneel - je kunt dit ook overslaan
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {photoUrl ? (
                  <div className="relative">
                    <img
                      src={photoUrl}
                      alt={selectedSender}
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                    />
                    <button
                      onClick={() => setPhotoUrl('')}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-400 transition">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Profiel van {selectedSender}</strong>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {personMessages.length} berichten geanalyseerd
                </p>
                <p className="text-xs text-green-600 mt-2">
                  De AI zal de schrijfstijl automatisch leren uit de berichten
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
                  Terug
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {isProcessing ? 'Aanmaken...' : 'Profiel Aanmaken'}
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
                Profiel Aangemaakt! 🎉
              </h2>
              <p className="text-gray-600">
                Je kunt nu chatten met {selectedSender}
              </p>
              <div className="animate-pulse text-purple-600 text-sm">
                Doorsturen naar chat...
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
