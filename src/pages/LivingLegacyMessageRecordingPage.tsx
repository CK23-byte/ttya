/**
 * Living Legacy Message Recording Page - Enhanced Version
 *
 * Features:
 * - Better recording interface with real-time feedback
 * - Message categories (Life Story, Advice, Time Capsules)
 * - Draft system with editing capabilities
 * - Audio quality indicators
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
  FileText,
  Heart,
  Clock,
  Gift,
  BookOpen,
  Sparkles,
  Users,
  Volume2
} from 'lucide-react'

interface Message {
  id: string
  title: string
  category: 'life_story' | 'advice' | 'time_capsule' | 'specific_person' | 'everyday'
  status: 'draft' | 'recorded' | 'finalized'
  audioUrl?: string
  audioBlob?: Blob
  duration: number
  recipientIds: string[] | null // null = all recipients
  transcript?: string
  qualityScore?: number
  createdAt: Date
  updatedAt: Date
}

interface AudioQuality {
  clearAudio: boolean
  goodVolume: boolean
  minLength: boolean
  noClipping: boolean
}

const CATEGORIES = [
  { id: 'life_story', label: 'Life Story', icon: BookOpen, color: 'blue' },
  { id: 'advice', label: 'Advice & Wisdom', icon: Sparkles, color: 'purple' },
  { id: 'time_capsule', label: 'Time Capsule', icon: Gift, color: 'orange' },
  { id: 'specific_person', label: 'Specific Person', icon: Users, color: 'green' },
  { id: 'everyday', label: 'Everyday Moment', icon: Heart, color: 'rose' }
]

export default function LivingLegacyMessageRecordingPage() {
  const navigate = useNavigate()
  const { profileId } = useParams()

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)

  // Current message being created/edited
  const [currentMessage, setCurrentMessage] = useState<Partial<Message>>({
    category: 'life_story',
    recipientIds: null
  })

  // All messages
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Load existing messages
  useEffect(() => {
    loadMessages()
  }, [profileId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const loadMessages = async () => {
    // TODO: Load from API
    // Mock data for now
    setMessages([])
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Setup audio analysis
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const checkAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(Math.min(100, (average / 255) * 150))
          requestAnimationFrame(checkAudioLevel)
        }
      }
      checkAudioLevel()

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(blob)

        setCurrentMessage(prev => ({
          ...prev,
          audioUrl,
          audioBlob: blob,
          duration: recordingTime
        }))

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  const analyzeQuality = (): AudioQuality => {
    return {
      clearAudio: recordingTime >= 5,
      goodVolume: audioLevel > 20 && audioLevel < 80,
      minLength: recordingTime >= 10,
      noClipping: audioLevel < 90
    }
  }

  const calculateQualityScore = (quality: AudioQuality): number => {
    const scores = Object.values(quality).filter(Boolean).length
    return (scores / Object.keys(quality).length) * 100
  }

  const saveAsDraft = () => {
    if (!currentMessage.title) {
      alert('Please enter a message title')
      return
    }

    const quality = analyzeQuality()
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      title: currentMessage.title || '',
      category: currentMessage.category as any,
      status: 'draft',
      audioUrl: currentMessage.audioUrl,
      audioBlob: currentMessage.audioBlob,
      duration: currentMessage.duration || 0,
      recipientIds: currentMessage.recipientIds || null,
      qualityScore: calculateQualityScore(quality),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    resetCurrentMessage()
    alert('Message saved as draft!')
  }

  const finalizeMessage = async () => {
    if (!currentMessage.title) {
      alert('Please enter a message title')
      return
    }

    const quality = analyzeQuality()
    if (!quality.minLength) {
      alert('Message must be at least 10 seconds long')
      return
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      title: currentMessage.title || '',
      category: currentMessage.category as any,
      status: 'recorded',
      audioUrl: currentMessage.audioUrl,
      audioBlob: currentMessage.audioBlob,
      duration: currentMessage.duration || 0,
      recipientIds: currentMessage.recipientIds || null,
      qualityScore: calculateQualityScore(quality),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // TODO: Upload to API
    setMessages(prev => [...prev, newMessage])
    resetCurrentMessage()
    alert('Message finalized!')
  }

  const resetCurrentMessage = () => {
    setCurrentMessage({
      category: 'life_story',
      recipientIds: null
    })
    setRecordingTime(0)
    setAudioLevel(0)
  }

  const deleteMessage = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      setMessages(prev => prev.filter(m => m.id !== messageId))
    }
  }

  const editMessage = (message: Message) => {
    setCurrentMessage({
      title: message.title,
      category: message.category,
      recipientIds: message.recipientIds,
      audioUrl: message.audioUrl,
      audioBlob: message.audioBlob,
      duration: message.duration
    })
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category)
    return cat ? cat.icon : FileText
  }

  const filteredMessages = selectedCategory
    ? messages.filter(m => m.category === selectedCategory)
    : messages

  const quality = currentMessage.audioUrl ? analyzeQuality() : null
  const qualityScore = quality ? calculateQualityScore(quality) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/living-legacy/create/${profileId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Record Messages</h1>
                <p className="text-sm text-gray-600">{messages.length} messages recorded</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recording Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Message Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon
                  const isSelected = currentMessage.category === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => setCurrentMessage(prev => ({ ...prev, category: category.id as any }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `border-${category.color}-500 bg-${category.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? `text-${category.color}-600` : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-900">{category.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Message Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Message Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Title *
                  </label>
                  <input
                    type="text"
                    value={currentMessage.title || ''}
                    onChange={(e) => setCurrentMessage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Birthday Message for Sarah"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    For whom? (Leave empty for all)
                  </label>
                  <input
                    type="text"
                    placeholder="All recipients"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Recipient management available in dedicated section</p>
                </div>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl shadow-md p-8 border-2 border-orange-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 relative">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
                  )}
                  <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatTime(recordingTime)}
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <Volume2 className="w-5 h-5" />
                    <p className="text-sm font-medium">Recording...</p>
                  </div>
                )}
              </div>

              {/* Audio Level Indicator */}
              {isRecording && (
                <div className="mb-6">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-orange-500 transition-all duration-100"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-2">Audio Level</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!currentMessage.title}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center gap-2"
                    >
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Square className="w-5 h-5" />
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quality Indicators */}
            {currentMessage.audioUrl && quality && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Audio Quality</h2>
                  <div className="text-2xl font-bold text-orange-600">{qualityScore.toFixed(0)}%</div>
                </div>
                <div className="space-y-3">
                  {Object.entries(quality).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      {value ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Audio Player */}
                {currentMessage.audioUrl && (
                  <div className="mt-6">
                    <audio src={currentMessage.audioUrl} controls className="w-full" />
                  </div>
                )}

                {/* Save Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveAsDraft}
                    className="flex-1 px-6 py-3 border-2 border-orange-300 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save as Draft
                  </button>
                  <button
                    onClick={finalizeMessage}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Finalize
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages List */}
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Filter by Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedCategory === null ? 'bg-orange-100 text-orange-700 font-medium' : 'hover:bg-gray-100'
                  }`}
                >
                  All Messages ({messages.length})
                </button>
                {CATEGORIES.map((category) => {
                  const count = messages.filter(m => m.category === category.id).length
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedCategory === category.id ? 'bg-orange-100 text-orange-700 font-medium' : 'hover:bg-gray-100'
                      }`}
                    >
                      {category.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Messages</h3>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((message) => {
                    const Icon = getCategoryIcon(message.category)
                    return (
                      <div
                        key={message.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-orange-600" />
                            <h4 className="font-medium text-gray-900 text-sm">{message.title}</h4>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => editMessage(message)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(message.duration)}
                          </div>
                          <div className={`px-2 py-0.5 rounded-full ${
                            message.status === 'finalized' ? 'bg-green-100 text-green-700' :
                            message.status === 'recorded' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {message.status}
                          </div>
                          {message.qualityScore && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {message.qualityScore.toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
