/**
 * useHybridVoice - Custom Hook for Hybrid Voice Pipeline
 *
 * Pipeline: Whisper (STT) → GPT-4 (Chat) → ElevenLabs (TTS)
 *
 * This hook orchestrates:
 * 1. Audio recording with Voice Activity Detection
 * 2. Transcription with OpenAI Whisper
 * 3. Chat completion with GPT-4
 * 4. Text-to-speech with ElevenLabs cloned voice
 * 5. Audio playback with queueing
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '../utils/logger'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface UseHybridVoiceOptions {
  personalityId: string
  personalityName: string
  personalityRelationship: string
  personalityDescription: string
  userId: string
  voiceId: string // ElevenLabs voice ID
  onTranscript?: (message: Message) => void
  onError?: (error: Error) => void
  onStatusChange?: (status: HybridStatus) => void
}

export type HybridStatus =
  | 'idle'
  | 'requesting-mic'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'ended'
  | 'error'

interface HybridVoiceState {
  status: HybridStatus
  isListening: boolean
  isSpeaking: boolean
  duration: number
  messages: Message[]
  error: string | null
}

export function useHybridVoice(options: UseHybridVoiceOptions) {
  const {
    personalityName,
    personalityRelationship,
    personalityDescription,
    voiceId,
    onTranscript,
    onError,
    onStatusChange
  } = options

  const [state, setState] = useState<HybridVoiceState>({
    status: 'idle',
    isListening: false,
    isSpeaking: false,
    duration: 0,
    messages: [],
    error: null
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const isStartingRef = useRef<boolean>(false)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const silenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpeechTimeRef = useRef<number>(Date.now())

  // Update status helper
  const updateStatus = useCallback((status: HybridStatus) => {
    setState(prev => ({ ...prev, status }))
    onStatusChange?.(status)
  }, [onStatusChange])

  // Start call
  const startCall = useCallback(async () => {
    // Prevent multiple simultaneous starts
    if (isStartingRef.current || audioContextRef.current) {
      logger.log('Call already starting or started, ignoring duplicate startCall()')
      return
    }

    try {
      isStartingRef.current = true
      updateStatus('requesting-mic')

      // Request microphone access with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Lower sample rate for faster processing
          channelCount: 1 // Mono audio
        }
      })

      audioStreamRef.current = stream

      // Create audio context with lower sample rate for faster processing
      audioContextRef.current = new AudioContext({ sampleRate: 16000 })

      // Create analyser for voice activity detection
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      // Start recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      lastSpeechTimeRef.current = Date.now()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        if (silenceCheckIntervalRef.current) {
          clearInterval(silenceCheckIntervalRef.current)
          silenceCheckIntervalRef.current = null
        }
        await handleRecordingStop()
      }

      // Start recording with optimized chunk size
      mediaRecorder.start(500)

      // Start silence detection with amplitude analysis
      silenceCheckIntervalRef.current = setInterval(() => {
        if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
          return
        }

        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteTimeDomainData(dataArray)

        // Calculate average amplitude
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          const normalized = (dataArray[i] - 128) / 128
          sum += normalized * normalized
        }
        const rms = Math.sqrt(sum / bufferLength)
        const amplitude = rms * 100

        // Threshold for speech detection (adjust as needed)
        const SPEECH_THRESHOLD = 1.0
        const SILENCE_DURATION = 1200 // 1.2 seconds for faster response

        if (amplitude > SPEECH_THRESHOLD) {
          // Speech detected
          lastSpeechTimeRef.current = Date.now()
        } else {
          // Check if silence has lasted long enough
          const silenceDuration = Date.now() - lastSpeechTimeRef.current
          if (silenceDuration > SILENCE_DURATION && audioChunksRef.current.length > 0) {
            logger.log(`Silence detected (${silenceDuration}ms), processing audio...`)
            mediaRecorderRef.current.stop()
          }
        }
      }, 100) // Check every 100ms

      updateStatus('listening')
      setState(prev => ({ ...prev, isListening: true }))

      // Start duration timer
      startTimeRef.current = Date.now()
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          setState(prev => ({ ...prev, duration: elapsed }))
        }
      }, 1000)

      isStartingRef.current = false
      logger.log('Hybrid voice call started')

    } catch (error) {
      isStartingRef.current = false
      logger.error('Failed to start call:', error)
      updateStatus('error')
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start call'
      }))
      onError?.(error instanceof Error ? error : new Error('Failed to start call'))
    }
  }, [updateStatus, onError])

  // Handle recording stop (when user stops speaking)
  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) {
      logger.log('No audio chunks to process')
      return
    }

    updateStatus('processing')

    try {
      // Combine audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      audioChunksRef.current = []

      // Convert to base64
      const base64Audio = await blobToBase64(audioBlob)

      logger.log('Transcribing audio...')

      // 1. Transcribe with Whisper
      const transcriptResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: 'audio/webm'
        })
      })

      if (!transcriptResponse.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const { text: userText } = await transcriptResponse.json()
      logger.log('User said:', userText)

      // Add to conversation history
      const userMessage: Message = {
        role: 'user',
        content: userText,
        timestamp: new Date().toISOString()
      }

      conversationHistoryRef.current.push({
        role: 'user',
        content: userText
      })

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }))
      onTranscript?.(userMessage)

      // 2. Get response from GPT-4
      logger.log('Generating response...')
      const chatResponse = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistoryRef.current,
          personalityName,
          personalityRelationship,
          personalityDescription
        })
      })

      if (!chatResponse.ok) {
        throw new Error('Failed to generate response')
      }

      const { text: responseText } = await chatResponse.json()
      logger.log('AI response:', responseText)

      // Add to conversation history
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString()
      }

      conversationHistoryRef.current.push({
        role: 'assistant',
        content: responseText
      })

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage]
      }))
      onTranscript?.(assistantMessage)

      // 3. Convert to speech with ElevenLabs
      logger.log('Generating speech with cloned voice...')
      const ttsResponse = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: responseText,
          voiceId
        })
      })

      if (!ttsResponse.ok) {
        throw new Error('Failed to generate speech')
      }

      const { audioBase64 } = await ttsResponse.json()
      logger.log('Speech generated, playing audio...')

      // 4. Play audio
      await playAudio(audioBase64)

      // Resume listening after AI finishes speaking
      // The playAudio function will automatically resume when audio ends (see line ~310)

    } catch (error) {
      logger.error('Processing error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Processing failed'
      }))
      onError?.(error instanceof Error ? error : new Error('Processing failed'))

      // Resume listening even after error
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive' && audioContextRef.current) {
        audioChunksRef.current = []
        lastSpeechTimeRef.current = Date.now()
        mediaRecorderRef.current.start(500)
        setState(prev => ({ ...prev, isListening: true }))
        updateStatus('listening')

        // Restart silence detection
        silenceCheckIntervalRef.current = setInterval(() => {
          if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
            return
          }

          const bufferLength = analyserRef.current.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          analyserRef.current.getByteTimeDomainData(dataArray)

          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128
            sum += normalized * normalized
          }
          const rms = Math.sqrt(sum / bufferLength)
          const amplitude = rms * 100

          const SPEECH_THRESHOLD = 1.0
          const SILENCE_DURATION = 1200

          if (amplitude > SPEECH_THRESHOLD) {
            lastSpeechTimeRef.current = Date.now()
          } else {
            const silenceDuration = Date.now() - lastSpeechTimeRef.current
            if (silenceDuration > SILENCE_DURATION && audioChunksRef.current.length > 0) {
              logger.log(`Silence detected (${silenceDuration}ms), processing audio...`)
              mediaRecorderRef.current.stop()
            }
          }
        }, 100)
      }
    }
  }

  // Play audio
  const playAudio = async (audioBase64: string) => {
    if (!audioContextRef.current) {
      logger.error('Cannot play audio: AudioContext is not available')
      return
    }

    updateStatus('speaking')
    setState(prev => ({ ...prev, isSpeaking: true }))

    try {
      // Convert base64 to ArrayBuffer
      const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData.buffer)

      // Create source and play
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)

      // Wait for audio to finish playing before resuming recording
      await new Promise<void>((resolve) => {
        source.onended = () => {
          setState(prev => ({ ...prev, isSpeaking: false }))
          logger.log('Audio playback finished, resuming listening...')
          resolve()
        }
        source.start()
      })

      // Resume recording after AI finishes speaking
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive' && audioContextRef.current) {
        audioChunksRef.current = []
        lastSpeechTimeRef.current = Date.now() // Reset silence timer
        mediaRecorderRef.current.start(500)
        setState(prev => ({ ...prev, isListening: true }))
        updateStatus('listening')

        // Restart silence detection
        silenceCheckIntervalRef.current = setInterval(() => {
          if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
            return
          }

          const bufferLength = analyserRef.current.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          analyserRef.current.getByteTimeDomainData(dataArray)

          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128
            sum += normalized * normalized
          }
          const rms = Math.sqrt(sum / bufferLength)
          const amplitude = rms * 100

          const SPEECH_THRESHOLD = 1.0
          const SILENCE_DURATION = 1200

          if (amplitude > SPEECH_THRESHOLD) {
            lastSpeechTimeRef.current = Date.now()
          } else {
            const silenceDuration = Date.now() - lastSpeechTimeRef.current
            if (silenceDuration > SILENCE_DURATION && audioChunksRef.current.length > 0) {
              logger.log(`Silence detected (${silenceDuration}ms), processing audio...`)
              mediaRecorderRef.current.stop()
            }
          }
        }, 100)

        logger.log('Recording resumed')
      }

    } catch (error) {
      logger.error('Audio playback error:', error)
      setState(prev => ({ ...prev, isSpeaking: false }))

      // Try to resume recording even after playback error
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive' && audioContextRef.current) {
        audioChunksRef.current = []
        lastSpeechTimeRef.current = Date.now()
        mediaRecorderRef.current.start(500)
        setState(prev => ({ ...prev, isListening: true }))
        updateStatus('listening')

        // Restart silence detection
        silenceCheckIntervalRef.current = setInterval(() => {
          if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
            return
          }

          const bufferLength = analyserRef.current.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          analyserRef.current.getByteTimeDomainData(dataArray)

          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128
            sum += normalized * normalized
          }
          const rms = Math.sqrt(sum / bufferLength)
          const amplitude = rms * 100

          const SPEECH_THRESHOLD = 1.0
          const SILENCE_DURATION = 1200

          if (amplitude > SPEECH_THRESHOLD) {
            lastSpeechTimeRef.current = Date.now()
          } else {
            const silenceDuration = Date.now() - lastSpeechTimeRef.current
            if (silenceDuration > SILENCE_DURATION && audioChunksRef.current.length > 0) {
              logger.log(`Silence detected (${silenceDuration}ms), processing audio...`)
              mediaRecorderRef.current.stop()
            }
          }
        }, 100)
      }
    }
  }

  // End call
  const endCall = useCallback(async () => {
    logger.log('Ending hybrid voice call')

    // Clear silence check interval
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current)
      silenceCheckIntervalRef.current = null
    }

    // Clear silence timeout (deprecated, but keep for safety)
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    // Stop recording
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }

    // Stop audio stream
    audioStreamRef.current?.getTracks().forEach(track => track.stop())

    // Disconnect analyser
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close()
      } catch (err) {
        // Already closed, ignore
      }
    }

    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }

    // Reset starting flag
    isStartingRef.current = false

    updateStatus('ended')
    setState(prev => ({ ...prev, isListening: false, isSpeaking: false }))

  }, [updateStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup only on unmount
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current)
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop()
      }
      audioStreamRef.current?.getTracks().forEach(track => track.stop())
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect()
        } catch (err) {
          // Already disconnected, ignore
        }
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
        } catch (err) {
          // Already closed, ignore
        }
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [])

  // Helper: Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        // Remove data:audio/webm;base64, prefix
        resolve(base64.split(',')[1])
      }
      reader.readAsDataURL(blob)
    })
  }

  return {
    ...state,
    startCall,
    endCall
  }
}
