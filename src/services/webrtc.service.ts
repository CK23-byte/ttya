/**
 * WebRTC Service for Living Legacy Real-Time Conversations
 * Handles peer connection, audio streaming, and real-time communication
 */

import { io, Socket } from 'socket.io-client'

export interface WebRTCConfig {
  serverUrl: string
  avatarId: string
}

export interface AvatarResponse {
  type: 'video' | 'audio' | 'text'
  videoUrl?: string
  audioUrl?: string
  text?: string
  status: 'processing' | 'ready' | 'error'
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed'

export class WebRTCConversationService {
  private socket: Socket | null = null
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private dataChannel: RTCDataChannel | null = null

  private config: WebRTCConfig
  private onResponseCallback: ((response: AvatarResponse) => void) | null = null
  private onStateChangeCallback: ((state: ConnectionState) => void) | null = null
  private onProcessingCallback: ((status: string) => void) | null = null

  constructor(config: WebRTCConfig) {
    this.config = config
  }

  /**
   * Initialize WebRTC connection
   */
  async initialize(): Promise<void> {
    try {
      // Connect to signaling server
      this.socket = io(this.config.serverUrl, {
        transports: ['websocket'],
        reconnection: true
      })

      this.setupSocketListeners()

      // Request microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      })

      // Create peer connection
      this.createPeerConnection()

      // Add local audio track
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!)
      })

      // Create WebRTC offer
      const offer = await this.peerConnection!.createOffer()
      await this.peerConnection!.setLocalDescription(offer)

      // Send offer to server
      this.socket.emit('webrtc-offer', { offer })

      // Start conversation
      this.socket.emit('start-conversation', {
        avatarId: this.config.avatarId
      })

      console.log('[WebRTC] Initialization complete')

    } catch (error) {
      console.error('[WebRTC] Initialization error:', error)
      this.updateState('failed')
      throw error
    }
  }

  /**
   * Create RTCPeerConnection
   */
  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          candidate: event.candidate
        })
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState
      console.log('[WebRTC] Connection state:', state)

      if (state === 'connected') {
        this.updateState('connected')
      } else if (state === 'failed' || state === 'disconnected') {
        this.updateState('failed')
      }
    }

    // Handle incoming tracks (if any)
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received track:', event.track.kind)
    }

    // Handle data channel
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel
      console.log('[WebRTC] Data channel opened')
    }
  }

  /**
   * Setup Socket.io event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('[WebRTC] Socket connected')
      this.updateState('connecting')
    })

    this.socket.on('disconnect', () => {
      console.log('[WebRTC] Socket disconnected')
      this.updateState('disconnected')
    })

    this.socket.on('webrtc-answer', async (data: { answer: RTCSessionDescriptionInit }) => {
      console.log('[WebRTC] Received answer')

      try {
        await this.peerConnection!.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        )
      } catch (error) {
        console.error('[WebRTC] Error setting remote description:', error)
      }
    })

    this.socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      try {
        await this.peerConnection!.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        )
      } catch (error) {
        console.error('[WebRTC] Error adding ICE candidate:', error)
      }
    })

    this.socket.on('webrtc-connected', () => {
      console.log('[WebRTC] Peer connection established')
      this.updateState('connected')
    })

    this.socket.on('avatar-processing', (data: { message: string }) => {
      console.log('[WebRTC] Processing:', data.message)
      if (this.onProcessingCallback) {
        this.onProcessingCallback(data.message)
      }
    })

    this.socket.on('avatar-response', (response: AvatarResponse) => {
      console.log('[WebRTC] Avatar response received')
      if (this.onResponseCallback) {
        this.onResponseCallback(response)
      }
    })

    this.socket.on('avatar-error', (data: { error: string }) => {
      console.error('[WebRTC] Avatar error:', data.error)
      if (this.onResponseCallback) {
        this.onResponseCallback({
          type: 'text',
          text: 'Sorry, I encountered an error. Please try again.',
          status: 'error'
        })
      }
    })

    this.socket.on('conversation-ready', () => {
      console.log('[WebRTC] Conversation ready')
    })

    this.socket.on('conversation-error', (data: { error: string }) => {
      console.error('[WebRTC] Conversation error:', data.error)
      this.updateState('failed')
    })
  }

  /**
   * Send text message
   */
  sendTextMessage(text: string): void {
    if (!this.socket) {
      throw new Error('WebRTC not initialized')
    }

    console.log('[WebRTC] Sending text message:', text)
    this.socket.emit('text-message', { text })
  }

  /**
   * Start voice recording
   */
  startVoiceRecording(): MediaRecorder | null {
    if (!this.localStream) {
      console.error('[WebRTC] No local stream available')
      return null
    }

    const mediaRecorder = new MediaRecorder(this.localStream, {
      mimeType: 'audio/webm'
    })

    const audioChunks: Blob[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      this.sendAudioMessage(audioBlob)
    }

    mediaRecorder.start()
    console.log('[WebRTC] Started voice recording')

    return mediaRecorder
  }

  /**
   * Send audio message
   */
  private sendAudioMessage(audioBlob: Blob): void {
    if (!this.socket) {
      throw new Error('WebRTC not initialized')
    }

    console.log('[WebRTC] Sending audio message')

    // Convert blob to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      this.socket!.emit('audio-data', {
        audioBlob: base64.split(',')[1] // Remove data:audio/webm;base64, prefix
      })
    }
    reader.readAsDataURL(audioBlob)
  }

  /**
   * Set callback for avatar responses
   */
  onResponse(callback: (response: AvatarResponse) => void): void {
    this.onResponseCallback = callback
  }

  /**
   * Set callback for connection state changes
   */
  onStateChange(callback: (state: ConnectionState) => void): void {
    this.onStateChangeCallback = callback
  }

  /**
   * Set callback for processing status updates
   */
  onProcessing(callback: (status: string) => void): void {
    this.onProcessingCallback = callback
  }

  /**
   * Update connection state
   */
  private updateState(state: ConnectionState): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state)
    }
  }

  /**
   * Get microphone audio level
   */
  getAudioLevel(): number {
    if (!this.localStream) return 0

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(this.localStream)

    source.connect(analyser)
    analyser.fftSize = 256

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    return (average / 255) * 100
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    console.log('[WebRTC] Disconnecting')

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.updateState('disconnected')
  }
}
