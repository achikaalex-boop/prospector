-- Migration: create job_queue table for Supabase-backed queue
CREATE TABLE IF NOT EXISTS job_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz NULL,
  finished_at timestamptz NULL,
  user_id uuid NULL,
  plan_slug text NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  attempts integer NOT NULL DEFAULT 0,
  payload jsonb NULL,
  result jsonb NULL,
  last_error text NULL
);

CREATE INDEX IF NOT EXISTS idx_job_queue_status_created_at ON job_queue(status, created_at);
