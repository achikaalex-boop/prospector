-- Migration 006: Fix and ensure plans data is correctly populated
-- This ensures all plans have the correct max_contacts_per_campaign values

UPDATE public.plans SET
  max_contacts_per_campaign = CASE 
    WHEN slug = 'free' THEN 100
    WHEN slug = 'starter' THEN 500
    WHEN slug = 'pro' THEN 2000
    ELSE max_contacts_per_campaign
  END,
  monthly_campaign_limit = CASE 
    WHEN slug = 'free' THEN 5
    WHEN slug = 'starter' THEN 50
    WHEN slug = 'pro' THEN 200
    ELSE monthly_campaign_limit
  END,
  max_concurrency = CASE 
    WHEN slug = 'free' THEN 1
    WHEN slug = 'starter' THEN 2
    WHEN slug = 'pro' THEN 10
    ELSE max_concurrency
  END,
  updated_at = NOW()
WHERE slug IN ('free', 'starter', 'pro');

-- Verify the update
SELECT slug, max_contacts_per_campaign, monthly_campaign_limit, max_concurrency FROM public.plans WHERE slug IN ('free', 'starter', 'pro');
