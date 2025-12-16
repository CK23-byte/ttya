-- Migration: Add avatar_url to profiles
-- Created: 2025-12-16
-- Description: Add avatar_url column for profile pictures

-- Add avatar_url column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile avatar/picture stored in Supabase Storage';

-- Create storage bucket for avatars if it doesn't exist
-- Note: This needs to be done manually in Supabase Storage dashboard or via SQL
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for avatar bucket
-- Note: These policies allow users to upload and read their own avatars
-- CREATE POLICY "Users can upload their own avatar"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view avatars"
--   ON storage.objects FOR SELECT
--   TO public
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can update their own avatar"
--   ON storage.objects FOR UPDATE
--   TO authenticated
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own avatar"
--   ON storage.objects FOR DELETE
--   TO authenticated
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
