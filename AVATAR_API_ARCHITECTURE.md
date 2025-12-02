# Living Legacy Avatar API Architecture

## Overview
This document outlines the API integrations needed to create a fully functional Living Legacy avatar system.

---

## 1. Upload & Processing Pipeline

### Phase 1: Content Upload (Already Built ✅)
- User uploads text, voice, video via Upload Dashboard
- Files stored in **Supabase Storage**
- Metadata stored in **Supabase Database**

### Phase 2: AI Processing (To Build)

#### A. Voice Cloning
```
API: ElevenLabs Voice Design API
Endpoint: POST https://api.elevenlabs.io/v1/voice-design/clone

Process:
1. Collect 10+ voice samples from user uploads
2. Send to ElevenLabs for voice cloning
3. Receive custom voice_id
4. Store voice_id in Supabase for user's avatar

Alternative: Use their Instant Voice Cloning (needs only 1 min of audio)
```

#### B. Avatar Video Generation
```
API: D-ID Talking Head API
Endpoint: POST https://api.d-id.com/talks

Process:
1. Select best quality video/photo from user uploads
2. Extract face for avatar base
3. Create D-ID "presenter" with user's face
4. Store presenter_id in Supabase

For each conversation:
- Input: Text message + ElevenLabs voice_id
- Output: Video of avatar speaking with cloned voice
```

---

## 2. Real-Time Interaction Architecture

### Option A: REST API (Simpler, Higher Latency)
```
Flow:
User Question → Backend → ElevenLabs TTS → D-ID Video → Stream to Frontend
Latency: ~5-15 seconds per response
Cost: ~$0.15 per minute of conversation
```

### Option B: WebRTC Streaming (Lower Latency)
```
Flow:
User Question (WebRTC audio) → Backend → Process → Stream avatar video back
Latency: ~2-5 seconds per response
Cost: ~$0.20 per minute (+ WebRTC infrastructure)

Implementation:
- User's microphone → WebRTC stream → Server
- Server processes with OpenAI/Claude for response
- Response text → ElevenLabs → Audio
- Audio → D-ID → Video stream
- Video stream → WebRTC back to user
```

---

## 3. API Integration Details

### A. ElevenLabs Integration

**Voice Cloning (One-time setup)**
```javascript
// 1. Upload voice samples
const formData = new FormData()
voiceSamples.forEach(file => formData.append('files', file))

const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
  method: 'POST',
  headers: { 'xi-api-key': ELEVENLABS_API_KEY },
  body: formData
})

const { voice_id } = await response.json()
// Store voice_id in Supabase for this user's avatar
```

**Text-to-Speech (Per conversation)**
```javascript
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
  {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: "Hello, this is your loved one speaking to you.",
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  }
)

// Returns audio stream
const audioBuffer = await response.arrayBuffer()
```

### B. D-ID Integration

**Create Avatar (One-time setup)**
```javascript
// Upload user's best photo/video
const response = await fetch('https://api.d-id.com/images', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${D_ID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: userPhotoUrl // from Supabase Storage
  })
})

const { id: presenter_id } = await response.json()
// Store presenter_id in Supabase
```

**Generate Talking Video (Per conversation)**
```javascript
const response = await fetch('https://api.d-id.com/talks', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${D_ID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    source_url: presenterImageUrl,
    script: {
      type: 'audio',
      audio_url: elevenLabsAudioUrl, // Generated in previous step
      provider: {
        type: 'elevenlabs',
        voice_id: userVoiceId
      }
    },
    config: {
      fluent: true,
      pad_audio: 0,
      stitch: true
    }
  })
})

const { id: talk_id } = await response.json()

// Poll for completion
const video = await fetch(`https://api.d-id.com/talks/${talk_id}`)
const { result_url } = await video.json()
// Stream result_url to user
```

---

## 4. WebRTC Integration (Optional, for Real-Time)

### Server Setup (Node.js + Socket.io)
```javascript
const io = require('socket.io')(server)
const { RTCPeerConnection } = require('wrtc')

io.on('connection', (socket) => {
  const pc = new RTCPeerConnection()

  // Receive user's audio stream
  socket.on('audio-stream', async (audioData) => {
    // 1. Transcribe with Whisper API
    const text = await transcribeAudio(audioData)

    // 2. Generate response with GPT-4
    const response = await generateResponse(text)

    // 3. Convert to speech with ElevenLabs
    const audio = await textToSpeech(response, voiceId)

    // 4. Generate video with D-ID
    const video = await generateTalkingVideo(audio, presenterId)

    // 5. Stream back to user via WebRTC
    const videoTrack = await createVideoTrackFromUrl(video)
    pc.addTrack(videoTrack)

    socket.emit('avatar-response', videoTrack)
  })
})
```

### Frontend WebRTC (React)
```typescript
const startConversation = async () => {
  const pc = new RTCPeerConnection()

  // Get user's microphone
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  stream.getTracks().forEach(track => pc.addTrack(track, stream))

  // Receive avatar video stream
  pc.ontrack = (event) => {
    const avatarVideo = document.getElementById('avatar-video')
    avatarVideo.srcObject = event.streams[0]
  }

  // Connect to signaling server
  socket.emit('start-conversation', { avatarId: user.avatarId })
}
```

---

## 5. Cost Estimation

### Per User Setup (One-time)
- Voice Cloning: $5-10 (ElevenLabs Professional)
- Avatar Creation: Free (D-ID allows presenter creation)
- Storage: ~$0.10/month (Supabase)
**Total: ~$5-10 one-time**

### Per Conversation (Recurring)
- Text-to-Speech: $0.30 per 1000 characters (ElevenLabs)
- Video Generation: $0.10-0.30 per minute (D-ID)
- AI Response: $0.002-0.01 per message (GPT-4)
**Total: ~$0.15-0.40 per minute of conversation**

### Monthly Costs (100 active users, 10 min avg conversation)
- ElevenLabs: $99/month (Professional plan)
- D-ID: $300/month (~1000 minutes at $0.30/min)
- Supabase: $25/month (Pro plan)
- OpenAI: $50/month (GPT-4 API)
**Total: ~$474/month for 100 active users**

---

## 6. Recommended Implementation Phases

### Phase 1: MVP (2-3 weeks)
✅ Upload Dashboard (Done)
✅ Authentication (Done)
⏳ ElevenLabs Voice Cloning Integration
⏳ D-ID Avatar Creation
⏳ Simple REST API for text → avatar video
⏳ Basic conversation interface

### Phase 2: Enhanced Experience (2-4 weeks)
⏳ WebRTC real-time streaming
⏳ Better voice training (more samples)
⏳ Emotion detection and appropriate responses
⏳ Memory system (remembers previous conversations)

### Phase 3: Advanced Features (4-6 weeks)
⏳ Multiple avatar poses/expressions
⏳ Background customization
⏳ Time capsule delivery system
⏳ Family tree integration
⏳ Analytics dashboard

---

## 7. Alternative: Fully Custom ML Approach

If you want to avoid API costs and have full control:

**Voice Cloning:**
- Coqui TTS (open-source, self-hosted)
- Requires: GPU server, ML expertise
- Cost: ~$100-300/month server costs

**Avatar Generation:**
- SadTalker (open-source, research project)
- Real-Time Neural Rendering
- Requires: High-end GPU, significant ML expertise
- Cost: ~$200-500/month server costs

**Pros:** Full control, no per-use costs
**Cons:** Complex setup, maintenance overhead, requires ML team

---

## 8. Recommended Tech Stack

```
Frontend:
- React + TypeScript (✅ Already set up)
- WebRTC for real-time streaming
- Socket.io for real-time communication

Backend:
- Node.js + Express or Next.js API routes
- Supabase for auth, database, storage
- Redis for caching/session management

AI Services:
- ElevenLabs for voice cloning & TTS
- D-ID for avatar video generation
- OpenAI GPT-4 for conversational intelligence

Infrastructure:
- Vercel/Railway for deployment
- Cloudflare for CDN & caching
- Supabase for database & storage
```

---

## Next Steps

1. **Set up API accounts:**
   - ElevenLabs (Professional plan)
   - D-ID (Start with free tier)
   - Keep Supabase (already have)

2. **Build backend API:**
   - Create `/api/avatar/create` endpoint
   - Create `/api/avatar/talk` endpoint
   - Create `/api/voice/clone` endpoint

3. **Integrate with frontend:**
   - Add avatar creation flow after uploads
   - Build conversation interface
   - Add WebRTC if needed

4. **Test & iterate:**
   - Quality checks on voice/video
   - Latency optimization
   - Cost monitoring

Would you like me to start building the API integration layer?
