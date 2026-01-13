<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Admin — Connexion</h1>
    <div class="bg-white p-4 rounded shadow">
      <label class="text-xs">Email</label>
      <input v-model="email" class="w-full p-2 border rounded mb-2" placeholder="admin@example.com" />
      <label class="text-xs">Mot de passe</label>
      <input v-model="password" type="password" class="w-full p-2 border rounded mb-4" />
      <div class="flex gap-2">
        <button @click="submit" :disabled="isLoading" class="bg-blue-600 text-white px-4 py-2 rounded">Connexion</button>
        <button @click="initIfNeeded" :disabled="isLoading" class="px-4 py-2 border rounded">Initialiser (si non configuré)</button>
      </div>
      <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
      <p class="text-xs text-gray-500 mt-3">Si l'admin n'est pas initialisé, utilisez le bouton 'Initialiser' pour créer les identifiants.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'AdminLogin',
  data() { return { email: '', password: '', isLoading: false, error: null } },
  methods: {
    async submit() {
      try {
        this.isLoading = true
        this.error = null
        const resp = await axios.post('/api/admin/login', { email: this.email, password: this.password })
        if (resp.data && resp.data.ok && resp.data.token) {
          const token = resp.data.token
          localStorage.setItem('admin_token', token)
          axios.defaults.headers.common['x-admin-token'] = token
          this.$router.push({ name: 'AdminPlans' })
        } else {
          this.error = 'Échec de la connexion'
        }
      } catch (e) {
        this.error = e?.response?.data?.error || e.message || String(e)
      } finally { this.isLoading = false }
    },
    async initIfNeeded() {
      try {
        this.isLoading = true
        this.error = null
        // Try to initialize admin credentials if none exist
        const resp = await axios.post('/api/admin/set-admin-credentials', { email: this.email || 'admin@localhost', password: this.password || 'admin' })
        if (resp.data && resp.data.ok) {
          this.$toast.add({ severity: 'success', summary: 'Initialisé', detail: 'Identifiants administrateur créés', life: 4000 })
        } else {
          this.error = 'Impossible d\'initialiser'
        }
      } catch (e) {
        this.error = e?.response?.data?.error || e.message || String(e)
      } finally { this.isLoading = false }
    }
  }
}
</script>