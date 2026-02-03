<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Hero -->
    <section class="text-center py-12">
      <h1 class="text-4xl md:text-5xl font-extrabold mb-4">Un seul plan. Tout compris.</h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto mb-6">Accédez à toutes les fonctionnalités de la plateforme — campagnes puissantes, appels intelligents, intégrations & support prioritaire.</p>

      <div class="flex justify-center">
        <div class="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-block bg-red-500 rounded-full w-3 h-3"></span>
                <h2 class="text-xl font-bold">Pro</h2>
              </div>
              <div class="text-4xl font-extrabold mt-3">{{ displayMoney(monthlyPriceCents(proPlan)) }}<span class="text-sm font-medium">/mois</span></div>
              <p class="mt-2 text-sm opacity-90">Accès complet à toutes les fonctionnalités</p>
            </div>
            <div class="text-right">
              <div v-if="activePlan && (activePlan.plan_slug === proPlan?.slug || activePlan.slug === proPlan?.slug)" class="text-xs font-bold uppercase px-2 py-1 rounded bg-green-400 text-gray-900">Actif</div>
            </div>
          </div>

          <ul class="mt-4 space-y-2 text-sm">
            <li class="flex items-center gap-2"><i class="pi pi-check-circle"></i> <strong>Campagnes/mois :</strong> {{ proPlan?.monthly_campaign_limit || '—' }}</li>
            <li class="flex items-center gap-2"><i class="pi pi-check-circle"></i> <strong>Contacts/campagne :</strong> {{ proPlan?.max_contacts_per_campaign || '—' }}</li>
            <li class="flex items-center gap-2"><i class="pi pi-check-circle"></i> <strong>Appels simultanés :</strong> {{ proPlan?.max_concurrency || '—' }}</li>
            <li class="flex items-center gap-2"><i class="pi pi-check-circle"></i> <strong>Support :</strong> Prioritaire</li>
          </ul>

          <div class="mt-6">
            <button @click="subscribe(proPlan)" :disabled="isPlanActive(proPlan) || isLoading" class="w-full bg-white text-blue-700 py-2 rounded font-semibold hover:bg-gray-100">{{ isPlanActive(proPlan) ? '✓ Abonné' : 'S\'abonner' }}</button>
          </div>

          <div class="mt-3 text-xs text-white/80">Paiement sécurisé · Assistance incluse</div>
        </div>
      </div>
    </section>

    <!-- Features + CTA (revamped) -->
    <section class="mt-8">
      <h3 class="text-xl font-bold mb-4">Pourquoi choisir Pro ?</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start gap-4">
            <i class="pi pi-phone text-blue-600 text-2xl"></i>
            <div>
              <h4 class="font-semibold">Appels optimisés</h4>
              <p class="text-sm text-gray-600 mt-1">Gestion intelligente des appels et files d'attente, priorisation réseau pour maximiser vos conversions.</p>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start gap-4">
            <i class="pi pi-plug text-blue-600 text-2xl"></i>
            <div>
              <h4 class="font-semibold">Intégrations & API</h4>
              <p class="text-sm text-gray-600 mt-1">Webhooks, API & intégrations CRM pour automatiser votre prospection et synchroniser vos leads.</p>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start gap-4">
            <i class="pi pi-chart-line text-blue-600 text-2xl"></i>
            <div>
              <h4 class="font-semibold">Analyse & rapports</h4>
              <p class="text-sm text-gray-600 mt-1">Tableaux de bord et métriques pour suivre l'efficacité des campagnes et améliorer les scripts d'appel.</p>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start gap-4">
            <i class="pi pi-headset text-blue-600 text-2xl"></i>
            <div>
              <h4 class="font-semibold">Support prioritaire</h4>
              <p class="text-sm text-gray-600 mt-1">Assistance dédiée pour l'onboarding et support pro afin de maintenir votre activité opérationnelle.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-gray-50 p-5 rounded-lg border">
        <h4 class="font-semibold mb-3">Nos engagements</h4>
        <ul class="text-sm text-gray-700 space-y-2">
          <li class="flex items-start gap-2"><i class="pi pi-check text-green-600 mt-1"></i> <span>Sécurité & confidentialité des données</span></li>
          <li class="flex items-start gap-2"><i class="pi pi-check text-green-600 mt-1"></i> <span>Intégration avec vos outils (CRM, Zapier, API)</span></li>
          <li class="flex items-start gap-2"><i class="pi pi-check text-green-600 mt-1"></i> <span>Support dédié pour l'onboarding</span></li>
        </ul>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mt-12">
      <h3 class="text-xl font-bold mb-3">Questions fréquentes</h3>
      <div class="space-y-2 text-sm text-gray-700">
        <div class="p-3 border rounded">Toutes les fonctionnalités sont incluses dans le plan Pro — pas de modules cachés.</div>
        <div class="p-3 border rounded">Vous pouvez changer d'abonnement ou annuler via votre espace.</div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios'
import { supabase } from '../lib/supabase'
import { inject } from 'vue'

export default {
  name: 'Pricing',
  setup() {
    const showConfirm = inject('showConfirm')
    return { showConfirm }
  },
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
  computed: {
    proPlan() {
      return (this.uiPlans && this.uiPlans.find(p => p.slug === 'pro')) || (this.uiPlans && this.uiPlans[0]) || null
    }
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
              // Keep only the 'pro' plan in the public Pricing page
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
              })).filter(p => p.slug === 'pro')
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

        // If this is a downgrade while current plan is active, ask for confirmation
        if (this.activePlan && this.isDowngrade(plan)) {
          const confirmed = await this.showConfirm({
            title: 'Confirmer la modification de plan',
            message: 'Vous changez vers un plan moins avantageux. Cette action peut être irréversible. Voulez-vous continuer ?',
            confirmText: 'Oui, continuer',
            cancelText: 'Annuler',
            icon: '⚠️',
            variant: 'danger'
          })
          if (!confirmed) return
        }
        
        await this.performSubscribe(plan, user_id)
      } catch (e) {
        console.error('subscribe error', e)
        this.$toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la création de la souscription: ' + (e?.response?.data?.error || e.message || e), life: 8000 })
      } finally { this.isLoading = false }
    },

    async performSubscribe(plan, user_id) {
      try {
        const amountCents = Math.round(plan.monthly_price * 100)
        
        // If plan is zero-priced (0 cents) switch immediately via server-side change-plan (handled for legacy or zero-cost plans)
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
        
        // For paid plans, create a PayPal order
        const resp = await axios.post('/api/subscribe', { plan_slug: plan.slug, amount_cents: amountCents, user_id })
        const order = resp.data
        const link = (order?.links || []).find(l => l.rel === 'approve')
        this.approvalLink = link ? link.href : null

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

 

