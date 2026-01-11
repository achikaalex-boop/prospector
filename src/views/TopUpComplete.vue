<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Top-up: confirmation</h2>
    <div v-if="loading">Processing payment...</div>
    <div v-else-if="success">Paiement capturé ✅</div>
    <div v-else class="text-red-600">Erreur: {{ message }}</div>
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
        await captureOrder(token, user_id, plan_slug)
        this.success = true
        toast.add({ severity: 'success', summary: 'Paiement', detail: 'Paiement capturé avec succès', life: 6000 })
        try { window.dispatchEvent(new CustomEvent('balance:updated')) } catch (e) {}
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
