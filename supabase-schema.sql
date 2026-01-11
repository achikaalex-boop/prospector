-- ============================================
-- SCHÉMA SUPABASE POUR PROSPECTOR AI
-- ============================================
-- Ce fichier contient le schéma SQL exact utilisé par le projet
-- Exécuter ce script dans l'éditeur SQL de Supabase pour créer les tables

-- ============================================
-- TABLE: campaigns
-- ============================================
-- Stocke les campagnes de prospection créées par les utilisateurs
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations entreprise (OBLIGATOIRES)
  company_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  value_proposition TEXT NOT NULL,
  infos TEXT NOT NULL,
  
  -- Configuration agent (OBLIGATOIRES)
  agent_name TEXT NOT NULL DEFAULT 'Julie',
  objectifs TEXT NOT NULL,
  
  -- Variables optionnelles
  referral_name TEXT,
  confidence_threshold DECIMAL(3, 2) DEFAULT 0.7,
  
  -- Métadonnées campagne
  contacts_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'stopped', 'error')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: campaign_results
-- ============================================
-- Stocke les résultats d'appels Retell pour chaque campagne
-- Remplie automatiquement par le webhook Retell (call_analyzed)
CREATE TABLE IF NOT EXISTS campaign_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Informations contact
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_company TEXT,
  
  -- Résultats appel
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'interested', 'not_interested', 'callback', 'appointment', 'failed')),
  notes TEXT,
  call_duration INTEGER, -- Durée en secondes
  confidence_score DECIMAL(3, 2),
  call_id TEXT,
  raw_payload JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES pour améliorer les performances
-- ============================================
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_results_campaign_id ON campaign_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_results_status ON campaign_results(status);
CREATE INDEX IF NOT EXISTS idx_campaign_results_contact_phone ON campaign_results(contact_phone);
CREATE INDEX IF NOT EXISTS idx_campaign_results_call_id ON campaign_results(call_id);

-- ============================================
-- FONCTION: Mise à jour automatique de updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGERS: Application automatique de updated_at
-- ============================================
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_results_updated_at 
  BEFORE UPDATE ON campaign_results
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) pour campaigns
-- ============================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent voir que leurs propres campagnes
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent créer que leurs propres campagnes
CREATE POLICY "Users can create their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs ne peuvent modifier que leurs propres campagnes
CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent supprimer que leurs propres campagnes
CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) pour campaign_results
-- ============================================
ALTER TABLE campaign_results ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent voir que les résultats de leurs campagnes
CREATE POLICY "Users can view results of their campaigns"
  ON campaign_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_results.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent insérer des résultats pour leurs campagnes
-- (utilisé par le webhook Retell avec service_role key)
CREATE POLICY "Users can insert results for their campaigns"
  ON campaign_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_results.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent mettre à jour les résultats de leurs campagnes
CREATE POLICY "Users can update results of their campaigns"
  ON campaign_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_results.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Le webhook Retell utilise la clé service_role pour insérer dans campaign_results
--    car il n'a pas de contexte utilisateur authentifié
-- 2. Si tu utilises le webhook avec service_role, tu devras peut-être ajuster les RLS
--    ou utiliser un service role key côté webhook
-- 3. Les colonnes suivantes ont été supprimées car non utilisées :
--    - referral_source (supprimé de l'UI)
--    - decision_committee (supprimé de l'UI)
--    - primary_contact (supprimé de l'UI)
--    - decision_process (supprimé de l'UI)
--    - next_action (non utilisé dans campaign_results)
--    - appointment_date (non utilisé dans campaign_results)

-- ============================================
-- TABLE: call_webhooks (audit pour payloads non reliés)
-- ============================================
-- Stocke les payloads webhook bruts quand `campaign_id` est manquant
CREATE TABLE IF NOT EXISTS call_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT,
  to_number TEXT,
  from_number TEXT,
  event_type TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_webhooks_call_id ON call_webhooks(call_id);
CREATE INDEX IF NOT EXISTS idx_call_webhooks_to_number ON call_webhooks(to_number);

-- ============================================
-- TABLE: billing_transactions
-- ============================================
-- Enregistre les transactions PayPal / paiements (pending, captured, failed)
CREATE TABLE IF NOT EXISTS billing_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','captured','failed','refunded')),
  meta JSONB,
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_transactions_user_id ON billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_order_id ON billing_transactions(order_id);

-- RLS: permettre aux utilisateurs de voir leurs propres transactions (lecture limitée)
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own billing transactions"
  ON billing_transactions FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Server can insert billing_transactions"
  ON billing_transactions FOR INSERT
  WITH CHECK (true);

CREATE TRIGGER update_billing_transactions_updated_at
  BEFORE UPDATE ON billing_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: user_plans
-- ============================================
-- Stocke l'abonnement actif d'un utilisateur
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_slug TEXT NOT NULL,
  per_min_cents INTEGER,
  concurrency_limit INTEGER DEFAULT 20,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_plan_slug ON user_plans(plan_slug);

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own plan"
  ON user_plans FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON user_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: user_credits
-- ============================================
-- Stocke les crédits achetés / accordés à un utilisateur (solde)
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  source TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own credits"
  ON user_credits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Server can insert credits"
  ON user_credits FOR INSERT
  WITH CHECK (true);

-- ============================================
-- NOTES MIGRATIONS
-- ============================================
-- 1) Ces tables standardisent les noms utilisés dans le code :
--    - `billing_transactions` : enregistrements liés à PayPal / top-ups
--    - `user_plans` : abonnement actuel de l'utilisateur (plan_slug + dates)
--    - `user_credits` : crédits monétaires (ex: USD) disponibles pour l'utilisateur
-- 2) Si vous déployez sur Supabase existant, exécutez ce fichier dans l'éditeur SQL.
-- 3) Vérifiez et ajustez les politiques RLS selon vos besoins (server doit utiliser SERVICE_ROLE key pour écrire).

-- ============================================
-- TABLE: plans
-- ============================================
-- Liste des offres disponibles (utilisée par l'UI/pricing et logique serveur)
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  included_minutes INTEGER DEFAULT 0,
  per_min_cents INTEGER DEFAULT 0,
  max_contacts_per_campaign INTEGER DEFAULT 1000,
  max_concurrency INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Readable by all authenticated users (UI needs to list plans)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read plans"
  ON plans FOR SELECT
  USING (true);

-- ============================================
-- TABLE: usage_records
-- ============================================
-- Stocke la consommation facturable (minutes facturées) par utilisateur
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billed_minutes INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their usage"
  ON usage_records FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Server can insert usage"
  ON usage_records FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TABLE: job_queue
-- ============================================
-- Queue légère pour tâches (fallback enqueue depuis create-campaign)
CREATE TABLE IF NOT EXISTS job_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_slug TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','failed','completed')),
  attempts INTEGER DEFAULT 0,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_queue_user_id ON job_queue(user_id);
CREATE TRIGGER update_job_queue_updated_at
  BEFORE UPDATE ON job_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Server can insert jobs"
  ON job_queue FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Server can manage jobs"
  ON job_queue FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SEED: plans (minimal)
-- ============================================
INSERT INTO plans (slug, name, monthly_price_cents, included_minutes, per_min_cents, max_contacts_per_campaign, max_concurrency, description)
SELECT * FROM (VALUES
  ('free','Free',0,0,0,100,1,'Free tier with no included minutes (trial)'),
  ('starter','Starter',9900,600,15,1000,2,'Starter plan: includes minutes and modest concurrency'),
  ('pro','Pro',29900,5000,10,5000,10,'Pro plan with higher limits and lower per-minute cost')
) AS t(slug,name,monthly_price_cents,included_minutes,per_min_cents,max_contacts_per_campaign,max_concurrency,description)
WHERE NOT EXISTS (SELECT 1 FROM plans p WHERE p.slug = t.slug);


-- ============================================
-- DEFAULT USER RECORDS ON SIGNUP
-- ============================================
-- Create a trigger that inserts default rows for a user when they sign up.
-- On user creation we add a starter plan (slug 'starter') and a zero credit row.
-- Note: the trigger runs on inserts to `auth.users`. When applying this
-- migration in Supabase, ensure the executing role has sufficient rights
-- (the Supabase SQL editor typically runs as an admin). The webhook/server
-- will still need a SERVICE_ROLE key to perform writes in production.

CREATE OR REPLACE FUNCTION public.create_user_default_records()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a default plan if none exists
  IF NOT EXISTS (SELECT 1 FROM public.user_plans WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_plans(user_id, plan_slug, per_min_cents, concurrency_limit, started_at, expires_at, created_at, updated_at)
    VALUES (NEW.id, 'starter', NULL, 20, NOW(), NULL, NOW(), NOW());
  END IF;

  -- Insert an initial zero credit row if none exists
  IF NOT EXISTS (SELECT 1 FROM public.user_credits WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_credits(user_id, amount, currency, source, meta, created_at)
    VALUES (NEW.id, 0.00, 'USD', 'signup', jsonb_build_object('created_by', 'trigger'), NOW());
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users: create defaults after a new user is inserted
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname = 'users' AND t.tgname = 'create_user_defaults_trigger'
  ) THEN
    CREATE TRIGGER create_user_defaults_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_default_records();
  END IF;
END$$;


