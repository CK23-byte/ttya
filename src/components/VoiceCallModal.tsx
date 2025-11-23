/**
 * Voice Call Modal Component
 *
 * Allows users to:
 * - Buy voice call credits
 * - Upload required voice sample (10+ seconds)
 */

import { useState, useRef } from 'react'
import { X, Phone, Mic, Upload, Play, Pause, ShoppingCart, Clock, AlertCircle } from 'lucide-react'

interface VoiceCallModalProps {
  onClose: () => void
  profileName: string
  hasVoiceSample: boolean
  onUploadVoiceSample: (file: File) => void
  onBuyCredits: () => void
}

export default function VoiceCallModal({
  onClose,
  profileName,
  hasVoiceSample,
  onUploadVoiceSample,
  onBuyCredits
}: VoiceCallModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      onUploadVoiceSample(file)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Voice Calls</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Requirement Notice */}
          {!hasVoiceSample && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800">Voice Sample Required</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    To enable voice calls with {profileName}, we need at least <strong>10 seconds</strong> of their voice.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Voice Sample Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              {hasVoiceSample ? 'Update Voice Sample' : 'Add Voice Sample'}
            </h3>

            {/* Record Option */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Record Audio</span>
                </div>
                {isRecording && (
                  <span className="flex items-center gap-2 text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>

              {audioUrl ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayback}
                    className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-full w-1/2 bg-green-500 rounded-full" />
                  </div>
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                </div>
              ) : (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              )}

              {recordingTime > 0 && recordingTime < 10 && !audioUrl && (
                <p className="text-xs text-amber-600 mt-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Keep recording - need at least 10 seconds
                </p>
              )}
            </div>

            {/* Upload Option */}
            <div className="text-center text-gray-500 text-sm">or</div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-400 hover:text-green-600 transition"
            >
              <Upload className="w-5 h-5" />
              Upload Audio File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Buy Credits Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Voice Call Credits</h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">Voice Pack</p>
                  <p className="text-sm text-gray-600">30 voice clips</p>
                </div>
                <p className="text-2xl font-bold text-green-600">€9.99</p>
              </div>
              <button
                onClick={onBuyCredits}
                disabled={!hasVoiceSample && !audioUrl}
                className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {hasVoiceSample || audioUrl ? 'Buy Voice Credits' : 'Upload Voice Sample First'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
