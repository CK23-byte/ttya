/**
 * Living Legacy Voice Cloning Setup Page
 *
 * Allows users to record or upload voice samples for voice cloning
 * Requires 15-20 minutes of clear audio
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Mic,
  Upload,
  Play,
  Pause,
  Trash2,
  Check,
  AlertCircle,
  Volume2,
  FileAudio,
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface VoiceRecording {
  id: string
  name: string
  duration: number
  audioUrl: string
  audioBlob: Blob
  qualityChecks: {
    clearAudio: boolean
    noBackgroundNoise: boolean
    naturalPace: boolean
  }
}

type RecordingMethod = 'script' | 'freeform' | 'upload'

const READING_SCRIPTS = [
  {
    id: 1,
    title: "Introduction Script",
    text: "Hello, my name is [Your Name]. I'm creating this voice recording so that my loved ones can hear my voice even when I'm no longer here. This technology allows me to stay connected with those I care about most.",
    estimatedDuration: 30
  },
  {
    id: 2,
    title: "Life Story Script",
    text: "Let me tell you about my life. I was born in [Year] in [Place]. Growing up, I learned that family is the most important thing. The lessons I learned shaped who I became, and I want to share these with you.",
    estimatedDuration: 30
  },
  {
    id: 3,
    title: "Emotional Range Script",
    text: "I've experienced so much joy in my life - laughter with friends, celebrations with family, quiet moments of peace. But I've also known sadness, worry, and challenge. All of these experiences made me who I am today.",
    estimatedDuration: 35
  },
  {
    id: 4,
    title: "Conversational Script",
    text: "You know, when I think about the future, I hope you remember the good times we had together. Remember when we used to sit and talk for hours? Those conversations meant everything to me.",
    estimatedDuration: 30
  },
  {
    id: 5,
    title: "Advice Script",
    text: "Here's what I want you to know: be kind to yourself and others. Work hard, but don't forget to enjoy life. Take risks when they matter, but always protect what's important to you. And never forget how much you're loved.",
    estimatedDuration: 40
  }
]

export default function LivingLegacyVoiceSetupPage() {
  const navigate = useNavigate()
  const { profileId } = useParams<{ profileId: string }>()

  const [recordingMethod, setRecordingMethod] = useState<RecordingMethod>('script')
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])
  const [currentScript, setCurrentScript] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Calculate total duration
  const totalDuration = recordings.reduce((sum, rec) => sum + rec.duration, 0)
  const totalMinutes = Math.floor(totalDuration / 60)
  const totalSeconds = totalDuration % 60
  const targetMinutes = 15
  const progressPercentage = Math.min((totalDuration / (targetMinutes * 60)) * 100, 100)

  // Quality checks
  const qualityScore = recordings.length > 0
    ? recordings.reduce((sum, rec) => {
        const checks = Object.values(rec.qualityChecks).filter(Boolean).length
        return sum + (checks / 3)
      }, 0) / recordings.length
    : 0

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

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

        const newRecording: VoiceRecording = {
          id: `recording-${Date.now()}`,
          name: recordingMethod === 'script'
            ? READING_SCRIPTS[currentScript].title
            : `Recording ${recordings.length + 1}`,
          duration: recordingTime,
          audioUrl,
          audioBlob: blob,
          qualityChecks: {
            clearAudio: true, // Would be checked by backend
            noBackgroundNoise: recordingTime >= 10, // Simple heuristic
            naturalPace: recordingTime >= 15
          }
        }

        setRecordings(prev => [...prev, newRecording])
        setRecordingTime(0)

        if (recordingMethod === 'script' && currentScript < READING_SCRIPTS.length - 1) {
          setCurrentScript(prev => prev + 1)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
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

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id))
  }

  const playRecording = (recording: VoiceRecording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const audio = new Audio(recording.audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setPlayingId(null)
      }

      audio.play()
      setPlayingId(recording.id)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.type.startsWith('audio/')) {
        alert(`${file.name} is not an audio file`)
        continue
      }

      // Get duration
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)

      audio.onloadedmetadata = () => {
        const newRecording: VoiceRecording = {
          id: `upload-${Date.now()}-${i}`,
          name: file.name,
          duration: Math.floor(audio.duration),
          audioUrl: audio.src,
          audioBlob: file,
          qualityChecks: {
            clearAudio: true,
            noBackgroundNoise: true,
            naturalPace: audio.duration >= 15
          }
        }

        setRecordings(prev => [...prev, newRecording])
      }
    }
  }

  const handleSaveAndContinue = async () => {
    if (totalDuration < 60) {
      alert('Please record at least 1 minute of audio to continue.')
      return
    }

    // TODO: Upload recordings to backend
    // For now, just navigate to avatar setup
    navigate(`/living-legacy/${profileId}/avatar-setup`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Progress:</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-purple-600">
              {totalMinutes}:{totalSeconds.toString().padStart(2, '0')} / {targetMinutes}:00
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-4">
            <Volume2 className="w-5 h-5" />
            <span>Voice Cloning Setup</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Record Your Voice
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We need 15-20 minutes of your voice to create a perfect clone.
            Choose your preferred recording method below.
          </p>
        </div>

        {/* Recording Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setRecordingMethod('script')}
            className={`p-6 rounded-xl border-2 transition ${
              recordingMethod === 'script'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <FileAudio className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Read Scripts</h3>
            <p className="text-sm text-gray-600">
              Read provided scripts for consistent quality (Recommended)
            </p>
          </button>

          <button
            onClick={() => setRecordingMethod('freeform')}
            className={`p-6 rounded-xl border-2 transition ${
              recordingMethod === 'freeform'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <Mic className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Free-Form</h3>
            <p className="text-sm text-gray-600">
              Talk naturally about anything you'd like
            </p>
          </button>

          <button
            onClick={() => setRecordingMethod('upload')}
            className={`p-6 rounded-xl border-2 transition ${
              recordingMethod === 'upload'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <Upload className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Upload Files</h3>
            <p className="text-sm text-gray-600">
              Upload existing audio recordings
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recording Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              {/* Script Reading Mode */}
              {recordingMethod === 'script' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      Script {currentScript + 1} of {READING_SCRIPTS.length}
                    </h3>
                    <span className="text-sm text-gray-600">
                      Est. {READING_SCRIPTS[currentScript].estimatedDuration}s
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-rose-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-purple-900 mb-3">
                      {READING_SCRIPTS[currentScript].title}
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {READING_SCRIPTS[currentScript].text}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">Recording Tips:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Speak at a natural pace, not too fast or slow</li>
                          <li>Use natural emotions and inflections</li>
                          <li>Find a quiet room with no background noise</li>
                          <li>Speak clearly but naturally</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Free-Form Mode */}
              {recordingMethod === 'freeform' && (
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    Free-Form Recording
                  </h3>

                  <div className="bg-gradient-to-br from-purple-50 to-rose-50 rounded-lg p-6 mb-6">
                    <p className="text-gray-700 mb-4">
                      Talk about anything you'd like. Here are some conversation starters:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Tell a favorite family story or memory</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Share advice you'd give to loved ones</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Describe your daily routine or hobbies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Talk about your values and beliefs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Share your hopes for the future</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Upload Mode */}
              {recordingMethod === 'upload' && (
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    Upload Audio Files
                  </h3>

                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-12 text-center mb-6">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-700 mb-4">
                      Drop audio files here or click to browse
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label
                      htmlFor="audio-upload"
                      className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition cursor-pointer"
                    >
                      Select Audio Files
                    </label>
                    <p className="text-sm text-gray-500 mt-4">
                      Supported formats: MP3, WAV, M4A, OGG
                    </p>
                  </div>
                </div>
              )}

              {/* Recording Controls */}
              {recordingMethod !== 'upload' && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    {isRecording && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full text-red-700 font-semibold mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span>Recording: {formatTime(recordingTime)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-rose-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-rose-600 transition shadow-lg"
                      >
                        <Mic className="w-5 h-5" />
                        Start Recording
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={pauseRecording}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                        >
                          {isPaused ? (
                            <>
                              <Play className="w-5 h-5" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="w-5 h-5" />
                              Pause
                            </>
                          )}
                        </button>

                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                        >
                          <Check className="w-5 h-5" />
                          Finish Recording
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recordings List & Stats */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Progress</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {totalMinutes}m {totalSeconds}s
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalDuration >= targetMinutes * 60 ? (
                      <span className="text-green-600 font-semibold">✓ Target reached!</span>
                    ) : (
                      `${Math.max(0, targetMinutes * 60 - totalDuration)}s remaining`
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Quality Score</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {Math.round(qualityScore * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${qualityScore * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Recordings</span>
                    <span className="font-semibold text-gray-900">{recordings.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recordings List */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Your Recordings ({recordings.length})
              </h3>

              {recordings.length === 0 ? (
                <div className="text-center py-8">
                  <Mic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No recordings yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {recording.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(recording.duration)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playRecording(recording)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                          >
                            {playingId === recording.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => deleteRecording(recording.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quality indicators */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {recording.qualityChecks.clearAudio && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Clear
                          </span>
                        )}
                        {recording.qualityChecks.noBackgroundNoise && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Quiet
                          </span>
                        )}
                        {recording.qualityChecks.naturalPace && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Natural
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/living-legacy/create/${profileId}`)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
          >
            Save and Come Back Later
          </button>

          <div className="flex items-center gap-4">
            {totalDuration >= 60 && totalDuration < targetMinutes * 60 && (
              <div className="text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Recommended: {targetMinutes - totalMinutes} more minutes</span>
              </div>
            )}

            <button
              onClick={handleSaveAndContinue}
              disabled={totalDuration < 60}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition ${
                totalDuration >= 60
                  ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white hover:from-purple-600 hover:to-rose-600 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {totalDuration >= targetMinutes * 60 ? (
                <>
                  Continue to Avatar Setup
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  Save & Continue
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
