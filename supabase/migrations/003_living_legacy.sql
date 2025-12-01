-- Living Legacy Profile Creation System
-- This migration creates the complete database schema for the Living Legacy feature

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- LIVING LEGACY PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.living_legacy_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  profile_photo_url TEXT,
  current_location VARCHAR(255),
  occupation VARCHAR(255),

  -- Status & Progress
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'activated')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

  -- Tier & Features
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('essential', 'complete', 'premium')),
  has_voice_clone BOOLEAN DEFAULT false,
  has_video_avatar BOOLEAN DEFAULT false,

  -- AI Configuration
  system_prompt TEXT,
  personality_traits JSONB DEFAULT '[]',
  communication_style JSONB DEFAULT '{}',

  -- Access Control
  notary_link_token VARCHAR(255) UNIQUE,
  activation_code VARCHAR(50),
  is_activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  activated_by UUID REFERENCES auth.users(id),

  -- Onboarding Data
  onboarding_data JSONB DEFAULT '{}', -- Stores questionnaire responses

  -- Primary Recipient
  primary_recipient_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Index for faster queries
CREATE INDEX idx_living_legacy_creator ON public.living_legacy_profiles(creator_id);
CREATE INDEX idx_living_legacy_status ON public.living_legacy_profiles(status);
CREATE INDEX idx_living_legacy_token ON public.living_legacy_profiles(notary_link_token);
CREATE INDEX idx_living_legacy_activated ON public.living_legacy_profiles(is_activated);

-- ============================================================================
-- LEGACY RECIPIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legacy_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.living_legacy_profiles(id) ON DELETE CASCADE,

  -- Recipient Information
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100), -- spouse, daughter, son, friend, sibling, parent, etc.
  age INTEGER,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Access Control
  access_token VARCHAR(255) UNIQUE,
  has_accessed BOOLEAN DEFAULT false,
  first_access_at TIMESTAMPTZ,
  last_access_at TIMESTAMPTZ,

  -- Permissions
  can_view_all_messages BOOLEAN DEFAULT true,
  can_chat BOOLEAN DEFAULT true,
  can_voice_call BOOLEAN DEFAULT true,
  can_video_call BOOLEAN DEFAULT false,

  -- Notification Preferences
  notify_on_activation BOOLEAN DEFAULT true,
  notify_on_time_capsule BOOLEAN DEFAULT true,

  -- Status
  is_primary BOOLEAN DEFAULT false,
  invitation_sent BOOLEAN DEFAULT false,
  invitation_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_legacy_recipients_profile ON public.legacy_recipients(profile_id);
CREATE INDEX idx_legacy_recipients_token ON public.legacy_recipients(access_token);
CREATE INDEX idx_legacy_recipients_email ON public.legacy_recipients(email);

-- ============================================================================
-- LEGACY MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legacy_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.living_legacy_profiles(id) ON DELETE CASCADE,

  -- Message Details
  category VARCHAR(100), -- life_story, wisdom, specific_person, time_capsule, daily_moment, advice, memory
  subcategory VARCHAR(100), -- career, childhood, family, parenting, relationships, etc.
  title VARCHAR(255) NOT NULL,
  content TEXT, -- Text content or transcript

  -- Media URLs
  video_url TEXT,
  audio_url TEXT,
  thumbnail_url TEXT,

  -- Processing Status
  transcript TEXT,
  is_transcribed BOOLEAN DEFAULT false,
  transcription_status VARCHAR(50), -- pending, processing, completed, failed

  -- Targeting
  recipient_ids UUID[], -- Array of recipient UUIDs, NULL means for all recipients
  is_for_all_recipients BOOLEAN DEFAULT true,

  -- Time Capsule Settings
  is_time_capsule BOOLEAN DEFAULT false,
  unlock_condition VARCHAR(255), -- "18th_birthday", "wedding", "graduation", "first_child", "specific_date", "when_needed"
  unlock_date DATE,
  unlock_age INTEGER, -- Age at which to unlock
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,

  -- Recording Details
  duration_seconds INTEGER,
  recorded_at TIMESTAMPTZ,
  recording_format VARCHAR(50), -- video, audio, text

  -- Status
  is_complete BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT true,

  -- Order
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_legacy_messages_profile ON public.legacy_messages(profile_id);
CREATE INDEX idx_legacy_messages_category ON public.legacy_messages(category);
CREATE INDEX idx_legacy_messages_time_capsule ON public.legacy_messages(is_time_capsule);
CREATE INDEX idx_legacy_messages_recipients ON public.legacy_messages USING GIN(recipient_ids);

-- ============================================================================
-- LEGACY EXECUTOR INFO TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legacy_executor_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.living_legacy_profiles(id) ON DELETE CASCADE,

  -- Executor Details
  executor_name VARCHAR(255) NOT NULL,
  executor_email VARCHAR(255),
  executor_phone VARCHAR(50),
  relationship VARCHAR(100),
  is_backup_executor BOOLEAN DEFAULT false,

  -- Notary Details (Optional)
  has_notary BOOLEAN DEFAULT false,
  notary_name VARCHAR(255),
  notary_firm VARCHAR(255),
  notary_email VARCHAR(255),
  notary_phone VARCHAR(50),

  -- Activation Instructions
  special_instructions TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),

  -- Status
  instructions_sent BOOLEAN DEFAULT false,
  instructions_sent_at TIMESTAMPTZ,
  executor_confirmed BOOLEAN DEFAULT false,
  executor_confirmed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_legacy_executor_profile ON public.legacy_executor_info(profile_id);
CREATE UNIQUE INDEX idx_legacy_executor_primary ON public.legacy_executor_info(profile_id) WHERE is_backup_executor = false;

-- ============================================================================
-- LEGACY DEATH VERIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legacy_death_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.living_legacy_profiles(id) ON DELETE CASCADE,

  -- Submitter Information
  submitted_by_name VARCHAR(255) NOT NULL,
  submitted_by_email VARCHAR(255) NOT NULL,
  submitted_by_phone VARCHAR(50),
  submitted_by_relationship VARCHAR(100),
  is_legal_executor BOOLEAN DEFAULT false,

  -- Documentation URLs (stored in S3)
  death_certificate_url TEXT,
  executor_proof_url TEXT, -- Will, court document, or legal letter
  government_id_url TEXT,
  additional_documents JSONB DEFAULT '[]', -- Array of {url, type, filename}

  -- Verification Details
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'approved', 'rejected', 'more_info_needed')),
  verified_by UUID REFERENCES auth.users(id), -- Admin who verified
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,

  -- Reference Number
  reference_number VARCHAR(50) UNIQUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_death_verifications_profile ON public.legacy_death_verifications(profile_id);
CREATE INDEX idx_death_verifications_status ON public.legacy_death_verifications(verification_status);
CREATE INDEX idx_death_verifications_ref ON public.legacy_death_verifications(reference_number);

-- ============================================================================
-- LEGACY CONTENT UPLOADS TABLE (for tracking upload progress)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legacy_content_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.living_legacy_profiles(id) ON DELETE CASCADE,

  -- Upload Type
  upload_type VARCHAR(50) NOT NULL CHECK (upload_type IN ('whatsapp', 'photos', 'videos', 'audio', 'voice_sample', 'avatar_photo', 'documents')),

  -- File Details
  file_name VARCHAR(255),
  file_size_bytes BIGINT,
  file_url TEXT,

  -- Processing
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_uploads_profile ON public.legacy_content_uploads(profile_id);
CREATE INDEX idx_content_uploads_type ON public.legacy_content_uploads(upload_type);
CREATE INDEX idx_content_uploads_status ON public.legacy_content_uploads(processing_status);

-- ============================================================================
-- LEGACY VOICE CLONES TABLE (ElevenLabs integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legacy_voice_clones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.living_legacy_profiles(id) ON DELETE CASCADE,

  -- ElevenLabs Integration
  elevenlabs_voice_id VARCHAR(255) UNIQUE,
  voice_name VARCHAR(255),

  -- Training Data
  total_audio_duration_seconds INTEGER DEFAULT 0,
  audio_sample_urls JSONB DEFAULT '[]', -- Array of S3 URLs

  -- Quality Metrics
  quality_score NUMERIC(3,2), -- 0.00 to 1.00
  has_emotional_range BOOLEAN DEFAULT false,
  clarity_score NUMERIC(3,2),

  -- Status
  clone_status VARCHAR(50) DEFAULT 'not_started' CHECK (clone_status IN ('not_started', 'collecting_samples', 'processing', 'completed', 'failed')),
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_voice_clones_profile ON public.legacy_voice_clones(profile_id);
CREATE INDEX idx_voice_clones_status ON public.legacy_voice_clones(clone_status);
CREATE UNIQUE INDEX idx_voice_clones_elevenlabs ON public.legacy_voice_clones(elevenlabs_voice_id);

-- ============================================================================
-- LEGACY VIDEO AVATARS TABLE (D-ID integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legacy_video_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.living_legacy_profiles(id) ON DELETE CASCADE,

  -- D-ID Integration
  did_presenter_id VARCHAR(255),
  avatar_name VARCHAR(255),

  -- Photo Collection
  photo_urls JSONB DEFAULT '[]', -- Array of S3 URLs
  total_photos_uploaded INTEGER DEFAULT 0,
  primary_photo_url TEXT, -- Main photo used for avatar

  -- Video Recording (Premium only)
  training_video_url TEXT,
  training_video_duration INTEGER,

  -- Status
  avatar_status VARCHAR(50) DEFAULT 'not_started' CHECK (avatar_status IN ('not_started', 'collecting_photos', 'processing', 'completed', 'failed')),
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Avatar Type
  avatar_type VARCHAR(50) DEFAULT 'standard' CHECK (avatar_type IN ('standard', 'hd', 'ultra_hd')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_video_avatars_profile ON public.legacy_video_avatars(profile_id);
CREATE INDEX idx_video_avatars_status ON public.legacy_video_avatars(avatar_status);

-- ============================================================================
-- LEGACY PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legacy_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.living_legacy_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Payment Details
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('essential', 'complete', 'premium')),
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Payment Method
  payment_method VARCHAR(50), -- one_time, payment_plan
  is_payment_plan BOOLEAN DEFAULT false,
  payment_plan_months INTEGER,

  -- Stripe Integration
  stripe_payment_intent_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255), -- For payment plans

  -- Status
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded')),
  paid_at TIMESTAMPTZ,

  -- Refund
  refund_amount_cents INTEGER,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_legacy_payments_profile ON public.legacy_payments(profile_id);
CREATE INDEX idx_legacy_payments_user ON public.legacy_payments(user_id);
CREATE INDEX idx_legacy_payments_status ON public.legacy_payments(payment_status);
CREATE INDEX idx_legacy_payments_stripe ON public.legacy_payments(stripe_payment_intent_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.living_legacy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_executor_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_death_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_content_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_voice_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_video_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_payments ENABLE ROW LEVEL SECURITY;

-- Living Legacy Profiles: Creators can see their own profiles
CREATE POLICY "Users can view own legacy profiles"
  ON public.living_legacy_profiles FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create own legacy profiles"
  ON public.living_legacy_profiles FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own legacy profiles"
  ON public.living_legacy_profiles FOR UPDATE
  USING (auth.uid() = creator_id);

-- Recipients: Profile creators can manage recipients
CREATE POLICY "Creators can view recipients"
  ON public.legacy_recipients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_recipients.profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can create recipients"
  ON public.legacy_recipients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can update recipients"
  ON public.legacy_recipients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_recipients.profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can delete recipients"
  ON public.legacy_recipients FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_recipients.profile_id AND creator_id = auth.uid()
  ));

-- Messages: Profile creators can manage messages
CREATE POLICY "Creators can view messages"
  ON public.legacy_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_messages.profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can create messages"
  ON public.legacy_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can update messages"
  ON public.legacy_messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_messages.profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can delete messages"
  ON public.legacy_messages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_messages.profile_id AND creator_id = auth.uid()
  ));

-- Similar policies for other tables...
CREATE POLICY "Creators can view executor info"
  ON public.legacy_executor_info FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_executor_info.profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can view content uploads"
  ON public.legacy_content_uploads FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_content_uploads.profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can view voice clones"
  ON public.legacy_voice_clones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_voice_clones.profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can view video avatars"
  ON public.legacy_video_avatars FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.living_legacy_profiles
    WHERE id = legacy_video_avatars.profile_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Users can view own payments"
  ON public.legacy_payments FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_completion INTEGER := 0;
  v_basic_info_complete BOOLEAN;
  v_has_messages BOOLEAN;
  v_has_recipients BOOLEAN;
  v_has_executor BOOLEAN;
  v_voice_required BOOLEAN;
  v_voice_complete BOOLEAN;
  v_avatar_required BOOLEAN;
  v_avatar_complete BOOLEAN;
BEGIN
  -- Check basic info (20 points)
  SELECT
    full_name IS NOT NULL AND
    date_of_birth IS NOT NULL AND
    profile_photo_url IS NOT NULL
  INTO v_basic_info_complete
  FROM public.living_legacy_profiles
  WHERE id = p_profile_id;

  IF v_basic_info_complete THEN
    v_completion := v_completion + 20;
  END IF;

  -- Check messages (30 points - needs at least 5 messages)
  SELECT COUNT(*) >= 5
  INTO v_has_messages
  FROM public.legacy_messages
  WHERE profile_id = p_profile_id AND is_complete = true;

  IF v_has_messages THEN
    v_completion := v_completion + 30;
  END IF;

  -- Check recipients (20 points - needs at least 1)
  SELECT COUNT(*) >= 1
  INTO v_has_recipients
  FROM public.legacy_recipients
  WHERE profile_id = p_profile_id;

  IF v_has_recipients THEN
    v_completion := v_completion + 20;
  END IF;

  -- Check executor (15 points)
  SELECT COUNT(*) >= 1
  INTO v_has_executor
  FROM public.legacy_executor_info
  WHERE profile_id = p_profile_id;

  IF v_has_executor THEN
    v_completion := v_completion + 15;
  END IF;

  -- Check voice clone if required (7.5 points)
  SELECT has_voice_clone INTO v_voice_required
  FROM public.living_legacy_profiles
  WHERE id = p_profile_id;

  IF v_voice_required THEN
    SELECT clone_status = 'completed'
    INTO v_voice_complete
    FROM public.legacy_voice_clones
    WHERE profile_id = p_profile_id;

    IF v_voice_complete THEN
      v_completion := v_completion + 8;
    END IF;
  ELSE
    v_completion := v_completion + 8;
  END IF;

  -- Check video avatar if required (7.5 points)
  SELECT has_video_avatar INTO v_avatar_required
  FROM public.living_legacy_profiles
  WHERE id = p_profile_id;

  IF v_avatar_required THEN
    SELECT avatar_status = 'completed'
    INTO v_avatar_complete
    FROM public.legacy_video_avatars
    WHERE profile_id = p_profile_id;

    IF v_avatar_complete THEN
      v_completion := v_completion + 7;
    END IF;
  ELSE
    v_completion := v_completion + 7;
  END IF;

  RETURN v_completion;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique notary link token
CREATE OR REPLACE FUNCTION generate_notary_link_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NL-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 32);
END;
$$ LANGUAGE plpgsql;

-- Function to generate activation reference number
CREATE OR REPLACE FUNCTION generate_activation_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'LLA-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completion percentage (trigger)
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_id UUID;
  v_new_completion INTEGER;
BEGIN
  -- Determine profile_id based on the table
  IF TG_TABLE_NAME = 'living_legacy_profiles' THEN
    v_profile_id := NEW.id;
  ELSE
    v_profile_id := NEW.profile_id;
  END IF;

  -- Calculate new completion percentage
  v_new_completion := calculate_profile_completion(v_profile_id);

  -- Update the profile
  UPDATE public.living_legacy_profiles
  SET
    completion_percentage = v_new_completion,
    updated_at = NOW(),
    status = CASE
      WHEN v_new_completion >= 100 THEN 'completed'
      WHEN v_new_completion > 0 THEN 'in_progress'
      ELSE 'draft'
    END
  WHERE id = v_profile_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update completion
CREATE TRIGGER trigger_update_completion_on_profile
AFTER INSERT OR UPDATE ON public.living_legacy_profiles
FOR EACH ROW
EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER trigger_update_completion_on_messages
AFTER INSERT OR UPDATE OR DELETE ON public.legacy_messages
FOR EACH ROW
EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER trigger_update_completion_on_recipients
AFTER INSERT OR UPDATE OR DELETE ON public.legacy_recipients
FOR EACH ROW
EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER trigger_update_completion_on_executor
AFTER INSERT OR UPDATE OR DELETE ON public.legacy_executor_info
FOR EACH ROW
EXECUTE FUNCTION update_profile_completion();

-- Trigger to set updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER set_updated_at_legacy_profiles
BEFORE UPDATE ON public.living_legacy_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_recipients
BEFORE UPDATE ON public.legacy_recipients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_messages
BEFORE UPDATE ON public.legacy_messages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_executor
BEFORE UPDATE ON public.legacy_executor_info
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_verifications
BEFORE UPDATE ON public.legacy_death_verifications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_uploads
BEFORE UPDATE ON public.legacy_content_uploads
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_voice
BEFORE UPDATE ON public.legacy_voice_clones
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_avatars
BEFORE UPDATE ON public.legacy_video_avatars
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_payments
BEFORE UPDATE ON public.legacy_payments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.living_legacy_profiles IS 'Stores Living Legacy profiles created by users for posthumous access';
COMMENT ON TABLE public.legacy_recipients IS 'Family members and friends who will receive access after activation';
COMMENT ON TABLE public.legacy_messages IS 'Recorded messages, life stories, and time capsules';
COMMENT ON TABLE public.legacy_executor_info IS 'Executor and notary information for legacy activation';
COMMENT ON TABLE public.legacy_death_verifications IS 'Death verification requests and documentation';
COMMENT ON TABLE public.legacy_content_uploads IS 'Tracks uploaded content and processing status';
COMMENT ON TABLE public.legacy_voice_clones IS 'ElevenLabs voice cloning data and status';
COMMENT ON TABLE public.legacy_video_avatars IS 'D-ID video avatar creation data and status';
COMMENT ON TABLE public.legacy_payments IS 'Payment records for Living Legacy tiers';
