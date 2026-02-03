-- Migration 006: Fix and ensure plans data is correctly populated
-- This ensures all plans have the correct max_contacts_per_campaign values

UPDATE public.plans SET
  max_contacts_per_campaign = CASE 
    WHEN slug = 'pro' THEN 5000
    ELSE max_contacts_per_campaign
  END,
  monthly_campaign_limit = CASE 
    WHEN slug = 'pro' THEN 0
    ELSE monthly_campaign_limit
  END,
  max_concurrency = CASE 
    WHEN slug = 'pro' THEN 10
    ELSE max_concurrency
  END,
  updated_at = NOW()
WHERE slug IN ('pro');

-- Verify the update
SELECT slug, max_contacts_per_campaign, monthly_campaign_limit, max_concurrency FROM public.plans WHERE slug IN ('pro');
