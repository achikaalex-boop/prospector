<template>
  <div class="p-6 max-w-lg mx-auto">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-2">Ajouter des fonds</h2>
      <p class="text-sm text-gray-600 mb-4">Choisissez un montant ou entrez un montant personnalisé.</p>

      <div class="grid grid-cols-4 gap-3 mb-4">
        <button @click="selectPreset(5)" :class="presetClass(5)" class="py-2 rounded">$5</button>
        <button @click="selectPreset(10)" :class="presetClass(10)" class="py-2 rounded">$10</button>
        <button @click="selectPreset(25)" :class="presetClass(25)" class="py-2 rounded">$25</button>
        <button @click="selectPreset(50)" :class="presetClass(50)" class="py-2 rounded">$50</button>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Montant (USD)</label>
        <div class="flex gap-2">
          <input v-model.number="amount" type="number" min="1" class="flex-1 block w-full border rounded px-3 py-2" />
          <select v-model="currency" class="border rounded px-2 py-2">
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button @click="startTopup" class="bg-blue-600 text-white px-4 py-2 rounded shadow">Payer avec PayPal</button>
        <button @click="goBack" class="text-sm text-gray-600">Annuler</button>
      </div>

      <div v-if="order" class="mt-4 border rounded bg-gray-50 p-3">
        <div class="text-sm text-gray-700">Order ID: <strong>{{ order.id }}</strong></div>
        <div v-if="approvalLink" class="mt-2">
          <a :href="approvalLink" target="_blank" class="text-blue-600">Ouvrir le lien d'approbation PayPal</a>
        </div>
        <div class="mt-2">
          <button @click="capture" class="bg-green-600 text-white px-3 py-1 rounded">J'ai payé — Capturer</button>
        </div>
      </div>

      <!-- Redirect confirmation modal -->
      <div v-if="showRedirectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-2">Redirection vers PayPal</h3>
          <p class="text-sm text-gray-700 mb-4">Vous allez être redirigé vers PayPal pour autoriser le paiement. Une fois approuvé, revenez ici pour finaliser la capture ou utilisez la page de confirmation.</p>
          <div class="flex items-center gap-3">
            <button @click="openApprovalFromModal" class="bg-blue-600 text-white px-4 py-2 rounded">Ouvrir PayPal</button>
            <button @click="cancelRedirect" class="px-4 py-2 border rounded">Annuler</button>
            <div v-if="isLoading" class="ml-auto text-sm text-gray-600">Chargement...</div>
          </div>
        </div>
      </div>

      <div v-if="message" class="mt-4 text-sm text-red-600">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import { createOrder, captureOrder } from '../lib/paypal'
import { supabase } from '../lib/supabase'

export default {
  name: 'TopUp',
  data() {
    return {
      amount: 10,
      currency: 'USD',
      order: null,
      approvalLink: null,
      message: '',
      showRedirectModal: false,
      isLoading: false
    }
  },
  methods: {
    presetClass(val) {
      return this.amount === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
    },
    selectPreset(val) { this.amount = val },
    goBack() { this.$router.push('/') },
    async startTopup() {
      this.message = ''
      this.isLoading = true
      try {
        const cents = Math.round(Number(this.amount || 0) * 100)
        if (cents <= 0) { this.message = 'Montant invalide'; this.isLoading = false; return }

        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}

        const order = await createOrder(cents, this.currency, `Top-up ${this.amount} ${this.currency}`, user_id)
        this.order = order
        const link = (order?.links || []).find(l => l.rel === 'approve')
        this.approvalLink = link ? link.href : null
        if (!this.approvalLink) this.message = 'Order créé, mais aucun lien d\'approbation trouvé.'
        // show confirmation modal before redirecting
        this.showRedirectModal = true
      } catch (e) {
        console.error(e)
        this.message = `Erreur: ${e?.response?.data?.error || e.message || e}`
      } finally { this.isLoading = false }
    },
    async capture() {
      this.message = ''
      try {
        if (!this.order || !this.order.id) return this.message = 'Aucune order à capturer.'
        let user_id = null
        try { const { data: { session } } = await supabase.auth.getSession(); user_id = session?.user?.id || null } catch (e) {}

        const resp = await captureOrder(this.order.id, user_id)
        // server now returns { capture, credited, credit_error }
        const capture = resp?.capture || resp
        this.order = capture
        this.approvalLink = null
        if (resp && resp.credited) {
          this.message = 'Paiement capturé et solde crédité avec succès.'
          try { window.dispatchEvent(new CustomEvent('balance:updated')) } catch (e) {}
        } else if (resp && resp.credit_error) {
          this.message = 'Paiement capturé, mais le solde n\'a pas pu être crédité: ' + String(resp.credit_error)
        } else {
          this.message = 'Paiement capturé, mais le solde n\'a pas été crédité automatiquement.'
        }
        this.showRedirectModal = false
        this.$router.push('/pricing')
      } catch (e) {
        console.error(e)
        this.message = `Erreur lors de la capture: ${e?.response?.data?.error || e.message || e}`
      }
    }
    ,
    openApprovalFromModal() {
      if (this.approvalLink) {
        // open in new tab and show instruction
        window.open(this.approvalLink, '_blank')
        this.showRedirectModal = false
      }
    },
    cancelRedirect() {
      this.showRedirectModal = false
    }
  }
}
</script>

<style scoped>
.bg-blue-600.text-white { background-color: #2563eb; color: white }
</style>
