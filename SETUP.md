# Guide de Configuration - Prospector AI

## 📋 Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL de projet et votre clé anonyme (anon key)

### 2. Configurer la base de données

1. Dans votre projet Supabase, allez dans l'éditeur SQL
2. Exécutez le script `supabase-schema.sql` fourni
3. Vérifiez que les tables `campaigns` et `campaign_results` sont créées

### 3. Configurer l'authentification

1. Dans Supabase, allez dans Authentication > Settings
2. Activez l'authentification par email
3. Configurez les paramètres selon vos besoins (confirmation email, etc.)

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
VITE_N8N_WEBHOOK_URL=https://votre-webhook-n8n.com/webhook
```

## 🔗 Configuration n8n (Optionnel)

### 1. Créer un workflow n8n

1. Créez un nouveau workflow dans n8n
2. Ajoutez un nœud "Webhook"
3. Configurez le webhook en mode POST
4. Copiez l'URL du webhook

### 2. Structure des données reçues

Le webhook recevra un payload JSON avec cette structure :

```json
{
  "company_name": "Nom de l'entreprise",
  "domain": "Secteur",
  "value_proposition": "Promesse de valeur",
  "confidence_threshold": 0.7,
  "agent_name": "Julie",
  "referral_name": "",
  "referral_source": "LinkedIn",
  "decision_committee": [],
  "primary_contact": "",
  "decision_process": "individual",
  "infos": "Détails sur l'entreprise",
  "objectifs": "prise_rdv",
  "contacts": [
    {
      "nom": "Jean Dupont",
      "email": "jean@example.com",
      "telephone": "0612345678",
      "entreprise": "Acme Corp"
    }
  ],
  "user_id": "uuid-de-l-utilisateur",
  "created_at": "2024-01-01T00:00:00.000Z",
  "status": "pending"
}
```

### 3. Traitement dans n8n

Vous pouvez ensuite :
- Envoyer les données à votre API d'agent vocal
- Traiter les contacts un par un
- Mettre à jour Supabase avec les résultats
- Envoyer des notifications

## 🚀 Démarrage

1. Installez les dépendances :
```bash
npm install
```

2. Configurez votre fichier `.env`

3. Lancez l'application :
```bash
npm run dev
```

4. Accédez à l'application sur `http://localhost:5173`

5. Créez un compte et commencez à créer vos campagnes !

## 📝 Format CSV

Le fichier CSV doit contenir au minimum :
- Une colonne pour le nom (nom, name)
- Une colonne pour l'email (email, mail)
- Une colonne pour le téléphone (telephone, tel, phone)
- Optionnellement une colonne pour l'entreprise (entreprise, company, societe)

Exemple de fichier CSV :

```csv
nom,email,telephone,entreprise
Jean Dupont,jean@example.com,0612345678,Acme Corp
Marie Martin,marie@example.com,0698765432,Tech Solutions
Pierre Durand,pierre@example.com,0654321098,Innovation Labs
```

## 🔒 Sécurité

- Les données sont protégées par Row Level Security (RLS)
- Chaque utilisateur ne voit que ses propres campagnes
- L'authentification est gérée par Supabase Auth
- Les mots de passe sont hashés et sécurisés

## 🐛 Dépannage

### Erreur de connexion Supabase
- Vérifiez que vos clés dans `.env` sont correctes
- Vérifiez que votre projet Supabase est actif

### Erreur lors de la création de campagne
- Vérifiez que les tables existent dans Supabase
- Vérifiez que RLS est correctement configuré
- Consultez la console du navigateur pour plus de détails

### Le webhook n8n ne fonctionne pas
- Vérifiez que l'URL du webhook est correcte
- Vérifiez que le workflow n8n est actif
- L'application continuera de fonctionner même si le webhook échoue

