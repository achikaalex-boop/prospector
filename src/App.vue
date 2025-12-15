<template>
  <div id="app">
    <Menubar v-if="isAuthenticated" :model="menuItems" class="sticky top-0 z-50 shadow-md">
      <template #start>
          <router-link to="/" class="flex items-center gap-2 no-underline">
            <span class="text-2xl font-bold text-gray-900">
              🎯 Prospector AI
            </span>
          </router-link>
      </template>
      <template #end>
        <Button
          label="Déconnexion"
          icon="pi pi-sign-out"
          severity="secondary"
          outlined
          @click="handleLogout"
        />
      </template>
    </Menubar>
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'

const router = useRouter()
const isAuthenticated = ref(false)

const menuItems = computed(() => [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Nouvelle Campagne',
    icon: 'pi pi-plus-circle',
    command: () => router.push('/campaign')
  },
  {
    label: 'Techniques',
    icon: 'pi pi-book',
    command: () => router.push('/techniques')
  }
])

const checkAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated.value = !!session
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error)
    isAuthenticated.value = false
  }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  isAuthenticated.value = false
  router.push('/login')
}

onMounted(() => {
  checkAuth()
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      isAuthenticated.value = !!session
      if (!session && router.currentRoute.value.path !== '/login' && router.currentRoute.value.path !== '/register') {
        router.push('/login')
      }
    })
  } catch (error) {
    console.error('Erreur lors de l\'écoute des changements d\'authentification:', error)
  }
})
</script>

<style scoped>
</style>

