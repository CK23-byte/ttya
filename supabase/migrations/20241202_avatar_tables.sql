-- Living Legacy Avatar Profiles Table
CREATE TABLE IF NOT EXISTS avatar_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  elevenlabs_voice_id TEXT,
  did_presenter_id TEXT,
  presenter_image_url TEXT,
  voice_samples_count INTEGER DEFAULT 0,
  video_samples_count INTEGER DEFAULT 0,
  text_samples_count INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'creating' CHECK (status IN ('creating', 'training', 'ready', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Living Legacy Avatar Messages Table
CREATE TABLE IF NOT EXISTS avatar_messages (
  id TEXT PRIMARY KEY,
  avatar_id UUID NOT NULL REFERENCES avatar_profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  audio_url TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_avatar_profiles_user_id ON avatar_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_profiles_status ON avatar_profiles(status);
CREATE INDEX IF NOT EXISTS idx_avatar_messages_avatar_id ON avatar_messages(avatar_id);
CREATE INDEX IF NOT EXISTS idx_avatar_messages_recipient_id ON avatar_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_avatar_messages_created_at ON avatar_messages(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE avatar_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_messages ENABLE ROW LEVEL SECURITY;

-- Avatar Profiles: Users can only see and manage their own avatars
CREATE POLICY "Users can view own avatar profiles"
  ON avatar_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avatar profiles"
  ON avatar_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar profiles"
  ON avatar_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own avatar profiles"
  ON avatar_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Avatar Messages: Users can see messages from their own avatars or messages sent to them
CREATE POLICY "Users can view own avatar messages"
  ON avatar_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM avatar_profiles
      WHERE avatar_profiles.id = avatar_messages.avatar_id
      AND avatar_profiles.user_id = auth.uid()
    )
    OR avatar_messages.recipient_id = auth.uid()
  );

CREATE POLICY "Users can insert messages for own avatars"
  ON avatar_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM avatar_profiles
      WHERE avatar_profiles.id = avatar_messages.avatar_id
      AND avatar_profiles.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_avatar_profiles_updated_at
  BEFORE UPDATE ON avatar_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage Bucket for Living Legacy content
INSERT INTO storage.buckets (id, name, public)
VALUES ('living-legacy', 'living-legacy', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'living-legacy' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'living-legacy' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'living-legacy' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Grant public read access to living-legacy bucket
CREATE POLICY "Public can read living-legacy files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'living-legacy');
