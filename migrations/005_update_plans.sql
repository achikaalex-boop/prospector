-- Migration 005: Update plans to new pricing and descriptions
-- Applies upsert for Free, Starter, Pro plans per spec

INSERT INTO public.plans (slug, name, monthly_price_cents, included_minutes, per_min_cents, max_contacts_per_campaign, monthly_campaign_limit, max_concurrency, description, created_at, updated_at)
VALUES
('free', 'Free — Découverte sécurisée', 0, 5, 35, 1000, 0, 1,
 'Objectif: tester sans risque. Prix: 0 USD. Minutes incluses: 5 / mois (non reportables). Concurrency: 1. Priorité réseau: basse. Soft limit: 80%. Throttling progressif. Au-delà: Facturation 0.35 USD / minute. Protections: fair use strict.', NOW(), NOW()),
('starter', 'Starter', 7900, 300, 30, 1000, 0, 2,
 'Indépendants, petites équipes. Minutes incluses: 300 / mois. Concurrency: 2. Priorité réseau: standard. Soft limit: 85%. Dashboard standard. Usage supplémentaire: 0.30 USD / minute. Options: numéro dédié (add-on). Coût réel max: 45 USD; marge brute fixe: +34 USD.', NOW(), NOW()),
('pro', 'Pro', 39900, 1500, 25, 1000, 0, 10,
 'Utilisateurs intensifs, équipes structurées. Minutes incluses: 1500 / mois. Concurrency: 10. Priorité réseau: élevée. Soft limit: 95%. Dashboard avancé. Usage supplémentaire: 0.25 USD / minute. Options: numéro dédié, concurrency add-on. Coût réel max: 225 USD; marge brute fixe: +174 USD.', NOW(), NOW())
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
