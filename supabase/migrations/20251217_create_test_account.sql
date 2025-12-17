-- Create Test Account with Unlimited Credits
-- Email: caskaptein@gmail.com
-- Password: 3Gab4L9pt2q!

-- This account has unlimited credits for development/testing purposes
-- Credits are set to 999999 (effectively unlimited)

-- Note: Password must be set via Supabase Auth, this migration only creates the profile

-- Step 1: Create the profile (user must sign up first via UI or Auth Admin)
-- After user signs up, run this to give unlimited credits:

DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get user ID for test account
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'caskaptein@gmail.com';

  -- If user exists, update their credits
  IF test_user_id IS NOT NULL THEN
    -- Update profile with unlimited credits
    UPDATE profiles
    SET
      credits = 999999,
      text_credits = 999999,
      voice_credits = 999999,
      video_credits = 999999,
      display_name = 'Test Account (Unlimited)'
    WHERE id = test_user_id;

    -- Log transaction for unlimited credits
    INSERT INTO credit_transactions (
      user_id,
      amount,
      type,
      credit_type,
      description
    ) VALUES
      (test_user_id, 999999, 'bonus', 'general', 'Test account - unlimited general credits'),
      (test_user_id, 999999, 'bonus', 'text', 'Test account - unlimited text credits'),
      (test_user_id, 999999, 'bonus', 'voice', 'Test account - unlimited voice credits'),
      (test_user_id, 999999, 'bonus', 'video', 'Test account - unlimited video credits');

    RAISE NOTICE 'Test account credits updated to unlimited for user: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test account not found. User must sign up first with email: caskaptein@gmail.com';
  END IF;
END $$;

-- Create a function to automatically refill test account credits
CREATE OR REPLACE FUNCTION refill_test_account_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get test user ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'caskaptein@gmail.com';

  IF test_user_id IS NOT NULL THEN
    -- Reset all credits to unlimited
    UPDATE profiles
    SET
      credits = 999999,
      text_credits = 999999,
      voice_credits = 999999,
      video_credits = 999999
    WHERE id = test_user_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION refill_test_account_credits() IS 'Refills test account credits to unlimited (999999). Can be called manually or via cron.';

-- To manually refill test account credits, run:
-- SELECT refill_test_account_credits();
