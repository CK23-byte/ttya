/**
 * Living Legacy WebRTC Signaling Server
 * Handles real-time avatar conversations with low latency
 */

require('dotenv').config({ path: '../.env' })
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { handleWebRTCConnection } = require('./webrtc-handler')

const app = express()
const server = http.createServer(app)

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Store active peer connections
const activePeers = new Map()

io.on('connection', (socket) => {
  console.log(`[Server] Client connected: ${socket.id}`)

  // Handle WebRTC signaling
  socket.on('start-conversation', async (data) => {
    console.log(`[Server] Starting conversation for avatar: ${data.avatarId}`)

    try {
      // Initialize WebRTC peer connection for this client
      const peer = await handleWebRTCConnection(socket, data.avatarId, io)
      activePeers.set(socket.id, peer)

      socket.emit('conversation-ready', {
        status: 'ready',
        message: 'WebRTC connection established'
      })
    } catch (error) {
      console.error('[Server] Error starting conversation:', error)
      socket.emit('conversation-error', {
        error: error.message
      })
    }
  })

  // Handle WebRTC offer from client
  socket.on('webrtc-offer', async (data) => {
    console.log('[Server] Received WebRTC offer')
    const peer = activePeers.get(socket.id)

    if (peer) {
      try {
        await peer.handleOffer(data.offer)
      } catch (error) {
        console.error('[Server] Error handling offer:', error)
        socket.emit('webrtc-error', { error: error.message })
      }
    }
  })

  // Handle ICE candidates
  socket.on('ice-candidate', async (data) => {
    const peer = activePeers.get(socket.id)

    if (peer) {
      try {
        await peer.addIceCandidate(data.candidate)
      } catch (error) {
        console.error('[Server] Error adding ICE candidate:', error)
      }
    }
  })

  // Handle incoming audio stream (user speaking)
  socket.on('audio-data', async (data) => {
    const peer = activePeers.get(socket.id)

    if (peer) {
      try {
        // Process audio and generate avatar response
        await peer.processAudio(data.audioBlob)
      } catch (error) {
        console.error('[Server] Error processing audio:', error)
        socket.emit('processing-error', { error: error.message })
      }
    }
  })

  // Handle text messages (fallback)
  socket.on('text-message', async (data) => {
    const peer = activePeers.get(socket.id)

    if (peer) {
      try {
        await peer.processText(data.text)
      } catch (error) {
        console.error('[Server] Error processing text:', error)
        socket.emit('processing-error', { error: error.message })
      }
    }
  })

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`[Server] Client disconnected: ${socket.id}`)

    const peer = activePeers.get(socket.id)
    if (peer) {
      peer.close()
      activePeers.delete(socket.id)
    }
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    activePeers: activePeers.size,
    uptime: process.uptime()
  })
})

// Server info
app.get('/', (req, res) => {
  res.json({
    name: 'Living Legacy WebRTC Server',
    version: '1.0.0',
    status: 'running',
    connections: activePeers.size
  })
})

const PORT = process.env.WEBRTC_SERVER_PORT || 3001

server.listen(PORT, () => {
  console.log(`[Server] Living Legacy WebRTC Server running on port ${PORT}`)
  console.log(`[Server] Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, closing connections...')

  activePeers.forEach((peer, socketId) => {
    peer.close()
  })

  server.close(() => {
    console.log('[Server] Server closed')
    process.exit(0)
  })
})
