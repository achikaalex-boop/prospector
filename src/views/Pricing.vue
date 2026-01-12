<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Abonnements</h1>
    <div class="mb-4 text-sm text-gray-600">Choisissez un abonnement. Les appels sont facturés à la minute en plus si applicable.</div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="p in uiPlans" :key="p.slug" :class="['p-6 rounded-lg', p.slug === 'pro' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white border']">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ p.name }}</h3>
          <div class="flex items-center gap-2">
            <span v-if="p.slug === 'pro'" class="text-xs uppercase px-2 py-1 bg-white/20 rounded">Populaire</span>
            <span v-if="activePlan && (activePlan.plan_slug === p.slug || activePlan.slug === p.slug)" class="text-xs uppercase px-2 py-1 bg-green-600 text-white rounded">Actif</span>
          </div>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-bold">${{ p.monthly_price.toFixed(2) }}</div>
          <div class="text-sm text-gray-200/80">/ mois</div>
        </div>
        <ul class="mt-4 text-sm">
          <li>Concurrency: <strong>{{ p.concurrency }}</strong></li>
          <li>Coût par minute: <strong>{{ displayMoney(p.per_min_cents) }} USD</strong></li>
          <li v-if="p.included_minutes">Minutes inclues: <strong>{{ p.included_minutes }}</strong></li>
        </ul>

          <div class="mt-4 bg-gray-50 p-3 rounded text-black">
            <label class="text-sm">Estimation d'appel (minutes)</label>
            <div class="mt-2 flex items-center gap-2">
              <input type="number" min="0" :value="estimatorMinutes[p.slug]" @input="(e)=>{ this.estimatorMinutes[p.slug] = Number(e.target.value) }" class="w-24 p-2 border rounded" />
              <div class="text-sm">Coût estimé: <strong>{{ displayMoney(estimateCostCents(p, estimatorMinutes[p.slug]||defaultEstimateMinutes)) }} USD</strong></div>
            </div>
            <div class="mt-2 text-sm text-gray-700">
              <div v-if="balanceLoading">Chargement du solde...</div>
              <div v-else>
                <span v-if="needsTopupCents(p, estimatorMinutes[p.slug]||defaultEstimateMinutes) > 0" class="text-red-600">Top-up requis: {{ displayMoney(needsTopupCents(p, estimatorMinutes[p.slug]||defaultEstimateMinutes)) }} USD</span>
                <span v-else class="text-green-600">Solde suffisant pour l'estimation</span>
              </div>
            </div>
          </div>

        <div class="mt-6">
          <template v-if="p.slug !== 'free'">
            <button @click="subscribe(p)" :disabled="isPlanActive(p) || isLoading" :class="(p.slug === 'pro' ? 'bg-white text-blue-700 px-4 py-2 rounded' : 'bg-blue-600 text-white px-4 py-2 rounded') + (isPlanActive(p) || isLoading ? ' opacity-50 cursor-not-allowed' : '')">S'abonner</button>
          </template>
          <template v-else>
            <span class="px-4 py-2 border rounded text-sm text-gray-600">Plan gratuit</span>
          </template>
        </div>
      </div>
    </div>

    

    
  </div>
</template>

<script>
import axios from 'axios'
import { supabase } from '../lib/supabase'

export default {
  name: 'Pricing',
  data() {
    return {
      uiPlans: [
        { slug: 'free', name: 'Starter', monthly_price: 0.00, per_min_cents: 17, concurrency: 5, included_minutes: 20 },
        { slug: 'standard', name: 'Standard', monthly_price: 19.00, per_min_cents: 15, concurrency: 10, included_minutes: 200 },
        { slug: 'pro', name: 'Pro', monthly_price: 49.00, per_min_cents: 12, concurrency: 20, included_minutes: 1000 }
      ],
      activePlan: null,
      balanceCents: 0,
      balanceLoading: true,
      approvalLink: null,
      isLoading: false,
      estimatorMinutes: {},
      defaultEstimateMinutes: 10
    }
  },
  async created() {
    await Promise.all([this.fetchPlans(), this.fetchBalance(), this.fetchActivePlan()])
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
    async fetchPlans() {
      try {
        // DB stores monthly_price_cents and per_min_cents as cents
        const { data, error } = await supabase.from('plans').select('slug,name,monthly_price_cents,per_min_cents,max_concurrency,included_minutes')
        if (!error && Array.isArray(data) && data.length) {
          this.uiPlans = data.map(p => ({
            slug: p.slug,
            name: p.name,
            monthly_price: (Number(p.monthly_price_cents) || 0) / 100,
            per_min_cents: Number(p.per_min_cents) || 0,
            concurrency: Number(p.max_concurrency) || 0,
            included_minutes: Number(p.included_minutes) || 0
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
  }
}
</script>

 

