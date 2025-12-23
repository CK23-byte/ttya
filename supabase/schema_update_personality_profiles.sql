-- Personality Profiles Table
-- Stores user's personality profiles (like "Mother", "Father", etc.) permanently in database
-- This replaces localStorage for Supabase users

-- Create personality_profiles table
CREATE TABLE IF NOT EXISTS public.personality_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL, -- Client-generated ID (for backwards compatibility)
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  description TEXT,

  -- Profile data (JSON format)
  profile_data JSONB DEFAULT '{
    "textNotes": [],
    "voiceSamples": [],
    "photos": [],
    "videos": [],
    "voiceConfig": {"type": "standard", "standardVoice": "alloy"},
    "avatarConfig": {"type": "default", "defaultAvatar": "Angela-inblackskirt-20220820"}
  }'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure user can't have duplicate profile_ids
  UNIQUE(user_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_personality_profiles_user_id
  ON public.personality_profiles(user_id);

-- Trigger to auto-update timestamp
CREATE TRIGGER personality_profiles_updated_at
  BEFORE UPDATE ON public.personality_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Grant permissions
GRANT ALL ON public.personality_profiles TO authenticated;
