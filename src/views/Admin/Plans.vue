<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">
              <i class="pi pi-cog mr-2 text-blue-600"></i>Administration
            </h1>
            <p class="text-gray-600 mt-2">Gestion des plans, paramètres et numéros dédiés</p>
          </div>
          <div class="flex gap-2">
            <button @click="clearAdminToken" class="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">
              <i class="pi pi-sign-out mr-2"></i>Déconnecter
            </button>
            <button @click="loadAll" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <i class="pi pi-refresh mr-2"></i>Rafraîchir
            </button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <Message v-if="pageError" severity="error" :closable="true" @close="pageError = null" class="mb-6">
        <div>
          <strong>Erreur d'accès administrateur</strong>
          <p class="mt-2">{{ pageError }}</p>
          <button @click="retryAdminCheck" class="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
            <i class="pi pi-refresh mr-1"></i>Réessayer
          </button>
        </div>
      </Message>

      <!-- Admin Status Info -->
      <Card v-if="adminStatus" class="mb-6 shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
        <template #header>
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-t-lg">
            <h3 class="text-white font-semibold flex items-center gap-2">
              <i class="pi pi-shield"></i>Statut Administrateur
            </h3>
          </div>
        </template>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p class="text-sm text-gray-600">Compte administrateur</p>
            <p class="text-lg font-semibold text-gray-900">{{ adminStatus.admin_email || 'Non configuré' }}</p>
          </div>
          <Tag 
            :value="adminStatus.initialized ? 'Activé' : 'Non initialisé'" 
            :severity="adminStatus.initialized ? 'success' : 'warning'"
            class="text-center"
          />
        </div>
      </Card>

      <!-- Dedicated Numbers Requests -->
      <Card class="mb-6 shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
        <template #header>
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 rounded-t-lg">
            <h3 class="text-white font-semibold flex items-center gap-2">
              <i class="pi pi-phone"></i>Demandes de Numéros Dédiés
              <Badge v-if="dedicatedRequests.length > 0" :value="dedicatedRequests.length" severity="danger" />
            </h3>
          </div>
        </template>
        <div v-if="requestsLoading" class="flex justify-center py-8">
          <ProgressSpinner style="width:40px; height:40px" />
        </div>
        <div v-else>
          <div v-if="dedicatedRequests.length === 0" class="text-center py-8 text-gray-500">
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p>Aucune demande en attente</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="r in dedicatedRequests" :key="r.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-gray-900">{{ r.user_id }}</span>
                    <Tag :value="r.country_code" severity="info" />
                  </div>
                  <p class="text-sm text-gray-500">{{ formatDate(r.created_at) }}</p>
                </div>
                <div class="flex gap-2">
                  <button 
                    @click="showApproveDialog(r)" 
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    <i class="pi pi-check mr-1"></i>Approuver
                  </button>
                  <button 
                    @click="rejectRequest(r)" 
                    class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                  >
                    <i class="pi pi-times mr-1"></i>Rejeter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Configuration -->
      <Card class="mb-6 shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
        <template #header>
          <div class="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6 rounded-t-lg">
            <h3 class="text-white font-semibold flex items-center gap-2">
              <i class="pi pi-sliders-h"></i>Configuration Générale
            </h3>
          </div>
        </template>
        <div class="space-y-6">
          <!-- Support Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              <i class="pi pi-envelope mr-2 text-green-600"></i>Email de Support
            </label>
            <div class="flex gap-2">
              <InputText 
                v-model="supportEmail" 
                placeholder="support@example.com" 
                type="email"
                class="flex-1"
              />
              <button 
                @click="saveSupportEmail" 
                :disabled="supportLoading" 
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
              >
                <i class="pi pi-save mr-1"></i>Enregistrer
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">Utilisé par la page Pricing pour les demandes de support</p>
          </div>

          <!-- Admin Credentials -->
          <Divider />
          <div>
            <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="pi pi-lock text-red-600"></i>Sécurité Administrateur
            </h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nouvel Email Admin</label>
                <InputText 
                  v-model="adminEmailInput" 
                  placeholder="admin@example.com" 
                  type="email"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau Mot de Passe</label>
                <Password 
                  v-model="adminPasswordInput" 
                  placeholder="••••••••"
                  toggle-mask
                  class="w-full"
                  input-class="w-full"
                />
              </div>
              <button 
                @click="saveAdminCredentials" 
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium w-full"
              >
                <i class="pi pi-shield mr-1"></i>Mettre à jour les Identifiants
              </button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Plans Management -->
      <div v-if="!plans || plans.length === 0" class="text-center py-12">
        <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">Aucun plan trouvé</p>
      </div>
      <div v-else class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          <i class="pi pi-list mr-2 text-blue-600"></i>Plans de Facturation
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card 
            v-for="p in plans" 
            :key="p.slug" 
            class="shadow-md border-0 hover:shadow-lg transition"
            :pt="{ content: { class: 'p-4 sm:p-6' } }"
          >
            <template #header>
              <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 sm:p-6 rounded-t-lg">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-white text-xl font-bold">{{ p.name }}</h3>
                    <p class="text-indigo-100 text-sm">{{ p.slug }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-indigo-100 text-xs">Prix mensuel</p>
                    <p class="text-white text-2xl font-bold">${{ (editable[p.slug].monthly_price).toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-sm text-gray-600">{{ p.description }}</p>
              <Divider />
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-semibold text-gray-700 block mb-1">
                    <i class="pi pi-dollar mr-1 text-green-600"></i>Prix / Mois (USD)
                  </label>
                  <InputNumber 
                    v-model="editable[p.slug].monthly_price" 
                    input-id="price"
                    prefix="$"
                    :min="0"
                    :step="0.01"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 block mb-1">
                    <i class="pi pi-clock mr-1 text-blue-600"></i>Minutes Incluses
                  </label>
                  <InputNumber 
                    v-model="editable[p.slug].included_minutes" 
                    input-id="minutes"
                    :min="0"
                    :step="1"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 block mb-1">
                    <i class="pi pi-chart-bar mr-1 text-purple-600"></i>Surplus (cents/min)
                  </label>
                  <InputNumber 
                    v-model="editable[p.slug].per_min_cents" 
                    input-id="overage"
                    :min="0"
                    :step="1"
                  />
                </div>
              </div>
              <Divider />
              <div class="flex gap-2 pt-2">
                <button 
                  @click="save(p.slug)" 
                  class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <i class="pi pi-save mr-1"></i>Enregistrer
                </button>
                <button 
                  @click="reset(p.slug)" 
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  <i class="pi pi-undo mr-1"></i>Annuler
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Approve Dialog -->
    <Dialog 
      v-model:visible="showApproveForm" 
      header="Approuver la Demande"
      modal
      :style="{ width: '90vw', maxWidth: '400px' }"
    >
      <div class="space-y-4">
        <div>
          <label class="text-sm font-semibold text-gray-700 block mb-2">Numéro Attribué (E.164)</label>
          <InputText 
            v-model="approveDialogData.number" 
            placeholder="+33123456789"
            class="w-full"
          />
          <p class="text-xs text-gray-500 mt-1">Format: +[indicatif][numéro]</p>
        </div>
        <div class="flex gap-2 pt-4">
          <button 
            @click="approveRequest" 
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <i class="pi pi-check mr-1"></i>Approuver
          </button>
          <button 
            @click="showApproveForm = false" 
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <i class="pi pi-times mr-1"></i>Annuler
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import axios from 'axios'
import { supabase } from '../../lib/supabase'
import Message from 'primevue/message'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Password from 'primevue/password'
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'

export default {
  name: 'AdminPlans',
  components: { Message, Card, Badge, Tag, InputText, InputNumber, Password, Divider, Dialog, ProgressSpinner },
  data() { 
    return { 
      plans: [], 
      loading: true, 
      editable: {}, 
      supportEmail: '', 
      supportLoading: false, 
      adminEmailInput: '', 
      adminPasswordInput: '', 
      pageError: null, 
      adminStatus: null, 
      dedicatedRequests: [], 
      requestsLoading: false,
      showApproveForm: false,
      approveDialogData: { request: null, number: '' }
    } 
  },
  async created() {
    try {
      const token = localStorage.getItem('admin_token')
      const headers = token ? { 'x-admin-token': token } : {}
      const resp = await axios.get('/api/admin/check', { headers })
      if (!resp.data || !resp.data.ok) {
        this.pageError = 'Accès refusé: accès administrateur requis. Connectez-vous via /admin.'
        return
      }
      if (token) axios.defaults.headers.common['x-admin-token'] = token
    } catch (e) {
      console.error('admin check failed', e)
      this.pageError = 'Erreur lors de la vérification d\'accès administrateur.'
      return
    }
    await this.loadAll()
  },
  methods: {
    async loadAll() {
      await Promise.all([
        this.load(),
        this.loadDedicatedRequests(),
        this.fetchSupportEmail(),
        this.loadAdminStatus()
      ])
    },
    async loadAdminStatus() {
      try {
        const status = await axios.get('/api/admin/status')
        this.adminStatus = status.data || null
      } catch (e) { console.error('admin status fetch failed', e) }
    },
    async load() {
      this.loading = true
      this.pageError = null
      try {
        const { data, error } = await supabase.from('plans').select('*').order('monthly_price_cents', { ascending: true })
        if (error) {
          console.error('fetch plans error', error)
          this.pageError = 'Erreur lors du chargement des plans: ' + (error.message || JSON.stringify(error))
        } else if (Array.isArray(data)) {
          this.plans = data
          data.forEach(p => {
            this.editable[p.slug] = {
              monthly_price: (p.monthly_price_cents || 0) / 100,
              included_minutes: p.included_minutes || 0,
              per_min_cents: p.per_min_cents || 0
            }
          })
        }
      } catch (e) {
        console.error(e)
        this.pageError = 'Erreur inattendue: ' + (e?.message || String(e))
      } finally { this.loading = false }
    },
    reset(slug) { 
      if (this.plans) {
        const p = this.plans.find(x => x.slug === slug)
        if (p) this.editable[slug] = { monthly_price: (p.monthly_price_cents || 0)/100, included_minutes: p.included_minutes||0, per_min_cents: p.per_min_cents||0 }
      } 
    },
    async save(slug) {
      try {
        const ed = this.editable[slug]
        const body = {
          slug,
          monthly_price_cents: Math.round(Number(ed.monthly_price || 0) * 100),
          included_minutes: Number(ed.included_minutes || 0),
          per_min_cents: Number(ed.per_min_cents || 0)
        }
        const resp = await axios.post('/api/admin/plan-upsert', body)
        if (resp.data && resp.data.ok) {
          this.$toast.add({ severity: 'success', summary: 'Enregistré', detail: 'Plan mis à jour', life: 4000 })
          await this.load()
        } else {
          this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour le plan', life: 6000 })
        }
      } catch (e) { 
        console.error(e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 }) 
      }
    },
    async fetchSupportEmail() {
      this.supportLoading = true
      try {
        const resp = await axios.get('/api/app-settings/support-email')
        this.supportEmail = resp.data?.support_email || ''
      } catch (e) {
        console.error('fetchSupportEmail failed', e)
        this.supportEmail = ''
      } finally { this.supportLoading = false }
    },
    async saveAdminCredentials() {
      try {
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}
        const resp = await axios.post('/api/admin/set-admin-credentials', { email: this.adminEmailInput, password: this.adminPasswordInput }, { headers })
        if (resp.data && resp.data.ok) {
          this.$toast.add({ severity: 'success', summary: 'Enregistré', detail: 'Identifiants admin mis à jour', life: 4000 })
          this.adminEmailInput = ''
          this.adminPasswordInput = ''
        } else {
          this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour', life: 6000 })
        }
      } catch (e) {
        console.error('saveAdminCredentials failed', e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 })
      }
    },
    clearAdminToken() {
      if (confirm('Êtes-vous sûr? Vous serez déconnecté.')) {
        localStorage.removeItem('admin_token')
        delete axios.defaults.headers.common['x-admin-token']
        this.$toast.add({ severity: 'info', summary: 'Déconnecté', detail: 'Session admin déconnectée', life: 3000 })
        this.$router.push('/admin')
      }
    },
    async loadDedicatedRequests() {
      this.requestsLoading = true
      try {
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}
        const resp = await axios.get('/api/admin/dedicated-number-requests', { headers })
        this.dedicatedRequests = (resp.data && resp.data.requests) ? resp.data.requests : []
      } catch (e) {
        console.error('loadDedicatedRequests failed', e)
        this.dedicatedRequests = []
      } finally { this.requestsLoading = false }
    },
    showApproveDialog(r) {
      this.approveDialogData = { request: r, number: '' }
      this.showApproveForm = true
    },
    async approveRequest() {
      const r = this.approveDialogData.request
      const assigned = this.approveDialogData.number.trim()
      
      if (!assigned) {
        this.$toast.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez entrer un numéro valide', life: 4000 })
        return
      }
      
      try {
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}
        const resp = await axios.post('/api/admin/approve-dedicated-number', { request_id: r.id, assigned_number: assigned }, { headers })
        if (resp.data && resp.data.ok) {
          this.$toast.add({ severity: 'success', summary: 'Approuvé', detail: 'Numéro attribué avec succès', life: 4000 })
          this.showApproveForm = false
          await this.loadDedicatedRequests()
        } else {
          this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Échec', life: 6000 })
        }
      } catch (e) { 
        console.error(e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 }) 
      }
    },
    async rejectRequest(r) {
      try {
        if (!confirm('Confirmer le rejet de la demande ?')) return
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}
        const resp = await axios.post('/api/admin/reject-dedicated-number', { request_id: r.id }, { headers })
        if (resp.data && resp.data.ok) {
          this.$toast.add({ severity: 'success', summary: 'Rejeté', detail: 'Demande rejetée', life: 4000 })
          await this.loadDedicatedRequests()
        }
      } catch (e) { 
        console.error(e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 }) 
      }
    },
    async saveSupportEmail() {
      try {
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}
        const resp = await axios.post('/api/admin/app-settings', { key: 'support_email', value: this.supportEmail }, { headers })
        if (resp.data && resp.data.ok) {
          this.$toast.add({ severity: 'success', summary: 'Enregistré', detail: 'Email de support mis à jour', life: 4000 })
        } else {
          this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'enregistrer', life: 6000 })
        }
      } catch (e) {
        console.error('saveSupportEmail failed', e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 })
      }
    },
    retryAdminCheck() {
      this.pageError = null
      this.$router.replace({ path: this.$route.path, query: Object.assign({}, this.$route.query, { t: Date.now() }) })
    },
    formatDate(d) { 
      try { 
        return new Date(d).toLocaleString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
      } catch (e) { 
        return d 
      } 
    }
  }
}
</script>

<style scoped>
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-password-input) {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
</style>
