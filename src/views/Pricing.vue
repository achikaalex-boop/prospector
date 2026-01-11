<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Abonnements</h1>
    <div class="mb-4 text-sm text-gray-600">Choisissez un abonnement. Les appels sont facturés à la minute en plus si applicable.</div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="p in uiPlans" :key="p.slug" :class="['p-6 rounded-lg', p.slug === 'pro' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white border']">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ p.name }}</h3>
          <span v-if="p.slug === 'pro'" class="text-xs uppercase px-2 py-1 bg-white/20 rounded">Populaire</span>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-bold">${{ p.monthly_price.toFixed(2) }}</div>
          <div class="text-sm text-gray-200/80">/ mois</div>
        </div>
        <ul class="mt-4 text-sm">
          <li>Concurrency: <strong>{{ p.concurrency }}</strong></li>
          <li>Per-minute estimé: <strong>{{ p.per_min_cents }}¢</strong></li>
          <li v-if="p.included_minutes">Minutes inclues: <strong>{{ p.included_minutes }}</strong></li>
        </ul>

        <div class="mt-4 bg-gray-50 p-3 rounded">
          <label class="text-sm">Estimation d'appel (minutes)</label>
          <div class="mt-2 flex items-center gap-2">
            <input type="number" min="0" :value="estimatorMinutes[p.slug]" @input="(e)=>{ this.estimatorMinutes[p.slug] = Number(e.target.value) }" class="w-24 p-2 border rounded" />
            <div class="text-sm">Coût estimé: <strong>{{ displayMoney(estimateCostCents(p, estimatorMinutes[p.slug]||defaultEstimateMinutes)) }} USD</strong></div>
          </div>
          <div class="mt-2 text-sm text-gray-700">
            <div v-if="balanceLoading">Chargement du solde...</div>
            <div v-else>
              Solde: <strong>{{ displayMoney(balanceCents) }} USD</strong>
              <span v-if="needsTopupCents(p, estimatorMinutes[p.slug]||defaultEstimateMinutes) > 0" class="ml-2 text-red-600">(Top-up requis: {{ displayMoney(needsTopupCents(p, estimatorMinutes[p.slug]||defaultEstimateMinutes)) }} USD)</span>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <button @click="subscribe(p)" :class="p.slug === 'pro' ? 'bg-white text-blue-700 px-4 py-2 rounded' : 'bg-blue-600 text-white px-4 py-2 rounded'">S'abonner</button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-xl font-semibold mb-2">Solde</h2>
      <div v-if="balanceLoading">Chargement du solde...</div>
      <div v-else class="text-lg">{{ (balanceCents/100).toFixed(2) }} USD</div>
    </div>

    <!-- Subscription redirect modal -->
    <div v-if="showRedirectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-2">Confirmer la souscription</h3>
        <p class="text-sm text-gray-700 mb-4">Vous allez être redirigé vers PayPal pour autoriser le paiement. Une fois approuvé, vous serez redirigé vers la page de confirmation.</p>
        <div class="flex items-center gap-3">
          <button @click="openApprovalFromModal" class="bg-blue-600 text-white px-4 py-2 rounded">Ouvrir PayPal</button>
          <button @click="cancelRedirect" class="px-4 py-2 border rounded">Annuler</button>
          <div v-if="isLoading" class="ml-auto text-sm text-gray-600">Chargement...</div>
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
      balanceCents: 0,
      balanceLoading: true,
      approvalLink: null,
      showRedirectModal: false,
      isLoading: false,
      estimatorMinutes: {},
      defaultEstimateMinutes: 10
    }
  },
  async created() {
    await Promise.all([this.fetchPlans(), this.fetchBalance()])
  },
  mounted() {
    window.addEventListener('balance:updated', this.fetchBalance)
  },
  unmounted() {
    window.removeEventListener('balance:updated', this.fetchBalance)
  },
  methods: {
    async fetchPlans() {
      try {
        const { data, error } = await supabase.from('plans').select('slug,name,monthly_price,per_min_cents,concurrency,included_minutes')
        if (!error && Array.isArray(data) && data.length) {
          this.uiPlans = data.map(p => ({
            slug: p.slug,
            name: p.name,
            monthly_price: Number(p.monthly_price) || 0,
            per_min_cents: Number(p.per_min_cents) || 0,
            concurrency: Number(p.concurrency) || 0,
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
    async subscribe(plan) {
      try {
        this.isLoading = true
        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}

        const amountCents = Math.round(plan.monthly_price * 100)
        const resp = await axios.post('/api/subscribe', { plan_slug: plan.slug, amount_cents: amountCents, user_id })
        const order = resp.data
        const link = (order?.links || []).find(l => l.rel === 'approve')
        this.approvalLink = link ? link.href : null
        if (!this.approvalLink) {
          alert('Impossible d\'obtenir le lien PayPal d\'approbation')
        } else {
          this.showRedirectModal = true
        }
      } catch (e) {
        console.error('subscribe error', e)
        alert('Erreur lors de la création de la souscription: ' + (e?.response?.data?.error || e.message || e))
      } finally { this.isLoading = false }
    },
    openApprovalFromModal() {
      if (this.approvalLink) {
        window.open(this.approvalLink, '_blank')
        this.showRedirectModal = false
      }
    },
    cancelRedirect() { this.showRedirectModal = false },
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

 

