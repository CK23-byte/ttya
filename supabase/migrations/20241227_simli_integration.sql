-- Simli Real-Time Avatar Integration
-- Single photo → Real-time interactive video calls
-- Migration for Simli avatar and session management

-- ============================================================================
-- 1. Simli Avatars Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.simli_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  avatar_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_profile_avatar UNIQUE(profile_id, user_id)
);

-- Indexes for simli_avatars
CREATE INDEX IF NOT EXISTS idx_simli_avatars_user_id ON public.simli_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_simli_avatars_profile_id ON public.simli_avatars(profile_id);
CREATE INDEX IF NOT EXISTS idx_simli_avatars_avatar_id ON public.simli_avatars(avatar_id);

-- ============================================================================
-- 2. Simli Sessions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.simli_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  voice_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'failed')),
  duration_seconds INTEGER DEFAULT 0,
  credits_used DECIMAL(10,2) DEFAULT 1.0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for simli_sessions
CREATE INDEX IF NOT EXISTS idx_simli_sessions_user_id ON public.simli_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_simli_sessions_session_id ON public.simli_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_simli_sessions_status ON public.simli_sessions(status);
CREATE INDEX IF NOT EXISTS idx_simli_sessions_started_at ON public.simli_sessions(started_at DESC);

-- ============================================================================
-- 3. Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.simli_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simli_sessions ENABLE ROW LEVEL SECURITY;

-- Simli Avatars Policies
CREATE POLICY "Users can view their own avatars"
  ON public.simli_avatars
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own avatars"
  ON public.simli_avatars
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatars"
  ON public.simli_avatars
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avatars"
  ON public.simli_avatars
  FOR DELETE
  USING (auth.uid() = user_id);

-- Simli Sessions Policies
CREATE POLICY "Users can view their own sessions"
  ON public.simli_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.simli_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.simli_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Updated timestamp trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_simli_avatar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simli_avatars_updated_at
  BEFORE UPDATE ON public.simli_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_simli_avatar_timestamp();

-- ============================================================================
-- 5. Comments for documentation
-- ============================================================================
COMMENT ON TABLE public.simli_avatars IS 'Stores Simli avatar configurations created from user photos';
COMMENT ON TABLE public.simli_sessions IS 'Tracks Simli real-time video call sessions for billing and analytics';

COMMENT ON COLUMN public.simli_avatars.avatar_id IS 'Unique identifier for Simli avatar';
COMMENT ON COLUMN public.simli_avatars.photo_url IS 'Supabase Storage URL of the photo used for avatar';
COMMENT ON COLUMN public.simli_sessions.session_id IS 'Unique session identifier';
COMMENT ON COLUMN public.simli_sessions.credits_used IS 'Total credits consumed (1 credit = 5 min, then 0.2/min)';
