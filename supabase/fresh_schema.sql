-- ============================================
-- FRESH SCHEMA - Complete database setup for TalkToYouAI
-- ============================================
-- Run this AFTER running cleanup_all.sql to start fresh
-- Or run this on a brand new Supabase project

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (user accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,

  -- Credits (legacy - for general credits)
  credits INTEGER NOT NULL DEFAULT 0,

  -- Specialized credits (new system)
  text_credits INTEGER NOT NULL DEFAULT 0,
  voice_credits INTEGER NOT NULL DEFAULT 0,
  video_credits INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. PERSONALITY PROFILES TABLE (AI personalities)
-- ============================================
CREATE TABLE IF NOT EXISTS public.personality_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic profile info
  profile_id TEXT NOT NULL, -- Client-generated ID for backwards compatibility
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  description TEXT,

  -- Profile data stored as JSONB (photos, videos, notes, voice samples, etc.)
  profile_data JSONB DEFAULT '{
    "textNotes": [],
    "voiceSamples": [],
    "photos": [],
    "videos": [],
    "voiceConfig": {
      "type": "standard",
      "standardVoice": "alloy"
    },
    "avatarConfig": {
      "type": "default",
      "defaultAvatar": "Angela-inblackskirt-20220820"
    }
  }'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure user can't have duplicate profile_ids
  UNIQUE(user_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personality_profiles
CREATE POLICY "Users can view own profiles"
  ON public.personality_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles"
  ON public.personality_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON public.personality_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
  ON public.personality_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. CREDIT TRANSACTIONS TABLE (payment history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  credit_type TEXT NOT NULL CHECK (credit_type IN ('general', 'text', 'voice', 'video')) DEFAULT 'general',
  description TEXT,

  -- Payment info (if applicable)
  stripe_payment_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 4. API USAGE TABLE (tracking API calls)
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  tokens_used INTEGER NOT NULL,
  model TEXT NOT NULL,
  cost_credits INTEGER NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_usage
CREATE POLICY "Users can view own API usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert API usage"
  ON public.api_usage FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 5. FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to deduct credits from user account
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits with row lock
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if enough credits
  IF current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE public.profiles
  SET credits = credits - p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits to user account
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_payment_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add credits
  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description, stripe_payment_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_stripe_payment_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Auto-update timestamp on profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update timestamp on personality_profiles
CREATE TRIGGER personality_profiles_updated_at
  BEFORE UPDATE ON public.personality_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. INDEXES (for better performance)
-- ============================================

-- Credit transactions indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
  ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at
  ON public.credit_transactions(created_at DESC);

-- API usage indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id
  ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at
  ON public.api_usage(created_at DESC);

-- Personality profiles indexes
CREATE INDEX IF NOT EXISTS idx_personality_profiles_user_id
  ON public.personality_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_profiles_profile_id
  ON public.personality_profiles(profile_id);

-- ============================================
-- 8. GRANTS (permissions)
-- ============================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits TO service_role;

-- Grant table permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.personality_profiles TO authenticated;
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.api_usage TO authenticated;

-- ============================================
-- 9. STORAGE POLICIES
-- ============================================

-- NOTE: Storage bucket must be created in Supabase dashboard first!
-- Bucket name: user-uploads
-- Set bucket to PUBLIC in the dashboard

-- Public read access for user-uploads bucket
CREATE POLICY "Allow public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');

-- Authenticated users can upload
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-uploads' AND auth.uid() IS NOT NULL);

-- Users can update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'user-uploads' AND auth.uid() IS NOT NULL);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-uploads' AND auth.uid() IS NOT NULL);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Fresh schema installed successfully!';
  RAISE NOTICE 'Tables created: profiles, personality_profiles, credit_transactions, api_usage';
  RAISE NOTICE 'All RLS policies, functions, triggers, and indexes are set up.';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Make sure to create the "user-uploads" storage bucket in Supabase dashboard:';
  RAISE NOTICE '1. Go to Storage → Create bucket';
  RAISE NOTICE '2. Name: user-uploads';
  RAISE NOTICE '3. Set to PUBLIC';
END $$;
