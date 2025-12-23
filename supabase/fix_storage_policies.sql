-- ============================================
-- FIX STORAGE POLICIES FOR user-uploads BUCKET
-- ============================================
-- This script fixes RLS policies for photo uploads

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read user-uploads files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to user-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

-- Public read access for ALL files in user-uploads bucket
CREATE POLICY "Public can read user-uploads files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');

-- Authenticated users can upload to user-uploads bucket
-- Allow uploads to any path for authenticated users
CREATE POLICY "Authenticated users can upload to user-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-uploads'
    AND auth.role() = 'authenticated'
  );

-- Users can update files in user-uploads
CREATE POLICY "Users can update their uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-uploads'
    AND auth.role() = 'authenticated'
  );

-- Users can delete files in user-uploads
CREATE POLICY "Users can delete their uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-uploads'
    AND auth.role() = 'authenticated'
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies fixed successfully!';
  RAISE NOTICE 'All authenticated users can now upload, update, and delete files in user-uploads bucket.';
  RAISE NOTICE 'Public read access is enabled for all files.';
END $$;
