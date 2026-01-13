<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Abonnements</h1>
    <div class="mb-4 text-sm text-gray-600">Choisissez un abonnement adapté à votre usage. Les appels sont facturés à la minute en sus si applicable.</div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="p in uiPlans" :key="p.slug" :class="['p-6 rounded-lg', p.slug === 'pro' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white border']">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span v-if="p.slug === 'free'" class="text-green-500">🟢</span>
              <span v-else-if="p.slug === 'starter' || p.slug === 'standard'" class="text-blue-500">🔵</span>
              <span v-else-if="p.slug === 'pro'" class="text-red-500">🔴</span>
              <h3 class="text-lg font-semibold">{{ p.name }} <span class="text-xs ml-2 text-gray-500">{{ p.tagline || '' }}</span></h3>
            </div>
            <div class="mt-3 text-sm text-gray-200/80">
              <div class="text-xl font-bold">{{ displayMoney(monthlyPriceCents(p)) }} USD</div>
              <div class="text-sm text-gray-400">/ mois</div>
            </div>
          </div>
          <div class="text-right">
            <div v-if="activePlan && (activePlan.plan_slug === p.slug || activePlan.slug === p.slug)" class="text-xs uppercase px-2 py-1 bg-green-600 text-white rounded">Actif</div>
          </div>
        </div>

        <div class="mt-4 text-sm">
          <p v-if="p.objective" class="mb-2"><strong>Objectif :</strong> {{ p.objective }}</p>

          <p class="font-semibold">Inclus</p>
          <ul class="mt-2 space-y-1">
            <li><strong>Prix :</strong> {{ displayMoney(monthlyPriceCents(p)) }} USD</li>
            <li><strong>Minutes incluses :</strong> {{ p.included_minutes || '—' }} / mois <small class="text-gray-500">(non reportables)</small></li>
            <li><strong>Concurrency :</strong> {{ p.max_concurrency || p.concurrency || '—' }}</li>
            <li v-if="p.minutes_expiry_days"><strong>Expiration des minutes :</strong> {{ p.minutes_expiry_days }} jours</li>
            <li><strong>Carte bancaire requise :</strong> <span v-if="p.card_required">✅</span><span v-else>❌</span></li>
            <li><strong>Priorité réseau :</strong> {{ p.network_priority || 'standard' }}</li>
            <li><strong>Soft limit :</strong> {{ p.soft_limit_percent || '—' }}%</li>
            <li>Throttling après dépassement</li>
          </ul>

          <p class="mt-3 font-semibold">Au-delà</p>
          <ul class="mt-2 space-y-1">
            <li><strong>Facturation :</strong> {{ displayMoney(p.per_min_cents || 0) }} USD / minute</li>
          </ul>

          <p class="mt-3 font-semibold">Options</p>
          <ul class="mt-2 space-y-1 text-sm text-gray-700">
            <li v-if="p.has_dedicated_number">Numéro dédié sur demande (add-on)</li>
            <li v-if="p.has_extra_concurrency">Concurrency supplémentaire (add-on)</li>
            <li v-if="!p.has_dedicated_number">Pas de numéro dédié</li>
          </ul>

          <p v-if="p.description" class="mt-3 text-xs text-gray-500">{{ p.description }}</p>

        </div>

        <div class="mt-4">
          <template v-if="p.slug !== 'free'">
            <div class="flex items-center gap-2">
              <button @click="subscribe(p)" :disabled="isPlanActive(p) || isLoading" :class="(p.slug === 'pro' ? 'bg-white text-blue-700 px-4 py-2 rounded' : 'bg-blue-600 text-white px-4 py-2 rounded') + (isPlanActive(p) || isLoading ? ' opacity-50 cursor-not-allowed' : '')">{{ isPlanActive(p) ? 'Abonné' : 'S\'abonner' }}</button>
              <button v-if="p.slug !== 'free'" @click="openAddons(p)" class="px-3 py-2 border rounded text-sm">Add-ons</button>
            </div>
          </template>
          <template v-else>
            <span class="px-4 py-2 border rounded text-sm text-gray-600">Plan gratuit</span>
          </template>
        </div>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="showAddonsDialog" :modal="true" :style="{ width: '480px' }" header="Add-ons">
    <div v-if="selectedPlanForAddons">
      <p class="mb-3"><strong>Add-ons pour:</strong> {{ selectedPlanForAddons.name }} ({{ selectedPlanForAddons.slug }})</p>
      <ul class="mb-4">
        <li v-if="selectedPlanForAddons.has_dedicated_number">Numéro dédié disponible</li>
        <li v-if="selectedPlanForAddons.has_extra_concurrency">Concurrency supplémentaire disponible</li>
        <li v-if="!selectedPlanForAddons.has_dedicated_number && !selectedPlanForAddons.has_extra_concurrency">Aucun add-on disponible pour ce plan.</li>
      </ul>
      <div class="flex gap-2">
        <button v-if="selectedPlanForAddons.has_dedicated_number" @click="requestAddon('dedicated_number')" class="px-3 py-2 bg-blue-600 text-white rounded">Demander un numéro dédié</button>
        <button v-if="selectedPlanForAddons.has_extra_concurrency" @click="requestAddon('extra_concurrency')" class="px-3 py-2 bg-blue-600 text-white rounded">Demander plus de concurrency</button>
        <button @click="requestAddon('support')" class="px-3 py-2 border rounded">Contacter le support</button>
        <button @click="closeAddonsDialog" class="px-3 py-2 border rounded">Fermer</button>
      </div>
    </div>
  </Dialog>
</template>

<script>
import axios from 'axios'
import { supabase } from '../lib/supabase'

export default {
  name: 'Pricing',
  components: { Dialog },
  data() {
    return {
      uiPlans: [
        { slug: 'free', name: 'Starter', monthly_price: 0.00, per_min_cents: 30, concurrency: 5, included_minutes: 20 },
        { slug: 'standard', name: 'Standard', monthly_price: 19.00, per_min_cents: 30, concurrency: 10, included_minutes: 200 },
        { slug: 'pro', name: 'Pro', monthly_price: 49.00, per_min_cents: 30, concurrency: 20, included_minutes: 1000 }
      ],
      activePlan: null,
      balanceCents: 0,
      balanceLoading: true,
      approvalLink: null,
      isLoading: false,
      estimatorMinutes: {},
      defaultEstimateMinutes: 10,
      supportEmail: '',
      supportLoading: false,
      showAddonsDialog: false,
      selectedPlanForAddons: null
    }
  },
  async created() {
    await Promise.all([this.fetchPlans(), this.fetchBalance(), this.fetchActivePlan()])
    await this.fetchSupportEmail()
  },
  mounted() {
    window.addEventListener('balance:updated', this.fetchBalance)
    window.addEventListener('plan:updated', this.fetchActivePlan)
  },
  unmounted() {
    window.removeEventListener('balance:updated', this.fetchBalance)
    window.removeEventListener('plan:updated', this.fetchActivePlan)
  },
  methods: {
    monthlyPriceCents(plan) {
      if (plan == null) return 0
      if (typeof plan.monthly_price === 'number') return Math.round(plan.monthly_price * 100)
      if (typeof plan.monthly_price_cents === 'number') return Math.round(plan.monthly_price_cents)
      return 0
    },
    async fetchPlans() {
      try {
        // DB stores monthly_price_cents and per_min_cents as cents
            const { data, error } = await supabase.from('plans').select('slug,name,monthly_price_cents,per_min_cents,max_concurrency,included_minutes,description,tagline,objective,minutes_expiry_days,card_required,network_priority,soft_limit_percent,has_dedicated_number,has_extra_concurrency')
            if (!error && Array.isArray(data) && data.length) {
              this.uiPlans = data.map(p => ({
                slug: p.slug,
                name: p.name,
                monthly_price: (Number(p.monthly_price_cents) || 0) / 100,
                monthly_price_cents: Number(p.monthly_price_cents) || 0,
                per_min_cents: Number(p.per_min_cents) || 0,
                concurrency: Number(p.max_concurrency) || Number(p.concurrency) || 0,
                max_concurrency: Number(p.max_concurrency) || 0,
                included_minutes: Number(p.included_minutes) || 0,
                description: p.description || '',
                tagline: p.tagline || '',
                objective: p.objective || '',
                minutes_expiry_days: p.minutes_expiry_days || null,
                card_required: p.card_required === true,
                network_priority: p.network_priority || 'standard',
                soft_limit_percent: p.soft_limit_percent || null,
                has_dedicated_number: p.has_dedicated_number === true,
                has_extra_concurrency: p.has_extra_concurrency === true
              }))
          this.uiPlans.forEach(p => { this.estimatorMinutes[p.slug] = this.defaultEstimateMinutes })
        } else {
          this.uiPlans.forEach(p => { this.estimatorMinutes[p.slug] = this.defaultEstimateMinutes })
        }
      } catch (e) {
        console.error('fetchPlans error', e)
        this.uiPlans.forEach(p => { this.estimatorMinutes[p.slug] = this.defaultEstimateMinutes })
      }
    },
    async fetchBalance() {
      this.balanceLoading = true
      try {
        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}
        if (!user_id) { this.balanceCents = 0; this.balanceLoading = false; return }

        const { data, error } = await supabase.from('user_credits').select('amount')
          .eq('user_id', user_id)

        if (!error && Array.isArray(data)) {
          const sum = data.reduce((s, r) => s + (Number(r.amount) || 0), 0)
          this.balanceCents = Math.round(sum * 100)
        } else {
          this.balanceCents = 0
        }
      } catch (e) {
        console.error('Could not fetch balance', e)
        this.balanceCents = 0
      } finally { this.balanceLoading = false }
    },
    async fetchActivePlan() {
      try {
        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}
        if (!user_id) return
        const resp = await fetch(`/api/user-plan?user_id=${user_id}`)
        if (!resp.ok) return
        const json = await resp.json()
        this.activePlan = json.plan || null
      } catch (e) {
        // ignore
      }
    },
    async subscribe(plan) {
      try {
        this.isLoading = true
        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}

        // If user already on this plan, prevent duplicate subscribe
        if (this.isPlanActive(plan)) {
          this.$toast.add({ severity: 'info', summary: 'Abonnement', detail: 'Vous êtes déjà abonné à ce plan.', life: 4000 })
          return
        }

        // If this is a downgrade while current plan is active, ask for confirmation via PrimeVue confirm
        if (this.activePlan && this.isDowngrade(plan)) {
          this.$confirm({
            message: 'Vous changez vers un plan moins avantageux. Cette action peut être irréversible. Voulez-vous continuer ?',
            header: 'Confirmer la modification',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => { await this.performSubscribe(plan, user_id) },
            reject: () => { /* no-op */ }
          })
        } else {
          await this.performSubscribe(plan, user_id)
        }
      } catch (e) {
        console.error('subscribe error', e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la création de la souscription: ' + (e?.response?.data?.error || e.message || e), life: 8000 })
      } finally { this.isLoading = false }
    },

    async performSubscribe(plan, user_id) {
      try {
        const amountCents = Math.round(plan.monthly_price * 100)
        const resp = await axios.post('/api/subscribe', { plan_slug: plan.slug, amount_cents: amountCents, user_id })
        const order = resp.data
        const link = (order?.links || []).find(l => l.rel === 'approve')
        this.approvalLink = link ? link.href : null
        if (!this.approvalLink) {
          this.$toast.add({ severity: 'error', summary: 'Erreur', detail: "Impossible d'obtenir le lien PayPal d'approbation", life: 6000 })
        } else {
          if (amountCents > (this.balanceCents || 0)) {
            this.$toast.add({ severity: 'warn', summary: 'Solde insuffisant', detail: 'Votre solde est insuffisant pour ce plan. Vous serez redirigé vers PayPal pour compléter le paiement.', life: 6000 })
          }
          window.location.href = this.approvalLink
        }
      } catch (e) {
        throw e
      }
    },
    isPlanActive(plan) {
      try {
        if (!this.activePlan) return false
        const slug = this.activePlan.plan_slug || this.activePlan.slug || null
        return slug && slug === plan.slug
      } catch (e) { return false }
    },
    isDowngrade(targetPlan) {
      try {
        if (!this.activePlan) return false
        const currentSlug = this.activePlan.plan_slug || this.activePlan.slug || null
        if (!currentSlug) return false
        const current = this.uiPlans.find(p => p.slug === currentSlug)
        const target = this.uiPlans.find(p => p.slug === targetPlan.slug)
        if (!current || !target) return false
        // consider downgrade when target monthly price is lower than current
        return Number(target.monthly_price || 0) < Number(current.monthly_price || 0)
      } catch (e) { return false }
    },
    
    estimateCostCents(plan, minutes) {
      const m = Number(minutes) || 0
      return Math.round((Number(plan.per_min_cents) || 0) * m)
    },
    displayMoney(cents) {
      return ((Number(cents) || 0) / 100).toFixed(2)
    },
    needsTopupCents(plan, minutes) {
      const m = Number(minutes) || 0
      const included = Number(plan.included_minutes) || 0
      const billable = Math.max(0, m - included)
      const billableCents = this.estimateCostCents(plan, billable)
      return Math.max(0, billableCents - this.balanceCents)
    }
    ,
    async fetchSupportEmail() {
      this.supportLoading = true
      try {
        const resp = await axios.get('/api/app-settings/support-email')
        this.supportEmail = resp.data?.support_email || ''
      } catch (e) {
        this.supportEmail = ''
      } finally { this.supportLoading = false }
    },
    async openAddons(plan) {
      try {
        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}
        if (!user_id) {
          this.$toast.add({ severity: 'warn', summary: 'Connexion requise', detail: 'Veuillez vous connecter pour demander un add-on.', life: 5000 })
          this.$router.push({ name: 'Login' })
          return
        }
        this.selectedPlanForAddons = plan
        this.showAddonsDialog = true
      } catch (e) {
        console.error('openAddons error', e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d\'ouvrir les add-ons.', life: 5000 })
      }
    }

    ,

    async requestAddon(type) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user_id = session?.user?.id || 'unknown'
        const plan = this.selectedPlanForAddons
        const subject = encodeURIComponent(`Demande d'add-on: ${type} pour ${plan?.slug || ''}`)
        const body = encodeURIComponent(`Utilisateur: ${user_id}\nPlan: ${plan?.slug || ''}\nAdd-on: ${type}\nMerci.`)
        const to = (this.supportEmail && String(this.supportEmail).length) ? this.supportEmail : 'support@prospector.example'
        window.location.href = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`
        this.$toast.add({ severity: 'success', summary: 'Demande', detail: 'Ouverture du client mail pour contacter le support', life: 5000 })
        this.showAddonsDialog = false
        this.selectedPlanForAddons = null
      } catch (e) {
        console.error('requestAddon error', e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de lancer la demande.', life: 5000 })
      }
    },

    closeAddonsDialog() {
      this.showAddonsDialog = false
      this.selectedPlanForAddons = null
    }
  }
}
</script>

 

