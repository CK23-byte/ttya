-- Tavus API Integration: Real-Time Video Avatar Tables
-- Created: 2024-12-26
-- Purpose: Support for Tavus replicas, personas, and conversations

-- ============================================================================
-- Table: tavus_replicas
-- Stores Tavus replica (digital twin) information per user profile
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tavus_replicas (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,

  -- Tavus IDs
  replica_id TEXT UNIQUE NOT NULL,
  persona_id TEXT,

  -- Video Information
  train_video_url TEXT NOT NULL,
  consent_video_url TEXT,
  video_duration_seconds INTEGER,

  -- Status Tracking
  replica_status TEXT NOT NULL DEFAULT 'training' CHECK (replica_status IN ('training', 'ready', 'failed')),
  persona_status TEXT DEFAULT 'pending' CHECK (persona_status IN ('pending', 'ready', 'failed')),

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

-- Indexes for Performance
CREATE INDEX idx_tavus_replicas_user_id ON public.tavus_replicas(user_id);
CREATE INDEX idx_tavus_replicas_profile_id ON public.tavus_replicas(profile_id);
CREATE INDEX idx_tavus_replicas_replica_id ON public.tavus_replicas(replica_id);
CREATE INDEX idx_tavus_replicas_status ON public.tavus_replicas(replica_status, persona_status);

-- Row Level Security
ALTER TABLE public.tavus_replicas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own replicas"
  ON public.tavus_replicas
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own replicas"
  ON public.tavus_replicas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replicas"
  ON public.tavus_replicas
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replicas"
  ON public.tavus_replicas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
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

-- ============================================================================
-- Table: tavus_conversations
-- Tracks Tavus video conversations for analytics and billing
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tavus_conversations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  replica_id TEXT NOT NULL REFERENCES public.tavus_replicas(replica_id) ON DELETE CASCADE,

  -- Tavus IDs
  conversation_id TEXT UNIQUE NOT NULL,
  conversation_url TEXT NOT NULL,

  -- Metadata
  conversation_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'failed')),
  duration_seconds INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Analytics & Billing
  interaction_count INTEGER DEFAULT 0,
  credits_used DECIMAL(10,2) DEFAULT 0,
  error_message TEXT
);

-- Indexes for Performance
CREATE INDEX idx_tavus_conversations_user_id ON public.tavus_conversations(user_id);
CREATE INDEX idx_tavus_conversations_replica_id ON public.tavus_conversations(replica_id);
CREATE INDEX idx_tavus_conversations_status ON public.tavus_conversations(status);
CREATE INDEX idx_tavus_conversations_created_at ON public.tavus_conversations(created_at DESC);

-- Row Level Security
ALTER TABLE public.tavus_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own conversations"
  ON public.tavus_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.tavus_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.tavus_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Table: tavus_webhook_events
-- Logs all webhook events from Tavus for debugging and audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tavus_webhook_events (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event Data
  event_type TEXT NOT NULL,
  replica_id TEXT,
  conversation_id TEXT,

  -- Payload
  payload JSONB NOT NULL,

  -- Processing Status
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Timestamp
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_tavus_webhook_events_event_type ON public.tavus_webhook_events(event_type);
CREATE INDEX idx_tavus_webhook_events_replica_id ON public.tavus_webhook_events(replica_id);
CREATE INDEX idx_tavus_webhook_events_processed ON public.tavus_webhook_events(processed);
CREATE INDEX idx_tavus_webhook_events_received_at ON public.tavus_webhook_events(received_at DESC);

-- No RLS needed - this is internal logging only

-- ============================================================================
-- Views for Analytics
-- ============================================================================

-- Active Replicas Summary
CREATE OR REPLACE VIEW public.tavus_replicas_summary AS
SELECT
  user_id,
  COUNT(*) as total_replicas,
  COUNT(*) FILTER (WHERE replica_status = 'ready') as ready_replicas,
  COUNT(*) FILTER (WHERE replica_status = 'training') as training_replicas,
  COUNT(*) FILTER (WHERE replica_status = 'failed') as failed_replicas,
  COUNT(*) FILTER (WHERE persona_status = 'ready') as ready_personas
FROM public.tavus_replicas
GROUP BY user_id;

-- Conversation Statistics
CREATE OR REPLACE VIEW public.tavus_conversation_stats AS
SELECT
  user_id,
  COUNT(*) as total_conversations,
  SUM(duration_seconds) as total_duration_seconds,
  SUM(credits_used) as total_credits_used,
  AVG(duration_seconds) as avg_duration_seconds,
  MAX(created_at) as last_conversation_at
FROM public.tavus_conversations
WHERE status = 'ended'
GROUP BY user_id;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get replica by profile_id
CREATE OR REPLACE FUNCTION public.get_tavus_replica_by_profile(
  p_profile_id TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  replica_id TEXT,
  persona_id TEXT,
  replica_status TEXT,
  persona_status TEXT,
  replica_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.replica_id,
    r.persona_id,
    r.replica_status,
    r.persona_status,
    r.replica_name
  FROM public.tavus_replicas r
  WHERE r.profile_id = p_profile_id
    AND r.user_id = p_user_id
    AND r.replica_status = 'ready'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversation as ended
CREATE OR REPLACE FUNCTION public.end_tavus_conversation(
  p_conversation_id TEXT,
  p_duration_seconds INTEGER,
  p_credits_used DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tavus_conversations
  SET
    status = 'ended',
    ended_at = NOW(),
    duration_seconds = p_duration_seconds,
    credits_used = p_credits_used
  WHERE conversation_id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Grants
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tavus_replicas TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tavus_conversations TO authenticated;
GRANT SELECT ON public.tavus_webhook_events TO authenticated;

-- Grant access to views
GRANT SELECT ON public.tavus_replicas_summary TO authenticated;
GRANT SELECT ON public.tavus_conversation_stats TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_tavus_replica_by_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_tavus_conversation TO authenticated;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.tavus_replicas IS 'Stores Tavus replica (digital twin) information for each user profile';
COMMENT ON TABLE public.tavus_conversations IS 'Tracks Tavus video conversations for analytics and billing';
COMMENT ON TABLE public.tavus_webhook_events IS 'Logs webhook events from Tavus API for debugging';

COMMENT ON COLUMN public.tavus_replicas.replica_status IS 'Status: training (processing), ready (available), failed (error)';
COMMENT ON COLUMN public.tavus_replicas.persona_status IS 'Status: pending (not created), ready (available), failed (error)';
COMMENT ON COLUMN public.tavus_conversations.status IS 'Status: active (ongoing), ended (completed), failed (error)';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Tavus integration tables created successfully';
  RAISE NOTICE 'Tables: tavus_replicas, tavus_conversations, tavus_webhook_events';
  RAISE NOTICE 'Views: tavus_replicas_summary, tavus_conversation_stats';
  RAISE NOTICE 'Functions: get_tavus_replica_by_profile, end_tavus_conversation';
END $$;
