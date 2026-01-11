<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Pricing</h1>
    <div v-if="plans.length === 0">Chargement...</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4" v-else>
      <div v-for="p in plans" :key="p.id" class="border p-4 rounded">
        <h3 class="text-xl font-semibold">{{ p.name }}</h3>
        <div class="mt-2">Prix: ${{ (p.monthly_price_cents/100).toFixed(2) }} / month</div>
        <div class="mt-1">Per-minute: {{ p.per_min_cents || defaultPerMin }} cents</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { defaultPerMin } from '../lib/billing'

export default {
  name: 'Pricing',
  data() {
    return {
      plans: []
    }
  },
  computed: {
    defaultPerMin() { return defaultPerMin() }
  },
  async created() {
    try {
      const resp = await axios.get('/api/plans')
      this.plans = resp.data || []
    } catch (e) {
      console.error('Could not load plans', e)
    }
  }
}
</script>
