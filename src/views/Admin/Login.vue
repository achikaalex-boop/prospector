<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo / Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
          <i class="pi pi-shield text-2xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Administration</h1>
        <p class="text-gray-600 mt-2">Connexion sécurisée</p>
      </div>

      <!-- Main Card -->
      <Card class="shadow-xl border-0" :pt="{ content: { class: 'p-6 sm:p-8' } }">
        <!-- Error Message -->
        <Message v-if="error" severity="error" :closable="true" @close="error = null" class="mb-6">
          <div>
            <strong>Erreur de connexion</strong>
            <p class="mt-2 text-sm">{{ error }}</p>
          </div>
        </Message>

        <!-- Login Form -->
        <form @submit.prevent="submit" style="margin-bottom: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label for="email" style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
              <i class="pi pi-envelope" style="margin-right: 0.25rem;"></i>Email Administrateur
            </label>
            <input 
              id="email"
              v-model="email" 
              type="email"
              placeholder="admin@example.com"
              class="admin-input"
              :disabled="isLoading"
              required
              autocomplete="email"
              style="width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background-color: #ffffff; color: #111827; font-size: 1rem;"
            />
          </div>

          <div style="margin-bottom: 1rem;">
            <label for="password" style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
              <i class="pi pi-lock" style="margin-right: 0.25rem;"></i>Mot de Passe
            </label>
            <input 
              id="password"
              v-model="password" 
              type="password"
              placeholder="••••••••"
              class="admin-input"
              :disabled="isLoading"
              required
              autocomplete="current-password"
              style="width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background-color: #ffffff; color: #111827; font-size: 1rem;"
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading || !email || !password"
            style="width: 100%; padding: 0.5rem 1rem; background-color: #2563eb; color: white; font-weight: 600; border-radius: 0.5rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s;"
          >
            <ProgressSpinner v-if="isLoading" style="width:20px; height:20px" />
            <span v-else><i class="pi pi-sign-in" style="margin-right: 0.25rem;"></i>Connexion</span>
          </button>
        </form>

        <!-- Divider -->
        <Divider />

        <!-- Initialization Section -->
        <div class="mt-6">
          <h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i class="pi pi-info-circle text-blue-600"></i>Première Utilisation
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Si l'administration n'est pas encore configurée, utilisez le bouton ci-dessous pour créer les identifiants administrateur initiaux.
          </p>
          <button 
            @click="initIfNeeded" 
            :disabled="isLoading"
            type="button"
            class="w-full px-4 py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ProgressSpinner v-if="isLoading" style="width:20px; height:20px" :pt="{ svg: { class: 'w-5 h-5' } }" />
            <span v-else><i class="pi pi-plus mr-1"></i>Initialiser Admin</span>
          </button>
          <p class="text-xs text-gray-500 mt-3 text-center">
            Cela créera un compte avec les identifiants saisis ci-dessus si aucun compte admin n'existe.
          </p>
        </div>
      </Card>

      <!-- Footer Info -->
      <div class="mt-8 text-center text-xs text-gray-600">
        <i class="pi pi-lock text-green-600 mr-1"></i>
        Connexion sécurisée — Vos identifiants ne sont jamais stockés
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'

export default {
  name: 'AdminLogin',
  components: { Card, Message, Divider, ProgressSpinner },
  data() { 
    return { 
      email: '', 
      password: '', 
      isLoading: false, 
      error: null 
    } 
  },
  methods: {
    async submit() {
      if (!this.email || !this.password) {
        this.error = 'Veuillez remplir tous les champs'
        return
      }

      try {
        this.isLoading = true
        this.error = null

        const resp = await axios.post('/api/admin/login', { 
          email: this.email.trim(), 
          password: this.password 
        })

        if (resp.data && resp.data.ok && resp.data.token) {
          const token = resp.data.token
          localStorage.setItem('admin_token', token)
          axios.defaults.headers.common['x-admin-token'] = token
          
          this.$toast.add({ 
            severity: 'success', 
            summary: 'Connecté', 
            detail: 'Bienvenue dans l\'administration', 
            life: 3000 
          })
          
          // Redirect after a short delay to show the success message
          setTimeout(() => {
            this.$router.push({ name: 'AdminDashboard' })
          }, 1000)
        } else {
          this.error = resp.data?.error || 'Échec de la connexion'
        }
      } catch (e) {
        this.error = e?.response?.data?.error || e.message || 'Erreur serveur'
        console.error('Login error:', e)
      } finally { 
        this.isLoading = false 
      }
    },

    async initIfNeeded() {
      if (!this.email || !this.password) {
        this.error = 'Veuillez d\'abord saisir un email et un mot de passe'
        return
      }

      try {
        this.isLoading = true
        this.error = null

        // Step 1: Initialize admin credentials
        const initResp = await axios.post('/api/admin/set-admin-credentials', { 
          email: this.email.trim(), 
          password: this.password 
        })

        if (!initResp.data || !initResp.data.ok) {
          this.error = initResp.data?.error || 'Impossible d\'initialiser'
          console.warn('set-admin-credentials returned unexpected response', initResp)
          return
        }

        this.$toast.add({ 
          severity: 'success', 
          summary: 'Initialisé', 
          detail: 'Compte administrateur créé avec succès', 
          life: 4000 
        })

        // Step 2: Auto-login with the new credentials
        await this.loginAfterInit()
      } catch (e) {
        console.error('initIfNeeded error:', e)
        this.error = e?.response?.data?.error || e.message || 'Erreur lors de l\'initialisation'
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: this.error, 
          life: 6000 
        })
      } finally { 
        this.isLoading = false 
      }
    },

    async loginAfterInit() {
      try {
        this.isLoading = true
        const loginResp = await axios.post('/api/admin/login', { 
          email: this.email.trim(), 
          password: this.password 
        })

        if (loginResp.data && loginResp.data.ok && loginResp.data.token) {
          const token = loginResp.data.token
          localStorage.setItem('admin_token', token)
          axios.defaults.headers.common['x-admin-token'] = token
          
          this.$toast.add({ 
            severity: 'success', 
            summary: 'Connecté', 
            detail: 'Administration initialisée et activée', 
            life: 3000 
          })
          
          setTimeout(() => {
            this.$router.push({ name: 'AdminDashboard' })
          }, 1000)
        } else {
          this.$toast.add({ 
            severity: 'warn', 
            summary: 'Initialisé', 
            detail: 'Compte créé. Connectez-vous manuellement avec vos identifiants.', 
            life: 5000 
          })
        }
      } catch (e) {
        console.error('Auto-login failed:', e)
        this.$toast.add({ 
          severity: 'info', 
          summary: 'Initialisé', 
          detail: 'Compte créé. Connectez-vous manuellement avec vos identifiants.', 
          life: 6000 
        })
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
/* Removed complex scoped styles - using inline styles instead for better control */
:deep(.p-card) {
  border-radius: 12px;
  position: relative;
  z-index: 10;
}

:deep(.p-card-content) {
  position: relative;
  z-index: 10;
}

:deep(.p-message) {
  display: block !important;
  opacity: 1 !important;
}
</style>