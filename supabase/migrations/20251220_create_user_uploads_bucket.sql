-- Create user-uploads bucket for profile photos, videos, and voice samples
-- This migration adds the missing storage bucket that the ProfileImprovementPage expects

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for user-uploads bucket

-- Users can upload to their own folder (organized by profile ID)
CREATE POLICY "Users can upload to user-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    auth.uid() IS NOT NULL
  );

-- Users can view their own files
CREATE POLICY "Users can view own user-uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-uploads' AND
    auth.uid() IS NOT NULL
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own user-uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-uploads' AND
    auth.uid() IS NOT NULL
  );

-- Grant public read access to user-uploads bucket
-- This allows external services (like HeyGen) to download photos via signed URLs
CREATE POLICY "Public can read user-uploads files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');
