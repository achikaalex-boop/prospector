<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Abonnements</h1>
    <div class="mb-4 text-sm text-gray-600">Choisissez un abonnement. Les appels sont facturés à la minute en plus si applicable.</div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="p in uiPlans" :key="p.slug" class="border p-4 rounded">
        <h3 class="text-xl font-semibold">{{ p.name }}</h3>
        <div class="mt-2">Prix: ${{ p.monthly_price.toFixed(2) }} / mois</div>
        <div class="mt-1">Concurrency: {{ p.concurrency }} appels simultanés</div>
        <div class="mt-1">Per-minute estimé: {{ p.per_min_cents }} cents</div>
        <div class="mt-3">
          <button @click="subscribe(p)" class="bg-blue-600 text-white px-3 py-2 rounded">S'abonner</button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-xl font-semibold mb-2">Solde</h2>
      <div v-if="balanceLoading">Chargement du solde...</div>
      <div v-else class="text-lg">{{ (balanceCents/100).toFixed(2) }} USD</div>
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
        { slug: 'free', name: 'Starter', monthly_price: 0.00, per_min_cents: 17, concurrency: 5 },
        { slug: 'standard', name: 'Standard', monthly_price: 19.00, per_min_cents: 15, concurrency: 10 },
        { slug: 'pro', name: 'Pro', monthly_price: 49.00, per_min_cents: 12, concurrency: 20 }
      ],
      balanceCents: 0,
      balanceLoading: true
    }
  },
  async created() {
    await this.fetchBalance()
  },
  methods: {
    async fetchBalance() {
      this.balanceLoading = true
      try {
        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}
        if (!user_id) { this.balanceCents = 0; this.balanceLoading = false; return }

        // try to get sum of user_credits.amount for user
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
        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}

        const amountCents = Math.round(plan.monthly_price * 100)
        const resp = await axios.post('/api/subscribe', { plan_slug: plan.slug, amount_cents: amountCents, user_id })
        const order = resp.data
        // open approval link
        const link = (order?.links || []).find(l => l.rel === 'approve')
        if (link) window.location.href = link.href
        else alert('Impossible d\'obtenir le lien PayPal d\'approbation')
      } catch (e) {
        console.error('subscribe error', e)
        alert('Erreur lors de la création de la souscription: ' + (e?.response?.data?.error || e.message || e))
      }
    }
  }
}
</script>
