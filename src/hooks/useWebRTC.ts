/**
 * useWebRTC - Custom Hook for OpenAI Realtime WebRTC Connection
 *
 * Manages the complete lifecycle of a voice call:
 * - Microphone access
 * - WebRTC connection to OpenAI Realtime API
 * - Audio streaming and playback
 * - Transcription handling
 * - Session management
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  audio_duration_ms?: number
}

interface UseWebRTCOptions {
  personalityId: string
  personalityName: string
  personalityRelationship: string
  personalityDescription: string
  userId: string
  voiceType?: 'cloned' | 'standard'
  voiceId?: string // ElevenLabs voice ID (if voiceType is 'cloned')
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' // OpenAI voice (if voiceType is 'standard')
  onTranscript?: (message: Message) => void
  onError?: (error: Error) => void
  onStatusChange?: (status: ConnectionStatus) => void
}

export type ConnectionStatus =
  | 'idle'
  | 'requesting-mic'
  | 'connecting'
  | 'connected'
  | 'active'
  | 'ended'
  | 'error'

interface WebRTCState {
  status: ConnectionStatus
  isConnected: boolean
  isSpeaking: boolean
  isUserSpeaking: boolean
  audioLevel: number
  duration: number
  messages: Message[]
  error: string | null
}

export function useWebRTC(options: UseWebRTCOptions) {
  const {
    personalityId,
    personalityName,
    personalityRelationship,
    personalityDescription,
    userId,
    voiceType = 'standard',
    voiceId,
    voice = 'alloy',
    onTranscript,
    onError,
    onStatusChange
  } = options

  const [state, setState] = useState<WebRTCState>({
    status: 'idle',
    isConnected: false,
    isSpeaking: false,
    isUserSpeaking: false,
    audioLevel: 0,
    duration: 0,
    messages: [],
    error: null
  })

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Initialize WebRTC connection
   */
  const startCall = useCallback(async () => {
    try {
      updateStatus('requesting-mic')

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000
        }
      })

      audioStreamRef.current = stream
      updateStatus('connecting')

      // Get ephemeral token from backend
      const sessionResponse = await fetch('/api/voice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalityId,
          userId,
          personalityName,
          personalityRelationship,
          personalityDescription,
          voiceType,
          voiceId,
          voice
        })
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to create session')
      }

      const sessionData = await sessionResponse.json()
      sessionIdRef.current = sessionData.sessionId

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // Set up audio context for visualization
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      // Add microphone track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Handle incoming audio tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0]
        const audio = new Audio()
        audio.srcObject = remoteStream
        audio.play()
      }

      // Set up data channel for events
      const dc = pc.createDataChannel('oai-events')
      dataChannelRef.current = dc

      dc.onopen = () => {
        console.log('Data channel opened')
        updateStatus('connected')
        startDurationTimer()
      }

      dc.onmessage = (event) => {
        handleDataChannelMessage(event.data)
      }

      // Create offer and set local description
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Exchange SDP with OpenAI
      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionData.sessionToken}`,
            'Content-Type': 'application/sdp'
          },
          body: offer.sdp
        }
      )

      if (!sdpResponse.ok) {
        throw new Error('Failed to exchange SDP')
      }

      const answerSdp = await sdpResponse.text()
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      })

      updateStatus('active')

    } catch (error) {
      console.error('Failed to start call:', error)
      handleError(error as Error)
    }
  }, [personalityId, userId, personalityName, personalityRelationship, personalityDescription])

  /**
   * End the call and clean up resources
   */
  const endCall = useCallback(async () => {
    try {
      updateStatus('ended')

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }

      // Calculate duration
      const durationSeconds = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0

      // Stop audio tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }

      // Close audio context
      if (audioContextRef.current) {
        await audioContextRef.current.close()
      }

      // Save conversation to backend
      if (sessionIdRef.current && state.messages.length > 0) {
        await fetch('/api/voice/end-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            userId,
            durationSeconds,
            transcript: {
              messages: state.messages
            },
            generateSummary: true
          })
        })
      }

      // Reset refs
      peerConnectionRef.current = null
      dataChannelRef.current = null
      audioStreamRef.current = null
      audioContextRef.current = null
      sessionIdRef.current = null
      startTimeRef.current = null

    } catch (error) {
      console.error('Error ending call:', error)
      handleError(error as Error)
    }
  }, [userId, state.messages])

  /**
   * Handle messages from OpenAI data channel
   */
  const handleDataChannelMessage = useCallback((data: string) => {
    try {
      const event = JSON.parse(data)

      switch (event.type) {
        case 'conversation.item.created':
          // New message in conversation
          if (event.item.type === 'message') {
            const message: Message = {
              role: event.item.role,
              content: event.item.content?.[0]?.transcript || '',
              timestamp: new Date().toISOString()
            }

            setState(prev => ({
              ...prev,
              messages: [...prev.messages, message]
            }))

            onTranscript?.(message)
          }
          break

        case 'input_audio_buffer.speech_started':
          // User started speaking
          setState(prev => ({ ...prev, isUserSpeaking: true }))
          break

        case 'input_audio_buffer.speech_stopped':
          // User stopped speaking
          setState(prev => ({ ...prev, isUserSpeaking: false }))
          break

        case 'response.audio.delta':
          // AI is speaking (receiving audio chunks)
          setState(prev => ({ ...prev, isSpeaking: true }))
          break

        case 'response.audio.done':
          // AI finished speaking
          setState(prev => ({ ...prev, isSpeaking: false }))
          break

        case 'response.audio_transcript.delta':
          // Live transcription of AI speech
          // Can be used for real-time display
          break

        case 'error':
          console.error('OpenAI error:', event.error)
          handleError(new Error(event.error.message))
          break
      }
    } catch (error) {
      console.error('Error parsing data channel message:', error)
    }
  }, [onTranscript])

  /**
   * Update connection status
   */
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setState(prev => ({
      ...prev,
      status: newStatus,
      isConnected: newStatus === 'connected' || newStatus === 'active'
    }))
    onStatusChange?.(newStatus)
  }, [onStatusChange])

  /**
   * Handle errors
   */
  const handleError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      status: 'error',
      error: error.message
    }))
    onError?.(error)
  }, [onError])

  /**
   * Start duration timer
   */
  const startDurationTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setState(prev => ({ ...prev, duration: elapsed }))
      }
    }, 1000)
  }, [])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (state.status === 'connected' || state.status === 'active') {
        endCall()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    startCall,
    endCall
  }
}
