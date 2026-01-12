#!/usr/bin/env node
// scripts/update-plans.js
// Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env then run:
//   node scripts/update-plans.js

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const plans = [
  {
    slug: 'free',
    name: 'Free — Découverte sécurisée',
    monthly_price_cents: 0,
    included_minutes: 5,
    per_min_cents: 35,
    max_contacts_per_campaign: 1000,
    monthly_campaign_limit: 0,
    max_concurrency: 1,
    description: 'Objectif: tester sans risque. Minutes incluses: 5/mois. Overage: $0.35/min. Priorité réseau: basse. Soft limit: 80%. Throttling progressif.',
    tagline: 'Découverte sécurisée',
    objective: 'tester sans risque',
    minutes_expiry_days: 30,
    card_required: true,
    network_priority: 'low',
    soft_limit_percent: 80,
    has_dedicated_number: false,
    has_extra_concurrency: false
  },
  {
    slug: 'starter',
    name: 'Starter',
    monthly_price_cents: 7900,
    included_minutes: 300,
    per_min_cents: 30,
    max_contacts_per_campaign: 1000,
    monthly_campaign_limit: 0,
    max_concurrency: 2,
    description: 'Starter: 300 minutes/mois, concurrency 2, overage $0.30/min, options: numéro dédié (add-on). Soft limit 85%.',
    tagline: 'Indépendants, petites équipes',
    objective: 'Usage régulier',
    minutes_expiry_days: 30,
    card_required: true,
    network_priority: 'standard',
    soft_limit_percent: 85,
    has_dedicated_number: true,
    has_extra_concurrency: false
  },
  {
    slug: 'pro',
    name: 'Pro',
    monthly_price_cents: 39900,
    included_minutes: 1500,
    per_min_cents: 25,
    max_contacts_per_campaign: 1000,
    monthly_campaign_limit: 0,
    max_concurrency: 10,
    description: 'Pro: 1500 minutes/mois, concurrency 10, overage $0.25/min, options: numéro dédié, concurrency add-on. Soft limit 95%.',
    tagline: 'Utilisateurs intensifs',
    objective: 'Équipes structurées et usage intensif',
    minutes_expiry_days: 30,
    card_required: true,
    network_priority: 'high',
    soft_limit_percent: 95,
    has_dedicated_number: true,
    has_extra_concurrency: true
  }
]

async function upsertPlans() {
  try {
    const { data, error } = await supabase.from('plans').upsert(plans, { onConflict: 'slug' })
    if (error) {
      console.error('Upsert error:', error)
      process.exit(2)
    }
    console.log('Plans upserted successfully')
    process.exit(0)
  } catch (e) {
    console.error('Unexpected error:', e)
    process.exit(3)
  }
}

upsertPlans()
