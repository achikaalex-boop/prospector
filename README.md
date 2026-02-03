# 🎯 Prospector AI - Agent Vocal de Prospection

Application web complète pour gérer des campagnes de prospection automatisées avec un agent vocal AI. L'agent maîtrise les techniques commerciales avancées : **Cold Call 2.0**, **SPIN Selling**, **NEPQ**, **BANT**, **Feel-Felt-Found**, et **S.A.F.E.**

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec Supabase Auth
- 📊 **Dashboard** pour suivre toutes vos campagnes
- 🎯 **Création de campagnes** de prospection personnalisées
- 📁 **Upload de contacts** via fichier CSV
- 🤖 **Intégration Retell AI** pour les appels vocaux automatisés
- 📞 **Webhook en temps réel** pour recevoir les résultats d'appels
- 📈 **Suivi des résultats** avec analyse automatique des appels
- 🎨 **Interface moderne** avec PrimeVue et Tailwind CSS
- 📱 **Responsive design** pour mobile et desktop

## 🏗️ Architecture

Le projet est composé de deux parties principales :

1. **Frontend Vue.js** : Interface utilisateur pour créer et gérer les campagnes
2. **Backend Express** : Serveur webhook pour recevoir les événements Retell AI et servir le frontend

## 💳 Billing, Plans & Limits (changements récents)

- Le **seul** plan disponible est désormais `pro`, offrant un accès complet à toutes les fonctionnalités et limites élevées.
- Les nouveaux inscrits reçoivent le plan `pro` par défaut (aucun essai), et tous les contrôles de quotas utilisent les limites du plan `pro`.
- Ces limites sont appliquées côté serveur lors de la création de campagne (`/api/create-campaign`) et côté client dans l'UI de création de campagne (bouton désactivé si quota atteint).
- Le endpoint `/api/subscribe` normalise désormais la réponse PayPal : la réponse contient toujours `links` et un champ `approve_link` (si PayPal renvoie l'URL d'approbation). Le frontend redirige désormais directement vers ce lien pour autorisation.

Ces changements forcent l'upgrade vers un plan payant pour les utilisateurs qui dépassent les quotas du plan gratuit tout en gardant une UX claire côté client.

## 📋 Prérequis

- **Node.js** 18+ et npm
- **Compte Supabase** (gratuit disponible)
- **Compte Retell AI** avec :
  - API Key
  - Agent ID configuré
  - Numéro de téléphone sortant

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd prospector
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copiez le fichier d'exemple et configurez vos clés :

```bash
cp env.example .env
```

Éditez le fichier `.env` et ajoutez vos configurations :

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Retell AI Configuration
VITE_RETELL_API_KEY=your_retell_api_key
VITE_RETELL_FROM_NUMBER=+14157774444
VITE_RETELL_AGENT_ID=your_retell_agent_id
```

### 4. Configurer la base de données Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans l'éditeur SQL
3. Exécutez le script `supabase-schema.sql` pour créer les tables et politiques RLS

### 5. Configurer Retell AI

1. Créez un agent vocal dans votre dashboard Retell AI
2. Configurez le webhook de votre agent avec l'URL : `https://votre-domaine.com/webhook`
3. Notez votre `agent_id` et votre `from_number`

### 6. Lancer l'application en développement

**Mode développement (frontend uniquement)** :
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`

**Mode production (frontend + webhook)** :
```bash
npm run build
npm start
```
Le serveur sera accessible sur `http://localhost:8080`

## 🚀 Déploiement

### Déploiement sur Render.com

Le projet est configuré pour être déployé en un seul **Web Service** sur Render :

1. **Créer un nouveau Web Service** sur Render
2. **Connecter votre repository GitHub**
3. **Configurer les paramètres** :
   - **Environment** : Node
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
4. **Ajouter les variables d'environnement** dans Render :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RETELL_API_KEY`
   - `VITE_RETELL_FROM_NUMBER`
   - `VITE_RETELL_AGENT_ID`
5. **Déployer** et noter l'URL générée (ex: `https://votre-app.onrender.com`)
6. **Configurer le webhook Retell** avec l'URL : `https://votre-app.onrender.com/webhook`

## 📊 Structure de la Base de Données

### Table `campaigns`
Stocke les campagnes de prospection avec toutes les configurations :
- Informations entreprise (nom, secteur, promesse de valeur)
- Configuration agent (nom, objectifs)
- Variables conversationnelles optionnelles
- Statut et métadonnées

### Table `campaign_results`
Stocke les résultats de chaque appel Retell AI :
- Informations contact (nom, email, téléphone, entreprise)
- Résultats appel (statut, notes, durée, score de confiance)
- Lié automatiquement à la campagne via `campaign_id`

Les résultats sont automatiquement sauvegardés via le webhook Retell lors de l'événement `call_analyzed`.

## 📝 Format du Fichier CSV

Le fichier CSV doit contenir les colonnes suivantes (noms flexibles acceptés) :

- **nom/name** : Nom du contact
- **email/mail** : Adresse email
- **telephone/tel/phone** : Numéro de téléphone (format E.164 recommandé)
- **entreprise/company/societe** : Nom de l'entreprise (optionnel)

**Exemple** :
```csv
nom,email,telephone,entreprise
Jean Dupont,jean@example.com,+33612345678,Acme Corp
Marie Martin,marie@example.com,+33698765432,Tech Solutions
```

## 🔧 Variables du Formulaire

### Variables Obligatoires
- `agent_name` : Nom de l'agent vocal
- `company_name` : Nom de votre entreprise
- `domain` : Secteur d'activité (Immobilier, Tech, Finance, Conseil, Autre)
- `objectifs` : Type de prospection (voir liste ci-dessous)
- `promesse_de_valeur` : Bénéfice principal en une phrase
- `infos` : Description entreprise/service (2-3 phrases max)

### Variables Optionnelles
- `contact_first_name` : Prénom du prospect (défaut: "Monsieur/Madame")
- `referral_name` : Nom du référent (warm calling)
- `decision_maker_name` : Nom du décisionnaire

### Types d'Objectifs Disponibles
1. "Prise de rendez-vous"
2. "Qualification de prospects"
3. "Vente directe"
4. "Relance clients"
5. "Sondage"
6. "Demande d'information"

## 🔌 Webhook Retell AI

Le webhook reçoit automatiquement les événements Retell AI :

- **`call_started`** : Début d'un appel
- **`call_ended`** : Fin d'un appel (données complètes sauf analyse)
- **`call_analyzed`** : Analyse complète de l'appel (toutes les données)

Les données sont automatiquement sauvegardées dans `campaign_results` lors de l'événement `call_analyzed`.

## 🎨 Technologies Utilisées

### Frontend
- **Vue.js 3** - Framework frontend réactif
- **Vite** - Build tool ultra-rapide
- **Vue Router** - Routing SPA
- **PrimeVue** - Composants UI modernes
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Client HTTP

### Backend
- **Express.js** - Framework Node.js
- **Supabase** - Backend as a Service (Auth + Database)
- **Retell AI SDK** - Intégration API Retell

## 🔐 Sécurité

- ✅ Authentification sécurisée via Supabase Auth
- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Les utilisateurs ne peuvent accéder qu'à leurs propres données
- ✅ Variables d'environnement pour les clés sensibles
- ✅ Validation des données côté client et serveur

## 📁 Structure du Projet

```
prospector/
├── src/
│   ├── views/          # Pages Vue (Login, Register, Dashboard, Campaign)
│   ├── lib/            # Utilitaires (Supabase client)
│   ├── router/         # Configuration Vue Router
│   └── main.js         # Point d'entrée Vue
├── webhook-server.mjs   # Serveur Express (webhook + frontend)
├── supabase-schema.sql # Schéma SQL Supabase
├── package.json         # Dépendances et scripts
└── README.md           # Documentation
```

## 🧪 Scripts Disponibles

- `npm run dev` - Lance le serveur de développement Vite
- `npm run build` - Build le frontend pour la production
- `npm run preview` - Prévisualise le build de production
- `npm start` - Lance le serveur Express (webhook + frontend)
- `npm run webhook` - Alias pour `npm start`

## 📚 Documentation Additionnelle

- **Supabase** : [docs.supabase.com](https://docs.supabase.com)
- **Retell AI** : [docs.retellai.com](https://docs.retellai.com)
- **Vue.js** : [vuejs.org](https://vuejs.org)
- **PrimeVue** : [primevue.org](https://primevue.org)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## ⚠️ Notes Importantes

- Assurez-vous de ne jamais commiter vos fichiers `.env` contenant des clés API
- Le webhook Retell doit être configuré avec une URL HTTPS en production
- Les numéros de téléphone doivent être au format E.164 (ex: +33612345678)
- Le webhook a un timeout de 10 secondes selon la documentation Retell

---

**Développé avec ❤️ pour automatiser la prospection commerciale**
