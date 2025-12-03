# WebRTC Avatar Test Guide

Complete stap-voor-stap handleiding om de WebRTC avatar functionaliteit te testen.

## ✅ Wat Je Nodig Hebt

Je hebt de volgende API keys nodig:
- ✅ **Heygen**: sk_V2_... (vul je eigen key in)
- ✅ **ElevenLabs**: sk_... (vul je eigen key in)
- ✅ **OpenAI**: sk-proj-... (vul je eigen key in)

⚠️ **BELANGRIJK**: Deel deze keys NOOIT publiekelijk! Roteer ze regelmatig:
- Heygen: https://app.heygen.com/settings/api
- ElevenLabs: https://elevenlabs.io/app/settings/api-keys
- OpenAI: https://platform.openai.com/api-keys

## 🚀 Stap 1: Server Setup

### A. Installeer Dependencies

```bash
cd server
npm install
```

### B. Check .env File

Het bestand `server/.env` is al aangemaakt met jouw keys:

```bash
cat server/.env
```

Je zou moeten zien:
```
ELEVENLABS_API_KEY=YOUR_ELEVENLABS_API_KEY
HEYGEN_API_KEY=YOUR_HEYGEN_API_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
PORT=3001
NODE_ENV=development
```

### C. Start WebRTC Server

```bash
npm start
```

Je zou moeten zien:
```
WebRTC Avatar Server running on port 3001
Socket.io server ready
```

**Laat deze terminal open!**

## 🎨 Stap 2: Frontend Setup

Open een **NIEUWE terminal** (laat server draaien).

### A. Maak Root .env File

```bash
cd /home/user/ttya
touch .env
```

Voeg toe aan `.env` (minimaal voor testing):

```env
# WebRTC Server
VITE_WEBRTC_SERVER_URL=http://localhost:3001

# Supabase (optioneel voor deze test - we skippen database)
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=xxx
```

**Note**: We kunnen testen ZONDER Supabase door mock data te gebruiken.

### B. Start Frontend

```bash
npm run dev
```

Je zou moeten zien:
```
  VITE v5.4.21  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## 🧪 Stap 3: Test de WebRTC Conversation

### Optie A: Directe Test (Zonder Database)

1. Open browser: **http://localhost:5173/living-legacy/conversation-webrtc?avatarId=test**

2. Je ziet de conversation page met:
   - Connection status indicator
   - Microphone button (groot en paars)
   - Text input veld
   - Send button

3. **Geef Microphone Permission** wanneer browser vraagt

4. **Test met Voice Recording:**
   - Houd de **microphone button** ingedrukt
   - Zeg iets: "Hello, how are you?"
   - Laat de button los
   - Je ziet:
     - ✅ "Processing..." status
     - ✅ "Transcribing..." → "Generating response..." → "Creating video..."
     - ✅ Video response speelt automatisch af

5. **Test met Text Input:**
   - Type: "Tell me a story"
   - Klik Send button
   - Zelfde processing flow

### Optie B: Volledige Flow Test (Met Database)

Als je Supabase credentials hebt:

1. Ga naar: **http://localhost:5173/living-legacy/upload-dashboard**

2. Upload:
   - 3+ voice recordings
   - 1+ video file

3. Klik "Create My Avatar"

4. Klik "Start Conversation (WebRTC)"

5. Test voice recording zoals hierboven

## 📊 Verwachte Resultaten

### Succesvolle Test Ziet Er Zo Uit:

**Terminal 1 (Server):**
```
[WebRTC] New connection: abc123
[WebRTC] Starting conversation for avatar: test
[Processor] Processing audio input for avatar: test
[Processor] Transcribing audio with Whisper API
[Processor] Transcription: Hello, how are you?
[Processor] Generating response for: Hello, how are you?
[Processor] Generated response: I'm doing wonderfully, thank you for asking! How has your day been?
[Processor] Converting text to speech
[Processor] Audio saved: /tmp/speech_1234567890.mp3
[Processor] Generating avatar video with Heygen
[Processor] Heygen video creation started: video_xyz789
[Processor] Heygen status (1/40): processing
[Processor] Heygen status (2/40): processing
[Processor] Heygen status (3/40): completed
[Processor] Video ready: https://heygen-video-url.mp4
```

**Browser:**
- Connection status: 🟢 Connected
- Je message: "Hello, how are you?"
- Avatar response video speelt af met audio

### Latency Verwachting:

- **Audio Transcription**: ~1-2 seconden
- **GPT-4 Response**: ~1-2 seconden
- **ElevenLabs TTS**: ~2-3 seconden
- **Heygen Video**: ~20-40 seconden ⚠️
- **Total**: ~25-45 seconden voor eerste response

**Note**: Heygen video generatie neemt de meeste tijd. Dit is normaal.

## 🐛 Troubleshooting

### "Connection Failed"

**Check server is running:**
```bash
curl http://localhost:3001/health
```
Moet returnen: `{"status":"ok"}`

**Check CORS:**
- Server moet draaien op port 3001
- Frontend moet draaien op port 5173

### "Microphone Permission Denied"

- Gebruik Chrome/Firefox/Edge (Safari kan issues hebben)
- Localhost werkt, maar voor HTTPS in productie nodig

### "Processing Failed"

**Check API Keys:**
```bash
# In server directory
node -e "console.log(require('dotenv').config().parsed)"
```

**Test ElevenLabs:**
```bash
curl -X GET "https://api.elevenlabs.io/v1/user" \
  -H "xi-api-key: YOUR_ELEVENLABS_API_KEY"
```

**Test OpenAI:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
```

### "Video Generation Timeout"

- Heygen kan 1-2 minuten duren
- Check Heygen credits: https://app.heygen.com/billing
- Check server logs voor exacte error

### "Audio Not Recording"

**Check browser console:**
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone OK'))
  .catch(err => console.log('❌ Error:', err))
```

## 💰 Kosten Per Test

Elke complete test (voice → video response) kost ongeveer:

- **OpenAI Whisper**: ~$0.006 (per minuut audio)
- **OpenAI GPT-4**: ~$0.01 (per response)
- **ElevenLabs TTS**: ~$0.10 (per minuut audio)
- **Heygen Video**: ~$0.30 (per 30 sec video)

**Total**: ~$0.40 per conversatie

## ✅ Test Checklist

- [ ] Server start zonder errors
- [ ] Health check werkt (`/health`)
- [ ] Frontend start op port 5173
- [ ] Kan naar conversation page navigeren
- [ ] Connection status toont "Connected"
- [ ] Microphone permission granted
- [ ] Voice recording werkt (audio level indicator zichtbaar)
- [ ] Audio wordt getranscribeerd (zie server logs)
- [ ] GPT-4 genereert response
- [ ] ElevenLabs maakt audio
- [ ] Heygen genereert video
- [ ] Video speelt automatisch af in browser
- [ ] Text input fallback werkt ook

## 📸 Screenshots van Succesvolle Test

1. **Initial State**: Connection indicator groen, mic button zichtbaar
2. **Recording**: Mic button rood, audio level bars bewegen
3. **Processing**: "Processing..." met status updates
4. **Response**: Video speelt af met avatar die praat

## 🔄 Na de Test

**BELANGRIJK - Roteer je API Keys:**

1. **OpenAI**: https://platform.openai.com/api-keys
   - Klik op key → "Revoke" → Maak nieuwe aan

2. **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys
   - Klik "Regenerate API Key"

3. **Heygen**: https://app.heygen.com/settings/api
   - Regenerate API key

**Update je .env files met nieuwe keys!**

## 📞 Support

Als je vastzit:
1. Check server logs (terminal waar `npm start` draait)
2. Check browser console (F12 → Console tab)
3. Check network tab voor failed requests
4. Check de server/README.md voor meer details

## 🎉 Success!

Als alles werkt zie je:
- Groene connection indicator
- Je kunt voice messages opnemen
- Avatar genereert video responses
- Video's spelen automatisch af

**Je hebt nu een werkende real-time avatar conversation met 25-45 sec latency!**
