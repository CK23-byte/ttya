# Test Account Setup Guide

## Overview

This guide explains how to set up and use the test account with unlimited credits for development and testing.

---

## Test Account Details

**Email**: `caskaptein@gmail.com`
**Password**: `3Gab4L9pt2q!`
**Credits**: Unlimited (999,999 of each type)

---

## Setup Steps

### Step 1: Create the Account via UI

1. Go to https://talktoyouai.com/email-auth
2. Click **"Sign Up"** / **"Registreren"**
3. Fill in:
   - Email: `caskaptein@gmail.com`
   - Password: `3Gab4L9pt2q!`
   - Name (optional): `Test Account`
4. Click **"Create Account"**
5. Check email inbox for confirmation link
6. Click confirmation link

**Result**: Account is created with standard signup bonus credits

---

### Step 2: Grant Unlimited Credits via Supabase

1. Go to **Supabase Dashboard** → ttya project → **SQL Editor**
2. Run the migration:
   - Either run: `supabase/migrations/20251217_create_test_account.sql`
   - Or copy-paste this SQL:

```sql
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

    RAISE NOTICE 'Test account credits updated to unlimited';
  ELSE
    RAISE NOTICE 'Test account not found. User must sign up first.';
  END IF;
END $$;
```

3. Click **"Run"**
4. You should see: "Test account credits updated to unlimited"

---

### Step 3: Verify Unlimited Access

1. Log in with test account credentials
2. Go to **Account Settings**
3. Check credits display:
   - Text Credits: 999,999
   - Voice Credits: 999,999
   - Video Credits: 999,999
4. Credits will **NOT** be deducted when using features

---

## How Unlimited Credits Work

### Code Implementation

The test account is recognized by email address in `src/utils/testAccount.ts`:

```typescript
const TEST_ACCOUNT_EMAILS = [
  'caskaptein@gmail.com',
]

export function isTestAccount(email: string): boolean {
  return TEST_ACCOUNT_EMAILS.includes(email.toLowerCase())
}
```

### Features with Unlimited Access

For test accounts:
- ✅ **Credits never decrease** when using features
- ✅ **All features unlocked** (text, voice, video)
- ✅ **No payment required**
- ✅ **Credit checks bypassed** in code

### Usage in Code

Example usage to check if action is allowed:

```typescript
import { canAffordAction } from '@/utils/testAccount'

// Check if user can afford action
const canProceed = canAffordAction(user.email, currentCredits, requiredCredits)

// Test account: Always returns true
// Regular account: Returns currentCredits >= requiredCredits
```

---

## Refilling Credits (If Needed)

If credits somehow get depleted (shouldn't happen for test account), you can refill them:

### Via SQL Function

```sql
SELECT refill_test_account_credits();
```

### Via Direct Update

```sql
UPDATE profiles
SET
  credits = 999999,
  text_credits = 999999,
  voice_credits = 999999,
  video_credits = 999999
WHERE id = (SELECT id FROM auth.users WHERE email = 'caskaptein@gmail.com');
```

---

## Adding More Test Accounts

To add additional test accounts:

1. **Update the list** in `src/utils/testAccount.ts`:

```typescript
const TEST_ACCOUNT_EMAILS = [
  'caskaptein@gmail.com',
  'another-test@example.com', // Add here
]
```

2. **Create the account** via UI (Step 1)

3. **Grant unlimited credits** via SQL (Step 2)

---

## Security Notes

⚠️ **Important Security Considerations**:

1. **Production Safety**:
   - Test account email is hardcoded in client-side code
   - Anyone can see this email in the source code
   - Ensure password is strong and unique
   - Consider removing test account before production launch

2. **Recommended for Production**:
   - Move test account list to environment variables
   - Use backend API to check test account status
   - Or remove test accounts entirely for production

3. **Current Implementation**:
   - ✅ Safe for development
   - ✅ Safe for staging
   - ⚠️ Should be reviewed before production

---

## Local Auth Removed

**Important**: Local password authentication (master password) has been completely removed.

**Why**: Not compatible with credit system and cloud features.

**Login Methods Now**:
- ✅ Email + Password (Supabase Auth)
- ✅ Google OAuth
- ✅ Apple OAuth (if configured)

**Old routes removed**:
- ❌ `/setup` (local password setup)
- ❌ `/login` (local password login)
- ✅ `/auth` redirects to `/email-auth`

---

## Testing Checklist

After setting up test account, verify:

- [ ] Can log in with test credentials
- [ ] Credits show 999,999 for all types
- [ ] Can send text messages without losing credits
- [ ] Can make voice calls without losing credits
- [ ] Can use video features without losing credits
- [ ] Can create/edit personality profiles
- [ ] Can access all premium features
- [ ] Account page shows correct credit balances

---

## Troubleshooting

### Issue: Can't find test account in database

**Solution**:
```sql
-- Check if user exists
SELECT id, email, created_at
FROM auth.users
WHERE email = 'caskaptein@gmail.com';

-- Check if profile exists
SELECT *
FROM profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'caskaptein@gmail.com');
```

### Issue: Credits are being deducted

**Causes**:
1. Email check is case-sensitive → Use `.toLowerCase()`
2. `isTestAccount()` not called in code
3. Credit deduction happens server-side without test account check

**Solution**: Ensure all credit deduction code calls `shouldDeductCredits()`:

```typescript
import { shouldDeductCredits } from '@/utils/testAccount'

if (shouldDeductCredits(user.email)) {
  // Deduct credits for regular users only
  await deductCredits(userId, amount)
}
```

### Issue: Login fails

**Possible causes**:
1. Account not created via UI yet
2. Email not confirmed
3. Wrong password

**Solution**: Follow Step 1 again to create account

---

## Future Improvements

Consider implementing:

1. **Admin Panel**: Toggle test mode for any user
2. **Environment-based**: Test accounts only work in dev/staging
3. **Backend Check**: Move test account list to backend
4. **Temporary Access**: Test mode expires after 7 days
5. **Audit Logging**: Track test account usage

---

**Last Updated**: December 2025
**Status**: ✅ Ready for use
