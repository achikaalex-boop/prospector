<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Mon compte — Abonnement</h1>

    <div class="bg-white p-4 rounded shadow mb-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-600">Plan actuel</div>
          <div class="text-lg font-semibold">{{ planLabel }}</div>
          <div class="text-sm text-gray-500" v-if="plan && plan.started_at">Commencé: {{ formatDate(plan.started_at) }}</div>
          <div class="text-sm text-gray-500" v-if="plan && plan.expires_at">Expire: {{ formatDate(plan.expires_at) }}</div>
          <div class="text-sm text-red-600" v-if="planExpired">Expiré — vous êtes sur Starter</div>
        </div>
        <div class="text-right">
          <button @click="goToPricing" class="bg-blue-600 text-white px-4 py-2 rounded">Changer le plan</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-semibold mb-2">Solde</h3>
        <div v-if="balanceLoading">Chargement...</div>
        <div v-else class="text-lg font-bold">{{ displayMoney(balanceCents) }} USD</div>
      </div>

      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-semibold mb-2">Historique des paiements</h3>
        <div v-if="loadingTransactions">Chargement...</div>
        <div v-else>
          <ul class="text-sm">
            <li v-for="tx in transactions" :key="tx.id" class="py-2 border-b">
              <div class="flex justify-between">
                <div>
                  <div class="font-medium">{{ tx.description || tx.source || 'Transaction' }}</div>
                  <div class="text-gray-500 text-xs">{{ formatDate(tx.created_at) }}</div>
                </div>
                <div class="text-right">
                  <div :class="tx.amount < 0 ? 'text-red-600' : 'text-green-600'">{{ tx.amount < 0 ? '-' : '+' }}{{ displayMoney(Math.abs(tx.amount * 100)) }} USD</div>
                  <div class="text-xs text-gray-500">{{ tx.currency || 'USD' }}</div>
                </div>
              </div>
            </li>
          </ul>
          <div v-if="transactions.length === 0" class="text-sm text-gray-500">Aucune transaction récente.</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { supabase } from '../lib/supabase'
export default {
  name: 'Account',
  data() {
    return {
      plan: null,
      balanceCents: 0,
      balanceLoading: true,
      transactions: [],
      loadingTransactions: true
    }
  },
  computed: {
    planLabel() {
      if (!this.plan) return 'Starter (par défaut)'
      return this.plan.plan_slug || this.plan.slug || 'Starter'
    },
    planExpired() {
      try {
        if (!this.plan || !this.plan.expires_at) return false
        return new Date(this.plan.expires_at) <= new Date()
      } catch (e) { return false }
    }
  },
  async created() {
    await Promise.all([this.fetchPlan(), this.fetchBalance(), this.fetchTransactions()])
  },
  methods: {
    formatDate(d) {
      try { return new Date(d).toLocaleString() } catch (e) { return d }
    },
    displayMoney(cents) { return ((Number(cents) || 0) / 100).toFixed(2) },
    async fetchPlan() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id || null
        if (!userId) return
        const { data, error } = await supabase.from('user_plans').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(1).single()
        if (!error && data) this.plan = data
      } catch (e) {
        console.error('fetchPlan error', e)
      }
    },
    async fetchBalance() {
      this.balanceLoading = true
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id || null
        if (!userId) { this.balanceCents = 0; this.balanceLoading = false; return }
        const { data, error } = await supabase.from('user_credits').select('amount').eq('user_id', userId)
        if (!error && Array.isArray(data)) {
          const sum = data.reduce((s, r) => s + (Number(r.amount) || 0), 0)
          this.balanceCents = Math.round(sum * 100)
        } else this.balanceCents = 0
      } catch (e) {
        console.error('fetchBalance error', e)
        this.balanceCents = 0
      } finally { this.balanceLoading = false }
    },
    async fetchTransactions() {
      this.loadingTransactions = true
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id || null
        if (!userId) return
        // Combine user_credits and billing_transactions (best-effort)
        const { data: credits } = await supabase.from('user_credits').select('id,amount,currency,source,meta,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
        const { data: txs } = await supabase.from('billing_transactions').select('id,amount_cents,currency,status,meta,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
        const combined = []
        if (Array.isArray(credits)) {
          credits.forEach(c => combined.push({ id: c.id, amount: Number(c.amount), currency: c.currency, source: c.source, description: c.source, created_at: c.created_at }))
        }
        if (Array.isArray(txs)) {
          txs.forEach(t => combined.push({ id: t.id, amount: t.amount_cents ? Number(t.amount_cents)/100 : 0, currency: t.currency, source: 'billing', description: t.status || 'billing', created_at: t.created_at }))
        }
        // sort by date desc
        combined.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        this.transactions = combined.slice(0, 50)
      } catch (e) {
        console.error('fetchTransactions error', e)
      } finally { this.loadingTransactions = false }
    },
    goToPricing() { this.$router.push('/pricing') }
  }
}
</script>
