-- Migration 005: Update plans to new pricing and descriptions
-- Applies upsert for Pro plan only

INSERT INTO public.plans (slug, name, monthly_price_cents, included_minutes, per_min_cents, max_contacts_per_campaign, monthly_campaign_limit, max_concurrency, description, created_at, updated_at)
VALUES
('pro', 'Pro', 39900, 1500, 25, 5000, 0, 10,
 'Pro: accès complet à toutes les fonctionnalités et limites élevées', NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_price_cents = EXCLUDED.monthly_price_cents,
  included_minutes = EXCLUDED.included_minutes,
  per_min_cents = EXCLUDED.per_min_cents,
  max_contacts_per_campaign = EXCLUDED.max_contacts_per_campaign,
  monthly_campaign_limit = EXCLUDED.monthly_campaign_limit,
  max_concurrency = EXCLUDED.max_concurrency,
  description = EXCLUDED.description,
  updated_at = NOW();
