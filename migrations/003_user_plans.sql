-- Migration: add per_min_cents and concurrency_limit to user_plans
ALTER TABLE IF EXISTS user_plans
  ADD COLUMN IF NOT EXISTS per_min_cents integer NULL,
  ADD COLUMN IF NOT EXISTS concurrency_limit integer NULL;

-- Optionally populate defaults for existing rows (example: starter/free -> 20 slots)
UPDATE user_plans SET concurrency_limit = 20 WHERE concurrency_limit IS NULL AND plan_slug IN ('free','starter');
UPDATE user_plans SET concurrency_limit = 50 WHERE concurrency_limit IS NULL AND plan_slug IN ('pro','standard');
UPDATE user_plans SET concurrency_limit = 200 WHERE concurrency_limit IS NULL AND plan_slug IN ('enterprise','business');
