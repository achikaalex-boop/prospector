<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <i class="pi pi-shield"></i>Centre d'Administration
            </h1>
            <p class="text-blue-100 mt-1">Bienvenue, {{ adminEmail }}</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button 
              @click="toggleSessionInfo" 
              class="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition text-sm font-medium"
            >
              <i class="pi pi-info-circle mr-2"></i>Infos Session
            </button>
            <button 
              @click="logout" 
              class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm font-medium"
            >
              <i class="pi pi-sign-out mr-2"></i>Déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Info Panel -->
    <div v-if="showSessionInfo" class="bg-blue-50 border-b border-blue-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-gray-600 font-semibold">Token Actif</p>
            <p class="text-gray-900 font-mono text-xs break-all">{{ tokenPreview }}</p>
          </div>
          <div>
            <p class="text-gray-600 font-semibold">Durée de Vie</p>
            <p class="text-gray-900">{{ sessionDuration }}</p>
          </div>
          <div>
            <p class="text-gray-600 font-semibold">Dernier Accès</p>
            <p class="text-gray-900">{{ formatDate(lastActivity) }}</p>
          </div>
        </div>
        <button 
          @click="revokeSession"
          class="mt-3 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition font-medium"
        >
          <i class="pi pi-trash mr-1"></i>Révoquer Session
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Security Alert -->
      <Message v-if="!adminStatus?.initialized" severity="warning" :closable="false" class="mb-6">
        <div class="flex items-start gap-3">
          <i class="pi pi-exclamation-triangle text-2xl mt-1"></i>
          <div>
            <strong>Administration non initialisée</strong>
            <p class="text-sm mt-1">L'administration n'a pas encore été configurée. Veuillez définir les identifiants administrateur.</p>
          </div>
        </div>
      </Message>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card class="shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
          <template #header>
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-t-lg">
              <i class="pi pi-users text-3xl text-white"></i>
            </div>
          </template>
          <p class="text-gray-600 text-sm mb-2">Compte Admin</p>
          <p class="text-2xl font-bold text-gray-900">{{ adminStatus?.admin_email || 'Non configuré' }}</p>
          <p class="text-xs text-gray-500 mt-3">
            <i :class="`pi ${adminStatus?.initialized ? 'pi-check-circle text-green-600' : 'pi-exclamation-circle text-red-600'} mr-1`"></i>
            {{ adminStatus?.initialized ? 'Actif' : 'Inactif' }}
          </p>
        </Card>

        <Card class="shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
          <template #header>
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 rounded-t-lg">
              <i class="pi pi-phone text-3xl text-white"></i>
            </div>
          </template>
          <p class="text-gray-600 text-sm mb-2">Demandes Numéros Dédiés</p>
          <p class="text-2xl font-bold text-gray-900">{{ pendingRequests }}</p>
          <button 
            @click="$router.push('/admin/plans')"
            class="text-xs text-blue-600 hover:text-blue-700 mt-3 font-medium"
          >
            <i class="pi pi-arrow-right mr-1"></i>Gérer
          </button>
        </Card>

        <Card class="shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
          <template #header>
            <div class="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6 rounded-t-lg">
              <i class="pi pi-list text-3xl text-white"></i>
            </div>
          </template>
          <p class="text-gray-600 text-sm mb-2">Plans Disponibles</p>
          <p class="text-2xl font-bold text-gray-900">{{ plansCount }}</p>
          <button 
            @click="$router.push('/admin/plans')"
            class="text-xs text-blue-600 hover:text-blue-700 mt-3 font-medium"
          >
            <i class="pi pi-arrow-right mr-1"></i>Configurer
          </button>
        </Card>
      </div>

      <!-- Navigation Grid -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-sitemap text-blue-600"></i>Modules d'Administration
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Plans Management -->
          <router-link to="/admin/plans" class="group">
            <Card class="shadow-md border-0 h-full hover:shadow-xl transition transform hover:-translate-y-1" :pt="{ content: { class: 'p-4 sm:p-6' } }">
              <template #header>
                <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 sm:p-6 rounded-t-lg group-hover:from-indigo-600 group-hover:to-indigo-700 transition">
                  <i class="pi pi-list text-4xl text-white"></i>
                </div>
              </template>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Plans de Facturation</h3>
              <p class="text-gray-600 text-sm mb-4">Gérez les plans, les prix et les minutes incluses</p>
              <div class="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition">
                <span>Accéder</span>
                <i class="pi pi-arrow-right"></i>
              </div>
            </Card>
          </router-link>

          <!-- Dedicated Numbers -->
          <router-link to="/admin/plans" class="group">
            <Card class="shadow-md border-0 h-full hover:shadow-xl transition transform hover:-translate-y-1" :pt="{ content: { class: 'p-4 sm:p-6' } }">
              <template #header>
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 rounded-t-lg group-hover:from-purple-600 group-hover:to-purple-700 transition">
                  <i class="pi pi-phone text-4xl text-white"></i>
                </div>
              </template>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Numéros Dédiés</h3>
              <p class="text-gray-600 text-sm mb-4">Approuvez ou rejetez les demandes de numéros dédiés</p>
              <div class="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition">
                <span>Accéder</span>
                <i class="pi pi-arrow-right"></i>
              </div>
            </Card>
          </router-link>

          <!-- Calls Audit -->
          <router-link to="/admin/calls-audit" class="group">
            <Card class="shadow-md border-0 h-full hover:shadow-xl transition transform hover:-translate-y-1" :pt="{ content: { class: 'p-4 sm:p-6' } }">
              <template #header>
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 rounded-t-lg group-hover:from-orange-600 group-hover:to-orange-700 transition">
                  <i class="pi pi-history text-4xl text-white"></i>
                </div>
              </template>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Audit des Webhooks</h3>
              <p class="text-gray-600 text-sm mb-4">Consultez l'historique et le dépannage des appels</p>
              <div class="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition">
                <span>Accéder</span>
                <i class="pi pi-arrow-right"></i>
              </div>
            </Card>
          </router-link>

          <!-- Security Settings -->
          <router-link to="/admin/security" class="group">
            <Card class="shadow-md border-0 h-full hover:shadow-xl transition transform hover:-translate-y-1" :pt="{ content: { class: 'p-4 sm:p-6' } }">
              <template #header>
                <div class="bg-gradient-to-r from-red-500 to-red-600 p-4 sm:p-6 rounded-t-lg group-hover:from-red-600 group-hover:to-red-700 transition">
                  <i class="pi pi-lock text-4xl text-white"></i>
                </div>
              </template>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Sécurité Avancée</h3>
              <p class="text-gray-600 text-sm mb-4">Gérez les identifiants, tokens et sessions</p>
              <div class="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition">
                <span>Accéder</span>
                <i class="pi pi-arrow-right"></i>
              </div>
            </Card>
          </router-link>

          <!-- Logs & Monitoring -->
          <router-link to="/admin/logs" class="group">
            <Card class="shadow-md border-0 h-full hover:shadow-xl transition transform hover:-translate-y-1" :pt="{ content: { class: 'p-4 sm:p-6' } }">
              <template #header>
                <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 sm:p-6 rounded-t-lg group-hover:from-cyan-600 group-hover:to-cyan-700 transition">
                  <i class="pi pi-chart-bar text-4xl text-white"></i>
                </div>
              </template>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Logs & Monitoring</h3>
              <p class="text-gray-600 text-sm mb-4">Consultez les logs serveur et l'activité admin</p>
              <div class="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition">
                <span>Accéder</span>
                <i class="pi pi-arrow-right"></i>
              </div>
            </Card>
          </router-link>

          <!-- Settings -->
          <router-link to="/admin/settings" class="group">
            <Card class="shadow-md border-0 h-full hover:shadow-xl transition transform hover:-translate-y-1" :pt="{ content: { class: 'p-4 sm:p-6' } }">
              <template #header>
                <div class="bg-gradient-to-r from-slate-500 to-slate-600 p-4 sm:p-6 rounded-t-lg group-hover:from-slate-600 group-hover:to-slate-700 transition">
                  <i class="pi pi-cog text-4xl text-white"></i>
                </div>
              </template>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Configuration Générale</h3>
              <p class="text-gray-600 text-sm mb-4">Paramètres globaux et configuration serveur</p>
              <div class="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition">
                <span>Accéder</span>
                <i class="pi pi-arrow-right"></i>
              </div>
            </Card>
          </router-link>
        </div>
      </div>

      <!-- Security Information -->
      <Card class="shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
        <template #header>
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6 rounded-t-lg">
            <h3 class="text-white font-semibold flex items-center gap-2">
              <i class="pi pi-shield"></i>Infos de Sécurité
            </h3>
          </div>
        </template>
        <div class="space-y-3 text-sm">
          <div class="flex items-start gap-3">
            <i class="pi pi-check-circle text-green-600 mt-1"></i>
            <div>
              <strong>Authentification en deux étapes</strong>
              <p class="text-gray-600">Tous les accès admin sont validés par email et mot de passe</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <i class="pi pi-check-circle text-green-600 mt-1"></i>
            <div>
              <strong>Tokens temporaires</strong>
              <p class="text-gray-600">Les tokens d'accès sont générés de manière aléatoire et stockés de façon sécurisée</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <i class="pi pi-check-circle text-green-600 mt-1"></i>
            <div>
              <strong>Sessions isolées</strong>
              <p class="text-gray-600">Chaque session admin est indépendante et peut être révoquée individuellement</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <i class="pi pi-exclamation-circle text-amber-600 mt-1"></i>
            <div>
              <strong>Conseil de sécurité</strong>
              <p class="text-gray-600">Changez régulièrement votre mot de passe administrateur et déconnectez-vous après chaque session</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Card from 'primevue/card'
import Message from 'primevue/message'

export default {
  name: 'AdminDashboard',
  components: { Card, Message },
  setup() {
    const adminEmail = ref('')
    const adminStatus = ref(null)
    const showSessionInfo = ref(false)
    const pendingRequests = ref(0)
    const plansCount = ref(0)
    const sessionStart = ref(Date.now())
    const lastActivity = ref(Date.now())

    const tokenPreview = ref('')
    const sessionDuration = ref('')

    const verifyAdminAccess = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        if (!token) {
          // Redirect to login if no token
          this.$router.push('/admin')
          return
        }

        const headers = token ? { 'x-admin-token': token } : {}
        const resp = await axios.get('/api/admin/check', { headers })
        
        if (!resp.data || !resp.data.ok) {
          localStorage.removeItem('admin_token')
          delete axios.defaults.headers.common['x-admin-token']
          this.$router.push('/admin')
          return
        }

        // Set default header for this session
        if (token) {
          axios.defaults.headers.common['x-admin-token'] = token
          tokenPreview.value = `${token.substring(0, 8)}...${token.substring(token.length - 8)}`
        }
      } catch (e) {
        console.error('Admin access verification failed:', e)
        localStorage.removeItem('admin_token')
        this.$router.push('/admin')
      }
    }

    const loadAdminData = async () => {
      try {
        const [statusResp, requestsResp, plansResp] = await Promise.all([
          axios.get('/api/admin/status'),
          axios.get('/api/admin/dedicated-number-requests', {
            headers: { 'x-admin-token': localStorage.getItem('admin_token') }
          }),
          axios.get('/api/admin/plans-count')
        ])

        adminStatus.value = statusResp.data
        adminEmail.value = statusResp.data?.admin_email || 'Administrateur'
        pendingRequests.value = (requestsResp.data?.requests || []).length
        plansCount.value = plansResp.data?.count || 0
      } catch (e) {
        console.error('Failed to load admin data:', e)
      }
    }

    const toggleSessionInfo = () => {
      showSessionInfo.value = !showSessionInfo.value
      if (showSessionInfo.value) {
        updateSessionDuration()
      }
    }

    const updateSessionDuration = () => {
      const now = Date.now()
      const durationMs = now - sessionStart.value
      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        sessionDuration.value = `${hours}h ${minutes}m`
      } else {
        sessionDuration.value = `${minutes}m`
      }
      lastActivity.value = new Date()
    }

    const revokeSession = async () => {
      if (!confirm('Êtes-vous sûr? Cette action révoquera votre session actuelle.')) return

      try {
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}
        await axios.post('/api/admin/revoke-session', {}, { headers })
        
        localStorage.removeItem('admin_token')
        delete axios.defaults.headers.common['x-admin-token']
        
        this.$toast.add({
          severity: 'success',
          summary: 'Révoqué',
          detail: 'Votre session a été révoquée',
          life: 3000
        })
        
        setTimeout(() => {
          this.$router.push('/admin')
        }, 1500)
      } catch (e) {
        console.error('Revoke session error:', e)
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de révoquer la session',
          life: 5000
        })
      }
    }

    const logout = async () => {
      if (!confirm('Êtes-vous sûr de vouloir vous déconnecter?')) return
      
      localStorage.removeItem('admin_token')
      delete axios.defaults.headers.common['x-admin-token']
      
      this.$toast.add({
        severity: 'success',
        summary: 'Déconnecté',
        detail: 'Vous avez été déconnecté avec succès',
        life: 3000
      })
      
      setTimeout(() => {
        this.$router.push('/admin')
      }, 1500)
    }

    const formatDate = (date) => {
      try {
        return new Date(date).toLocaleString('fr-FR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (e) {
        return String(date)
      }
    }

    onMounted(async () => {
      await verifyAdminAccess()
      await loadAdminData()
    })

    return {
      adminEmail,
      adminStatus,
      showSessionInfo,
      pendingRequests,
      plansCount,
      tokenPreview,
      sessionDuration,
      lastActivity,
      toggleSessionInfo,
      revokeSession,
      logout,
      formatDate,
      updateSessionDuration
    }
  }
}
</script>

<style scoped>
:deep(.p-card) {
  border-radius: 12px;
}
</style>
