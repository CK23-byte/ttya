-- ============================================
-- CLEANUP SCRIPT - Verwijder alle RLS policies
-- Voer dit uit VOOR je de setup script draait
-- ============================================

-- Verwijder alle RLS policies dynamisch
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop alle policies op profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;

    -- Drop alle policies op credit_transactions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'credit_transactions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON credit_transactions', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Schakel RLS uit (voor schone lei)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;

-- Verifieer: Moet LEEG zijn
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('profiles', 'credit_transactions');
