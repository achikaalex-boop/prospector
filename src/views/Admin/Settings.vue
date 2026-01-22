<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-cog text-blue-600 text-xl"></i>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p class="text-gray-600">Gérez les paramètres généraux de Prospector AI</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <ProgressSpinner />
      </div>

      <!-- Error State -->
      <Message v-if="pageError" severity="error" :closable="true" @close="pageError = null" class="mb-6">
        {{ pageError }}
      </Message>

      <!-- Settings Cards -->
      <div v-else class="space-y-6">
        <!-- Email de Contact -->
        <Card class="shadow-md border-0">
          <template #header>
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-1"></div>
          </template>
          <template #content>
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <i class="pi pi-envelope text-blue-600"></i>
                    Email de Contact
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Cet email sera affiché dans les pages de politique de confidentialité, conditions d'utilisation et pages d'assistance.
                  </p>
                </div>
              </div>

              <Divider />

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse Email
                </label>
                <InputText
                  v-model="contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  class="w-full"
                  :disabled="savingEmail"
                />
                <small class="text-gray-500 text-xs mt-2">
                  Cette adresse sera utilisée comme point de contact public
                </small>
              </div>

              <Divider />

              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">
                  <strong>Dernier modification :</strong> {{ lastModified }}
                </div>
                <Button
                  @click="saveContactEmail"
                  :loading="savingEmail"
                  :disabled="savingEmail || !contactEmail || !isValidEmail(contactEmail)"
                  label="Enregistrer"
                  icon="pi pi-save"
                  class="p-button-primary"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Support Email (Legacy) -->
        <Card class="shadow-md border-0">
          <template #header>
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-1"></div>
          </template>
          <template #content>
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <i class="pi pi-headphones text-purple-600"></i>
                    Email de Support
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Email utilisé pour les demandes de support et les notifications internes.
                  </p>
                </div>
              </div>

              <Divider />

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse Email de Support
                </label>
                <InputText
                  v-model="supportEmail"
                  type="email"
                  placeholder="support@example.com"
                  class="w-full"
                  :disabled="savingSupportEmail"
                />
                <small class="text-gray-500 text-xs mt-2">
                  Utilisée pour les communications internes et les demandes spécialisées
                </small>
              </div>

              <Divider />

              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">
                  <strong>Dernier modification :</strong> {{ lastSupportModified }}
                </div>
                <Button
                  @click="saveSupportEmail"
                  :loading="savingSupportEmail"
                  :disabled="savingSupportEmail || !supportEmail || !isValidEmail(supportEmail)"
                  label="Enregistrer"
                  icon="pi pi-save"
                  class="p-button-primary"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Information -->
        <Card class="shadow-md border-0 bg-blue-50">
          <template #content>
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <i class="pi pi-info-circle text-blue-600 text-2xl"></i>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Important</h4>
                <ul class="mt-2 space-y-1 text-sm text-gray-700">
                  <li>✓ L'email de contact est visible publiquement sur les pages légales</li>
                  <li>✓ L'email de support est utilisé en interne pour les communications</li>
                  <li>✓ Les deux emails doivent être valides et accessibles</li>
                  <li>✓ Les modifications sont enregistrées immédiatement</li>
                </ul>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <Toast />
  </div>
</template>

<script>
import axios from 'axios'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'

export default {
  name: 'AdminSettings',
  components: { Card, Button, InputText, Message, Divider, ProgressSpinner, Toast },
  data() {
    return {
      contactEmail: '',
      supportEmail: '',
      lastModified: '—',
      lastSupportModified: '—',
      loading: true,
      savingEmail: false,
      savingSupportEmail: false,
      pageError: null
    }
  },
  async mounted() {
    await this.verifyAdminAccess()
    await this.loadSettings()
  },
  methods: {
    async verifyAdminAccess() {
      try {
        const token = localStorage.getItem('admin_token')
        const headers = token ? { 'x-admin-token': token } : {}
        
        const resp = await axios.get('/api/admin/check', { headers })
        if (!resp.data || !resp.data.ok) {
          this.pageError = 'Accès refusé: accès administrateur requis. Connectez-vous via /admin.'
          this.$router.push('/admin')
          return
        }
        
        if (token) {
          axios.defaults.headers.common['x-admin-token'] = token
        }
      } catch (err) {
        console.error('admin check failed', err)
        this.pageError = 'Erreur lors de la vérification d\'accès administrateur.'
        this.$router.push('/admin')
      }
    },

    async loadSettings() {
      this.loading = true
      this.pageError = null
      
      try {
        const [contactResp, supportResp] = await Promise.all([
          axios.get('/api/app-settings/contact-email').catch(() => ({ data: { contact_email: 'prospector.ai@gmail.com' } })),
          axios.get('/api/app-settings/support-email').catch(() => ({ data: { support_email: '' } }))
        ])

        this.contactEmail = contactResp.data?.contact_email || 'prospector.ai@gmail.com'
        this.supportEmail = supportResp.data?.support_email || ''
        
        // Set last modified times (could be enhanced with actual timestamps from DB)
        this.lastModified = new Date().toLocaleDateString('fr-FR')
        this.lastSupportModified = new Date().toLocaleDateString('fr-FR')
      } catch (err) {
        console.error('loadSettings error', err)
        this.pageError = 'Erreur lors du chargement des paramètres.'
      } finally {
        this.loading = false
      }
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    async saveContactEmail() {
      if (!this.isValidEmail(this.contactEmail)) {
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Veuillez entrer une adresse email valide',
          life: 4000
        })
        return
      }

      try {
        this.savingEmail = true
        const resp = await axios.post('/api/admin/app-settings', {
          key: 'contact_email',
          value: this.contactEmail.trim()
        })

        if (resp.data && resp.data.ok) {
          this.$toast.add({
            severity: 'success',
            summary: 'Enregistré',
            detail: 'Email de contact mis à jour avec succès',
            life: 4000
          })
          this.lastModified = new Date().toLocaleDateString('fr-FR')
        } else {
          this.$toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour l\'email de contact',
            life: 4000
          })
        }
      } catch (err) {
        console.error('saveContactEmail error', err)
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.response?.data?.error || err.message || 'Erreur serveur',
          life: 4000
        })
      } finally {
        this.savingEmail = false
      }
    },

    async saveSupportEmail() {
      if (!this.isValidEmail(this.supportEmail)) {
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Veuillez entrer une adresse email valide',
          life: 4000
        })
        return
      }

      try {
        this.savingSupportEmail = true
        const resp = await axios.post('/api/admin/app-settings', {
          key: 'support_email',
          value: this.supportEmail.trim()
        })

        if (resp.data && resp.data.ok) {
          this.$toast.add({
            severity: 'success',
            summary: 'Enregistré',
            detail: 'Email de support mis à jour avec succès',
            life: 4000
          })
          this.lastSupportModified = new Date().toLocaleDateString('fr-FR')
        } else {
          this.$toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de mettre à jour l\'email de support',
            life: 4000
          })
        }
      } catch (err) {
        console.error('saveSupportEmail error', err)
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.response?.data?.error || err.message || 'Erreur serveur',
          life: 4000
        })
      } finally {
        this.savingSupportEmail = false
      }
    }
  }
}
</script>

<style scoped>
:deep(.p-inputtext) {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !important;
}

:deep(.p-card) {
  border-radius: 12px;
}
</style>
