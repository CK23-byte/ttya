import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Mic, Video as VideoIcon, FileText, Save, Trash2, Square,
  Check, Users, Sparkles, AlertCircle, Loader
} from 'lucide-react'

type RecordingFormat = 'text' | 'audio' | 'video'

interface Recipient {
  id: string
  name: string
  relationship: string
}

export default function LivingLegacyRecordMessagePage() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || 'life_story'

  const [format, setFormat] = useState<RecordingFormat>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [isForAll, setIsForAll] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [recipients, setRecipients] = useState<Recipient[]>([])

  useEffect(() => {
    // TODO: Fetch recipients from profile
    // For now using mock data
    setRecipients([
      { id: '1', name: 'Emma', relationship: 'Daughter' },
      { id: '2', name: 'Sarah', relationship: 'Wife' },
      { id: '3', name: 'Michael', relationship: 'Son' }
    ])
  }, [profileId])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecording()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const getCategoryInfo = () => {
    switch (category) {
      case 'life_story':
        return {
          title: 'Life Story & History',
          description: 'Share your journey, experiences, and memories',
          prompts: [
            'What was your childhood like?',
            'Tell me about your first job',
            'What\'s your proudest achievement?',
            'What lessons did you learn from challenges?'
          ]
        }
      case 'wisdom':
        return {
          title: 'Wisdom & Advice',
          description: 'Share lessons learned and guidance',
          prompts: [
            'What advice would you give about relationships?',
            'What\'s the most important thing you\'ve learned?',
            'How do you handle difficult times?',
            'What do you wish you knew when you were younger?'
          ]
        }
      case 'specific_person':
        return {
          title: 'Message for Loved Ones',
          description: 'Record personal messages for specific people',
          prompts: [
            'What do you want them to know?',
            'What memories do you cherish together?',
            'What are your hopes for their future?',
            'What makes them special to you?'
          ]
        }
      default:
        return {
          title: 'Record a Message',
          description: 'Share your thoughts and feelings',
          prompts: []
        }
    }
  }

  const startRecording = async () => {
    try {
      const constraints = format === 'video'
        ? { audio: true, video: { width: 1280, height: 720 } }
        : { audio: true }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (format === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      chunksRef.current = []
      const mimeType = format === 'video' ? 'video/webm' : 'audio/webm'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        if (format === 'video') {
          setVideoBlob(blob)
          if (videoRef.current) {
            videoRef.current.srcObject = null
            videoRef.current.src = URL.createObjectURL(blob)
          }
        } else {
          setAudioBlob(blob)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)

    } catch (err: any) {
      setError(`Failed to start recording: ${err.message}`)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
  }

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    )
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please add a title')
      return
    }

    if (format === 'text' && !content.trim()) {
      setError('Please add content')
      return
    }

    if ((format === 'audio' && !audioBlob) || (format === 'video' && !videoBlob)) {
      setError('Please record your message first')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // TODO: Upload audio/video to storage and get URLs
      // For now, we'll just save the text content

      const messageData = {
        profileId,
        category,
        title,
        content: format === 'text' ? content : null,
        recipientIds: isForAll ? null : selectedRecipients,
        isForAllRecipients: isForAll,
        durationSeconds: format !== 'text' ? recordingTime : null,
        recordingFormat: format,
        // TODO: Add videoUrl and audioUrl after upload
      }

      const response = await fetch('/api/legacy/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save message')
      }

      setSuccess(true)
      setTimeout(() => {
        navigate(`/living-legacy/create/${profileId}`)
      }, 1500)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const categoryInfo = getCategoryInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/living-legacy/create/${profileId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{categoryInfo.title}</h1>
              <p className="text-sm text-gray-600">{categoryInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3">
              <Check className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-900">Message saved successfully!</p>
                <p className="text-sm text-green-700">Returning to dashboard...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-900">{error}</p>
            </div>
          )}

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Recording Format:</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('text')}
                disabled={isRecording}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  format === 'text'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <FileText className="w-5 h-5" />
                Text
              </button>
              <button
                onClick={() => setFormat('audio')}
                disabled={isRecording}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  format === 'audio'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <Mic className="w-5 h-5" />
                Audio
              </button>
              <button
                onClick={() => setFormat('video')}
                disabled={isRecording}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  format === 'video'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <VideoIcon className="w-5 h-5" />
                Video
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Career Advice for Emma"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Users className="inline w-4 h-4 mr-1" />
              Who is this message for?
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={isForAll}
                  onChange={() => setIsForAll(true)}
                  className="w-5 h-5 text-orange-500"
                />
                <span className="ml-3 text-gray-900">Everyone (all recipients)</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={!isForAll}
                  onChange={() => setIsForAll(false)}
                  className="w-5 h-5 text-orange-500"
                />
                <span className="ml-3 text-gray-900">Specific people</span>
              </label>
            </div>

            {!isForAll && (
              <div className="mt-3 space-y-2 pl-8">
                {recipients.map(recipient => (
                  <label key={recipient.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(recipient.id)}
                      onChange={() => toggleRecipient(recipient.id)}
                      className="w-4 h-4 text-orange-500 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {recipient.name} ({recipient.relationship})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Content Area */}
          {format === 'text' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Message *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">{content.length} characters</p>
            </div>
          )}

          {(format === 'audio' || format === 'video') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {format === 'video' ? 'Video Recording' : 'Audio Recording'}
              </label>

              {format === 'video' && (
                <div className="mb-4 bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    controls={!isRecording && videoBlob !== null}
                  />
                </div>
              )}

              <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-lg">
                {!isRecording && !audioBlob && !videoBlob && (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition flex items-center gap-2"
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{formatTime(recordingTime)}</div>
                      <div className="text-sm text-gray-600">Recording...</div>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Square className="w-5 h-5" />
                      Stop
                    </button>
                  </>
                )}

                {(audioBlob || videoBlob) && !isRecording && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">✓ Recorded</div>
                      <div className="text-sm text-gray-600">{formatTime(recordingTime)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setAudioBlob(null)
                        setVideoBlob(null)
                        setRecordingTime(0)
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={startRecording}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                      Re-record
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Suggested Prompts */}
          {categoryInfo.prompts.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Suggested prompts:</h3>
              </div>
              <ul className="space-y-2">
                {categoryInfo.prompts.map((prompt, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/living-legacy/create/${profileId}`)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || success}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-rose-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
