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
    slug: 'pro',
    name: 'Pro',
    monthly_price_cents: 39900,
    included_minutes: 1500,
    per_min_cents: 25,
    max_contacts_per_campaign: 5000,
    monthly_campaign_limit: 0,
    max_concurrency: 10,
    description: 'Pro: accès complet à toutes les fonctionnalités et limites élevées.',
    tagline: 'Accès complet',
    objective: 'Usage intensif',
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
