# 🎯 Prospector AI - Agent Vocal de Prospection

Application web pour gérer des campagnes de prospection automatisées avec un agent vocal AI. L'agent maîtrise les techniques commerciales avancées : Cold Call 2.0, SPIN Selling, NEPQ, BANT, Feel-Felt-Found, et S.A.F.E.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec Supabase
- **Création de campagnes** de prospection personnalisées
- **Upload de contacts** via fichier CSV
- **Configuration avancée** de l'agent vocal
- **Dashboard** pour suivre les campagnes et résultats
- **Intégration webhook n8n** pour le traitement des appels
- **Interface moderne et responsive**

## 📋 Prérequis

- Node.js 18+ et npm
- Compte Supabase
- Webhook n8n configuré (optionnel)

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd prospector
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditez le fichier `.env` et ajoutez vos clés :
- `VITE_SUPABASE_URL` : URL de votre projet Supabase
- `VITE_SUPABASE_ANON_KEY` : Clé anonyme de votre projet Supabase
- `VITE_N8N_WEBHOOK_URL` : URL de votre webhook n8n (optionnel)

4. **Configurer la base de données Supabase**

Exécutez le script SQL fourni dans `supabase-schema.sql` dans l'éditeur SQL de Supabase pour créer les tables nécessaires.

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📊 Structure de la Base de Données

### Table `campaigns`
Stocke les campagnes de prospection avec toutes les configurations.

### Table `campaign_results`
Stocke les résultats de chaque appel de prospection.

## 📝 Format du Fichier CSV

Le fichier CSV doit contenir les colonnes suivantes (noms flexibles) :
- **nom/name** : Nom du contact
- **email/mail** : Adresse email
- **telephone/tel/phone** : Numéro de téléphone
- **entreprise/company/societe** : Nom de l'entreprise (optionnel)

Exemple :
```csv
nom,email,telephone,entreprise
Jean Dupont,jean@example.com,0612345678,Acme Corp
Marie Martin,marie@example.com,0698765432,Tech Solutions
```

## 🎨 Technologies Utilisées

- **Vue.js 3** - Framework frontend
- **Vite** - Build tool
- **Vue Router** - Routing
- **Supabase** - Backend as a Service (Auth + Database)
- **Axios** - HTTP client pour les webhooks

## 🔐 Sécurité

- Authentification via Supabase Auth
- Row Level Security (RLS) activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'à leurs propres données

## 📤 Intégration n8n

L'application envoie les données de campagne via webhook n8n. Le payload contient :
- Toutes les informations de configuration de la campagne
- La liste des contacts à appeler
- Les métadonnées utilisateur

## 🚧 Mode Bêta

L'application est actuellement en mode bêta et évolue continuellement. Les fonctionnalités peuvent être ajoutées ou modifiées.

## 📄 Licence

MIT

