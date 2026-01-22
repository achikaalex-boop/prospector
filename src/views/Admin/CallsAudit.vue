<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">
              <i class="pi pi-history mr-2 text-blue-600"></i>Audit des Webhooks d'Appels
            </h1>
            <p class="text-gray-600 mt-2">Historique et dépannage des appels</p>
          </div>
          <div class="flex gap-2">
            <button @click="search" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              <i class="pi pi-search mr-2"></i>Rechercher
            </button>
            <button @click="resetSearch" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
              <i class="pi pi-refresh mr-2"></i>Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Search Section -->
      <Card class="mb-6 shadow-md border-0" :pt="{ content: { class: 'p-4 sm:p-6' } }">
        <template #header>
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-t-lg">
            <h3 class="text-white font-semibold">
              <i class="pi pi-filter mr-2"></i>Filtrage et Recherche
            </h3>
          </div>
        </template>
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="pi pi-phone mr-1"></i>Numéro de Téléphone
              </label>
              <InputText 
                v-model="filters.phone" 
                placeholder="Numéro appelé (ex: +33123456789)"
                class="w-full"
                @keyup.enter="search"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="pi pi-id-card mr-1"></i>Call ID
              </label>
              <InputText 
                v-model="filters.callId" 
                placeholder="Identifiant unique de l'appel"
                class="w-full"
                @keyup.enter="search"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="pi pi-tag mr-1"></i>Type d'Événement
            </label>
            <Dropdown 
              v-model="filters.eventType" 
              :options="eventTypes" 
              option-label="label" 
              option-value="value"
              placeholder="Tous les événements"
              class="w-full"
            />
          </div>
        </div>
      </Card>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <ProgressSpinner style="width:50px; height:50px" />
      </div>

      <!-- Empty State -->
      <Card v-else-if="rows.length === 0" class="text-center py-12 shadow-md border-0">
        <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">Aucun webhook trouvé</p>
        <p class="text-gray-400 text-sm mt-2">Essayez d'ajuster vos critères de recherche</p>
      </Card>

      <!-- Results Table -->
      <div v-else class="space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <Badge :value="`${rows.length} résultat${rows.length > 1 ? 's' : ''}`" severity="info" />
          <span class="text-sm text-gray-600">{{ `Affichage ${(currentPage - 1) * pageSize + 1} à ${Math.min(currentPage * pageSize, rows.length)} de ${rows.length}` }}</span>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <Card 
            v-for="(r, idx) in paginatedRows" 
            :key="r.id || idx"
            class="shadow-md border-0 hover:shadow-lg transition"
            :pt="{ content: { class: 'p-4 sm:p-6' } }"
          >
            <template #header>
              <div :class="`p-4 sm:p-6 rounded-t-lg ${getEventColor(r.event_type)}`">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-bold text-white text-lg">{{ r.call_id || 'N/A' }}</span>
                      <Tag :value="r.event_type || 'unknown'" :severity="getEventSeverity(r.event_type)" />
                    </div>
                    <p class="text-xs opacity-75 text-white">ID: {{ r.id }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-white text-sm font-semibold">{{ r.to_number || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </template>

            <div class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-gray-600">Numéro Appelé</label>
                  <p class="text-gray-900 font-mono">{{ r.to_number || '—' }}</p>
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600">Numéro Source</label>
                  <p class="text-gray-900 font-mono">{{ r.from_number || '—' }}</p>
                </div>
              </div>

              <Divider />

              <div class="flex items-center justify-between">
                <div>
                  <label class="text-xs font-semibold text-gray-600">Type d'Événement</label>
                  <p class="text-gray-900 font-semibold">{{ formatEventType(r.event_type) }}</p>
                </div>
                <div class="text-right">
                  <button 
                    @click="togglePayloadView(r.id)"
                    class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                  >
                    <i :class="`pi ${expandedPayloads.has(r.id) ? 'pi-chevron-up' : 'pi-chevron-down'} mr-1`"></i>
                    Payload
                  </button>
                </div>
              </div>

              <!-- Expanded Payload View -->
              <div v-if="expandedPayloads.has(r.id)" class="mt-4 pt-4 border-t">
                <div class="bg-gray-50 p-3 rounded font-mono text-xs whitespace-pre-wrap break-words max-h-96 overflow-auto">
                  {{ formatJson(r.raw_payload) }}
                </div>
              </div>

              <!-- Link Payload Button -->
              <div class="flex gap-2 pt-2">
                <button 
                  @click="linkPayload(r)" 
                  class="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
                >
                  <i class="pi pi-link mr-1"></i>Lier au Résultat
                </button>
                <button 
                  @click="copyToClipboard(r.call_id)"
                  class="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition text-sm font-medium"
                  :title="`Copier: ${r.call_id}`"
                >
                  <i class="pi pi-copy"></i>
                </button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
          <button 
            @click="previousPage" 
            :disabled="currentPage === 1"
            class="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <i class="pi pi-chevron-left"></i>
          </button>
          <span class="text-sm text-gray-600">
            Page <strong>{{ currentPage }}</strong> / <strong>{{ totalPages }}</strong>
          </span>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Feedback Toast -->
    <Toast position="bottom-right" />
  </div>
</template>

<script>
import axios from 'axios'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'

export default {
  name: 'AdminCallsAudit',
  components: { Card, InputText, Dropdown, Tag, Badge, Divider, ProgressSpinner, Toast },
  data() {
    return { 
      filters: {
        phone: '',
        callId: '',
        eventType: null
      },
      rows: [], 
      loading: false,
      expandedPayloads: new Set(),
      currentPage: 1,
      pageSize: 10,
      eventTypes: [
        { label: 'Tous les événements', value: null },
        { label: 'call_started', value: 'call_started' },
        { label: 'call_ended', value: 'call_ended' },
        { label: 'call_analyzed', value: 'call_analyzed' }
      ]
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.rows.length / this.pageSize)
    },
    paginatedRows() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.rows.slice(start, end)
    }
  },
  methods: {
    async search() {
      this.loading = true
      this.currentPage = 1
      try {
        const params = {}
        if (this.filters.callId) params.q = this.filters.callId
        if (this.filters.phone) params.phone = this.filters.phone
        if (this.filters.eventType) params.event_type = this.filters.eventType

        const resp = await axios.get('/api/admin/call-webhooks', { params })
        this.rows = resp.data || []
        
        if (this.rows.length === 0) {
          this.$toast.add({ 
            severity: 'info', 
            summary: 'Aucun résultat', 
            detail: 'Aucun webhook ne correspond à vos critères', 
            life: 4000 
          })
        } else {
          this.$toast.add({ 
            severity: 'success', 
            summary: 'Recherche complète', 
            detail: `${this.rows.length} webhook(s) trouvé(s)`, 
            life: 3000 
          })
        }
      } catch (e) {
        console.error('Search error:', e)
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: e?.message || 'Erreur lors de la recherche', 
          life: 6000 
        })
      } finally { 
        this.loading = false 
      }
    },
    resetSearch() {
      this.filters = { phone: '', callId: '', eventType: null }
      this.rows = []
      this.currentPage = 1
    },
    togglePayloadView(id) {
      if (this.expandedPayloads.has(id)) {
        this.expandedPayloads.delete(id)
      } else {
        this.expandedPayloads.add(id)
      }
      this.$forceUpdate()
    },
    async linkPayload(row) {
      try {
        this.loading = true
        await axios.post('/api/admin/link-payload', { id: row.id })
        this.$toast.add({ 
          severity: 'success', 
          summary: 'Lié', 
          detail: 'Le payload a été lié au résultat de campagne', 
          life: 4000 
        })
        await this.search()
      } catch (e) { 
        console.error('Link error:', e)
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: e?.response?.data?.error || 'Impossible de lier le payload', 
          life: 6000 
        })
      } finally {
        this.loading = false
      }
    },
    copyToClipboard(text) {
      if (!text) return
      navigator.clipboard.writeText(text)
      this.$toast.add({ 
        severity: 'info', 
        summary: 'Copié', 
        detail: 'Call ID copié dans le presse-papiers', 
        life: 2000 
      })
    },
    getEventColor(eventType) {
      const colors = {
        'call_started': 'bg-gradient-to-r from-blue-500 to-blue-600',
        'call_ended': 'bg-gradient-to-r from-orange-500 to-orange-600',
        'call_analyzed': 'bg-gradient-to-r from-green-500 to-green-600'
      }
      return colors[eventType] || 'bg-gradient-to-r from-gray-500 to-gray-600'
    },
    getEventSeverity(eventType) {
      const severity = {
        'call_started': 'info',
        'call_ended': 'warning',
        'call_analyzed': 'success'
      }
      return severity[eventType] || 'secondary'
    },
    formatEventType(eventType) {
      const labels = {
        'call_started': 'Appel Commencé',
        'call_ended': 'Appel Terminé',
        'call_analyzed': 'Appel Analysé'
      }
      return labels[eventType] || eventType || 'Inconnu'
    },
    formatJson(obj) {
      try {
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        return String(obj)
      }
    },
    previousPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    }
  },
  created() { 
    this.search() 
  }
}
</script>

<style scoped>
:deep(.p-inputtext) {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

:deep(.p-dropdown) {
  @apply border-gray-300 rounded-lg;
}
</style>
