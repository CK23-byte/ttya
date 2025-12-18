-- ============================================
-- FRESH SETUP SCRIPT - Maak alle RLS policies aan
-- Voer dit uit NA de cleanup script
-- ============================================

-- Schakel RLS IN
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
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
-- CREDIT_TRANSACTIONS POLICIES
-- ============================================

-- Allow users to read their own transactions
CREATE POLICY "Users can read own transactions"
ON credit_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert transactions
CREATE POLICY "Users can insert own transactions"
ON credit_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATIE - Check dat alles werkt
-- ============================================

-- Check RLS is enabled (moet TRUE zijn voor beide tables)
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename IN ('profiles', 'credit_transactions')
  AND schemaname = 'public'
ORDER BY tablename;

-- Check policies (moet EXACT 5 policies tonen)
SELECT
  tablename as "Table",
  policyname as "Policy",
  cmd as "Command"
FROM pg_policies
WHERE tablename IN ('profiles', 'credit_transactions')
ORDER BY tablename, policyname;
