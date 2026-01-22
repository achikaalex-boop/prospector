<template>
  <div style="min-height: 100vh; background: linear-gradient(to bottom right, #eff6ff, #dbeafe); display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div style="width: 100%; max-width: 28rem;">
      <!-- Logo / Header -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; background-color: #2563eb; color: white; border-radius: 50%; margin-bottom: 1rem;">
          <i class="pi pi-shield" style="font-size: 1.5rem;"></i>
        </div>
        <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827;">Administration</h1>
        <p style="color: #4b5563; margin-top: 0.5rem;">Connexion sécurisée</p>
      </div>

      <!-- Main Card -->
      <div style="background: white; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: none; padding: 1.5rem;">
        <!-- Error Message -->
        <div v-if="error" style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem; color: #991b1b;">
          <div>
            <strong>Erreur de connexion</strong>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">{{ error }}</p>
          </div>
          <button @click="error = null" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; font-size: 1.25rem;">×</button>
        </div>

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
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading || !email || !password"
            style="width: 100%; padding: 0.5rem 1rem; background-color: #2563eb; color: white; font-weight: 600; border-radius: 0.5rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s; font-size: 1rem;"
            @mouseover="!isLoading && !(!email || !password) && (event.target.style.backgroundColor = '#1d4ed8')"
            @mouseout="!isLoading && !(!email || !password) && (event.target.style.backgroundColor = '#2563eb')"
          >
            <span v-if="!isLoading"><i class="pi pi-sign-in" style="margin-right: 0.25rem;"></i>Connexion</span>
            <span v-else style="color: #3b82f6;">●●●</span>
          </button>
        </form>

        <!-- Divider -->
        <div style="border-top: 1px solid #e5e7eb; margin: 1.5rem 0;"></div>

        <!-- Initialization Section -->
        <div style="margin-top: 1.5rem;">
          <h3 style="font-weight: 600; color: #111827; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="pi pi-info-circle" style="color: #2563eb;"></i>Première Utilisation
          </h3>
          <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 1rem;">
            Si l'administration n'est pas encore configurée, utilisez le bouton ci-dessous pour créer les identifiants administrateur initiaux.
          </p>
          <button 
            @click="initIfNeeded" 
            :disabled="isLoading"
            type="button"
            style="width: 100%; padding: 0.5rem 1rem; border: 2px solid #2563eb; color: #2563eb; font-weight: 600; border-radius: 0.5rem; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s; font-size: 1rem;"
            @mouseover="!isLoading && (event.target.style.backgroundColor = '#f0f9ff')"
            @mouseout="!isLoading && (event.target.style.backgroundColor = 'white')"
          >
            <span v-if="!isLoading"><i class="pi pi-plus" style="margin-right: 0.25rem;"></i>Initialiser Admin</span>
            <span v-else style="color: #2563eb;">●●●</span>
          </button>
          <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.75rem; text-align: center;">
            Cela créera un compte avec les identifiants saisis ci-dessus si aucun compte admin n'existe.
          </p>
        </div>
      </div>

      <!-- Footer Info -->
      <div style="margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #4b5563;">
        <i class="pi pi-lock" style="color: #16a34a; margin-right: 0.25rem;"></i>
        Connexion sécurisée — Vos identifiants ne sont jamais stockés
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AdminLogin',
  components: {},
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
/* Using inline styles in template instead of scoped CSS for better control */
</style>