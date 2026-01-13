<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <Card class="mb-6 shadow-md border border-gray-200">
        <template #content>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Nouvelle Campagne de Prospection
          </h1>
          <Message severity="info" :closable="false" class="mb-0">
            Configurez votre agent vocal AI avec les informations de votre
            entreprise et les objectifs de prospection. L'agent maîtrise les
            techniques avancées : <strong>Cold Call 2.0</strong>,
            <strong>SPIN Selling</strong>, <strong>NEPQ</strong>,
            <strong>BANT</strong>, <strong>Feel-Felt-Found</strong>,
            <strong>S.A.F.E.</strong>
            <router-link
              to="/techniques"
              class="ml-2 text-gray-900 font-semibold underline"
            >
              En savoir plus sur ces techniques
            </router-link>
          </Message>
        </template>
      </Card>

      <!-- Monthly campaign usage / limits -->
      <div class="mb-4">
        <div v-if="monthlyLimit > 0">
          <div v-if="remainingSlots === 0" class="text-sm text-red-600">Vous avez atteint votre limite de {{ monthlyLimit }} campagnes ce mois (plan: {{ selectedPlan }}). Passez à un plan payant pour lancer davantage de campagnes.</div>
          <div v-else class="text-sm text-gray-700">Campagnes ce mois: {{ monthlyCount }} / {{ monthlyLimit }} — il vous reste {{ remainingSlots }}.</div>
        </div>
      </div>

      <!-- Notifications are shown via toasts (PrimeVue ToastService) -->

      <!-- Debug logs are sent to the server for Render.com; not shown to clients -->

      <form @submit.prevent="handleSubmit">
        <!-- Informations Entreprise -->
        <Card class="mb-6 shadow-md border border-gray-200">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-building text-gray-700"></i>
              <span class="text-gray-900 font-semibold"
                >Informations Entreprise</span
              >
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block mb-2 font-semibold text-gray-700"
                  >Nom de l'entreprise *</label
                >
                <InputText
                  v-model="formData.company_name"
                  placeholder="Votre Entreprise"
                  class="w-full"
                  required
                />
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Secteur d'activité *</label
                >
                <Dropdown
                  v-model="formData.domain"
                  :options="domainOptions"
                  placeholder="Sélectionnez un secteur"
                  class="w-full"
                  required
                />
                <small class="text-gray-500 text-sm mt-1 block">
                  Options disponibles : Immobilier, Tech, Finance, Conseil,
                  Autre
                </small>
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Promesse de valeur (bénéfice principal) *</label
                >
                <InputText
                  v-model="formData.promesse_de_valeur"
                  placeholder="Bénéfice principal en une phrase"
                  class="w-full"
                  required
                />
              </div>

              <div class="md:col-span-2">
                <label class="block mb-2 font-semibold text-gray-700"
                  >Description entreprise / service *</label
                >
                <Textarea
                  v-model="formData.infos"
                  placeholder="Décrivez votre entreprise, vos services, vos produits (2-3 phrases max)..."
                  rows="5"
                  class="w-full"
                  required
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Configuration Agent -->
        <Card class="mb-6 shadow-md border border-gray-200">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-user text-gray-700"></i>
              <span class="text-gray-900 font-semibold"
                >Configuration Agent</span
              >
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Nom de l'agent *</label
                >
                <InputText
                  v-model="formData.agent_name"
                  placeholder="Julie"
                  class="w-full"
                  required
                />
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Seuil de confiance (0.0 - 1.0)</label
                >
                <InputNumber
                  v-model="formData.confidence_threshold"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :minFractionDigits="1"
                  :maxFractionDigits="2"
                  placeholder="0.7"
                  class="w-full"
                />
                <small class="text-gray-500 text-sm mt-1 block"
                  >Plus élevé = plus sélectif dans les réponses</small
                >
              </div>
            </div>
          </template>
        </Card>

        <!-- Variables Conversationnelles & Référence (Optionnel) -->
        <Card class="mb-6 shadow-md border border-gray-200">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-comments text-gray-700"></i>
              <span class="text-gray-900 font-semibold"
                >Variables Conversationnelles (optionnel)</span
              >
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Prénom du prospect</label
                >
                <InputText
                  v-model="formData.contact_first_name"
                  placeholder="Défaut : Monsieur / Madame"
                  class="w-full"
                />
                <small class="text-gray-500 text-sm mt-1 block">
                  Laissez vide pour utiliser &quot;Monsieur/Madame&quot;
                  automatiquement.
                </small>
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Nom du référent (warm calling)</label
                >
                <InputText
                  v-model="formData.referral_name"
                  placeholder="Nom du référent (optionnel)"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Nom du décisionnaire</label
                >
                <InputText
                  v-model="formData.decision_maker_name"
                  placeholder="Nom du décisionnaire (si connu)"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Processus métier ciblé</label
                >
                <InputText
                  v-model="formData.processus_metier"
                  placeholder="Ex : la gestion locative, le recrutement..."
                  class="w-full"
                />
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Capacité clé à qualifier</label
                >
                <InputText
                  v-model="formData.key_capability"
                  placeholder="Ex : automatisation, conformité RGPD..."
                  class="w-full"
                />
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Pain point identifié</label
                >
                <InputText
                  v-model="formData.pain_point_identifie"
                  placeholder="Ex : Perte de temps sur les tâches manuelles"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Numéro d'envoi</label
                >
                <Dropdown
                  v-model="formData.from_number"
                  :options="fromNumberOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Sélectionnez un numéro d'envoi"
                  class="w-full"
                />
                <small class="text-gray-500 text-sm mt-1 block"
                  >Sélectionnez le numéro utilisé pour émettre les appels.</small
                >
              </div>
              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Fuseau horaire d'appel</label
                >
                <Dropdown
                  v-model="formData.timezone"
                  :options="timezoneOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Sélectionnez un fuseau horaire"
                  class="w-full"
                />
                <small class="text-gray-500 text-sm mt-1 block"
                  >Sélectionnez le fuseau horaire pour la fenêtre
                  d'appel.</small
                >
              </div>
            </div>
          </template>
        </Card>

        <!-- Script d'appel personnalisé (Optionnel) -->
        <Card class="mb-6 shadow-md border border-gray-200">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-file-edit text-gray-700"></i>
              <span class="text-gray-900 font-semibold"
                >Script d'appel personnalisé (optionnel)</span
              >
            </div>
          </template>
          <template #content>
            <div class="space-y-2">
              <label class="block mb-2 font-semibold text-gray-700"
                >Script d'exemple</label
              >
              <Textarea
                v-model="formData.call_script_example"
                placeholder="Collez ici votre script d'appel en suivant le template recommandé (ACCROCHE, DÉCOUVERTE, TRANSITION VALEUR, CLOSING)..."
                rows="8"
                class="w-full"
              />
              <small class="text-gray-500 text-sm mt-1 block">
                Optionnel. Si laissé vide, l'agent utilisera un script généré
                automatiquement à partir de vos variables.
              </small>
            </div>
          </template>
        </Card>

        <!-- Objectifs -->
        <Card class="mb-6 shadow-md border border-gray-200">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-bullseye text-gray-700"></i>
              <span class="text-gray-900 font-semibold"
                >Objectifs de Prospection</span
              >
            </div>
          </template>
          <template #content>
            <div>
              <label class="block mb-2 font-semibold text-gray-700"
                >Sélectionnez les objectifs *</label
              >
              <Dropdown
                v-model="formData.objectifs"
                :options="objectifsOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Sélectionnez un objectif"
                class="w-full"
                required
              />
            </div>
          </template>
        </Card>

        <!-- Contacts -->
        <Card class="mb-6 shadow-md border border-gray-200">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-users text-gray-700"></i>
              <span class="text-gray-900 font-semibold"
                >Contacts à Appeler</span
              >
            </div>
          </template>
          <template #content>
            <div class="space-y-4">
              <div>
                <label class="block mb-2 font-semibold text-gray-700"
                  >Fichier de contacts (CSV) *</label
                >
                <FileUpload
                  mode="basic"
                  accept=".csv"
                  :maxFileSize="10000000"
                  chooseLabel="Choisir un fichier CSV"
                  @select="handleFileUpload"
                  class="w-full"
                  :disabled="loading"
                />
                <small class="text-gray-500 text-sm mt-1 block">
                  Format CSV attendu : nom, email, téléphone, entreprise
                  (optionnel)<br />
                  <span class="text-blue-600"
                    >ℹ️ Le préfixe "+" sera ajouté automatiquement aux numéros
                    de téléphone si absent.</span
                  >
                </small>
              </div>

              <div
                v-if="contacts.length > 0"
                class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 class="font-semibold text-gray-900 mb-3">
                  Contacts chargés ({{ contacts.length }})
                </h3>
                <DataTable
                  :value="contacts.slice(0, 10)"
                  :paginator="contacts.length > 10"
                  :rows="5"
                  class="p-datatable-sm"
                  :scrollable="true"
                  scrollHeight="200px"
                >
                  <Column field="nom" header="Nom"></Column>
                  <Column field="email" header="Email"></Column>
                  <Column field="telephone" header="Téléphone"></Column>
                  <Column field="entreprise" header="Entreprise"></Column>
                </DataTable>
                <p
                  v-if="contacts.length > 10"
                  class="text-sm text-gray-600 mt-2 text-center"
                >
                  ... et {{ contacts.length - 10 }} autres contacts
                </p>
              </div>
            </div>
          </template>
        </Card>

        <!-- Actions -->
        <Card class="shadow-md border border-gray-200">
          <template #content>
            <div class="flex justify-end gap-3">
              <Button
                label="Annuler"
                icon="pi pi-times"
                severity="secondary"
                outlined
                @click="$router.push('/')"
                :disabled="loading"
              />
              <Button
                type="submit"
                label="Lancer la Campagne"
                icon="pi pi-send"
                :loading="loading"
                :disabled="loading || contacts.length === 0 || (monthlyLimit > 0 && remainingSlots === 0)"
                :title="(monthlyLimit > 0 && remainingSlots === 0) ? 'Quota mensuel atteint — passez à un plan payant pour lancer plus de campagnes' : ''"
              />
            </div>
          </template>
        </Card>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import Papa from 'papaparse'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'
// Message removed; toasts are used instead
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const router = useRouter()
const contacts = ref([])
const error = ref('')
const success = ref('')
const loading = ref(false)
const committeeMember = ref('')
const toast = useToast()

// Send diagnostic logs to server-side endpoint so they appear in Render.com logs.
// Do NOT display these logs to clients in the UI.
const sendServerLog = async (msg, meta = {}) => {
  const payload = {
    ts: new Date().toISOString(),
    message: msg,
    meta
  }
  try {
    // Use absolute origin to avoid issues with relative paths when deployed
    const url = `${window.location.origin}/client-log`
    // Try once, with a short timeout; if it fails, retry once after 500ms
    await axios.post(url, payload, { timeout: 3000 })
  } catch (firstErr) {
    try {
      // second attempt (best-effort)
      const url = `${window.location.origin}/client-log`
      await axios.post(url, payload, { timeout: 3000 })
    } catch (e) {
      // keep client-side console for debugging during development only
      try { console.log('sendServerLog error (both attempts)', e) } catch (e) {}
    }
  }
  try { console.log(`${payload.ts} - ${payload.message}`) } catch (e) {}
}

// Expose a manual test helper to trigger a test log from the browser console
try {
  window.__sendClientLog = (testMsg = 'client-log test ping') => sendServerLog(testMsg, { test: true })
} catch (e) {}

const domainOptions = [
  'Immobilier',
  'Tech',
  'Finance',
  'Conseil',
  'Autre'
]

const baseFromNumberOptions = [
  { label: 'United States', value: '+14752906147' },
  { label: 'Switzerland', value: '+41234567890' }
]
const fromNumberOptions = ref([...baseFromNumberOptions])

// Load user's assigned dedicated numbers and prepend them to the list
const loadUserNumbers = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('user_dedicated_numbers').select('number,country_code').eq('user_id', user.id)
    if (!error && Array.isArray(data)) {
      data.forEach(n => {
        fromNumberOptions.value.unshift({ label: `${n.country_code || 'DED'} ${n.number}`, value: n.number })
      })
    }
  } catch (e) {
    console.error('loadUserNumbers error', e)
  }
}

onMounted(() => { loadMonthlyCount(); loadUserNumbers() })

const timezoneOptions = [
  { label: 'Africa/Porto-Novo', value: 'Africa/Porto-Novo' },
  { label: 'Africa/Cairo', value: 'Africa/Cairo' },
  { label: 'Africa/Johannesburg', value: 'Africa/Johannesburg' },
  { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
  { label: 'America/Denver', value: 'America/Denver' },
  { label: 'America/Chicago', value: 'America/Chicago' },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'America/Phoenix', value: 'America/Phoenix' },
  { label: 'America/Anchorage', value: 'America/Anchorage' },
  { label: 'America/Halifax', value: 'America/Halifax' },
  { label: 'America/Sao_Paulo', value: 'America/Sao_Paulo' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Paris', value: 'Europe/Paris' },
  { label: 'Europe/Zurich', value: 'Europe/Zurich' },
  { label: 'Europe/Berlin', value: 'Europe/Berlin' },
  { label: 'Asia/Dubai', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
  { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
  { label: 'Australia/Sydney', value: 'Australia/Sydney' },
  { label: 'Pacific/Auckland', value: 'Pacific/Auckland' },
  { label: 'UTC', value: 'UTC' }
]

const objectifsOptions = [
  { label: 'Prise de rendez-vous', value: 'Prise de rendez-vous' },
  { label: 'Qualification de prospects', value: 'Qualification de prospects' },
  { label: 'Vente directe', value: 'Vente directe' },
  { label: 'Relance clients', value: 'Relance clients' },
  { label: 'Sondage', value: 'Sondage' },
  { label: 'Demande d\'information', value: 'Demande d\'information' }
]

const formData = reactive({
  company_name: '',
  domain: '',
  promesse_de_valeur: '',
  confidence_threshold: 0.7,
  agent_name: 'Julie',
  referral_name: '',
  infos: '',
  objectifs: '',
  contact_first_name: '',
  decision_maker_name: '',
  processus_metier: '',
  key_capability: '',
  call_script_example: ''
  ,
  decision_committee: [],
  from_number: '+14752906147',
  pain_point_identifie: '',
  timezone: 'Africa/Porto-Novo'
})

// Pricing estimator state
const plans = ref([])
const selectedPlan = ref('starter')
const estimatedAvgCallSeconds = ref(60)
const estimate = ref(null)

const monthlyCount = ref(0)

const selectedPlanObj = computed(() => plans.value.find(p => p.slug === selectedPlan.value) || null)
const monthlyLimit = computed(() => Number(selectedPlanObj.value?.monthly_campaign_limit || 0))
const remainingSlots = computed(() => Math.max(0, monthlyLimit.value - (monthlyCount.value || 0)))

const loadMonthlyCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const startOfMonth = new Date()
    startOfMonth.setUTCDate(1); startOfMonth.setUTCHours(0,0,0,0)
    const { data, error } = await supabase.from('campaigns').select('id').eq('user_id', user.id).gte('created_at', startOfMonth.toISOString())
    if (!error && Array.isArray(data)) monthlyCount.value = data.length
  } catch (e) {
    // ignore
  }
}

onMounted(() => { loadMonthlyCount() })
watch(selectedPlan, () => { loadMonthlyCount() })

const loadPlans = async () => {
  try {
    const resp = await axios.get('/api/plans')
    plans.value = resp.data || []
    if (plans.value.length > 0) selectedPlan.value = plans.value[0].slug
  } catch (e) {
    // ignore, server may not be configured during local dev
  }
}

const calculateEstimate = async () => {
  try {
    const contactsCount = contacts.value.length || 0
    const resp = await axios.post('/api/preview-cost', {
      contacts_count: contactsCount,
      estimated_avg_call_seconds: estimatedAvgCallSeconds.value,
      plan_slug: selectedPlan.value
    })
    estimate.value = resp.data || null
  } catch (e) {
    estimate.value = null
    console.error('Estimate error', e)
  }
}

// Load plans immediately
loadPlans()

const addCommitteeMember = () => {
  if (committeeMember.value.trim()) {
    formData.decision_committee.push(committeeMember.value.trim())
    committeeMember.value = ''
  }
}

// Fonction pour normaliser le numéro de téléphone au format E.164
const normalizePhoneNumber = (phone) => {
  if (!phone) return ''

  // Retirer tous les espaces, tirets, parenthèses, etc.
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '')

  // Si le numéro commence déjà par +, le garder
  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // Si le numéro commence par 00 (format international), remplacer par +
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.substring(2)
  }

  // Sinon, ajouter simplement le + au début
  return '+' + cleaned
}

// parseCSV using PapaParse for robust handling of quotes and line endings
const parseCSV = (text) => {
  if (!text) return []
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => (h || '').trim().toLowerCase()
  })

  const contactsList = []
  if (!parsed || !parsed.data) return contactsList

  parsed.data.forEach(row => {
    const contact = {}
    // row keys are normalized by transformHeader
    for (const key in row) {
      const raw = (row[key] || '').toString().trim()
      if (!raw) continue
      if (key.includes('nom') || key.includes('name')) contact.nom = raw
      else if (key.includes('email') || key.includes('mail')) contact.email = raw
      else if (key.includes('tel') || key.includes('phone') || key.includes('telephone')) contact.telephone = normalizePhoneNumber(raw)
      else if (key.includes('entreprise') || key.includes('company') || key.includes('societe')) contact.entreprise = raw
    }

    if ((contact.telephone && contact.telephone.trim()) || (contact.email && contact.email.trim())) {
      contactsList.push(contact)
    }
  })

  return contactsList
}

const handleFileUpload = (event) => {
  // Accept both PrimeVue FileUpload `select` event and native input change events
  const file = event && event.files && event.files[0]
    ? event.files[0]
    : (event && event.target && event.target.files && event.target.files[0])

  if (!file) {
    error.value = 'Aucun fichier sélectionné'
    contacts.value = []
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const text = e.target.result
      const parsed = parseCSV(text)
      contacts.value = parsed
      if (contacts.value.length === 0) {
        error.value = 'Aucun contact valide trouvé dans le fichier CSV'
      } else {
        error.value = ''
      }
    } catch (err) {
      console.error('Erreur lecture CSV:', err)
      error.value = 'Erreur lors de la lecture du fichier CSV'
      contacts.value = []
    }
  }
  reader.readAsText(file, 'utf-8')
}

const handleSubmit = async () => {
  // Validation des champs obligatoires marqués par "*" dans le formulaire
  const requiredChecks = [
    { key: 'company_name', label: "Nom de l'entreprise" },
    { key: 'domain', label: "Secteur d'activité" },
    { key: 'promesse_de_valeur', label: 'Promesse de valeur' },
    { key: 'infos', label: 'Description entreprise / service' },
    { key: 'agent_name', label: "Nom de l'agent" },
    { key: 'objectifs', label: 'Objectifs de Prospection' }
  ]

  const missing = requiredChecks
    .filter(r => !(formData[r.key] && String(formData[r.key]).trim().length > 0))
    .map(r => r.label)

  if (contacts.value.length === 0) missing.push('Fichier de contacts (CSV)')

  if (missing.length > 0) {
    const msg = `Veuillez renseigner les champs obligatoires : ${missing.join(', ')}`
    error.value = msg
    try { toast.add({ severity: 'warn', summary: 'Champs manquants', detail: msg, life: 6000 }) } catch (e) {}
    return
  }

  error.value = ''
  success.value = ''
  loading.value = true

  try {
    sendServerLog(`Démarrage de la création de campagne, contacts chargés: ${contacts.value.length}`, { contacts_count: contacts.value.length })
    const { data: { user } } = await supabase.auth.getUser()
    sendServerLog(`Résultat supabase.auth.getUser(): ${user ? user.id : 'aucun user'}`, { user: user ? user.id : null })
    if (!user) throw new Error('Utilisateur non authentifié')

    // Prepare payload to send to server for validation + creation
    const payload = {
      user_id: user.id,
      company_name: formData.company_name,
      domain: formData.domain,
      promesse_de_valeur: formData.promesse_de_valeur,
      confidence_threshold: formData.confidence_threshold || 0.7,
      agent_name: formData.agent_name,
      referral_name: formData.referral_name,
      infos: formData.infos,
      objectifs: formData.objectifs,
      contacts: contacts.value,
      contacts_count: contacts.value.length,
      estimated_avg_call_seconds: Number(estimatedAvgCallSeconds.value) || 60,
      from_number: formData.from_number,
      timezone: formData.timezone
    }

    try {
      const resp = await axios.post('/api/create-campaign', payload, { timeout: 30000 })
      if (resp.status === 201 || resp.status === 202) {
        const msg = `Campagne créée avec succès ! ${contacts.value.length} contacts seront prospectés.`
        success.value = msg
        try { toast.add({ severity: 'success', summary: 'Campagne créée', detail: msg, life: 6000 }) } catch (e) {}
        setTimeout(() => router.push('/'), 2000)
      } else {
        const msg = `Erreur lors de la création de la campagne: ${resp.data && resp.data.error ? resp.data.error : 'erreur inconnue'}`
        error.value = msg
        try { toast.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 8000 }) } catch (e) {}
      }
    } catch (e) {
      if (e?.response?.status === 402) {
        const data = e.response.data || {}
        const msg = data.error || 'Solde insuffisant. Veuillez recharger votre compte.'
        error.value = msg
        try { toast.add({ severity: 'warn', summary: 'Solde insuffisant', detail: msg, life: 8000 }) } catch (t) {}
      } else if (e?.response?.data && e.response.data.error) {
        const msg = e.response.data.error
        error.value = msg
        try { toast.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 8000 }) } catch (t) {}
      } else {
        console.error('Erreur lors de la création de la campagne:', e)
        const msg = 'Erreur lors de la création de la campagne (serveur)'
        error.value = msg
        try { toast.add({ severity: 'error', summary: 'Erreur serveur', detail: msg, life: 8000 }) } catch (t) {}
      }
    }
  } catch (err) {
    console.error('Erreur lors de la construction du batch pour le serveur:', err)
    sendServerLog(`Erreur inattendue lors de la construction du batch: ${err && err.message ? err.message : JSON.stringify(err)}`)
    const msg = err.message || 'Erreur lors de la création de la campagne'
    error.value = msg
    try { toast.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 8000 }) } catch (t) {}
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
