<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Top-up de crédit</h2>

    <div class="mb-4">
      <label class="block text-sm font-medium">Montant (USD)</label>
      <input v-model.number="amount" type="number" min="1" class="mt-1 block w-full border rounded px-2 py-1" />
    </div>

    <div class="flex gap-2">
      <button @click="startTopup" class="bg-blue-600 text-white px-4 py-2 rounded">Payer</button>
      <button @click="openApproval" :disabled="!approvalLink" class="bg-gray-200 px-4 py-2 rounded">Ouvrir l'approbation</button>
    </div>

    <div v-if="order" class="mt-4 bg-gray-50 border p-3 rounded">
      <div><strong>Order:</strong> {{ order.id }}</div>
      <div v-if="approvalLink">Approval link: <a :href="approvalLink" target="_blank" class="text-blue-600">ouvrir</a></div>
      <div class="mt-2">
        <button @click="capture" class="bg-green-600 text-white px-3 py-1 rounded">J'ai payé — Capturer</button>
      </div>
    </div>

    <div v-if="message" class="mt-4 text-sm text-gray-700">{{ message }}</div>
  </div>
</template>

<script>
import { createOrder, captureOrder } from '../lib/paypal'
import { supabase } from '../lib/supabase'

export default {
  name: 'TopUp',
  data() {
    return {
      amount: 5,
      order: null,
      approvalLink: null,
      message: ''
    }
  },
  methods: {
    async startTopup() {
      this.message = '';
      try {
        const cents = Math.round(Number(this.amount || 0) * 100);
        if (cents <= 0) return this.message = 'Montant invalide';
        // Get current user id from supabase session if available
        let user_id = null
        try {
          const { data: { session } } = await supabase.auth.getSession()
          user_id = session?.user?.id || null
        } catch (e) {
          // ignore
        }

        const order = await createOrder(cents, 'USD', `Top-up ${this.amount} USD`)
        this.order = order
        // find approval link
        const link = (order?.links || []).find(l => l.rel === 'approve')
        this.approvalLink = link ? link.href : null
        if (!this.approvalLink) this.message = 'Order créé, mais aucun lien d\'approbation trouvé.'
      } catch (e) {
        console.error(e)
        this.message = `Erreur: ${e?.response?.data?.error || e.message || e}`
      }
    },
    openApproval() {
      if (this.approvalLink) window.open(this.approvalLink, '_blank')
    },
    async capture() {
      this.message = ''
      try {
        if (!this.order || !this.order.id) return this.message = 'Aucune order à capturer.'
        let user_id = null
        try {
          const { data: { session } } = await supabase.auth.getSession()
          user_id = session?.user?.id || null
        } catch (e) {}

        const capture = await captureOrder(this.order.id, user_id)
        this.message = 'Paiement capturé avec succès.'
        this.order = capture
        this.approvalLink = null
      } catch (e) {
        console.error(e)
        this.message = `Erreur lors de la capture: ${e?.response?.data?.error || e.message || e}`
      }
    }
  }
}
</script>

<style scoped>
/* minimal styling; project uses Tailwind if available */
</style>
