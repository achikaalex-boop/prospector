<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="w-full max-w-md">
      <Card class="shadow-xl border border-gray-200">
        <template #content>
          <div class="text-center mb-6">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              🎯 Prospector AI
            </h1>
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">Connexion</h2>
            <p class="text-gray-600">Accédez à votre espace de prospection</p>
          </div>

          <Message v-if="error" severity="error" :closable="false" class="mb-4">
            {{ error }}
          </Message>
          

          <form @submit.prevent="handleLogin" class="space-y-5">
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
                  :feedback="false"
                  toggleMask
                  required
                  :disabled="loading"
                  inputClass="w-full"
                  inputStyle="width: 100%"
                />
              </div>
            </div>

            <Button
              type="submit"
              label="Se connecter"
              icon="pi pi-sign-in"
              class="w-full"
              :loading="loading"
              :disabled="loading"
            />
          </form>

          <div class="text-center mt-6 text-gray-600">
            Pas encore de compte ?
            <router-link to="/register" class="text-gray-900 font-semibold hover:underline ml-1 border-b border-gray-900">
              Créer un compte
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
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) throw authError

    router.push('/')
  } catch (err) {
    error.value = err.message || 'Erreur lors de la connexion'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>

