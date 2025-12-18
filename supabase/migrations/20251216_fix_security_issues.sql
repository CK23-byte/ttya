-- Migration: Fix Security Issues
-- Created: 2025-12-16
-- Description: Fix search_path security issues in functions

-- Issue 1, 2, 3: Fix search_path for update_updated_at function
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Recreate with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
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

-- Recreate triggers for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Fix search_path for end_voice_session function if it exists
DROP FUNCTION IF EXISTS public.end_voice_session(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.end_voice_session(session_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update voice session to ended status
  UPDATE voice_sessions
  SET
    ended_at = NOW(),
    status = 'ended'
  WHERE id = session_id_param;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.update_updated_at() IS 'Automatically updates the updated_at timestamp. Secure search_path set.';
COMMENT ON FUNCTION public.end_voice_session(uuid) IS 'Ends a voice session. Secure search_path set.';
