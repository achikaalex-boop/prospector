<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="w-full max-w-md">
      <Card class="shadow-xl border border-gray-200">
        <template #content>
          <div class="text-center mb-4">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Vérifiez votre e‑mail</h1>
            <p class="text-gray-700 mb-4">Nous avons envoyé un e‑mail de confirmation à <strong>{{ email }}</strong>. Cliquez sur le lien contenu dans cet e‑mail pour activer votre compte.</p>
          </div>

          <div class="space-y-4">
            <div class="text-sm text-gray-600">
              <p>Si vous n'avez rien reçu :</p>
              <ul class="list-disc list-inside mt-2 text-gray-600">
                <li>Vérifiez votre dossier Spam / Courrier indésirable</li>
                <li>Assurez-vous que l'adresse saisie est correcte</li>
              </ul>
            </div>

            <div class="flex gap-3 justify-center">
              <Button label="Retour à l'accueil" icon="pi pi-home" @click="$router.push('/')" />
              <Button label="Se connecter" icon="pi pi-sign-in" class="p-button-secondary" @click="$router.push('/login')" />
            </div>

            <div class="text-xs text-gray-500 text-center mt-4">Vous recevrez l'essai gratuit après confirmation de l'e‑mail.</div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'

const route = useRoute()
const email = route.query.email || ''
</script>

<style scoped>
</style>
