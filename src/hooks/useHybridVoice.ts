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
  const startTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  // Update status helper
  const updateStatus = useCallback((status: HybridStatus) => {
    setState(prev => ({ ...prev, status }))
    onStatusChange?.(status)
  }, [onStatusChange])

  // Start call
  const startCall = useCallback(async () => {
    try {
      updateStatus('requesting-mic')

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      audioStreamRef.current = stream

      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate: 44100 })

      // Start recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        await handleRecordingStop()
      }

      // Start recording with 5-second chunks
      mediaRecorder.start(5000)

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

      console.log('Hybrid voice call started')

    } catch (error) {
      console.error('Failed to start call:', error)
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
      console.log('No audio chunks to process')
      return
    }

    updateStatus('processing')

    try {
      // Combine audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      audioChunksRef.current = []

      // Convert to base64
      const base64Audio = await blobToBase64(audioBlob)

      console.log('Transcribing audio...')

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
      console.log('User said:', userText)

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
      console.log('Generating response...')
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
      console.log('AI response:', responseText)

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
      console.log('Generating speech with cloned voice...')
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
      console.log('Speech generated, playing audio...')

      // 4. Play audio
      await playAudio(audioBase64)

      // Resume listening
      if (mediaRecorderRef.current?.state === 'inactive') {
        audioChunksRef.current = []
        mediaRecorderRef.current.start(5000)
        updateStatus('listening')
      }

    } catch (error) {
      console.error('Processing error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Processing failed'
      }))
      onError?.(error instanceof Error ? error : new Error('Processing failed'))

      // Resume listening even after error
      if (mediaRecorderRef.current?.state === 'inactive') {
        audioChunksRef.current = []
        mediaRecorderRef.current.start(5000)
        updateStatus('listening')
      }
    }
  }

  // Play audio
  const playAudio = async (audioBase64: string) => {
    if (!audioContextRef.current) return

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

      source.onended = () => {
        setState(prev => ({ ...prev, isSpeaking: false }))
        updateStatus('listening')
      }

      source.start()

    } catch (error) {
      console.error('Audio playback error:', error)
      setState(prev => ({ ...prev, isSpeaking: false }))
      updateStatus('listening')
    }
  }

  // End call
  const endCall = useCallback(async () => {
    console.log('Ending hybrid voice call')

    // Stop recording
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }

    // Stop audio stream
    audioStreamRef.current?.getTracks().forEach(track => track.stop())

    // Close audio context
    await audioContextRef.current?.close()

    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }

    updateStatus('ended')
    setState(prev => ({ ...prev, isListening: false, isSpeaking: false }))

  }, [updateStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall()
    }
  }, [endCall])

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
