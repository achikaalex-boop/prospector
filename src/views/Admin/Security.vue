<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <i class="pi pi-shield text-3xl text-red-600"></i>
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">Sécurité Avancée</h1>
        </div>
        <p class="text-gray-600 mt-2">Gestion des identifiants administrateur et des sessions</p>
      </div>

      <!-- Alert -->
      <Message severity="warning" :closable="false" class="mb-6">
        <div class="flex items-start gap-3">
          <i class="pi pi-exclamation-triangle text-2xl mt-1"></i>
          <div>
            <strong>Zone Sensible</strong>
            <p class="text-sm mt-1">Les modifications apportées ici affecteront directement l'accès administrateur. Procédez avec prudence.</p>
          </div>
        </div>
      </Message>

      <!-- Current Credentials -->
      <Card class="mb-6 shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
        <template #header>
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-t-lg">
            <h3 class="text-white font-semibold flex items-center gap-2">
              <i class="pi pi-user"></i>Identifiants Actuels
            </h3>
          </div>
        </template>
        <div v-if="loading" class="flex justify-center py-8">
          <ProgressSpinner style="width:40px; height:40px" />
        </div>
        <div v-else class="space-y-4">
          <div>
            <label class="text-sm font-semibold text-gray-700 block mb-2">Email Admin</label>
            <div class="bg-gray-100 p-3 rounded-lg text-gray-900 font-mono">{{ currentEmail || 'Non défini' }}</div>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 block mb-2">Statut</label>
            <Tag 
              :value="initialized ? 'Configuré' : 'Non configuré'" 
              :severity="initialized ? 'success' : 'warning'"
            />
          </div>
        </div>
      </Card>

      <!-- Change Password -->
      <Card class="mb-6 shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
        <template #header>
          <div class="bg-gradient-to-r from-red-500 to-red-600 p-4 sm:p-6 rounded-t-lg">
            <h3 class="text-white font-semibold flex items-center gap-2">
              <i class="pi pi-lock"></i>Changer le Mot de Passe
            </h3>
          </div>
        </template>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="pi pi-envelope mr-2"></i>Nouvel Email
            </label>
            <InputText 
              v-model="changeForm.email" 
              type="email"
              placeholder="admin@example.com"
              class="w-full"
              required
            />
            <p class="text-xs text-gray-500 mt-1">Utilisé pour la connexion administrateur</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="pi pi-key mr-2"></i>Nouveau Mot de Passe
            </label>
            <Password 
              v-model="changeForm.password" 
              placeholder="••••••••"
              toggle-mask
              class="w-full"
              input-class="w-full"
              :feedback="false"
              required
            />
            <p class="text-xs text-gray-500 mt-1">Minimum 8 caractères recommandé</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="pi pi-check-circle mr-2"></i>Confirmer le Mot de Passe
            </label>
            <Password 
              v-model="changeForm.passwordConfirm" 
              placeholder="••••••••"
              toggle-mask
              class="w-full"
              input-class="w-full"
              :feedback="false"
              required
            />
          </div>

          <div v-if="passwordMatch === false" class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <i class="pi pi-exclamation-circle mr-2"></i>Les mots de passe ne correspondent pas
          </div>

          <button 
            type="submit" 
            :disabled="changeLoading || passwordMatch === false"
            class="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            <i class="pi pi-save mr-2"></i>Mettre à Jour les Identifiants
          </button>
        </form>
      </Card>

      <!-- Security Information -->
      <Card class="shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
        <template #header>
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6 rounded-t-lg">
            <h3 class="text-white font-semibold flex items-center gap-2">
              <i class="pi pi-info-circle"></i>Bonnes Pratiques de Sécurité
            </h3>
          </div>
        </template>
        <div class="space-y-4">
          <div class="border-l-4 border-blue-500 pl-4 py-2">
            <h4 class="font-semibold text-gray-900 flex items-center gap-2">
              <i class="pi pi-check-circle text-blue-600"></i>Mot de Passe Fort
            </h4>
            <p class="text-sm text-gray-600 mt-1">Utilisez un mot de passe d'au moins 16 caractères avec majuscules, minuscules, chiffres et symboles</p>
          </div>

          <div class="border-l-4 border-green-500 pl-4 py-2">
            <h4 class="font-semibold text-gray-900 flex items-center gap-2">
              <i class="pi pi-check-circle text-green-600"></i>Changez Régulièrement
            </h4>
            <p class="text-sm text-gray-600 mt-1">Changez votre mot de passe administrateur tous les 90 jours minimum</p>
          </div>

          <div class="border-l-4 border-purple-500 pl-4 py-2">
            <h4 class="font-semibold text-gray-900 flex items-center gap-2">
              <i class="pi pi-check-circle text-purple-600"></i>Déconnexion
            </h4>
            <p class="text-sm text-gray-600 mt-1">Déconnectez-vous toujours après chaque session administrative, surtout sur les ordinateurs partagés</p>
          </div>

          <div class="border-l-4 border-red-500 pl-4 py-2">
            <h4 class="font-semibold text-gray-900 flex items-center gap-2">
              <i class="pi pi-exclamation-circle text-red-600"></i>Jetons d'Accès
            </h4>
            <p class="text-sm text-gray-600 mt-1">Ne partagez jamais votre token d'accès administrateur. Il expire après 24 heures</p>
          </div>

          <div class="border-l-4 border-yellow-500 pl-4 py-2">
            <h4 class="font-semibold text-gray-900 flex items-center gap-2">
              <i class="pi pi-check-circle text-yellow-600"></i>Surveillance
            </h4>
            <p class="text-sm text-gray-600 mt-1">Vérifiez régulièrement les tentatives de connexion échouées et les logs d'activité</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import axios from 'axios'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import ProgressSpinner from 'primevue/progressspinner'

export default {
  name: 'AdminSecurity',
  components: { Card, Message, Tag, InputText, Password, ProgressSpinner },
  setup() {
    const loading = ref(true)
    const changeLoading = ref(false)
    const currentEmail = ref('')
    const initialized = ref(false)
    const passwordMatch = ref(null)

    const changeForm = ref({
      email: '',
      password: '',
      passwordConfirm: ''
    })

    const verifyAdminAccess = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        if (!token) {
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

        if (token) {
          axios.defaults.headers.common['x-admin-token'] = token
        }
      } catch (e) {
        console.error('Admin access verification failed:', e)
        localStorage.removeItem('admin_token')
        this.$router.push('/admin')
      }
    }

    const loadAdminData = async () => {
      try {
        const resp = await axios.get('/api/admin/status')
        currentEmail.value = resp.data?.admin_email || ''
        initialized.value = resp.data?.initialized || false
      } catch (e) {
        console.error('Failed to load admin data:', e)
      } finally {
        loading.value = false
      }
    }

    const changePassword = async () => {
      if (changeForm.value.password !== changeForm.value.passwordConfirm) {
        return
      }

      if (changeForm.value.password.length < 8) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Mot de passe faible',
          detail: 'Le mot de passe doit contenir au moins 8 caractères',
          life: 5000
        })
        return
      }

      try {
        changeLoading.value = true
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}

        const resp = await axios.post('/api/admin/set-admin-credentials', {
          email: changeForm.value.email.trim(),
          password: changeForm.value.password
        }, { headers })

        if (resp.data && resp.data.ok) {
          this.$toast.add({
            severity: 'success',
            summary: 'Mis à jour',
            detail: 'Les identifiants administrateur ont été modifiés avec succès',
            life: 4000
          })

          // Reset form and reload
          changeForm.value = { email: '', password: '', passwordConfirm: '' }
          await loadAdminData()
        } else {
          this.$toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour les identifiants',
            life: 5000
          })
        }
      } catch (e) {
        console.error('Change password error:', e)
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: e?.response?.data?.error || e.message || 'Une erreur est survenue',
          life: 6000
        })
      } finally {
        changeLoading.value = false
      }
    }

    // Watch password fields to check match
    watch(
      () => [changeForm.value.password, changeForm.value.passwordConfirm],
      () => {
        if (changeForm.value.password && changeForm.value.passwordConfirm) {
          passwordMatch.value = changeForm.value.password === changeForm.value.passwordConfirm
        } else {
          passwordMatch.value = null
        }
      }
    )

    return {
      loading,
      changeLoading,
      currentEmail,
      initialized,
      changeForm,
      passwordMatch,
      changePassword,
      verifyAdminAccess,
      loadAdminData
    }
  },
  async mounted() {
    await this.verifyAdminAccess()
    await this.loadAdminData()
  }
}
</script>

<style scoped>
:deep(.p-inputtext),
:deep(.p-password-input) {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent;
}
</style>
