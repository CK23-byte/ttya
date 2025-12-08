# Voice Call Database Setup Guide

This guide will help you set up the database tables required for voice calling functionality.

## Overview

The voice call feature uses:
- **OpenAI Realtime API** for audio streaming and speech recognition
- **Supabase** for session tracking and conversation storage
- **Claude AI** for personality-based responses (optional, for advanced personalization)

## Prerequisites

✅ Supabase project created: https://gfgtxeglkzptqxiufjvv.supabase.co
✅ OPENAI_API_KEY added to Vercel (Dec 3, 2025)
⏳ Database tables need to be created
⏳ Environment variables need to be added to Vercel

---

## Step 1: Create Database Tables

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com/project/gfgtxeglkzptqxiufjvv
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL below
5. Click **Run** (or press Cmd/Ctrl + Enter)

```sql
-- ============================================
-- Voice Call Database Setup for Local Auth
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROFILES TABLE (for local auth support)
-- ============================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  display_name TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  is_local_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Service role can do anything" ON public.profiles;
CREATE POLICY "Service role can do anything"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert or update the "local-user" profile
INSERT INTO public.profiles (id, email, display_name, credits, is_local_user)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'local@ttya.app',
  'Local User',
  999999,
  TRUE
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  is_local_user = EXCLUDED.is_local_user;

-- ============================================
-- VOICE SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  personality_id UUID,
  openai_session_id TEXT,
  ephemeral_token TEXT,
  status TEXT NOT NULL CHECK (status IN ('initializing', 'active', 'ended', 'error')) DEFAULT 'initializing',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Service role can do anything" ON public.voice_sessions;
CREATE POLICY "Service role can do anything"
  ON public.voice_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON public.voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON public.voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_started_at ON public.voice_sessions(started_at DESC);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS voice_sessions_updated_at ON public.voice_sessions;
CREATE TRIGGER voice_sessions_updated_at
  BEFORE UPDATE ON public.voice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VOICE CONVERSATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.voice_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.voice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  personality_name TEXT NOT NULL,
  personality_relationship TEXT,
  transcript JSONB NOT NULL DEFAULT '{"messages": []}',
  audio_url TEXT,
  summary TEXT,
  sentiment_score NUMERIC(3,2),
  total_messages INTEGER DEFAULT 0,
  user_messages INTEGER DEFAULT 0,
  ai_messages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Service role can do anything" ON public.voice_conversations;
CREATE POLICY "Service role can do anything"
  ON public.voice_conversations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user_id ON public.voice_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_session_id ON public.voice_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_created_at ON public.voice_conversations(created_at DESC);

-- ============================================
-- VOICE FUNCTION CALLS TABLE (Optional - for Claude AI integration)
-- ============================================

CREATE TABLE IF NOT EXISTS public.voice_function_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.voice_sessions(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  arguments JSONB NOT NULL,
  response JSONB,
  latency_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.voice_function_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Service role can do anything" ON public.voice_function_calls;
CREATE POLICY "Service role can do anything"
  ON public.voice_function_calls FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_function_calls_session_id ON public.voice_function_calls(session_id);

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to end voice session
CREATE OR REPLACE FUNCTION end_voice_session(
  p_session_id UUID,
  p_duration_seconds INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.voice_sessions
  SET
    status = 'ended',
    ended_at = NOW(),
    duration_seconds = COALESCE(p_duration_seconds, EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER),
    ephemeral_token = NULL
  WHERE id = p_session_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get voice usage statistics
CREATE OR REPLACE FUNCTION get_voice_usage_stats(p_user_id UUID)
RETURNS TABLE (
  total_calls BIGINT,
  total_minutes NUMERIC,
  total_messages BIGINT,
  avg_call_duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_calls,
    ROUND(SUM(duration_seconds)::NUMERIC / 60, 2) as total_minutes,
    SUM(vc.total_messages)::BIGINT as total_messages,
    ROUND(AVG(vs.duration_seconds)::NUMERIC / 60, 2) as avg_call_duration
  FROM public.voice_sessions vs
  LEFT JOIN public.voice_conversations vc ON vc.session_id = vs.id
  WHERE vs.user_id = p_user_id AND vs.status = 'ended';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify local user was created
SELECT id, email, display_name, is_local_user, created_at
FROM public.profiles
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verify tables were created
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'voice_sessions', 'voice_conversations', 'voice_function_calls')
ORDER BY table_name;
```

### Option B: Using Supabase CLI (Alternative)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref gfgtxeglkzptqxiufjvv

# Run the migration
supabase db push
```

---

## Step 2: Get Supabase Service Role Key

1. Go to https://app.supabase.com/project/gfgtxeglkzptqxiufjvv/settings/api
2. Find the **service_role** key (NOT the anon key!)
3. Click to reveal and copy it
4. ⚠️ **IMPORTANT**: This key bypasses Row Level Security - keep it secret!

The key should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...`

---

## Step 3: Configure Vercel Environment Variables

Go to your Vercel project settings and add these environment variables:

### Required for Voice Calls:

```env
# OpenAI Realtime API (already added ✅)
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXX

# Supabase Configuration
SUPABASE_URL=https://gfgtxeglkzptqxiufjvv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional (for Claude AI personality integration):

```env
# Claude AI for advanced personality responses
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXX
```

### How to add in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `SUPABASE_URL`)
   - **Value**: The actual value
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

---

## Step 4: Update VoiceCallPage to Use Local User ID

The VoiceCallPage has already been updated to use `'local-user'` as the userId. However, we need to convert this to the UUID that matches our database:

```typescript
// In src/pages/VoiceCallPage.tsx
// Change from: userId: 'local-user'
// To: userId: '00000000-0000-0000-0000-000000000001'
```

Let me update this file now...

---

## Step 5: Verify Setup

After completing the above steps, verify your setup:

### Check Database Tables:

1. Go to Supabase → Table Editor
2. You should see:
   - ✅ profiles (with 1 row for local-user)
   - ✅ voice_sessions (empty)
   - ✅ voice_conversations (empty)
   - ✅ voice_function_calls (empty)

### Check Environment Variables:

```bash
# In Vercel Dashboard → Settings → Environment Variables
✅ OPENAI_API_KEY
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
```

---

## Step 6: Enable Voice Call Navigation

Once everything is set up, uncomment the navigation code in `src/pages/DashboardPage.tsx`:

```typescript
// Find this section and uncomment:
const params = new URLSearchParams({
  personalityId: profile.id,
  name: profile.name,
  relationship: profile.relationship || '',
  description: profile.systemPrompt || `${profile.name} is a ${profile.relationship} with a warm and loving personality.`
})
navigate(`/voice-call?${params.toString()}`)
```

---

## Testing

### Test Voice Call:

1. Deploy your changes to Vercel
2. Go to your app: https://ttya-XXXXX.vercel.app
3. Navigate to Dashboard
4. Select a profile with a voice sample
5. Click **Call**
6. Allow microphone access
7. Start speaking!

### Check Database:

After making a call, check Supabase:

1. Go to Table Editor → voice_sessions
2. You should see a new row with:
   - ✅ user_id: 00000000-0000-0000-0000-000000000001
   - ✅ status: ended
   - ✅ duration_seconds: (your call duration)

3. Go to voice_conversations
4. You should see the transcript of your conversation

---

## Troubleshooting

### Error: "Database not configured"

**Problem**: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in Vercel

**Solution**:
- Add the missing environment variables in Vercel settings
- Redeploy the application

### Error: "Session not found"

**Problem**: Database tables not created

**Solution**:
- Run the SQL script in Step 1 again
- Check that all tables exist in Supabase Table Editor

### Error: "OpenAI API key not configured"

**Problem**: OPENAI_API_KEY not set in Vercel

**Solution**:
- Verify OPENAI_API_KEY is set in Vercel environment variables
- Make sure it's available in all environments (Production, Preview, Development)

### Error: "Foreign key violation"

**Problem**: Local user profile doesn't exist

**Solution**:
- Run the INSERT statement for local-user in Step 1
- Verify the user exists: `SELECT * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001'`

### Microphone not working

**Problem**: Already fixed! (Permissions-Policy header updated)

**Solution**: Should work now. If not, check browser permissions.

---

## Costs

### OpenAI Realtime API Pricing:

- **Input audio**: $0.06 per minute
- **Output audio**: $0.24 per minute
- **Average call** (50/50 split): ~**$0.15 per minute**

### Example monthly costs:

- 100 users × 10 minutes/month = 1,000 minutes
- 1,000 minutes × $0.15 = **$150/month**

### With Claude AI integration (optional):

- Add ~$0.01 per personalized response
- Estimate 5 responses per call = $0.05 per call
- 1,000 calls × $0.05 = **$50/month extra**

**Total**: ~$200/month for 100 active users

---

## Next Steps

Once voice calls are working:

1. **Monitor usage**: Check OpenAI dashboard for API usage
2. **Test quality**: Make test calls and check conversation quality
3. **Add analytics**: Track call duration, user satisfaction
4. **Consider video calls**: See CALL_FUNCTIE_IMPLEMENTATIE.md for video options

---

## Summary

✅ **What we're setting up**:
- Voice call session tracking
- Conversation transcript storage
- OpenAI Realtime API integration
- Local authentication support

✅ **What you need to do**:
1. Run SQL script in Supabase (Step 1)
2. Get Service Role Key from Supabase (Step 2)
3. Add environment variables to Vercel (Step 3)
4. Redeploy application
5. Test voice call

🎉 **Estimated time**: 15-30 minutes
