-- ============================================
-- NUCLEAR CLEANUP SCRIPT - Remove EVERYTHING
-- ============================================
-- WARNING: This will delete ALL data and ALL tables!
-- Only run this if you want to start completely fresh.

-- Step 1: Drop ALL tables in public schema with CASCADE
-- This will remove all dependent triggers, policies, and constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', r.tablename;
    END LOOP;
END $$;

-- Step 2: Drop ALL functions in public schema with CASCADE
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc
        INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
        WHERE pg_namespace.nspname = 'public'
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.argtypes || ') CASCADE';
        RAISE NOTICE 'Dropped function: %(%)', r.proname, r.argtypes;
    END LOOP;
END $$;

-- Step 3: Drop ALL storage policies
DROP POLICY IF EXISTS "Public can read user-uploads files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to user-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Clean up storage bucket (optional - comment out if you want to keep uploaded files)
-- Note: This requires superuser privileges or using Supabase dashboard
-- DELETE FROM storage.objects WHERE bucket_id = 'user-uploads';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Cleanup complete! All tables, policies, triggers, and functions have been removed.';
  RAISE NOTICE 'You can now run the fresh schema to recreate everything.';
END $$;
