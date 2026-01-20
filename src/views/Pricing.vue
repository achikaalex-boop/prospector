<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Abonnements</h1>
    <div class="mb-4 text-sm text-gray-600">Choisissez un abonnement adapté à votre usage. Les appels sont facturés à la minute en sus si applicable.</div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="p in uiPlans" :key="p.slug" :class="['p-6 rounded-lg border-2 transition-all', p.slug === 'pro' ? 'bg-gradient-to-br from-blue-700 to-blue-900 border-blue-600 shadow-xl' : 'bg-white border-gray-200 hover:border-blue-300']">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span v-if="p.slug === 'free'" class="text-lg">🟢</span>
              <span v-else-if="p.slug === 'starter'" class="text-lg">🔵</span>
              <span v-else-if="p.slug === 'pro'" class="text-lg">🔴</span>
              <h3 :class="['text-xl font-bold', p.slug === 'pro' ? 'text-white' : 'text-gray-900']">{{ p.name }}</h3>
            </div>
            <div :class="['mt-2 text-2xl font-bold', p.slug === 'pro' ? 'text-white' : 'text-gray-900']">{{ displayMoney(monthlyPriceCents(p)) }}<span class="text-sm font-normal">/mois</span></div>
          </div>
          <div v-if="activePlan && (activePlan.plan_slug === p.slug || activePlan.slug === p.slug)" class="text-xs font-bold uppercase px-2 py-1 rounded" :class="p.slug === 'pro' ? 'bg-green-400 text-gray-900' : 'bg-green-500 text-white'">Actif</div>
        </div>

        <!-- Divider -->
        <div :class="['my-4 h-px', p.slug === 'pro' ? 'bg-blue-400/30' : 'bg-gray-200']"></div>

        <!-- Features -->
        <div :class="['text-sm space-y-3', p.slug === 'pro' ? 'text-blue-50' : 'text-gray-700']">
          <div>
            <p class="font-semibold" :class="p.slug === 'pro' ? 'text-white' : 'text-gray-900'">Limites & Tarification</p>
            <ul class="mt-2 space-y-1.5 text-sm">
              <li><span class="font-semibold">Campagnes/mois :</span> <span class="font-bold">{{ p.monthly_campaign_limit || 0 }}</span></li>
              <li><span class="font-semibold">Contacts/campagne :</span> <span class="font-bold">{{ p.max_contacts_per_campaign || 0 }}</span></li>
              <li><span class="font-semibold">Appels simultanés :</span> <span class="font-bold">{{ p.max_concurrency || p.concurrency || '—' }}</span></li>
              <li><span class="font-semibold">Coût/minute :</span> <span class="font-bold">{{ displayMoney(p.per_min_cents || 0) }} USD</span></li>
            </ul>
          </div>

          <div v-if="p.description" :class="['mt-3 p-2 rounded text-xs', p.slug === 'pro' ? 'bg-blue-600/40 text-blue-100' : 'bg-gray-50 text-gray-600']">
            <p>{{ p.description }}</p>
          </div>
        </div>

        <!-- Button -->
        <div class="mt-6">
          <button @click="subscribe(p)" :disabled="isPlanActive(p) || isLoading" :class="['w-full py-2 px-4 rounded font-semibold transition-all', p.slug === 'pro' ? 'bg-white text-blue-700 hover:bg-gray-100' : (p.slug === 'free' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'), isPlanActive(p) || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']">
            {{ isPlanActive(p) ? '✓ Abonné' : (p.slug === 'free' ? 'Passer au gratuit' : "S'abonner") }}
          </button>
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
      uiPlans: [],
      activePlan: null,
      balanceCents: 0,
      balanceLoading: true,
      approvalLink: null,
      isLoading: false,
      estimatorMinutes: {},
      defaultEstimateMinutes: 10,
      
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
    monthlyPriceCents(plan) {
      if (plan == null) return 0
      if (typeof plan.monthly_price === 'number') return Math.round(plan.monthly_price * 100)
      if (typeof plan.monthly_price_cents === 'number') return Math.round(plan.monthly_price_cents)
      return 0
    },    formatDescription(desc) {
      if (!desc) return []
      // split on dot, semicolon or newline and trim each part
      return String(desc).split(/[.;\n]+/).map(s => s.trim()).filter(Boolean)
    },    async fetchPlans() {
      try {
        // Select only essential columns that are guaranteed to exist
        const { data, error } = await supabase.from('plans').select('slug,name,monthly_price_cents,per_min_cents,max_concurrency,max_contacts_per_campaign,monthly_campaign_limit,description')
            if (!error && Array.isArray(data) && data.length) {
              this.uiPlans = data.map(p => ({
                slug: p.slug,
                name: p.name,
                monthly_price: (Number(p.monthly_price_cents) || 0) / 100,
                monthly_price_cents: Number(p.monthly_price_cents) || 0,
                per_min_cents: Number(p.per_min_cents) || 0,
                concurrency: Number(p.max_concurrency) || 0,
                max_concurrency: Number(p.max_concurrency) || 0,
                max_contacts_per_campaign: Number(p.max_contacts_per_campaign) || 0,
                monthly_campaign_limit: Number(p.monthly_campaign_limit) || 0,
                description: p.description || ''
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
        // If plan is free (0 cents) switch immediately via server-side change-plan
        if (amountCents === 0) {
          try {
            if (!user_id) {
              this.$toast.add({ severity: 'warn', summary: 'Connexion requise', detail: 'Veuillez vous connecter pour changer de plan.', life: 4000 })
              this.$router.push({ name: 'Login' })
              return
            }
            const resp = await axios.post('/api/change-plan', { user_id, plan_slug: plan.slug })
            if (resp && resp.status >= 200 && resp.status < 300) {
              this.$toast.add({ severity: 'success', summary: 'Abonnement', detail: `Vous êtes maintenant sur le plan ${plan.name}.`, life: 4000 })
              // refresh active plan
              await this.fetchActivePlan()
              return
            } else {
              this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de changer de plan.', life: 6000 })
              return
            }
          } catch (e) {
            console.error('change-plan error', e)
            this.$toast.add({ severity: 'error', summary: 'Erreur', detail: e?.response?.data?.error || e.message || String(e), life: 8000 })
            return
          }
        }

        if (!this.approvalLink) {
          this.$toast.add({ severity: 'error', summary: 'Erreur', detail: "Impossible d'obtenir le lien PayPal d'approbation", life: 6000 })
        } else {
          if (amountCents > (this.balanceCents || 0)) {
            // show a short toast then redirect so user sees the message before navigation
            this.$toast.add({ severity: 'warn', summary: 'Solde insuffisant', detail: 'Votre solde est insuffisant pour ce plan. Vous serez redirigé vers PayPal pour compléter le paiement.', life: 6000 })
            setTimeout(() => { window.location.href = this.approvalLink }, 700)
          } else {
            // enough balance — proceed to PayPal directly
            window.location.href = this.approvalLink
          }
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
    },

  }
}
</script>

 

