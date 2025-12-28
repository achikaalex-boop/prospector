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

export default {
  name: 'TopUpComplete',
  data() { return { loading: true, success: false, message: '' } },
  async created() {
    try {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token') || params.get('orderID') || null
      if (!token) throw new Error('No token/order id in query')

      let user_id = null
      try {
        const { data: { session } } = await supabase.auth.getSession()
        user_id = session?.user?.id || null
      } catch (e) {}

      await captureOrder(token, user_id)
      this.success = true
    } catch (e) {
      console.error('TopUpComplete error', e)
      this.message = e?.response?.data?.error || e.message || String(e)
    } finally { this.loading = false }
  }
}
</script>
