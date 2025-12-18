-- Migration: Add separate credit columns for text, voice, and video
-- Created: 2025-12-16
-- Description: Splits credits into text_credits, voice_credits, and video_credits

-- Add new credit columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS text_credits INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS voice_credits INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS video_credits INTEGER DEFAULT 2;

-- Add credit_type column to credit_transactions table
ALTER TABLE credit_transactions
ADD COLUMN IF NOT EXISTS credit_type TEXT DEFAULT 'general' CHECK (credit_type IN ('general', 'text', 'voice', 'video'));

-- Update existing users to have starter credits
UPDATE profiles
SET
  text_credits = 10,
  voice_credits = 5,
  video_credits = 2
WHERE text_credits IS NULL OR voice_credits IS NULL OR video_credits IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_credit_type ON credit_transactions(credit_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_type ON credit_transactions(user_id, credit_type);

-- Comments
COMMENT ON COLUMN profiles.text_credits IS 'Credits for text messages (1 credit per message)';
COMMENT ON COLUMN profiles.voice_credits IS 'Credits for voice calls (2 credits per minute)';
COMMENT ON COLUMN profiles.video_credits IS 'Credits for video calls (5 credits per minute)';
COMMENT ON COLUMN credit_transactions.credit_type IS 'Type of credit: general, text, voice, or video';
