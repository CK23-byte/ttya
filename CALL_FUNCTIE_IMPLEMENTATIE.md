# Call Functie Implementatie Plan

## Overzicht

De TalkToYouAI applicatie heeft **twee soorten call functionaliteit** geïmplementeerd:

1. **Voice Calls** (Audio-only) - OpenAI Realtime API via WebRTC
2. **Video Calls** (Audio + Video avatar) - Twee opties beschikbaar:
   - **Optie A**: D-ID Streaming API (WebRTC)
   - **Optie B**: HeyGen + ElevenLabs + OpenAI (WebSocket server)

---

## 🎙️ Voice Calls - OpenAI Realtime API

### Huidige Implementatie

**Files:**
- `src/pages/VoiceCallPage.tsx` - Volledig geïmplementeerde call interface
- `src/hooks/useWebRTC.ts` - WebRTC connection management hook
- `api/voice/session.ts` - Serverless function voor session tokens
- `api/voice/end-session.ts` - Session afsluiting en opslag
- `api/voice/function-call.ts` - Claude AI integratie voor personality responses

**Features:**
- ✅ WebRTC peer-to-peer audio streaming
- ✅ Automatische spraakherkenning (OpenAI Whisper via Realtime API)
- ✅ Real-time conversatie met AI
- ✅ Live transcriptie
- ✅ Audio visualizer
- ✅ Call duration tracking
- ✅ Personality-based responses via Claude AI function calling

### Wat Er Moet Gebeuren

#### 1. API Keys Configureren

**In Vercel Environment Variables toevoegen:**

```env
# OpenAI Realtime API
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXX
```

**Hoe te verkrijgen:**
1. Ga naar https://platform.openai.com/api-keys
2. Klik "Create new secret key"
3. Kopieer de key (begint met `sk-proj-`)
4. Voeg toe in Vercel: Settings → Environment Variables

**Kosten:** ~$0.06 per minuut voice call (Realtime API pricing)

#### 2. Supabase Database Tabellen Aanmaken

**Benodigde tabel: `voice_sessions`**

```sql
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  personality_id UUID NOT NULL,
  openai_session_id TEXT NOT NULL,
  ephemeral_token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initializing',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  transcript JSONB,
  summary TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle queries
CREATE INDEX idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_personality_id ON voice_sessions(personality_id);
CREATE INDEX idx_voice_sessions_status ON voice_sessions(status);

-- Row Level Security
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON voice_sessions FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 3. Supabase Environment Variables

**In Vercel toevoegen:**

```env
SUPABASE_URL=https://xxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Waar te vinden:**
- Supabase Dashboard → Settings → API
- URL: Project URL
- Service Role Key: service_role key (NIET de anon key!)

#### 4. Testing

**Lokaal testen (optioneel):**

```bash
# In root directory
echo "VITE_SUPABASE_URL=https://xxx.supabase.co" >> .env
echo "VITE_SUPABASE_ANON_KEY=eyJxxx..." >> .env

npm run dev
```

**Live testen op Vercel:**

1. Deploy naar Vercel
2. Navigeer naar: `https://jouw-app.vercel.app/voice-call?personalityId=xxx&name=Mom&relationship=mother`
3. Klik op microphone toestemming geven
4. Begin te praten
5. AI reageert met OpenAI voice

#### 5. Checklist

- [ ] OPENAI_API_KEY toegevoegd in Vercel
- [ ] SUPABASE_URL toegevoegd in Vercel
- [ ] SUPABASE_SERVICE_ROLE_KEY toegevoegd in Vercel
- [ ] `voice_sessions` tabel aangemaakt in Supabase
- [ ] Row Level Security policies toegevoegd
- [ ] Deploy naar Vercel
- [ ] Test voice call functionaliteit
- [ ] Check Supabase database voor session records
- [ ] Monitor OpenAI API usage en kosten

---

## 📹 Video Calls - Twee Opties

### Optie A: D-ID Streaming API (Aanbevolen voor productie)

**Voordelen:**
- ✅ Laagste latency (~2-5 seconden)
- ✅ Real-time streaming video
- ✅ Minste code om te onderhouden
- ✅ Geen extra server nodig

**Nadelen:**
- ❌ Duurder per minuut
- ❌ Minder controle over avatar kwaliteit

**Files:**
- `api/did/create-stream.ts` - D-ID stream sessie aanmaken
- `api/did/stream-message.ts` - Bericht sturen naar stream
- `api/did/close-stream.ts` - Stream afsluiten

**Wat Er Moet Gebeuren:**

1. **D-ID API Key verkrijgen**
   - Registreer op https://www.d-id.com/
   - Ga naar Settings → API Keys
   - Kopieer API key

2. **Vercel Environment Variables**
   ```env
   DID_API_KEY=basic_XXXXXXXXXXXXXXXXXX
   OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXX
   ```

3. **Kosten**
   - D-ID: ~$0.30 per minuut video streaming
   - OpenAI: ~$0.01 per request (GPT-4)
   - **Total**: ~$0.31 per minuut

### Optie B: HeyGen + ElevenLabs + OpenAI (Aanbevolen voor kwaliteit)

**Voordelen:**
- ✅ Beste avatar kwaliteit
- ✅ Custom voice cloning mogelijk
- ✅ Meer controle over output

**Nadelen:**
- ❌ Hogere latency (~25-45 seconden)
- ❌ Extra server nodig (Node.js + Socket.io)
- ❌ Complexere setup

**Files:**
- `server/server.js` - WebSocket server
- `server/webrtc-handler.js` - WebRTC signaling
- `server/avatar-processor.js` - Audio/video processing
- `src/pages/LivingLegacyConversationPageWebRTC.tsx` - Frontend

**Wat Er Moet Gebeuren:**

#### 1. API Keys Verkrijgen

**HeyGen:**
1. Registreer op https://app.heygen.com/
2. Ga naar Settings → API Keys
3. Kopieer API key (begint met `sk_V2_`)

**ElevenLabs:**
1. Registreer op https://elevenlabs.io/
2. Ga naar Profile → API Keys
3. Kopieer API key (begint met `sk_`)

**OpenAI:**
1. Ga naar https://platform.openai.com/api-keys
2. Create new key
3. Kopieer key (begint met `sk-proj-`)

#### 2. Server Configureren

**Lokaal testen:**

```bash
cd server

# Maak .env file
cat > .env << EOF
ELEVENLABS_API_KEY=sk_XXXXXXXXXXXXXXXXXX
HEYGEN_API_KEY=sk_V2_XXXXXXXXXXXXXXXXXX
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXX
PORT=3001
NODE_ENV=development
EOF

# Installeer dependencies
npm install

# Start server
npm start
```

**Je zou moeten zien:**
```
WebRTC Avatar Server running on port 3001
Socket.io server ready
```

#### 3. Frontend Configureren

```bash
# In root directory
echo "VITE_WEBRTC_SERVER_URL=http://localhost:3001" >> .env

npm run dev
```

**Test URL:**
```
http://localhost:5173/living-legacy/conversation-webrtc?avatarId=test
```

#### 4. Productie Deployment

**Server deployen (Railway aanbevolen):**

1. Ga naar https://railway.app/
2. Connect GitHub repository
3. Select `server` directory
4. Add environment variables:
   ```
   ELEVENLABS_API_KEY=sk_xxx
   HEYGEN_API_KEY=sk_V2_xxx
   OPENAI_API_KEY=sk-proj-xxx
   PORT=3001
   NODE_ENV=production
   ```
5. Deploy

**Frontend configureren:**

In Vercel environment variables:
```env
VITE_WEBRTC_SERVER_URL=https://jouw-server.railway.app
```

#### 5. Kosten (Optie B)

**Per conversatie (~1 minuut):**
- OpenAI Whisper: ~$0.006 (audio transcriptie)
- OpenAI GPT-4: ~$0.01 (response generatie)
- ElevenLabs TTS: ~$0.10 (voice cloning)
- HeyGen Video: ~$0.30 (avatar video)
- **Total**: ~$0.42 per minuut

**Maandelijkse kosten bij 100 gebruikers (10 min/maand elk):**
- 1000 minuten × $0.42 = **$420/maand**

#### 6. Checklist (Optie B)

- [ ] HeyGen account + API key
- [ ] ElevenLabs account + API key
- [ ] OpenAI account + API key
- [ ] Server deployed op Railway/Render/Heroku
- [ ] Environment variables geconfigureerd op server
- [ ] VITE_WEBRTC_SERVER_URL geconfigureerd in Vercel
- [ ] Test lokaal (server + frontend)
- [ ] Test live deployment
- [ ] Monitor API usage en kosten

---

## 🎯 Aanbeveling

### Voor MVP / Testing:
**Voice Calls (OpenAI Realtime)** alleen
- Simpelste setup
- Laagste kosten voor development
- Snelste time-to-market

### Voor Productie:
**Voice Calls** + **Video Calls (D-ID)**
- Goede balans tussen kwaliteit en kosten
- Real-time video experience
- Geen extra server infrastructuur

### Voor Premium Tier:
**Voice Calls** + **Video Calls (HeyGen + ElevenLabs)**
- Hoogste kwaliteit avatars
- Custom voice cloning
- Beste user experience
- Hogere prijspunt rechtvaardigt kosten

---

## 📊 Kosten Vergelijking

| Feature | Setup | Per Minuut | Latency | Kwaliteit |
|---------|-------|------------|---------|-----------|
| Voice Only (OpenAI Realtime) | ⭐⭐⭐⭐⭐ | $0.06 | ~1s | ⭐⭐⭐⭐ |
| Video (D-ID) | ⭐⭐⭐⭐ | $0.31 | ~3s | ⭐⭐⭐ |
| Video (HeyGen) | ⭐⭐ | $0.42 | ~35s | ⭐⭐⭐⭐⭐ |

---

## 🚀 Quick Start Guide

### Minimale Setup (Voice Only)

1. **API Keys**
   ```bash
   # In Vercel Dashboard
   OPENAI_API_KEY=sk-proj-xxx
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx
   ```

2. **Database**
   ```sql
   -- In Supabase SQL Editor
   -- Kopieer voice_sessions tabel SQL van hierboven
   ```

3. **Deploy**
   ```bash
   git push origin main
   # Vercel deploy automatisch
   ```

4. **Test**
   ```
   https://jouw-app.vercel.app/voice-call?personalityId=test&name=Test&relationship=friend
   ```

### Volledige Setup (Voice + Video)

Volg alle stappen in sectie "Optie B" hierboven.

---

## 📞 Support

Als je ergens vastloopt:

1. **Check Server Logs**
   - Vercel: Functions → Logs
   - Railway: Deployments → Logs

2. **Check Browser Console**
   - F12 → Console tab
   - Kijk naar errors

3. **Test API Keys**
   ```bash
   # OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"

   # D-ID
   curl https://api.d-id.com/talks/streams \
     -H "Authorization: Basic $DID_API_KEY"
   ```

4. **Check WEBRTC_TEST_GUIDE.md** voor gedetailleerde troubleshooting

---

## ✅ Final Checklist

### Voice Calls
- [ ] OpenAI API key configured
- [ ] Supabase configured
- [ ] voice_sessions table created
- [ ] Tested on live deployment
- [ ] Monitored costs

### Video Calls (als je dit wilt)
- [ ] Keuze gemaakt: D-ID of HeyGen
- [ ] Relevante API keys configured
- [ ] Server deployed (als HeyGen)
- [ ] Tested video functionality
- [ ] Monitored costs

### Productie Ready
- [ ] Error handling getest
- [ ] Cost monitoring ingesteld
- [ ] Rate limiting overwogen
- [ ] Usage analytics toegevoegd
- [ ] Subscription gating geïmplementeerd

---

**Geschatte tijd om werkend te krijgen:**
- Voice only: **30-60 minuten**
- Voice + Video (D-ID): **2-3 uur**
- Voice + Video (HeyGen): **4-6 uur** (inclusief server setup)

**Success!** 🎉
