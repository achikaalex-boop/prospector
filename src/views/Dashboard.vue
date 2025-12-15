<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <Card class="mb-6 shadow-md border border-gray-200">
        <template #content>
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-4xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p class="text-gray-600 text-lg">Gérez vos campagnes de prospection</p>
            </div>
            <div class="flex gap-3">
              <Button
                label="Techniques"
                icon="pi pi-book"
                severity="secondary"
                outlined
                @click="$router.push('/techniques')"
              />
              <Button
                label="Nouvelle Campagne"
                icon="pi pi-plus"
                @click="$router.push('/campaign')"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <ProgressSpinner />
      </div>

      <!-- Error -->
      <Message v-if="error" severity="error" :closable="false" class="mb-6">
        {{ error }}
      </Message>

      <!-- Empty State -->
        <Card v-if="!loading && campaigns.length === 0" class="text-center py-12 shadow-md border border-gray-200">
        <template #content>
          <i class="pi pi-rocket text-6xl text-gray-700 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Commencez votre première campagne</h2>
          <p class="text-gray-600 mb-6">Créez une nouvelle campagne de prospection pour démarrer</p>
          <Button
            label="Créer une Campagne"
            icon="pi pi-plus-circle"
            @click="$router.push('/campaign')"
          />
        </template>
      </Card>

      <!-- Campaigns Grid -->
      <div v-if="!loading && campaigns.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
        >
          <template #header>
            <div class="p-4 bg-gray-900 text-white rounded-t-lg">
              <div class="flex justify-between items-start">
                <h3 class="text-xl font-bold">{{ campaign.company_name }}</h3>
                <Tag
                  :value="getStatusLabel(campaign.status)"
                  :severity="getStatusSeverity(campaign.status)"
                />
              </div>
            </div>
          </template>
          <template #content>
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <span class="text-gray-600 font-medium">Secteur:</span>
                <span class="font-semibold text-gray-900">{{ campaign.domain }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <span class="text-gray-600 font-medium">Agent:</span>
                <span class="font-semibold text-gray-900">{{ campaign.agent_name }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <span class="text-gray-600 font-medium">Contacts:</span>
                <Badge :value="campaign.contacts_count || 0" severity="info" />
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <span class="text-gray-600 font-medium">Objectif:</span>
                <span class="font-semibold text-gray-900 text-sm">{{ getObjectifLabel(campaign.objectifs) }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-600 font-medium">Créée le:</span>
                <span class="text-sm text-gray-500">{{ formatDate(campaign.created_at) }}</span>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2">
              <Button
                label="Détails"
                icon="pi pi-eye"
                severity="secondary"
                outlined
                @click="viewDetails(campaign)"
                class="flex-1"
              />
              <Button
                v-if="campaign.status === 'pending' || campaign.status === 'running'"
                icon="pi pi-stop"
                severity="danger"
                outlined
                @click="stopCampaign(campaign.id)"
                v-tooltip="'Arrêter la campagne'"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- Dialog Details -->
      <Dialog
        v-model:visible="showDialog"
        :header="selectedCampaign ? `Détails: ${selectedCampaign.company_name}` : ''"
        :style="{ width: '800px' }"
        :modal="true"
        :closable="true"
      >
        <div v-if="selectedCampaign" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-3 text-gray-900">Informations Entreprise</h3>
            <div class="space-y-2">
              <p><strong>Nom:</strong> {{ selectedCampaign.company_name }}</p>
              <p><strong>Secteur:</strong> {{ selectedCampaign.domain }}</p>
              <p><strong>Promesse de valeur:</strong> {{ selectedCampaign.value_proposition }}</p>
              <p><strong>Détails:</strong> {{ selectedCampaign.infos }}</p>
            </div>
          </div>

          <Divider />

          <div>
            <h3 class="text-lg font-semibold mb-3 text-gray-900">Configuration Agent</h3>
            <div class="space-y-2">
              <p><strong>Nom:</strong> {{ selectedCampaign.agent_name }}</p>
              <p><strong>Seuil de confiance:</strong> {{ selectedCampaign.confidence_threshold }}</p>
            </div>
          </div>

          <Divider />

          <div>
            <h3 class="text-lg font-semibold mb-3 text-gray-900">Objectifs</h3>
            <p><strong>Type:</strong> {{ getObjectifLabel(selectedCampaign.objectifs) }}</p>
          </div>

          <div v-if="selectedCampaign.results && selectedCampaign.results.length > 0">
            <Divider />
            <h3 class="text-lg font-semibold mb-3 text-gray-900">Résultats de Prospection</h3>
            <DataTable
              :value="selectedCampaign.results"
              :paginator="true"
              :rows="5"
              class="p-datatable-sm"
            >
              <Column field="contact_name" header="Contact"></Column>
              <Column field="status" header="Statut">
                <template #body="slotProps">
                  <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
                </template>
              </Column>
              <Column field="notes" header="Notes"></Column>
            </DataTable>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const campaigns = ref([])
const selectedCampaign = ref(null)
const showDialog = ref(false)
const loading = ref(true)
const error = ref('')

const loadCampaigns = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      error.value = 'Utilisateur non authentifié'
      return
    }

    const { data, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    campaigns.value = data || []
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement des campagnes'
  } finally {
    loading.value = false
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    running: 'En cours',
    completed: 'Terminée',
    stopped: 'Arrêtée',
    error: 'Erreur'
  }
  return labels[status] || status
}

const getStatusSeverity = (status) => {
  const severities = {
    pending: 'warning',
    running: 'info',
    completed: 'success',
    stopped: 'secondary',
    error: 'danger'
  }
  return severities[status] || 'secondary'
}

const getObjectifLabel = (objectif) => {
  // Les objectifs sont désormais stockés directement sous forme de texte lisible
  return objectif || 'N/A'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewDetails = async (campaign) => {
  try {
    const { data: results } = await supabase
      .from('campaign_results')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('created_at', { ascending: false })

    selectedCampaign.value = {
      ...campaign,
      results: results || []
    }
    showDialog.value = true
  } catch (err) {
    selectedCampaign.value = campaign
    showDialog.value = true
  }
}

const stopCampaign = async (campaignId) => {
  if (!confirm('Êtes-vous sûr de vouloir arrêter cette campagne ?')) return

  try {
    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'stopped' })
      .eq('id', campaignId)

    if (error) throw error

    await loadCampaigns()
  } catch (err) {
    error.value = err.message || 'Erreur lors de l\'arrêt de la campagne'
  }
}

onMounted(() => {
  loadCampaigns()
})
</script>

<style scoped>
</style>
