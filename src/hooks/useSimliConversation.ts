/**
 * useSimliConversation - Conversation Hook for Simli Video Avatars
 *
 * Pipeline: Whisper (STT) → GPT-4 (Chat) → ElevenLabs (TTS) → Simli (Lip Sync + Video)
 *
 * This hook orchestrates:
 * 1. Audio recording with Voice Activity Detection
 * 2. Transcription with OpenAI Whisper
 * 3. Chat completion with GPT-4
 * 4. Text-to-speech with ElevenLabs cloned voice
 * 5. Audio streaming to Simli for lip sync
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '../utils/logger'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface UseSimliConversationOptions {
  personalityName: string
  personalityRelationship: string
  personalityDescription: string
  voiceId: string // ElevenLabs voice ID
  simliClient: any // SimliClient instance
  onTranscript?: (message: Message) => void
  onError?: (error: Error) => void
}

export type ConversationStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

interface ConversationState {
  status: ConversationStatus
  isListening: boolean
  isSpeaking: boolean
  messages: Message[]
  error: string | null
}

export function useSimliConversation(options: UseSimliConversationOptions) {
  const {
    personalityName,
    personalityRelationship,
    personalityDescription,
    voiceId,
    simliClient,
    onTranscript,
    onError
  } = options

  const [state, setState] = useState<ConversationState>({
    status: 'idle',
    isListening: false,
    isSpeaking: false,
    messages: [],
    error: null
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const silenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpeechTimeRef = useRef<number>(Date.now())
  const isProcessingRef = useRef<boolean>(false)

  // Start listening
  const startListening = useCallback(async () => {
    if (!simliClient || !audioStreamRef.current) {
      logger.error('Cannot start listening: missing simliClient or audioStream')
      return
    }

    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 })
      }

      // Create analyser for voice activity detection
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 2048
        const source = audioContextRef.current.createMediaStreamSource(audioStreamRef.current)
        source.connect(analyserRef.current)
      }

      // Start recording
      const mediaRecorder = new MediaRecorder(audioStreamRef.current, {
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

      // Start recording
      mediaRecorder.start(500)

      // Start silence detection
      silenceCheckIntervalRef.current = setInterval(() => {
        if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
          return
        }

        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteTimeDomainData(dataArray)

        // Calculate amplitude
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          const normalized = (dataArray[i] - 128) / 128
          sum += normalized * normalized
        }
        const rms = Math.sqrt(sum / bufferLength)
        const amplitude = rms * 100

        const SPEECH_THRESHOLD = 1.0
        const SILENCE_DURATION = 1500 // 1.5 seconds

        if (amplitude > SPEECH_THRESHOLD) {
          lastSpeechTimeRef.current = Date.now()
        } else {
          const silenceDuration = Date.now() - lastSpeechTimeRef.current
          if (silenceDuration > SILENCE_DURATION && audioChunksRef.current.length > 0) {
            logger.log(`Silence detected (${silenceDuration}ms), processing...`)
            mediaRecorderRef.current.stop()
          }
        }
      }, 100)

      setState(prev => ({ ...prev, status: 'listening', isListening: true }))
      logger.log('Started listening for user input')

    } catch (error) {
      logger.error('Failed to start listening:', error)
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start listening'
      }))
      onError?.(error instanceof Error ? error : new Error('Failed to start listening'))
    }
  }, [simliClient, onError])

  // Handle recording stop
  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0 || isProcessingRef.current) {
      return
    }

    isProcessingRef.current = true
    setState(prev => ({ ...prev, status: 'processing', isListening: false }))

    try {
      // 1. Combine audio chunks
      const recordedAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      audioChunksRef.current = []

      const base64Audio = await blobToBase64(recordedAudioBlob)

      // 2. Transcribe with Whisper
      logger.log('Transcribing user speech...')
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

      // Add user message
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

      // 3. Get GPT-4 response
      logger.log('Generating AI response...')
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

      // Add assistant message
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

      // 4. Generate speech with ElevenLabs
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
      logger.log('Speech generated, sending to Simli for lip sync...')

      // 5. Play audio through audio element (Simli will sync lips automatically)
      setState(prev => ({ ...prev, status: 'speaking', isSpeaking: true }))

      // Convert base64 to audio blob
      const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)

      // Play through the global Audio API (Simli will detect and sync)
      const audio = new Audio(audioUrl)

      // Wait for audio to finish
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          logger.log('Audio playback finished')
          resolve()
        }
        audio.onerror = (error) => {
          logger.error('Audio playback error:', error)
          URL.revokeObjectURL(audioUrl)
          reject(new Error('Audio playback failed'))
        }
        audio.play().catch(err => {
          logger.error('Failed to play audio:', err)
          URL.revokeObjectURL(audioUrl)
          reject(err)
        })
      })

      // 6. Resume listening
      setState(prev => ({ ...prev, isSpeaking: false }))
      isProcessingRef.current = false

      // Resume listening for next user input
      startListening()

    } catch (error) {
      logger.error('Processing error:', error)
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Processing failed'
      }))
      onError?.(error instanceof Error ? error : new Error('Processing failed'))

      isProcessingRef.current = false

      // Try to resume listening even after error
      setTimeout(() => startListening(), 1000)
    }
  }

  // Stop listening
  const stopListening = useCallback(() => {
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current)
      silenceCheckIntervalRef.current = null
    }

    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }

    setState(prev => ({ ...prev, status: 'idle', isListening: false }))
    isProcessingRef.current = false
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current)
      }
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop()
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect()
        } catch (err) {
          // Already disconnected
        }
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
        } catch (err) {
          // Already closed
        }
      }
    }
  }, [])

  // Helper: Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64.split(',')[1])
      }
      reader.readAsDataURL(blob)
    })
  }

  return {
    ...state,
    startListening,
    stopListening,
    setAudioStream: (stream: MediaStream) => {
      audioStreamRef.current = stream
    }
  }
}
