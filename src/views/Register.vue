<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="w-full max-w-md">
      <Card class="shadow-xl border border-gray-200">
        <template #content>
          <div class="text-center mb-6">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              🎯 Prospector AI
            </h1>
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">Inscription</h2>
            <p class="text-gray-600">Créez votre compte pour commencer</p>
          </div>

          <Message v-if="error" severity="error" :closable="false" class="mb-4">
            {{ error }}
          </Message>
          
          <Message v-if="success" severity="success" :closable="false" class="mb-4">
            {{ success }}
          </Message>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <div class="flex flex-col">
              <label class="mb-2 font-semibold text-gray-700">Nom complet</label>
              <InputText
                v-model="fullName"
                placeholder="Jean Dupont"
                class="w-full"
                required
                :disabled="loading"
              />
            </div>

            <div class="flex flex-col">
              <label class="mb-2 font-semibold text-gray-700">Email</label>
              <InputText
                v-model="email"
                type="email"
                placeholder="votre@email.com"
                class="w-full"
                required
                :disabled="loading"
              />
            </div>

            <div class="flex flex-col">
              <label class="mb-2 font-semibold text-gray-700">Mot de passe</label>
              <div class="w-full">
                <Password
                  v-model="password"
                  placeholder="••••••••"
                  :feedback="true"
                  toggleMask
                  required
                  :disabled="loading"
                  :minlength="6"
                  inputClass="w-full"
                  inputStyle="width: 100%"
                />
              </div>
              <small class="text-gray-500 text-sm mt-1">Minimum 6 caractères</small>
            </div>

            <Button
              type="submit"
              label="Créer mon compte"
              icon="pi pi-user-plus"
              class="w-full"
              :loading="loading"
              :disabled="loading"
            />
          </form>

          <div class="text-center mt-6 text-gray-600">
            Déjà un compte ?
            <router-link to="/login" class="text-gray-900 font-semibold hover:underline ml-1 border-b border-gray-900">
              Se connecter
            </router-link>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const fullName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value
        }
      }
    })

    if (authError) throw authError

    success.value = 'Compte créé avec succès ! Redirection...'
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    error.value = err.message || 'Erreur lors de l\'inscription'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
