/**
 * WebRTC Peer Connection Handler
 * Manages individual peer connections and avatar processing
 */

const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc')
const { processAvatarResponse } = require('./avatar-processor')
const fs = require('fs').promises

class WebRTCPeer {
  constructor(socket, avatarId, io) {
    this.socket = socket
    this.avatarId = avatarId
    this.io = io
    this.peerConnection = null
    this.dataChannel = null
    this.audioStream = null
    this.videoStream = null

    this.initializePeerConnection()
  }

  initializePeerConnection() {
    // Create RTCPeerConnection with STUN servers
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] Sending ICE candidate to client')
        this.socket.emit('ice-candidate', {
          candidate: event.candidate
        })
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state: ${this.peerConnection.connectionState}`)

      if (this.peerConnection.connectionState === 'connected') {
        this.socket.emit('webrtc-connected')
      }

      if (this.peerConnection.connectionState === 'failed') {
        this.socket.emit('webrtc-failed')
        this.close()
      }
    }

    // Handle incoming tracks (audio from client)
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received track:', event.track.kind)

      if (event.track.kind === 'audio') {
        this.audioStream = event.streams[0]
        console.log('[WebRTC] Audio stream received from client')
      }
    }

    // Create data channel for control messages
    this.dataChannel = this.peerConnection.createDataChannel('control')
    this.dataChannel.onopen = () => {
      console.log('[WebRTC] Data channel opened')
    }
    this.dataChannel.onmessage = (event) => {
      console.log('[WebRTC] Data channel message:', event.data)
    }

    console.log('[WebRTC] Peer connection initialized')
  }

  async handleOffer(offer) {
    try {
      console.log('[WebRTC] Setting remote description')
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

      console.log('[WebRTC] Creating answer')
      const answer = await this.peerConnection.createAnswer()

      console.log('[WebRTC] Setting local description')
      await this.peerConnection.setLocalDescription(answer)

      console.log('[WebRTC] Sending answer to client')
      this.socket.emit('webrtc-answer', {
        answer: this.peerConnection.localDescription
      })
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error)
      throw error
    }
  }

  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('[WebRTC] ICE candidate added')
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error)
    }
  }

  async processAudio(audioBlob) {
    try {
      console.log('[WebRTC] Processing audio blob')

      // Emit processing status
      this.socket.emit('avatar-processing', {
        status: 'transcribing',
        message: 'Converting speech to text...'
      })

      // Save audio temporarily
      const audioPath = `/tmp/audio_${Date.now()}.webm`
      await fs.writeFile(audioPath, Buffer.from(audioBlob))

      // Process with avatar service
      const result = await processAvatarResponse(
        audioPath,
        this.avatarId,
        'audio'
      )

      // Send video response back to client
      await this.sendVideoResponse(result.videoUrl)

      // Cleanup
      await fs.unlink(audioPath)

    } catch (error) {
      console.error('[WebRTC] Error processing audio:', error)
      this.socket.emit('avatar-error', {
        error: error.message
      })
    }
  }

  async processText(text) {
    try {
      console.log('[WebRTC] Processing text:', text)

      this.socket.emit('avatar-processing', {
        status: 'generating',
        message: 'Generating avatar response...'
      })

      // Process with avatar service
      const result = await processAvatarResponse(
        text,
        this.avatarId,
        'text'
      )

      // Send video response back to client
      await this.sendVideoResponse(result.videoUrl)

    } catch (error) {
      console.error('[WebRTC] Error processing text:', error)
      this.socket.emit('avatar-error', {
        error: error.message
      })
    }
  }

  async sendVideoResponse(videoUrl) {
    try {
      console.log('[WebRTC] Sending video response:', videoUrl)

      // For WebRTC, we can either:
      // 1. Stream the video directly (requires video track management)
      // 2. Send the URL and let client play it (hybrid approach)

      // Using hybrid approach for now
      this.socket.emit('avatar-response', {
        type: 'video',
        videoUrl: videoUrl,
        status: 'ready'
      })

      // Alternative: Stream video via WebRTC track
      // This would require setting up MediaStream from video file
      // and adding track to peerConnection

    } catch (error) {
      console.error('[WebRTC] Error sending video response:', error)
      throw error
    }
  }

  close() {
    console.log('[WebRTC] Closing peer connection')

    if (this.dataChannel) {
      this.dataChannel.close()
    }

    if (this.peerConnection) {
      this.peerConnection.close()
    }

    this.audioStream = null
    this.videoStream = null
  }
}

async function handleWebRTCConnection(socket, avatarId, io) {
  console.log(`[WebRTC] Creating peer for avatar: ${avatarId}`)

  const peer = new WebRTCPeer(socket, avatarId, io)

  return peer
}

module.exports = {
  handleWebRTCConnection
}
