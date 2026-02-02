-- Migration: Security Hardening
-- Created: 2026-01-28
-- Description: Additional security hardening for functions and RLS policies

-- ============================================================================
-- SECTION 1: Fix mutable search_path in update_updated_at_column function
-- ============================================================================

-- Drop existing function and recreate with secure search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger for avatar_profiles table (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'avatar_profiles' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_avatar_profiles_updated_at ON public.avatar_profiles;
    CREATE TRIGGER update_avatar_profiles_updated_at
      BEFORE UPDATE ON public.avatar_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at timestamp. Secure search_path set to prevent privilege escalation.';

-- ============================================================================
-- SECTION 2: Fix deduct_credits and add_credits functions with secure search_path
-- ============================================================================

-- Fix deduct_credits function
DROP FUNCTION IF EXISTS public.deduct_credits(uuid, integer, text) CASCADE;

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits with row lock
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if enough credits
  IF current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE public.profiles
  SET credits = credits - p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);

  RETURN TRUE;
END;
$$;

-- Fix add_credits function
DROP FUNCTION IF EXISTS public.add_credits(uuid, integer, text, text, text) CASCADE;

CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_payment_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add credits
  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description, stripe_payment_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_stripe_payment_id);

  RETURN TRUE;
END;
$$;

-- Re-grant execute permissions
GRANT EXECUTE ON FUNCTION public.deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits TO service_role;

-- Add comments
COMMENT ON FUNCTION public.deduct_credits(uuid, integer, text) IS 'Atomically deducts credits from user account. Secure search_path set.';
COMMENT ON FUNCTION public.add_credits(uuid, integer, text, text, text) IS 'Adds credits to user account after payment. Secure search_path set.';

-- ============================================================================
-- SECTION 3: Verify and fix RLS policies for api_usage table
-- The current policy allows users to view their own usage, which is correct.
-- However, we need to ensure there's no unrestricted access.
-- ============================================================================

-- Drop any existing policies that might allow unrestricted access
DROP POLICY IF EXISTS "Anyone can view api usage" ON public.api_usage;
DROP POLICY IF EXISTS "Public can view api usage" ON public.api_usage;
DROP POLICY IF EXISTS "Unrestricted select on api_usage" ON public.api_usage;

-- Ensure the correct policy exists (users can only view their own API usage)
DROP POLICY IF EXISTS "Users can view own API usage" ON public.api_usage;
CREATE POLICY "Users can view own API usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 4: Verify and fix RLS policies for credit_transactions table
-- The current policy allows users to view their own transactions, which is correct.
-- However, we need to ensure there's no unrestricted access.
-- ============================================================================

-- Drop any existing policies that might allow unrestricted access
DROP POLICY IF EXISTS "Anyone can view credit transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Public can view credit transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Unrestricted select on credit_transactions" ON public.credit_transactions;

-- Ensure the correct policy exists (users can only view their own transactions)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 5: Additional security measures
-- ============================================================================

-- Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (prevents bypassing RLS even with owner privileges)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- HaveIBeenPwned password checking must be enabled in Supabase Dashboard:
-- Go to Authentication > Providers > Email > Enable "Check password against HaveIBeenPwned"
-- This cannot be configured via SQL migration.
