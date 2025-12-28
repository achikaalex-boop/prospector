-- Migration: 001_billing.sql
-- Creates billing-related tables: plans, user_plans, usage_records, credit_balances

CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price_cents INTEGER DEFAULT 0,
  included_minutes INTEGER DEFAULT 0,
  max_concurrency INTEGER DEFAULT 1,
  max_contacts_per_campaign INTEGER DEFAULT 250,
  deposit_min_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  call_id TEXT,
  duration_seconds INTEGER DEFAULT 0,
  billed_minutes INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cents BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_campaign_id ON usage_records(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);

-- Seed basic plans
INSERT INTO plans (slug, name, description, monthly_price_cents, included_minutes, max_concurrency, max_contacts_per_campaign, deposit_min_cents)
SELECT 'starter', 'Starter', 'Basic plan, pay-as-you-go with low concurrency', 0, 0, 1, 250, 500
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug = 'starter');

INSERT INTO plans (slug, name, description, monthly_price_cents, included_minutes, max_concurrency, max_contacts_per_campaign, deposit_min_cents)
SELECT 'premium', 'Premium', 'Priority queue, more concurrency and included minutes', 2999, 500, 3, 2000, 5000
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug = 'premium');

INSERT INTO plans (slug, name, description, monthly_price_cents, included_minutes, max_concurrency, max_contacts_per_campaign, deposit_min_cents)
SELECT 'enterprise', 'Enterprise', 'Custom plan with dedicated support and capacity', 19999, 5000, 10, 0, 50000
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug = 'enterprise');

-- Function to update updated_at on credit_balances
CREATE OR REPLACE FUNCTION update_credit_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_balances_updated_at
  BEFORE UPDATE ON credit_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_balances_updated_at();
