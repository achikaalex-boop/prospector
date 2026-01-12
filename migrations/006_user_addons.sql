-- Migration 006: user_addons table
CREATE TABLE IF NOT EXISTS user_addons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, addon_key)
);

CREATE INDEX IF NOT EXISTS idx_user_addons_user_id ON user_addons(user_id);

ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Server manage addons"
  ON user_addons FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_user_addons_updated_at
  BEFORE UPDATE ON user_addons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
