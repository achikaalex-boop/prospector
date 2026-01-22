<template>
  <div style="min-height: 100vh; background: linear-gradient(to bottom right, #f3f4f6, #e5e7eb);">
    <!-- Header -->
    <div style="background: linear-gradient(to right, #2563eb, #1e40af); color: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); position: sticky; top: 0; z-index: 40;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; flex-direction: column; gap: 1rem; flex-wrap: wrap;">
          <div>
            <h1 style="font-size: 1.875rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
              <i class="pi pi-shield"></i>Centre d'Administration
            </h1>
            <p style="color: #bfdbfe; margin-top: 0.25rem;">Bienvenue, {{ adminEmail }}</p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              @click="toggleSessionInfo" 
              style="padding: 0.5rem 1rem; background-color: #3b82f6; color: white; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;"
              @mouseover="event.target.style.backgroundColor = '#1d4ed8'"
              @mouseout="event.target.style.backgroundColor = '#3b82f6'"
            >
              <i class="pi pi-info-circle"></i>Infos Session
            </button>
            <button 
              @click="logout" 
              style="padding: 0.5rem 1rem; background-color: #dc2626; color: white; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;"
              @mouseover="event.target.style.backgroundColor = '#991b1b'"
              @mouseout="event.target.style.backgroundColor = '#dc2626'"
            >
              <i class="pi pi-sign-out"></i>Déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Info Panel -->
    <div v-if="showSessionInfo" style="background: #eff6ff; border-bottom: 1px solid #bfdbfe;">
      <div style="max-width: 80rem; margin: 0 auto; padding: 1rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; font-size: 0.875rem;">
          <div>
            <p style="color: #495057; font-weight: 600;">Token Actif</p>
            <p style="color: #111827; font-family: monospace; font-size: 0.75rem; word-break: break-all;">{{ tokenPreview }}</p>
          </div>
          <div>
            <p style="color: #495057; font-weight: 600;">Durée de Vie</p>
            <p style="color: #111827;">{{ sessionDuration }}</p>
          </div>
          <div>
            <p style="color: #495057; font-weight: 600;">Dernier Accès</p>
            <p style="color: #111827;">{{ formatDate(lastActivity) }}</p>
          </div>
        </div>
        <button 
          @click="revokeSession"
          style="padding: 0.25rem 0.75rem; background-color: #ef4444; color: white; font-size: 0.75rem; border-radius: 0.25rem; border: none; cursor: pointer; transition: all 0.2s; font-weight: 500; display: inline-flex; align-items: center; gap: 0.25rem;"
          @mouseover="event.target.style.backgroundColor = '#991b1b'"
          @mouseout="event.target.style.backgroundColor = '#ef4444'"
        >
          <i class="pi pi-trash"></i>Révoquer Session
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div style="max-width: 80rem; margin: 0 auto; padding: 2rem 1rem;">
      <!-- Quick Stats -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <!-- Stat Card 1 -->
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s;">
          <div style="background: linear-gradient(to right, #3b82f6, #1d4ed8); padding: 1rem; color: white;">
            <i class="pi pi-users" style="font-size: 1.875rem;"></i>
          </div>
          <div style="padding: 1rem;">
            <p style="color: #495057; font-size: 0.875rem; margin-bottom: 0.5rem;">Compte Admin</p>
            <p style="font-size: 1.5rem; font-weight: 700; color: #111827;">{{ adminStatus?.admin_email || 'Non configuré' }}</p>
            <p style="font-size: 0.75rem; color: #6c757d; margin-top: 0.75rem;">
              <i :class="`pi ${adminStatus?.initialized ? 'pi-check-circle' : 'pi-exclamation-circle'}`" :style="`color: ${adminStatus?.initialized ? '#16a34a' : '#dc2626'};`"></i>
              {{ adminStatus?.initialized ? 'Actif' : 'Inactif' }}
            </p>
          </div>
        </div>

        <!-- Stat Card 2 -->
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s;">
          <div style="background: linear-gradient(to right, #a855f7, #7e22ce); padding: 1rem; color: white;">
            <i class="pi pi-phone" style="font-size: 1.875rem;"></i>
          </div>
          <div style="padding: 1rem;">
            <p style="color: #495057; font-size: 0.875rem; margin-bottom: 0.5rem;">Demandes Numéros Dédiés</p>
            <p style="font-size: 1.5rem; font-weight: 700; color: #111827;">{{ pendingRequests }}</p>
            <button 
              @click="$router.push('/admin/plans')"
              style="font-size: 0.75rem; color: #2563eb; cursor: pointer; background: none; border: none; margin-top: 0.75rem; font-weight: 500;"
            >
              <i class="pi pi-arrow-right"></i>Gérer
            </button>
          </div>
        </div>

        <!-- Stat Card 3 -->
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s;">
          <div style="background: linear-gradient(to right, #22c55e, #16a34a); padding: 1rem; color: white;">
            <i class="pi pi-list" style="font-size: 1.875rem;"></i>
          </div>
          <div style="padding: 1rem;">
            <p style="color: #495057; font-size: 0.875rem; margin-bottom: 0.5rem;">Plans Disponibles</p>
            <p style="font-size: 1.5rem; font-weight: 700; color: #111827;">{{ plansCount }}</p>
            <button 
              @click="$router.push('/admin/plans')"
              style="font-size: 0.75rem; color: #2563eb; cursor: pointer; background: none; border: none; margin-top: 0.75rem; font-weight: 500;"
            >
              <i class="pi pi-arrow-right"></i>Configurer
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Grid -->
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="pi pi-sitemap" style="color: #2563eb;"></i>Modules d'Administration
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <!-- Plans Management -->
          <router-link to="/admin/plans" style="text-decoration: none;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s; height: 100%; cursor: pointer;" @mouseover="event.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(-4px)'" @mouseout="event.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(0)'">
              <div style="background: linear-gradient(to right, #4f46e5, #4338ca); padding: 1rem; color: white;">
                <i class="pi pi-list" style="font-size: 2rem;"></i>
              </div>
              <div style="padding: 1rem;">
                <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">Plans de Facturation</h3>
                <p style="color: #495057; font-size: 0.875rem; margin-bottom: 1rem;">Gérez les plans, les prix et les minutes incluses</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #2563eb; font-weight: 500; font-size: 0.875rem;">
                  <span>Accéder</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Dedicated Numbers -->
          <router-link to="/admin/plans" style="text-decoration: none;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s; height: 100%; cursor: pointer;" @mouseover="event.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(-4px)'" @mouseout="event.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(0)'">
              <div style="background: linear-gradient(to right, #a855f7, #7e22ce); padding: 1rem; color: white;">
                <i class="pi pi-phone" style="font-size: 2rem;"></i>
              </div>
              <div style="padding: 1rem;">
                <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">Numéros Dédiés</h3>
                <p style="color: #495057; font-size: 0.875rem; margin-bottom: 1rem;">Approuvez ou rejetez les demandes de numéros dédiés</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #2563eb; font-weight: 500; font-size: 0.875rem;">
                  <span>Accéder</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Calls Audit -->
          <router-link to="/admin/calls-audit" style="text-decoration: none;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s; height: 100%; cursor: pointer;" @mouseover="event.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(-4px)'" @mouseout="event.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(0)'">
              <div style="background: linear-gradient(to right, #f97316, #ea580c); padding: 1rem; color: white;">
                <i class="pi pi-history" style="font-size: 2rem;"></i>
              </div>
              <div style="padding: 1rem;">
                <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">Audit des Webhooks</h3>
                <p style="color: #495057; font-size: 0.875rem; margin-bottom: 1rem;">Consultez l'historique et le dépannage des appels</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #2563eb; font-weight: 500; font-size: 0.875rem;">
                  <span>Accéder</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Security Settings -->
          <router-link to="/admin/security" style="text-decoration: none;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s; height: 100%; cursor: pointer;" @mouseover="event.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(-4px)'" @mouseout="event.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(0)'">
              <div style="background: linear-gradient(to right, #ef4444, #dc2626); padding: 1rem; color: white;">
                <i class="pi pi-lock" style="font-size: 2rem;"></i>
              </div>
              <div style="padding: 1rem;">
                <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">Sécurité Avancée</h3>
                <p style="color: #495057; font-size: 0.875rem; margin-bottom: 1rem;">Gérez les identifiants, tokens et sessions</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #2563eb; font-weight: 500; font-size: 0.875rem;">
                  <span>Accéder</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Logs & Monitoring -->
          <router-link to="/admin/logs" style="text-decoration: none;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s; height: 100%; cursor: pointer;" @mouseover="event.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(-4px)'" @mouseout="event.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(0)'">
              <div style="background: linear-gradient(to right, #06b6d4, #0891b2); padding: 1rem; color: white;">
                <i class="pi pi-chart-bar" style="font-size: 2rem;"></i>
              </div>
              <div style="padding: 1rem;">
                <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">Logs & Monitoring</h3>
                <p style="color: #495057; font-size: 0.875rem; margin-bottom: 1rem;">Consultez les logs serveur et l'activité admin</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #2563eb; font-weight: 500; font-size: 0.875rem;">
                  <span>Accéder</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Settings -->
          <router-link to="/admin/settings" style="text-decoration: none;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s; height: 100%; cursor: pointer;" @mouseover="event.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(-4px)'" @mouseout="event.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; event.currentTarget.style.transform = 'translateY(0)'">
              <div style="background: linear-gradient(to right, #64748b, #475569); padding: 1rem; color: white;">
                <i class="pi pi-cog" style="font-size: 2rem;"></i>
              </div>
              <div style="padding: 1rem;">
                <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">Configuration Générale</h3>
                <p style="color: #495057; font-size: 0.875rem; margin-bottom: 1rem;">Paramètres globaux et configuration serveur</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; color: #2563eb; font-weight: 500; font-size: 0.875rem;">
                  <span>Accéder</span>
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Security Information -->
      <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background: linear-gradient(to right, #f59e0b, #d97706); padding: 1rem; color: white;">
          <h3 style="font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
            <i class="pi pi-shield"></i>Infos de Sécurité
          </h3>
        </div>
        <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem;">
          <div style="display: flex; gap: 0.75rem;">
            <i class="pi pi-check-circle" style="color: #16a34a; flex-shrink: 0; margin-top: 0.25rem;"></i>
            <div>
              <strong>Authentification en deux étapes</strong>
              <p style="color: #495057;">Tous les accès admin sont validés par email et mot de passe</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <i class="pi pi-check-circle" style="color: #16a34a; flex-shrink: 0; margin-top: 0.25rem;"></i>
            <div>
              <strong>Tokens temporaires</strong>
              <p style="color: #495057;">Les tokens d'accès sont générés de manière aléatoire et stockés de façon sécurisée</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <i class="pi pi-check-circle" style="color: #16a34a; flex-shrink: 0; margin-top: 0.25rem;"></i>
            <div>
              <strong>Sessions isolées</strong>
              <p style="color: #495057;">Chaque session admin est indépendante et peut être révoquée individuellement</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <i class="pi pi-exclamation-circle" style="color: #d97706; flex-shrink: 0; margin-top: 0.25rem;"></i>
            <div>
              <strong>Conseil de sécurité</strong>
              <p style="color: #495057;">Changez régulièrement votre mot de passe administrateur et déconnectez-vous après chaque session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AdminDashboard',
  components: {},
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
