<template>
  <div id="app">
    <ConfirmDialog />
    <ConfirmModal ref="confirmModalRef" />
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
          <div class="hidden md:flex items-center gap-2">
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
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'

const router = useRouter()
const confirmModalRef = ref(null)
const isAuthenticated = ref(false)
const balanceCents = ref(0)
const balanceLoading = ref(true)
const isMobile = ref(window.innerWidth < 768)

// Provide showConfirm function to all child components
provide('showConfirm', (options) => {
  if (confirmModalRef.value) {
    return confirmModalRef.value.show(options)
  }
  return Promise.reject('Confirm modal not available')
})

const menuItems = computed(() => {
  const items = [
    {
      label: 'Account',
      icon: 'pi pi-user',
      command: () => router.push('/account')
    },
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => router.push('/')
    }
  ]
  
  // Ajouter "Nouvelle Campagne" uniquement sur mobile
  if (isMobile.value) {
    items.push({
      label: 'Nouvelle Campagne',
      icon: 'pi pi-plus-circle',
      command: () => router.push('/campaign')
    })
  }
  
  items.push(
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
  )
  
  // Ajouter "Déconnexion" uniquement sur mobile
  if (isMobile.value) {
    items.push({
      label: 'Déconnexion',
      icon: 'pi pi-sign-out',
      command: () => handleLogout()
    })
  }
  
  return items
})

const checkAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated.value = !!session
    if (!session) {
      const currentPath = router.currentRoute.value.path || ''
      const allowedWhenUnauth = ['/privacy-policy', '/terms-of-service']
      if (!allowedWhenUnauth.includes(currentPath)) {
        router.push('/register')
      }
    }
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
  
  // Listener pour les changements de taille d'écran
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768
  }
  window.addEventListener('resize', handleResize)
  
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      isAuthenticated.value = !!session
      fetchBalance()
      // If user becomes unauthenticated, redirect to register except for privacy/terms pages
      const currentPath = router.currentRoute.value.path || ''
      const allowedWhenUnauth = ['/privacy-policy', '/terms-of-service']
      const isAllowed = allowedWhenUnauth.includes(currentPath)
      if (!session && !isAllowed) {
        router.push('/register')
      }
    })
  } catch (error) {
    console.error('Erreur lors de l\'écoute des changements d\'authentification:', error)
  }
  // Listen for global balance refresh events
  const onBalanceUpdated = () => fetchBalance()
  window.addEventListener('balance:updated', onBalanceUpdated)
  onUnmounted(() => {
    window.removeEventListener('balance:updated', onBalanceUpdated)
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<style scoped>
</style>

