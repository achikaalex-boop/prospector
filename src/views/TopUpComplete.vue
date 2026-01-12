<template>
  <div class="p-6 max-w-md mx-auto">
    <div class="bg-white rounded-lg shadow p-6 text-center">
      <div v-if="loading" class="flex flex-col items-center gap-4">
        <svg class="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <div class="text-lg font-medium">Traitement du paiement...</div>
        <div class="text-sm text-gray-500">Ne fermez pas cette page. Vous serez redirigé automatiquement.</div>
      </div>

      <div v-else-if="success" class="flex flex-col items-center gap-4">
        <div class="rounded-full bg-green-100 p-3">
          <svg class="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.071 7.071a1 1 0 01-1.414 0L3.293 9.95a1 1 0 011.414-1.414L8 11.828l6.293-6.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-2xl font-semibold">Paiement capturé ✅</h2>
        <div v-if="captureAmount" class="text-lg">Montant crédité : <strong>{{ captureAmount }} {{ captureCurrency || 'USD' }}</strong></div>
        <div v-if="orderId" class="text-sm text-gray-500">Référence : {{ orderId }}</div>
        <div class="flex gap-3 mt-4">
          <button @click="$router.push('/pricing')" class="px-4 py-2 bg-blue-600 text-white rounded">Retour au Pricing</button>
          <button @click="$router.push('/')" class="px-4 py-2 border rounded">Dashboard</button>
        </div>
      </div>

      <div v-else class="text-center">
        <h2 class="text-xl font-semibold text-red-600">Erreur lors du paiement</h2>
        <p class="mt-2 text-sm text-gray-700">{{ message }}</p>
        <div class="mt-4">
          <button @click="$router.push('/topup')" class="px-4 py-2 bg-blue-600 text-white rounded">Réessayer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { captureOrder } from '../lib/paypal'
import { supabase } from '../lib/supabase'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'TopUpComplete',
  data() { return { loading: true, success: false, message: '' } },
  async created() {
    const toast = useToast()
    try {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token') || params.get('orderID') || null
      const plan_slug = params.get('plan_slug') || null
      if (!token) throw new Error('No token/order id in query')

      let user_id = null
      try {
        const { data: { session } } = await supabase.auth.getSession()
        user_id = session?.user?.id || null
      } catch (e) {}

      try {
        const resp = await captureOrder(token, user_id, plan_slug)
        const capture = resp?.capture || resp
        if (resp && (resp.credited || resp.deduction_applied)) {
          this.success = true
          if (resp.credited) toast.add({ severity: 'success', summary: 'Paiement', detail: 'Paiement capturé et solde crédité', life: 6000 })
          else toast.add({ severity: 'success', summary: 'Paiement', detail: 'Paiement capturé et frais d\'abonnement déduits du solde', life: 6000 })
          try { window.dispatchEvent(new CustomEvent('balance:updated')) } catch (e) {}
          if (resp.plan_updated) {
            try { window.dispatchEvent(new CustomEvent('plan:updated')) } catch (e) {}
          }
        } else if (resp && (resp.credit_error || resp.deduction_error)) {
          this.success = true
          const err = resp.credit_error || resp.deduction_error
          toast.add({ severity: 'warn', summary: 'Paiement', detail: 'Paiement capturé, mais le solde n\'a pas pu être mis à jour: ' + String(err), life: 8000 })
          this.message = String(err)
        } else {
          this.success = true
          toast.add({ severity: 'warn', summary: 'Paiement', detail: 'Paiement capturé, mais le solde n\'a pas été modifié automatiquement', life: 8000 })
        }
      } catch (e) {
        // If server indicates ORDER_NOT_APPROVED, show approval link and open it
        const status = e?.response?.status
        const data = e?.response?.data || {}
        if (status === 409 && data.approval_link) {
          const msg = 'Le paiement n\'a pas été approuvé. Veuillez autoriser le paiement sur PayPal.'
          toast.add({ severity: 'warn', summary: 'Autorisation requise', detail: msg, life: 10000 })
          // open approval link in a new tab
          try { window.open(data.approval_link, '_blank') } catch (err) {}
        } else {
          const msg = data.error || e.message || String(e)
          toast.add({ severity: 'error', summary: 'Erreur paiement', detail: msg, life: 8000 })
          this.message = msg
        }
      }
    } catch (e) {
      console.error('TopUpComplete error', e)
      this.message = e?.response?.data?.error || e.message || String(e)
      try { useToast().add({ severity: 'error', summary: 'Erreur', detail: this.message, life: 8000 }) } catch (t) {}
    } finally { this.loading = false }
  }
}
</script>
