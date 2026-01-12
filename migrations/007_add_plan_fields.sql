-- Migration 007: Add additional plan metadata fields used by UI

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS objective TEXT,
  ADD COLUMN IF NOT EXISTS minutes_expiry_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS card_required BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS network_priority TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS soft_limit_percent INTEGER DEFAULT 85,
  ADD COLUMN IF NOT EXISTS has_dedicated_number BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_extra_concurrency BOOLEAN DEFAULT false;

-- Ensure updated_at triggers already exist; no further policy changes needed (plans is public readable)

-- Optional: set sane defaults for existing plans
UPDATE public.plans SET
  minutes_expiry_days = COALESCE(minutes_expiry_days, 30),
  card_required = COALESCE(card_required, true),
  network_priority = COALESCE(network_priority, 'standard'),
  soft_limit_percent = COALESCE(soft_limit_percent, 85),
  has_dedicated_number = COALESCE(has_dedicated_number, false),
  has_extra_concurrency = COALESCE(has_extra_concurrency, false)
WHERE TRUE;
