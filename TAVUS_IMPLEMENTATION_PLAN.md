# Tavus API Implementation Plan
## Schaalbare Real-Time Video Avatar Integratie

**Datum:** 2024-12-26
**Status:** Ready for Implementation
**Geschatte Tijd:** 3-5 dagen

---

## 📋 Executive Summary

### Waarom Tavus?
- **Schaalbaar:** $37.50 per gebruiker vs $500 bij HeyGen
- **Minimale Input:** Slechts 2 minuten video nodig
- **Complete Feature Set:** Real-time video + voice cloning + programmatische API
- **Perfect voor FaceTime-achtige ervaring**

### Kosten Overzicht
- **Development/Testing:** Hobbyist plan $39/maand (3 replicas)
- **Production (100 users):** Growth plan $375/maand (10 gratis + 90 × $37.50)
- **Alternatief:** Enterprise custom pricing voor bulk discount

---

## 🎯 Tavus API Workflow

### Complete Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    GEBRUIKER WORKFLOW                        │
└─────────────────────────────────────────────────────────────┘

1. User uploadt 2-min video → Supabase Storage
2. Backend → Tavus: Create Replica (POST /v2/replicas)
   ├─ train_video_url: Presigned URL van Supabase
   ├─ consent_video_url: Consent statement (embedded of apart)
   └─ replica_name: User's naam

3. Tavus processes video (async, 10-30 minuten)
   └─ Webhook callback → Update database

4. Backend → Tavus: Create Persona (POST /v2/personas)
   ├─ persona_name: User's naam
   ├─ system_prompt: AI personality instructies
   ├─ layers_config:
   │  ├─ llm: OpenAI/Claude/Custom
   │  ├─ tts: Tavus voice of custom voice ID
   │  └─ stt: Tavus default
   └─ context: Memories, personality traits

5. Video Call Start → Create Conversation (POST /v2/conversations)
   ├─ replica_id: User's replica
   ├─ persona_id: User's persona
   └─ Response: conversation_url (Daily.co meeting URL)

6. Frontend → Redirect naar conversation_url
   └─ Real-time WebRTC video call met AI replica

┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTUUR                              │
└─────────────────────────────────────────────────────────────┘

React Frontend
     ↓
Vercel API Routes (/api/tavus/*)
     ↓
Tavus API (tavusapi.com)
     ↓
Daily.co WebRTC (video streaming)
     ↓
User's Browser
```

---

## 🗄️ Database Schema Updates

### Supabase Migrations

#### 1. Nieuwe Tabel: `tavus_replicas`

```sql
CREATE TABLE public.tavus_replicas (
  -- Primary
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL, -- FK to personality profiles

  -- Tavus IDs
  replica_id TEXT UNIQUE NOT NULL,
  persona_id TEXT,

  -- Video Info
  train_video_url TEXT NOT NULL,
  consent_video_url TEXT,
  video_duration_seconds INTEGER,

  -- Status
  replica_status TEXT NOT NULL DEFAULT 'training', -- training, ready, failed
  persona_status TEXT DEFAULT 'pending', -- pending, ready, failed

  -- Metadata
  replica_name TEXT NOT NULL,
  model_name TEXT DEFAULT 'phoenix-3',
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  replica_ready_at TIMESTAMPTZ,
  persona_ready_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT unique_profile_replica UNIQUE(profile_id, user_id)
);

-- Indexes
CREATE INDEX idx_tavus_replicas_user_id ON public.tavus_replicas(user_id);
CREATE INDEX idx_tavus_replicas_profile_id ON public.tavus_replicas(profile_id);
CREATE INDEX idx_tavus_replicas_replica_id ON public.tavus_replicas(replica_id);
CREATE INDEX idx_tavus_replicas_status ON public.tavus_replicas(replica_status, persona_status);

-- RLS Policies
ALTER TABLE public.tavus_replicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own replicas"
  ON public.tavus_replicas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own replicas"
  ON public.tavus_replicas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replicas"
  ON public.tavus_replicas FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_tavus_replicas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tavus_replicas_updated_at
  BEFORE UPDATE ON public.tavus_replicas
  FOR EACH ROW
  EXECUTE FUNCTION update_tavus_replicas_updated_at();
```

#### 2. Nieuwe Tabel: `tavus_conversations`

```sql
CREATE TABLE public.tavus_conversations (
  -- Primary
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  replica_id TEXT NOT NULL REFERENCES public.tavus_replicas(replica_id) ON DELETE CASCADE,

  -- Tavus IDs
  conversation_id TEXT UNIQUE NOT NULL,
  conversation_url TEXT NOT NULL,

  -- Metadata
  conversation_name TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, ended, failed
  duration_seconds INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Analytics
  interaction_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_tavus_conversations_user_id ON public.tavus_conversations(user_id);
CREATE INDEX idx_tavus_conversations_replica_id ON public.tavus_conversations(replica_id);
CREATE INDEX idx_tavus_conversations_status ON public.tavus_conversations(status);

-- RLS Policies
ALTER TABLE public.tavus_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.tavus_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.tavus_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 3. Update bestaande `personality_profiles` metadata

```sql
-- Voeg Tavus metadata toe aan bestaande profiles
-- Dit kan in het profileData JSON object als:
-- {
--   "tavusConfig": {
--     "hasReplica": true,
--     "replicaId": "r783537ef5",
--     "personaId": "p123456",
--     "status": "ready"
--   }
-- }
```

---

## 🔧 Backend API Endpoints

### Bestand Structuur

```
/api/tavus/
  ├── replica.ts       - Create/check replica
  ├── persona.ts       - Create/update persona
  ├── conversation.ts  - Start/end conversation
  └── webhook.ts       - Tavus callback handler
```

### 1. `/api/tavus/replica.ts`

**POST /api/tavus/replica?action=create**
```typescript
// Input
{
  "videoUrl": "https://supabase.co/.../training-video.mp4",
  "consentVideoUrl": "https://supabase.co/.../consent.mp4", // optional
  "replicaName": "Oma Maria",
  "profileId": "profile-123",
  "modelName": "phoenix-3" // optional
}

// Process
1. Validate user authentication
2. Check Supabase credits (deduct cost)
3. Call Tavus API: POST /v2/replicas
4. Save to tavus_replicas table
5. Return replica_id

// Output
{
  "success": true,
  "replicaId": "r783537ef5",
  "status": "training",
  "estimatedCompletionTime": "10-30 minutes"
}
```

**GET /api/tavus/replica?replicaId=r783537ef5**
```typescript
// Check replica status
// Calls: GET /v2/replicas/{replica_id}
// Returns: { status: "ready" | "training" | "failed" }
```

### 2. `/api/tavus/persona.ts`

**POST /api/tavus/persona?action=create**
```typescript
// Input
{
  "replicaId": "r783537ef5",
  "personaName": "Oma Maria",
  "profileId": "profile-123",
  "systemPrompt": "Je bent Oma Maria, een lieve Nederlandse oma...",
  "conversationalContext": {
    "memories": ["Kleinzoon heet Peter", "Woont in Amsterdam"],
    "personality": ["Warm", "Wijs", "Grappig"]
  },
  "voiceId": "elevenlabs-voice-id", // optional, uses ElevenLabs cloned voice
  "llmConfig": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7
  }
}

// Process
1. Validate replica is ready
2. Build persona config with layers
3. Call Tavus API: POST /v2/personas
4. Update tavus_replicas table with persona_id
5. Return persona_id

// Output
{
  "success": true,
  "personaId": "p123456",
  "status": "ready"
}
```

### 3. `/api/tavus/conversation.ts`

**POST /api/tavus/conversation?action=create**
```typescript
// Input
{
  "profileId": "profile-123",
  "conversationName": "Video call with Oma Maria"
}

// Process
1. Get replica_id and persona_id from database
2. Validate both are ready
3. Call Tavus API: POST /v2/conversations
4. Save to tavus_conversations table
5. Deduct credits for conversation start
6. Return conversation_url

// Output
{
  "success": true,
  "conversationId": "conv-abc123",
  "conversationUrl": "https://tavus.daily.co/conv-abc123",
  "expiresAt": "2024-12-26T18:00:00Z"
}
```

**POST /api/tavus/conversation?action=end**
```typescript
// End conversation and update usage
{
  "conversationId": "conv-abc123",
  "durationSeconds": 180
}

// Process
1. Update tavus_conversations table
2. Calculate credit usage (1 min = 6.5 interactions)
3. Deduct credits from user
4. Return usage statistics
```

### 4. `/api/tavus/webhook.ts`

**POST /api/tavus/webhook**
```typescript
// Tavus webhook for async events
{
  "event_type": "replica.training.completed",
  "replica_id": "r783537ef5",
  "status": "ready",
  "timestamp": "2024-12-26T12:00:00Z"
}

// Process
1. Verify webhook signature (security)
2. Update tavus_replicas table status
3. Trigger notification to user (optional)
4. Auto-create persona if needed

// Webhook Events
- replica.training.completed
- replica.training.failed
- conversation.started
- conversation.ended
```

---

## 🎨 Frontend Updates

### 1. ProfileImprovementPage.tsx

**Nieuwe Sectie: Video Avatar Training**

```typescript
// Na de huidige avatar sectie toevoegen:

{/* Tavus Video Avatar Section */}
<div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 space-y-4">
  <h3 className="text-lg font-semibold text-purple-900">
    📹 Interactive Video Avatar (Tavus)
  </h3>

  {!tavusReplica ? (
    <>
      <p className="text-sm text-purple-800">
        Maak een interactieve video avatar voor real-time video calls.
        Upload een 2-minuten video waarin de persoon frontaal in beeld is en spreekt.
      </p>

      {/* Video Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-purple-900">
          Training Video (2+ minuten)
        </label>
        <input
          type="file"
          accept="video/mp4,video/webm"
          onChange={handleTrainingVideoUpload}
          className="..."
        />
        <p className="text-xs text-purple-600">
          ✓ 2-5 minuten lengte<br/>
          ✓ Frontaal gezicht zichtbaar<br/>
          ✓ Goede verlichting<br/>
          ✓ Duidelijke spraak<br/>
          ✓ MP4 of WebM formaat
        </p>
      </div>

      {/* Optional: Consent Video */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-purple-900">
          Consent Video (Optioneel)
        </label>
        <input
          type="file"
          accept="video/mp4,video/webm"
          onChange={handleConsentVideoUpload}
          className="..."
        />
        <p className="text-xs text-purple-600">
          Consent statement kan ook aan het begin van de training video.
        </p>
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreateTavusReplica}
        disabled={!trainingVideo || isCreatingReplica}
        className="..."
      >
        {isCreatingReplica ? 'Creating Replica...' : 'Create Interactive Avatar'}
      </button>

      {/* Progress */}
      {isCreatingReplica && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing...</span>
            <span>{replicaProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${replicaProgress}%` }}
            />
          </div>
          <p className="text-xs text-purple-600">
            This may take 10-30 minutes. You can close this page and come back later.
          </p>
        </div>
      )}
    </>
  ) : (
    <>
      {/* Replica Created */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {tavusReplica.status === 'ready' ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-900">
            Interactive Avatar: {tavusReplica.replicaName}
          </p>
          <p className="text-xs text-purple-600">
            Status: {tavusReplica.status === 'ready' ? 'Ready for video calls!' : 'Training in progress...'}
          </p>
          {tavusReplica.personaId && (
            <p className="text-xs text-purple-600">
              Persona: Configured ✓
            </p>
          )}
        </div>
      </div>

      {/* Test Video Call Button */}
      {tavusReplica.status === 'ready' && tavusReplica.personaId && (
        <button
          onClick={() => navigate(`/video-tavus?profile=${profile.id}`)}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
        >
          🎥 Start Test Video Call
        </button>
      )}
    </>
  )}

  {/* Cost Info */}
  <div className="text-xs text-purple-600 bg-purple-100 p-3 rounded">
    <strong>Cost:</strong> Creating an interactive avatar costs 50 credits.
    Video calls cost 0.2 credits per minute.
  </div>
</div>
```

### 2. Nieuwe Pagina: VideoTavusPage.tsx

**Real-time Video Call met Tavus**

```typescript
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { logger } from '../utils/logger'

export default function VideoTavusPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSupabaseAuth()
  const [conversationUrl, setConversationUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const profileId = searchParams.get('profile')

  useEffect(() => {
    if (!profileId) {
      setError('No profile selected')
      return
    }

    startVideoCall()
  }, [profileId])

  const startVideoCall = async () => {
    try {
      setIsLoading(true)

      // Create conversation
      const response = await fetch('/api/tavus/conversation?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          conversationName: `Video call at ${new Date().toLocaleString()}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start conversation')
      }

      const data = await response.json()
      logger.log('Conversation created:', data)

      // Redirect to Tavus conversation URL (Daily.co iframe)
      setConversationUrl(data.conversationUrl)

    } catch (err) {
      logger.error('Error starting video call:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white">Starting video call...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-black">
      {/* Embed Tavus conversation (Daily.co iframe) */}
      <iframe
        src={conversationUrl}
        allow="camera; microphone; autoplay; display-capture"
        className="w-full h-full border-0"
      />

      {/* End Call Button (Overlay) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => navigate(`/chat?profile=${profileId}`)}
          className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700"
        >
          End Call
        </button>
      </div>
    </div>
  )
}
```

### 3. Update VideoPage.tsx

**Add Tavus Option Toggle**

```typescript
// Bovenaan de VideoPage, voeg optie toe om te kiezen tussen HeyGen en Tavus:

const [videoProvider, setVideoProvider] = useState<'heygen' | 'tavus'>('tavus')

// Check welke provider beschikbaar is
useEffect(() => {
  // Check of Tavus replica beschikbaar is
  const checkTavusAvailability = async () => {
    // Query database voor tavus_replicas
    if (tavusReplicaAvailable) {
      setVideoProvider('tavus')
    } else {
      setVideoProvider('heygen')
    }
  }

  checkTavusAvailability()
}, [profile])

// Bij start call:
const startCall = async () => {
  if (videoProvider === 'tavus') {
    navigate(`/video-tavus?profile=${profile.id}`)
  } else {
    // Bestaande HeyGen logica
  }
}
```

---

## 🔐 Environment Variables

### Vercel Environment Variables Toevoegen

```bash
# Tavus API
TAVUS_API_KEY=your_tavus_api_key_here
TAVUS_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Custom LLM for Personas
OPENAI_API_KEY=your_openai_key_here  # Already exists
```

---

## 💰 Credit System Updates

### Update Credit Pricing

```typescript
// In src/types/database.ts

export const CREDIT_PRICING = {
  // ... existing prices ...

  // Tavus Video Avatar
  TAVUS_REPLICA_CREATE: 50,        // One-time: Create replica
  TAVUS_PERSONA_CREATE: 10,        // One-time: Create persona
  TAVUS_VIDEO_CALL_PER_MINUTE: 0.2, // Per minute of video call
  TAVUS_VIDEO_CALL_MINIMUM: 1,     // Minimum 5 minutes charged
}
```

### Update Credit Deduction Logic

```typescript
// In api/tavus/conversation.ts

// When starting call
await deductCredits(userId, CREDIT_PRICING.TAVUS_VIDEO_CALL_MINIMUM)

// When ending call
const additionalMinutes = Math.max(0, durationMinutes - 5)
if (additionalMinutes > 0) {
  await deductCredits(
    userId,
    additionalMinutes * CREDIT_PRICING.TAVUS_VIDEO_CALL_PER_MINUTE
  )
}
```

---

## 📊 Analytics & Monitoring

### Events to Track

```typescript
// Track via Supabase or custom analytics

1. Replica Creation Started
   - user_id
   - profile_id
   - video_duration
   - timestamp

2. Replica Creation Completed
   - replica_id
   - processing_time_seconds
   - success/failure

3. Persona Created
   - persona_id
   - llm_provider
   - voice_provider

4. Video Call Started
   - conversation_id
   - replica_id
   - timestamp

5. Video Call Ended
   - conversation_id
   - duration_seconds
   - credits_used
   - interaction_count

6. Errors
   - error_type
   - error_message
   - context
```

---

## ✅ Testing Checklist

### Phase 1: Setup & Integration
- [ ] Tavus account created (Hobbyist plan $39)
- [ ] API key configured in Vercel
- [ ] Database migrations applied
- [ ] Backend API endpoints created
- [ ] Webhook endpoint configured

### Phase 2: Replica Creation
- [ ] Upload test video (2 min) to Supabase
- [ ] Call create replica endpoint
- [ ] Verify replica in Tavus dashboard
- [ ] Receive webhook callback
- [ ] Database status updated to "ready"

### Phase 3: Persona Configuration
- [ ] Create persona with test system prompt
- [ ] Configure LLM (OpenAI GPT-4)
- [ ] Configure TTS (Tavus default or ElevenLabs)
- [ ] Verify persona in database

### Phase 4: Video Call
- [ ] Start conversation via API
- [ ] Receive conversation URL
- [ ] Redirect to iframe
- [ ] Test video/audio quality
- [ ] Test conversation flow
- [ ] End call properly
- [ ] Verify credit deduction

### Phase 5: Edge Cases
- [ ] Test with invalid video format
- [ ] Test with video too short (<2 min)
- [ ] Test with poor lighting
- [ ] Test concurrent call limits
- [ ] Test webhook failures
- [ ] Test credit insufficient scenario

---

## 🚀 Deployment Steps

### Step 1: Account Setup (JIJ)
1. Ga naar https://tavus.io
2. Sign up voor Developer account
3. Kies Hobbyist plan ($39/maand)
4. Copy API key van dashboard
5. Genereer webhook secret
6. Stuur mij de credentials (via veilige manier)

### Step 2: Database Setup (IK)
1. Create migration file
2. Apply migrations to Supabase
3. Verify tables created
4. Test RLS policies

### Step 3: Backend Development (IK)
1. Create `/api/tavus/*` endpoints
2. Implement replica creation
3. Implement persona creation
4. Implement conversation management
5. Implement webhook handler
6. Add error handling & logging

### Step 4: Frontend Development (IK)
1. Update ProfileImprovementPage
2. Create VideoTavusPage
3. Update routing
4. Add UI for replica status
5. Add loading states
6. Add error handling

### Step 5: Testing (WIJ SAMEN)
1. Ik test met mock data
2. Jij upload test video
3. We testen replica creation
4. We testen video call
5. We testen credit deduction
6. We fixen bugs

### Step 6: Production Deployment (IK)
1. Update environment variables in Vercel
2. Deploy to production
3. Monitor logs
4. Monitor Tavus usage dashboard

---

## 📚 API Documentation References

- **Tavus Docs:** https://docs.tavus.io/
- **Create Replica:** https://docs.tavus.io/api-reference/phoenix-replica-model/create-replica
- **Create Persona:** https://docs.tavus.io/api-reference/personas/create-persona
- **Create Conversation:** https://docs.tavus.io/api-reference/conversations/create-conversation
- **CVI Overview:** https://docs.tavus.io/sections/conversational-video-interface/cvi-overview
- **GitHub Examples:** https://github.com/Tavus-Engineering/tavus-examples

---

## 🔄 Migration van HeyGen naar Tavus

### Bestaande Functionaliteit Behouden
- HeyGen blijft beschikbaar voor voice calls (ElevenLabs integration)
- HeyGen Talking Photos blijven werken voor pre-rendered videos
- Users kunnen kiezen tussen providers

### Nieuwe Functionaliteit
- Tavus voor real-time interactive video calls
- Betere schaalbaarheid
- Lagere kosten per gebruiker

### Backwards Compatibility
```typescript
// Check welke provider beschikbaar is
const hasHeyGenAvatar = profile.avatarConfig?.type === 'default'
const hasTavusReplica = profile.tavusConfig?.hasReplica

// Show beide opties in UI
if (hasTavusReplica) {
  // Toon "Interactive Video Call" knop
}
if (hasHeyGenAvatar) {
  // Toon "Video Message" knop (HeyGen Talking Photo)
}
```

---

## 💡 Best Practices

### Video Upload
- **Compressie:** Client-side compressie voor snellere uploads
- **Validation:** Check video duration, format, file size
- **Progress:** Toon upload progress bar
- **Guidance:** Clear instructions voor beste kwaliteit

### Replica Training
- **Async Processing:** Gebruik webhooks, niet polling
- **User Notifications:** Email/push wanneer replica ready
- **Retry Logic:** Auto-retry bij failures
- **Status Updates:** Real-time status in UI

### Conversation Management
- **Pre-warming:** Create persona direct na replica ready
- **Session Limits:** Monitor concurrent sessions
- **Cleanup:** End conversations properly
- **Error Recovery:** Graceful fallback bij failures

### Cost Optimization
- **Caching:** Cache persona configs
- **Pooling:** Hergebruik personas waar mogelijk
- **Monitoring:** Alert bij unusual usage patterns
- **Limits:** Set max duration per call

---

## 🎬 Next Steps

**Wat ik nodig heb van jou:**

1. **Tavus Account:**
   - Sign up voor Hobbyist plan
   - Stuur mij API key + webhook secret

2. **Test Video:**
   - Record een 2-minuut test video
   - Frontaal, goede lighting, duidelijke spraak
   - Upload naar shared folder

3. **Goedkeuring:**
   - Review dit plan
   - Geef green light om te starten

**Wat ik ga doen:**

1. Database migrations maken
2. Alle API endpoints bouwen
3. Frontend updates implementeren
4. Testing met jouw test video
5. Production deployment

**Geschatte Timeline:**
- Day 1-2: Backend + Database
- Day 3: Frontend updates
- Day 4: Testing + debugging
- Day 5: Production deployment

---

**Klaar om te starten?** 🚀
