-- Migration 005: Update plans to new pricing and descriptions
-- Applies upsert for Free, Starter, Pro plans per spec

INSERT INTO public.plans (slug, name, monthly_price_cents, included_minutes, per_min_cents, max_contacts_per_campaign, monthly_campaign_limit, max_concurrency, description, created_at, updated_at)
VALUES
('free', 'Free — Découverte sécurisée', 0, 0, 35, 100, 5, 1,
 '5 campagnes par mois. 100 contacts maximum par campagne. 1 appel simultané. À 0,35 USD / minute dès la première minute.', NOW(), NOW()),
('starter', 'Starter', 7900, 0, 30, 500, 50, 2,
 '50 campagnes par mois. 500 contacts maximum par campagne. 2 appels simultanés. À 0,30 USD / minute dès la première minute.', NOW(), NOW()),
('pro', 'Pro', 39900, 0, 25, 2000, 200, 10,
 '200 campagnes par mois. 2000 contacts maximum par campagne. 10 appels simultanés. À 0,25 USD / minute dès la première minute.', NOW(), NOW())
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
