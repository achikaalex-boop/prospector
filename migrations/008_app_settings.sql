-- 008_app_settings.sql
-- Table to store arbitrary application settings

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default support email if not present
INSERT INTO app_settings (key, value)
SELECT 'support_email', 'support@prospector.example'
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE key = 'support_email');
