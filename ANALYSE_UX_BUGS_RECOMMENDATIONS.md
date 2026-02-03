# 📊 Analyse Approfondie - Prospector AI

**Date:** January 22, 2026  
**Type:** Analyse UX + Identification des Bugs + Recommandations

**STATUS:** ✅ CRITICAL FIXES APPLIED - See "Completed Fixes" section below

---

## ✅ COMPLETED FIXES (Session 3)

### 1. ✅ Input Validation - `transfert_call_number` Phone Format
- **File:** `src/views/Campaign.vue`
- **Fix:** Added `validatePhoneNumber()` function with E.164 format validation
- **Status:** ✓ COMPLETE

### 2. ✅ CSV Validation - Row-level Checks
- **File:** `src/views/Campaign.vue` 
- **Fix:** Enhanced `handleFileUpload()` with:
  - Row-by-row validation with detailed error messages
  - Phone number format validation (E.164)
  - Email format validation
  - Duplicate phone detection
- **Status:** ✓ COMPLETE

### 3. ✅ Input Sanitization - XSS Prevention
- **Files:** `webhook-server.mjs`, `src/views/Campaign.vue`
- **Fix:** 
  - Added `sanitizeInput()` utility function (removes <>, limits to 500 chars)
  - Applied to all campaign form inputs before backend submission
  - Applied to all campaign creation fields in webhook-server.mjs
- **Status:** ✓ COMPLETE

### 4. ✅ PayPal Capture - Non-Retryable Error Detection
- **File:** `webhook-server.mjs` `/api/paypal/capture`
- **Fix:**
  - Added `NON_RETRYABLE_ERRORS` array with error codes:
    - `ORDER_ALREADY_CAPTURED`
    - `PERMISSION_DENIED`
    - `INVALID_REQUEST`
    - `MALFORMED_REQUEST_BODY`
    - `INVALID_PARAMETER_VALUE`
    - `INSTRUMENT_DECLINED`
    - `PAYER_CANNOT_PAY`
    - `BUYER_ACCOUNT_LOCKED`
  - Stop retrying immediately on non-retryable errors
  - Added detailed logging for debugging
- **Status:** ✓ COMPLETE

### 5. ✅ Admin Access Control - User Isolation
- **File:** `webhook-server.mjs` `/api/admin/call-webhooks` and `/api/admin/link-payload`
- **Fix:**
  - Added JWT token parsing to extract user_id
  - Filter all queries by authenticated user_id
  - Prevent data leakage between users
- **Status:** ✓ COMPLETE

### 6. ✅ Rate Limiting - Campaign Creation Abuse Prevention
- **File:** `webhook-server.mjs` `/api/create-campaign`
- **Fix:**
  - Added `checkRateLimit()` function
  - Limit: 5 campaigns per minute per user
  - Returns 429 error with reset time
  - Uses in-memory Map for fast lookup
- **Status:** ✓ COMPLETE

### 7. ✅ Webhook Idempotency - Database-Backed Deduplication
- **File:** `webhook-server.mjs` webhook receiver endpoint
- **Fix:**
  - Added dual-layer idempotency:
    1. Memory cache check (fast path)
    2. Database check for persistence across restarts
  - Prevents duplicate call processing from retried webhooks
- **Status:** ✓ COMPLETE

---

## 🎯 Vue d'ensemble de l'application

**Prospector AI** est une plateforme SaaS complète permettant:
- Création/gestion de campagnes de prospection vocale automatisées
- Intégration Retell AI pour les appels vocaux
- Système de billing avec PayPal
- Gestion des plans: seul le plan `pro` est disponible
- Dashboard de suivi des résultats d'appels
- Interface admin pour la gestion des plans et numéros dédiés

**Stack technique:**
- Frontend: Vue 3 + Vue Router + PrimeVue + Tailwind CSS
- Backend: Express.js (Node.js ES modules)
- Auth: Supabase Auth
- DB: Supabase PostgreSQL
- Payment: PayPal API
- Voice: Retell AI API

---

## 🐛 ZONES À RISQUE - Bugs Potentiels et Critiques

### 1. **VALIDATION ET SÉCURITÉ - RISQUE ÉLEVÉ**

#### 🔴 Problème: Validations manquantes sur le champ `transfert_call_number`

**Location:** `src/views/Campaign.vue` (ligne ~454)

```vue
transfert_call_number: '',
```

**Issue:** Le champ accepte n'importe quelle chaîne, pas de validation de format téléphone
```vue
<InputText
  v-model="formData.transfert_call_number"
  placeholder="Ex: +33612345678"
  class="w-full"
  required
/>
```

**Risque:** 
- ❌ Appels transférés vers des numéros invalides
- ❌ Pas de vérification du format E.164
- ❌ Retell API peut rejeter silencieusement

**Recommandation:**
```javascript
// Ajouter validation E.164
const isValidPhoneNumber = (num) => /^\+?[1-9]\d{1,14}$/.test(String(num).replace(/\D/g, ''))

// Ou utiliser une lib: libphonenumber-js
import { parsePhoneNumber } from 'libphonenumber-js'
```

---

#### 🔴 Problème: Pas de validation du format CSV

**Location:** `src/views/Campaign.vue` (ligne ~706)

```javascript
const handleFileUpload = (event) => {
  const file = event.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      Papa.parse(e.target.result, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          contacts.value = results.data
```

**Issues:**
- ❌ Pas de vérification des colonnes requises
- ❌ Pas de vérification des formats de données
- ❌ Les numéros malformés ne sont pas validés
- ❌ Les emails invalides ne sont pas détectés
- ❌ Possibilité de injection de données malveillantes

**Recommandation:**
```javascript
const validateCSVRow = (row) => {
  const errors = []
  
  // Vérifier colonnes requises
  if (!row.nom?.trim()) errors.push('Nom requis')
  if (!row.telephone?.trim()) errors.push('Téléphone requis')
  
  // Valider téléphone
  const tel = row.telephone.replace(/\D/g, '')
  if (!/^\+?[1-9]\d{1,14}$/.test(tel)) {
    errors.push(`Téléphone invalide: ${row.telephone}`)
  }
  
  // Valider email (optionnel mais s'il existe)
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push(`Email invalide: ${row.email}`)
  }
  
  return { valid: errors.length === 0, errors }
}
```

---

#### 🔴 Problème: Input Sanitization manquant

**Location:** `webhook-server.mjs` ligne ~771 et `Campaign.vue` ligne ~784

```javascript
// Backend - pas de sanitization
const campaignRow = {
  user_id: userId,
  company_name: payload.company_name || null,  // ❌ Pas échappé
  domain: payload.domain || null,               // ❌ Pas échappé
  value_proposition: payload.promesse_de_valeur || null,
  agent_name: payload.agent_name || 'Agent',   // ❌ Pas échappé
  // ...
}
```

**Risques:**
- ❌ XSS potentiel lors de l'affichage au Dashboard
- ❌ SQL Injection (mitigée par Supabase RLS mais risquée)
- ❌ Données corrompues dans la DB

**Recommandation:**
```javascript
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str
  return str
    .trim()
    .slice(0, 500) // Limiter longueur
    .replace(/[<>]/g, '') // Enlever balises HTML
}

const campaignRow = {
  user_id: userId,
  company_name: sanitizeInput(payload.company_name) || null,
  domain: sanitizeInput(payload.domain) || null,
  agent_name: sanitizeInput(payload.agent_name) || 'Agent',
  // ...
}
```

---

### 2. **ERREURS RÉSEAU ET ÉTAT - RISQUE ÉLEVÉ**

#### 🔴 Problème: Race condition lors de la création de campagne

**Location:** `src/views/Campaign.vue` (ligne ~784)

```javascript
const handleSubmit = async () => {
  // ...validation...
  
  try {
    const resp = await axios.post('/api/create-campaign', payload, { timeout: 30000 })
    if (resp.status === 201 || resp.status === 202) {
      // ❌ Pas d'attente avant redirection
      setTimeout(() => router.push('/'), 2000)
    }
  } catch (e) {
    // ...erreur...
  } finally {
    loading.value = false
  }
}
```

**Issue:** 
- ❌ Redirection avant confirmation complète
- ❌ User peut fermer la page avant que la requête soit finie
- ❌ Campagne créée mais user ne le sait pas

**Recommandation:**
```javascript
// Ajouter polling ou websocket pour vérifier l'état
const waitForCampaignCreated = async (campaignId) => {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const { data } = await axios.get(`/api/campaigns/${campaignId}`)
    if (data.status !== 'pending') {
      return data
    }
    await new Promise(r => setTimeout(r, 500))
    attempts++
  }
  
  throw new Error('Campaign creation timeout')
}
```

---

#### 🔴 Problème: Pas de gestion des erreurs PayPal captures

**Location:** `webhook-server.mjs` ligne ~1085

```javascript
app.post('/api/paypal/capture', async (req, res) => {
  try {
    const { orderID, user_id, plan_slug } = req.body || {};
    if (!orderID) return res.status(400).json({ error: 'orderID required' });
    
    let lastErr = null
    let capture = null
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        capture = await capturePayPalOrder(orderID)
        // ...
      } catch (e) {
        // ❌ Retry aveugle sans vérifier le type d'erreur
        if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 500 * attempt))
      }
    }
```

**Issues:**
- ❌ Retry sur des erreurs qui ne doivent pas être retryées (ex: ORDER_ALREADY_CAPTURED)
- ❌ Pas de tracking des tentatives échouées
- ❌ User peut être débité 2-3 fois pour le même ordre
- ❌ Pas de webhook de fallback si la capture échoue

**Recommandation:**
```javascript
const NON_RETRYABLE_ERRORS = [
  'ORDER_ALREADY_CAPTURED',
  'INVALID_REQUEST',
  'PERMISSION_DENIED'
]

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    capture = await capturePayPalOrder(orderID)
    break
  } catch (e) {
    const issue = e?.response?.data?.details?.[0]?.issue
    if (NON_RETRYABLE_ERRORS.includes(issue)) {
      console.error('Non-retryable PayPal error:', issue)
      return res.status(400).json({ error: issue })
    }
    
    if (attempt < maxAttempts) {
      console.warn(`Retry ${attempt}/${maxAttempts} for order ${orderID}`)
      await new Promise(r => setTimeout(r, 500 * attempt))
    }
  }
}
```

---

### 3. **AUTHENTIFICATION ET AUTORISATIONS - RISQUE MOYEN**

#### 🟡 Problème: Pas de vérification du proprio de la campagne

**Location:** `webhook-server.mjs` ligne ~1377 (admin endpoints)

```javascript
app.get('/api/admin/call-webhooks', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })
  try {
    // ❌ Pas de vérification admin
    const q = req.query.q || null
    let query = supabase.from('call_webhooks').select('*')
    // ...retourne TOUS les webhooks de tous les users...
  }
```

**Issue:**
- ❌ Admin peut voir les détails d'appels d'AUTRES users
- ❌ Violation de privacy
- ❌ Données sensibles exposées

**Recommandation:**
```javascript
app.get('/api/admin/call-webhooks', async (req, res) => {
  try {
    const isAdmin = await isRequestAdmin(req)
    if (!isAdmin) return res.status(403).json({ error: 'admin_only' })
    
    // ✅ Maintenant vérifiée
    const { data: { user } } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1])
    if (!user) return res.status(401).json({ error: 'not_authenticated' })
    
    // Filter par user_id si pas admin complet, ou par campaign si paramètre
    const q = req.query.q || null
    let query = supabase.from('call_webhooks')
      .select('*')
      .eq('user_id', user.id) // ✅ Filter par user
```

---

#### 🟡 Problème: Admin token peut être exposé

**Location:** `webhook-server.mjs` ligne ~590

```javascript
const token = crypto.randomBytes(32).toString('hex')
const { data, error } = await supabase.from('app_settings').upsert(
  [{ key: 'admin_token', value: token }], 
  { onConflict: ['key'] }
)
return res.json({ ok: true, token })  // ❌ Token retourné en réponse
```

**Issue:**
- ❌ Token peut être interception dans les logs/analytics
- ❌ Pas de rotation automatique
- ❌ Pas d'expiration

**Recommandation:**
```javascript
// 1. Retourner uniquement une confirmation, pas le token
return res.json({ ok: true }) // ❌ Ne pas retourner le token

// 2. Ajouter expiration
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
await supabase.from('app_settings').upsert([
  { key: 'admin_token', value: token },
  { key: 'admin_token_expires_at', value: expiresAt.toISOString() }
])

// 3. Vérifier expiration lors de la validation
if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
  return false // Token expiré
}
```

---

### 4. **GESTION D'ÉTAT ET DATA - RISQUE MOYEN**

#### 🟡 Problème: Balance non mise à jour après TopUp

**Location:** `src/views/TopUpComplete.vue` et `src/App.vue`

```javascript
// TopUpComplete.vue
const handleCapture = async () => {
  // ...capture PayPal...
  // ❌ Aucune mise à jour du balance après succès
  this.message = 'Paiement capturé avec succès'
}

// App.vue
const balanceCents = ref(0)
const loadBalance = async () => {
  // Balance chargée au mount SEULEMENT
}
onMounted(() => {
  loadBalance() // Une seule fois
})
```

**Issue:**
- ❌ Balance stale après TopUp
- ❌ User doit rafraîchir la page pour voir le solde à jour
- ❌ Peut créer des confusions avec les limites

**Recommandation:**
```javascript
// Event-driven balance update
const emitter = mitt() // npm install mitt

// TopUpComplete.vue
const handleCapture = async () => {
  try {
    const result = await capturePayPalOrder(orderID)
    // ✅ Émettre événement
    emitter.emit('balance:updated', { 
      balanceCents: result.new_balance 
    })
  }
}

// App.vue
onMounted(() => {
  loadBalance()
  // ✅ Écouter les mises à jour
  emitter.on('balance:updated', ({ balanceCents }) => {
    balanceCents.value = balanceCents
  })
})
```

---

#### 🟡 Problème: Pas de invalidation de cache après création de campagne

**Location:** `src/views/Dashboard.vue` ligne ~333

```javascript
const loadCampaigns = async () => {
  const { data, error: fetchError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  campaigns.value = data || []
}

// Chargé au mount SEULEMENT
onMounted(() => {
  loadCampaigns()
})
```

**Issue:**
- ❌ Dashboard n'affiche pas la nouvelle campagne après création
- ❌ User doit rafraîchir manuellement
- ❌ Mauvaise UX

**Recommandation:**
```javascript
// Utiliser Supabase real-time ou polling
onMounted(() => {
  loadCampaigns()
  
  // ✅ Souscrire aux changements
  const subscription = supabase
    .from('campaigns')
    .on('*', payload => {
      if (payload.new.user_id === user.id) {
        campaigns.value = [payload.new, ...campaigns.value]
      }
    })
    .subscribe()
  
  onUnmounted(() => subscription.unsubscribe())
})

// OU polling si real-time indisponible
let pollInterval = null
const startPolling = () => {
  pollInterval = setInterval(loadCampaigns, 5000)
}
```

---

### 5. **RETELL AI INTEGRATION - RISQUE MOYEN-ÉLEVÉ**

#### 🟡 Problème: Pas de validation de la réponse Retell

**Location:** `webhook-server.mjs` ligne ~827

```javascript
try {
  const resp = await axios.post(
    process.env.RETELL_API_URL || 'https://api.retellai.com/create-batch-call',
    batchBody,
    { headers: { Authorization: `Bearer ${process.env.RETELL_API_KEY}` }, timeout: 20000 }
  )
  // ❌ Pas de validation du schema de réponse
  return res.status(201).json({ ok: true, campaign: campaign, retell: resp.data })
} catch (e) {
  // ❌ Fallback silencieux vers job_queue
  // Pas de logging du vrai problème
```

**Issues:**
- ❌ Si Retell répond avec un format invalide, on l'accepte quand même
- ❌ Pas de vérification que `batch_call_id` existe
- ❌ Campagne créée mais peut ne jamais s'exécuter

**Recommandation:**
```javascript
const validateRetellResponse = (data) => {
  const errors = []
  
  if (!data.batch_call_id) errors.push('Missing batch_call_id')
  if (typeof data.batch_call_id !== 'string') errors.push('Invalid batch_call_id type')
  if (!data.created_at) errors.push('Missing created_at')
  if (!Array.isArray(data.calls)) errors.push('Missing calls array')
  
  return { valid: errors.length === 0, errors }
}

const validation = validateRetellResponse(resp.data)
if (!validation.valid) {
  console.error('Invalid Retell response:', validation.errors)
  // Stocker la campagne comme "pending" et retry plus tard
  await supabase.from('campaigns')
    .update({ status: 'pending_retry', error: validation.errors.join(', ') })
    .eq('id', campaign.id)
  
  return res.status(202).json({ 
    ok: true, 
    campaign: campaign, 
    queued: true,
    warning: 'Invalid Retell response, queued for retry'
  })
}
```

---

### 6. **PERFORMANCE ET SCALABILITÉ - RISQUE MOYEN**

#### 🟡 Problème: Pas de pagination au Dashboard

**Location:** `src/views/Dashboard.vue` ligne ~74

```vue
<div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card v-for="campaign in campaigns" :key="campaign.id">
    <!-- ❌ TOUTES les campagnes chargées à la fois -->
```

**Issue:**
- ❌ User avec 1000 campagnes → page figée
- ❌ Pas d'optimisation des requêtes
- ❌ Memory leak potentiel

**Recommandation:**
```javascript
const pageSize = 12
const currentPage = ref(0)
const totalCampaigns = ref(0)
const hasMore = ref(true)

const loadCampaigns = async (page = 0) => {
  const start = page * pageSize
  const end = start + pageSize - 1
  
  const { data, count, error } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(start, end)
  
  totalCampaigns.value = count
  campaigns.value = page === 0 ? data : [...campaigns.value, ...data]
  hasMore.value = (page + 1) * pageSize < count
}

// Infinite scroll ou load more button
const loadMore = () => {
  currentPage.value++
  loadCampaigns(currentPage.value)
}
```

---

#### 🟡 Problème: Pas de debounce sur les recherches

**Location:** `webhook-server.mjs` ligne ~1310

```javascript
app.get('/api/admin/call-webhooks', async (req, res) => {
  const q = req.query.q || null
  let query = supabase.from('call_webhooks').select('*')
  if (q) {
    // ❌ Requête pour CHAQUE caractère tapé
    query = supabase.from('call_webhooks')
      .select('*')
      .or(`call_id.ilike.%${q}%,to_number.ilike.%${q}%`)
  }
```

**Recommandation:**
```javascript
// Frontend
const searchQuery = ref('')
const debouncedSearch = useDebounceFn(async () => {
  await fetchWebhooks(searchQuery.value)
}, 500) // 500ms debounce

watch(searchQuery, () => debouncedSearch())
```

---

### 7. **LOGGING ET MONITORING - RISQUE MOYEN**

#### 🟡 Problème: Pas de tracing des erreurs critiques

**Location:** Multiple endpoints

```javascript
} catch (e) {
  console.error('Error in /api/create-campaign:', e)
  return res.status(500).json({ error: 'internal' })
}
```

**Issue:**
- ❌ Erreur retournée sans context
- ❌ Pas de request ID pour tracking
- ❌ Impossible à debugger en production

**Recommandation:**
```javascript
// Ajouter middleware de logging
const requestId = () => `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

app.use((req, res, next) => {
  req.id = requestId()
  console.log(`[${req.id}] ${req.method} ${req.path}`)
  next()
})

// Dans les erreurs
} catch (e) {
  const errorId = `err-${req.id}-${Date.now()}`
  console.error(`[${errorId}] Error in /api/create-campaign:`, {
    message: e.message,
    stack: e.stack,
    userId: payload.user_id,
    requestId: req.id
  })
  return res.status(500).json({ 
    error: 'internal',
    errorId: errorId // Permettre au user de rapporter
  })
}
```

---

## ⚠️ ZONES PROBLÉMATIQUES - UX & Architecture

### 1. **Formulaire Campaign trop complexe**

**Problème:** Le formulaire a ~40 champs répartis sur plusieurs sections
```vue
<Card> <!--Company Info -->
<Card> <!--Contact Info -->
<Card> <!--Pain Points -->
<Card> <!--Upload CSV -->
<Card> <!--Objectives -->
<!-- ... -->
```

**Impact UX:**
- ❌ User fatigue (long scroll)
- ❌ Taux d'abandon élevé
- ❌ Erreurs de validation cumulatives
- ❌ Pas de sauvegarde automatique

**Recommandation:**
```vue
<!-- Multi-step form avec progress bar -->
<div class="mb-4">
  <div class="flex justify-between">
    <span v-for="(step, i) in steps" :key="i"
      :class="['step', i <= currentStep ? 'active' : '']">
      {{ i + 1 }}. {{ step.title }}
    </span>
  </div>
</div>

<div v-show="currentStep === 0">
  <!-- Étape 1: Infos Compagnie -->
</div>

<div v-show="currentStep === 1">
  <!-- Étape 2: Infos Contacts -->
</div>

<!-- ... etc -->

<div class="flex justify-between">
  <Button @click="previousStep" :disabled="currentStep === 0">Précédent</Button>
  <Button @click="nextStep" :disabled="!canProceed">Suivant</Button>
  <Button @click="submit" v-if="currentStep === steps.length - 1">Créer Campagne</Button>
</div>
```

**Bénéfices:**
- ✅ Less cognitive load
- ✅ Better error handling per step
- ✅ Autosave entre étapes
- ✅ Progress visibility

---

### 2. **Pas de confirmation avant de créer une campagne**

**Location:** `src/views/Campaign.vue` ligne ~804

```javascript
const handleSubmit = async () => {
  // Validation...
  try {
    const resp = await axios.post('/api/create-campaign', payload)
    // Lancée immédiatement sans confirmation
```

**Problème:**
- ❌ User peut créer une campagne par accident
- ❌ Pas de résumé avant soumission
- ❌ Surcharge Retell AI

**Recommandation:**
```javascript
const showSummary = ref(false)

const handleSubmit = async () => {
  // Validation...
  if (!showSummary.value) {
    // Afficher résumé
    showSummary.value = true
    return
  }
  
  // Alors créer campagne
  const resp = await axios.post('/api/create-campaign', payload)
}
```

---

### 3. **Gestion des erreurs incohérente**

**Problème:** Erreurs affichées différemment partout

```javascript
// Parfois avec toast
toast.add({ severity: 'error', summary: 'Erreur', detail: msg })

// Parfois dans message de page
error.value = msg

// Parfois ignorées silencieusement
try { /* ... */ } catch (e) { /* rien */ }
```

**Recommandation:**
```javascript
// Créer un composant centralisé
const useErrorHandler = () => {
  const error = ref(null)
  
  const handle = (err, context = '') => {
    console.error(`[${context}]`, err)
    error.value = {
      message: err?.response?.data?.error || err.message || 'Erreur inconnue',
      context,
      timestamp: new Date()
    }
    toast.add({ 
      severity: 'error', 
      summary: 'Erreur',
      detail: error.value.message,
      life: 5000 
    })
  }
  
  const clear = () => { error.value = null }
  
  return { error, handle, clear }
}

// Usage
const { handle, error } = useErrorHandler()
try {
  // ...
} catch (e) {
  handle(e, 'campaign-creation')
}
```

---

### 4. **Aucune feedback après la création de campagne**

**Location:** `src/views/Campaign.vue` ligne ~806

```javascript
if (resp.status === 201 || resp.status === 202) {
  const msg = `Campagne créée avec succès ! ${contacts.value.length} contacts seront prospectés.`
  success.value = msg
  try { toast.add({ severity: 'success', summary: 'Campagne créée', detail: msg, life: 6000 }) } catch (e) {}
  setTimeout(() => router.push('/'), 2000) // ❌ Redirection trop rapide
}
```

**Problème:**
- ❌ Toast disparaît avant que user ait fini de lire
- ❌ Pas d'indication que la campagne s'exécute
- ❌ User ne sait pas où aller ensuite

**Recommandation:**
```javascript
if (resp.status === 201 || resp.status === 202) {
  // Afficher success page/modal
  showSuccessModal.value = true
  successData.value = {
    campaignId: campaign.id,
    campaignName: formData.company_name,
    contactsCount: contacts.value.length,
    batchCallId: resp.data.retell?.batch_call_id,
    status: resp.status === 201 ? 'running' : 'queued'
  }
  
  // Optionnel: redirection après action explicite
  // router.push(`/campaign/${campaign.id}`)
}
```

---

### 5. **Pas de limites de rate-limiting**

**Location:** Tous les endpoints publics

```javascript
app.post('/api/create-campaign', async (req, res) => {
  // ❌ N'importe quel user peut spammer des campagnes
```

**Risque:**
- ❌ Surcharge serveur
- ❌ Abus de l'API Retell
- ❌ Coûts élevés

**Recommandation:**
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit'

const createCampaignLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Max 5 campaigns par minute
  message: 'Trop de campagnes créées, attendez avant de réessayer',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isRequestAdmin(req) // Pas de limite pour admin
})

app.post('/api/create-campaign', createCampaignLimiter, async (req, res) => {
```

---

### 6. **Account page basique**

**Location:** `src/views/Account.vue`

```vue
<!-- Simple list of user data without edit capability -->
```

**Manque:**
- ❌ Pas de modification du profil
- ❌ Pas de changement de mot de passe
- ❌ Pas de gestion des sessions
- ❌ Pas de two-factor authentication

**Recommandation:**
```vue
<Card>
  <template #title>Mon Profil</template>
  <template #content>
    <div class="space-y-4">
      <!-- Email (read-only) -->
      <!-- Full Name (editable) -->
      <!-- Avatar upload -->
      <!-- Change password -->
      <!-- Active sessions -->
      <!-- Delete account -->
    </div>
  </template>
</Card>
```

---

### 7. **Admin interface non sécurisée**

**Location:** `src/views/Admin/Plans.vue`, `src/views/Admin/Login.vue`

```vue
<!-- Login stocke token en localStorage en clair -->
localStorage.setItem('admin_token', token)

<!-- Pas de expiration -->
<!-- Pas de rotation de token -->
<!-- Pas de audit logs des actions admin -->
```

**Recommandation:**
```javascript
// 1. Stocker dans httpOnly cookie (côté server)
res.cookie('admin_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24h
})

// 2. Requêtes admin doivent être validées via Supabase RLS
// 3. Ajouter audit logs
const logAdminAction = async (userId, action, details) => {
  await supabase.from('admin_audit_logs').insert([{
    admin_id: userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    ip_address: req.ip
  }])
}
```

---

### 8. **Retell webhook handler n'est pas robuste**

**Location:** `webhook-server.mjs` ligne ~1376

```javascript
app.post("/webhook", async (req, res) => {
  const { event, call } = req.body || {};
  
  // Répondre immédiatement
  res.status(204).send();
  
  try {
    // ... traitement ...
  } catch (error) {
    console.error("Error processing webhook:", error);
  }
});
```

**Issues:**
- ❌ Pas de retry si saveCallResults échoue
- ❌ Données perdues si DB est temporairement down
- ❌ Pas de vérification de signature Retell
- ❌ Pas de idempotency key

**Recommandation:**
```javascript
// 1. Ajouter vérification de signature
const verifyRetellWebhook = (req) => {
  const signature = req.headers['x-retell-signature']
  if (!signature) return false
  
  const hash = crypto
    .createHmac('sha256', process.env.RETELL_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex')
  
  return crypto.timingSafeEqual(signature, hash)
}

// 2. Ajouter idempotency
const isIdempotent = async (call_id) => {
  const existing = await supabase
    .from('call_webhooks')
    .select('id')
    .eq('call_id', call_id)
    .limit(1)
  
  return existing.data && existing.data.length > 0
}

// 3. Ajouter queue de retry
const webhookQueue = new Bull('webhook-processing', {
  redis: { url: process.env.REDIS_URL }
})

app.post("/webhook", async (req, res) => {
  if (!verifyRetellWebhook(req)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  const { event, call } = req.body
  
  // Ajouter à la queue
  await webhookQueue.add(
    { event, call },
    { removeOnComplete: true, attempts: 5 }
  )
  
  // Répondre immédiatement
  res.status(200).json({ ok: true })
})

webhookQueue.process(async (job) => {
  const { event, call } = job.data
  
  // Vérifier idempotency
  if (await isIdempotent(call.call_id)) {
    return { already_processed: true }
  }
  
  await saveCallResults(call)
})
```

---

## 📈 RECOMMANDATIONS D'AMÉLIORATIONS PRIORITAIRES

### Priority 1 - CRITIQUE (Implémenter ASAP)

| # | Problème | Effort | Impact | Status |
|---|----------|--------|--------|--------|
| 1 | Validation `transfert_call_number` | 🟢 Facile | 🔴 Haut | ❌ TODO |
| 2 | Validation CSV complète | 🟡 Moyen | 🔴 Haut | ❌ TODO |
| 3 | Input sanitization | 🟡 Moyen | 🔴 Haut | ❌ TODO |
| 4 | PayPal capture retry logic | 🟡 Moyen | 🔴 Haut | ❌ TODO |
| 5 | Race condition campagne | 🟡 Moyen | 🟠 Moyen | ❌ TODO |
| 6 | Admin access control | 🟡 Moyen | 🔴 Haut | ❌ TODO |
| 7 | Rate limiting | 🟢 Facile | 🟠 Moyen | ❌ TODO |
| 8 | Webhook idempotency | 🟡 Moyen | 🟠 Moyen | ❌ TODO |

### Priority 2 - Important (Implémenter prochainement)

| # | Problème | Effort | Impact | Status |
|---|----------|--------|--------|--------|
| 1 | Multi-step form | 🔴 Difficile | 🟠 Moyen | ❌ TODO |
| 2 | Campaign confirmation modal | 🟢 Facile | 🟢 Faible | ❌ TODO |
| 3 | Real-time campaign updates | 🟡 Moyen | 🟢 Faible | ❌ TODO |
| 4 | Balance refresh après TopUp | 🟢 Facile | 🟢 Faible | ❌ TODO |
| 5 | Centralized error handling | 🟡 Moyen | 🟠 Moyen | ❌ TODO |
| 6 | Webhook signature verification | 🟡 Moyen | 🟠 Moyen | ❌ TODO |
| 7 | Admin audit logs | 🟡 Moyen | 🟠 Moyen | ❌ TODO |

### Priority 3 - Nice to have (Implémenter plus tard)

| # | Problème | Effort | Impact | Status |
|---|----------|--------|--------|--------|
| 1 | Pagination dashboard | 🟡 Moyen | 🟢 Faible | ❌ TODO |
| 2 | Search debouncing | 🟢 Facile | 🟢 Faible | ❌ TODO |
| 3 | Request ID tracing | 🟡 Moyen | 🟢 Faible | ❌ TODO |
| 4 | Profile editing | 🟡 Moyen | 🟢 Faible | ❌ TODO |
| 5 | Better admin UI | 🔴 Difficile | 🟢 Faible | ❌ TODO |
| 6 | Two-factor auth | 🔴 Difficile | 🟠 Moyen | ❌ TODO |

---

## 🛠️ QUICK WINS À FAIRE IMMÉDIATEMENT

```javascript
// 1. Ajouter validation téléphone (5 minutes)
const validatePhoneNumber = (num) => {
  const cleaned = String(num).replace(/\D/g, '')
  return /^1?[0-9]{10,14}$/.test(cleaned)
}

// 2. Sanitizer inputs (10 minutes)
const sanitize = (str) => String(str || '').trim().slice(0, 500)

// 3. Ajouter rate-limiting (10 minutes)
import rateLimit from 'express-rate-limit'
const limiter = rateLimit({ windowMs: 60000, max: 10 })
app.post('/api/create-campaign', limiter, handler)

// 4. Ajouter idempotency check pour webhooks (15 minutes)
const isDuplicate = await checkWebhookProcessed(call.call_id)
if (isDuplicate) return res.json({ ok: true })

// 5. Afficher confirmation avant création (10 minutes)
if (!confirmationShown) {
  showConfirmModal.value = true
  return
}
// ... create campaign ...
```

---

## 📊 Scorecard Général

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Sécurité** | 5/10 | Input validation, sanitization, CORS manquants |
| **Stabilité** | 6/10 | Race conditions, error handling incohérent |
| **Performance** | 7/10 | Pas de pagination, pas de debounce |
| **UX** | 6/10 | Form complexe, feedback insuffisant |
| **Maintenance** | 6/10 | Logging, error tracking manquants |
| **Scalabilité** | 6/10 | Rate-limiting, idempotency manquants |
| **Overall** | **6.0/10** | Fonctionnel mais beaucoup d'améliorations possibles |

---

## 🎯 Prochaines Étapes Recommandées

1. **Immediate (Week 1):** Implémenter les 3 problèmes CRITIQUE
2. **Short-term (Week 2-3):** Multi-step form + Real-time updates
3. **Medium-term (Month 2):** Admin audit logs + 2FA
4. **Long-term:** Analytics dashboard + Advanced monitoring

---

**Rapport généré:** January 22, 2026
