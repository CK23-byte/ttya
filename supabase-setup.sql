-- Supabase Setup Script for TalkToYouAI
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Enable Row Level Security (RLS) on profiles table
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Drop existing policies if they exist
-- ============================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- ============================================
-- 3. Create RLS Policies for profiles table
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. Enable RLS on credit_transactions table
-- ============================================

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Drop existing policies if they exist
-- ============================================

DROP POLICY IF EXISTS "Users can read own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Service role can insert transactions" ON credit_transactions;

-- ============================================
-- 6. Create RLS Policies for credit_transactions table
-- ============================================

-- Allow users to read their own transactions
CREATE POLICY "Users can read own transactions"
ON credit_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Allow service role to insert transactions (via API)
CREATE POLICY "Service role can insert transactions"
ON credit_transactions FOR INSERT
WITH CHECK (true);  -- Service role bypasses RLS anyway

-- ============================================
-- 7. Verify setup
-- ============================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'credit_transactions');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'credit_transactions');
