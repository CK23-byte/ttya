-- Voice Conversations Migration
-- Adds tables for OpenAI Realtime voice call tracking

-- Voice sessions table (tracks active and completed voice calls)
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  personality_id UUID, -- Reference to personality (if you have a personalities table)
  openai_session_id TEXT,
  ephemeral_token TEXT, -- Store temporarily, cleared after session starts
  status TEXT NOT NULL CHECK (status IN ('initializing', 'active', 'ended', 'error')) DEFAULT 'initializing',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voice conversations table (stores transcripts and audio)
CREATE TABLE IF NOT EXISTS public.voice_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.voice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  personality_name TEXT NOT NULL,
  personality_relationship TEXT,
  transcript JSONB NOT NULL DEFAULT '{"messages": []}',
  audio_url TEXT, -- Optional: URL to recorded audio (if user consents)
  summary TEXT, -- AI-generated summary of conversation
  sentiment_score NUMERIC(3,2), -- 0.0 to 1.0 sentiment analysis
  total_messages INTEGER DEFAULT 0,
  user_messages INTEGER DEFAULT 0,
  ai_messages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voice function calls table (tracks Claude AI integrations during call)
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

-- Enable Row Level Security
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_function_calls ENABLE ROW LEVEL SECURITY;

-- Voice sessions policies
CREATE POLICY "Users can view own voice sessions"
  ON public.voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice sessions"
  ON public.voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice sessions"
  ON public.voice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Voice conversations policies
CREATE POLICY "Users can view own voice conversations"
  ON public.voice_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert voice conversations"
  ON public.voice_conversations FOR INSERT
  WITH CHECK (true);

-- Voice function calls policies
CREATE POLICY "Users can view own function calls"
  ON public.voice_function_calls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voice_sessions
    WHERE id = voice_function_calls.session_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Service role can insert function calls"
  ON public.voice_function_calls FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_voice_sessions_user_id ON public.voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_status ON public.voice_sessions(status);
CREATE INDEX idx_voice_sessions_started_at ON public.voice_sessions(started_at DESC);
CREATE INDEX idx_voice_conversations_user_id ON public.voice_conversations(user_id);
CREATE INDEX idx_voice_conversations_session_id ON public.voice_conversations(session_id);
CREATE INDEX idx_voice_function_calls_session_id ON public.voice_function_calls(session_id);

-- Trigger to auto-update timestamp on voice_sessions
CREATE TRIGGER voice_sessions_updated_at
  BEFORE UPDATE ON public.voice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

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
    ephemeral_token = NULL -- Clear token for security
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.voice_sessions TO authenticated;
GRANT SELECT ON public.voice_conversations TO authenticated;
GRANT SELECT ON public.voice_function_calls TO authenticated;
