import { useState, useRef, useEffect } from 'react'
import { X, Video, Square, Check, RotateCcw, AlertCircle, Mic } from 'lucide-react'

interface DirectRecordingModalProps {
  onClose: () => void
  onComplete: (file: File) => void
}

const SAMPLE_TEXTS = [
  "Hello, this is my voice and face for future generations. I want to share my wisdom and experiences with those I love. This recording will help create my digital avatar so I can continue to guide and inspire my family.",
  "I'm creating this Living Legacy to preserve my memories and personality. Through this technology, my voice, mannerisms, and essence will live on. I hope this brings comfort and guidance to my loved ones.",
  "This is me, speaking from the heart. I want my children and grandchildren to know who I am, how I speak, and what matters to me. This recording captures my authentic self for generations to come.",
  "My name is written in the hearts of my loved ones, but through this technology, my voice and image will remain. I'm grateful for the opportunity to leave behind more than just memories.",
  "Recording this message feels surreal, but important. I want future generations to see me, hear me, and know me. This is my gift to them - a piece of me that will never fade."
]

export default function DirectRecordingModal({ onClose, onComplete }: DirectRecordingModalProps) {
  const [step, setStep] = useState<'intro' | 'countdown' | 'recording' | 'preview'>('intro')
  const [countdown, setCountdown] = useState(3)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [selectedText] = useState(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)])
  const [audioLevel, setAudioLevel] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Setup audio analysis
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      source.connect(analyser)

      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const checkAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(Math.min(100, (average / 255) * 150))
        }
        requestAnimationFrame(checkAudioLevel)
      }
      checkAudioLevel()
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please allow camera permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  const startCountdown = () => {
    setStep('countdown')
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          startRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startRecording = () => {
    if (!streamRef.current) return

    setStep('recording')
    setRecordingTime(0)
    chunksRef.current = []

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp8,opus'
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setRecordedBlob(blob)
      const url = URL.createObjectURL(blob)
      setRecordedUrl(url)
      setStep('preview')
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start(100)

    // Timer for display only (no auto-stop)
    let time = 0
    timerRef.current = setInterval(() => {
      time += 100
      setRecordingTime(time)
    }, 100)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const retakeRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordingTime(0)
    setStep('intro')
  }

  const handleComplete = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], `quick-recording-${Date.now()}.webm`, {
        type: 'video/webm'
      })
      onComplete(file)
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const deciseconds = Math.floor((ms % 1000) / 100)
    return `${seconds}.${deciseconds}s`
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Quick Recording</h2>
              <p className="text-white/90">Record yourself for voice & avatar creation - you control when to stop</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {/* Intro Step */}
          {step === 'intro' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>Position yourself in good lighting, facing the camera</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>Read the text below naturally, as if talking to loved ones</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>Click "Stop Recording" when you're finished (no time limit)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">4.</span>
                        <span>Speak clearly and maintain eye contact with the camera</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Camera Preview */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Audio Level Indicator */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Mic className="w-5 h-5 text-white flex-shrink-0" />
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-75"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium w-12 text-right">
                      {Math.round(audioLevel)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Text to Read */}
              <div className="bg-gradient-to-br from-orange-50 to-rose-50 border-2 border-orange-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-orange-600" />
                  Text to Read (Practice First)
                </h3>
                <p className="text-lg leading-relaxed text-gray-800">
                  "{selectedText}"
                </p>
              </div>

              <button
                onClick={startCountdown}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Start Recording
              </button>
            </div>
          )}

          {/* Countdown Step */}
          {step === 'countdown' && (
            <div className="space-y-6">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Countdown Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-9xl font-bold text-white mb-4 animate-pulse">
                      {countdown}
                    </div>
                    <p className="text-2xl text-white/90">Get ready to read...</p>
                  </div>
                </div>
              </div>

              {/* Text to Read */}
              <div className="bg-gradient-to-br from-orange-50 to-rose-50 border-2 border-orange-200 rounded-xl p-6">
                <p className="text-lg leading-relaxed text-gray-800">
                  "{selectedText}"
                </p>
              </div>
            </div>
          )}

          {/* Recording Step */}
          {step === 'recording' && (
            <div className="space-y-6">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Recording Indicator */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-red-600 px-4 py-2 rounded-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-white font-semibold">RECORDING</span>
                  </div>
                  <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="text-white font-bold text-xl">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>

                {/* Audio Level */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Mic className="w-5 h-5 text-white flex-shrink-0" />
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-75"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text to Read (Highlighted) */}
              <div className="bg-gradient-to-br from-orange-100 to-rose-100 border-4 border-orange-400 rounded-xl p-6 shadow-lg">
                <p className="text-xl leading-relaxed text-gray-900 font-medium">
                  "{selectedText}"
                </p>
              </div>

              <button
                onClick={stopRecording}
                className="w-full py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <Square className="w-6 h-6" />
                Stop Recording
              </button>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && recordedUrl && (
            <div className="space-y-6">
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  ref={previewVideoRef}
                  src={recordedUrl}
                  controls
                  className="w-full h-full"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Recording Complete!</h3>
                    <p className="text-sm text-gray-600">
                      Review your recording. If you're happy with it, click "Use This Recording" to add it to your avatar.
                      Otherwise, you can retake it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={retakeRecording}
                  className="py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake
                </button>
                <button
                  onClick={handleComplete}
                  className="py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Use This Recording
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
