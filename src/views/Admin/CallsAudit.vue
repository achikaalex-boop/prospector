<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-4">Admin - Call Webhooks Audit</h2>
    <div class="mb-4">
      <input v-model="q" placeholder="Search call_id or phone" class="border px-2 py-1 w-80" />
      <button @click="search" class="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Search</button>
    </div>

    <div v-if="loading">Chargement...</div>
    <table v-else class="w-full table-auto border-collapse">
      <thead>
        <tr><th class="border px-2">ID</th><th class="border px-2">Call ID</th><th class="border px-2">To</th><th class="border px-2">Event</th><th class="border px-2">Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td class="border px-2">{{ r.id }}</td>
          <td class="border px-2">{{ r.call_id }}</td>
          <td class="border px-2">{{ r.to_number }}</td>
          <td class="border px-2">{{ r.event_type }}</td>
          <td class="border px-2"><button @click="linkPayload(r)" class="px-2 py-1 bg-green-600 text-white rounded">Link</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AdminCallsAudit',
  data() {
    return { q: '', rows: [], loading: false }
  },
  methods: {
    async search() {
      this.loading = true
      try {
        const params = this.q ? { q: this.q } : {}
        const resp = await axios.get('/api/admin/call-webhooks', { params })
        this.rows = resp.data || []
      } catch (e) {
        console.error(e)
      } finally { this.loading = false }
    },
    async linkPayload(row) {
      try {
        await axios.post('/api/admin/link-payload', { id: row.id })
        alert('Attempted link; check DB')
      } catch (e) { console.error(e); alert('Failed') }
    }
  },
  created() { this.search() }
}
</script>
