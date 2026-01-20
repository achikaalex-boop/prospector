-- Migration 005: Update plans to new pricing and descriptions
-- Applies upsert for Free, Starter, Pro plans per spec

INSERT INTO public.plans (slug, name, monthly_price_cents, included_minutes, per_min_cents, max_contacts_per_campaign, monthly_campaign_limit, max_concurrency, description, created_at, updated_at)
VALUES
('free', 'Free — Découverte sécurisée', 0, 0, 35, 100, 5, 1,
 'Objectif: tester sans risque.
Prix: 0 USD.
Campagnes/mois: 5.
Contacts/campagne: 100.
Appels simultanés: 1.
Tarif: 0,35 USD / minute.
Protection: Fair Use strict.', NOW(), NOW()),
('starter', 'Starter', 7900, 0, 30, 500, 50, 2,
 'Pour les indépendants et petites équipes.
Prix: 79 USD.
Campagnes/mois: 50.
Contacts/campagne: 500.
Appels simultanés: 2.
Tarif: 0,30 USD / minute.
Priorité réseau: standard.', NOW(), NOW()),
('pro', 'Pro', 39900, 0, 25, 2000, 200, 10,
 'Pour les utilisateurs intensifs et équipes structurées.
Prix: 399 USD.
Campagnes/mois: 200.
Contacts/campagne: 2000.
Appels simultanés: 10.
Tarif: 0,25 USD / minute.
Priorité réseau: élevée.', NOW(), NOW())
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
