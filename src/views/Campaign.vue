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

      <!-- Messages -->
      <Message
        v-if="error"
        severity="error"
        :closable="true"
        @close="error = ''"
        class="mb-6"
      >
        {{ error }}
      </Message>

      <Message
        v-if="success"
        severity="success"
        :closable="true"
        @close="success = ''"
        class="mb-6"
      >
        {{ success }}
      </Message>

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
                  >Sélectionnez le numéro utilisé pour émettre les appels (choix
                  limité depuis le code).</small
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
                :disabled="loading || contacts.length === 0"
              />
            </div>
          </template>
        </Card>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const router = useRouter()
const contacts = ref([])
const error = ref('')
const success = ref('')
const loading = ref(false)
const committeeMember = ref('')

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

const fromNumberOptions = [
  { label: 'United States', value: '+14752906147' },
  { label: 'Switzerland', value: '+41234567890' }
]

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

const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const contactsList = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const contact = {}

    headers.forEach((header, index) => {
      if (header.includes('nom') || header.includes('name')) {
        contact.nom = values[index] || ''
      } else if (header.includes('email') || header.includes('mail')) {
        contact.email = values[index] || ''
      } else if (header.includes('tel') || header.includes('phone') || header.includes('telephone')) {
        // Normaliser le numéro de téléphone pour ajouter le + si nécessaire
        const rawPhone = values[index] || ''
        contact.telephone = normalizePhoneNumber(rawPhone)
      } else if (header.includes('entreprise') || header.includes('company') || header.includes('societe')) {
        contact.entreprise = values[index] || ''
      }
    })

    if (contact.telephone || contact.email) {
      contactsList.push(contact)
    }
  }

  return contactsList
}

const handleFileUpload = (event) => {
  const file = event.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      contacts.value = parseCSV(e.target.result)
      if (contacts.value.length === 0) {
        error.value = 'Aucun contact valide trouvé dans le fichier CSV'
      } else {
        error.value = ''
      }
    } catch (err) {
      error.value = 'Erreur lors de la lecture du fichier CSV'
      contacts.value = []
    }
  }
  reader.readAsText(file)
}

const handleSubmit = async () => {
  if (contacts.value.length === 0) {
    error.value = 'Veuillez charger un fichier de contacts'
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

    // Valeurs par défaut / normalisation pour les variables optionnelles
    const normalizedFormData = {
      ...formData,
      confidence_threshold: formData.confidence_threshold || 0.7,
      contact_first_name: formData.contact_first_name || 'Monsieur/Madame'
    }

    // Variables destinées à l'agent vocal (strictement selon la spec)
    const agentVariables = {
      // OBLIGATOIRES
      agent_name: normalizedFormData.agent_name,
      company_name: normalizedFormData.company_name,
      domain: normalizedFormData.domain,
      objectifs: normalizedFormData.objectifs,
      promesse_de_valeur: normalizedFormData.promesse_de_valeur,
      infos: normalizedFormData.infos,
      // OPTIONNELLES
      contact_first_name: normalizedFormData.contact_first_name,
      referral_name: normalizedFormData.referral_name || null,
      decision_maker_name: normalizedFormData.decision_maker_name || null,
      processus_metier: normalizedFormData.processus_metier || null,
      key_capability: normalizedFormData.key_capability || null,
      call_script_example: normalizedFormData.call_script_example || null
    }

    const campaignData = {
      variables: agentVariables,
      contacts: contacts.value,
      user_id: user.id,
      created_at: new Date().toISOString(),
      status: 'pending'
    }

    const { data: campaign, error: dbError } = await supabase
      .from('campaigns')
      .insert([{
        user_id: user.id,
        company_name: formData.company_name,
        domain: formData.domain,
        value_proposition: formData.promesse_de_valeur,
        confidence_threshold: typeof normalizedFormData.confidence_threshold === 'number'
          ? normalizedFormData.confidence_threshold
          : parseFloat(normalizedFormData.confidence_threshold),
        agent_name: formData.agent_name,
        referral_name: formData.referral_name,
        infos: formData.infos,
        objectifs: formData.objectifs,
        contacts_count: contacts.value.length,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (dbError) throw dbError
    sendServerLog(`Campagne insérée en base avec id: ${campaign.id}`, { campaign_id: campaign.id })

    // Create batch via server-side endpoint to avoid exposing API keys to the client.
    // Use the from_number selected in the form if present, otherwise fall back to env.
    const retellFromNumber = formData.from_number || import.meta.env.VITE_RETELL_FROM_NUMBER || null

    try {
      sendServerLog('Construction des tâches pour le serveur create-batch...', { contacts_count: contacts.value.length })
      const tasks = contacts.value
        .filter(c => c.telephone)
        .map(c => {
          const t = {
            to_number: c.telephone,
            // We explicitly do NOT set override_agent_id here per requirements
            ignore_e164_validation: false,
            retell_llm_dynamic_variables: {
              ...agentVariables,
              // map referral_name -> referal_name to match API field name expectations
              referal_name: agentVariables.referral_name || null,
              pain_point_identifie: formData.pain_point_identifie || null,
              customer_name: c.nom || agentVariables.contact_first_name,
              contact_company: c.entreprise || '',
              contact_email: c.email || '',
              campaign_id: campaign.id
            }
          }
          return t
        })

      if (tasks.length === 0) {
        console.warn('Aucun numéro de téléphone valide pour créer des tâches Retell.')
        sendServerLog('Aucun numéro de téléphone valide trouvé dans les contacts; aucune tâche créée.', { contacts_count: contacts.value.length })
      } else {
        const batchBody = {
          name: `Campagne ${formData.company_name} - ${new Date().toISOString()}`,
          from_number: retellFromNumber,
          tasks,
          send_now: true,
          trigger_timestamp: Date.now(),
          reserved_concurrency: 1,
          call_time_window: {
            windows: [{ start: 0, end: 1440 }],
            timezone: formData.timezone || 'Africa/Porto-Novo'
          }
        }

        try {
          const url = `${window.location.origin}/create-batch`
          sendServerLog(`Envoi du batch au serveur: ${url}`, { tasks_count: tasks.length })
          sendServerLog(`Batch body keys: ${Object.keys(batchBody)}`, { tasks_sample: tasks.slice(0,3) })
          const resp = await axios.post(url, batchBody, { timeout: 20000 })
          sendServerLog(`Réponse serveur create-batch: status=${resp.status}`, { data: resp.data })

          // If server returned tasks_url (proxying Retell), fetch it to show per-task statuses
          const batchInfo = resp.data || {}
          if (batchInfo.tasks_url) {
            try {
              const tasksResp = await axios.get(batchInfo.tasks_url, { timeout: 10000 })
              const tasksData = typeof tasksResp.data === 'string' ? JSON.parse(tasksResp.data) : tasksResp.data
              sendServerLog('Tasks file fetched after server create-batch', { sample: (tasksData || []).slice(0,5) })
            } catch (fetchErr) {
              sendServerLog('Could not fetch tasks file after server create-batch', { error: fetchErr && fetchErr.message ? fetchErr.message : JSON.stringify(fetchErr) })
            }
          }

          if (!resp || (resp.status < 200 || resp.status >= 300)) {
            error.value = `Erreur serveur create-batch: status ${resp ? resp.status : 'no response'}`
            sendServerLog(`Erreur: réponse non 2xx reçue du serveur create-batch`, { status: resp ? resp.status : null })
          }
        } catch (e) {
          console.error('Erreur lors de l\'envoi au serveur create-batch:', e)
          sendServerLog(`Erreur lors de l'appel serveur create-batch: ${e && e.message ? e.message : JSON.stringify(e)}`)
          error.value = `Erreur lors de l'envoi au service d'appel: ${e && e.message ? e.message : 'erreur inconnue'}`
        }
      }
    } catch (err) {
      console.error('Erreur lors de la construction du batch pour le serveur:', err)
      sendServerLog(`Erreur inattendue lors de la construction du batch: ${err && err.message ? err.message : JSON.stringify(err)}`)
    }

    success.value = `Campagne créée avec succès ! ${contacts.value.length} contacts seront prospectés.`

    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err) {
    error.value = err.message || 'Erreur lors de la création de la campagne'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
