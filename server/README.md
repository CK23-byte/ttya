# WebRTC Avatar Server

Real-time WebRTC server for avatar conversations with AI-powered video responses.

## Features

- **WebRTC Signaling**: Peer-to-peer audio streaming
- **Speech-to-Text**: OpenAI Whisper API
- **Conversational AI**: GPT-4 responses
- **Voice Cloning**: ElevenLabs TTS
- **Avatar Videos**: Heygen video generation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in this directory:

```env
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=sk_your_key_here

# Heygen API Configuration
HEYGEN_API_KEY=sk_V2_your_key_here

# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Optional: Custom avatar settings for testing
TEST_VOICE_ID=21m00Tcm4TlvDq8ikWAM
TEST_HEYGEN_AVATAR_ID=Daisy-inskirt-20220818
```

### 3. Start the Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### WebSocket Events

**Client → Server:**
- `start-conversation` - Initialize avatar conversation
- `webrtc-offer` - Send WebRTC offer for peer connection
- `ice-candidate` - Send ICE candidate
- `audio-data` - Send recorded audio blob
- `text-message` - Send text message (fallback)

**Server → Client:**
- `conversation-ready` - Server ready for conversation
- `webrtc-answer` - WebRTC answer from server
- `ice-candidate` - ICE candidate from server
- `webrtc-connected` - Peer connection established
- `avatar-processing` - Processing status update
- `avatar-response` - Avatar video response ready
- `avatar-error` - Error during processing

## Architecture

```
Client Audio → WebRTC → Server
                          ↓
                    Whisper API (STT)
                          ↓
                      GPT-4 (Response)
                          ↓
                   ElevenLabs (TTS)
                          ↓
                    Heygen (Video)
                          ↓
                    Video URL → Client
```

## Testing

### Quick Test

1. Start the server:
   ```bash
   npm start
   ```

2. Check server is running:
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok"}`

3. Start the frontend in another terminal:
   ```bash
   cd ..
   npm run dev
   ```

4. Navigate to: `http://localhost:5173/living-legacy/conversation-webrtc?avatarId=test`

5. Click the microphone button and speak

### Test with Text Message (No Microphone)

You can test without WebRTC by sending text directly via Socket.io:

```javascript
// In browser console
const socket = io('http://localhost:3001')
socket.emit('start-conversation', { avatarId: 'test' })
socket.emit('text-message', { text: 'Hello, how are you?' })
socket.on('avatar-response', (data) => console.log(data))
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### CORS Errors
- Make sure frontend is running on `http://localhost:5173`
- Check CORS settings in `server.js`

### API Errors

**ElevenLabs 401 Unauthorized:**
- Verify API key is correct
- Check quota: https://elevenlabs.io/app/usage

**Heygen 403 Forbidden:**
- Verify API key is correct
- Check credits: https://app.heygen.com/billing

**OpenAI 429 Rate Limit:**
- Add payment method: https://platform.openai.com/account/billing

### Audio/Video Issues

**No microphone access:**
- Grant microphone permissions in browser
- Use HTTPS or localhost only (WebRTC requirement)

**Video generation timeout:**
- Heygen can take 20-60 seconds for video generation
- Check server logs for detailed error messages

## Production Deployment

### Environment Variables

Set these in your hosting platform:

- `ELEVENLABS_API_KEY`
- `HEYGEN_API_KEY`
- `OPENAI_API_KEY`
- `PORT` (default: 3001)
- `NODE_ENV=production`

### Recommended Hosting

- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **Heroku**: WebSocket support
- **AWS EC2**: Full control

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Enable CORS only for your domain
- [ ] Rotate API keys regularly
- [ ] Monitor API usage and costs
- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Add request logging

## Cost Optimization

- Cache avatar configurations
- Implement request queuing
- Add timeout limits
- Monitor API usage
- Use voice cloning only when needed

## License

Private - CK23-byte/ttya
