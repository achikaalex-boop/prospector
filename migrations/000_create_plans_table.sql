-- Migration 000: Create plans table with complete schema
-- This should be run FIRST, before other migrations

CREATE TABLE IF NOT EXISTS public.plans (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  monthly_price_cents BIGINT NOT NULL DEFAULT 0,
  included_minutes BIGINT NOT NULL DEFAULT 0,
  per_min_cents BIGINT NOT NULL DEFAULT 0,
  max_contacts_per_campaign BIGINT NOT NULL DEFAULT 1000,
  monthly_campaign_limit BIGINT NOT NULL DEFAULT 0,
  max_concurrency BIGINT NOT NULL DEFAULT 1,
  description TEXT,
  tagline TEXT,
  objective TEXT,
  minutes_expiry_days BIGINT,
  card_required BOOLEAN DEFAULT false,
  network_priority TEXT DEFAULT 'standard',
  soft_limit_percent BIGINT,
  has_dedicated_number BOOLEAN DEFAULT false,
  has_extra_concurrency BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS plans_slug_idx ON public.plans(slug);
CREATE INDEX IF NOT EXISTS plans_created_at_idx ON public.plans(created_at);

-- Add RLS policy if needed (adjust as per your security requirements)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to plans
CREATE POLICY "Allow public read access to plans" ON public.plans
  FOR SELECT USING (true);
