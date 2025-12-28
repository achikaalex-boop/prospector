import { supabase } from './supabase'

// Returns per-minute cents for a user based on their plan, or a default
export async function getPerMinuteCentsForUser(userId) {
  try {
    if (!supabase || !userId) return defaultPerMin()
    // Try to fetch user plan relation
    const { data: up, error } = await supabase.from('user_plans').select('*').eq('user_id', userId).limit(1).single()
    if (error || !up) return defaultPerMin()
    // If plan has custom per_min_cents, use it
    if (up.per_min_cents && Number(up.per_min_cents) > 0) return Number(up.per_min_cents)
    // otherwise find plan in plans table
    const { data: plan } = await supabase.from('plans').select('*').eq('slug', up.plan_slug).limit(1).single()
    if (plan && plan.per_min_cents) return Number(plan.per_min_cents)
    return defaultPerMin()
  } catch (e) {
    console.warn('billing.getPerMinuteCentsForUser failed:', e.message || e)
    return defaultPerMin()
  }
}

export function defaultPerMin() {
  // Default provider cost + margin from existing code: provider 17c/min + 30% margin
  const providerCentsPerMin = 17
  const margin = 1.30
  return Math.ceil(providerCentsPerMin * margin)
}

export default { getPerMinuteCentsForUser, defaultPerMin }
