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
        <form @submit.prevent="submit" class="space-y-4 mb-6">
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="pi pi-envelope mr-1"></i>Email Administrateur
            </label>
            <InputText 
              id="email"
              v-model="email" 
              type="email"
              placeholder="admin@example.com"
              class="w-full"
              :disabled="isLoading"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="pi pi-lock mr-1"></i>Mot de Passe
            </label>
            <Password 
              id="password"
              v-model="password" 
              placeholder="••••••••"
              class="w-full"
              input-class="w-full"
              toggle-mask
              :disabled="isLoading"
              required
              autocomplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading || !email || !password"
            class="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ProgressSpinner v-if="isLoading" style="width:20px; height:20px" />
            <span v-else><i class="pi pi-sign-in mr-1"></i>Connexion</span>
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
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'

export default {
  name: 'AdminLogin',
  components: { Card, Message, InputText, Password, Divider, ProgressSpinner },
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
:deep(.p-inputtext),
:deep(.p-password-input) {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !important;
}

:deep(.p-inputtext::placeholder),
:deep(.p-password-input::placeholder) {
  @apply text-gray-400;
}

:deep(.p-card) {
  border-radius: 12px;
}

:deep(.p-password) {
  @apply w-full;
}

:deep(.p-password .p-password-panel) {
  @apply rounded-lg;
}

/* Ensure input fields are visible */
:deep(input[type="text"]),
:deep(input[type="email"]),
:deep(input[type="password"]) {
  @apply !visible !block w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 !important;
}

:deep(input[type="text"]:focus),
:deep(input[type="email"]:focus),
:deep(input[type="password"]:focus) {
  @apply ring-2 ring-blue-500 border-transparent !important;
}
</style>