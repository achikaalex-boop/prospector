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
