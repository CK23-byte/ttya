-- ============================================
-- Supabase RLS Setup Script for TalkToYouAI
-- Run this ENTIRE script in your Supabase SQL Editor
-- ============================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on credit_transactions table
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop ALL existing policies (to start fresh)
-- ============================================

DO $$
BEGIN
    -- Drop profiles policies
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Service role full access" ON profiles;

    -- Drop credit_transactions policies
    DROP POLICY IF EXISTS "Users can read own transactions" ON credit_transactions;
    DROP POLICY IF EXISTS "Service role can insert transactions" ON credit_transactions;
    DROP POLICY IF EXISTS "service role full access" ON credit_transactions;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies did not exist, continuing...';
END $$;

-- ============================================
-- Create RLS Policies for PROFILES table
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- Create RLS Policies for CREDIT_TRANSACTIONS table
-- ============================================

-- Allow users to read their own transactions
CREATE POLICY "Users can read own transactions"
ON credit_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert transactions (server will handle via triggers/functions)
CREATE POLICY "Users can insert own transactions"
ON credit_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Verify setup - Run this to check results
-- ============================================

-- Check if RLS is enabled
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename IN ('profiles', 'credit_transactions')
  AND schemaname = 'public'
ORDER BY tablename;

-- Check all policies
SELECT
  tablename as "Table",
  policyname as "Policy Name",
  cmd as "Command",
  roles as "Roles"
FROM pg_policies
WHERE tablename IN ('profiles', 'credit_transactions')
ORDER BY tablename, policyname;
