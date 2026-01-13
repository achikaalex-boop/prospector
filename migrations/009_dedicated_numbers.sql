-- 009_create_dedicated_number_requests_and_user_numbers.sql
-- Create table to hold user requests for a dedicated number

CREATE TABLE IF NOT EXISTS dedicated_number_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  country_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  assigned_number text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb
);

-- Table to store assigned dedicated numbers per user
CREATE TABLE IF NOT EXISTS user_dedicated_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  number text NOT NULL,
  country_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb
);

-- Indexes to speed up lookups
CREATE INDEX IF NOT EXISTS dedicated_number_requests_user_idx ON dedicated_number_requests(user_id);
CREATE INDEX IF NOT EXISTS user_dedicated_numbers_user_idx ON user_dedicated_numbers(user_id);
