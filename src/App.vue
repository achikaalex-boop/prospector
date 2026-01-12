<template>
  <div id="app">
    <ConfirmDialog />
    <Menubar v-if="isAuthenticated" :model="menuItems" class="sticky top-0 z-50 shadow-md">
      <template #start>
          <router-link to="/" class="flex items-center gap-2 no-underline">
            <span class="text-2xl font-bold text-gray-900">
              🎯 Prospector AI
            </span>
          </router-link>
      </template>
      <template #end>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-white border rounded px-3 py-1 shadow-sm min-w-0">
            <div v-if="balanceLoading" class="text-sm text-gray-600 truncate">Solde: ...</div>
            <div v-else class="text-sm font-medium truncate">Solde: {{ (balanceCents/100).toFixed(2) }} USD</div>
            <button @click.prevent="router.push('/topup')" class="ml-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">+</button>
          </div>
          <div class="flex items-center gap-2">
            <Button
              label="Déconnexion"
              icon="pi pi-sign-out"
              severity="secondary"
              outlined
              @click="handleLogout"
            />
          </div>
        </div>
      </template>
    </Menubar>
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'

const router = useRouter()
const isAuthenticated = ref(false)
const balanceCents = ref(0)
const balanceLoading = ref(true)

const menuItems = computed(() => [
  {
    label: 'Account',
    icon: 'pi pi-user',
    command: () => router.push('/account')
  },
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
    label: 'Pricing',
    icon: 'pi pi-tags',
    command: () => router.push('/pricing')
  },
  {
    label: 'Top-up',
    icon: 'pi pi-wallet',
    command: () => router.push('/topup')
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

const fetchBalance = async () => {
  balanceLoading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null
    if (!userId) { balanceCents.value = 0; return }
    const { data, error } = await supabase.from('user_credits').select('amount').eq('user_id', userId)
    if (!error && Array.isArray(data)) {
      const sum = data.reduce((s, r) => s + (Number(r.amount) || 0), 0)
      balanceCents.value = Math.round(sum * 100)
    } else {
      balanceCents.value = 0
    }
  } catch (e) {
    console.error('Could not fetch balance', e)
    balanceCents.value = 0
  } finally { balanceLoading.value = false }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  isAuthenticated.value = false
  router.push('/login')
}

onMounted(() => {
  checkAuth()
  fetchBalance()
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      isAuthenticated.value = !!session
      fetchBalance()
      if (!session && router.currentRoute.value.path !== '/login' && router.currentRoute.value.path !== '/register') {
        router.push('/login')
      }
    })
  } catch (error) {
    console.error('Erreur lors de l\'écoute des changements d\'authentification:', error)
  }
  // Listen for global balance refresh events
  const onBalanceUpdated = () => fetchBalance()
  window.addEventListener('balance:updated', onBalanceUpdated)
  onUnmounted(() => window.removeEventListener('balance:updated', onBalanceUpdated))
})
</script>

<style scoped>
</style>

