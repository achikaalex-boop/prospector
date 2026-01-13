<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Admin — Plans</h1>
    <div v-if="loading">Chargement...</div>
    <div v-else>
      <Message v-if="pageError" severity="error" :closable="false" class="mb-4">
        {{ pageError }}
        <div class="mt-2">
          <button @click.prevent="retryAdminCheck" class="px-3 py-1 border rounded">Re-tester l'accès admin</button>
        </div>
      </Message>
      <div v-if="adminStatus && adminStatus.initialized === false" class="mb-4 text-sm text-gray-600">Administration non initialisée. Vous pouvez <router-link to="/admin">initialiser</router-link> un compte admin.</div>
      <div v-if="adminStatus && adminStatus.admin_email" class="mb-4 text-sm text-gray-600">Compte admin: <strong>{{ adminStatus.admin_email }}</strong></div>
        <div class="mb-4 bg-white p-4 rounded shadow">
          <h3 class="font-semibold mb-2">Accorder un add-on à un utilisateur</h3>
          <div class="grid grid-cols-3 gap-2">
            <input v-model="addonForm.user_id" placeholder="user_id" class="p-2 border rounded col-span-1" />
            <select v-model="addonForm.addon_key" class="p-2 border rounded col-span-1">
              <option value="dedicated_number">dedicated_number</option>
              <option value="extra_concurrency">extra_concurrency</option>
            </select>
            <input v-model="addonForm.value" placeholder="value (json)" class="p-2 border rounded col-span-1" />
          </div>
          <div class="mt-2">
            <button @click="grantAddon" class="bg-blue-600 text-white px-3 py-1 rounded">Accorder add-on</button>
          </div>
        </div>

        <div class="mb-4 bg-white p-4 rounded shadow">
          <h3 class="font-semibold mb-2">Sécurité admin</h3>
          <p class="text-sm text-gray-600">Changez l'email et le mot de passe administrateur ci-dessous.</p>
          <label class="text-xs">Email admin</label>
          <input v-model="adminEmailInput" placeholder="admin@..." class="w-full p-2 border rounded mb-2" />
          <label class="text-xs">Nouveau mot de passe</label>
          <input v-model="adminPasswordInput" type="password" placeholder="mot de passe" class="w-full p-2 border rounded mb-2" />
          <div class="flex gap-2">
            <button @click="saveAdminCredentials" class="bg-green-600 text-white px-3 py-1 rounded">Enregistrer identifiants</button>
            <button @click="clearAdminToken" class="px-3 py-1 border rounded">Déconnecter session admin</button>
          </div>
        </div>

      <div class="mb-4 bg-white p-4 rounded shadow">
        <h3 class="font-semibold mb-2">Configuration</h3>
        <label class="text-xs">Email support</label>
        <div class="flex gap-2 mt-2">
          <input v-model="supportEmail" placeholder="support@..." class="p-2 border rounded flex-1" />
          <button @click="saveSupportEmail" :disabled="supportLoading" class="bg-green-600 text-white px-3 py-1 rounded">Enregistrer</button>
        </div>
        <p class="text-xs text-gray-500 mt-2">L'adresse ci-dessus est utilisée par la page <strong>Pricing</strong> pour l'envoi d'emails de support.</p>
      </div>

      <div v-if="!plans || plans.length === 0" class="mb-4 bg-white p-4 rounded shadow">
        <div class="text-sm text-gray-600">Aucun plan trouvé.</div>
      </div>
      <div v-else>
        <div v-for="p in plans" :key="p.slug" class="mb-4 bg-white p-4 rounded shadow">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-lg font-semibold">{{ p.name }} <span class="text-sm text-gray-500">({{ p.slug }})</span></div>
              <div class="text-sm text-gray-600">{{ p.description }}</div>
            </div>
            <div class="w-64">
              <label class="text-xs">Prix / mois (USD)</label>
              <input type="number" v-model.number="editable[p.slug].monthly_price" class="w-full p-2 border rounded" />
              <label class="text-xs">Minutes incluses</label>
              <input type="number" v-model.number="editable[p.slug].included_minutes" class="w-full p-2 border rounded" />
              <label class="text-xs">Overage (cents/min)</label>
              <input type="number" v-model.number="editable[p.slug].per_min_cents" class="w-full p-2 border rounded" />
              <div class="flex gap-2 mt-2">
                <button @click="save(p.slug)" class="bg-green-600 text-white px-3 py-1 rounded">Enregistrer</button>
                <button @click="reset(p.slug)" class="bg-gray-200 px-3 py-1 rounded">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { supabase } from '../../lib/supabase'
import Message from 'primevue/message'
export default {
  name: 'AdminPlans',
  components: { Message },
  data() { return { plans: [], loading: true, editable: {}, supportEmail: '', supportLoading: false, adminEmailInput: '', adminPasswordInput: '', pageError: null, adminStatus: null } },
  async created() {
    // ensure admin access (supports admin token stored in localStorage)
    try {
      const token = localStorage.getItem('admin_token')
      const headers = token ? { 'x-admin-token': token } : {}
      const resp = await axios.get('/api/admin/check', { headers })
      if (!resp.data || !resp.data.ok) {
        // show inline error instead of immediate redirect so user sees why it's blank
        this.pageError = 'Accès refusé: accès administrateur requis. Connectez-vous via /admin.'
        return
      }
      if (token) axios.defaults.headers.common['x-admin-token'] = token
    } catch (e) {
      console.error('admin check failed', e)
      this.pageError = 'Erreur lors de la vérification d\'accès administrateur.'
      return
    }
    await this.load()
    this.addonForm = { user_id: '', addon_key: 'dedicated_number', value: '' }
    await this.fetchSupportEmail()
    try {
      const status = await axios.get('/api/admin/status')
      this.adminStatus = status.data || null
    } catch (e) { /* ignore */ }
  },
  methods: {
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
    reset(slug) { if (this.plans) {
      const p = this.plans.find(x => x.slug === slug)
      if (p) this.editable[slug] = { monthly_price: (p.monthly_price_cents || 0)/100, included_minutes: p.included_minutes||0, per_min_cents: p.per_min_cents||0 }
    } },
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
      } catch (e) { console.error(e); this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 }) }
    }
    ,
    async grantAddon() {
      try {
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}
        const body = { user_id: this.addonForm.user_id, addon_key: this.addonForm.addon_key, value: this.addonForm.value ? JSON.parse(this.addonForm.value) : null }
        const resp = await axios.post('/api/admin/grant-addon', body, { headers })
        if (resp.data && resp.data.ok) {
          this.$toast.add({ severity: 'success', summary: 'OK', detail: 'Add-on accordé', life: 4000 })
          this.addonForm = { user_id: '', addon_key: 'dedicated_number', value: '' }
        } else {
          this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Échec', life: 6000 })
        }
      } catch (e) { console.error(e); this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 }) }
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
        } else {
          this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour', life: 6000 })
        }
      } catch (e) {
        console.error('saveAdminCredentials failed', e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 })
      }
    },

    clearAdminToken() {
      localStorage.removeItem('admin_token')
      delete axios.defaults.headers.common['x-admin-token']
      this.$toast.add({ severity: 'info', summary: 'Déconnecté', detail: 'Session admin déconnectée localement', life: 3000 })
    },

    retryAdminCheck() {
      this.pageError = null
      // simple re-run: reload the page (or re-run created logic by pushing to self)
      this.$router.replace({ path: this.$route.path, query: Object.assign({}, this.$route.query, { t: Date.now() }) })
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
    }
  }
}
</script>
