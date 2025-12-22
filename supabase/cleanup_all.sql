-- ============================================
-- CLEANUP SCRIPT - Remove ALL existing tables and policies
-- ============================================
-- WARNING: This will delete ALL data!
-- Only run this if you want to start completely fresh.

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profiles" ON public.personality_profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.personality_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.personality_profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON public.personality_profiles;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Service role can insert transactions" ON public.credit_transactions;

DROP POLICY IF EXISTS "Users can view own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Service role can insert API usage" ON public.api_usage;

DROP POLICY IF EXISTS "Public can read user-uploads files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to user-uploads" ON storage.objects;

-- Drop all triggers
DROP TRIGGER IF EXISTS personality_profiles_updated_at ON public.personality_profiles;
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS deduct_credits(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS add_credits(UUID, INTEGER, TEXT, TEXT, TEXT);

-- Drop all tables (CASCADE removes dependent objects)
DROP TABLE IF EXISTS public.personality_profiles CASCADE;
DROP TABLE IF EXISTS public.api_usage CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Clean up storage bucket (optional - comment out if you want to keep uploaded files)
-- Note: This requires superuser privileges or using Supabase dashboard
-- DELETE FROM storage.objects WHERE bucket_id = 'user-uploads';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Cleanup complete! All tables, policies, triggers, and functions have been removed.';
  RAISE NOTICE 'You can now run the fresh schema to recreate everything.';
END $$;
