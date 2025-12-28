-- Add face_id column and processing status to simli_avatars
-- Migration for custom face upload and status tracking

-- ============================================================================
-- 1. Add face_id column
-- ============================================================================
ALTER TABLE public.simli_avatars
ADD COLUMN IF NOT EXISTS face_id TEXT;

COMMENT ON COLUMN public.simli_avatars.face_id IS 'Simli-generated face ID for custom avatar';

-- Create index for face_id lookups
CREATE INDEX IF NOT EXISTS idx_simli_avatars_face_id ON public.simli_avatars(face_id);

-- ============================================================================
-- 2. Update status constraint to include 'processing'
-- ============================================================================

-- Drop existing constraint
ALTER TABLE public.simli_avatars
DROP CONSTRAINT IF EXISTS simli_avatars_status_check;

-- Add new constraint with 'processing' status
ALTER TABLE public.simli_avatars
ADD CONSTRAINT simli_avatars_status_check
CHECK (status IN ('processing', 'ready', 'failed'));

-- ============================================================================
-- 3. Add processing metadata column
-- ============================================================================
ALTER TABLE public.simli_avatars
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;

ALTER TABLE public.simli_avatars
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ;

ALTER TABLE public.simli_avatars
ADD COLUMN IF NOT EXISTS error_message TEXT;

COMMENT ON COLUMN public.simli_avatars.processing_started_at IS 'When face processing was initiated';
COMMENT ON COLUMN public.simli_avatars.processing_completed_at IS 'When face processing finished (success or failure)';
COMMENT ON COLUMN public.simli_avatars.error_message IS 'Error details if face processing failed';

-- ============================================================================
-- 4. Add index for processing status queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_simli_avatars_status ON public.simli_avatars(status);
CREATE INDEX IF NOT EXISTS idx_simli_avatars_processing ON public.simli_avatars(status, processing_started_at)
  WHERE status = 'processing';
